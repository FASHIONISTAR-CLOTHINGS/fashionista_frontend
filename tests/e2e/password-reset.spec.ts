import { expect, test } from "@playwright/test";

/**
 * Password Reset — Focused browser validation with visual artifacts
 *
 * This suite covers the remaining reset flows after login/register/OTP were
 * already validated manually. Screenshots are captured at the critical success
 * states, and video is enabled for this suite to preserve browser evidence.
 */

test.use({ video: "on" });

test.describe("Auth — Password Reset", () => {
  test("Email reset request shows check-email state and login link navigates on first click", async ({
    page,
  }) => {
    await page.route("**/api/v1/password/reset-request/", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          message: "If the account exists, a reset link has been sent.",
        }),
      });
    });

    await page.goto("/auth/forgot-password");
    await page.waitForLoadState("domcontentloaded");

    await page.locator("#reset-email").fill("reset@fashionistar.com");
    await page.locator("#reset-submit-btn").click();

    await expect(
      page.getByRole("heading", { name: /check your email/i }),
    ).toBeVisible({
      timeout: 10_000,
    });
    await page.screenshot({
      path: test.info().outputPath("forgot-password-email-success.png"),
      fullPage: true,
    });

    await page.locator("#back-to-login-btn").click();
    await page.waitForURL(/\/auth\/sign-in$/, { timeout: 10_000 });
    await expect(page.locator("#login-submit-btn")).toBeVisible({
      timeout: 10_000,
    });
  });

  test("Phone reset request navigates to the confirm-phone page", async ({
    page,
  }) => {
    await page.route("**/api/v1/password/reset-request/", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          message: "If the account exists, an SMS code has been sent.",
        }),
      });
    });

    await page.goto("/auth/forgot-password");
    await page.waitForLoadState("domcontentloaded");

    await page.locator("#reset-tab-phone").click();
    await page.locator("#reset-phone").fill("8012345678");
    await page.locator("#reset-submit-btn").click();

    await page.waitForURL(/\/auth\/forgot-password\/confirm-phone$/, {
      timeout: 10_000,
    });
    await expect(page.locator("#pw-reset-submit")).toBeVisible({
      timeout: 10_000,
    });
    await page.screenshot({
      path: test.info().outputPath("forgot-password-phone-confirm-page.png"),
      fullPage: true,
    });
  });

  test("Phone reset confirm submits and hard-navigates back to sign-in", async ({
    page,
  }) => {
    await page.route("**/api/v1/password/reset-phone-confirm/", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          message: "Password reset successful!",
        }),
      });
    });

    await page.goto("/auth/forgot-password/confirm-phone");
    await page.waitForLoadState("domcontentloaded");

    await page.locator("#phone-otp").fill("164750");
    await page.locator("#new-password").fill("StrongPass123!");
    await page.locator("#confirm-password").fill("StrongPass123!");
    await page.locator("#pw-reset-submit").click();

    await expect(
      page.getByRole("button", { name: /redirecting to sign in/i }),
    ).toBeVisible({
      timeout: 10_000,
    });
    await page.screenshot({
      path: test.info().outputPath("forgot-password-phone-success.png"),
      fullPage: true,
    });

    await page.waitForURL(/\/auth\/sign-in$/, { timeout: 10_000 });
    await expect(page.locator("#login-submit-btn")).toBeVisible({
      timeout: 10_000,
    });
  });

  test("Email reset confirm submits and hard-navigates back to sign-in", async ({
    page,
  }) => {
    await page.route("**/api/v1/password/reset-confirm/demo-user/demo-token/", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          message: "Password reset successful!",
        }),
      });
    });

    await page.goto("/auth/forgot-password/confirm-email/demo-user/demo-token");
    await page.waitForLoadState("domcontentloaded");

    await page.locator("#new-password").fill("StrongPass123!");
    await page.locator("#confirm-password").fill("StrongPass123!");
    await page.locator("#pw-reset-submit").click();

    await expect(
      page.getByRole("button", { name: /redirecting to sign in/i }),
    ).toBeVisible({
      timeout: 10_000,
    });
    await page.screenshot({
      path: test.info().outputPath("forgot-password-email-success.png"),
      fullPage: true,
    });

    await page.waitForURL(/\/auth\/sign-in$/, { timeout: 10_000 });
    await expect(page.locator("#login-submit-btn")).toBeVisible({
      timeout: 10_000,
    });
  });

  test("Reset-page sign-in links navigate on the first click", async ({
    page,
  }) => {
    await page.goto("/auth/forgot-password");
    await page.waitForLoadState("domcontentloaded");

    await page.getByRole("link", { name: /sign in/i }).click();
    await page.waitForURL(/\/auth\/sign-in$/, { timeout: 10_000 });
    await expect(page.locator("#login-submit-btn")).toBeVisible({
      timeout: 10_000,
    });

    await page.goto("/auth/forgot-password/confirm-email/demo-user/demo-token");
    await page.waitForLoadState("domcontentloaded");

    await page.getByRole("link", { name: /sign in/i }).click();
    await page.waitForURL(/\/auth\/sign-in$/, { timeout: 10_000 });
    await expect(page.locator("#login-submit-btn")).toBeVisible({
      timeout: 10_000,
    });
  });

  test("Malformed legacy confirm-email typo redirects to the canonical page", async ({
    page,
  }) => {
    await page.goto("/auth/forgot-password/c=onfirm-email/demo-user/demo-token");
    await page.waitForURL(/\/auth\/forgot-password\/confirm-email\/demo-user\/demo-token$/, {
      timeout: 10_000,
    });
    await expect(page.locator("#pw-reset-submit")).toBeVisible({
      timeout: 10_000,
    });
    await page.screenshot({
      path: test.info().outputPath("forgot-password-canonical-confirm-email.png"),
      fullPage: true,
    });
  });
});
