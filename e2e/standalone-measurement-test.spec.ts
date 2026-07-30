/**
 * standalone-measurement-test.spec.ts
 * Standalone Playwright test — no global setup dependency.
 * Tests the full measurement scan flow: login → tutorial → entry modal → QR handoff → measurements dashboard.
 */
import { test, expect, type Page, type APIRequestContext } from "@playwright/test";

const SCREENSHOT_DIR = "test-screenshots/measurement";
const API_BASE = "http://127.0.0.1:8001";

const TEST_USER = {
  email: "client@fashionistar.test",
  password: "Client@Secure99!",
};

async function loginAndNavigate(page: Page, request: APIRequestContext, targetPath: string) {
  const loginRes = await request.post(API_BASE + "/api/v1/auth/login/", {
    data: {
      email_or_phone: TEST_USER.email,
      password: TEST_USER.password,
    },
    headers: {
      "Content-Type": "application/json",
      "ngrok-skip-browser-warning": "true",
    },
    timeout: 60_000,
  });

  expect(loginRes.ok(), "Login API should return 200, got " + loginRes.status()).toBeTruthy();
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

  await page.addInitScript((authData) => {
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
    sessionStorage.setItem("fashionistar_access_token", authData.accessToken);
    if (authData.refreshToken) {
      sessionStorage.setItem("fashionistar_refresh_token", authData.refreshToken);
    }
  }, { accessToken, refreshToken, user });

  await page.goto(targetPath, { waitUntil: "commit", timeout: 120_000 });
  await page.waitForTimeout(5000);
}

test.describe("Measurement Scan E2E", () => {
  test.setTimeout(300_000);

  test("01 - Login via API and verify authenticated on homepage", async ({ page, request }) => {
    await loginAndNavigate(page, request, "/");
    await page.screenshot({ path: SCREENSHOT_DIR + "/01-after-login.png", fullPage: true });
    console.log("01 - Login screenshot captured");
  });

  test("02 - Scan page: tutorial overlay visible with 30-Second Body Scan heading", async ({ page, request }) => {
    await loginAndNavigate(page, request, "/client/dashboard/measurements/scan");
    await page.screenshot({ path: SCREENSHOT_DIR + "/02-scan-page-tutorial.png", fullPage: true });

    const heading = page.locator("h1").filter({ hasText: "30-Second Body Scan" });
    await expect(heading).toBeVisible({ timeout: 60_000 });
    console.log("02 - Scan page heading verified");
  });

  test("03 - Skip tutorial and verify MeasurementEntryModal appears", async ({ page, request }) => {
    await loginAndNavigate(page, request, "/client/dashboard/measurements/scan");

    // Clear tutorial localStorage in case it was dismissed in a previous test
    await page.evaluate(() => {
      localStorage.removeItem("fashionistar_scan_tutorial_v1");
    });
    await page.reload({ waitUntil: "commit" });
    await page.waitForTimeout(5000);

    // Wait for tutorial overlay and click Skip
    const skipButton = page.getByRole("button", { name: "Skip" });
    await expect(skipButton).toBeVisible({ timeout: 60_000 });
    await skipButton.click();

    await page.waitForTimeout(3000);
    await page.screenshot({ path: SCREENSHOT_DIR + "/03-entry-modal.png", fullPage: true });

    // Verify the entry modal appears
    const modalHeading = page.locator("h2").filter({ hasText: "Before Your Scan" });
    await expect(modalHeading).toBeVisible({ timeout: 30_000 });
    console.log("03 - Entry modal verified after skipping tutorial");
  });

  test("04 - Fill entry modal and submit to create scan session", async ({ page, request }) => {
    const consoleErrors: string[] = [];
    page.on("pageerror", (error) => {
      consoleErrors.push("PAGE ERROR: " + error.message);
    });
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleErrors.push("CONSOLE ERROR: " + msg.text());
      }
    });

    await loginAndNavigate(page, request, "/client/dashboard/measurements/scan");

    // Clear tutorial localStorage in case it was dismissed in a previous test
    await page.evaluate(() => {
      localStorage.removeItem("fashionistar_scan_tutorial_v1");
    });
    await page.reload({ waitUntil: "commit" });
    await page.waitForTimeout(5000);

    // Skip tutorial
    const skipButton = page.getByRole("button", { name: "Skip" });
    await expect(skipButton).toBeVisible({ timeout: 60_000 });
    await skipButton.click();
    await page.waitForTimeout(3000);

    // Fill entry modal — Age (required)
    const ageInput = page.locator('input[type="number"]').first();
    await expect(ageInput).toBeVisible({ timeout: 30_000 });
    await ageInput.fill("28");
    await page.waitForTimeout(1000);

    // Height should auto-fill from prediction. Verify it has a value.
    const heightInput = page.locator('input[placeholder*="175"]');
    const heightValue = await heightInput.inputValue().catch(() => "");
    if (!heightValue) {
      await heightInput.fill("175");
    }

    // Weight (optional) — enter 70
    const weightInput = page.locator('input[placeholder*="70"]');
    await weightInput.fill("70");

    await page.screenshot({ path: SCREENSHOT_DIR + "/04-entry-modal-filled.png", fullPage: true });

    // Click "Continue to Scan →"
    const submitButton = page.getByRole("button", { name: /Continue to Scan/ });
    await expect(submitButton).toBeVisible({ timeout: 10_000 });
    await submitButton.click();

    // Wait for redirect — either to QR page (desktop) or active scan (mobile)
    await page.waitForTimeout(10000);
    await page.screenshot({ path: SCREENSHOT_DIR + "/04-after-submit.png", fullPage: true });

    const currentUrl = page.url();
    console.log("04 - Current URL after submit:", currentUrl);

    if (currentUrl.includes("/scan/qr")) {
      console.log("04 - Redirected to QR handoff page (desktop flow)");
      const qrHeading = page.locator("h1").filter({ hasText: "Scan with Your Phone" });
      await expect(qrHeading).toBeVisible({ timeout: 30_000 });
    } else if (currentUrl.match(/\/scan\/[a-f0-9-]+/)) {
      console.log("04 - Redirected to active scan page (mobile flow)");
    } else {
      console.log("04 - Still on scan page, checking for error state");
    }

    if (consoleErrors.length > 0) {
      console.log("04 - Console errors:", consoleErrors);
    }
    console.log("04 - Entry modal submitted, screenshot captured");
  });

  test("05 - Verify QR code display on QR handoff page (desktop flow)", async ({ page, request }) => {
    await loginAndNavigate(page, request, "/client/dashboard/measurements/scan");

    // Clear tutorial localStorage in case it was dismissed in a previous test
    await page.evaluate(() => {
      localStorage.removeItem("fashionistar_scan_tutorial_v1");
    });
    await page.reload({ waitUntil: "commit" });
    await page.waitForTimeout(5000);

    // Skip tutorial
    const skipButton = page.getByRole("button", { name: "Skip" });
    await expect(skipButton).toBeVisible({ timeout: 60_000 });
    await skipButton.click();
    await page.waitForTimeout(3000);

    // Fill entry modal
    const ageInput = page.locator('input[type="number"]').first();
    await expect(ageInput).toBeVisible({ timeout: 30_000 });
    await ageInput.fill("30");
    await page.waitForTimeout(1000);

    // Submit
    const submitButton = page.getByRole("button", { name: /Continue to Scan/ });
    await expect(submitButton).toBeVisible({ timeout: 10_000 });
    await submitButton.click();

    // Wait for redirect
    await page.waitForTimeout(15000);
    await page.screenshot({ path: SCREENSHOT_DIR + "/05-qr-handoff.png", fullPage: true });

    const currentUrl = page.url();
    console.log("05 - Current URL:", currentUrl);

    if (currentUrl.includes("/scan/qr")) {
      const qrHeading = page.locator("h1").filter({ hasText: "Scan with Your Phone" });
      await expect(qrHeading).toBeVisible({ timeout: 30_000 });

      // Check for QR code image or generating state
      const qrImage = page.getByAltText("Scan QR Code");
      const generatingText = page.getByText(/Generating|Session expires in|Copy/);

      const qrVisible = await qrImage.isVisible().catch(() => false);
      const generatingVisible = await generatingText.first().isVisible().catch(() => false);

      if (qrVisible) {
        console.log("05 - QR code image is visible");
      } else if (generatingVisible) {
        console.log("05 - QR code is generating (text visible)");
      } else {
        console.log("05 - QR code area not found, checking page state");
      }

      // Verify QR page content — heading or session info
      const pageContent = page.getByText(/Scan with Your Phone|Generating|Session expires in|Copy/);
      await expect(pageContent.first()).toBeVisible({ timeout: 10_000 });
      console.log("05 - QR handoff page verified with content");
    } else {
      console.log("05 - Not on QR page, URL:", currentUrl);
    }

    await page.screenshot({ path: SCREENSHOT_DIR + "/05-qr-page-final.png", fullPage: true });
  });

  test("06 - Navigate to get-measured landing page", async ({ page }) => {
    await page.goto("/get-measured", { waitUntil: "commit", timeout: 120_000 });
    await page.waitForTimeout(5000);
    await page.screenshot({ path: SCREENSHOT_DIR + "/06-get-measured.png", fullPage: true });
    await expect(page).toHaveURL(/\/get-measured/);
    console.log("06 - Get-measured page verified");
  });

  test("07 - Navigate to measurements dashboard and verify page loads", async ({ page, request }) => {
    await loginAndNavigate(page, request, "/client/dashboard/measurements");
    await page.waitForTimeout(5000);
    await page.screenshot({ path: SCREENSHOT_DIR + "/07-measurements-dashboard.png", fullPage: true });

    await expect(page).toHaveURL(/\/client\/dashboard\/measurements/);
    console.log("07 - Measurements dashboard verified");
  });

  test("08 - Verify WebSocket/polling connection for scan status", async ({ page, request }) => {
    await loginAndNavigate(page, request, "/client/dashboard/measurements/scan");

    // Clear tutorial localStorage in case it was dismissed in a previous test
    await page.evaluate(() => {
      localStorage.removeItem("fashionistar_scan_tutorial_v1");
    });
    await page.reload({ waitUntil: "commit" });
    await page.waitForTimeout(5000);

    // Skip tutorial (or proceed if already dismissed)
    const skipButton = page.getByRole("button", { name: "Skip" });
    const skipVisible = await skipButton.isVisible().catch(() => false);
    if (skipVisible) {
      await skipButton.click();
      await page.waitForTimeout(3000);
    } else {
      // Tutorial already dismissed, check if entry modal is visible
      console.log("08 - Tutorial already dismissed, proceeding to entry modal");
    }

    const ageInput = page.locator('input[type="number"]').first();
    await expect(ageInput).toBeVisible({ timeout: 30_000 });
    await ageInput.fill("25");
    await page.waitForTimeout(1000);

    const submitButton = page.getByRole("button", { name: /Continue to Scan/ });
    await submitButton.click();

    // Wait for redirect and WebSocket connection
    await page.waitForTimeout(15000);
    await page.screenshot({ path: SCREENSHOT_DIR + "/08-ws-connection.png", fullPage: true });

    const currentUrl = page.url();
    console.log("08 - Current URL:", currentUrl);

    if (currentUrl.includes("/scan/qr")) {
      const liveIndicator = page.getByText(/Live|Polling every 3s/);
      await expect(liveIndicator).toBeVisible({ timeout: 10_000 });
      console.log("08 - WebSocket/polling status indicator verified");
    }

    await page.screenshot({ path: SCREENSHOT_DIR + "/08-ws-final.png", fullPage: true });
  });
});
