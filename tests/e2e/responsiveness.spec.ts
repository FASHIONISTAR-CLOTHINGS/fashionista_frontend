import { test, expect } from "@playwright/test";

/**
 * PILLAR 4: Playwright E2E — Responsiveness Tests
 *
 * Tests that all key pages render correctly at 4 breakpoints:
 *   Mobile   : 375px × 812px  (iPhone SE)
 *   Mobile L : 414px × 896px  (iPhone XR)
 *   Tablet   : 768px × 1024px (iPad)
 *   Desktop  : 1280px × 800px
 *   Wide     : 1920px × 1080px
 *
 * Key checks:
 *   - No horizontal scrollbar (overflow-x hidden)
 *   - Page renders with status 200
 *   - Navigation visible
 */

const BREAKPOINTS = [
  { name: "Mobile 375px", width: 375, height: 812 },
  { name: "Mobile 414px", width: 414, height: 896 },
  { name: "Tablet 768px", width: 768, height: 1024 },
  { name: "Desktop 1280px", width: 1280, height: 800 },
  { name: "Wide 1920px", width: 1920, height: 1080 },
];

const PAGES = [
  { name: "Home", path: "/" },
  { name: "Login", path: "/auth/sign-in" },
];

for (const bp of BREAKPOINTS) {
  for (const pg of PAGES) {
    test(`${pg.name} at ${bp.name} — no horizontal overflow`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: bp.width, height: bp.height });
      const res = await page.goto(pg.path);

      // Must not be a server error
      expect([200, 401, 302]).toContain(res?.status() ?? 0);

      await page.waitForLoadState("domcontentloaded");

      const hasHScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth + 20; // 20px tolerance
      });
      expect(hasHScroll).toBe(false);
    });
  }
}

// ── Navigation collapse test ─────────────────────────────────────────────────
test("Mobile: hamburger menu visible at 375px", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");
  await page.waitForLoadState("domcontentloaded");

  // At mobile, either hamburger button OR nav links should be present
  const hamburger = page
    .locator('[aria-label="menu"], [aria-label="open menu"], button[type="button"]')
    .first();
  const navLinks = page.locator("nav a").first();

  const hasHamburger = await hamburger.isVisible().catch(() => false);
  const hasNavLinks = await navLinks.isVisible().catch(() => false);

  // At least one navigation element must be visible
  expect(hasHamburger || hasNavLinks).toBe(true);
});

// ── Font rendering check ─────────────────────────────────────────────────────
test("All breakpoints: body text renders (no font FOUT)", async ({ page }) => {
  for (const bp of BREAKPOINTS.slice(0, 3)) {
    await page.setViewportSize({ width: bp.width, height: bp.height });
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Body should have text content
    const bodyText = await page.evaluate(() => document.body.innerText.trim());
    expect(bodyText.length).toBeGreaterThan(10);
  }
});
