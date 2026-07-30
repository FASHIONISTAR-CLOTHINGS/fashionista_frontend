/**
 * @file measurement_scan.spec.ts
 * @description E2E test for the AI body measurement scan flow.
 *
 * Flow:
 *   1. Login via API, inject tokens into browser sessionStorage
 *   2. Navigate to /client/dashboard/measurements/scan
 *   3. Verify intro state renders (AI Body Scan heading, Start AI Scan button)
 *   4. Click "Start AI Scan" → verify camera capture UI (Start Body Scan button)
 *   5. Assert no 404 errors from scan status endpoint
 *   6. Assert no 403 errors from WebSocket connection
 *   7. Navigate to /get-measured landing page
 *   8. Navigate to measurements dashboard
 *
 * Screenshots saved to: test-screenshots/measurement/
 */

import { test, expect, type Page, type APIRequestContext } from "@playwright/test";

const SCREENSHOT_DIR = "test-screenshots/measurement";
const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://127.0.0.1:8001";

const TEST_USER = {
  email: "client@fashionistar.test",
  password: "Client@Secure99!",
};

/**
 * Login via the backend API directly and inject auth tokens into
 * the browser's sessionStorage before the page's JS hydrates.
 *
 * The auth state is stored under the "fashionistar-auth" key in the
 * Zustand persist envelope format, matching the auth-session.client.ts
 * readStoredAuthState() function.
 */
async function loginAndNavigate(
  page: Page,
  request: APIRequestContext,
  targetPath: string,
): Promise<void> {
  // 1. Login via API
  const loginRes = await request.post(API_BASE + "/api/v1/auth/login/", {
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

  const payload = body.data ?? body;
  const accessToken: string = payload.access;
  const refreshToken: string = payload.refresh;
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

  // 2. Inject sessionStorage BEFORE the page loads via addInitScript
  // This runs before any page JS, so Zustand will pick up the auth state on hydration
  await page.addInitScript(
    (authData) => {
      const authState = {
        state: {
          accessToken: authData.accessToken,
          refreshToken: authData.refreshToken,
          isAuthenticated: true,
          user: authData.user,
          isLoading: false,
          pendingOTPEmail: undefined,
          pendingOTPPhone: undefined,
          lastLoginAt: Date.now(),
        },
        version: 0,
      };
      sessionStorage.setItem("fashionistar-auth", JSON.stringify(authState));
    },
    { accessToken, refreshToken, user },
  );

  // 3. Navigate to the target page — addInitScript runs before page JS
  // Use "networkidle" to wait for the dev server to finish compiling and loading
  await page.goto(targetPath, { waitUntil: "networkidle", timeout: 120_000 });
  // Wait for hydration and any loading screen to clear
  await page.waitForTimeout(8000);
}

/**
 * Collect console errors and network failures (404/403) for assertions.
 */
function collectErrors(page: Page) {
  const consoleErrors: string[] = [];
  const networkErrors: string[] = [];

  page.on("pageerror", (error) => {
    consoleErrors.push(`PAGE ERROR: ${error.message}`);
  });
  page.on("console", (msg) => {
    if (msg.type() === "error") {
      // Ignore Google OAuth origin errors (unrelated to our code)
      const text = msg.text();
      if (!text.includes("GSI_LOGGER") && !text.includes("accounts.google.com")) {
        consoleErrors.push(`CONSOLE ERROR: ${text}`);
      }
    }
  });
  page.on("response", (response) => {
    const url = response.url();
    const status = response.status();

    // Only track scan-related endpoints (not Google OAuth, static assets, etc.)
    if (
      (url.includes("/api/v1/ninja/") || url.includes("/ws/scan/")) &&
      (status === 404 || status === 403)
    ) {
      networkErrors.push(`${status} on ${url}`);
    }
  });

  return { consoleErrors, networkErrors };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

test.describe("Measurement Scan E2E", () => {
  test.setTimeout(180_000);

  test("01 - Login via API and verify authenticated", async ({ page, request }) => {
    await loginAndNavigate(page, request, "/");
    await page.screenshot({ path: `${SCREENSHOT_DIR}/01-after-login.png`, fullPage: true });
    // Verify we're not redirected to sign-in
    await expect(page).not.toHaveURL(/\/auth\/sign-in/);
  });

  test("02 - Navigate to measurement scan page and verify intro", async ({ page, request }) => {
    await loginAndNavigate(page, request, "/client/dashboard/measurements/scan");
    await page.screenshot({ path: `${SCREENSHOT_DIR}/02-scan-page.png`, fullPage: true });

    // The scan entry page should show the intro card with "AI Body Scan" heading
    // Wait for the scan page to fully render (dev server may still be compiling)
    await page.waitForSelector("text=AI Body Scan", { timeout: 120_000 });
    await expect(page.getByText("AI Body Scan")).toBeVisible();
    // Verify subtitle text
    await expect(page.getByText("30 seconds · 14 measurements · 100% private")).toBeVisible();
  });

  test("03 - Verify idle state renders Start AI Scan button", async ({ page, request }) => {
    await loginAndNavigate(page, request, "/client/dashboard/measurements/scan");

    await page.waitForSelector("text=Start AI Scan", { timeout: 120_000 });
    await page.screenshot({ path: `${SCREENSHOT_DIR}/03-idle-state.png`, fullPage: true });

    const startButton = page.getByRole("button", { name: "Start AI Scan" });
    await expect(startButton).toBeVisible();
    await expect(startButton).toBeEnabled();
  });

  test("04 - Click Start AI Scan and verify camera capture UI", async ({ page, request }) => {
    await loginAndNavigate(page, request, "/client/dashboard/measurements/scan");
    await page.waitForSelector("text=Start AI Scan", { timeout: 120_000 });

    const { networkErrors } = collectErrors(page);

    const startButton = page.getByRole("button", { name: "Start AI Scan" });
    await startButton.click();

    // Wait for camera capture UI to render
    await page.waitForTimeout(3000);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/04-after-start.png`, fullPage: true });

    // Verify we're in the scanning phase — look for "Start Body Scan" button
    // or the height input field that appears in AICameraCapture
    const bodyScanButton = page.getByRole("button", { name: "Start Body Scan" });
    const heightInput = page.getByPlaceholder("e.g. 175");

    // At least one of these should be visible in the camera capture phase
    const hasBodyScanButton = await bodyScanButton.isVisible().catch(() => false);
    const hasHeightInput = await heightInput.isVisible().catch(() => false);

    expect(
      hasBodyScanButton || hasHeightInput,
      "Should show either 'Start Body Scan' button or height input in camera capture phase",
    ).toBeTruthy();

    // Assert no 404 or 403 errors on scan-related endpoints
    expect(networkErrors, `Should not have 404/403 errors on scan endpoints: ${networkErrors.join(", ")}`).toHaveLength(0);
  });

  test("05 - Verify measurement list and requirements visible", async ({ page, request }) => {
    await loginAndNavigate(page, request, "/client/dashboard/measurements/scan");
    await page.waitForSelector("text=AI Body Scan", { timeout: 120_000 });

    // Verify measurement list items
    await expect(page.getByText("What We Measure")).toBeVisible();
    await expect(page.getByText("Bust")).toBeVisible();
    await expect(page.getByText("Waist")).toBeVisible();
    await expect(page.getByText("Hips")).toBeVisible();
    await expect(page.getByText("Shoulder Width")).toBeVisible();

    // Verify requirements section
    await expect(page.getByText("Before You Start")).toBeVisible();
    await expect(page.getByText("Wear fitted clothing")).toBeVisible();
    await expect(page.getByText("Stand 1.5–2 metres")).toBeVisible();

    await page.screenshot({ path: `${SCREENSHOT_DIR}/05-measurement-details.png`, fullPage: true });
  });

  test("06 - Navigate to get-measured landing page", async ({ page }) => {
    await page.goto("/get-measured", { waitUntil: "networkidle", timeout: 120_000 });
    await page.waitForTimeout(8000);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/06-get-measured.png`, fullPage: true });
    await expect(page).toHaveURL(/\/get-measured/);
  });

  test("07 - Navigate to measurements dashboard", async ({ page, request }) => {
    await loginAndNavigate(page, request, "/client/dashboard/measurements");
    await page.screenshot({ path: `${SCREENSHOT_DIR}/07-measurements-dashboard.png`, fullPage: true });
    await expect(page).not.toHaveURL(/\/auth\/sign-in/);
  });

  test("08 - Verify no 404 on scan status endpoint and no 403 on WebSocket", async ({ page, request }) => {
    await loginAndNavigate(page, request, "/client/dashboard/measurements/scan");
    await page.waitForSelector("text=Start AI Scan", { timeout: 120_000 });

    const { networkErrors } = collectErrors(page);

    // Click Start AI Scan to trigger camera capture (which may initiate WebSocket)
    await page.getByRole("button", { name: "Start AI Scan" }).click();
    await page.waitForTimeout(5000);

    // Assert no 404/403 errors on scan-related API or WebSocket endpoints
    expect(
      networkErrors,
      `Should not have 404/403 errors on scan endpoints. Found: ${networkErrors.join(", ")}`,
    ).toHaveLength(0);

    await page.screenshot({ path: `${SCREENSHOT_DIR}/08-no-network-errors.png`, fullPage: true });
  });
});
