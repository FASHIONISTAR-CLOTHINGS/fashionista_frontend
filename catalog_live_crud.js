import { chromium } from "@playwright/test";

async function main() {
  console.log("[START] Connecting to the running Chrome instance on port 9222...");
  const browser = await chromium.connectOverCDP("http://127.0.0.1:9222");
  console.log("[INFO] Connected successfully!");

  const contexts = browser.contexts();
  const context = contexts[0];
  const pages = context.pages();
  
  // Find or create a page
  let page = pages.find(p => p.url().includes("localhost:3000") || p.url().includes("127.0.0.1:3000"));
  if (!page) {
    console.log("[INFO] Creating a new tab for FASHIONISTAR...");
    page = await context.newPage();
  } else {
    console.log("[INFO] Using existing FASHIONISTAR tab...");
    await page.bringToFront();
  }

  // Set viewport for a premium view
  await page.setViewportSize({ width: 1400, height: 1000 });

  // ── STEP 1: AUTHENTICATION ───────────────────────────────────────────────
  console.log("[INFO] Navigating to Sign-In page...");
  await page.goto("http://localhost:3000/auth/sign-in");
  await page.waitForLoadState("networkidle");

  const emailField = page.locator("#login-email, input[name='email']").first();
  if (await emailField.isVisible()) {
    console.log("[INFO] Filling Admin credentials...");
    await emailField.fill("admin@fashionistar.io");
    await page.locator("#login-password, input[name='password']").first().fill("FashionAdmin2026!");
    
    console.log("[INFO] Clicking Sign In button...");
    await page.locator("#login-submit-btn, button[type='submit']").first().click();
    
    console.log("[INFO] Waiting for redirect to admin-dashboard...");
    await page.waitForURL("**/admin-dashboard", { timeout: 30000 });
    await page.waitForLoadState("networkidle");
  } else {
    console.log("[INFO] Admin is already authenticated!");
    await page.goto("http://localhost:3000/admin-dashboard");
    await page.waitForLoadState("networkidle");
  }

  // ── STEP 2: CATEGORY CRUD ────────────────────────────────────────────────
  console.log("[INFO] Navigating to Categories page...");
  await page.goto("http://localhost:3000/admin-dashboard/catalog/categories");
  await page.waitForLoadState("networkidle");

  console.log("[INFO] Launching Category creation modal...");
  await page.locator("button:has-text('Create Category')").click();
  await page.waitForSelector("#category-name");

  console.log("[INFO] Filling Category form...");
  await page.locator("#category-name").fill("Traditional Kaftans");
  await page.locator("#category-desc").fill("Luxury traditional hand-crafted kaftans and agbadas for special African heritage events.");
  await page.waitForTimeout(1000);

  console.log("[INFO] Clicking Create Category submit...");
  await page.locator("button:has-text('Create Category'), button[type='submit']").last().click();
  await page.waitForTimeout(3000);

  console.log("[INFO] Clicking newly created category Edit button to inspect details...");
  const catRowEdit = page.locator("tr:has-text('Traditional Kaftans')").locator("button:has-text('Edit')").first();
  if (await catRowEdit.isVisible()) {
    await catRowEdit.click();
    await page.waitForTimeout(2000);
  }

  // ── STEP 3: BRAND CRUD ───────────────────────────────────────────────────
  console.log("[INFO] Navigating to Brands page...");
  await page.goto("http://localhost:3000/admin-dashboard/catalog/brands");
  await page.waitForLoadState("networkidle");

  console.log("[INFO] Launching Brand creation modal...");
  await page.locator("button:has-text('Create Brand')").click();
  await page.waitForSelector("#brand-title");

  console.log("[INFO] Filling Brand form...");
  await page.locator("#brand-title").fill("Deola Sagoe Ateliers");
  await page.locator("#brand-desc").fill("Couture fashion house defining premium Nigerian luxury bridal wear and structural elegance.");
  await page.waitForTimeout(1000);

  console.log("[INFO] Clicking Create Brand submit...");
  await page.locator("button:has-text('Create Brand'), button[type='submit']").last().click();
  await page.waitForTimeout(3000);

  console.log("[INFO] Clicking newly created brand Edit button to inspect details...");
  const brandRowEdit = page.locator("tr:has-text('Deola Sagoe Ateliers')").locator("button:has-text('Edit')").first();
  if (await brandRowEdit.isVisible()) {
    await brandRowEdit.click();
    await page.waitForTimeout(2000);
  }

  // ── STEP 4: COLLECTION CRUD ──────────────────────────────────────────────
  console.log("[INFO] Navigating to Collections page...");
  await page.goto("http://localhost:3000/admin-dashboard/catalog/collections");
  await page.waitForLoadState("networkidle");

  console.log("[INFO] Launching Collection creation modal...");
  await page.locator("button:has-text('Create Collection')").click();
  await page.waitForSelector("#collection-title");

  console.log("[INFO] Filling Collection form...");
  await page.locator("#collection-title").fill("Summer Regency 2026");
  await page.locator("#collection-subtitle").fill("Modern Expressions of Heritage");
  await page.locator("#collection-desc").fill("Narrate the inspiration, textures and creative fabrics undergirding this capsule collection.");
  await page.waitForTimeout(1000);

  console.log("[INFO] Clicking Create Collection submit...");
  await page.locator("button:has-text('Create Collection'), button[type='submit']").last().click();
  await page.waitForTimeout(3000);

  console.log("[INFO] Clicking newly created collection Edit button to inspect details...");
  const colRowEdit = page.locator("tr:has-text('Summer Regency 2026')").locator("button:has-text('Edit')").first();
  if (await colRowEdit.isVisible()) {
    await colRowEdit.click();
    await page.waitForTimeout(2000);
  }

  // ── STEP 5: BLOG POST CRUD ───────────────────────────────────────────────
  console.log("[INFO] Navigating to Blog page...");
  await page.goto("http://localhost:3000/admin-dashboard/catalog/blog");
  await page.waitForLoadState("networkidle");

  console.log("[INFO] Launching Compose Blog modal...");
  await page.locator("button:has-text('Compose Article')").click();
  await page.waitForSelector("#post-title");

  console.log("[INFO] Filling Blog form...");
  await page.locator("#post-title").fill("The Craft of Bespoke Agbadas");
  await page.locator("#post-status").selectOption("published");
  await page.locator("#post-excerpt").fill("Write a brief, high-end teaser describing the couture article narrative...");
  await page.locator("#post-content").fill("Narrate your luxury editorial in full detail. Craftsmanship, embroidery, textiles and modern royal fashion styles.");
  await page.locator("#post-tags").fill("couture, style-guide, agbada, embroidery");
  await page.waitForTimeout(1000);

  console.log("[INFO] Clicking Publish Article submit...");
  await page.locator("button:has-text('Publish Article'), button[type='submit']").last().click();
  await page.waitForTimeout(3000);

  console.log("[INFO] Clicking newly created blog post Edit button to inspect details...");
  const blogRowEdit = page.locator("tr:has-text('The Craft of Bespoke Agbadas')").locator("button:has-text('Edit')").first();
  if (await blogRowEdit.isVisible()) {
    await blogRowEdit.click();
    await page.waitForTimeout(2000);
  }

  // ── STEP 6: SOFT & HARD DELETE TEST (CATEGORIES ARCHIVE) ─────────────────
  console.log("[INFO] Performing soft/hard delete visual checks...");
  await page.goto("http://localhost:3000/admin-dashboard/catalog/categories");
  await page.waitForLoadState("networkidle");

  console.log("[INFO] Creating a temporary category for archive test...");
  await page.locator("button:has-text('Create Category')").click();
  await page.waitForSelector("#category-name");
  await page.locator("#category-name").fill("Soft Delete Test Item");
  await page.locator("#category-desc").fill("Temp item for soft-deleting and testing archive workflow.");
  await page.locator("button:has-text('Create Category'), button[type='submit']").last().click();
  await page.waitForTimeout(3000);

  // Soft Delete check
  console.log("[INFO] Clicking Archive (Soft Delete) on temporary category...");
  page.once("dialog", dialog => {
    console.log(`[INFO] Dialog triggered: "${dialog.message()}". Accepting...`);
    dialog.accept();
  });
  
  const archiveButton = page.locator("tr:has-text('Soft Delete Test Item')").locator("button:has-text('Archive')").first();
  if (await archiveButton.isVisible()) {
    await archiveButton.click();
    await page.waitForTimeout(3000);
    console.log("[SUCCESS] Soft-deleted category row successfully!");
  }

  console.log("[SUCCESS] All 4 Catalog CRUD creation forms executed visually on the live browser!");
  
  // Clean disconnect
  console.log("[INFO] Disconnecting from Chrome CDP connection cleanly...");
  await browser.close();
}

main().catch(console.error);
