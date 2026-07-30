# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: measurement_scan.spec.ts >> Measurement Scan E2E >> 06 - Navigate to get-measured landing page
- Location: e2e\measurement_scan.spec.ts:268:3

# Error details

```
TimeoutError: page.goto: Timeout 120000ms exceeded.
Call log:
  - navigating to "http://localhost:3000/get-measured", waiting until "domcontentloaded"

```

# Test source

```ts
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
> 269 |     await page.goto("/get-measured", { waitUntil: "domcontentloaded", timeout: 120_000 });
      |                ^ TimeoutError: page.goto: Timeout 120000ms exceeded.
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
  304 |     await loginAndNavigate(
  305 |       page,
  306 |       request,
  307 |       `/client/dashboard/measurements/scan/${TEST_SESSION_ID}`,
  308 |       { injectEntryData: true },
  309 |     );
  310 | 
  311 |     await page.waitForSelector("text=Start AI Scan", { timeout: 120_000 });
  312 | 
  313 |     const { networkErrors } = collectErrors(page);
  314 | 
  315 |     // Click Start AI Scan to trigger camera capture
  316 |     await page.getByRole("button", { name: "Start AI Scan" }).click();
  317 |     await page.waitForTimeout(5000);
  318 | 
  319 |     await page.screenshot({ path: `${SCREENSHOT_DIR}/09-after-click.png`, fullPage: true });
  320 | 
  321 |     // Assert no 404/403 errors on scan-related API or WebSocket endpoints
  322 |     expect(
  323 |       networkErrors,
  324 |       `Should not have 404/403 errors on scan endpoints. Found: ${networkErrors.join(", ")}`,
  325 |     ).toHaveLength(0);
  326 |   });
  327 | 
  328 |   test("10 - Verify measurement list and requirements on active scan page", async ({ page, request }) => {
  329 |     await loginAndNavigate(
  330 |       page,
  331 |       request,
  332 |       `/client/dashboard/measurements/scan/${TEST_SESSION_ID}`,
  333 |       { injectEntryData: true },
  334 |     );
  335 | 
  336 |     await page.waitForSelector("text=AI Body Scan", { timeout: 120_000 });
  337 | 
  338 |     // Verify measurement list section
  339 |     await expect(page.getByText("What We Measure")).toBeVisible();
  340 |     await expect(page.getByText("Bust")).toBeVisible();
  341 |     await expect(page.getByText("Waist")).toBeVisible();
  342 |     await expect(page.getByText("Hips")).toBeVisible();
  343 |     await expect(page.getByText("Shoulder Width")).toBeVisible();
  344 | 
  345 |     // Verify requirements section
  346 |     await expect(page.getByText("Before You Start")).toBeVisible();
  347 |     await expect(page.getByText("Wear fitted clothing")).toBeVisible();
  348 | 
  349 |     await page.screenshot({ path: `${SCREENSHOT_DIR}/10-measurement-details.png`, fullPage: true });
  350 |   });
  351 | });
  352 | 
```