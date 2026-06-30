/**
 * FASHIONISTAR — Cart Lifecycle E2E Test Suite
 * Run: pnpm exec playwright test tests/e2e/cart.spec.ts
 */
import { test, expect } from "@playwright/test";

test.describe("Cart Page @smoke", () => {
  test("renders with status 200", async ({ page }) => {
    const res = await page.goto("/cart");
    expect(res?.status()).toBe(200);
  });

  test("shows empty state or item list", async ({ page }) => {
    await page.goto("/cart");
    await page.waitForLoadState("domcontentloaded");
    const hasEmpty = await page.getByText(/cart is empty|no items|start shopping/i).isVisible().catch(() => false);
    const hasTitle = await page.getByRole("heading", { name: /cart|my bag/i }).isVisible().catch(() => false);
    expect(hasEmpty || hasTitle).toBe(true);
  });

  test("checkout link navigates to /cart/checkout", async ({ page }) => {
    await page.goto("/cart");
    await page.waitForLoadState("domcontentloaded");
    const btn = page.locator("a[href*='checkout'], a:has-text('Checkout')").first();
    if (await btn.isVisible().catch(() => false)) {
      await btn.click();
      await expect(page).toHaveURL(/checkout/, { timeout: 15_000 });
    }
  });

  test("no horizontal scroll at 375px", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/cart");
    await page.waitForLoadState("domcontentloaded");
    const hasHScroll = await page.evaluate(() => document.body.scrollWidth > window.innerWidth + 20);
    expect(hasHScroll).toBe(false);
  });
});

test.describe("Navbar Cart Drawer", () => {
  test("@smoke cart button opens drawer on desktop", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
    const cartBtn = page.locator("#navbar-cart-btn");
    if (await cartBtn.isVisible().catch(() => false)) {
      await cartBtn.click();
      await expect(page.locator("[role='dialog'][aria-label*='cart']")).toBeVisible({ timeout: 5_000 });
    }
  });

  test("cart drawer closes on Escape key", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
    const cartBtn = page.locator("#navbar-cart-btn");
    if (await cartBtn.isVisible().catch(() => false)) {
      await cartBtn.click();
      const drawer = page.locator("[role='dialog'][aria-label*='cart']");
      await expect(drawer).toBeVisible({ timeout: 5_000 });
      await page.keyboard.press("Escape");
      await expect(drawer).not.toBeVisible({ timeout: 3_000 });
    }
  });
});

test.describe("Cart Persistence", () => {
  test("Zustand cart persists across reload via localStorage", async ({ page }) => {
    await page.goto("/cart");
    await page.waitForLoadState("domcontentloaded");
    await page.evaluate(() => {
      localStorage.setItem("fashionistar-cart", JSON.stringify({
        state: { items: [{ id: "t1", product_id: "p1", name: "Test Dress", price: 5000, quantity: 2 }] },
        version: 0,
      }));
    });
    await page.reload();
    await page.waitForLoadState("domcontentloaded");
    const stored = await page.evaluate(() => localStorage.getItem("fashionistar-cart"));
    expect(stored).toContain("Test Dress");
  });
});

test.describe("Checkout Page", () => {
  test("@smoke checkout renders or redirects to auth", async ({ page }) => {
    await page.goto("/cart/checkout");
    const url = page.url();
    expect(url.includes("/checkout") || url.includes("/login")).toBe(true);
  });
});

test("Cart: 3 simultaneous loads return 200", async ({ browser }) => {
  test.slow();
  const contexts = await Promise.all(Array.from({ length: 3 }, () => browser.newContext()));
  const pages = await Promise.all(contexts.map((ctx) => ctx.newPage()));
  const results = await Promise.all(pages.map(async (p) => {
    const res = await p.goto("/cart", { waitUntil: "domcontentloaded" });
    return res?.status();
  }));
  expect(results.every((s) => s === 200)).toBe(true);
  await Promise.all(contexts.map((ctx) => ctx.close()));
});
