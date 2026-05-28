import { chromium } from 'playwright';

(async () => {
  console.log("Launching headless browser for signup testing...");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  page.on('console', msg => {
    console.log(`[BROWSER CONSOLE] [${msg.type()}] ${msg.text()}`);
  });

  page.on('pageerror', err => {
    console.log(`[BROWSER PAGE ERROR] ${err.message}`);
  });

  page.on('request', request => {
    if (request.url().includes('/api/')) {
      console.log(`[REQ] ${request.method()} ${request.url()}`);
      const postData = request.postData();
      if (postData) {
        console.log(`[REQ BODY] ${postData}`);
      }
    }
  });

  page.on('requestfailed', request => {
    if (request.url().includes('/api/')) {
      console.log(`[REQ FAILED] ${request.url()} - ${request.failure()?.errorText}`);
    }
  });

  page.on('response', async response => {
    if (response.url().includes('/api/')) {
      console.log(`[RES] ${response.status()} ${response.url()}`);
      try {
        const text = await response.text();
        console.log(`[RES BODY] ${text}`);
      } catch (err) {
        // Body reading failed
      }
    }
  });

  const clientEmail = `client.debug.${Date.now()}@fashionistar.io`;
  const testPassword = "FashionTestUser2026!";

  console.log(`Navigating to register page as client with email: ${clientEmail}...`);
  await page.goto('https://fashionistar-frontend-259415881346.europe-west1.run.app/auth/sign-up?role=client');
  await page.waitForLoadState('networkidle');

  console.log("Filling form fields...");
  await page.locator("#reg-fname").fill("Chidi");
  await page.locator("#reg-lname").fill("Client");
  await page.locator("#reg-email").fill(clientEmail);
  await page.locator("#reg-password").fill(testPassword);
  await page.locator("#reg-password-confirm").fill(testPassword);

  console.log("Submitting form...");
  await page.locator("#register-submit-btn").click();

  console.log("Waiting 10 seconds for response/navigation...");
  await page.waitForTimeout(10000);

  await page.screenshot({ path: 'signup_debug_result.png', fullPage: true });
  console.log("Screenshot saved to signup_debug_result.png");

  await browser.close();
  console.log("Browser closed.");
})();
