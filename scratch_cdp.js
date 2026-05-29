import { chromium } from "@playwright/test";

async function main() {
  console.log("Connecting to Chrome on port 9222...");
  const browser = await chromium.connectOverCDP("http://127.0.0.1:9222");
  console.log("Connected successfully!");
  
  const contexts = browser.contexts();
  console.log(`Found ${contexts.length} contexts.`);
  
  for (const ctx of contexts) {
    const pages = ctx.pages();
    console.log(`Context has ${pages.length} pages:`);
    for (const page of pages) {
      console.log(`- ${page.url()} (${await page.title()})`);
    }
  }
  
  await browser.close();
}

main().catch(console.error);
