import { test } from "@playwright/test";
import path from "node:path";
import fs from "node:fs";

// Production URLs
const FRONTEND_URL = "https://fashionistar-frontend-259415881346.europe-west1.run.app";
const BACKEND_URL = "https://fashionistar-backend-259415881346.europe-west1.run.app";

const ADMIN_EMAIL = "admin@fashionistar.io";
const ADMIN_PASSWORD = "FashionAdmin2026!";

// Ensure evidence directory exists
const EVIDENCE_DIR = "c:\\Users\\FASHIONISTAR\\OneDrive\\Documenti\\FASHIONISTAR_ANTAGRAVITY\\FASHIONISTAR_REAL_VISION_BROWSER_TESTING\\test-evidence";
if (!fs.existsSync(EVIDENCE_DIR)) {
  fs.mkdirSync(EVIDENCE_DIR, { recursive: true });
}

// Helper to capture high-res screenshots
async function captureScreenshot(page: any, name: string) {
  const filePath = path.join(EVIDENCE_DIR, `${name}.png`);
  await page.screenshot({ path: filePath, fullPage: true });
  console.log(`[EVIDENCE CAPTURED] Saved screenshot: ${filePath}`);
}

test.describe.configure({ mode: "serial" });

test.describe("FASHIONISTAR AI - Real-Vision Live Fullstack E2E Testing", () => {
  const clientEmail = `client.vision.${Date.now()}@fashionistar.io`;
  const vendorEmail = `vendor.vision.${Date.now()}@fashionistar.io`;
  const testPassword = "FashionTestUser2026!";

  test("1. Register Client User & Verify OTP Redirect", async ({ page }) => {
    test.setTimeout(120_000);
    console.log(`[INFO] Navigating to Client Signup with email: ${clientEmail}`);
    await page.goto(`${FRONTEND_URL}/auth/sign-up?role=client`);
    await page.waitForLoadState("networkidle");

    // Fill Client Signup fields
    await page.locator("#reg-fname").fill("Chidi");
    await page.locator("#reg-lname").fill("Client");
    await page.locator("#reg-email").fill(clientEmail);
    await page.locator("#reg-password").fill(testPassword);
    await page.locator("#reg-password-confirm").fill(testPassword);

    await captureScreenshot(page, "01_client_signup_filled");

    // Click submit and wait for OTP page redirect
    await page.locator("#register-submit-btn").click();
    await page.waitForURL(/\/verify-otp/, { timeout: 45_000 });
    await page.waitForLoadState("networkidle");

    await captureScreenshot(page, "02_client_signup_success_otp_prompt");
    console.log("[INFO] Client registered successfully, OTP page reached.");
  });

  test("2. Register Vendor User & Verify OTP Redirect", async ({ page }) => {
    test.setTimeout(120_000);
    console.log(`[INFO] Navigating to Vendor Signup with email: ${vendorEmail}`);
    await page.goto(`${FRONTEND_URL}/auth/sign-up?role=vendor`);
    await page.waitForLoadState("networkidle");

    // Fill Vendor Signup fields
    await page.locator("#reg-fname").fill("Amara");
    await page.locator("#reg-lname").fill("Vendor");
    await page.locator("#reg-email").fill(vendorEmail);
    await page.locator("#reg-password").fill(testPassword);
    await page.locator("#reg-password-confirm").fill(testPassword);

    await captureScreenshot(page, "03_vendor_signup_filled");

    // Click submit and wait for OTP page redirect
    await page.locator("#register-submit-btn").click();
    await page.waitForURL(/\/verify-otp/, { timeout: 45_000 });
    await page.waitForLoadState("networkidle");

    await captureScreenshot(page, "04_vendor_signup_success_otp_prompt");
    console.log("[INFO] Vendor registered successfully, OTP page reached.");
  });

  test("3. Admin Login & Bypass Activation in Django Admin", async ({ page }) => {
    test.setTimeout(150_000);
    console.log("[INFO] Navigating to Django Admin Login to bypass OTP/activation");
    await page.goto(`${BACKEND_URL}/admin/`);
    await page.waitForLoadState("networkidle");

    // Fill Django Admin credentials
    await page.locator("#id_username").fill(ADMIN_EMAIL);
    await page.locator("#id_password").fill(ADMIN_PASSWORD);
    await captureScreenshot(page, "05_admin_django_login_filled");

    await page.locator('input[type="submit"]').click();
    await page.waitForURL(/\/admin\//, { timeout: 45_000 });
    console.log("[INFO] Admin logged in successfully to Django panel.");

    // Go to Unified Users list
    await page.goto(`${BACKEND_URL}/admin/authentication/unifieduser/`);
    await page.waitForLoadState("networkidle");
    await captureScreenshot(page, "06_admin_users_list");

    // Activate and Verify Client
    console.log(`[INFO] Searching for Client: ${clientEmail}`);
    await page.locator("#searchbar").fill(clientEmail);
    await page.locator('input[type="submit"]').click();
    await page.waitForLoadState("networkidle");
    
    // Click on the client user link
    await page.locator(`a:has-text("${clientEmail}")`).first().click();
    await page.waitForLoadState("networkidle");

    // Toggle active and verified checkboxes in Django Admin
    const activeCheck = page.locator("#id_is_active");
    if (!(await activeCheck.isChecked())) {
      await activeCheck.check();
    }
    const verifiedCheck = page.locator("#id_is_verified");
    if (!(await verifiedCheck.isChecked())) {
      await verifiedCheck.check();
    }
    await captureScreenshot(page, "07_client_activation_details");
    await page.locator('input[name="_save"]').click();
    await page.waitForLoadState("networkidle");

    // Activate and Verify Vendor
    console.log(`[INFO] Searching for Vendor: ${vendorEmail}`);
    await page.goto(`${BACKEND_URL}/admin/authentication/unifieduser/`);
    await page.locator("#searchbar").fill(vendorEmail);
    await page.locator('input[type="submit"]').click();
    await page.waitForLoadState("networkidle");

    // Click on the vendor user link
    await page.locator(`a:has-text("${vendorEmail}")`).first().click();
    await page.waitForLoadState("networkidle");

    // Toggle active and verified checkboxes in Django Admin
    if (!(await activeCheck.isChecked())) {
      await activeCheck.check();
    }
    if (!(await verifiedCheck.isChecked())) {
      await verifiedCheck.check();
    }
    await captureScreenshot(page, "08_vendor_activation_details");
    await page.locator('input[name="_save"]').click();
    await page.waitForLoadState("networkidle");

    console.log("[INFO] Both test accounts successfully activated and verified!");
    await captureScreenshot(page, "09_accounts_activated_success");
  });

  test("4. Live Next.js Admin Dashboard Verification", async ({ page }) => {
    test.setTimeout(120_000);
    console.log("[INFO] Logging in via Next.js Portal as Admin");
    await page.goto(`${FRONTEND_URL}/auth/sign-in`);
    await page.waitForLoadState("networkidle");

    await page.locator("#login-email").fill(ADMIN_EMAIL);
    await page.locator("#login-password").fill(ADMIN_PASSWORD);
    await captureScreenshot(page, "10_admin_frontend_login_filled");

    await page.locator("#login-submit-btn").click();
    await page.waitForURL(/\/admin-dashboard/, { timeout: 45_000 });
    await page.waitForLoadState("networkidle");

    await captureScreenshot(page, "11_nextjs_admin_dashboard_home");

    // Navigate to accounts tab
    await page.goto(`${FRONTEND_URL}/admin-dashboard/authentication`);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(5000); // allow table to fetch data
    await captureScreenshot(page, "12_nextjs_admin_accounts_directory");
  });

  test("5. Client Role Redirect & Dashboard Verification", async ({ page }) => {
    test.setTimeout(120_000);
    console.log("[INFO] Logging in as newly activated Client user");
    await page.goto(`${FRONTEND_URL}/auth/sign-in`);
    await page.waitForLoadState("networkidle");

    await page.locator("#login-email").fill(clientEmail);
    await page.locator("#login-password").fill(testPassword);
    await captureScreenshot(page, "13_client_login_filled");

    await page.locator("#login-submit-btn").click();
    // Redirects client automatically to /client/dashboard or /dashboard
    await page.waitForURL(/\/client\/dashboard|\/dashboard/, { timeout: 45_000 });
    await page.waitForLoadState("networkidle");

    await captureScreenshot(page, "14_client_dashboard_landing");
    console.log("[INFO] Client successfully logged in and redirected to Client Dashboard!");
  });

  test("6. Vendor Role Redirect & Dashboard Verification", async ({ page }) => {
    test.setTimeout(120_000);
    console.log("[INFO] Logging in as newly activated Vendor user");
    await page.goto(`${FRONTEND_URL}/auth/sign-in`);
    await page.waitForLoadState("networkidle");

    await page.locator("#login-email").fill(vendorEmail);
    await page.locator("#login-password").fill(testPassword);
    await captureScreenshot(page, "15_vendor_login_filled");

    await page.locator("#login-submit-btn").click();
    // Redirects vendor automatically to /vendor/dashboard or /vendor-dashboard
    await page.waitForURL(/\/vendor\/dashboard|\/vendor-dashboard/, { timeout: 45_000 });
    await page.waitForLoadState("networkidle");

    await captureScreenshot(page, "16_vendor_dashboard_landing");
    console.log("[INFO] Vendor successfully logged in and redirected to Vendor Dashboard!");
  });
});
