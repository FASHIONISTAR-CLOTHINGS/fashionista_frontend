import fs from "node:fs";
import path from "node:path";

import { expect, test } from "@playwright/test";
import type { APIRequestContext, Page } from "@playwright/test";

type SeededAuthSession = {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    role: string;
    is_staff: boolean;
    first_name: string;
    last_name: string;
    is_verified: boolean;
    has_vendor_profile?: boolean;
    has_client_profile?: boolean;
  };
};

type SeededAuth = Record<"client" | "vendor" | "admin", SeededAuthSession>;

const seededAuthPath = path.resolve(
  process.cwd(),
  "tests/e2e/.tmp/seeded-auth.json",
);

function readSeededAuth(): SeededAuth {
  return JSON.parse(fs.readFileSync(seededAuthPath, "utf8")) as SeededAuth;
}

async function seedAuthenticatedSession(page: Page, session: SeededAuthSession) {
  await page.addInitScript((payload: SeededAuthSession) => {
    window.sessionStorage.setItem(
      "fashionistar-auth",
      JSON.stringify({
        state: {
          accessToken: payload.accessToken,
          refreshToken: payload.refreshToken,
          user: payload.user,
          isAuthenticated: true,
        },
      }),
    );
  }, session);
}

async function capture(page: Page, name: string) {
  await page.screenshot({
    path: `tests/e2e/screenshots/${name}.png`,
    fullPage: true,
  });
}

async function apiJson(
  request: APIRequestContext,
  url: string,
  token: string,
  options?: { method?: "GET" | "PATCH"; data?: unknown },
) {
  const method = options?.method ?? "GET";
  const response =
    method === "PATCH"
      ? await request.patch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          data: options?.data,
        })
      : await request.get(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

  const text = await response.text();
  let payload: unknown = null;

  try {
    payload = JSON.parse(text);
  } catch {
    payload = text;
  }

  return {
    ok: response.ok(),
    status: response.status(),
    payload,
  };
}

test.describe.configure({ mode: "serial" });

test("real live vendor to payment browser flow", async ({ page, request, baseURL }) => {
  const auth = readSeededAuth();
  const productTitle = `Vision Test Agbada ${Date.now()}`;

  let createdProductSlug: string | null = null;
  let checkoutReached = false;
  let paymentPageReached = false;

  const browserErrors: string[] = [];
  page.on("pageerror", (error) => browserErrors.push(error.message));

  await test.step("vendor opens product builder and saves a draft", async () => {
    await seedAuthenticatedSession(page, auth.vendor);
    await page.goto("/vendor/products");
    await expect(page).toHaveURL(/\/vendor\/products/, { timeout: 30_000 });
    await expect(page.getByText(/Add New Product/i)).toBeVisible({ timeout: 30_000 });
    await capture(page, "live-vendor-products-entry");

    await page.getByLabel(/Product Title/i).fill(productTitle);
    await page.getByLabel(/Short Description/i).fill(
      "Enterprise live browser verification draft for wallet-first order testing.",
    );
    await page.getByLabel(/Full Description/i).fill(
      "This product draft was created during a real browser validation pass to verify vendor builder, storefront navigation, cart, checkout, and staged payment routing.",
    );

    await page.getByRole("button", { name: /Select condition|Condition/i }).click();
    await page.getByRole("option", { name: /New/i }).click();

    const categoryTrigger = page.getByRole("button", { name: /Add category/i });
    await expect(categoryTrigger).toBeVisible({ timeout: 20_000 });
    await categoryTrigger.click();
    await page.getByRole("option").first().click();

    await capture(page, "live-vendor-products-step1");
    await page.getByRole("button", { name: /Continue/i }).click();

    await page.getByLabel(/Selling Price/i).fill("25000");
    await page.getByLabel(/Stock Quantity/i).fill("5");
    await page.getByLabel(/Flat Shipping Fee/i).fill("2500");
    await capture(page, "live-vendor-products-step2");

    for (let i = 0; i < 5; i += 1) {
      await page.getByRole("button", { name: /Continue/i }).click();
    }

    await expect(page.getByText(/Publish Setting/i)).toBeVisible({ timeout: 20_000 });
    await capture(page, "live-vendor-products-step8");

    await page.getByRole("button", { name: /Save Draft/i }).click();
    await page.waitForLoadState("networkidle");
    await capture(page, "live-vendor-products-after-save");

    const vendorProducts = await apiJson(
      request,
      `${baseURL}/api/v1/products/vendor/`,
      auth.vendor.accessToken,
    );

    if (!vendorProducts.ok || typeof vendorProducts.payload !== "object" || vendorProducts.payload === null) {
      throw new Error(`Vendor product fetch failed: ${vendorProducts.status}`);
    }

    const rawResults =
      "results" in vendorProducts.payload && Array.isArray((vendorProducts.payload as { results?: unknown[] }).results)
        ? (vendorProducts.payload as { results: Array<{ title?: string; slug?: string }> }).results
        : Array.isArray(vendorProducts.payload)
          ? (vendorProducts.payload as Array<{ title?: string; slug?: string }>)
          : [];

    const created = rawResults.find((item) => item.title === productTitle);
    createdProductSlug = created?.slug ?? null;

    expect(createdProductSlug).toBeTruthy();
  });

  await test.step("admin attempts to publish the same product", async () => {
    expect(createdProductSlug).toBeTruthy();

    const publishAttempt = await apiJson(
      request,
      `${baseURL}/api/v1/products/admin/${createdProductSlug}/status/`,
      auth.admin.accessToken,
      {
        method: "PATCH",
        data: { status: "published" },
      },
    );

    await page.goto("/admin-dashboard/products");
    await expect(page).toHaveURL(/\/admin-dashboard\/products/, { timeout: 30_000 });
    await capture(page, "live-admin-products");

    expect(publishAttempt.ok, `Admin publish failed with status ${publishAttempt.status}: ${JSON.stringify(publishAttempt.payload)}`).toBeTruthy();
  });

  await test.step("client browses products, adds to cart, and attempts checkout", async () => {
    await seedAuthenticatedSession(page, auth.client);
    await page.goto("/products");
    await expect(page).toHaveURL(/\/products/, { timeout: 30_000 });
    await capture(page, "live-client-products");

    const createdCard = page.getByRole("link", { name: new RegExp(productTitle, "i") }).first();
    await expect(createdCard).toBeVisible({ timeout: 30_000 });
    await createdCard.click();

    await expect(page).toHaveURL(/\/products\//, { timeout: 30_000 });
    await capture(page, "live-client-product-detail");

    const addToCartButton = page
      .getByRole("button", { name: /Add to Cart|Add to Bag/i })
      .first();
    await expect(addToCartButton).toBeVisible({ timeout: 20_000 });
    await addToCartButton.click();

    await page.goto("/cart");
    await expect(page).toHaveURL(/\/cart/, { timeout: 30_000 });
    await capture(page, "live-client-cart");

    const checkoutButton = page
      .locator("a[href*='checkout'], button:has-text('Checkout'), a:has-text('Checkout')")
      .first();
    await expect(checkoutButton).toBeVisible({ timeout: 20_000 });
    await checkoutButton.click();

    await page.waitForLoadState("networkidle");
    checkoutReached = /checkout|orders|payment/i.test(page.url());
    await capture(page, "live-client-checkout-attempt");
    expect(checkoutReached).toBeTruthy();
  });

  await test.step("client attempts to reach the order payment screen", async () => {
    const ordersResponse = await apiJson(
      request,
      `${baseURL}/api/v1/ninja/orders/`,
      auth.client.accessToken,
    );

    if (ordersResponse.ok && typeof ordersResponse.payload === "object" && ordersResponse.payload !== null) {
      const rawResults =
        "results" in ordersResponse.payload && Array.isArray((ordersResponse.payload as { results?: unknown[] }).results)
          ? (ordersResponse.payload as { results: Array<{ id?: string; status?: string }> }).results
          : [];

      const payableOrder = rawResults.find((item) => typeof item.id === "string");
      if (payableOrder?.id) {
        await seedAuthenticatedSession(page, auth.client);
        await page.goto(`/client/dashboard/orders/${payableOrder.id}/payment`);
        await page.waitForLoadState("networkidle");
        paymentPageReached = /\/payment/.test(page.url());
        await capture(page, "live-client-order-payment");
      }
    }

    expect(paymentPageReached).toBeTruthy();
  });

  expect(browserErrors).toEqual([]);
});
