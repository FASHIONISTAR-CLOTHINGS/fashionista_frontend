import fs from "node:fs";
import path from "node:path";

import { expect, test } from "@playwright/test";
import type { BrowserContext, Page } from "@playwright/test";

type SeededAuthSession = {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    role: string;
    is_staff: boolean;
    first_name: string;
    last_name: string;
    is_verified: boolean;
    has_vendor_profile?: boolean;
    has_client_profile?: boolean;
  };
};

const SEEDED_AUTH_PATH = path.resolve(
  process.cwd(),
  "tests/e2e/.tmp/seeded-auth.json",
);

function readSeededAuth(): Record<string, SeededAuthSession> {
  return JSON.parse(fs.readFileSync(SEEDED_AUTH_PATH, "utf8")) as Record<
    string,
    SeededAuthSession
  >;
}

async function seedAuthenticatedSession(
  page: Page,
  context: BrowserContext,
  session: SeededAuthSession,
) {
  await page.addInitScript((payload: SeededAuthSession) => {
    window.sessionStorage.setItem(
      "fashionistar-auth",
      JSON.stringify({
        state: {
          accessToken: payload.accessToken,
          refreshToken: payload.refreshToken,
          user: payload.user,
          isAuthenticated: true,
        },
      }),
    );
  }, session);

  await context.addCookies([
    {
      name: "fashionistar_auth_hint",
      value: "1",
      domain: "localhost",
      path: "/",
    },
    {
      name: "fashionistar_role",
      value: session.user.role,
      domain: "localhost",
      path: "/",
    },
  ]);
}

test.describe("Auth-aware guest pages and commerce role guards", () => {
  test("authenticated admin is redirected away from guest auth pages", async ({
    page,
    context,
  }) => {
    const auth = readSeededAuth();
    await seedAuthenticatedSession(page, context, auth.admin);

    await page.goto("/auth/forgot-password?returnUrl=%2Fcart");
    await expect(page).toHaveURL(/\/admin-dashboard/, { timeout: 20_000 });
    await expect(page.locator("body")).toBeVisible();
  });

  test("authenticated vendor is redirected away from choose-role", async ({
    page,
    context,
  }) => {
    const auth = readSeededAuth();
    await seedAuthenticatedSession(page, context, auth.vendor);

    await page.goto("/auth/choose-role?returnUrl=%2Fwishlist");
    await expect(page).toHaveURL(/\/vendor\/(dashboard|setup)/, {
      timeout: 20_000,
    });
    await expect(page.locator("body")).toBeVisible();
  });

  test("authenticated admin cannot open cart, checkout, or wishlist", async ({
    page,
    context,
  }) => {
    const auth = readSeededAuth();
    await seedAuthenticatedSession(page, context, auth.admin);

    for (const route of ["/cart", "/cart/checkout", "/wishlist"]) {
      await page.goto(route);
      await expect(page).toHaveURL(/\/admin-dashboard/, { timeout: 20_000 });
    }
  });

  test("authenticated vendor cannot open cart, checkout, or wishlist", async ({
    page,
    context,
  }) => {
    const auth = readSeededAuth();
    await seedAuthenticatedSession(page, context, auth.vendor);

    for (const route of ["/cart", "/cart/checkout", "/wishlist"]) {
      await page.goto(route);
      await expect(page).toHaveURL(/\/vendor\/(dashboard|setup)/, {
        timeout: 20_000,
      });
    }
  });
});
