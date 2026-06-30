import { chromium } from 'playwright';

(async () => {
  console.log("Launching headless browser...");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  
  // Skip ngrok browser warning page
  await context.setExtraHTTPHeaders({
    'ngrok-skip-browser-warning': '69420'
  });

  const page = await context.newPage();

  page.on('console', msg => {
    console.log(`[CONSOLE] [${msg.type()}] ${msg.text()}`);
  });

  page.on('pageerror', err => {
    console.log(`[PAGE ERROR] ${err.message}`);
  });

  console.log("Navigating to http://127.0.0.1:3000...");
  try {
    await page.goto('http://127.0.0.1:3000', { timeout: 30000, waitUntil: 'domcontentloaded' });
    // wait for compilation and hydration
    await page.waitForTimeout(5000);
    await page.screenshot({ path: 'localhost.png', fullPage: false });
    console.log("SUCCESS: Saved localhost.png");
  } catch (err) {
    console.error("FAILED loading localhost:3000:", err.message);
  }

  console.log("Navigating to https://aeration-scabby-navy.ngrok-free.dev...");
  try {
    await page.goto('https://aeration-scabby-navy.ngrok-free.dev', { timeout: 30000, waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(5000);
    await page.screenshot({ path: 'ngrok.png', fullPage: false });
    console.log("SUCCESS: Saved ngrok.png");
  } catch (err) {
    console.error("FAILED loading ngrok URL:", err.message);
  }

  await browser.close();
  console.log("Browser closed.");
})();
