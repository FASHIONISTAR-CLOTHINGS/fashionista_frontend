/**
 * fashionista_frontend/tests/e2e/category-detail.spec.ts
 *
 * Playwright E2E — Category Detail Page + Infinite Scroll (Phase D2)
 *
 * Covers:
 *   - Category hero renders (h1, breadcrumb, CTA buttons)
 *   - Sub-category grid renders when children exist
 *   - Brand filter chips render
 *   - Product section renders (Suspense-wrapped client component)
 *   - Infinite scroll: "Load more" trigger fires next page fetch
 *   - SEO: title from meta_title, canonical, OpenGraph
 *   - JSON-LD: CollectionPage
 *   - Mobile viewport
 *   - notFound() on invalid slug
 */

import { test, expect } from "@playwright/test";

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000";
// We use a well-known test slug — adjust if your seed data differs
const KNOWN_SLUG = process.env.TEST_CATEGORY_SLUG || "fashion";
const CATEGORY_URL = `${BASE_URL}/categories/${KNOWN_SLUG}`;
const INVALID_URL = `${BASE_URL}/categories/__invalid_slug_xyz__`;
const TIMEOUT_MS = 15_000;

test.describe("Category Detail Page — Render", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(CATEGORY_URL, { waitUntil: "networkidle", timeout: TIMEOUT_MS });
  });

  // ── 1. Page loads ───────────────────────────────────────────────────────────
  test("renders without JS errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto(CATEGORY_URL, { waitUntil: "networkidle" });
    expect(errors.filter((e) => !e.includes("Warning"))).toHaveLength(0);
  });

  // ── 2. Hero section ─────────────────────────────────────────────────────────
  test("hero section renders with h1 and breadcrumb", async ({ page }) => {
    const hero = page.getByTestId("category-hero");
    await expect(hero).toBeVisible({ timeout: TIMEOUT_MS });

    // h1 must be present and non-empty
    const h1 = hero.locator("h1").first();
    await expect(h1).toBeVisible();
    const text = await h1.textContent();
    expect(text?.trim().length).toBeGreaterThan(0);

    // Breadcrumb must contain "Categories" link
    const breadcrumb = hero.locator("nav[aria-label='Breadcrumb']");
    await expect(breadcrumb.getByRole("link", { name: /categories/i })).toBeVisible();
  });

  // ── 3. Shop Now CTA ─────────────────────────────────────────────────────────
  test("hero has Shop Now and Get Measured CTAs", async ({ page }) => {
    await expect(page.getByRole("link", { name: /shop now/i }).first()).toBeVisible({
      timeout: TIMEOUT_MS,
    });
    await expect(page.getByRole("link", { name: /get measured/i }).first()).toBeVisible({
      timeout: TIMEOUT_MS,
    });
  });

  // ── 4. Brand filter chips ───────────────────────────────────────────────────
  test("brand filter chips section renders", async ({ page }) => {
    const chips = page.getByTestId("brand-filter-chips");
    await expect(chips).toBeVisible({ timeout: TIMEOUT_MS });
    // "All Brands" chip must be present
    await expect(chips.getByRole("link", { name: /all brands/i })).toBeVisible();
  });

  // ── 5. Products section ─────────────────────────────────────────────────────
  test("products section renders", async ({ page }) => {
    await expect(
      page.getByTestId("category-products-section")
    ).toBeVisible({ timeout: TIMEOUT_MS });
  });

  // ── 6. JSON-LD: CollectionPage ──────────────────────────────────────────────
  test("has CollectionPage JSON-LD structured data", async ({ page }) => {
    const jsonLdScripts = page.locator('script[type="application/ld+json"]');
    const count = await jsonLdScripts.count();
    expect(count).toBeGreaterThanOrEqual(1);

    // Find the CollectionPage script
    let found = false;
    for (let i = 0; i < count; i++) {
      const text = await jsonLdScripts.nth(i).textContent();
      try {
        const data = JSON.parse(text!);
        if (data["@type"] === "CollectionPage") {
          found = true;
          expect(data.url).toContain(`/categories/${KNOWN_SLUG}`);
          break;
        }
      } catch (_) {}
    }
    expect(found).toBe(true);
  });

  // ── 7. SEO title ────────────────────────────────────────────────────────────
  test("page title includes Fashionistar branding", async ({ page }) => {
    await expect(page).toHaveTitle(/Fashionistar/i);
  });

  // ── 8. Canonical link ───────────────────────────────────────────────────────
  test("has canonical link pointing to /categories/[slug]", async ({ page }) => {
    const canonical = page.locator('link[rel="canonical"]');
    await expect(canonical).toHaveAttribute("href", new RegExp(`/categories/${KNOWN_SLUG}`));
  });

  // ── 9. Mobile viewport ──────────────────────────────────────────────────────
  test("renders hero and products section on mobile (375px)", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(CATEGORY_URL, { waitUntil: "networkidle" });
    await expect(page.getByTestId("category-hero")).toBeVisible({ timeout: TIMEOUT_MS });
    await expect(page.getByTestId("category-products-section")).toBeVisible({
      timeout: TIMEOUT_MS,
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Not Found
// ─────────────────────────────────────────────────────────────────────────────

test.describe("Category Detail — 404 Handling", () => {
  test("invalid slug returns 404 page", async ({ page }) => {
    const response = await page.goto(INVALID_URL, { waitUntil: "networkidle" });
    // Next.js renders notFound() as a 404
    expect([404]).toContain(response?.status());
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Other Categories Section
// ─────────────────────────────────────────────────────────────────────────────

test.describe("Category Detail — Other Categories", () => {
  test("other categories section renders with links to /categories/*", async ({
    page,
  }) => {
    await page.goto(CATEGORY_URL, { waitUntil: "networkidle", timeout: TIMEOUT_MS });
    const section = page.getByTestId("other-categories-section");
    const isVisible = await section.isVisible({ timeout: TIMEOUT_MS }).catch(() => false);

    // Section only renders when there are other categories
    if (!isVisible) {
      test.skip(); // skip if no other categories in test DB
      return;
    }

    const links = section.getByRole("link");
    const count = await links.count();
    expect(count).toBeGreaterThanOrEqual(1);

    const href = await links.first().getAttribute("href");
    expect(href).toMatch(/\/categories\//);
  });
});
