# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: standalone-measurement-test.spec.ts >> Measurement Scan E2E >> 02 - Navigate to measurement scan page
- Location: e2e\standalone-measurement-test.spec.ts:81:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('h1').filter({ hasText: '30-Second Body Scan' })
Expected: visible
Timeout: 60000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 60000ms
  - waiting for locator('h1').filter({ hasText: '30-Second Body Scan' })

```

```yaml
- link "Skip to main content":
  - /url: "#main-content"
- status "Loading Fashionistar AI":
  - paragraph: FASHIONISTAR
  - paragraph: AI Precision • Perfect Fit • Seamless Fashion Commerce
- region "Notifications alt+T"
```

# Test source

```ts
  1   | /**
  2   |  * standalone-measurement-test.ts
  3   |  * Standalone Playwright test — no global setup dependency.
  4   |  * Runs directly against localhost:3000 + localhost:8001.
  5   |  */
  6   | import { test, expect, type Page, type APIRequestContext } from "@playwright/test";
  7   | 
  8   | const SCREENSHOT_DIR = "test-screenshots/measurement";
  9   | const API_BASE = "http://127.0.0.1:8001";
  10  | 
  11  | const TEST_USER = {
  12  |   email: "client@fashionistar.test",
  13  |   password: "Client@Secure99!",
  14  | };
  15  | 
  16  | async function loginAndNavigate(page: Page, request: APIRequestContext, targetPath: string) {
  17  |   const loginRes = await request.post(API_BASE + "/api/v1/auth/login/", {
  18  |     data: {
  19  |       email_or_phone: TEST_USER.email,
  20  |       password: TEST_USER.password,
  21  |     },
  22  |     headers: {
  23  |       "Content-Type": "application/json",
  24  |       "ngrok-skip-browser-warning": "true",
  25  |     },
  26  |     timeout: 60_000,
  27  |   });
  28  | 
  29  |   expect(loginRes.ok(), "Login API should return 200, got " + loginRes.status()).toBeTruthy();
  30  |   const body = await loginRes.json();
  31  | 
  32  |   const payload = body.data ?? body;
  33  |   const accessToken: string = payload.access;
  34  |   const refreshToken: string = payload.refresh;
  35  |   const user = {
  36  |     id: payload.user_id,
  37  |     email: TEST_USER.email,
  38  |     role: payload.role,
  39  |     is_verified: true,
  40  |     is_staff: payload.role === "admin" || payload.role === "staff",
  41  |     first_name: payload.first_name ?? "",
  42  |     last_name: payload.last_name ?? "",
  43  |   };
  44  | 
  45  |   expect(accessToken, "Access token should be present").toBeTruthy();
  46  | 
  47  |   await page.addInitScript((authData) => {
  48  |     const authState = {
  49  |       state: {
  50  |         accessToken: authData.accessToken,
  51  |         refreshToken: authData.refreshToken,
  52  |         isAuthenticated: true,
  53  |         user: authData.user,
  54  |         isLoading: false,
  55  |         pendingOTPEmail: undefined,
  56  |         pendingOTPPhone: undefined,
  57  |         lastLoginAt: Date.now(),
  58  |       },
  59  |       version: 0,
  60  |     };
  61  |     sessionStorage.setItem("fashionistar-auth", JSON.stringify(authState));
  62  |     sessionStorage.setItem("fashionistar_access_token", authData.accessToken);
  63  |     if (authData.refreshToken) {
  64  |       sessionStorage.setItem("fashionistar_refresh_token", authData.refreshToken);
  65  |     }
  66  |   }, { accessToken, refreshToken, user });
  67  | 
  68  |   await page.goto(targetPath, { waitUntil: "commit", timeout: 120_000 });
  69  |   await page.waitForTimeout(5000);
  70  | }
  71  | 
  72  | test.describe("Measurement Scan E2E", () => {
  73  |   test.setTimeout(300_000);
  74  | 
  75  |   test("01 - Login via API and verify authenticated", async ({ page, request }) => {
  76  |     await loginAndNavigate(page, request, "/");
  77  |     await page.screenshot({ path: SCREENSHOT_DIR + "/01-after-login.png", fullPage: true });
  78  |     console.log("01 - Login screenshot captured");
  79  |   });
  80  | 
  81  |   test("02 - Navigate to measurement scan page", async ({ page, request }) => {
  82  |     await loginAndNavigate(page, request, "/client/dashboard/measurements/scan");
  83  |     await page.screenshot({ path: SCREENSHOT_DIR + "/02-scan-page.png", fullPage: true });
  84  | 
  85  |     // Check for the scan page heading
  86  |     const heading = page.locator("h1").filter({ hasText: "30-Second Body Scan" });
> 87  |     await expect(heading).toBeVisible({ timeout: 60_000 });
      |                           ^ Error: expect(locator).toBeVisible() failed
  88  |     console.log("02 - Scan page heading verified");
  89  |   });
  90  | 
  91  |   test("03 - Verify idle state renders correctly", async ({ page, request }) => {
  92  |     await loginAndNavigate(page, request, "/client/dashboard/measurements/scan");
  93  | 
  94  |     const startButton = page.getByText("Start AI Scan");
  95  |     await expect(startButton).toBeVisible({ timeout: 60_000 });
  96  |     await page.screenshot({ path: SCREENSHOT_DIR + "/03-idle-state.png", fullPage: true });
  97  |     console.log("03 - Idle state verified");
  98  |   });
  99  | 
  100 |   test("04 - Click Start AI Scan and capture loading state", async ({ page, request }) => {
  101 |     await loginAndNavigate(page, request, "/client/dashboard/measurements/scan");
  102 | 
  103 |     const consoleErrors: string[] = [];
  104 |     page.on("pageerror", (error) => {
  105 |       consoleErrors.push("PAGE ERROR: " + error.message);
  106 |     });
  107 |     page.on("console", (msg) => {
  108 |       if (msg.type() === "error") {
  109 |         consoleErrors.push("CONSOLE ERROR: " + msg.text());
  110 |       }
  111 |     });
  112 | 
  113 |     const startButton = page.getByText("Start AI Scan");
  114 |     await expect(startButton).toBeVisible({ timeout: 60_000 });
  115 |     await startButton.click();
  116 | 
  117 |     await page.waitForTimeout(5000);
  118 |     await page.screenshot({ path: SCREENSHOT_DIR + "/04-after-start.png", fullPage: true });
  119 | 
  120 |     if (consoleErrors.length > 0) {
  121 |       console.log("Console errors during scan start:", consoleErrors);
  122 |     }
  123 |     console.log("04 - After start screenshot captured");
  124 |   });
  125 | 
  126 |   test("05 - Navigate to get-measured landing page", async ({ page }) => {
  127 |     await page.goto("/get-measured", { waitUntil: "commit", timeout: 120_000 });
  128 |     await page.waitForTimeout(5000);
  129 |     await page.screenshot({ path: SCREENSHOT_DIR + "/05-get-measured.png", fullPage: true });
  130 |     await expect(page).toHaveURL(/\/get-measured/);
  131 |     console.log("05 - Get-measured page verified");
  132 |   });
  133 | 
  134 |   test("06 - Navigate to measurements dashboard", async ({ page, request }) => {
  135 |     await loginAndNavigate(page, request, "/client/dashboard/measurements");
  136 |     await page.screenshot({ path: SCREENSHOT_DIR + "/06-measurements-dashboard.png", fullPage: true });
  137 |     console.log("06 - Measurements dashboard screenshot captured");
  138 |   });
  139 | });
  140 | 
```