import fs from "node:fs";
import path from "node:path";

import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

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

const seededAuthPath = path.resolve(
  process.cwd(),
  "tests/e2e/.tmp/seeded-auth.json",
);
const DEFAULT_BACKEND_PUBLIC_URL =
  "https://hydrographically-tawdrier-hayley.ngrok-free.dev";

function readSeededAuth(): Record<string, SeededAuthSession> {
  const content = fs.readFileSync(seededAuthPath, "utf8");
  return JSON.parse(content) as Record<string, SeededAuthSession>;
}

function getBackendPublicUrl(): string {
  return (
    process.env.NEXT_PUBLIC_BACKEND_URL ??
    process.env.PLAYWRIGHT_BACKEND_PUBLIC_URL ??
    DEFAULT_BACKEND_PUBLIC_URL
  ).replace(/\/+$/, "");
}

async function seedAuthenticatedSession(
  page: Page,
  session: SeededAuthSession,
) {
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

async function expectStableShell(page: Page) {
  await expect(page.locator("body")).toBeVisible();
  await expect(page.locator("text=Something went wrong")).toHaveCount(0);
  const rootLocator = page.locator("#root");
  const rootCount = await rootLocator.count();
  const rootPayload = rootCount > 0
    ? await rootLocator.first().getAttribute("data-payload")
    : null;
  if (rootPayload) {
    const decoded = JSON.parse(Buffer.from(rootPayload, "base64").toString("utf8")) as {
      code?: string;
      message?: string;
      title?: string;
    };
    if (decoded.code === "3200" || /offline/i.test(decoded.message ?? "")) {
      throw new Error(
        `Frontend tunnel is offline: ${decoded.title ?? "Unavailable"}${decoded.message ? ` — ${decoded.message}` : ""}`,
      );
    }
  }
}

async function gotoInAppShell(page: Page, url: string) {
  await page.goto(url, { waitUntil: "domcontentloaded" });
}

async function warmAuthenticatedRead(
  page: Page,
  session: SeededAuthSession,
  endpoint: string,
) {
  const response = await page.request.get(
    `${getBackendPublicUrl()}${endpoint}`,
    {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
        "ngrok-skip-browser-warning": "true",
      },
    },
  );
  expect(response.ok()).toBeTruthy();
}

test.describe.configure({ mode: "serial" });

test.describe("Seeded post-login role journeys", () => {
  test.setTimeout(120_000);

  test("client journey stays inside the client shell", async ({ page }) => {
    const auth = readSeededAuth();
    await seedAuthenticatedSession(page, auth.client);
    await warmAuthenticatedRead(page, auth.client, "/api/v1/ninja/client/dashboard/");
    await gotoInAppShell(page, "/client/dashboard");
    await expect(page).toHaveURL(/\/client\/dashboard/, { timeout: 30_000 });
    await expectStableShell(page);
    await expect(page.getByTestId("client-dashboard-hero")).toBeVisible();
    await expect(page.getByTestId("client-dashboard-welcome")).toBeVisible();
    await page.screenshot({
      path: "tests/e2e/screenshots/client-dashboard.png",
      fullPage: true,
    });

    await gotoInAppShell(page, "/client/dashboard/wallet");
    await expect(page).toHaveURL(/\/client\/dashboard\/wallet/, {
      timeout: 30_000,
    });
    await expectStableShell(page);
    await expect(page.getByTestId("client-wallet-heading")).toBeVisible();
    await page.screenshot({
      path: "tests/e2e/screenshots/client-wallet.png",
      fullPage: true,
    });

    await gotoInAppShell(page, "/client/dashboard/orders");
    await expect(page).toHaveURL(/\/client\/dashboard\/orders/, {
      timeout: 30_000,
    });
    await expectStableShell(page);
    await expect(page.getByTestId("client-orders-heading")).toBeVisible();
    await page.screenshot({
      path: "tests/e2e/screenshots/client-orders.png",
      fullPage: true,
    });
  });

  test("vendor journey stays inside the vendor shell", async ({ page }) => {
    const auth = readSeededAuth();
    await seedAuthenticatedSession(page, auth.vendor);
    await warmAuthenticatedRead(page, auth.vendor, "/api/v1/ninja/vendor/dashboard/");
    await gotoInAppShell(page, "/vendor/dashboard");
    await expect(page).toHaveURL(/\/vendor\/(dashboard|setup)/, {
      timeout: 30_000,
    });
    await expectStableShell(page);
    await page.screenshot({
      path: "tests/e2e/screenshots/vendor-entry.png",
      fullPage: true,
    });

    await gotoInAppShell(page, "/vendor/dashboard");
    await expect(page).toHaveURL(/\/vendor\/dashboard/, { timeout: 30_000 });
    await expectStableShell(page);
    await expect(page.getByText(/dashboard/i).first()).toBeVisible();
    await page.screenshot({
      path: "tests/e2e/screenshots/vendor-dashboard.png",
      fullPage: true,
    });

    await gotoInAppShell(page, "/vendor/payouts");
    await expect(page).toHaveURL(/\/vendor\/payouts/, { timeout: 30_000 });
    await expectStableShell(page);
    await expect(page.getByText(/payout/i).first()).toBeVisible();
    await page.screenshot({
      path: "tests/e2e/screenshots/vendor-payouts.png",
      fullPage: true,
    });

    await gotoInAppShell(page, "/vendor/orders");
    await expect(page).toHaveURL(/\/vendor\/orders/, { timeout: 30_000 });
    await expectStableShell(page);
    await expect(page.getByText(/orders/i).first()).toBeVisible();
    await page.screenshot({
      path: "tests/e2e/screenshots/vendor-orders.png",
      fullPage: true,
    });
  });

  test("admin journey stays inside the admin shell", async ({ page }) => {
    const auth = readSeededAuth();
    await seedAuthenticatedSession(page, auth.admin);
    await warmAuthenticatedRead(page, auth.admin, "/api/v1/ninja/orders/admin/");
    await gotoInAppShell(page, "/admin-dashboard");
    await expect(page).toHaveURL(/\/admin-dashboard/, { timeout: 30_000 });
    await expectStableShell(page);
    await expect(page.getByText(/dashboard/i).first()).toBeVisible();
    await page.screenshot({
      path: "tests/e2e/screenshots/admin-dashboard.png",
      fullPage: true,
    });

    await gotoInAppShell(page, "/admin-dashboard/orders");
    await expect(page).toHaveURL(/\/admin-dashboard\/orders/, {
      timeout: 30_000,
    });
    await expectStableShell(page);
    await expect(page.getByText(/orders/i).first()).toBeVisible();
    await page.screenshot({
      path: "tests/e2e/screenshots/admin-orders.png",
      fullPage: true,
    });

    await gotoInAppShell(page, "/admin-dashboard/kyc");
    await expect(page).toHaveURL(/\/admin-dashboard\/kyc/, {
      timeout: 30_000,
    });
    await expectStableShell(page);
    await expect(page.getByText(/kyc/i).first()).toBeVisible();
    await page.screenshot({
      path: "tests/e2e/screenshots/admin-kyc.png",
      fullPage: true,
    });
  });
});
