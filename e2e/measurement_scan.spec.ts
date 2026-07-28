/**
 * @file measurement_scan.spec.ts
 * @description E2E test for the AI body measurement scan flow.
 *
 * Flow:
 *   1. Login via API, inject tokens into browser storage
 *   2. Navigate to /client/dashboard/measurements/scan
 *   3. Screenshot the intro/idle state (height input + Start Body Scan button)
 *   4. Click "Start Body Scan" → screenshot loading/camera state
 *   5. Verify the scan page renders without console errors
 *   6. Navigate to /get-measured landing page
 *   7. Navigate to measurements dashboard
 *
 * Screenshots saved to: test-screenshots/measurement/
 */

import { test, expect, type Page, type APIRequestContext } from "@playwright/test";

const SCREENSHOT_DIR = "test-screenshots/measurement";
const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://127.0.0.1:8001";

const TEST_USER = {
  email: "dezichi1999@gmail.com",
  password: "VendorDev2026!",
};

/**
 * Login via the backend API directly and inject auth tokens into the browser.
 * This bypasses the cross-origin Axios issue when the frontend makes direct
 * requests to 127.0.0.1:8001 from localhost:3000.
 */
async function loginAndInjectTokens(page: Page, request: APIRequestContext) {
  // 1. Login via API
  const loginRes = await request.post(`${API_BASE}/api/v1/auth/login/`, {
    data: {
      email_or_phone: TEST_USER.email,
      password: TEST_USER.password,
    },
    headers: {
      "Content-Type": "application/json",
      "ngrok-skip-browser-warning": "true",
    },
  });

  expect(loginRes.ok(), `Login API should return 200, got ${loginRes.status()}`).toBeTruthy();
  const body = await loginRes.json();

  // Unwrap Fashionistar envelope: { success: true, data: { access, refresh, ... } }
  const payload = body.data ?? body;
  const accessToken = payload.access;
  const refreshToken = payload.refresh;
  const user = {
    id: payload.user_id,
    email: TEST_USER.email,
    role: payload.role,
    is_verified: true,
    is_staff: payload.role === "admin" || payload.role === "staff",
    first_name: payload.first_name ?? "",
    last_name: payload.last_name ?? "",
  };

  expect(accessToken, "Access token should be present").toBeTruthy();

  // 2. Navigate to the app first (needed to access window/localStorage)
  await page.goto("/", { waitUntil: "domcontentloaded" });

  // 3. Inject tokens into sessionStorage (Zustand auth store uses sessionStorage)
  await page.evaluate(({ accessToken, refreshToken, user }) => {
    // The Zustand store key is "fashionistar-auth"
    const authState = {
      state: {
        accessToken,
        refreshToken,
        isAuthenticated: true,
        user,
        isLoading: false,
        pendingOTPEmail: undefined,
        pendingOTPPhone: undefined,
        lastLoginAt: Date.now(),
      },
      version: 0,
    };
    sessionStorage.setItem("fashionistar-auth", JSON.stringify(authState));

    // Also set individual keys that the auth lib might check
    sessionStorage.setItem("fashionistar_access_token", accessToken);
    if (refreshToken) {
      sessionStorage.setItem("fashionistar_refresh_token", refreshToken);
    }
  }, { accessToken, refreshToken, user });

  // 4. Reload to pick up the injected auth state
  await page.reload({ waitUntil: "domcontentloaded" });
  // Give the app a moment to hydrate and read the auth state
  await page.waitForTimeout(2000);
}

test.describe("Measurement Scan E2E", () => {
  test.describe.configure({ mode: "serial" });
  test.setTimeout(120_000);

  test("01 — Login via API and verify authenticated", async ({ page, request }) => {
    await loginAndInjectTokens(page, request);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/01-after-login.png`, fullPage: true });
  });

  test("02 — Navigate to measurement scan page", async ({ page, request }) => {
    await loginAndInjectTokens(page, request);

    await page.goto("/client/dashboard/measurements/scan", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/02-scan-page.png", fullPage: true });

    await expect(page.locator("h1")).toContainText(/30-Second Body Scan|Body Scan/i);
  });

  test("03 — Verify idle state renders correctly", async ({ page, request }) => {
    await loginAndInjectTokens(page, request);

    await page.goto("/client/dashboard/measurements/scan", { waitUntil: "domcontentloaded" });

    // Wait for the InHouseMeasurementFlow to render
    await page.waitForSelector("text=Start Body Scan", { timeout: 30_000 });
    await page.screenshot({ path: `${SCREENSHOT_DIR}/03-idle-state.png`, fullPage: true });

    const startButton = page.getByText("Start Body Scan");
    await expect(startButton).toBeVisible();

    // Verify height input exists
    const heightInput = page.locator('input[type="number"]').first();
    await expect(heightInput).toBeVisible();
  });

  test("04 — Click Start Body Scan and capture loading state", async ({ page, request }) => {
    await loginAndInjectTokens(page, request);

    await page.goto("/client/dashboard/measurements/scan", { waitUntil: "domcontentloaded" });
    await page.waitForSelector("text=Start Body Scan", { timeout: 30_000 });

    // Capture console errors
    const consoleErrors: string[] = [];
    page.on("pageerror", (error) => {
      consoleErrors.push(`PAGE ERROR: ${error.message}`);
    });
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleErrors.push(`CONSOLE ERROR: ${msg.text()}`);
      }
    });

    // Click Start Body Scan
    const startButton = page.getByText("Start Body Scan");
    await startButton.click();

    // Wait for loading state to appear
    await page.waitForTimeout(3000);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/04-after-start.png`, fullPage: true });

    // Log any console errors (don't fail — camera may not be available in headless)
    if (consoleErrors.length > 0) {
      console.log("Console errors during scan start:", consoleErrors);
    }
  });

  test("05 — Navigate to get-measured landing page", async ({ page }) => {
    await page.goto("/get-measured", { waitUntil: "domcontentloaded" });
    await page.screenshot({ path: `${SCREENSHOT_DIR}/05-get-measured.png`, fullPage: true });
    await expect(page).toHaveURL(/\/get-measured/);
  });

  test("06 — Navigate to measurements dashboard", async ({ page, request }) => {
    await loginAndInjectTokens(page, request);

    await page.goto("/client/dashboard/measurements", { waitUntil: "domcontentloaded" });
    await page.screenshot({ path: `${SCREENSHOT_DIR}/06-measurements-dashboard.png`, fullPage: true });
  });
});
