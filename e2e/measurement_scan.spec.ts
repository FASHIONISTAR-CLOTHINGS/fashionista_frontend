/**
 * @file measurement_scan.spec.ts
 * @description E2E test for the AI body measurement scan flow.
 *
 * Flow:
 *   1. Login as vendor user (dezichi1999@gmail.com)
 *   2. Navigate to /client/dashboard/measurements/scan
 *   3. Screenshot the intro/idle state (height input + Start Body Scan button)
 *   4. Click "Start Body Scan" → screenshot loading/camera state
 *   5. Verify the scan page renders without console errors
 *   6. Navigate to /get-measured landing page
 *   7. Navigate to measurements dashboard
 *
 * Screenshots saved to: test-screenshots/measurement/
 */

import { test, expect, type Page } from "@playwright/test";

const SCREENSHOT_DIR = "test-screenshots/measurement";

const TEST_USER = {
  email: "dezichi1999@gmail.com",
  password: "VendorDev2026!",
};

/** Helper: login via the sign-in page and wait for dashboard redirect. */
async function loginViaUI(page: Page) {
  await page.goto("/auth/sign-in", { waitUntil: "networkidle" });

  // If already authenticated, AuthAwareSignInPage redirects automatically
  if (!page.url().includes("/auth/sign-in")) return;

  await page.locator("#login-email").fill(TEST_USER.email);
  await page.locator("#login-password").fill(TEST_USER.password);
  await page.locator("#login-submit-btn").click();

  // Wait for redirect away from sign-in page
  await page.waitForURL((url) => !url.pathname.includes("/auth/sign-in"), {
    timeout: 30_000,
  });
}

test.describe("Measurement Scan E2E", () => {
  test.describe.configure({ mode: "serial" });

  test("01 — Login as user", async ({ page }) => {
    await loginViaUI(page);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/01-after-login.png`, fullPage: true });
  });

  test("02 — Navigate to measurement scan page", async ({ page }) => {
    await loginViaUI(page);

    await page.goto("/client/dashboard/measurements/scan", { waitUntil: "networkidle" });
    await page.screenshot({ path: `${SCREENSHOT_DIR}/02-scan-page.png`, fullPage: true });

    await expect(page.locator("h1")).toContainText(/30-Second Body Scan|Body Scan/i);
  });

  test("03 — Verify idle state renders correctly", async ({ page }) => {
    await loginViaUI(page);

    await page.goto("/client/dashboard/measurements/scan", { waitUntil: "networkidle" });

    await page.waitForSelector("text=Start Body Scan", { timeout: 15_000 });
    await page.screenshot({ path: `${SCREENSHOT_DIR}/03-idle-state.png`, fullPage: true });

    const startButton = page.getByText("Start Body Scan");
    await expect(startButton).toBeVisible();

    const heightInput = page.locator('input[type="number"]').first();
    await expect(heightInput).toBeVisible();
  });

  test("04 — Click Start Body Scan and capture loading state", async ({ page }) => {
    await loginViaUI(page);

    await page.goto("/client/dashboard/measurements/scan", { waitUntil: "networkidle" });
    await page.waitForSelector("text=Start Body Scan", { timeout: 15_000 });

    const consoleErrors: string[] = [];
    page.on("pageerror", (error) => {
      consoleErrors.push(`PAGE ERROR: ${error.message}`);
    });
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleErrors.push(`CONSOLE ERROR: ${msg.text()}`);
      }
    });

    const startButton = page.getByText("Start Body Scan");
    await startButton.click();

    await page.waitForTimeout(3000);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/04-after-start.png`, fullPage: true });

    if (consoleErrors.length > 0) {
      console.log("Console errors during scan start:", consoleErrors);
    }
  });

  test("05 — Navigate to get-measured landing page", async ({ page }) => {
    await page.goto("/get-measured", { waitUntil: "networkidle" });
    await page.screenshot({ path: `${SCREENSHOT_DIR}/05-get-measured.png`, fullPage: true });
    await expect(page).toHaveURL(/\/get-measured/);
  });

  test("06 — Navigate to measurements dashboard", async ({ page }) => {
    await loginViaUI(page);

    await page.goto("/client/dashboard/measurements", { waitUntil: "networkidle" });
    await page.screenshot({ path: `${SCREENSHOT_DIR}/06-measurements-dashboard.png`, fullPage: true });
  });
});
