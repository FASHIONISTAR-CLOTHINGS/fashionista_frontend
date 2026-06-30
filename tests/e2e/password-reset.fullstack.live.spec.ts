import fs from "node:fs/promises";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

import { expect, test, type Page } from "@playwright/test";

const LIVE_CELERY_LOG = process.env.PW_LIVE_CELERY_LOG ?? "";
const execFileAsync = promisify(execFile);
const backendRoot = path.resolve(process.cwd(), "..", "fashionistar_backend");
const backendPython = path.join(backendRoot, ".venv", "Scripts", "python.exe");

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

async function readOtpFromBackend(
  identifier: string,
  purpose: "verify" | "password_reset",
) {
  const query = JSON.stringify(identifier);
  const otpPurpose = JSON.stringify(purpose);
  const script = [
    "from django.db.models import Q",
    "from apps.authentication.models import UnifiedUser",
    "from apps.common.utils import get_redis_connection_safe, decrypt_otp",
    `identifier = ${query}`,
    "user = UnifiedUser.objects.filter(Q(email=identifier) | Q(phone=identifier)).order_by('-date_joined').first()",
    "if not user:",
    "    print('')",
    "    raise SystemExit(0)",
    "redis_conn = get_redis_connection_safe()",
    "if not redis_conn:",
    "    print('')",
    "    raise SystemExit(0)",
    `purpose = ${otpPurpose}`,
    "keys = sorted(redis_conn.keys(f'otp:{user.id}:{purpose}:*'), reverse=True)",
    "if not keys:",
    "    print('')",
    "    raise SystemExit(0)",
    "raw = redis_conn.get(keys[0])",
    "if not raw:",
    "    print('')",
    "    raise SystemExit(0)",
    "payload = raw.decode()",
    "encrypted = payload.rsplit('|', 1)[0]",
    "print(decrypt_otp(encrypted))",
  ].join("\n");

  try {
    const { stdout } = await execFileAsync(
      backendPython,
      ["manage.py", "shell", "-c", script],
      {
        cwd: backendRoot,
        env: {
          ...process.env,
          PYTHONIOENCODING: "utf-8",
        },
      },
    );
    const otp = stdout.trim().match(/\b\d{6}\b/)?.[0];
    return otp ?? null;
  } catch {
    return null;
  }
}

async function readResetLinkFromBackend(identifier: string) {
  const query = JSON.stringify(identifier);
  const script = [
    "from django.db.models import Q",
    "from django.contrib.auth.tokens import default_token_generator",
    "from django.utils.encoding import force_bytes",
    "from django.utils.http import urlsafe_base64_encode",
    "from apps.authentication.models import UnifiedUser",
    `identifier = ${query}`,
    "user = UnifiedUser.objects.filter(Q(email=identifier) | Q(phone=identifier)).order_by('-date_joined').first()",
    "if not user:",
    "    print('')",
    "    raise SystemExit(0)",
    "uid = urlsafe_base64_encode(force_bytes(user.pk))",
    "token = default_token_generator.make_token(user)",
    "print(f'/auth/forgot-password/confirm-email/{uid}/{token}')",
  ].join("\n");

  try {
    const { stdout } = await execFileAsync(
      backendPython,
      ["manage.py", "shell", "-c", script],
      {
        cwd: backendRoot,
        env: {
          ...process.env,
          PYTHONIOENCODING: "utf-8",
        },
      },
    );
    const link = stdout.trim().match(/\/auth\/forgot-password\/confirm-email\/[A-Za-z0-9_\-=]+\/[A-Za-z0-9\-_=]+/)?.[0];
    return link ?? null;
  } catch {
    return null;
  }
}

async function waitForEmailOtp(logPath: string, offset: number, email: string, timeoutMs = 90_000) {
  const startedAt = Date.now();
  const escapedEmail = email.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const recipientBlockPattern = new RegExp(
    `recipients:\\s*\\['${escapedEmail}'\\][\\s\\S]*?Enter this OTP[\\s\\S]*?(\\d{6})[\\s\\S]*?Expires in`,
    "i",
  );
  const fallbackPattern = /Enter this OTP[\s\S]*?(\d{6})[\s\S]*?Expires in/i;

  while (Date.now() - startedAt < timeoutMs) {
    const content = await fs.readFile(logPath, "utf8");
    const appended = content.slice(offset);
    const recipientScopedMatch = appended.match(recipientBlockPattern);
    if (recipientScopedMatch?.[1]) {
      return recipientScopedMatch[1];
    }

    if (appended.includes(email)) {
      const fallbackMatch = appended.match(fallbackPattern);
      if (fallbackMatch?.[1]) {
        return fallbackMatch[1];
      }
    }

    const backendOtp = await readOtpFromBackend(email, "verify");
    if (backendOtp) {
      return backendOtp;
    }

    await new Promise((resolve) => setTimeout(resolve, 1_000));
  }

  throw new Error(`Timed out waiting for email OTP for ${email}`);
}

async function waitForSmsOtp(
  logPath: string,
  offset: number,
  phone: string,
  marker: "verify" | "password_reset",
  timeoutMs = 90_000,
) {
  const startedAt = Date.now();
  const phrase =
    marker === "verify" ? "verification OTP" : "Password Reset Code";

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

    const backendOtp = await readOtpFromBackend(phone, marker);
    if (backendOtp) {
      return backendOtp;
    }

    await new Promise((resolve) => setTimeout(resolve, 1_000));
  }

  throw new Error(`Timed out waiting for SMS OTP for ${phone} (${marker})`);
}

async function waitForResetLink(
  logPath: string,
  offset: number,
  identifier: string,
  timeoutMs = 90_000,
) {
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

    const backendLink = await readResetLinkFromBackend(identifier);
    if (backendLink) {
      return backendLink;
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

async function waitForResetRedirectToSignIn(page: Page) {
  const redirectButton = page.getByRole("button", {
    name: /redirecting to sign in/i,
  });

  const firstSignal = await Promise.any([
    page.waitForURL(/\/auth\/sign-in$/, { timeout: 25_000 }).then(() => "url"),
    redirectButton.waitFor({ state: "visible", timeout: 25_000 }).then(() => "button"),
  ]);

  if (firstSignal === "button") {
    await page.waitForURL(/\/auth\/sign-in$/, { timeout: 25_000 });
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

async function registerEmailVendor(page: Page, email: string, password: string, logPath: string) {
  const logOffset = await getLogOffset(logPath);

  await page.goto("/auth/sign-up?role=vendor");
  await page.locator("#reg-fname").fill("Vendor");
  await page.locator("#reg-lname").fill("Reset");
  await page.locator("#reg-email").fill(email);
  await page.locator("#reg-password").fill(password);
  await page.locator("#reg-password-confirm").fill(password);
  await page.screenshot({
    path: test.info().outputPath("vendor-register-form.png"),
    fullPage: true,
  });
  await page.locator("#register-submit-btn").click();

  await page.waitForURL(/\/auth\/verify-otp/, { timeout: 20_000 });
  const otp = await waitForEmailOtp(logPath, logOffset, email);
  await fillOtpBoxes(page, otp);

  await page.waitForURL(/\/vendor\/(setup|dashboard)/, { timeout: 30_000 });
  await page.screenshot({
    path: test.info().outputPath("vendor-registration-redirect.png"),
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
  const otp = await waitForSmsOtp(logPath, logOffset, phone, "verify");
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

    const resetLink = await waitForResetLink(LIVE_CELERY_LOG, resetOffset, email);
    await page.goto(resetLink);
    await expect(page.locator("#pw-reset-submit")).toBeVisible({ timeout: 20_000 });
    await page.locator("#new-password").fill(EMAIL_RESET_PASSWORD);
    await page.locator("#confirm-password").fill(EMAIL_RESET_PASSWORD);
    await page.screenshot({
      path: test.info().outputPath("email-reset-confirm-form.png"),
      fullPage: true,
    });
    await page.locator("#pw-reset-submit").click();

    await waitForResetRedirectToSignIn(page);
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

    await waitForResetRedirectToSignIn(page);
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

  test("vendor email registration and OTP verification redirect into the vendor journey live", async ({
    page,
  }) => {
    const email = uniqueEmail("vendor-reset");

    await registerEmailVendor(page, email, INITIAL_PASSWORD, LIVE_CELERY_LOG);
  });
});
