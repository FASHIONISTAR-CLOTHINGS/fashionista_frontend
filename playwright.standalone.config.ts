/**
 * playwright.standalone.config.ts
 * Minimal config for standalone E2E tests — no global setup, no webServer.
 */
import { defineConfig, devices } from "@playwright/test";

const BASE_URL = "http://localhost:3000";

export default defineConfig({
  testDir: "./e2e",
  timeout: 300_000,
  expect: { timeout: 30_000 },

  fullyParallel: false,
  forbidOnly: false,
  retries: 0,
  workers: 1,

  reporter: [["list"]],

  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
    extraHTTPHeaders: {
      "X-E2E-Test": "1",
      Accept: "application/json,text/html,*/*",
    },
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
