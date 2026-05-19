import crypto from "node:crypto";
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

const backendBaseUrl = process.env.PLAYWRIGHT_BACKEND_URL ?? "http://127.0.0.1:8000";
const frontendBaseUrl = process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3000";

function readSeededAuth(): SeededAuth {
  return JSON.parse(fs.readFileSync(seededAuthPath, "utf8")) as SeededAuth;
}

async function seedAuthenticatedSession(page: Page, session: SeededAuthSession) {
  const payload = {
    state: {
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
      user: session.user,
      isAuthenticated: true,
    },
  };

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

  await page.context().addCookies([
    {
      name: "fashionistar_auth_hint",
      value: "1",
      url: frontendBaseUrl,
      sameSite: "Lax",
    },
    {
      name: "fashionistar_role",
      value: session.user.role,
      url: frontendBaseUrl,
      sameSite: "Lax",
    },
  ]);

  if (page.url().startsWith(frontendBaseUrl)) {
    await page.evaluate((nextPayload) => {
      window.sessionStorage.setItem("fashionistar-auth", JSON.stringify(nextPayload));
    }, payload);
  }
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
  options?: {
    token?: string;
    method?: "GET" | "POST";
    data?: unknown;
    extraHeaders?: Record<string, string>;
  },
) {
  const method = options?.method ?? "GET";
  const headers: Record<string, string> = {
    ...(options?.extraHeaders ?? {}),
  };

  if (options?.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }
  if (options?.data !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  const response =
    method === "POST"
      ? await request.post(url, {
          headers,
          data: options?.data,
          timeout: 60_000,
        })
      : await request.get(url, {
          headers,
          timeout: 60_000,
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

function requireObject(value: unknown, label: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${label} did not return an object payload.`);
  }
  return value as Record<string, unknown>;
}

function readApiData<T>(payload: unknown): T {
  const root = requireObject(payload, "API call");
  return ((root.data ?? root.results ?? root) as T);
}

async function createPublishedBrowserProduct(
  request: APIRequestContext,
  auth: SeededAuth,
) {
  const categoryResponse = await apiJson(
    request,
    `${backendBaseUrl}/api/v1/ninja/catalog/categories/?page_size=10`,
  );

  if (!categoryResponse.ok) {
    throw new Error(`Category fetch failed with ${categoryResponse.status}`);
  }

  const categoryPayload = requireObject(categoryResponse.payload, "Category list");
  const categoryResults = Array.isArray(categoryPayload.results)
    ? (categoryPayload.results as Array<Record<string, unknown>>)
    : [];
  const categoryId = categoryResults[0]?.id;
  if (typeof categoryId !== "string") {
    throw new Error("No live category is available for browser product seeding.");
  }

  const uniqueSuffix = Date.now().toString();
  const productTitle = `Vision Browser Product ${uniqueSuffix}`;

  const createResponse = await apiJson(
    request,
    `${backendBaseUrl}/api/v1/products/vendor/`,
    {
      token: auth.vendor.accessToken,
      method: "POST",
      data: {
        title: productTitle,
        description: "Live browser verification product created for the wallet-first order flow.",
        short_description: "Live browser verification product",
        price: "15000.00",
        old_price: "18000.00",
        currency: "NGN",
        shipping_amount: "2500.00",
        stock_qty: 10,
        category_ids: [categoryId],
        requires_measurement: false,
        is_customisable: false,
        hot_deal: false,
        digital: false,
        idempotency_key: crypto.randomUUID(),
      },
    },
  );

  if (!createResponse.ok) {
    throw new Error(`Vendor product create failed: ${createResponse.status} ${JSON.stringify(createResponse.payload)}`);
  }

  const created = readApiData<{ slug: string; title: string }>(createResponse.payload);
  if (!created.slug) {
    throw new Error("Vendor product create response did not include a slug.");
  }

  const publishResponse = await apiJson(
    request,
    `${backendBaseUrl}/api/v1/products/vendor/${created.slug}/publish/`,
    {
      token: auth.vendor.accessToken,
      method: "POST",
    },
  );

  if (!publishResponse.ok) {
    throw new Error(`Vendor publish failed: ${publishResponse.status} ${JSON.stringify(publishResponse.payload)}`);
  }

  const approveResponse = await apiJson(
    request,
    `${backendBaseUrl}/api/v1/products/admin/${created.slug}/approve/`,
    {
      token: auth.admin.accessToken,
      method: "POST",
    },
  );

  if (!approveResponse.ok) {
    throw new Error(`Admin approve failed: ${approveResponse.status} ${JSON.stringify(approveResponse.payload)}`);
  }

  const publicDetailResponse = await apiJson(
    request,
    `${backendBaseUrl}/api/v1/ninja/products/${created.slug}/`,
  );

  if (!publicDetailResponse.ok) {
    throw new Error(`Public product detail verification failed: ${publicDetailResponse.status}`);
  }

  const publicProduct = requireObject(publicDetailResponse.payload, "Public product detail");
  if (publicProduct.slug !== created.slug) {
    throw new Error(`Published product ${created.slug} is still missing from the public detail endpoint.`);
  }

  return created;
}

test.describe.configure({ mode: "serial" });

test("real live vendor to payment browser flow", async ({ page, request }) => {
  test.setTimeout(240_000);
  const auth = readSeededAuth();
  const browserErrors: string[] = [];
  page.on("pageerror", (error) => browserErrors.push(error.message));

  const createdProduct = await createPublishedBrowserProduct(request, auth);

  await test.step("vendor session can see the newly created product in catalog", async () => {
    await seedAuthenticatedSession(page, auth.vendor);
    await page.goto("/vendor/products/catalog");
    await expect(page).toHaveURL(/\/vendor\/products\/catalog/, { timeout: 30_000 });
    await expect(page.getByText(new RegExp(createdProduct.title, "i"))).toBeVisible({ timeout: 30_000 });
    await capture(page, "live-vendor-catalog-with-created-product");
  });

  await test.step("client browses the public catalog and reaches product detail", async () => {
    await seedAuthenticatedSession(page, auth.client);
    await page.goto(`/products?q=${encodeURIComponent(createdProduct.title)}`);
    await expect(page).toHaveURL(/\/products/, { timeout: 30_000 });
    await expect(
      page.getByRole("heading", {
        name: new RegExp(`Results for "${createdProduct.title}"`, "i"),
      }),
    ).toBeVisible({ timeout: 30_000 });
    await capture(page, "live-client-products-list");

    await page.goto(`/products/${createdProduct.slug}`);
    await expect(page).toHaveURL(new RegExp(`/products/${createdProduct.slug}`), { timeout: 30_000 });
    await expect(
      page.getByRole("heading", {
        name: new RegExp(`^${createdProduct.title}$`, "i"),
      }),
    ).toBeVisible({ timeout: 30_000 });
    await expect(
      page.getByRole("button", { name: /Add to Cart|Add to Bag/i }).first(),
    ).toBeVisible({ timeout: 30_000 });
    await capture(page, "live-client-product-detail");
  });

  await test.step("client adds the product to cart and opens checkout", async () => {
    const addToCartButton = page
      .getByRole("button", { name: /Add to Cart|Add to Bag/i })
      .first();

    await expect(addToCartButton).toBeVisible({ timeout: 20_000 });
    await addToCartButton.click();
    await page.waitForTimeout(22_000);
    await seedAuthenticatedSession(page, auth.client);

    await page.goto("/cart");
    await expect(page).toHaveURL(/\/cart/, { timeout: 30_000 });
    await expect(
      page.getByRole("link", {
        name: new RegExp(`^${createdProduct.title}$`, "i"),
      }).first(),
    ).toBeVisible({ timeout: 30_000 });
    await capture(page, "live-client-cart");

    await page.goto("/cart/checkout");
    await expect(page).toHaveURL(/\/cart\/checkout/, { timeout: 30_000 });
    await expect(page.getByRole("heading", { name: /Checkout/i })).toBeVisible({
      timeout: 30_000,
    });
    await page.locator("#full_name").fill("Chidi Nwosu");
    await page.locator("#phone").fill("+2348012345678");
    await page.locator("#email").fill("client@fashionistar.test");
    await page.locator("#street_address").fill("10 Ozumba Mbadiwe Avenue");
    await page.locator("#city").fill("Lagos");
    await page.locator("#state").fill("Lagos");
    await page.getByRole("button", { name: /Place Order Securely/i }).click();
    await page.waitForLoadState("networkidle");
    await capture(page, "live-client-checkout");
    expect(page.url()).toMatch(/checkout|orders|payment|confirmation/i);
  });

  await test.step("client reaches the order payment surface when an unpaid order exists", async () => {
    const ordersResponse = await apiJson(
      request,
      `${backendBaseUrl}/api/v1/ninja/orders/`,
      { token: auth.client.accessToken },
    );

    if (!ordersResponse.ok) {
      throw new Error(`Client order list failed: ${ordersResponse.status}`);
    }

    const orderPayload = requireObject(ordersResponse.payload, "Client order list");
    const orderResults = Array.isArray(orderPayload.results)
      ? (orderPayload.results as Array<Record<string, unknown>>)
      : Array.isArray(orderPayload.data)
        ? (orderPayload.data as Array<Record<string, unknown>>)
      : [];

    const payableOrder = orderResults.find((item) => typeof item.id === "string");
    expect(payableOrder?.id).toBeTruthy();

    await seedAuthenticatedSession(page, auth.client);
    await page.goto(`/client/dashboard/orders/${String(payableOrder?.id)}/payment`);
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveURL(/\/payment/, { timeout: 30_000 });
    await expect(page.getByRole("heading", { name: /Payment Method/i })).toBeVisible({
      timeout: 30_000,
    });
    await expect(
      page.getByRole("button", { name: /Fashionistar Wallet Instant/i }),
    ).toBeVisible({
      timeout: 30_000,
    });
    await expect(
      page.getByRole("button", { name: /Card \/ Bank Gateway Pay with/i }),
    ).toBeVisible({
      timeout: 30_000,
    });
    await capture(page, "live-client-order-payment");
  });

  expect(browserErrors).toEqual([]);
});
