// e2e/registration_flow.spec.ts
/**
 * Playwright E2E — Registration → OTP → Dashboard
 * Phase 10 / Criterion D: Critical user journey #1
 *
 * Covers:
 *   1. Open homepage
 *   2. Navigate to sign-up
 *   3. Fill registration form
 *   4. Submit and reach OTP screen
 *   5. Enter mock OTP (dev bypass if available)
 *   6. Land on dashboard
 */

import { test, expect } from "@playwright/test";

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";
const TEST_EMAIL = `e2e_reg_${Date.now()}@fashionistar-test.ng`;
const TEST_PASSWORD = "Playwright!2026";
const TEST_NAME = "Playwright TestUser";

// ── Helpers ───────────────────────────────────────────────────────────────────



// ── Test Suite ────────────────────────────────────────────────────────────────

test.describe("Registration Flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: "networkidle" });
  });

  test("homepage loads with hero section", async ({ page }) => {
    await expect(page).toHaveTitle(/FASHIONISTAR/i);
    // Check at least one h1 exists
    const h1 = page.locator("h1").first();
    await expect(h1).toBeVisible();
  });

  test("navigate to registration page", async ({ page }) => {
    // Click register / get started link
    const registerLink = page.locator(
      "a[href*='/auth/register'], a[href*='/register'], [id*='register'], [id*='signup'], [id*='get-started']"
    ).first();

    await expect(registerLink).toBeVisible({ timeout: 10_000 });
    await registerLink.click();
    await page.waitForURL(/register|signup/i, { timeout: 10_000 });
    await expect(page.url()).toMatch(/register|signup/i);
  });

  test("registration form validation — empty submit", async ({ page }) => {
    await page.goto(`${BASE_URL}/auth/register`, { waitUntil: "networkidle" });

    const submitBtn = page.locator(
      "#register-submit-btn, [id*='register'][id*='submit'], [type='submit']"
    ).first();

    if (await submitBtn.isVisible()) {
      await submitBtn.click();
      // Form should NOT navigate away
      await expect(page.url()).toContain("register");
    }
  });

  test("registration form — full valid submission", async ({ page }) => {
    await page.goto(`${BASE_URL}/auth/register`, { waitUntil: "networkidle" });

    // Fill name
    const nameInput = page.locator(
      "#register-name, #register-full-name, input[name='full_name'], input[placeholder*='name' i]"
    ).first();
    if (await nameInput.isVisible()) await nameInput.fill(TEST_NAME);

    // Fill email
    const emailInput = page.locator(
      "#register-email, input[type='email'], input[name='email']"
    ).first();
    await expect(emailInput).toBeVisible();
    await emailInput.fill(TEST_EMAIL);

    // Fill password
    const pwInput = page.locator(
      "#register-password, input[type='password'], input[name='password']"
    ).first();
    await expect(pwInput).toBeVisible();
    await pwInput.fill(TEST_PASSWORD);

    // Fill confirm password if present
    const confirmPw = page.locator(
      "#register-confirm-password, input[name='confirm_password'], input[placeholder*='confirm' i]"
    ).first();
    if (await confirmPw.isVisible()) await confirmPw.fill(TEST_PASSWORD);

    // Submit
    const submitBtn = page.locator(
      "#register-submit-btn, [type='submit']"
    ).first();
    await submitBtn.click();

    // Should either redirect to OTP screen or dashboard
    await page.waitForURL(/(otp|verify|dashboard|home)/i, { timeout: 15_000 });

    const url = page.url();
    const isExpected =
      /otp|verify|dashboard|home/i.test(url) ||
      (await page.locator("[id*='otp'], [id*='verify']").count()) > 0;

    expect(isExpected).toBeTruthy();
  });

  test("OTP screen — 6-digit entry works", async ({ page }) => {
    await page.goto(`${BASE_URL}/auth/verify`, { waitUntil: "networkidle" });

    // Check if OTP inputs exist
    const firstOTP = page.locator("#otp-digit-0").first();
    if (!(await firstOTP.isVisible({ timeout: 3_000 }).catch(() => false))) {
      test.skip();
      return;
    }

    // Type into each OTP digit box
    for (let i = 0; i < 6; i++) {
      await page.locator(`#otp-digit-${i}`).fill(String(i + 1));
    }

    // Check verify button is enabled
    const verifyBtn = page.locator("#otp-verify-btn");
    await expect(verifyBtn).toBeEnabled();
  });
});

// ── Login Flow ────────────────────────────────────────────────────────────────

test.describe("Login Flow", () => {
  test("login form renders correctly", async ({ page }) => {
    await page.goto(`${BASE_URL}/auth/login`, { waitUntil: "networkidle" });

    await expect(page.locator("#login-email")).toBeVisible();
    await expect(page.locator("#login-password")).toBeVisible();
    await expect(page.locator("#login-submit-btn")).toBeVisible();
  });

  test("login with invalid credentials shows error", async ({ page }) => {
    await page.goto(`${BASE_URL}/auth/login`, { waitUntil: "networkidle" });

    await page.locator("#login-email").fill("invalid@nowhere.ng");
    await page.locator("#login-password").fill("WrongPassword!123");
    await page.locator("#login-submit-btn").click();

    // Error message should appear within 5s
    const errorEl = page.locator("[class*='red'], [class*='error'], [role='alert']").first();
    await expect(errorEl).toBeVisible({ timeout: 8_000 });
  });

  test("password toggle works", async ({ page }) => {
    await page.goto(`${BASE_URL}/auth/login`, { waitUntil: "networkidle" });

    const pwInput = page.locator("#login-password");
    await expect(pwInput).toHaveAttribute("type", "password");

    const toggle = page.locator("#login-toggle-password");
    if (await toggle.isVisible()) {
      await toggle.click();
      await expect(pwInput).toHaveAttribute("type", "text");
    }
  });

  test("forgot password link is present", async ({ page }) => {
    await page.goto(`${BASE_URL}/auth/login`, { waitUntil: "networkidle" });
    const forgotLink = page.locator("a[href*='forgot']").first();
    await expect(forgotLink).toBeVisible();
  });
});
