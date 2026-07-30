# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: measurement_scan.spec.ts >> Measurement Scan E2E >> 08 - Active scan page renders AI Body Scan and Start AI Scan button
- Location: e2e\measurement_scan.spec.ts:281:3

# Error details

```
TimeoutError: page.goto: Timeout 120000ms exceeded.
Call log:
  - navigating to "http://localhost:3000/client/dashboard/measurements/scan/ca9ef4f4-8330-40ec-a646-c9699d8d9f8c", waiting until "domcontentloaded"

```

# Test source

```ts
  33  |   password: "Client@Secure99!",
  34  | };
  35  | 
  36  | // Test session ID for active scan page tests
  37  | const TEST_SESSION_ID = "ca9ef4f4-8330-40ec-a646-c9699d8d9f8c";
  38  | 
  39  | /**
  40  |  * Login via the backend API directly and inject auth tokens into
  41  |  * the browser's sessionStorage before the page's JS hydrates.
  42  |  *
  43  |  * The auth state is stored under the "fashionistar-auth" key in the
  44  |  * Zustand persist envelope format, matching the auth-session.client.ts
  45  |  * readStoredAuthState() function.
  46  |  */
  47  | async function loginAndNavigate(
  48  |   page: Page,
  49  |   request: APIRequestContext,
  50  |   targetPath: string,
  51  |   options?: { injectEntryData?: boolean },
  52  | ): Promise<void> {
  53  |   // 1. Login via API
  54  |   const loginRes = await request.post(API_BASE + "/api/v1/auth/login/", {
  55  |     data: {
  56  |       email_or_phone: TEST_USER.email,
  57  |       password: TEST_USER.password,
  58  |     },
  59  |     headers: {
  60  |       "Content-Type": "application/json",
  61  |       "ngrok-skip-browser-warning": "true",
  62  |     },
  63  |   });
  64  | 
  65  |   expect(loginRes.ok(), `Login API should return 200, got ${loginRes.status()}`).toBeTruthy();
  66  |   const body = await loginRes.json();
  67  | 
  68  |   const payload = body.data ?? body;
  69  |   const accessToken: string = payload.access;
  70  |   const refreshToken: string = payload.refresh;
  71  |   const user = {
  72  |     id: payload.user_id,
  73  |     email: TEST_USER.email,
  74  |     role: payload.role,
  75  |     is_verified: true,
  76  |     is_staff: payload.role === "admin" || payload.role === "staff",
  77  |     first_name: payload.first_name ?? "",
  78  |     last_name: payload.last_name ?? "",
  79  |   };
  80  | 
  81  |   expect(accessToken, "Access token should be present").toBeTruthy();
  82  | 
  83  |   // 2. Inject sessionStorage BEFORE the page loads via addInitScript
  84  |   await page.addInitScript(
  85  |     (authData) => {
  86  |       // Auth state in Zustand persist envelope format
  87  |       const authState = {
  88  |         state: {
  89  |           accessToken: authData.accessToken,
  90  |           refreshToken: authData.refreshToken,
  91  |           isAuthenticated: true,
  92  |           user: authData.user,
  93  |           isLoading: false,
  94  |           pendingOTPEmail: undefined,
  95  |           pendingOTPPhone: undefined,
  96  |           lastLoginAt: Date.now(),
  97  |         },
  98  |         version: 0,
  99  |       };
  100 |       sessionStorage.setItem("fashionistar-auth", JSON.stringify(authState));
  101 | 
  102 |       // Optionally inject measurement entry data for active scan page
  103 |       if (authData.entryData) {
  104 |         sessionStorage.setItem("fashionistar_measurement_entry", JSON.stringify(authData.entryData));
  105 |       }
  106 | 
  107 |       // Skip tutorial for tests that don't specifically test it
  108 |       if (authData.skipTutorial) {
  109 |         localStorage.setItem("fashionistar_tutorial_seen", "true");
  110 |       }
  111 |     },
  112 |     {
  113 |       accessToken,
  114 |       refreshToken,
  115 |       user,
  116 |       skipTutorial: options?.injectEntryData ?? false,
  117 |       entryData: options?.injectEntryData
  118 |         ? {
  119 |             age: 28,
  120 |             sex: "neutral",
  121 |             heightCm: 175,
  122 |             weightKg: 70,
  123 |             sessionId: TEST_SESSION_ID,
  124 |             deviceType: "desktop",
  125 |             timestamp: Date.now(),
  126 |           }
  127 |         : null,
  128 |     },
  129 |   );
  130 | 
  131 |   // 3. Navigate to the target page
  132 |   // Use "domcontentloaded" — "networkidle" times out due to HMR WebSocket / polling
> 133 |   await page.goto(targetPath, { waitUntil: "domcontentloaded", timeout: 120_000 });
      |              ^ TimeoutError: page.goto: Timeout 120000ms exceeded.
  134 |   // Wait for hydration and dev server compilation to finish
  135 |   await page.waitForTimeout(8000);
  136 | }
  137 | 
  138 | /**
  139 |  * Collect console errors and network failures (404/403) for assertions.
  140 |  */
  141 | function collectErrors(page: Page) {
  142 |   const consoleErrors: string[] = [];
  143 |   const networkErrors: string[] = [];
  144 | 
  145 |   page.on("pageerror", (error) => {
  146 |     consoleErrors.push(`PAGE ERROR: ${error.message}`);
  147 |   });
  148 |   page.on("console", (msg) => {
  149 |     if (msg.type() === "error") {
  150 |       const text = msg.text();
  151 |       // Ignore Google OAuth origin errors and browser extension noise
  152 |       if (!text.includes("GSI_LOGGER") && !text.includes("accounts.google.com")) {
  153 |         consoleErrors.push(`CONSOLE ERROR: ${text}`);
  154 |       }
  155 |     }
  156 |   });
  157 |   page.on("response", (response) => {
  158 |     const url = response.url();
  159 |     const status = response.status();
  160 | 
  161 |     // Only track scan-related endpoints
  162 |     if (
  163 |       (url.includes("/api/v1/ninja/") || url.includes("/ws/scan/")) &&
  164 |       (status === 404 || status === 403)
  165 |     ) {
  166 |       networkErrors.push(`${status} on ${url}`);
  167 |     }
  168 |   });
  169 | 
  170 |   return { consoleErrors, networkErrors };
  171 | }
  172 | 
  173 | // ─── Tests ────────────────────────────────────────────────────────────────────
  174 | 
  175 | test.describe("Measurement Scan E2E", () => {
  176 |   test.setTimeout(300_000);
  177 | 
  178 |   test("01 - Login via API and verify authenticated", async ({ page, request }) => {
  179 |     await loginAndNavigate(page, request, "/");
  180 |     await page.screenshot({ path: `${SCREENSHOT_DIR}/01-after-login.png`, fullPage: true });
  181 |     await expect(page).not.toHaveURL(/\/auth\/sign-in/);
  182 |   });
  183 | 
  184 |   test("02 - Scan entry page renders header and tutorial", async ({ page, request }) => {
  185 |     await loginAndNavigate(page, request, "/client/dashboard/measurements/scan");
  186 |     await page.screenshot({ path: `${SCREENSHOT_DIR}/02-scan-entry.png`, fullPage: true });
  187 | 
  188 |     // Verify page header
  189 |     await page.waitForSelector("text=30-Second Body Scan", { timeout: 120_000 });
  190 |     await expect(page.getByRole("heading", { name: "30-Second Body Scan" })).toBeVisible();
  191 |     await expect(page.getByText("AI Body Measurement")).toBeVisible();
  192 | 
  193 |     // Tutorial overlay should be visible (first slide: "Set Up Your Phone")
  194 |     await expect(page.getByRole("heading", { name: "Set Up Your Phone" })).toBeVisible();
  195 |     await expect(page.getByText("Skip")).toBeVisible();
  196 |   });
  197 | 
  198 |   test("03 - Tutorial Skip button opens entry modal", async ({ page, request }) => {
  199 |     await loginAndNavigate(page, request, "/client/dashboard/measurements/scan");
  200 |     await page.waitForSelector("text=30-Second Body Scan", { timeout: 120_000 });
  201 | 
  202 |     // Click Skip to bypass tutorial
  203 |     await page.getByText("Skip").click();
  204 |     await page.waitForTimeout(2000);
  205 | 
  206 |     // Entry modal should appear
  207 |     await expect(page.getByRole("heading", { name: "Before Your Scan" })).toBeVisible();
  208 |     await expect(page.getByText("A few details help our AI")).toBeVisible();
  209 | 
  210 |     await page.screenshot({ path: `${SCREENSHOT_DIR}/03-entry-modal.png`, fullPage: true });
  211 |   });
  212 | 
  213 |   test("04 - Entry modal has age, height, weight inputs and submit button", async ({ page, request }) => {
  214 |     await loginAndNavigate(page, request, "/client/dashboard/measurements/scan");
  215 |     await page.waitForSelector("text=30-Second Body Scan", { timeout: 120_000 });
  216 | 
  217 |     // Skip tutorial
  218 |     await page.getByText("Skip").click();
  219 |     await page.waitForTimeout(2000);
  220 | 
  221 |     // Verify form fields
  222 |     await expect(page.getByPlaceholder("e.g. 28")).toBeVisible();
  223 |     await expect(page.getByPlaceholder("e.g. 175")).toBeVisible();
  224 |     await expect(page.getByPlaceholder("e.g. 70")).toBeVisible();
  225 | 
  226 |     // Verify sex selector buttons
  227 |     await expect(page.getByRole("button", { name: "Male" })).toBeVisible();
  228 |     await expect(page.getByRole("button", { name: "Female" })).toBeVisible();
  229 |     await expect(page.getByRole("button", { name: "Other" })).toBeVisible();
  230 | 
  231 |     // Verify submit button
  232 |     await expect(page.getByRole("button", { name: "Continue to Scan →" })).toBeVisible();
  233 | 
```