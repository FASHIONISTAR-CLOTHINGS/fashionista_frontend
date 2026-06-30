import { chromium } from "@playwright/test";

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Set high default timeouts
  page.setDefaultTimeout(60000);
  page.setDefaultNavigationTimeout(60000);

  const ADMIN_EMAIL = "admin@fashionistar.io";
  const ADMIN_PASSWORD = "FashionAdmin2026!";
  const BACKEND_URL = "https://fashionistar-backend-259415881346.europe-west1.run.app";

  try {
    console.log("Navigating to Django Admin Login...");
    await page.goto(`${BACKEND_URL}/admin/`);
    await page.waitForLoadState("networkidle");

    await page.locator('input[name="username"], #id_username').fill(ADMIN_EMAIL);
    await page.locator('input[name="password"], #id_password').fill(ADMIN_PASSWORD);
    
    console.log("Submitting login form...");
    await page.locator('button[type="submit"], input[type="submit"]').click();
    await page.waitForURL(/\/admin\//, { timeout: 60000 });
    console.log("Logged in successfully!");

    console.log("Navigating to UnifiedUser list view...");
    await page.goto(`${BACKEND_URL}/admin/authentication/unifieduser/`);
    await page.waitForLoadState("networkidle");

    // Click the first user's edit link
    console.log("Locating first user's change link...");
    const changeLink = page.locator('tr a[href*="/change/"]').first();
    await changeLink.waitFor({ state: "visible", timeout: 30000 });
    const href = await changeLink.getAttribute("href");
    console.log("Change link href:", href);

    console.log("Clicking change link...");
    try {
      await Promise.all([
        page.waitForNavigation({ waitUntil: "load", timeout: 60000 }),
        changeLink.click()
      ]);
      console.log("Navigation to change form completed successfully!");
    } catch (clickErr) {
      console.warn("Click or navigation timed out, taking diagnostics screenshot...", clickErr.message);
    }

    // Take screenshot
    console.log("Capturing screenshot of user change page...");
    await page.screenshot({ path: "c:\\Users\\FASHIONISTAR\\OneDrive\\Documenti\\FASHIONISTAR_ANTAGRAVITY\\FASHIONISTAR_REAL_VISION_BROWSER_TESTING\\test-evidence\\inspect_user_change_page.png", fullPage: true });

    // Print all tab elements
    console.log("Dumping tab elements...");
    const tabs = await page.evaluate(() => {
      const elList = Array.from(document.querySelectorAll('a, li, [role="tab"], .nav-link, button'));
      return elList
        .map(el => ({
          tag: el.tagName,
          id: el.id,
          className: el.className,
          text: el.innerText.trim(),
          role: el.getAttribute("role"),
          dataToggle: el.getAttribute("data-toggle"),
          href: el.getAttribute("href")
        }))
        .filter(x => x.text.toLowerCase().includes("permission") || x.text.toLowerCase().includes("user info") || x.className.includes("nav-link") || x.className.includes("tab"));
    });
    console.log("Tabs:", JSON.stringify(tabs, null, 2));

    // Print if is_active is visible
    const isActiveVisible = await page.locator('input[name="is_active"]').isVisible();
    console.log("is_active input visible directly?", isActiveVisible);

    // Let's also search for input[name="is_active"] or input#id_is_active attributes
    const inputDetails = await page.evaluate(() => {
      const el = document.querySelector('input[name="is_active"], #id_is_active');
      if (!el) return null;
      return {
        tag: el.tagName,
        id: el.id,
        name: el.name,
        type: el.type,
        checked: el.checked,
        visible: el.offsetWidth > 0 && el.offsetHeight > 0,
        parent: el.parentElement ? { tag: el.parentElement.tagName, className: el.parentElement.className } : null
      };
    });
    console.log("is_active input details:", inputDetails);

  } catch (err) {
    console.error("Error occurred:", err);
  } finally {
    await browser.close();
  }
})();
