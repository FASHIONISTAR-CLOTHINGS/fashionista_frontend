/**
 * @file measurement_scan.spec.ts
 * @description E2E test for the AI body measurement scan flow.
 *
 * Actual UI flow (verified from component source code):
 *
 *   Scan Entry Page (/client/dashboard/measurements/scan):
 *     1. Header: "30-Second Body Scan" (h1) + "AI Body Measurement" badge
 *     2. ScanTutorialOverlay: 4 slides with "Skip" and "Next" buttons
 *     3. MeasurementEntryModal: "Before Your Scan" heading
 *        - Age input (placeholder "e.g. 28")
 *        - Sex selector (Male/Female/Other)
 *        - Height input (placeholder "e.g. 175")
 *        - Weight input (placeholder "e.g. 70")
 *        - "Continue to Scan →" submit button
 *     4. On submit → redirect to QR page (desktop) or /scan/[sessionId] (mobile)
 *
 *   Active Scan Page (/client/dashboard/measurements/scan/[sessionId]):
 *     1. EnhancedMeasurementFlow: "AI Body Scan" heading (h2)
 *     2. "Start AI Scan" button → camera capture phase
 *     3. Requires sessionStorage entry data (age, height, etc.)
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

// Test session ID for active scan page tests
const TEST_SESSION_ID = "ca9ef4f4-8330-40ec-a646-c9699d8d9f8c";

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
  options?: { injectEntryData?: boolean },
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
  await page.addInitScript(
    (authData) => {
      // Auth state in Zustand persist envelope format
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

      // Optionally inject measurement entry data for active scan page
      if (authData.entryData) {
        sessionStorage.setItem("fashionistar_measurement_entry", JSON.stringify(authData.entryData));
      }

      // Skip tutorial for tests that don't specifically test it
      if (authData.skipTutorial) {
        localStorage.setItem("fashionistar_tutorial_seen", "true");
      }
    },
    {
      accessToken,
      refreshToken,
      user,
      skipTutorial: options?.injectEntryData ?? false,
      entryData: options?.injectEntryData
        ? {
            age: 28,
            sex: "neutral",
            heightCm: 175,
            weightKg: 70,
            sessionId: TEST_SESSION_ID,
            deviceType: "desktop",
            timestamp: Date.now(),
          }
        : null,
    },
  );

  // 3. Navigate to the target page
  // Use "domcontentloaded" — "networkidle" times out due to HMR WebSocket / polling
  // 300s timeout accounts for first-time dev server compilation on slow filesystems
  await page.goto(targetPath, { waitUntil: "domcontentloaded", timeout: 300_000 });
  // Wait for hydration and dev server compilation to finish
  await page.waitForTimeout(3000);
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
      const text = msg.text();
      // Ignore Google OAuth origin errors and browser extension noise
      if (!text.includes("GSI_LOGGER") && !text.includes("accounts.google.com")) {
        consoleErrors.push(`CONSOLE ERROR: ${text}`);
      }
    }
  });
  page.on("response", (response) => {
    const url = response.url();
    const status = response.status();

    // Only track scan-related endpoints
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
  test.setTimeout(300_000);

  test("01 - Login via API and verify authenticated", async ({ page, request }) => {
    await loginAndNavigate(page, request, "/");
    await page.screenshot({ path: `${SCREENSHOT_DIR}/01-after-login.png`, fullPage: true });
    await expect(page).not.toHaveURL(/\/auth\/sign-in/);
  });

  test("02 - Scan entry page renders header and tutorial", async ({ page, request }) => {
    await loginAndNavigate(page, request, "/client/dashboard/measurements/scan");
    await page.screenshot({ path: `${SCREENSHOT_DIR}/02-scan-entry.png`, fullPage: true });

    // Verify page header
    await page.waitForSelector("text=30-Second Body Scan", { timeout: 120_000 });
    await expect(page.getByRole("heading", { name: "30-Second Body Scan" })).toBeVisible();
    await expect(page.getByText("AI Body Measurement")).toBeVisible();

    // Tutorial overlay should be visible (first slide: "Set Up Your Phone")
    await expect(page.getByRole("heading", { name: "Set Up Your Phone" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Skip" })).toBeVisible();
  });

  test("03 - Tutorial Skip button opens entry modal", async ({ page, request }) => {
    await loginAndNavigate(page, request, "/client/dashboard/measurements/scan");
    await page.waitForSelector("text=30-Second Body Scan", { timeout: 120_000 });

    // Click Skip to bypass tutorial
    await page.getByRole("button", { name: "Skip" }).click();
    await page.waitForTimeout(2000);

    // Entry modal should appear
    await expect(page.getByRole("heading", { name: "Before Your Scan" })).toBeVisible();
    await expect(page.getByText("A few details help our AI")).toBeVisible();

    await page.screenshot({ path: `${SCREENSHOT_DIR}/03-entry-modal.png`, fullPage: true });
  });

  test("04 - Entry modal has age, height, weight inputs and submit button", async ({ page, request }) => {
    await loginAndNavigate(page, request, "/client/dashboard/measurements/scan");
    await page.waitForSelector("text=30-Second Body Scan", { timeout: 120_000 });

    // Skip tutorial
    await page.getByRole("button", { name: "Skip" }).click();
    await page.waitForTimeout(2000);

    // Verify form fields
    await expect(page.getByPlaceholder("e.g. 28")).toBeVisible();
    await expect(page.getByPlaceholder("e.g. 175")).toBeVisible();
    await expect(page.getByPlaceholder("e.g. 70")).toBeVisible();

    // Verify sex selector buttons
    await expect(page.getByRole("button", { name: "Male" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Female" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Other" })).toBeVisible();

    // Verify submit button
    await expect(page.getByRole("button", { name: "Continue to Scan →" })).toBeVisible();

    await page.screenshot({ path: `${SCREENSHOT_DIR}/04-modal-fields.png`, fullPage: true });
  });

  test("05 - Fill entry modal and submit triggers redirect", async ({ page, request }) => {
    await loginAndNavigate(page, request, "/client/dashboard/measurements/scan");
    await page.waitForSelector("text=30-Second Body Scan", { timeout: 120_000 });

    // Skip tutorial
    await page.getByRole("button", { name: "Skip" }).click();
    await page.waitForTimeout(2000);

    // Fill age (required to enable submit)
    await page.getByPlaceholder("e.g. 28").fill("28");
    await page.waitForTimeout(500);

    // Fill height
    await page.getByPlaceholder("e.g. 175").fill("175");

    // Fill weight
    await page.getByPlaceholder("e.g. 70").fill("70");

    await page.screenshot({ path: `${SCREENSHOT_DIR}/05-modal-filled.png`, fullPage: true });

    // Submit — this calls initiateBodyScan and redirects
    await page.getByRole("button", { name: "Continue to Scan →" }).click();

    // Wait for redirect (either QR page or scan session page)
    await page.waitForTimeout(10000);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/05-after-submit.png`, fullPage: true });

    // Should have navigated away from the scan entry page
    await expect(page).not.toHaveURL(/\/client\/dashboard\/measurements\/scan$/);
  });

  test("06 - Navigate to get-measured landing page", async ({ page }) => {
    await page.goto("/get-measured", { waitUntil: "domcontentloaded", timeout: 300_000 });
    await page.waitForTimeout(3000);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/06-get-measured.png`, fullPage: true });
    await expect(page).toHaveURL(/\/get-measured/);
  });

  test("07 - Navigate to measurements dashboard (authenticated)", async ({ page, request }) => {
    await loginAndNavigate(page, request, "/client/dashboard/measurements");
    await page.screenshot({ path: `${SCREENSHOT_DIR}/07-measurements-dashboard.png`, fullPage: true });
    await expect(page).not.toHaveURL(/\/auth\/sign-in/);
  });

  test("08 - Active scan page renders AI Body Scan and Start AI Scan button", async ({ page, request }) => {
    // Inject entry data so ActiveScanClient doesn't redirect back
    await loginAndNavigate(
      page,
      request,
      `/client/dashboard/measurements/scan/${TEST_SESSION_ID}`,
      { injectEntryData: true },
    );

    // Debug: capture URL and screenshot right after navigation
    await page.screenshot({ path: `${SCREENSHOT_DIR}/08-debug-after-nav.png`, fullPage: true });
    const currentUrl = page.url();
    console.log(`Test 08 URL after navigation: ${currentUrl}`);

    // Wait for possible redirect to settle
    await page.waitForTimeout(5000);
    const settledUrl = page.url();
    console.log(`Test 08 URL after settle: ${settledUrl}`);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/08-debug-after-settle.png`, fullPage: true });

    // The EnhancedMeasurementFlow should render with "AI Body Scan" heading
    await page.waitForSelector("text=AI Body Scan", { timeout: 120_000 });
    await expect(page.getByRole("heading", { name: "AI Body Scan" })).toBeVisible();
    await expect(page.getByText("30 seconds · 14 measurements · 100% private")).toBeVisible();

    // "Start AI Scan" button should be visible
    const startButton = page.getByRole("button", { name: "Start AI Scan" });
    await expect(startButton).toBeVisible();
    await expect(startButton).toBeEnabled();

    await page.screenshot({ path: `${SCREENSHOT_DIR}/08-active-scan-idle.png`, fullPage: true });
  });

  test("09 - Click Start AI Scan and verify no 404/403 on scan endpoints", async ({ page, request }) => {
    await loginAndNavigate(
      page,
      request,
      `/client/dashboard/measurements/scan/${TEST_SESSION_ID}`,
      { injectEntryData: true },
    );

    await page.waitForSelector("text=Start AI Scan", { timeout: 120_000 });

    const { networkErrors } = collectErrors(page);

    // Click Start AI Scan to trigger camera capture
    await page.getByRole("button", { name: "Start AI Scan" }).click();
    await page.waitForTimeout(5000);

    await page.screenshot({ path: `${SCREENSHOT_DIR}/09-after-click.png`, fullPage: true });

    // Assert no 404/403 errors on scan-related API or WebSocket endpoints
    expect(
      networkErrors,
      `Should not have 404/403 errors on scan endpoints. Found: ${networkErrors.join(", ")}`,
    ).toHaveLength(0);
  });

  test("10 - Verify measurement list and requirements on active scan page", async ({ page, request }) => {
    await loginAndNavigate(
      page,
      request,
      `/client/dashboard/measurements/scan/${TEST_SESSION_ID}`,
      { injectEntryData: true },
    );

    await page.waitForSelector("text=AI Body Scan", { timeout: 120_000 });

    // Verify measurement list section
    await expect(page.getByText("What We Measure")).toBeVisible();
    await expect(page.getByText("Bust")).toBeVisible();
    await expect(page.getByText("Waist")).toBeVisible();
    await expect(page.getByText("Hips")).toBeVisible();
    await expect(page.getByText("Shoulder Width")).toBeVisible();

    // Verify requirements section
    await expect(page.getByText("Before You Start")).toBeVisible();
    await expect(page.getByText("Wear fitted clothing")).toBeVisible();

    await page.screenshot({ path: `${SCREENSHOT_DIR}/10-measurement-details.png`, fullPage: true });
  });
});
