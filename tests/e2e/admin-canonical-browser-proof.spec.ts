import fs from "node:fs";
import path from "node:path";

import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

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
  };
};

const seededAuthPath = path.resolve(
  process.cwd(),
  "tests/e2e/.tmp/seeded-auth.json",
);

function readSeededAuth(): Record<string, SeededAuthSession> {
  return JSON.parse(fs.readFileSync(seededAuthPath, "utf8")) as Record<string, SeededAuthSession>;
}

async function seedAuthenticatedSession(page: Page, session: SeededAuthSession) {
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
}

async function collectVisibleToastText(page: Page) {
  const toastLocator = page.locator("[data-sonner-toast]");
  const count = await toastLocator.count();
  if (!count) return [];

  const texts = await toastLocator.allTextContents();
  return texts
    .map((value) => value.replace(/\s+/g, " ").trim())
    .filter(Boolean);
}

async function gotoStable(page: Page, path: string) {
  let lastError: unknown;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      await page.goto(path, { waitUntil: "domcontentloaded" });
      await page.waitForLoadState("networkidle", { timeout: 30_000 }).catch(() => {});
      return;
    } catch (error) {
      lastError = error;
      const message = error instanceof Error ? error.message : String(error);
      if (!message.includes("ERR_ABORTED") || attempt === 2) {
        throw error;
      }
      await page.waitForTimeout(1500);
    }
  }

  throw lastError;
}

const ROUTES = [
  {
    path: "/admin-dashboard",
    heading: /Dashboard/i,
    screenshot: "browser-proof-admin-dashboard",
  },
  {
    path: "/admin-dashboard/authentication",
    heading: /Accounts Directory/i,
    screenshot: "browser-proof-admin-authentication",
  },
  {
    path: "/admin-dashboard/vendor",
    heading: /Sellers Boutique/i,
    screenshot: "browser-proof-admin-vendor",
  },
  {
    path: "/admin-dashboard/kyc",
    heading: /KYC Verification Desk/i,
    screenshot: "browser-proof-admin-kyc",
  },
  {
    path: "/admin-dashboard/product",
    heading: /Products Catalog/i,
    screenshot: "browser-proof-admin-product",
  },
  {
    path: "/admin-dashboard/order",
    heading: /Orders|Orders Management/i,
    screenshot: "browser-proof-admin-order",
  },
  {
    path: "/admin-dashboard/transactions",
    heading: /Platform Financial Ledger|Recent Transactions/i,
    screenshot: "browser-proof-admin-transactions",
  },
  {
    path: "/admin-dashboard/global-platform-settings",
    heading: /Platform Settings/i,
    screenshot: "browser-proof-admin-settings",
  },
];

test.describe.configure({ mode: "serial" });

test.describe("Admin canonical browser proof", () => {
  test.setTimeout(180_000);

  test("seeded admin can crawl the canonical admin routes with evidence capture", async ({ page }) => {
    const auth = readSeededAuth();
    const browserErrors: string[] = [];
    const consoleErrors: string[] = [];

    page.on("pageerror", (error) => browserErrors.push(error.message));
    page.on("console", (message) => {
      if (message.type() === "error") {
        consoleErrors.push(message.text());
      }
    });

    await seedAuthenticatedSession(page, auth.admin);

    for (const route of ROUTES) {
      await test.step(`crawl ${route.path}`, async () => {
        await gotoStable(page, route.path);

        await expect(page).toHaveURL(new RegExp(route.path.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), {
          timeout: 30_000,
        });
        await expect(page.locator("body")).toBeVisible();
        await expect(page.getByText(route.heading).first()).toBeVisible({ timeout: 30_000 });
        await expect(page.getByText(/Something went wrong/i)).toHaveCount(0);

        const toasts = await collectVisibleToastText(page);
        if (toasts.length > 0) {
          console.log(`[admin-browser-proof] ${route.path} visible messages: ${toasts.join(" | ")}`);
        }

        await page.screenshot({
          path: `tests/e2e/screenshots/${route.screenshot}.png`,
          fullPage: true,
          timeout: 30_000,
        });
      });
    }

    expect.soft(consoleErrors, "browser console errors").toEqual([]);
    expect.soft(browserErrors, "runtime page errors").toEqual([]);
  });
});
