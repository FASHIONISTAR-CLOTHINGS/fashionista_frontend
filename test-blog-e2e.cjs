const { chromium } = require("@playwright/test");

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    screenshot: { type: "png" },
  });
  const page = await context.newPage();

  const screenshotsDir = "test-screenshots/blog";
  const fs = require("fs");
  fs.mkdirSync(screenshotsDir, { recursive: true });

  const results = [];

  // Test 1: Homepage
  console.log("\n=== Test 1: Homepage ===");
  try {
    const resp = await page.goto("http://localhost:3000", { waitUntil: "networkidle", timeout: 60000 });
    console.log("Status:", resp.status());
    const hasHomepage = await page.locator('[data-testid="homepage"]').count();
    console.log("Has homepage testid:", hasHomepage > 0);
    const hasServerError = await page.locator("text=server-only").count();
    console.log("Has server-only error:", hasServerError > 0);
    await page.screenshot({ path: `${screenshotsDir}/01-homepage.png`, fullPage: false });
    console.log("Screenshot: 01-homepage.png");
    results.push({ test: "Homepage", status: resp.status(), pass: resp.status() === 200 && hasHomepage > 0 });
  } catch (e) {
    console.log("Error:", e.message);
    results.push({ test: "Homepage", status: 0, pass: false, error: e.message });
  }

  // Test 2: Blog List
  console.log("\n=== Test 2: Blog List ===");
  try {
    const resp = await page.goto("http://localhost:3000/blog", { waitUntil: "networkidle", timeout: 60000 });
    console.log("Status:", resp.status());
    const hasBlogTitle = await page.locator("text=Fashionistar Blog").count();
    console.log("Has Fashionistar Blog:", hasBlogTitle > 0);
    const hasDataTestid = await page.locator("[data-testid]").count();
    console.log("data-testid elements:", hasDataTestid);
    const hasServerError = await page.locator("text=server-only").count();
    console.log("Has server-only error:", hasServerError > 0);
    await page.screenshot({ path: `${screenshotsDir}/02-blog-list.png`, fullPage: false });
    console.log("Screenshot: 02-blog-list.png");

    // Check for blog post links
    const blogLinks = await page.locator('a[href*="/blog/"]').count();
    console.log("Blog post links found:", blogLinks);
    results.push({ test: "Blog List", status: resp.status(), pass: resp.status() === 200 && hasBlogTitle > 0 });
  } catch (e) {
    console.log("Error:", e.message);
    results.push({ test: "Blog List", status: 0, pass: false, error: e.message });
  }

  // Test 3: Blog Detail
  console.log("\n=== Test 3: Blog Detail ===");
  try {
    // Get the first blog post link
    const firstBlogLink = page.locator('a[href*="/blog/"]').first();
    const href = await firstBlogLink.getAttribute("href");
    console.log("Navigating to blog post:", href);

    const resp = await page.goto(`http://localhost:3000${href}`, { waitUntil: "networkidle", timeout: 60000 });
    console.log("Status:", resp.status());

    const hasBlogDetail = await page.locator('[data-testid="blog-detail-page"]').count();
    console.log("Has blog-detail-page:", hasBlogDetail > 0);

    const hasSocialProof = await page.locator('[data-testid="social-proof-bar"]').count();
    console.log("Has social-proof-bar:", hasSocialProof > 0);

    const hasTrustBadges = await page.locator('[data-testid="trust-badges"]').count();
    console.log("Has trust-badges:", hasTrustBadges > 0);

    const hasUrgencyTimer = await page.locator('[data-testid="urgency-timer"]').count();
    console.log("Has urgency-timer:", hasUrgencyTimer > 0);

    const hasInlineProducts = await page.locator('[data-testid="inline-product-recommendations"]').count();
    console.log("Has inline-product-recommendations:", hasInlineProducts > 0);

    const hasRelated = await page.locator('[data-testid="blog-related"]').count();
    console.log("Has blog-related:", hasRelated > 0);

    const hasNewsletterCTA = await page.locator('[data-testid="blog-newsletter-cta"]').count();
    console.log("Has blog-newsletter-cta:", hasNewsletterCTA > 0);

    const hasJsonLd = await page.locator('script[type="application/ld+json"]').count();
    console.log("Has JSON-LD:", hasJsonLd > 0);

    const hasServerError = await page.locator("text=server-only").count();
    console.log("Has server-only error:", hasServerError > 0);

    // Screenshot - above the fold
    await page.screenshot({ path: `${screenshotsDir}/03-blog-detail-top.png`, fullPage: false });
    console.log("Screenshot: 03-blog-detail-top.png");

    // Screenshot - full page
    await page.screenshot({ path: `${screenshotsDir}/04-blog-detail-full.png`, fullPage: true });
    console.log("Screenshot: 04-blog-detail-full.png");

    // Scroll down to trigger sticky CTA
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight * 0.5));
    await page.waitForTimeout(1000);
    const hasStickyCTA = await page.locator('[data-testid="sticky-cta-bar"]').count();
    console.log("Has sticky-cta-bar (after scroll):", hasStickyCTA > 0);
    await page.screenshot({ path: `${screenshotsDir}/05-blog-detail-sticky-cta.png`, fullPage: false });
    console.log("Screenshot: 05-blog-detail-sticky-cta.png");

    results.push({
      test: "Blog Detail",
      status: resp.status(),
      pass: resp.status() === 200 && hasBlogDetail > 0 && hasSocialProof > 0 && hasTrustBadges > 0,
    });
  } catch (e) {
    console.log("Error:", e.message);
    results.push({ test: "Blog Detail", status: 0, pass: false, error: e.message });
  }

  // Summary
  console.log("\n\n========== E2E TEST SUMMARY ==========");
  let allPass = true;
  for (const r of results) {
    const icon = r.pass ? "PASS" : "FAIL";
    console.log(`${icon}: ${r.test} (status: ${r.status})${r.error ? " - " + r.error : ""}`);
    if (!r.pass) allPass = false;
  }
  console.log(`\nOverall: ${allPass ? "ALL TESTS PASSED" : "SOME TESTS FAILED"}`);
  console.log(`Screenshots saved to: ${screenshotsDir}/`);
  console.log("=======================================\n");

  await browser.close();
  process.exit(allPass ? 0 : 1);
})();
