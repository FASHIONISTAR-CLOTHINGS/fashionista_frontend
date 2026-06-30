import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

(async () => {
  console.log("Launching headless browser...");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    extraHTTPHeaders: {
      'ngrok-skip-browser-warning': 'true'
    }
  });
  const page = await context.newPage();

  page.on('console', msg => {
    console.log(`[CONSOLE] [${msg.type()}] ${msg.text()}`);
  });

  page.on('pageerror', err => {
    console.log(`[PAGE ERROR] ${err.message}`);
  });

  page.on('request', request => {
    console.log(`[REQ] ${request.method()} ${request.url()}`);
  });

  page.on('requestfailed', request => {
    console.log(`[REQ FAILED] ${request.url()} - ${request.failure()?.errorText}`);
  });

  page.on('response', response => {
    console.log(`[RES] ${response.status()} ${response.url()}`);
  });

  const seededAuthPath = path.resolve('tests/e2e/.tmp/seeded-auth.json');
  console.log("Reading seeded auth from:", seededAuthPath);
  const auth = JSON.parse(fs.readFileSync(seededAuthPath, 'utf8'));
  const session = auth.vendor;

  // Add cookies first
  console.log("Setting cookies...");
  await context.addCookies([
    {
      name: 'fashionistar_auth_hint',
      value: '1',
      url: 'https://fashionistar-frontend-259415881346.europe-west1.run.app',
      sameSite: 'Lax'
    },
    {
      name: 'fashionistar_role',
      value: 'vendor',
      url: 'https://fashionistar-frontend-259415881346.europe-west1.run.app',
      sameSite: 'Lax'
    }
  ]);

  // Navigate to set session storage
  console.log("Navigating to frontend to set sessionStorage...");
  await page.goto('https://fashionistar-frontend-259415881346.europe-west1.run.app', { waitUntil: 'domcontentloaded' });
  
  await page.evaluate((payload) => {
    window.sessionStorage.setItem('fashionistar-auth', JSON.stringify({
      state: {
        accessToken: payload.accessToken,
        refreshToken: payload.refreshToken,
        user: payload.user,
        isAuthenticated: true
      }
    }));
  }, session);

  console.log("Navigating to catalog page...");
  try {
    await page.goto('https://fashionistar-frontend-259415881346.europe-west1.run.app/vendor/products/catalog', { waitUntil: 'domcontentloaded', timeout: 30000 });
    
    console.log("Waiting 5 seconds for any async operations...");
    await page.waitForTimeout(5000);
    
    await page.screenshot({ path: 'live_catalog_debug.png', fullPage: true });
    console.log("SUCCESS: Saved live_catalog_debug.png");
  } catch (err) {
    console.error("FAILED loading catalog page:", err);
  }

  await browser.close();
  console.log("Browser closed.");
})();
