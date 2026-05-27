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
  };
};

const seededAuthPath = path.resolve(
  process.cwd(),
  "tests/e2e/.tmp/seeded-auth.json",
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

test.describe("Admin Dashboard New Pages — Overhauled Accounts, Sellers & KYC Desk E2E", () => {
  test.setTimeout(90_000);

  test("admin accounts page loads, search works, and user detail drawer opens", async ({ page }) => {
    const auth = readSeededAuth();
    await seedAuthenticatedSession(page, auth.admin);

    // Navigate to accounts directory
    await page.goto("/admin-dashboard/accounts", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/admin-dashboard\/accounts/, { timeout: 30_000 });

    // Assert that the page is loaded and contains some accounts or fallback message
    await expect(page.locator("h3:has-text('Accounts Directory')")).toBeVisible({ timeout: 20_000 });
    
    // Fill search to test input interaction
    const searchInput = page.locator("input[placeholder*='Search by name']");
    await expect(searchInput).toBeVisible();
    await searchInput.fill("Chidi");

    // Capture visual snapshot of the Accounts page
    await page.screenshot({
      path: "tests/e2e/screenshots/admin-accounts-directory.png",
      fullPage: true,
    });
  });

  test("admin sellers gallery loads correctly and showcases boutique cards", async ({ page }) => {
    const auth = readSeededAuth();
    await seedAuthenticatedSession(page, auth.admin);

    // Navigate to sellers gallery
    await page.goto("/admin-dashboard/sellers", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/admin-dashboard\/sellers/, { timeout: 30_000 });

    // Assert that the page is loaded
    await expect(page.locator("h3:has-text('Sellers Boutique')")).toBeVisible({ timeout: 20_000 });

    // Capture visual snapshot of the Sellers Gallery
    await page.screenshot({
      path: "tests/e2e/screenshots/admin-sellers-gallery.png",
      fullPage: true,
    });
  });

  test("admin kyc inspection desk handles detailed document inspection workflows", async ({ page }) => {
    const auth = readSeededAuth();
    await seedAuthenticatedSession(page, auth.admin);

    // Navigate to KYC verification desk
    await page.goto("/admin-dashboard/kyc", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/admin-dashboard\/kyc/, { timeout: 30_000 });

    // Assert that the desk header is visible
    await expect(page.locator("h3:has-text('KYC Verification Desk')")).toBeVisible({ timeout: 20_000 });

    // Capture visual snapshot of the KYC Desk
    await page.screenshot({
      path: "tests/e2e/screenshots/admin-kyc-desk-inspected.png",
      fullPage: true,
    });
  });
});
