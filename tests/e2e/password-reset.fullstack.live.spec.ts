import fs from "node:fs/promises";

import { expect, test, type Page } from "@playwright/test";

const LIVE_CELERY_LOG = process.env.PW_LIVE_CELERY_LOG ?? "";

const INITIAL_PASSWORD = "InitPass123!";
const EMAIL_RESET_PASSWORD = "EmailReset123!";
const PHONE_RESET_PASSWORD = "PhoneReset123!";

function uniqueEmail(prefix = "live-reset") {
  const stamp = Date.now();
  const rand = Math.random().toString(36).slice(2, 8);
  return `${prefix}.${stamp}.${rand}@playwright.fashionistar.io`;
}

function uniquePhone() {
  const suffix = `${Date.now()}`.slice(-8);
  return `+23481${suffix}`;
}

function nationalPhone(e164Phone: string) {
  return e164Phone.replace(/^\+234/, "");
}

async function getLogOffset(logPath: string) {
  try {
    const stats = await fs.stat(logPath);
    return stats.size;
  } catch {
    return 0;
  }
}

async function waitForEmailOtp(logPath: string, offset: number, email: string, timeoutMs = 90_000) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    const content = await fs.readFile(logPath, "utf8");
    const appended = content.slice(offset);
    const emailIndex = appended.lastIndexOf(email);

    if (emailIndex !== -1) {
      const relevantChunk = appended.slice(emailIndex);
      const otpMatch = relevantChunk.match(/Enter this OTP[\s\S]*?(\d{6})[\s\S]*?Expires in/i);

      if (otpMatch?.[1]) {
        return otpMatch[1];
      }
    }

    await new Promise((resolve) => setTimeout(resolve, 1_000));
  }

  throw new Error(`Timed out waiting for email OTP for ${email}`);
}

async function waitForSmsOtp(
  logPath: string,
  offset: number,
  phone: string,
  marker: "verification" | "password_reset",
  timeoutMs = 90_000,
) {
  const startedAt = Date.now();
  const phrase =
    marker === "verification" ? "verification OTP" : "Password Reset Code";

  while (Date.now() - startedAt < timeoutMs) {
    const content = await fs.readFile(logPath, "utf8");
    const appended = content.slice(offset);
    const phoneIndex = appended.lastIndexOf(phone);

    if (phoneIndex !== -1) {
      const relevantChunk = appended.slice(phoneIndex);
      const smsMatch = relevantChunk.match(
        new RegExp(`${phrase}[\\s\\S]*?(\\d{6})`, "i"),
      );

      if (smsMatch?.[1]) {
        return smsMatch[1];
      }
    }

    await new Promise((resolve) => setTimeout(resolve, 1_000));
  }

  throw new Error(`Timed out waiting for SMS OTP for ${phone} (${marker})`);
}

async function waitForResetLink(logPath: string, offset: number, timeoutMs = 90_000) {
  const startedAt = Date.now();
  const linkPattern =
    /(https?:\/\/[^\s"'<>]*\/auth\/forgot-password\/confirm-email\/[A-Za-z0-9_\-=]+\/[A-Za-z0-9\-_=]+|\/auth\/forgot-password\/confirm-email\/[A-Za-z0-9_\-=]+\/[A-Za-z0-9\-_=]+)/;

  while (Date.now() - startedAt < timeoutMs) {
    const content = await fs.readFile(logPath, "utf8");
    const appended = content.slice(offset).replaceAll("&amp;", "&");
    const match = appended.match(linkPattern);

    if (match?.[0]) {
      return match[0];
    }

    await new Promise((resolve) => setTimeout(resolve, 1_000));
  }

  throw new Error(`Timed out waiting for a reset link in ${logPath}`);
}

async function fillOtpBoxes(page: Page, otp: string) {
  for (const [index, digit] of otp.split("").entries()) {
    await page.locator(`#otp-input-${index}`).fill(digit);
  }
}

async function clearAuthState(page: Page) {
  await page.goto("/");
  await page.context().clearCookies();
  await page.evaluate(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
  });
}

async function registerEmailClient(page: Page, email: string, password: string, logPath: string) {
  const logOffset = await getLogOffset(logPath);

  await page.goto("/auth/sign-up?role=client");
  await page.locator("#reg-fname").fill("Email");
  await page.locator("#reg-lname").fill("Reset");
  await page.locator("#reg-email").fill(email);
  await page.locator("#reg-password").fill(password);
  await page.locator("#reg-password-confirm").fill(password);
  await page.screenshot({
    path: test.info().outputPath("email-register-form.png"),
    fullPage: true,
  });
  await page.locator("#register-submit-btn").click();

  await page.waitForURL(/\/auth\/verify-otp/, { timeout: 20_000 });
  const otp = await waitForEmailOtp(logPath, logOffset, email);
  await fillOtpBoxes(page, otp);

  await page.waitForURL(/\/client\/dashboard/, { timeout: 30_000 });
  await page.screenshot({
    path: test.info().outputPath("email-registration-dashboard.png"),
    fullPage: true,
  });
}

async function registerPhoneClient(page: Page, phone: string, password: string, logPath: string) {
  const logOffset = await getLogOffset(logPath);

  await page.goto("/auth/sign-up?role=client");
  await page.locator("#tab-phone").click();
  await page.locator("#reg-fname").fill("Phone");
  await page.locator("#reg-lname").fill("Reset");
  await page.locator("#reg-phone").fill(nationalPhone(phone));
  await page.locator("#reg-password").fill(password);
  await page.locator("#reg-password-confirm").fill(password);
  await page.screenshot({
    path: test.info().outputPath("phone-register-form.png"),
    fullPage: true,
  });
  await page.locator("#register-submit-btn").click();

  await page.waitForURL(/\/auth\/verify-otp/, { timeout: 20_000 });
  const otp = await waitForSmsOtp(logPath, logOffset, phone, "verification");
  await fillOtpBoxes(page, otp);

  await page.waitForURL(/\/client\/dashboard/, { timeout: 30_000 });
  await page.screenshot({
    path: test.info().outputPath("phone-registration-dashboard.png"),
    fullPage: true,
  });
}

async function signInWithEmail(page: Page, email: string, password: string) {
  await page.goto("/auth/sign-in");
  await page.locator("#login-email").fill(email);
  await page.locator("#login-password").fill(password);
  await page.locator("#login-submit-btn").click();
  await page.waitForURL(/\/client\/dashboard/, { timeout: 30_000 });
}

async function signInWithPhone(page: Page, phone: string, password: string) {
  await page.goto("/auth/sign-in");
  await page.locator("#login-tab-phone").click();
  await page.locator("#login-phone").fill(nationalPhone(phone));
  await page.locator("#login-password").fill(password);
  await page.locator("#login-submit-btn").click();
  await page.waitForURL(/\/client\/dashboard/, { timeout: 30_000 });
}

test.use({ video: "on" });
test.describe.configure({ mode: "serial" });

test.describe("Auth — Live Fullstack Register and Password Reset", () => {
  test.skip(!LIVE_CELERY_LOG, "Set PW_LIVE_CELERY_LOG to the active Celery output log.");

  test.setTimeout(240_000);

  test("email registration, OTP verification, email reset, and login succeed live", async ({
    page,
  }) => {
    const email = uniqueEmail("email-reset");

    await registerEmailClient(page, email, INITIAL_PASSWORD, LIVE_CELERY_LOG);
    await clearAuthState(page);

    const resetOffset = await getLogOffset(LIVE_CELERY_LOG);

    await page.goto("/auth/forgot-password");
    await page.locator("#reset-email").fill(email);
    await page.screenshot({
      path: test.info().outputPath("email-reset-request-form.png"),
      fullPage: true,
    });
    await page.locator("#reset-submit-btn").click();

    await expect(
      page.getByRole("heading", { name: /check your email/i }),
    ).toBeVisible({ timeout: 20_000 });
    await page.screenshot({
      path: test.info().outputPath("email-reset-request-success.png"),
      fullPage: true,
    });

    const resetLink = await waitForResetLink(LIVE_CELERY_LOG, resetOffset);
    await page.goto(resetLink);
    await expect(page.locator("#pw-reset-submit")).toBeVisible({ timeout: 20_000 });
    await page.locator("#new-password").fill(EMAIL_RESET_PASSWORD);
    await page.locator("#confirm-password").fill(EMAIL_RESET_PASSWORD);
    await page.screenshot({
      path: test.info().outputPath("email-reset-confirm-form.png"),
      fullPage: true,
    });
    await page.locator("#pw-reset-submit").click();

    await page.waitForURL(/\/auth\/sign-in$/, { timeout: 20_000 });
    await page.screenshot({
      path: test.info().outputPath("email-reset-sign-in-page.png"),
      fullPage: true,
    });

    await signInWithEmail(page, email, EMAIL_RESET_PASSWORD);
    await page.screenshot({
      path: test.info().outputPath("email-reset-login-success.png"),
      fullPage: true,
    });
  });

  test("phone registration, OTP verification, phone reset, and login succeed live", async ({
    page,
  }) => {
    const phone = uniquePhone();

    await registerPhoneClient(page, phone, INITIAL_PASSWORD, LIVE_CELERY_LOG);
    await clearAuthState(page);

    const resetOffset = await getLogOffset(LIVE_CELERY_LOG);

    await page.goto("/auth/forgot-password");
    await page.locator("#reset-tab-phone").click();
    await page.locator("#reset-phone").fill(nationalPhone(phone));
    await page.screenshot({
      path: test.info().outputPath("phone-reset-request-form.png"),
      fullPage: true,
    });
    await page.locator("#reset-submit-btn").click();

    await page.waitForURL(/\/auth\/forgot-password\/confirm-phone$/, {
      timeout: 20_000,
    });
    await expect(page.locator("#pw-reset-submit")).toBeVisible({ timeout: 20_000 });

    const resetOtp = await waitForSmsOtp(LIVE_CELERY_LOG, resetOffset, phone, "password_reset");
    await page.locator("#phone-otp").fill(resetOtp);
    await page.locator("#new-password").fill(PHONE_RESET_PASSWORD);
    await page.locator("#confirm-password").fill(PHONE_RESET_PASSWORD);
    await page.screenshot({
      path: test.info().outputPath("phone-reset-confirm-form.png"),
      fullPage: true,
    });
    await page.locator("#pw-reset-submit").click();

    await page.waitForURL(/\/auth\/sign-in$/, { timeout: 20_000 });
    await page.screenshot({
      path: test.info().outputPath("phone-reset-sign-in-page.png"),
      fullPage: true,
    });

    await signInWithPhone(page, phone, PHONE_RESET_PASSWORD);
    await page.screenshot({
      path: test.info().outputPath("phone-reset-login-success.png"),
      fullPage: true,
    });
  });
});
