import { chromium } from "playwright";

const BACKEND_URL = "https://fashionistar-backend-259415881346.europe-west1.run.app";
const ADMIN_EMAIL = "admin@fashionistar.io";
const ADMIN_PASSWORD = "FashionAdmin2026!";

async function main() {
  console.log("Launching browser...");
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  console.log("Navigating to Django Admin Login...");
  await page.goto(`${BACKEND_URL}/admin/`);
  await page.waitForLoadState("networkidle");
  
  await page.locator('input[name="username"], #id_username').fill(ADMIN_EMAIL);
  await page.locator('input[name="password"], #id_password').fill(ADMIN_PASSWORD);
  await page.locator('button[type="submit"], input[type="submit"]').first().click();
  
  await page.waitForURL(/\/admin\//, { timeout: 30000 });
  console.log("Logged in successfully. Navigating to Unified Users...");
  
  // Load test emails
  const emailsFile = "./tests/e2e/.tmp/active-test-emails.json";
  let clientEmail = "client.vision.1779949221860@fashionistar.io";
  try {
    const fs = await import("node:fs");
    if (fs.existsSync(emailsFile)) {
      const data = JSON.parse(fs.readFileSync(emailsFile, "utf8"));
      clientEmail = data.clientEmail;
    }
  } catch (e) {
    console.error("Error reading email file, using fallback:", e);
  }
  console.log(`Using client email: ${clientEmail}`);

  await page.goto(`${BACKEND_URL}/admin/authentication/unifieduser/?q=${clientEmail}`);
  await page.waitForLoadState("networkidle");
  
  // Find the change link
  console.log("Locating client link on list page...");
  const clientLink = page.locator(`tr:has-text("${clientEmail}") a[href*="/change/"]`).first();
  await clientLink.waitFor({ state: "visible", timeout: 15000 });
  await clientLink.click();
  
  await page.waitForLoadState("networkidle");
  console.log("Getting edit page details...");
  const pageDetails = await page.evaluate(() => {
    const inputs = Array.from(document.querySelectorAll("input, select, textarea")).map(el => {
      return {
        tag: el.tagName.toLowerCase(),
        type: el.getAttribute("type"),
        name: el.getAttribute("name"),
        id: el.getAttribute("id"),
        checked: el.checked
      };
    });
    return {
      title: document.title,
      inputs: inputs
    };
  });
  
  console.log("Page title:", pageDetails.title);
  console.log("Inputs:", JSON.stringify(pageDetails.inputs, null, 2));
  
  await browser.close();
}

main().catch(console.error);
