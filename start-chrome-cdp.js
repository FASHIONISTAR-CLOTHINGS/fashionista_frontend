import { chromium } from 'playwright';

async function main() {
  console.log("Launching Chromium server on port 9223...");
  try {
    const server = await chromium.launchServer({
      port: 9223,
      headless: true,
      args: [
        '--remote-allow-origins=*',
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu'
      ]
    });
    console.log("Chromium server successfully launched on port 9223!");
    console.log("WS Endpoint:", server.wsEndpoint());
    
    // Keep process alive
    process.on('SIGINT', async () => {
      await server.close();
      process.exit(0);
    });
    
    // Run forever
    await new Promise(() => {});
  } catch (error) {
    console.error("Failed to launch Chromium server on port 9223:", error);
    process.exit(1);
  }
}

main();
