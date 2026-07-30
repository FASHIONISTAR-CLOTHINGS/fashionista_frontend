# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: measurement_scan.spec.ts >> Measurement Scan E2E >> 07 - Navigate to measurements dashboard
- Location: e2e\measurement_scan.spec.ts:227:3

# Error details

```
Error: Login API should return 200, got 400

expect(received).toBeTruthy()

Received: false
```

# Test source

```ts
  1   | /**
  2   |  * @file measurement_scan.spec.ts
  3   |  * @description E2E test for the AI body measurement scan flow.
  4   |  *
  5   |  * Flow:
  6   |  *   1. Login via API, inject tokens into browser sessionStorage
  7   |  *   2. Navigate to /client/dashboard/measurements/scan
  8   |  *   3. Verify intro state renders (AI Body Scan heading, Start AI Scan button)
  9   |  *   4. Click "Start AI Scan" → verify camera capture UI (Start Body Scan button)
  10  |  *   5. Assert no 404 errors from scan status endpoint
  11  |  *   6. Assert no 403 errors from WebSocket connection
  12  |  *   7. Navigate to /get-measured landing page
  13  |  *   8. Navigate to measurements dashboard
  14  |  *
  15  |  * Screenshots saved to: test-screenshots/measurement/
  16  |  */
  17  | 
  18  | import { test, expect, type Page, type APIRequestContext } from "@playwright/test";
  19  | 
  20  | const SCREENSHOT_DIR = "test-screenshots/measurement";
  21  | const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://127.0.0.1:8001";
  22  | 
  23  | const TEST_USER = {
  24  |   email: "client@fashionistar.test",
  25  |   password: "Client@Secure99!",
  26  | };
  27  | 
  28  | /**
  29  |  * Login via the backend API directly and inject auth tokens into
  30  |  * the browser's sessionStorage before the page's JS hydrates.
  31  |  *
  32  |  * The auth state is stored under the "fashionistar-auth" key in the
  33  |  * Zustand persist envelope format, matching the auth-session.client.ts
  34  |  * readStoredAuthState() function.
  35  |  */
  36  | async function loginAndNavigate(
  37  |   page: Page,
  38  |   request: APIRequestContext,
  39  |   targetPath: string,
  40  | ): Promise<void> {
  41  |   // 1. Login via API
  42  |   const loginRes = await request.post(API_BASE + "/api/v1/auth/login/", {
  43  |     data: {
  44  |       email_or_phone: TEST_USER.email,
  45  |       password: TEST_USER.password,
  46  |     },
  47  |     headers: {
  48  |       "Content-Type": "application/json",
  49  |       "ngrok-skip-browser-warning": "true",
  50  |     },
  51  |   });
  52  | 
> 53  |   expect(loginRes.ok(), `Login API should return 200, got ${loginRes.status()}`).toBeTruthy();
      |                                                                                  ^ Error: Login API should return 200, got 400
  54  |   const body = await loginRes.json();
  55  | 
  56  |   const payload = body.data ?? body;
  57  |   const accessToken: string = payload.access;
  58  |   const refreshToken: string = payload.refresh;
  59  |   const user = {
  60  |     id: payload.user_id,
  61  |     email: TEST_USER.email,
  62  |     role: payload.role,
  63  |     is_verified: true,
  64  |     is_staff: payload.role === "admin" || payload.role === "staff",
  65  |     first_name: payload.first_name ?? "",
  66  |     last_name: payload.last_name ?? "",
  67  |   };
  68  | 
  69  |   expect(accessToken, "Access token should be present").toBeTruthy();
  70  | 
  71  |   // 2. Inject sessionStorage BEFORE the page loads via addInitScript
  72  |   // This runs before any page JS, so Zustand will pick up the auth state on hydration
  73  |   await page.addInitScript(
  74  |     (authData) => {
  75  |       const authState = {
  76  |         state: {
  77  |           accessToken: authData.accessToken,
  78  |           refreshToken: authData.refreshToken,
  79  |           isAuthenticated: true,
  80  |           user: authData.user,
  81  |           isLoading: false,
  82  |           pendingOTPEmail: undefined,
  83  |           pendingOTPPhone: undefined,
  84  |           lastLoginAt: Date.now(),
  85  |         },
  86  |         version: 0,
  87  |       };
  88  |       sessionStorage.setItem("fashionistar-auth", JSON.stringify(authState));
  89  |     },
  90  |     { accessToken, refreshToken, user },
  91  |   );
  92  | 
  93  |   // 3. Navigate to the target page — addInitScript runs before page JS
  94  |   // Use "networkidle" to wait for the dev server to finish compiling and loading
  95  |   await page.goto(targetPath, { waitUntil: "networkidle", timeout: 120_000 });
  96  |   // Wait for hydration and any loading screen to clear
  97  |   await page.waitForTimeout(8000);
  98  | }
  99  | 
  100 | /**
  101 |  * Collect console errors and network failures (404/403) for assertions.
  102 |  */
  103 | function collectErrors(page: Page) {
  104 |   const consoleErrors: string[] = [];
  105 |   const networkErrors: string[] = [];
  106 | 
  107 |   page.on("pageerror", (error) => {
  108 |     consoleErrors.push(`PAGE ERROR: ${error.message}`);
  109 |   });
  110 |   page.on("console", (msg) => {
  111 |     if (msg.type() === "error") {
  112 |       // Ignore Google OAuth origin errors (unrelated to our code)
  113 |       const text = msg.text();
  114 |       if (!text.includes("GSI_LOGGER") && !text.includes("accounts.google.com")) {
  115 |         consoleErrors.push(`CONSOLE ERROR: ${text}`);
  116 |       }
  117 |     }
  118 |   });
  119 |   page.on("response", (response) => {
  120 |     const url = response.url();
  121 |     const status = response.status();
  122 | 
  123 |     // Only track scan-related endpoints (not Google OAuth, static assets, etc.)
  124 |     if (
  125 |       (url.includes("/api/v1/ninja/") || url.includes("/ws/scan/")) &&
  126 |       (status === 404 || status === 403)
  127 |     ) {
  128 |       networkErrors.push(`${status} on ${url}`);
  129 |     }
  130 |   });
  131 | 
  132 |   return { consoleErrors, networkErrors };
  133 | }
  134 | 
  135 | // ─── Tests ────────────────────────────────────────────────────────────────────
  136 | 
  137 | test.describe("Measurement Scan E2E", () => {
  138 |   test.setTimeout(180_000);
  139 | 
  140 |   test("01 - Login via API and verify authenticated", async ({ page, request }) => {
  141 |     await loginAndNavigate(page, request, "/");
  142 |     await page.screenshot({ path: `${SCREENSHOT_DIR}/01-after-login.png`, fullPage: true });
  143 |     // Verify we're not redirected to sign-in
  144 |     await expect(page).not.toHaveURL(/\/auth\/sign-in/);
  145 |   });
  146 | 
  147 |   test("02 - Navigate to measurement scan page and verify intro", async ({ page, request }) => {
  148 |     await loginAndNavigate(page, request, "/client/dashboard/measurements/scan");
  149 |     await page.screenshot({ path: `${SCREENSHOT_DIR}/02-scan-page.png`, fullPage: true });
  150 | 
  151 |     // The scan entry page should show the intro card with "AI Body Scan" heading
  152 |     // Wait for the scan page to fully render (dev server may still be compiling)
  153 |     await page.waitForSelector("text=AI Body Scan", { timeout: 120_000 });
```