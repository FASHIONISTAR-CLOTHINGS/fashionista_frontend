/**
 * playwright.config.ts
 * FASHIONISTAR E2E Test Configuration
 * Multi-project: Chromium (all), Firefox + WebKit (smoke only).
 * Reporters: HTML + GitHub Actions CI annotations.
 */
import { defineConfig, devices } from "@playwright/test";

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export default defineConfig({
  testDir: "./e2e",
  timeout: 45_000,
  expect: { timeout: 10_000 },

  /* Run all tests in parallel workers */
  fullyParallel: true,

  /* Fail build on CI if test.only accidentally left in */
  forbidOnly: !!process.env.CI,

  /* Retry on CI — transient infra flakiness */
  retries: process.env.CI ? 2 : 0,

  /* Parallel workers — 75% of logical CPUs */
  workers: process.env.CI ? "75%" : undefined,

  /* Reporter strategy */
  reporter: process.env.CI
    ? [["github"], ["html", { open: "never" }], ["list"]]
    : [["html", { open: "on-failure" }], ["list"]],

  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    /* Viewport — common laptop */
    viewport: { width: 1280, height: 720 },
    /* Ignore HTTPS errors from self-signed local certs */
    ignoreHTTPSErrors: true,
    /* Inject extra headers */
    extraHTTPHeaders: {
      "X-E2E-Test": "1",
      Accept: "application/json,text/html,*/*",
    },
  },

  projects: [
    /* ── Setup project: seed DB before full suite ───────────────────── */
    {
      name: "global-setup",
      testMatch: /global\.setup\.ts/,
    },

    /* ── Full suite — Chromium (always runs) ─────────────────────────── */
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
      dependencies: ["global-setup"],
    },

    /* ── Smoke suite — Firefox (CI: main/develop only) ────────────────── */
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
      testMatch: /.*\.smoke\.spec\.ts/,
      dependencies: ["global-setup"],
    },

    /* ── Mobile — iPhone 14 Pro viewport (critical journeys only) ─────── */
    {
      name: "mobile-safari",
      use: { ...devices["iPhone 14 Pro"] },
      testMatch: /.*\.mobile\.spec\.ts/,
      dependencies: ["global-setup"],
    },

    /* ── Tablet — iPad Pro (responsive layout checks) ─────────────────── */
    {
      name: "tablet-chrome",
      use: { ...devices["iPad Pro 11"] },
      testMatch: /.*\.responsive\.spec\.ts/,
      dependencies: ["global-setup"],
    },
  ],

  webServer: process.env.CI
    ? undefined  // CI starts servers separately
    : {
        command: "pnpm dev",
        url: BASE_URL,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
        env: {
          NEXT_PUBLIC_API_URL: API_URL,
        },
      },

  /* Global test data directory */
  // globalSetup: "./e2e/global.setup.ts",
});
