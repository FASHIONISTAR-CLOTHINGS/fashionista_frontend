import { expect, test } from "@playwright/test";

const ADMIN_EMAIL =
  process.env.PW_LIVE_ADMIN_EMAIL ?? "admin@fashionistar.io";
const ADMIN_PASSWORD =
  process.env.PW_LIVE_ADMIN_PASSWORD ?? "FashionAdmin2026!";

test.use({ video: "on" });
test.describe.configure({ mode: "serial" });

test.describe("Auth — Admin Live Login and Commerce Blocking", () => {
  test("admin signs in through the live auth form and stays blocked from commerce routes", async ({
    page,
  }) => {
    await page.goto("/auth/sign-in");
    await page.waitForLoadState("domcontentloaded");

    await page.locator("#login-email").fill(ADMIN_EMAIL);
    await page.locator("#login-password").fill(ADMIN_PASSWORD);
    await page.screenshot({
      path: test.info().outputPath("admin-login-form.png"),
      fullPage: true,
    });

    await page.locator("#login-submit-btn").click();
    await page.waitForURL(/\/admin-dashboard$/, { timeout: 30_000 });
    await expect(page.locator("body")).toBeVisible();
    await page.screenshot({
      path: test.info().outputPath("admin-dashboard-after-login.png"),
      fullPage: true,
    });

    for (const route of ["/cart", "/cart/checkout", "/wishlist", "/orders"]) {
      await page.goto(route);
      await page.waitForURL(/\/admin-dashboard$/, { timeout: 20_000 });
    }

    await page.screenshot({
      path: test.info().outputPath("admin-commerce-blocked.png"),
      fullPage: true,
    });
  });
});
