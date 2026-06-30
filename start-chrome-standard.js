import { chromium } from 'playwright';

async function main() {
  console.log("Launching standard Chromium with remote debugging on port 9222...");
  try {
    const browser = await chromium.launch({
      headless: true,
      args: [
        '--remote-debugging-port=9222',
        '--remote-allow-origins=*',
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu'
      ]
    });
    console.log("Chromium standard browser successfully launched with remote debugging on port 9222!");
    
    // Keep process alive
    process.on('SIGINT', async () => {
      await browser.close();
      process.exit(0);
    });
    
    // Run forever
    await new Promise(() => {});
  } catch (error) {
    console.error("Failed to launch standard Chromium:", error);
    process.exit(1);
  }
}

main();
