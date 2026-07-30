# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: measurement_scan.spec.ts >> Measurement Scan E2E >> 03 - Tutorial Skip button opens entry modal
- Location: e2e\measurement_scan.spec.ts:198:3

# Error details

```
Error: locator.click: Error: strict mode violation: getByText('Skip') resolved to 2 elements:
    1) <a href="#main-content" class="skip-to-main">Skip to main content</a> aka getByRole('link', { name: 'Skip to main content' })
    2) <button class="absolute top-4 right-4 text-white/40 hover:text-white/80 transition text-sm">Skip</button> aka getByRole('button', { name: 'Skip' })

Call log:
  - waiting for getByText('Skip')

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - link "Skip to main content" [ref=e2] [cursor=pointer]:
    - /url: "#main-content"
  - generic [ref=e3]:
    - complementary [ref=e4]:
      - link "Fashionistar Client Portal" [ref=e6] [cursor=pointer]:
        - /url: /client/dashboard
        - generic [ref=e10]:
          - generic [ref=e11]: Fashionistar
          - generic [ref=e12]: Client Portal
      - generic [ref=e13]:
        - generic [ref=e14]:
          - img "Avatar for User" [ref=e16]:
            - generic [ref=e17]: C
          - generic [ref=e18]:
            - paragraph [ref=e19]: client
            - paragraph [ref=e20]: client@fashionistar.test
        - generic [ref=e21]: Profile 40% complete
      - navigation [ref=e26]:
        - generic [ref=e27]:
          - button "Overview" [ref=e28]
          - link "Dashboard" [ref=e33] [cursor=pointer]:
            - /url: /client/dashboard
        - generic [ref=e41]:
          - button "Measurements" [ref=e42]
          - generic [ref=e46]:
            - link "My Measurements" [ref=e47] [cursor=pointer]:
              - /url: /client/dashboard/measurements
            - link "New AI Scan" [ref=e58] [cursor=pointer]:
              - /url: /client/dashboard/measurements/scan
        - button "Shopping" [ref=e66]
        - button "Finance" [ref=e71]
        - button "Account" [ref=e76]
        - button "Support" [ref=e81]
      - button "Sign out" [ref=e86]
    - generic [ref=e91]:
      - banner [ref=e92]:
        - generic [ref=e94]:
          - heading "New AI Scan" [level=1] [ref=e95]
          - paragraph [ref=e96]: Client Dashboard
        - generic [ref=e97]:
          - link "Shop" [ref=e98] [cursor=pointer]:
            - /url: /
          - button "Notifications" [ref=e102]
          - button "Profile menu" [ref=e107]:
            - img "Avatar for User" [ref=e109]:
              - generic [ref=e110]: C
            - generic [ref=e111]: client
      - main [ref=e114]:
        - generic [ref=e116]:
          - generic [ref=e117]:
            - generic [ref=e118]: AI Body Measurement
            - heading "30-Second Body Scan" [level=1] [ref=e121]
            - paragraph [ref=e122]: Stand in front of your camera in fitted clothing. Our in-house AI captures your 14 key measurements automatically.
          - generic [ref=e124]:
            - button "Skip" [ref=e125]
            - generic [ref=e126]: 📱
            - heading "Set Up Your Phone" [level=2] [ref=e127]
            - paragraph [ref=e128]: Prop your phone at chest height, 1.5–2 metres away. Use a stand or lean it against something stable.
            - button "Next" [ref=e134]
          - paragraph [ref=e135]: All measurements are processed on our servers. No video is stored or transmitted — only pose landmark coordinates.
  - region "Notifications alt+T"
  - button "Open Next.js Dev Tools" [ref=e141] [cursor=pointer]
  - alert [ref=e145]
```

# Test source

```ts
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
  133 |   await page.goto(targetPath, { waitUntil: "domcontentloaded", timeout: 120_000 });
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
> 203 |     await page.getByText("Skip").click();
      |                                  ^ Error: locator.click: Error: strict mode violation: getByText('Skip') resolved to 2 elements:
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
  234 |     await page.screenshot({ path: `${SCREENSHOT_DIR}/04-modal-fields.png`, fullPage: true });
  235 |   });
  236 | 
  237 |   test("05 - Fill entry modal and submit triggers redirect", async ({ page, request }) => {
  238 |     await loginAndNavigate(page, request, "/client/dashboard/measurements/scan");
  239 |     await page.waitForSelector("text=30-Second Body Scan", { timeout: 120_000 });
  240 | 
  241 |     // Skip tutorial
  242 |     await page.getByText("Skip").click();
  243 |     await page.waitForTimeout(2000);
  244 | 
  245 |     // Fill age (required to enable submit)
  246 |     await page.getByPlaceholder("e.g. 28").fill("28");
  247 |     await page.waitForTimeout(500);
  248 | 
  249 |     // Fill height
  250 |     await page.getByPlaceholder("e.g. 175").fill("175");
  251 | 
  252 |     // Fill weight
  253 |     await page.getByPlaceholder("e.g. 70").fill("70");
  254 | 
  255 |     await page.screenshot({ path: `${SCREENSHOT_DIR}/05-modal-filled.png`, fullPage: true });
  256 | 
  257 |     // Submit — this calls initiateBodyScan and redirects
  258 |     await page.getByRole("button", { name: "Continue to Scan →" }).click();
  259 | 
  260 |     // Wait for redirect (either QR page or scan session page)
  261 |     await page.waitForTimeout(10000);
  262 |     await page.screenshot({ path: `${SCREENSHOT_DIR}/05-after-submit.png`, fullPage: true });
  263 | 
  264 |     // Should have navigated away from the scan entry page
  265 |     await expect(page).not.toHaveURL(/\/client\/dashboard\/measurements\/scan$/);
  266 |   });
  267 | 
  268 |   test("06 - Navigate to get-measured landing page", async ({ page }) => {
  269 |     await page.goto("/get-measured", { waitUntil: "domcontentloaded", timeout: 120_000 });
  270 |     await page.waitForTimeout(8000);
  271 |     await page.screenshot({ path: `${SCREENSHOT_DIR}/06-get-measured.png`, fullPage: true });
  272 |     await expect(page).toHaveURL(/\/get-measured/);
  273 |   });
  274 | 
  275 |   test("07 - Navigate to measurements dashboard (authenticated)", async ({ page, request }) => {
  276 |     await loginAndNavigate(page, request, "/client/dashboard/measurements");
  277 |     await page.screenshot({ path: `${SCREENSHOT_DIR}/07-measurements-dashboard.png`, fullPage: true });
  278 |     await expect(page).not.toHaveURL(/\/auth\/sign-in/);
  279 |   });
  280 | 
  281 |   test("08 - Active scan page renders AI Body Scan and Start AI Scan button", async ({ page, request }) => {
  282 |     // Inject entry data so ActiveScanClient doesn't redirect back
  283 |     await loginAndNavigate(
  284 |       page,
  285 |       request,
  286 |       `/client/dashboard/measurements/scan/${TEST_SESSION_ID}`,
  287 |       { injectEntryData: true },
  288 |     );
  289 | 
  290 |     // The EnhancedMeasurementFlow should render with "AI Body Scan" heading
  291 |     await page.waitForSelector("text=AI Body Scan", { timeout: 120_000 });
  292 |     await expect(page.getByRole("heading", { name: "AI Body Scan" })).toBeVisible();
  293 |     await expect(page.getByText("30 seconds · 14 measurements · 100% private")).toBeVisible();
  294 | 
  295 |     // "Start AI Scan" button should be visible
  296 |     const startButton = page.getByRole("button", { name: "Start AI Scan" });
  297 |     await expect(startButton).toBeVisible();
  298 |     await expect(startButton).toBeEnabled();
  299 | 
  300 |     await page.screenshot({ path: `${SCREENSHOT_DIR}/08-active-scan-idle.png`, fullPage: true });
  301 |   });
  302 | 
  303 |   test("09 - Click Start AI Scan and verify no 404/403 on scan endpoints", async ({ page, request }) => {
```