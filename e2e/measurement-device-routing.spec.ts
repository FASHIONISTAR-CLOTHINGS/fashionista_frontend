/**
 * e2e/measurement-device-routing.spec.ts
 * TASK-067: Playwright E2E tests for device-aware measurement routing.
 *
 * Tests the core branching behaviour:
 *   1. Desktop user → QR gateway page appears after form submit
 *   2. Mobile user → scan page appears directly (no QR gateway)
 *   3. QR gateway "Copy Link" button → clipboard contains session URL
 *   4. QR code image renders with base64 data URI
 *
 * Prerequisites:
 *   - Backend must be running (NEXT_PUBLIC_API_URL)
 *   - E2E_CLIENT_EMAIL + E2E_CLIENT_PASSWORD must be set
 *   - Run: npx playwright test e2e/measurement-device-routing.spec.ts --headed
 *
 * NOTE: These tests use API mocking (route.fulfill) for the scan/initiate/
 * endpoint to avoid creating real DB sessions in tests. This makes them
 * self-contained and fast.
 */

import { test, expect, Page } from "@playwright/test";
import path from "path";

// ─── Constants ────────────────────────────────────────────────────────────────

const BASE_URL    = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";
const AUTH_FILE   = path.join(__dirname, ".auth/client.json");

const MOCK_SESSION_ID    = "3fa85f64-5717-4562-b3fc-2c963f66afa6";
const MOCK_MEASUREMENT_URL = `https://fashionistar.net/scan/${MOCK_SESSION_ID}`;
// Valid 1x1 pixel PNG base64
const MOCK_QR_B64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";

const MOCK_INITIATE_RESPONSE = {
  status:  "success",
  message: "Scan session created.",
  data: {
    session_id:      MOCK_SESSION_ID,
    status:          "pending",
    measurement_url: MOCK_MEASUREMENT_URL,
    qr_code_b64:     MOCK_QR_B64,
    qr_code_url:     "",
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Intercept the scan/initiate/ endpoint and return a mock response.
 * This prevents real DB session creation during tests.
 */
async function mockInitiateEndpoint(page: Page) {
  await page.route("**/api/v1/measurements/scan/initiate/**", async (route) => {
    await route.fulfill({
      status:      201,
      contentType: "application/json",
      body:        JSON.stringify(MOCK_INITIATE_RESPONSE),
    });
  });
}

/**
 * Fill the measurement entry form with sample values.
 */
async function fillMeasurementForm(page: Page) {
  // Open the modal
  const ctaBtn = page.locator("#get-measured-cta, #get-measured-inline-cta").first();
  if (await ctaBtn.isVisible()) {
    await ctaBtn.click();
  }

  // Fill age
  await page.locator("input[type=number][placeholder*='28']").first().fill("28");
  // Wait for height prediction to populate
  await page.waitForTimeout(600);

  // Click submit
  const submitBtn = page.locator("#measurement-entry-submit");
  await submitBtn.click();
}

// ─── Tests ───────────────────────────────────────────────────────────────────

test.describe("Measurement Device Routing", () => {

  // ── Test 1: Desktop → QR Gateway ──────────────────────────────────────────

  test("Desktop user sees QR gateway after form submit", async ({ browser }) => {
    // Use default desktop context (no custom UA needed)
    const context = await browser.newContext({
      storageState: AUTH_FILE,
    });
    const page = await context.newPage();

    await mockInitiateEndpoint(page);
    await page.goto(`${BASE_URL}/get-measured`);

    await fillMeasurementForm(page);

    // Wait for navigation to QR gateway
    await page.waitForURL("**/scan/qr**", { timeout: 10_000 });

    // QR code image must be visible
    const qrImg = page.locator("#qr-code-image");
    await expect(qrImg).toBeVisible({ timeout: 8_000 });

    // QR image must have base64 src
    const src = await qrImg.getAttribute("src");
    expect(src).toContain("data:image/png;base64,");

    // Copy Link button must be present
    const copyBtn = page.locator("#qr-gateway-copy-btn");
    await expect(copyBtn).toBeVisible();

    await context.close();
  });

  // ── Test 2: Mobile → Direct scan page ────────────────────────────────────

  test("Mobile user goes directly to scan page without QR gateway", async ({ browser }) => {
    const context = await browser.newContext({
      storageState: AUTH_FILE,
      userAgent:
        "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148",
    });
    const page = await context.newPage();

    await mockInitiateEndpoint(page);
    await page.goto(`${BASE_URL}/get-measured`);

    await fillMeasurementForm(page);

    // Must NOT navigate to QR gateway
    await page.waitForURL("**/measurements/scan**", { timeout: 10_000 });
    const url = page.url();
    expect(url).not.toContain("/scan/qr");
    expect(url).toContain("/measurements/scan");

    await context.close();
  });

  // ── Test 3: QR gateway Copy Link → clipboard ──────────────────────────────

  test("QR gateway copy link writes session URL to clipboard", async ({ browser }) => {
    const context = await browser.newContext({
      storageState: AUTH_FILE,
      permissions: ["clipboard-read", "clipboard-write"],
    });
    const page = await context.newPage();

    // Navigate directly to QR gateway page with mock params
    const qrUrl = `${BASE_URL}/client/dashboard/measurements/scan/qr?` +
      `session_id=${MOCK_SESSION_ID}&murl=${encodeURIComponent(MOCK_MEASUREMENT_URL)}`;

    // Seed sessionStorage with QR data (simulate _client.tsx saving it)
    await page.addInitScript(([sid, murl, b64]) => {
      sessionStorage.setItem("fashionistar_measurement_entry", JSON.stringify({
        session_id:      sid,
        measurement_url: murl,
        qr_code_b64:     b64,
      }));
    }, [MOCK_SESSION_ID, MOCK_MEASUREMENT_URL, MOCK_QR_B64]);

    await page.goto(qrUrl);

    // Wait for Copy button
    const copyBtn = page.locator("#qr-gateway-copy-btn");
    await expect(copyBtn).toBeVisible({ timeout: 8_000 });
    await copyBtn.click();

    // Read clipboard
    const clipboardContent = await page.evaluate(() =>
      navigator.clipboard.readText()
    );

    expect(clipboardContent).toBe(MOCK_MEASUREMENT_URL);

    await context.close();
  });

  // ── Test 4: QR code image renders from base64 ─────────────────────────────

  test("QR code image renders with base64 data URI when qr_code_b64 is provided", async ({ browser }) => {
    const context = await browser.newContext({
      storageState: AUTH_FILE,
    });
    const page = await context.newPage();

    const qrUrl = `${BASE_URL}/client/dashboard/measurements/scan/qr?` +
      `session_id=${MOCK_SESSION_ID}&murl=${encodeURIComponent(MOCK_MEASUREMENT_URL)}`;

    await page.addInitScript(([sid, murl, b64]) => {
      sessionStorage.setItem("fashionistar_measurement_entry", JSON.stringify({
        session_id:      sid,
        measurement_url: murl,
        qr_code_b64:     b64,
      }));
    }, [MOCK_SESSION_ID, MOCK_MEASUREMENT_URL, MOCK_QR_B64]);

    await page.goto(qrUrl);

    const qrImg = page.locator("#qr-code-image");
    await expect(qrImg).toBeVisible({ timeout: 8_000 });

    const src = await qrImg.getAttribute("src");
    expect(src).toMatch(/^data:image\/png;base64,/);

    await context.close();
  });

});
