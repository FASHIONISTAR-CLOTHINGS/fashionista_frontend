# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: measurement_scan.spec.ts >> Measurement Scan E2E >> 06 - Navigate to get-measured landing page
- Location: e2e\measurement_scan.spec.ts:220:3

# Error details

```
TimeoutError: page.goto: Timeout 120000ms exceeded.
Call log:
  - navigating to "http://localhost:3000/get-measured", waiting until "networkidle"

```

# Test source

```ts
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
  154 |     await expect(page.getByText("AI Body Scan")).toBeVisible();
  155 |     // Verify subtitle text
  156 |     await expect(page.getByText("30 seconds · 14 measurements · 100% private")).toBeVisible();
  157 |   });
  158 | 
  159 |   test("03 - Verify idle state renders Start AI Scan button", async ({ page, request }) => {
  160 |     await loginAndNavigate(page, request, "/client/dashboard/measurements/scan");
  161 | 
  162 |     await page.waitForSelector("text=Start AI Scan", { timeout: 120_000 });
  163 |     await page.screenshot({ path: `${SCREENSHOT_DIR}/03-idle-state.png`, fullPage: true });
  164 | 
  165 |     const startButton = page.getByRole("button", { name: "Start AI Scan" });
  166 |     await expect(startButton).toBeVisible();
  167 |     await expect(startButton).toBeEnabled();
  168 |   });
  169 | 
  170 |   test("04 - Click Start AI Scan and verify camera capture UI", async ({ page, request }) => {
  171 |     await loginAndNavigate(page, request, "/client/dashboard/measurements/scan");
  172 |     await page.waitForSelector("text=Start AI Scan", { timeout: 120_000 });
  173 | 
  174 |     const { networkErrors } = collectErrors(page);
  175 | 
  176 |     const startButton = page.getByRole("button", { name: "Start AI Scan" });
  177 |     await startButton.click();
  178 | 
  179 |     // Wait for camera capture UI to render
  180 |     await page.waitForTimeout(3000);
  181 |     await page.screenshot({ path: `${SCREENSHOT_DIR}/04-after-start.png`, fullPage: true });
  182 | 
  183 |     // Verify we're in the scanning phase — look for "Start Body Scan" button
  184 |     // or the height input field that appears in AICameraCapture
  185 |     const bodyScanButton = page.getByRole("button", { name: "Start Body Scan" });
  186 |     const heightInput = page.getByPlaceholder("e.g. 175");
  187 | 
  188 |     // At least one of these should be visible in the camera capture phase
  189 |     const hasBodyScanButton = await bodyScanButton.isVisible().catch(() => false);
  190 |     const hasHeightInput = await heightInput.isVisible().catch(() => false);
  191 | 
  192 |     expect(
  193 |       hasBodyScanButton || hasHeightInput,
  194 |       "Should show either 'Start Body Scan' button or height input in camera capture phase",
  195 |     ).toBeTruthy();
  196 | 
  197 |     // Assert no 404 or 403 errors on scan-related endpoints
  198 |     expect(networkErrors, `Should not have 404/403 errors on scan endpoints: ${networkErrors.join(", ")}`).toHaveLength(0);
  199 |   });
  200 | 
  201 |   test("05 - Verify measurement list and requirements visible", async ({ page, request }) => {
  202 |     await loginAndNavigate(page, request, "/client/dashboard/measurements/scan");
  203 |     await page.waitForSelector("text=AI Body Scan", { timeout: 120_000 });
  204 | 
  205 |     // Verify measurement list items
  206 |     await expect(page.getByText("What We Measure")).toBeVisible();
  207 |     await expect(page.getByText("Bust")).toBeVisible();
  208 |     await expect(page.getByText("Waist")).toBeVisible();
  209 |     await expect(page.getByText("Hips")).toBeVisible();
  210 |     await expect(page.getByText("Shoulder Width")).toBeVisible();
  211 | 
  212 |     // Verify requirements section
  213 |     await expect(page.getByText("Before You Start")).toBeVisible();
  214 |     await expect(page.getByText("Wear fitted clothing")).toBeVisible();
  215 |     await expect(page.getByText("Stand 1.5–2 metres")).toBeVisible();
  216 | 
  217 |     await page.screenshot({ path: `${SCREENSHOT_DIR}/05-measurement-details.png`, fullPage: true });
  218 |   });
  219 | 
  220 |   test("06 - Navigate to get-measured landing page", async ({ page }) => {
> 221 |     await page.goto("/get-measured", { waitUntil: "networkidle", timeout: 120_000 });
      |                ^ TimeoutError: page.goto: Timeout 120000ms exceeded.
  222 |     await page.waitForTimeout(8000);
  223 |     await page.screenshot({ path: `${SCREENSHOT_DIR}/06-get-measured.png`, fullPage: true });
  224 |     await expect(page).toHaveURL(/\/get-measured/);
  225 |   });
  226 | 
  227 |   test("07 - Navigate to measurements dashboard", async ({ page, request }) => {
  228 |     await loginAndNavigate(page, request, "/client/dashboard/measurements");
  229 |     await page.screenshot({ path: `${SCREENSHOT_DIR}/07-measurements-dashboard.png`, fullPage: true });
  230 |     await expect(page).not.toHaveURL(/\/auth\/sign-in/);
  231 |   });
  232 | 
  233 |   test("08 - Verify no 404 on scan status endpoint and no 403 on WebSocket", async ({ page, request }) => {
  234 |     await loginAndNavigate(page, request, "/client/dashboard/measurements/scan");
  235 |     await page.waitForSelector("text=Start AI Scan", { timeout: 120_000 });
  236 | 
  237 |     const { networkErrors } = collectErrors(page);
  238 | 
  239 |     // Click Start AI Scan to trigger camera capture (which may initiate WebSocket)
  240 |     await page.getByRole("button", { name: "Start AI Scan" }).click();
  241 |     await page.waitForTimeout(5000);
  242 | 
  243 |     // Assert no 404/403 errors on scan-related API or WebSocket endpoints
  244 |     expect(
  245 |       networkErrors,
  246 |       `Should not have 404/403 errors on scan endpoints. Found: ${networkErrors.join(", ")}`,
  247 |     ).toHaveLength(0);
  248 | 
  249 |     await page.screenshot({ path: `${SCREENSHOT_DIR}/08-no-network-errors.png`, fullPage: true });
  250 |   });
  251 | });
  252 | 
```