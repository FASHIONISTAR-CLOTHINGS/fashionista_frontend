import { test } from "@playwright/test";

test("Inspect API network and console logs during signup", async ({ page }) => {
  // Log all console messages
  page.on('console', msg => {
    console.log(`[BROWSER CONSOLE] [${msg.type()}] ${msg.text()}`);
  });

  // Log all network requests
  page.on('request', request => {
    console.log(`[BROWSER REQUEST] ${request.method()} ${request.url()}`);
  });

  page.on('response', async response => {
    const status = response.status();
    if (status >= 400) {
      let text = "";
      try {
        text = await response.text();
      } catch (e) {
        text = "<cannot read body>";
      }
      console.log(`[BROWSER RESPONSE ERROR] ${status} ${response.url()} -> ${text}`);
    } else {
      console.log(`[BROWSER RESPONSE] ${status} ${response.url()}`);
    }
  });

  page.on('requestfailed', request => {
    console.log(`[BROWSER REQUEST FAILED] ${request.url()} - Error: ${request.failure()?.errorText}`);
  });

  const url = 'https://fashionistar-frontend-259415881346.europe-west1.run.app/auth/sign-up?role=client';
  console.log(`Navigating to ${url}...`);
  await page.goto(url);
  await page.waitForLoadState('networkidle');

  // Fill Client Signup fields
  await page.locator("#reg-fname").fill("Chidi");
  await page.locator("#reg-lname").fill("Client");
  await page.locator("#reg-email").fill(`client.inspect.${Date.now()}@fashionistar.io`);
  await page.locator("#reg-password").fill("FashionTestUser2026!");
  await page.locator("#reg-password-confirm").fill("FashionTestUser2026!");

  console.log("Submitting registration...");
  await page.locator("#register-submit-btn").click();

  // Wait for 10 seconds to observe network/console events
  await page.waitForTimeout(10000);
});
