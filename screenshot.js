import { chromium } from 'playwright';

(async () => {
  console.log("Launching headless browser...");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log("Navigating to http://localhost:3000...");
  try {
    await page.goto('http://localhost:3000', { timeout: 30000 });
    // wait for 2 seconds to make sure react hydrations and components render
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'localhost.png', fullPage: false });
    console.log("SUCCESS: Saved localhost.png");
  } catch (err) {
    console.error("FAILED loading localhost:3000:", err);
  }

  console.log("Navigating to https://aeration-scabby-navy.ngrok-free.dev...");
  try {
    await page.goto('https://aeration-scabby-navy.ngrok-free.dev', { timeout: 30000 });
    // In case ngrok warning page displays:
    const ngrokBypass = await page.getByRole('button', { name: /visit site|skip/i }).or(page.locator('a:has-text("Skip")')).first();
    if (await ngrokBypass.isVisible()) {
      console.log("Clicking ngrok warning bypass...");
      await ngrokBypass.click();
      await page.waitForTimeout(3000);
    }
    await page.screenshot({ path: 'ngrok.png', fullPage: false });
    console.log("SUCCESS: Saved ngrok.png");
  } catch (err) {
    console.error("FAILED loading ngrok URL:", err);
  }

  await browser.close();
  console.log("Browser closed.");
})();
