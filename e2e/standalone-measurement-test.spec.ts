/**
 * standalone-measurement-test.ts
 * Standalone Playwright test — no global setup dependency.
 * Runs directly against localhost:3000 + localhost:8001.
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

  test("01 - Login via API and verify authenticated", async ({ page, request }) => {
    await loginAndNavigate(page, request, "/");
    await page.screenshot({ path: SCREENSHOT_DIR + "/01-after-login.png", fullPage: true });
    console.log("01 - Login screenshot captured");
  });

  test("02 - Navigate to measurement scan page", async ({ page, request }) => {
    await loginAndNavigate(page, request, "/client/dashboard/measurements/scan");
    await page.screenshot({ path: SCREENSHOT_DIR + "/02-scan-page.png", fullPage: true });

    // Check for the scan page heading
    const heading = page.locator("h1").filter({ hasText: "30-Second Body Scan" });
    await expect(heading).toBeVisible({ timeout: 60_000 });
    console.log("02 - Scan page heading verified");
  });

  test("03 - Verify idle state renders correctly", async ({ page, request }) => {
    await loginAndNavigate(page, request, "/client/dashboard/measurements/scan");

    const startButton = page.getByText("Start AI Scan");
    await expect(startButton).toBeVisible({ timeout: 60_000 });
    await page.screenshot({ path: SCREENSHOT_DIR + "/03-idle-state.png", fullPage: true });
    console.log("03 - Idle state verified");
  });

  test("04 - Click Start AI Scan and capture loading state", async ({ page, request }) => {
    await loginAndNavigate(page, request, "/client/dashboard/measurements/scan");

    const consoleErrors: string[] = [];
    page.on("pageerror", (error) => {
      consoleErrors.push("PAGE ERROR: " + error.message);
    });
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleErrors.push("CONSOLE ERROR: " + msg.text());
      }
    });

    const startButton = page.getByText("Start AI Scan");
    await expect(startButton).toBeVisible({ timeout: 60_000 });
    await startButton.click();

    await page.waitForTimeout(5000);
    await page.screenshot({ path: SCREENSHOT_DIR + "/04-after-start.png", fullPage: true });

    if (consoleErrors.length > 0) {
      console.log("Console errors during scan start:", consoleErrors);
    }
    console.log("04 - After start screenshot captured");
  });

  test("05 - Navigate to get-measured landing page", async ({ page }) => {
    await page.goto("/get-measured", { waitUntil: "commit", timeout: 120_000 });
    await page.waitForTimeout(5000);
    await page.screenshot({ path: SCREENSHOT_DIR + "/05-get-measured.png", fullPage: true });
    await expect(page).toHaveURL(/\/get-measured/);
    console.log("05 - Get-measured page verified");
  });

  test("06 - Navigate to measurements dashboard", async ({ page, request }) => {
    await loginAndNavigate(page, request, "/client/dashboard/measurements");
    await page.screenshot({ path: SCREENSHOT_DIR + "/06-measurements-dashboard.png", fullPage: true });
    console.log("06 - Measurements dashboard screenshot captured");
  });
});
