import { test } from "@playwright/test";

test("Inspect Django Admin Edit User Tabs", async ({ page }) => {
  test.setTimeout(120_000);
  console.log("[SCRATCH] Logging in to Django Admin...");
  await page.goto("https://fashionistar-backend-259415881346.europe-west1.run.app/admin/", { waitUntil: "domcontentloaded" });

  await page.locator('input[name="username"], #id_username').fill("admin@fashionistar.io");
  await page.locator('input[name="password"], #id_password').fill("FashionAdmin2026!");
  await page.locator('button[type="submit"], input[type="submit"]').click();
  await page.waitForURL(/\/admin\//, { timeout: 30000 });

  console.log("[SCRATCH] Navigating to first Unified User Change page...");
  await page.goto("https://fashionistar-backend-259415881346.europe-west1.run.app/admin/authentication/unifieduser/", { waitUntil: "domcontentloaded" });

  // Click the change link in the first row
  const changeLink = page.locator('table#result_list tbody tr a').first();
  await changeLink.click();
  await page.waitForLoadState("domcontentloaded");

  console.log("[SCRATCH] Arrived at edit page:", page.url());

  // Wait a couple seconds to be absolutely sure the page finished rendering
  await page.waitForTimeout(5000);

  // Log all links/tabs
  const tabs = await page.locator("ul.nav li a, .nav-tabs a, a.nav-link").all();
  console.log(`[SCRATCH] Found ${tabs.length} tabs/nav-links on edit page`);
  for (let i = 0; i < tabs.length; i++) {
    const text = await tabs[i].textContent();
    const className = await tabs[i].getAttribute("class");
    const id = await tabs[i].getAttribute("id");
    console.log(`[SCRATCH] Tab ${i}: id="${id}", class="${className}", text="${text?.trim()}"`);
  }

  // Check if is_active is visible or hidden
  const is_active = page.locator("#id_is_active");
  const isVisible = await is_active.isVisible();
  console.log(`[SCRATCH] #id_is_active is visible? ${isVisible}`);

  // Also take a screenshot of the edit page to visually verify
  await page.screenshot({ path: "c:\\Users\\FASHIONISTAR\\OneDrive\\Documenti\\FASHIONISTAR_ANTAGRAVITY\\FASHIONISTAR_REAL_VISION_BROWSER_TESTING\\test-evidence\\scratch_edit_user_page.png", fullPage: true });
});

