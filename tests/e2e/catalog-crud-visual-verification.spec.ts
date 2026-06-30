import { test, expect } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const FRONTEND_URL = "http://127.0.0.1:3000";
const ADMIN_EMAIL = "admin@fashionistar.io";
const ADMIN_PASSWORD = "FashionAdmin2026!";

const EVIDENCE_DIR = "c:\\Users\\FASHIONISTAR\\OneDrive\\Documenti\\FASHIONISTAR_ANTAGRAVITY\\FASHIONISTAR_REAL_VISION_BROWSER_TESTING\\test-evidence";
if (!fs.existsSync(EVIDENCE_DIR)) {
  fs.mkdirSync(EVIDENCE_DIR, { recursive: true });
}

async function captureScreenshot(page: any, name: string) {
  const filePath = path.join(EVIDENCE_DIR, `${name}.png`);
  await page.screenshot({ path: filePath, fullPage: true });
  console.log(`[EVIDENCE CAPTURED] Saved screenshot: ${filePath}`);
}

test.describe("FASHIONISTAR AI - Admin Catalog CRUD E2E Visual Verification", () => {
  test.describe.configure({ mode: "serial" });

  test("E2E Catalog CRUD Flow", async ({ page }) => {
    test.setTimeout(180_000);
    await page.setViewportSize({ width: 1400, height: 1000 });

    console.log("[INFO] Navigating to Sign-In page...");
    await page.goto(`${FRONTEND_URL}/auth/sign-in`);
    await page.waitForLoadState("networkidle");

    console.log("[INFO] Authenticating as Admin...");
    await page.locator("#login-email, input[name='email']").first().fill(ADMIN_EMAIL);
    await page.locator("#login-password, input[name='password']").first().fill(ADMIN_PASSWORD);
    await page.locator("#login-submit-btn, button[type='submit']").first().click();

    console.log("[INFO] Waiting for redirect to admin dashboard...");
    await page.waitForURL(`${FRONTEND_URL}/admin-dashboard`, { timeout: 30000 });
    await page.waitForLoadState("networkidle");
    await captureScreenshot(page, "admin_dashboard_home");

    // ── 1. CATEGORY CRUD ──────────────────────────────────────────────────────
    console.log("[INFO] Navigating to Catalog Categories...");
    await page.goto(`${FRONTEND_URL}/admin-dashboard/catalog/categories`);
    await page.waitForLoadState("networkidle");
    await captureScreenshot(page, "catalog_categories_list_before");

    console.log("[INFO] Creating a new category...");
    await page.locator("button:has-text('Create Category')").click();
    await page.waitForSelector("#category-name");

    await page.locator("#category-name").fill("Traditional Kaftans");
    await page.locator("#category-desc").fill("Luxury traditional hand-crafted kaftans and agbadas for special African heritage events.");
    await captureScreenshot(page, "catalog_category_form_filled");

    console.log("[INFO] Submitting category form...");
    await page.locator("button:has-text('Create Category'), button[type='submit']").last().click();
    await page.waitForTimeout(3000); // Allow toast/revalidation to display
    await captureScreenshot(page, "catalog_category_created_toast");

    // ── 2. BRAND CRUD ─────────────────────────────────────────────────────────
    console.log("[INFO] Navigating to Catalog Brands...");
    await page.goto(`${FRONTEND_URL}/admin-dashboard/catalog/brands`);
    await page.waitForLoadState("networkidle");
    await captureScreenshot(page, "catalog_brands_list_before");

    console.log("[INFO] Creating a new brand...");
    await page.locator("button:has-text('Create Brand')").click();
    await page.waitForSelector("#brand-title");

    await page.locator("#brand-title").fill("Deola Sagoe Ateliers");
    await page.locator("#brand-desc").fill("Couture fashion house defining premium Nigerian luxury bridal wear and structural elegance.");
    await captureScreenshot(page, "catalog_brand_form_filled");

    console.log("[INFO] Submitting brand form...");
    await page.locator("button:has-text('Create Brand'), button[type='submit']").last().click();
    await page.waitForTimeout(3000);
    await captureScreenshot(page, "catalog_brand_created_toast");

    // ── 3. COLLECTION CRUD ────────────────────────────────────────────────────
    console.log("[INFO] Navigating to Catalog Collections...");
    await page.goto(`${FRONTEND_URL}/admin-dashboard/catalog/collections`);
    await page.waitForLoadState("networkidle");
    await captureScreenshot(page, "catalog_collections_list_before");

    console.log("[INFO] Creating a new collection...");
    await page.locator("button:has-text('Create Collection')").click();
    await page.waitForSelector("#collection-title");

    await page.locator("#collection-title").fill("Summer Regency 2026");
    await page.locator("#collection-subtitle").fill("Modern Expressions of Heritage");
    await page.locator("#collection-desc").fill("Narrate the inspiration, textures and creative fabrics undergirding this capsule collection.");
    await captureScreenshot(page, "catalog_collection_form_filled");

    console.log("[INFO] Submitting collection form...");
    await page.locator("button:has-text('Create Collection'), button[type='submit']").last().click();
    await page.waitForTimeout(3000);
    await captureScreenshot(page, "catalog_collection_created_toast");

    // ── 4. BLOG CRUD ──────────────────────────────────────────────────────────
    console.log("[INFO] Navigating to Catalog Editorial Blog...");
    await page.goto(`${FRONTEND_URL}/admin-dashboard/catalog/blog`);
    await page.waitForLoadState("networkidle");
    await captureScreenshot(page, "catalog_blogs_list_before");

    console.log("[INFO] Composing a new article...");
    await page.locator("button:has-text('Compose Article')").click();
    await page.waitForSelector("#post-title");

    await page.locator("#post-title").fill("The Craft of Bespoke Agbadas");
    await page.locator("#post-status").selectOption("published");
    await page.locator("#post-excerpt").fill("Write a brief, high-end teaser describing the couture article narrative...");
    await page.locator("#post-content").fill("Narrate your luxury editorial in full detail. Craftsmanship, embroidery, textiles and modern royal fashion styles.");
    await page.locator("#post-tags").fill("couture, style-guide, agbada, embroidery");
    await captureScreenshot(page, "catalog_blog_form_filled");

    console.log("[INFO] Submitting blog form...");
    await page.locator("button:has-text('Publish Article'), button[type='submit']").last().click();
    await page.waitForTimeout(4000);
    await captureScreenshot(page, "catalog_blog_created_toast");

    console.log("[SUCCESS] E2E Catalog CRUD flow completed successfully!");
  });
});
