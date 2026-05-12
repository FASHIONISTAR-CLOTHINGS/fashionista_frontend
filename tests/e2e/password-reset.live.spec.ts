import fs from "node:fs/promises";

import { expect, test } from "@playwright/test";

const LIVE_EMAIL = process.env.PW_RESET_EMAIL ?? "";
const LIVE_NEW_PASSWORD = process.env.PW_RESET_NEW_PASSWORD ?? "";
const LIVE_CELERY_LOG = process.env.PW_RESET_CELERY_LOG ?? "";
const LIVE_PHONE = process.env.PW_RESET_PHONE ?? "+2348012345678";
const LIVE_FRONTEND_URL = process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3100";

async function getLogOffset(logPath: string) {
  try {
    const stats = await fs.stat(logPath);
    return stats.size;
  } catch {
    return 0;
  }
}

async function waitForResetLink(logPath: string, offset: number, timeoutMs = 45_000) {
  const startedAt = Date.now();
  const linkPattern =
    /(https?:\/\/[^\s"'<>]*\/auth\/forgot-password\/confirm-email\/[A-Za-z0-9_\-=]+\/[A-Za-z0-9\-_=]+|\/auth\/forgot-password\/confirm-email\/[A-Za-z0-9_\-=]+\/[A-Za-z0-9\-_=]+)/;

  while (Date.now() - startedAt < timeoutMs) {
    const content = await fs.readFile(logPath, "utf8");
    const appended = content.slice(offset).replaceAll("&amp;", "&");
    const match = appended.match(linkPattern);

    if (match?.[0]) {
      return match[0].startsWith("http") ? match[0] : `${LIVE_FRONTEND_URL}${match[0]}`;
    }

    await new Promise((resolve) => setTimeout(resolve, 1_000));
  }

  throw new Error(`Timed out waiting for a reset link in ${logPath}`);
}

test.use({ video: "on" });
test.describe.configure({ mode: "serial" });

test.describe("Auth — Password Reset Live Fullstack", () => {
  test.skip(
    !LIVE_EMAIL || !LIVE_NEW_PASSWORD || !LIVE_CELERY_LOG,
    "Set PW_RESET_EMAIL, PW_RESET_NEW_PASSWORD, and PW_RESET_CELERY_LOG for the live reset suite.",
  );

  test("email reset completes end-to-end against the live backend", async ({ page }) => {
    const logOffset = await getLogOffset(LIVE_CELERY_LOG);

    await page.goto("/auth/forgot-password");
    await page.waitForLoadState("domcontentloaded");

    await page.locator("#reset-email").fill(LIVE_EMAIL);
    await page.locator("#reset-submit-btn").click();

    await expect(
      page.getByRole("heading", { name: /check your email/i }),
    ).toBeVisible({ timeout: 15_000 });
    await page.screenshot({
      path: test.info().outputPath("live-reset-email-request-success.png"),
      fullPage: true,
    });

    const resetLink = await waitForResetLink(LIVE_CELERY_LOG, logOffset);

    await page.goto(resetLink);
    await page.waitForLoadState("domcontentloaded");
    await expect(page.locator("#pw-reset-submit")).toBeVisible({ timeout: 15_000 });
    await page.screenshot({
      path: test.info().outputPath("live-reset-email-confirm-page.png"),
      fullPage: true,
    });

    await page.locator("#new-password").fill(LIVE_NEW_PASSWORD);
    await page.locator("#confirm-password").fill(LIVE_NEW_PASSWORD);
    await page.locator("#pw-reset-submit").click();

    await expect(
      page.getByRole("button", { name: /redirecting to sign in/i }),
    ).toBeVisible({ timeout: 15_000 });
    await page.screenshot({
      path: test.info().outputPath("live-reset-email-confirm-success.png"),
      fullPage: true,
    });

    await page.waitForURL(/\/auth\/sign-in$/, { timeout: 20_000 });
    await page.locator("#login-email").fill(LIVE_EMAIL);
    await page.locator("#login-password").fill(LIVE_NEW_PASSWORD);
    await page.locator("#login-submit-btn").click();

    await page.waitForURL(/\/(client\/dashboard|vendor\/dashboard|admin-dashboard)/, {
      timeout: 20_000,
    });
    await page.screenshot({
      path: test.info().outputPath("live-reset-login-success.png"),
      fullPage: true,
    });
  });

  test("phone reset request reaches the confirm-phone page against the live backend", async ({
    page,
  }) => {
    await page.goto("/auth/forgot-password");
    await page.waitForLoadState("domcontentloaded");

    await page.locator("#reset-tab-phone").click();
    await page.locator("#reset-phone").fill(LIVE_PHONE);
    await page.locator("#reset-submit-btn").click();

    await page.waitForURL(/\/auth\/forgot-password\/confirm-phone$/, {
      timeout: 15_000,
    });
    await expect(page.locator("#pw-reset-submit")).toBeVisible({ timeout: 15_000 });
    await page.screenshot({
      path: test.info().outputPath("live-reset-phone-confirm-page.png"),
      fullPage: true,
    });
  });
});
