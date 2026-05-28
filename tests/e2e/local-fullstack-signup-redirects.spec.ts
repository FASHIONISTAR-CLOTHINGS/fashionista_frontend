import { test, expect } from "@playwright/test";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Local URLs for E2E verification
const FRONTEND_URL = "http://localhost:3000";
const BACKEND_URL = "http://localhost:8001";

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

test.describe("FASHIONISTAR AI - Real-Vision Local Fullstack E2E Testing", () => {
  test.describe.configure({ mode: "serial" });
  const TMP_EMAIL_FILE = path.resolve(process.cwd(), "tests/e2e/.tmp/active-test-emails.json");
  let clientEmail: string;
  let vendorEmail: string;

  // Initialize emails consistently across worker processes/retries
  if (fs.existsSync(TMP_EMAIL_FILE)) {
    const saved = JSON.parse(fs.readFileSync(TMP_EMAIL_FILE, "utf8"));
    clientEmail = saved.clientEmail;
    vendorEmail = saved.vendorEmail;
    console.log(`[INIT] Loaded existing test emails: client=${clientEmail}, vendor=${vendorEmail}`);
  } else {
    // Ensure directory exists
    if (!fs.existsSync(path.dirname(TMP_EMAIL_FILE))) {
      fs.mkdirSync(path.dirname(TMP_EMAIL_FILE), { recursive: true });
    }
    const timestamp = Date.now();
    clientEmail = `client.vision.${timestamp}@fashionistar.io`;
    vendorEmail = `vendor.vision.${timestamp}@fashionistar.io`;
    fs.writeFileSync(TMP_EMAIL_FILE, JSON.stringify({ clientEmail, vendorEmail }), "utf8");
    console.log(`[INIT] Generated and saved new test emails: client=${clientEmail}, vendor=${vendorEmail}`);
  }

  const testPassword = "FashionTestUser2026!";

  test.beforeAll(async ({ request }) => {
    console.log("[WARMUP] Starting local backend health check...");
    const startTime = Date.now();
    let warmed = false;
    for (let i = 0; i < 6; i++) {
      try {
        const response = await request.get(`${BACKEND_URL}/health/`, { timeout: 30000 });
        if (response.ok()) {
          console.log(`[WARMUP] Local backend warmed up successfully in ${Date.now() - startTime}ms!`);
          warmed = true;
          break;
        }
      } catch (err) {
        console.log(`[WARMUP] Health check attempt ${i + 1} failed or timed out. Retrying in 5s...`);
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
    if (!warmed) {
      console.warn("[WARMUP] Warning: Local backend did not complete successfully. Proceeding anyway.");
    }
  });

  test("1. Register Client User & Verify OTP Redirect", async ({ page }) => {
    test.setTimeout(120_000);

    page.on("console", (msg) => {
      console.log(`[BROWSER CONSOLE] [${msg.type()}] ${msg.text()}`);
    });

    page.on("request", (req) => {
      console.log(`[OUTGOING REQUEST] [${req.method()}] ${req.url()}`);
    });

    page.on("requestfailed", (req) => {
      console.log(`[REQUEST FAILED] [${req.method()}] ${req.url()} -> Error: ${req.failure()?.errorText}`);
    });

    page.on("response", async (response) => {
      if (response.url().includes("/api/")) {
        try {
          const status = response.status();
          const url = response.url();
          let bodyText = "";
          try {
            bodyText = await response.text();
          } catch {
            bodyText = "<binary/empty>";
          }
          console.log(`[API RESPONSE] [${status}] ${url} -> ${bodyText.slice(0, 500)}`);
        } catch (e) {
          // ignore parsing error
        }
      }
    });

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

    console.log("[INFO] Clicking submit button...");
    await page.locator("#register-submit-btn").click();
    try {
      try {
        await page.waitForURL(/\/verify-otp/, { waitUntil: "commit", timeout: 45_000 });
      } catch (urlErr) {
        const hasError = await page.locator('text="already exists", text="Validation failed"').first().isVisible();
        if (hasError) {
          console.log("[INFO] Client already registered in a previous retry. Routing directly to OTP verification.");
          await page.goto(`${FRONTEND_URL}/auth/verify-otp`);
        } else {
          throw urlErr;
        }
      }
      
      await page.waitForLoadState("networkidle");
      await captureScreenshot(page, "02_client_signup_success_otp_prompt");
      console.log("[INFO] Client registered successfully, OTP page reached.");
    } catch (err) {
      await captureScreenshot(page, "01_client_signup_failed_submit");
      console.error("[ERROR] Client signup failed to redirect to OTP page:", err);
      throw err;
    }
  });

  test("2. Register Vendor User & Verify OTP Redirect", async ({ page }) => {
    test.setTimeout(180_000);
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

    await page.locator("#register-submit-btn").click();
    try {
      try {
        await page.waitForURL(/\/verify-otp/, { waitUntil: "commit", timeout: 45_000 });
      } catch (urlErr) {
        const hasError = await page.locator('text="already exists", text="Validation failed"').first().isVisible();
        if (hasError) {
          console.log("[INFO] Vendor already registered in a previous retry. Routing directly to OTP verification.");
          await page.goto(`${FRONTEND_URL}/auth/verify-otp`);
        } else {
          throw urlErr;
        }
      }
      
      await page.waitForLoadState("networkidle");
      await captureScreenshot(page, "04_vendor_signup_success_otp_prompt");
      console.log("[INFO] Vendor registered successfully, OTP page reached.");
    } catch (err) {
      await captureScreenshot(page, "03_vendor_signup_failed_submit");
      console.error("[ERROR] Vendor signup failed to redirect to OTP page:", err);
      throw err;
    }
  });

  test("3. Admin Login & Bypass Activation in Django Admin", async ({ page }) => {
    test.setTimeout(150_000);
    console.log("[INFO] Navigating to Django Admin Login to bypass OTP/activation");
    await page.goto(`${BACKEND_URL}/admin/`);
    await page.waitForLoadState("networkidle");

    const usernameInput = page.locator('input[name="username"], #id_username');
    const passwordInput = page.locator('input[name="password"], #id_password');
    await usernameInput.fill(ADMIN_EMAIL);
    await passwordInput.fill(ADMIN_PASSWORD);
    await captureScreenshot(page, "05_admin_django_login_filled");

    const loginSubmitBtn = page.locator('button[type="submit"], input[type="submit"]');
    await loginSubmitBtn.click({ timeout: 60_000 });
    await page.waitForURL(/\/admin\//, { timeout: 45_000 });
    console.log("[INFO] Admin logged in successfully to Django panel.");

    console.log(`[INFO] Navigating directly to Client list view for: ${clientEmail}`);
    await page.goto(`${BACKEND_URL}/admin/authentication/unifieduser/?q=${clientEmail}`);
    await page.waitForLoadState("domcontentloaded");
    await captureScreenshot(page, "06_admin_users_list_client");
    
    const clientLink = page.locator(`tr:has-text("${clientEmail}") a, tr:has-text("${clientEmail}") th a`).first();
    await clientLink.waitFor({ state: "visible", timeout: 30_000 });
    await clientLink.click({ timeout: 60_000 });

    console.log("[INFO] Checking if 'Permissions' tab is present...");
    const permissionsTab = page.locator('.nav-link:has-text("Permissions"), a:has-text("Permissions"), li:has-text("Permissions") a, [role="tab"]:has-text("Permissions")').first();
    if (await permissionsTab.isVisible({ timeout: 5000 }).catch(() => false)) {
      console.log("[INFO] Clicking the 'Permissions' tab...");
      await permissionsTab.click({ timeout: 10000 }).catch(() => {});
    } else {
      console.log("[INFO] 'Permissions' tab not found/not visible, continuing directly to fields.");
    }

    const activeCheck = page.locator('input[name="is_active"], #id_is_active');
    await activeCheck.waitFor({ state: "visible", timeout: 30_000 });

    if (!(await activeCheck.isChecked())) {
      await activeCheck.check();
    }
    const verifiedCheck = page.locator('input[name="is_verified"], #id_is_verified');
    if (!(await verifiedCheck.isChecked())) {
      await verifiedCheck.check();
    }
    await captureScreenshot(page, "07_client_activation_details");
    await page.locator('button[name="_save"], input[name="_save"], button:has-text("Save")').first().click({ timeout: 60_000 });
    
    await page.waitForURL(/\/admin\/authentication\/unifieduser\//, { timeout: 45_000 });

    console.log(`[INFO] Navigating directly to Vendor list view for: ${vendorEmail}`);
    await page.goto(`${BACKEND_URL}/admin/authentication/unifieduser/?q=${vendorEmail}`);
    await page.waitForLoadState("domcontentloaded");
    await captureScreenshot(page, "06_admin_users_list_vendor");
    
    const vendorLink = page.locator(`tr:has-text("${vendorEmail}") a, tr:has-text("${vendorEmail}") th a`).first();
    await vendorLink.waitFor({ state: "visible", timeout: 30_000 });
    await vendorLink.click({ timeout: 60_000 });

    console.log("[INFO] Checking if 'Permissions' tab is present for vendor...");
    const permissionsTabVendor = page.locator('.nav-link:has-text("Permissions"), a:has-text("Permissions"), li:has-text("Permissions") a, [role="tab"]:has-text("Permissions")').first();
    if (await permissionsTabVendor.isVisible({ timeout: 5000 }).catch(() => false)) {
      console.log("[INFO] Clicking the 'Permissions' tab...");
      await permissionsTabVendor.click({ timeout: 10000 }).catch(() => {});
    } else {
      console.log("[INFO] 'Permissions' tab not found/not visible, continuing directly to fields.");
    }

    await activeCheck.waitFor({ state: "visible", timeout: 30_000 });

    if (!(await activeCheck.isChecked())) {
      await activeCheck.check();
    }
    if (!(await verifiedCheck.isChecked())) {
      await verifiedCheck.check();
    }
    await captureScreenshot(page, "08_vendor_activation_details");
    await page.locator('button[name="_save"], input[name="_save"], button:has-text("Save")').first().click({ timeout: 60_000 });
    
    await page.waitForURL(/\/admin\/authentication\/unifieduser\//, { timeout: 45_000 });

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
    await page.waitForURL(/\/admin-dashboard|\/dashboard\/admin/, { timeout: 45_000 });
    await page.waitForLoadState("networkidle");

    await captureScreenshot(page, "11_nextjs_admin_dashboard_home");

    await page.goto(`${FRONTEND_URL}/admin-dashboard/authentication`);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(5000);
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
    await page.waitForURL(/\/client\/dashboard|\/dashboard|\/onboarding/, { timeout: 45_000 });
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
    await page.waitForURL(/\/vendor\/dashboard|\/vendor-dashboard|\/onboarding/, { timeout: 45_000 });
    await page.waitForLoadState("networkidle");

    await captureScreenshot(page, "16_vendor_dashboard_landing");
    console.log("[INFO] Vendor successfully logged in and redirected to Vendor Dashboard!");
  });
});
