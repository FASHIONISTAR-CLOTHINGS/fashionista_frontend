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

const qaScreenshotDir = path.resolve(
  process.cwd(),
  "../docs/qa/vendor-dashboard/2026-05-26/screenshots",
);

function readSeededAuth(): Record<string, SeededAuthSession> {
  const content = fs.readFileSync(seededAuthPath, "utf8");
  return JSON.parse(content) as Record<string, SeededAuthSession>;
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

async function saveScreenshot(page: Page, name: string) {
  fs.mkdirSync(qaScreenshotDir, { recursive: true });
  await page.screenshot({
    path: path.join(qaScreenshotDir, name),
    fullPage: true,
  });
}

test.describe.configure({ mode: "serial" });

test("captures current vendor and public marketplace evidence", async ({ page }) => {
  const auth = readSeededAuth();
  await seedAuthenticatedSession(page, auth.vendor);

  await page.goto("/vendor/dashboard");
  await expect(page).toHaveURL(/\/vendor\/dashboard/, { timeout: 30_000 });
  await expect(page.locator("body")).toBeVisible();
  await saveScreenshot(page, "vendor-dashboard-2026-05-26.png");

  await page.goto("/vendor/payouts");
  await expect(page).toHaveURL(/\/vendor\/payouts/, { timeout: 30_000 });
  await expect(page.getByText(/payout/i).first()).toBeVisible();
  await saveScreenshot(page, "vendor-payouts-2026-05-26.png");

  await page.goto("/vendor/orders");
  await expect(page).toHaveURL(/\/vendor\/orders/, { timeout: 30_000 });
  await expect(page.getByText(/orders/i).first()).toBeVisible();
  await saveScreenshot(page, "vendor-orders-2026-05-26.png");

  await page.goto("/vendors");
  await expect(page).toHaveURL(/\/vendors/, { timeout: 30_000 });
  await expect(page.locator("body")).toBeVisible();
  await saveScreenshot(page, "vendors-listing-2026-05-26.png");
});
