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
  };
};

type SeededAuth = Record<"client" | "vendor" | "admin", SeededAuthSession>;

const seededAuthPath = path.resolve(process.cwd(), "tests/e2e/.tmp/seeded-auth.json");
const backendBaseUrl = process.env.PLAYWRIGHT_BACKEND_URL ?? "http://127.0.0.1:8001";
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

  await page.addInitScript((payload) => {
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

async function apiJson(
  request: APIRequestContext,
  url: string,
  options?: {
    token?: string;
    method?: "GET" | "POST";
    data?: unknown;
  },
) {
  const method = options?.method ?? "GET";
  const headers: Record<string, string> = {};

  if (options?.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }
  if (options?.data !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  const response =
    method === "POST"
      ? await request.post(url, { headers, data: options?.data, timeout: 60_000 })
      : await request.get(url, { headers, timeout: 60_000 });

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

test("debug add to cart flow", async ({ page, request }) => {
  test.setTimeout(120_000);
  const auth = readSeededAuth();

  // Log all browser console messages
  page.on("console", (msg) => {
    console.log(`[BROWSER CONSOLE] [${msg.type()}] ${msg.text()}`);
  });

  // Log network requests and responses
  page.on("request", (req) => {
    const url = req.url();
    if (url.includes("/api/")) {
      console.log(`[NETWORK REQ] [${req.method()}] ${url}`);
    }
  });

  page.on("response", async (res) => {
    const url = res.url();
    if (url.includes("/api/")) {
      let statusText = "";
      try {
        statusText = ` status: ${res.status()} body: ${(await res.text()).substring(0, 300)}`;
      } catch {
        statusText = ` status: ${res.status()} [body unreadable]`;
      }
      console.log(`[NETWORK RES] [${res.request().method()}] ${url} -> ${statusText}`);
    }
  });

  console.log("1. Fetching categories...");
  const categoryResponse = await apiJson(
    request,
    `${backendBaseUrl}/api/v1/ninja/catalog/categories/?page_size=10`,
  );
  expect(categoryResponse.ok).toBe(true);
  const categoryResults = (categoryResponse.payload as any).results || [];
  const categoryId = categoryResults[0]?.id;
  expect(categoryId).toBeTruthy();

  console.log("2. Creating a test product...");
  const uniqueSuffix = Date.now().toString();
  const productTitle = `Debug Product ${uniqueSuffix}`;
  const createResponse = await apiJson(
    request,
    `${backendBaseUrl}/api/v1/products/vendor/`,
    {
      token: auth.vendor.accessToken,
      method: "POST",
      data: {
        title: productTitle,
        description: "Debug Product Description",
        short_description: "Debug Product Short Description",
        price: "10000.00",
        old_price: "12000.00",
        currency: "NGN",
        shipping_amount: "1500.00",
        stock_qty: 15,
        category_ids: [categoryId],
        requires_measurement: false,
        is_customisable: false,
        hot_deal: false,
        digital: false,
        idempotency_key: crypto.randomUUID(),
      },
    },
  );
  expect(createResponse.ok).toBe(true);
  const created = (createResponse.payload as any).data || createResponse.payload;
  const productSlug = created.slug;
  expect(productSlug).toBeTruthy();

  console.log("3. Publishing and approving product...");
  const publishResponse = await apiJson(
    request,
    `${backendBaseUrl}/api/v1/products/vendor/${productSlug}/publish/`,
    { token: auth.vendor.accessToken, method: "POST" },
  );
  expect(publishResponse.ok).toBe(true);

  const approveResponse = await apiJson(
    request,
    `${backendBaseUrl}/api/v1/products/admin/${productSlug}/approve/`,
    { token: auth.admin.accessToken, method: "POST" },
  );
  expect(approveResponse.ok).toBe(true);

  console.log("4. Seeding client session & opening product detail page...");
  await seedAuthenticatedSession(page, auth.client);
  await page.goto(`/products/${productSlug}`);
  await page.waitForLoadState("networkidle");

  console.log("5. Clicking Add to Cart...");
  const addToCartBtn = page.getByRole("button", { name: /Add to Cart/i }).first();
  await expect(addToCartBtn).toBeVisible({ timeout: 15_000 });
  await addToCartBtn.click();

  console.log("6. Waiting for cart action to process...");
  await page.waitForTimeout(5000);

  console.log("7. Going to Cart page...");
  await page.goto("/cart");
  await page.waitForLoadState("networkidle");

  const pageContent = await page.content();
  console.log(`[CART PAGE LOADED] url: ${page.url()}`);
  console.log(`[CART PAGE CONTENT HAS PRODUCT TITLE]: ${pageContent.includes(productTitle)}`);

  await page.screenshot({ path: "tests/e2e/screenshots/debug-cart-page.png", fullPage: true });
});
