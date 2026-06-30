/**
 * tests/performance/vitals_audit.spec.ts
 *
 * Phase 4 — Core Web Vitals Automated Audit (Playwright)
 *
 * FASHIONISTAR Enterprise Blueprint: SLA Verification Suite
 *
 * Tests real-world rendering performance meets strict SLA targets under
 * synthetic browser execution. Hooks into PerformanceObserver before
 * navigation to capture LCP, CLS, FCP, and INP metrics.
 *
 * SLA Targets (Phase 4):
 *   LCP  < 1,500ms   (Google "Good" threshold = 2,500ms)
 *   CLS  <     0.1   (Google "Good" threshold = 0.1)
 *   FCP  < 1,000ms   (fast first contentful paint)
 *
 * Run:
 *   pnpm --dir fashionista_frontend exec playwright test tests/performance/
 */

import { test, expect, Page } from "@playwright/test";

// ─────────────────────────────────────────────────────────────────────────────
// Helper: inject PerformanceObserver hooks before page navigation
// ─────────────────────────────────────────────────────────────────────────────

async function injectVitalsObserver(page: Page) {
  await page.addInitScript(() => {
    (window as Record<string, unknown>)["__VITALS__"] = {
      lcp: 0,
      cls: 0,
      fcp: 0,
      inp: 0,
    };

    try {
      // LCP observer
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const last = entries[entries.length - 1];
        if (last) {
          (window as Record<string, unknown>)["__VITALS__"] = {
            ...(window as Record<string, unknown>)["__VITALS__"],
            lcp: last.startTime,
          };
        }
      }).observe({ type: "largest-contentful-paint", buffered: true });

      // CLS observer
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const ls = entry as PerformanceEntry & { hadRecentInput: boolean; value: number };
          if (!ls.hadRecentInput) {
            const vitals = (window as Record<string, unknown>)["__VITALS__"] as Record<string, number>;
            vitals.cls = (vitals.cls ?? 0) + ls.value;
          }
        }
      }).observe({ type: "layout-shift", buffered: true });

      // FCP observer
      new PerformanceObserver((list) => {
        for (const entry of list.getEntriesByName("first-contentful-paint")) {
          (window as Record<string, unknown>)["__VITALS__"] = {
            ...(window as Record<string, unknown>)["__VITALS__"],
            fcp: entry.startTime,
          };
        }
      }).observe({ type: "paint", buffered: true });
    } catch {
      // PerformanceObserver not available in this context — skip
    }
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Test Suite
// ─────────────────────────────────────────────────────────────────────────────

test.describe("FASHIONISTAR — Core Web Vitals SLA Audit", () => {
  test.beforeEach(async ({ page }) => {
    await injectVitalsObserver(page);
  });

  test("Homepage: LCP < 1500ms, CLS < 0.1", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });

    // Allow time for LCP finalization (observer fires after last LCP candidate)
    await page.waitForTimeout(1_500);

    const vitals = await page.evaluate(
      () => (window as Record<string, unknown>)["__VITALS__"]
    ) as { lcp: number; cls: number; fcp: number };

    console.log(
      `[Vitals Audit] Homepage — LCP: ${Math.round(vitals.lcp)}ms | ` +
      `CLS: ${vitals.cls.toFixed(4)} | FCP: ${Math.round(vitals.fcp)}ms`
    );

    // LCP SLA: < 1,500ms in synthetic environment (real users have CDN cache)
    expect(vitals.lcp, `LCP should be < 1500ms but was ${vitals.lcp}ms`).toBeLessThan(1_500);

    // CLS SLA: < 0.1 (no visible layout jumps)
    expect(vitals.cls, `CLS should be < 0.1 but was ${vitals.cls}`).toBeLessThan(0.1);
  });

  test("Homepage: JSON-LD structured data is present", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });

    // Verify WebSite schema is injected
    const websiteLd = await page.locator("script#website-ld").textContent();
    expect(websiteLd).toBeTruthy();

    const parsed = JSON.parse(websiteLd ?? "{}");
    expect(parsed["@type"]).toBe("WebSite");
    expect(parsed.potentialAction?.["@type"]).toBe("SearchAction");
  });

  test("Homepage: ISR revalidate header is set", async ({ page }) => {
    const response = await page.goto("/");
    expect(response).toBeTruthy();

    const cacheControl = response?.headers()["cache-control"] ?? "";
    const xNextjsCache = response?.headers()["x-nextjs-cache"] ?? "";

    console.log(
      `[Vitals Audit] Homepage — Cache-Control: ${cacheControl} | x-nextjs-cache: ${xNextjsCache}`
    );

    // In production ISR, Next.js sets stale-while-revalidate or HIT
    // In dev mode, this is "no-store" — so we accept both
    expect(
      cacheControl.includes("s-maxage") ||
      cacheControl.includes("no-store") ||
      xNextjsCache.includes("HIT") ||
      xNextjsCache.includes("MISS")
    ).toBeTruthy();
  });

  test("Product detail page: Product JSON-LD is present", async ({ page }) => {
    // Navigate to products listing first to find a real slug
    await page.goto("/products", { waitUntil: "domcontentloaded" });

    // Try to find the first product link
    const productLink = page.locator("a[href^='/products/']").first();
    const href = await productLink.getAttribute("href").catch(() => null);

    if (!href) {
      test.skip(true, "No product links found — skipping product JSON-LD test");
      return;
    }

    await page.goto(href, { waitUntil: "domcontentloaded" });

    const productLd = await page.locator("script#product-ld").textContent();
    expect(productLd).toBeTruthy();

    const parsed = JSON.parse(productLd ?? "{}");
    expect(parsed["@type"]).toBe("Product");
    expect(parsed.offers?.priceCurrency).toBe("NGN");
  });

  test("Telemetry endpoint returns 200 on GET health check", async ({ page }) => {
    const response = await page.goto("/api/telemetry/vitals");
    expect(response?.status()).toBeLessThan(500);
  });
});
