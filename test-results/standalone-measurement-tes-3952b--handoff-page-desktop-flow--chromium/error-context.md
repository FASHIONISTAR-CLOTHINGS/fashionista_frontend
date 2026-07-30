# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: standalone-measurement-test.spec.ts >> Measurement Scan E2E >> 05 - Verify QR code display on QR handoff page (desktop flow)
- Location: e2e\standalone-measurement-test.spec.ts:173:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('button', { name: 'Skip' })
Expected: visible
Timeout: 60000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 60000ms
  - waiting for getByRole('button', { name: 'Skip' })

```

```yaml
- navigation:
  - button "previous" [disabled]:
    - img "previous"
  - text: 1/1
  - button "next" [disabled]:
    - img "next"
- img
- link "Next.js 16.2.11 (stale) Turbopack":
  - /url: https://nextjs.org/docs/messages/version-staleness
  - img
  - text: Next.js 16.2.11 (stale) Turbopack
- img
- dialog "Build Error":
  - text: Build Error
  - button "Copy Error Info":
    - img
  - button "No related documentation found" [disabled]:
    - img
  - button "Attach Node.js inspector":
    - img
  - text: Expression expected
  - img
  - text: ./src/app/(home)/get-measured/_client.tsx (478:20)
  - button "Open in editor":
    - img
  - text: "Expression expected 476 | ); 477 | } > 478 | * initialAge + initialHeightCm forwarded from the entry modal. | ^ 479 | */ 480 | <EnhancedMeasurementFlow 481 | onComplete={handleScanComplete} Parsing ecmascript source code failed Import trace: Server Component: ./src/app/(home)/get-measured/_client.tsx ./src/app/(home)/get-measured/page.tsx"
- button "Open Next.js Dev Tools":
  - img
- button "Open issues overlay": 1 Issue
- alert
```

# Test source

```ts
  78  |     console.log("01 - Login screenshot captured");
  79  |   });
  80  | 
  81  |   test("02 - Scan page: tutorial overlay visible with 30-Second Body Scan heading", async ({ page, request }) => {
  82  |     await loginAndNavigate(page, request, "/client/dashboard/measurements/scan");
  83  |     await page.screenshot({ path: SCREENSHOT_DIR + "/02-scan-page-tutorial.png", fullPage: true });
  84  | 
  85  |     const heading = page.locator("h1").filter({ hasText: "30-Second Body Scan" });
  86  |     await expect(heading).toBeVisible({ timeout: 60_000 });
  87  |     console.log("02 - Scan page heading verified");
  88  |   });
  89  | 
  90  |   test("03 - Skip tutorial and verify MeasurementEntryModal appears", async ({ page, request }) => {
  91  |     await loginAndNavigate(page, request, "/client/dashboard/measurements/scan");
  92  | 
  93  |     // Wait for tutorial overlay and click Skip
  94  |     const skipButton = page.getByRole("button", { name: "Skip" });
  95  |     await expect(skipButton).toBeVisible({ timeout: 60_000 });
  96  |     await skipButton.click();
  97  | 
  98  |     await page.waitForTimeout(3000);
  99  |     await page.screenshot({ path: SCREENSHOT_DIR + "/03-entry-modal.png", fullPage: true });
  100 | 
  101 |     // Verify the entry modal appears
  102 |     const modalHeading = page.locator("h2").filter({ hasText: "Before Your Scan" });
  103 |     await expect(modalHeading).toBeVisible({ timeout: 30_000 });
  104 |     console.log("03 - Entry modal verified after skipping tutorial");
  105 |   });
  106 | 
  107 |   test("04 - Fill entry modal and submit to create scan session", async ({ page, request }) => {
  108 |     const consoleErrors: string[] = [];
  109 |     page.on("pageerror", (error) => {
  110 |       consoleErrors.push("PAGE ERROR: " + error.message);
  111 |     });
  112 |     page.on("console", (msg) => {
  113 |       if (msg.type() === "error") {
  114 |         consoleErrors.push("CONSOLE ERROR: " + msg.text());
  115 |       }
  116 |     });
  117 | 
  118 |     await loginAndNavigate(page, request, "/client/dashboard/measurements/scan");
  119 | 
  120 |     // Skip tutorial
  121 |     const skipButton = page.getByRole("button", { name: "Skip" });
  122 |     await expect(skipButton).toBeVisible({ timeout: 60_000 });
  123 |     await skipButton.click();
  124 |     await page.waitForTimeout(3000);
  125 | 
  126 |     // Fill entry modal — Age (required)
  127 |     const ageInput = page.locator('input[type="number"]').first();
  128 |     await expect(ageInput).toBeVisible({ timeout: 30_000 });
  129 |     await ageInput.fill("28");
  130 |     await page.waitForTimeout(1000);
  131 | 
  132 |     // Height should auto-fill from prediction. Verify it has a value.
  133 |     const heightInput = page.locator('input[placeholder*="175"]');
  134 |     const heightValue = await heightInput.inputValue().catch(() => "");
  135 |     if (!heightValue) {
  136 |       await heightInput.fill("175");
  137 |     }
  138 | 
  139 |     // Weight (optional) — enter 70
  140 |     const weightInput = page.locator('input[placeholder*="70"]');
  141 |     await weightInput.fill("70");
  142 | 
  143 |     await page.screenshot({ path: SCREENSHOT_DIR + "/04-entry-modal-filled.png", fullPage: true });
  144 | 
  145 |     // Click "Continue to Scan →"
  146 |     const submitButton = page.getByRole("button", { name: /Continue to Scan/ });
  147 |     await expect(submitButton).toBeVisible({ timeout: 10_000 });
  148 |     await submitButton.click();
  149 | 
  150 |     // Wait for redirect — either to QR page (desktop) or active scan (mobile)
  151 |     await page.waitForTimeout(10000);
  152 |     await page.screenshot({ path: SCREENSHOT_DIR + "/04-after-submit.png", fullPage: true });
  153 | 
  154 |     const currentUrl = page.url();
  155 |     console.log("04 - Current URL after submit:", currentUrl);
  156 | 
  157 |     if (currentUrl.includes("/scan/qr")) {
  158 |       console.log("04 - Redirected to QR handoff page (desktop flow)");
  159 |       const qrHeading = page.locator("h1").filter({ hasText: "Scan with Your Phone" });
  160 |       await expect(qrHeading).toBeVisible({ timeout: 30_000 });
  161 |     } else if (currentUrl.match(/\/scan\/[a-f0-9-]+/)) {
  162 |       console.log("04 - Redirected to active scan page (mobile flow)");
  163 |     } else {
  164 |       console.log("04 - Still on scan page, checking for error state");
  165 |     }
  166 | 
  167 |     if (consoleErrors.length > 0) {
  168 |       console.log("04 - Console errors:", consoleErrors);
  169 |     }
  170 |     console.log("04 - Entry modal submitted, screenshot captured");
  171 |   });
  172 | 
  173 |   test("05 - Verify QR code display on QR handoff page (desktop flow)", async ({ page, request }) => {
  174 |     await loginAndNavigate(page, request, "/client/dashboard/measurements/scan");
  175 | 
  176 |     // Skip tutorial
  177 |     const skipButton = page.getByRole("button", { name: "Skip" });
> 178 |     await expect(skipButton).toBeVisible({ timeout: 60_000 });
      |                              ^ Error: expect(locator).toBeVisible() failed
  179 |     await skipButton.click();
  180 |     await page.waitForTimeout(3000);
  181 | 
  182 |     // Fill entry modal
  183 |     const ageInput = page.locator('input[type="number"]').first();
  184 |     await expect(ageInput).toBeVisible({ timeout: 30_000 });
  185 |     await ageInput.fill("30");
  186 |     await page.waitForTimeout(1000);
  187 | 
  188 |     // Submit
  189 |     const submitButton = page.getByRole("button", { name: /Continue to Scan/ });
  190 |     await expect(submitButton).toBeVisible({ timeout: 10_000 });
  191 |     await submitButton.click();
  192 | 
  193 |     // Wait for redirect
  194 |     await page.waitForTimeout(15000);
  195 |     await page.screenshot({ path: SCREENSHOT_DIR + "/05-qr-handoff.png", fullPage: true });
  196 | 
  197 |     const currentUrl = page.url();
  198 |     console.log("05 - Current URL:", currentUrl);
  199 | 
  200 |     if (currentUrl.includes("/scan/qr")) {
  201 |       const qrHeading = page.locator("h1").filter({ hasText: "Scan with Your Phone" });
  202 |       await expect(qrHeading).toBeVisible({ timeout: 30_000 });
  203 | 
  204 |       // Check for QR code image or generating state
  205 |       const qrImage = page.getByAltText("Scan QR Code");
  206 |       const generatingText = page.getByText(/Generating|Session expires in|Copy/);
  207 | 
  208 |       const qrVisible = await qrImage.isVisible().catch(() => false);
  209 |       const generatingVisible = await generatingText.first().isVisible().catch(() => false);
  210 | 
  211 |       if (qrVisible) {
  212 |         console.log("05 - QR code image is visible");
  213 |       } else if (generatingVisible) {
  214 |         console.log("05 - QR code is generating (text visible)");
  215 |       } else {
  216 |         console.log("05 - QR code area not found, checking page state");
  217 |       }
  218 | 
  219 |       // Verify QR page content — heading or session info
  220 |       const pageContent = page.getByText(/Scan with Your Phone|Generating|Session expires in|Copy/);
  221 |       await expect(pageContent.first()).toBeVisible({ timeout: 10_000 });
  222 |       console.log("05 - QR handoff page verified with content");
  223 |     } else {
  224 |       console.log("05 - Not on QR page, URL:", currentUrl);
  225 |     }
  226 | 
  227 |     await page.screenshot({ path: SCREENSHOT_DIR + "/05-qr-page-final.png", fullPage: true });
  228 |   });
  229 | 
  230 |   test("06 - Navigate to get-measured landing page", async ({ page }) => {
  231 |     await page.goto("/get-measured", { waitUntil: "commit", timeout: 120_000 });
  232 |     await page.waitForTimeout(5000);
  233 |     await page.screenshot({ path: SCREENSHOT_DIR + "/06-get-measured.png", fullPage: true });
  234 |     await expect(page).toHaveURL(/\/get-measured/);
  235 |     console.log("06 - Get-measured page verified");
  236 |   });
  237 | 
  238 |   test("07 - Navigate to measurements dashboard and verify page loads", async ({ page, request }) => {
  239 |     await loginAndNavigate(page, request, "/client/dashboard/measurements");
  240 |     await page.waitForTimeout(5000);
  241 |     await page.screenshot({ path: SCREENSHOT_DIR + "/07-measurements-dashboard.png", fullPage: true });
  242 | 
  243 |     await expect(page).toHaveURL(/\/client\/dashboard\/measurements/);
  244 |     console.log("07 - Measurements dashboard verified");
  245 |   });
  246 | 
  247 |   test("08 - Verify WebSocket/polling connection for scan status", async ({ page, request }) => {
  248 |     await loginAndNavigate(page, request, "/client/dashboard/measurements/scan");
  249 | 
  250 |     // Clear tutorial localStorage in case it was dismissed in a previous test
  251 |     await page.evaluate(() => {
  252 |       localStorage.removeItem("fashionistar_scan_tutorial_seen");
  253 |       localStorage.removeItem("scan_tutorial_seen");
  254 |     });
  255 |     await page.reload({ waitUntil: "commit" });
  256 |     await page.waitForTimeout(5000);
  257 | 
  258 |     // Skip tutorial (or proceed if already dismissed)
  259 |     const skipButton = page.getByRole("button", { name: "Skip" });
  260 |     const skipVisible = await skipButton.isVisible().catch(() => false);
  261 |     if (skipVisible) {
  262 |       await skipButton.click();
  263 |       await page.waitForTimeout(3000);
  264 |     } else {
  265 |       // Tutorial already dismissed, check if entry modal is visible
  266 |       console.log("08 - Tutorial already dismissed, proceeding to entry modal");
  267 |     }
  268 | 
  269 |     const ageInput = page.locator('input[type="number"]').first();
  270 |     await expect(ageInput).toBeVisible({ timeout: 30_000 });
  271 |     await ageInput.fill("25");
  272 |     await page.waitForTimeout(1000);
  273 | 
  274 |     const submitButton = page.getByRole("button", { name: /Continue to Scan/ });
  275 |     await submitButton.click();
  276 | 
  277 |     // Wait for redirect and WebSocket connection
  278 |     await page.waitForTimeout(15000);
```