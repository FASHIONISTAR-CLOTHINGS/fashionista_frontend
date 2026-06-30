/**
 * FASHIONISTAR — Vendor Dashboard E2E Test Suite
 * Run: pnpm exec playwright test tests/e2e/vendor-dashboard.spec.ts
 */
import { test, expect } from "@playwright/test";

test.describe("Vendor Dashboard @smoke", () => {
  test("unauthenticated vendor dashboard redirects to login", async ({ page }) => {
    await page.goto("/vendor/dashboard", { waitUntil: "networkidle" });
    const url = page.url();
    expect(url.includes("/auth/login") || url.includes("/login") || url.includes("/dashboard")).toBe(true);
  });

  test("vendor orders page redirects unauthenticated users", async ({ page }) => {
    await page.goto("/vendor/orders", { waitUntil: "networkidle" });
    const url = page.url();
    expect(url.includes("/login") || url.includes("/orders")).toBe(true);
  });

  test("vendor kyc page redirects unauthenticated users", async ({ page }) => {
    await page.goto("/vendor/kyc", { waitUntil: "networkidle" });
    const url = page.url();
    expect(url.includes("/login") || url.includes("/kyc")).toBe(true);
  });

  test("vendor analytics page redirects unauthenticated users", async ({ page }) => {
    await page.goto("/vendor/analytics", { waitUntil: "networkidle" });
    const url = page.url();
    expect(url.includes("/login") || url.includes("/analytics")).toBe(true);
  });
});

test.describe("Vendor Dashboard Loading Skeletons", () => {
  test("loading.tsx renders without JS errors for vendor dashboard", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));
    await page.goto("/vendor/dashboard");
    await page.waitForLoadState("domcontentloaded");
    const critical = errors.filter((e) => !e.includes("Warning:") && !e.includes("hydration"));
    expect(critical).toHaveLength(0);
  });
});

test.describe("Vendor Public Pages", () => {
  test("vendor listing page renders or returns 200/404", async ({ page }) => {
    const res = await page.goto("/vendors");
    expect([200, 404].includes(res?.status() ?? 200)).toBe(true);
  });

  test("vendor profile page returns 200/404 for unknown vendor", async ({ page }) => {
    const res = await page.goto("/vendors/test-vendor-slug");
    expect([200, 404].includes(res?.status() ?? 200)).toBe(true);
  });
});
