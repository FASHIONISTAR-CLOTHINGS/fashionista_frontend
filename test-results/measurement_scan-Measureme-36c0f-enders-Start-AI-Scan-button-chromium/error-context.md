# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: measurement_scan.spec.ts >> Measurement Scan E2E >> 03 - Verify idle state renders Start AI Scan button
- Location: e2e\measurement_scan.spec.ts:158:3

# Error details

```
TimeoutError: page.waitForSelector: Timeout 60000ms exceeded.
Call log:
  - waiting for locator('text=Start AI Scan') to be visible

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - link "Skip to main content" [ref=e2] [cursor=pointer]:
    - /url: "#main-content"
  - status "Loading Fashionistar AI" [ref=e3]:
    - generic [ref=e4]:
      - paragraph [ref=e8]: FASHIONISTAR
      - paragraph [ref=e9]: AI Precision • Perfect Fit • Seamless Fashion Commerce
  - region "Notifications alt+T"
```

# Test source

```ts
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
  94  |   // Use "domcontentloaded" instead of "commit" for more reliable navigation
  95  |   await page.goto(targetPath, { waitUntil: "domcontentloaded", timeout: 120_000 });
  96  |   // Wait for the page to settle and hydrate
  97  |   await page.waitForTimeout(5000);
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
  152 |     await page.waitForSelector("text=AI Body Scan", { timeout: 60_000 });
  153 |     await expect(page.getByText("AI Body Scan")).toBeVisible();
  154 |     // Verify subtitle text
  155 |     await expect(page.getByText("30 seconds · 14 measurements · 100% private")).toBeVisible();
  156 |   });
  157 | 
  158 |   test("03 - Verify idle state renders Start AI Scan button", async ({ page, request }) => {
  159 |     await loginAndNavigate(page, request, "/client/dashboard/measurements/scan");
  160 | 
> 161 |     await page.waitForSelector("text=Start AI Scan", { timeout: 60_000 });
      |                ^ TimeoutError: page.waitForSelector: Timeout 60000ms exceeded.
  162 |     await page.screenshot({ path: `${SCREENSHOT_DIR}/03-idle-state.png`, fullPage: true });
  163 | 
  164 |     const startButton = page.getByRole("button", { name: "Start AI Scan" });
  165 |     await expect(startButton).toBeVisible();
  166 |     await expect(startButton).toBeEnabled();
  167 |   });
  168 | 
  169 |   test("04 - Click Start AI Scan and verify camera capture UI", async ({ page, request }) => {
  170 |     await loginAndNavigate(page, request, "/client/dashboard/measurements/scan");
  171 |     await page.waitForSelector("text=Start AI Scan", { timeout: 60_000 });
  172 | 
  173 |     const { consoleErrors, networkErrors } = collectErrors(page);
  174 | 
  175 |     const startButton = page.getByRole("button", { name: "Start AI Scan" });
  176 |     await startButton.click();
  177 | 
  178 |     // Wait for camera capture UI to render
  179 |     await page.waitForTimeout(3000);
  180 |     await page.screenshot({ path: `${SCREENSHOT_DIR}/04-after-start.png`, fullPage: true });
  181 | 
  182 |     // Verify we're in the scanning phase — look for "Start Body Scan" button
  183 |     // or the height input field that appears in AICameraCapture
  184 |     const bodyScanButton = page.getByRole("button", { name: "Start Body Scan" });
  185 |     const heightInput = page.getByPlaceholder("e.g. 175");
  186 | 
  187 |     // At least one of these should be visible in the camera capture phase
  188 |     const hasBodyScanButton = await bodyScanButton.isVisible().catch(() => false);
  189 |     const hasHeightInput = await heightInput.isVisible().catch(() => false);
  190 | 
  191 |     expect(
  192 |       hasBodyScanButton || hasHeightInput,
  193 |       "Should show either 'Start Body Scan' button or height input in camera capture phase",
  194 |     ).toBeTruthy();
  195 | 
  196 |     // Assert no 404 or 403 errors on scan-related endpoints
  197 |     expect(networkErrors, `Should not have 404/403 errors on scan endpoints: ${networkErrors.join(", ")}`).toHaveLength(0);
  198 |   });
  199 | 
  200 |   test("05 - Verify measurement list and requirements visible", async ({ page, request }) => {
  201 |     await loginAndNavigate(page, request, "/client/dashboard/measurements/scan");
  202 |     await page.waitForSelector("text=AI Body Scan", { timeout: 60_000 });
  203 | 
  204 |     // Verify measurement list items
  205 |     await expect(page.getByText("What We Measure")).toBeVisible();
  206 |     await expect(page.getByText("Bust")).toBeVisible();
  207 |     await expect(page.getByText("Waist")).toBeVisible();
  208 |     await expect(page.getByText("Hips")).toBeVisible();
  209 |     await expect(page.getByText("Shoulder Width")).toBeVisible();
  210 | 
  211 |     // Verify requirements section
  212 |     await expect(page.getByText("Before You Start")).toBeVisible();
  213 |     await expect(page.getByText("Wear fitted clothing")).toBeVisible();
  214 |     await expect(page.getByText("Stand 1.5–2 metres")).toBeVisible();
  215 | 
  216 |     await page.screenshot({ path: `${SCREENSHOT_DIR}/05-measurement-details.png`, fullPage: true });
  217 |   });
  218 | 
  219 |   test("06 - Navigate to get-measured landing page", async ({ page }) => {
  220 |     await page.goto("/get-measured", { waitUntil: "domcontentloaded", timeout: 120_000 });
  221 |     await page.waitForTimeout(5000);
  222 |     await page.screenshot({ path: `${SCREENSHOT_DIR}/06-get-measured.png`, fullPage: true });
  223 |     await expect(page).toHaveURL(/\/get-measured/);
  224 |   });
  225 | 
  226 |   test("07 - Navigate to measurements dashboard", async ({ page, request }) => {
  227 |     await loginAndNavigate(page, request, "/client/dashboard/measurements");
  228 |     await page.screenshot({ path: `${SCREENSHOT_DIR}/07-measurements-dashboard.png`, fullPage: true });
  229 |     await expect(page).not.toHaveURL(/\/auth\/sign-in/);
  230 |   });
  231 | 
  232 |   test("08 - Verify no 404 on scan status endpoint and no 403 on WebSocket", async ({ page, request }) => {
  233 |     await loginAndNavigate(page, request, "/client/dashboard/measurements/scan");
  234 |     await page.waitForSelector("text=Start AI Scan", { timeout: 60_000 });
  235 | 
  236 |     const { networkErrors } = collectErrors(page);
  237 | 
  238 |     // Click Start AI Scan to trigger camera capture (which may initiate WebSocket)
  239 |     await page.getByRole("button", { name: "Start AI Scan" }).click();
  240 |     await page.waitForTimeout(5000);
  241 | 
  242 |     // Assert no 404/403 errors on scan-related API or WebSocket endpoints
  243 |     expect(
  244 |       networkErrors,
  245 |       `Should not have 404/403 errors on scan endpoints. Found: ${networkErrors.join(", ")}`,
  246 |     ).toHaveLength(0);
  247 | 
  248 |     await page.screenshot({ path: `${SCREENSHOT_DIR}/08-no-network-errors.png`, fullPage: true });
  249 |   });
  250 | });
  251 | 
```