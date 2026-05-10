import { defineConfig, devices } from "@playwright/test";

const baseURL =
  process.env.PLAYWRIGHT_BASE_URL ??
  process.env.NEXT_PUBLIC_FRONTEND_TUNNEL_URL ??
  "http://localhost:3000";

const webServerUrl = process.env.PLAYWRIGHT_WEB_SERVER_URL ?? "http://localhost:3000";
const webServerCommand = process.env.PLAYWRIGHT_WEB_SERVER_COMMAND ?? "pnpm dev";
const skipWebServer = process.env.PLAYWRIGHT_SKIP_WEB_SERVER === "1";

/**
 * Playwright Configuration — Enterprise E2E Testing
 *
 * Test Suites:
 *  1. Desktop Chrome  — Primary functional tests
 *  2. Mobile Chrome   — Responsiveness (Pixel 5)
 *  3. Mobile Safari   — iOS responsiveness (iPhone 13)
 *
 * To add Safari/WebKit: run `pnpm exec playwright install webkit` then
 * uncomment the Mobile Safari project below.
 *
 * Tuning for local dev (Turbopack):
 *  - workers: 3 (Turbopack compile is CPU-heavy, 10 workers causes timeouts)
 *  - timeout: 60s (first Turbopack compile can take ~16s)
 *  - LCP target: <10s in dev mode (production target is <2.5s)
 */
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  workers: process.env.CI ? 4 : 3, // 3 in dev — Turbopack is CPU heavy
  retries: process.env.CI ? 2 : 1,  // 1 retry in dev to handle cold-start flakiness
  timeout: 60_000,                   // 60s — allows for Turbopack first compile
  expect: { timeout: 15_000 },       // 15s expect timeout

  reporter: [
    ["html", { outputFolder: "tests/playwright-report", open: "never" }],
    ["list"],
  ],

  use: {
    /* Base URL — localtunnel in production simulation, localhost in dev */
    baseURL,

    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    actionTimeout: 15_000,
    navigationTimeout: 60_000,      // 60s for page.goto (Turbopack cold compile)

    /* Extra HTTP headers — skip ngrok browser warning */
    extraHTTPHeaders: {
      "ngrok-skip-browser-warning": "true",
    },
  },

  projects: [
    {
      // Primary project: runs ALL tests including admin panel (Django/ngrok)
      name: "chromium — Desktop",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      // Mobile Chrome: skip admin tests — ngrok can't handle 3 concurrent sessions
      name: "Mobile Chrome — Pixel 5",
      use: { ...devices["Pixel 5"] },
      testIgnore: ["**/admin.spec.ts"],
    },
    {
      // Mobile Safari: skip admin tests — same ngrok concurrency limit
      name: "Mobile Safari — iPhone 13",
      use: { ...devices["iPhone 13"] },
      testIgnore: ["**/admin.spec.ts"],
    },
  ],

  /* Auto-start dev server when running tests locally */
  webServer: skipWebServer
    ? undefined
    : {
        command: webServerCommand,
        url: webServerUrl,
        reuseExistingServer: !process.env.CI,
        timeout: 120 * 1000, // 2 minutes for Turbopack cold start
        stderr: "pipe",
      },
});
