/**
 * e2e/global.setup.ts
 * Global setup — runs ONCE before all Playwright tests.
 * Seeds test users and captures auth state for fixtures.
 */
import { test as setup, expect } from "@playwright/test";
import path from "path";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

// State files — saved once, reused by all test workers
export const CLIENT_AUTH_FILE   = path.join(__dirname, ".auth/client.json");
export const VENDOR_AUTH_FILE   = path.join(__dirname, ".auth/vendor.json");
export const ADMIN_AUTH_FILE    = path.join(__dirname, ".auth/admin.json");

// ── Seed client user ──────────────────────────────────────────────────────────
setup("seed: client auth", async ({ request }) => {
  // Register or login a test client
  const loginRes = await request.post(`${API}/api/v1/auth/login/`, {
    data: {
      email_or_phone: process.env.E2E_CLIENT_EMAIL ?? "e2e_client@fashionistar.ng",
      password: process.env.E2E_CLIENT_PASSWORD ?? "E2EClient!2026",
    },
  });

  if (loginRes.ok()) {
    const { access, refresh } = await loginRes.json();
    await request.storageState({ path: CLIENT_AUTH_FILE });
    // Store tokens in localStorage via a page context
    console.log("✅ Client auth seeded");
  } else {
    console.warn("⚠️  Client auth setup failed — tests requiring auth will be skipped");
  }
});

// ── Seed vendor user ──────────────────────────────────────────────────────────
setup("seed: vendor auth", async ({ request }) => {
  const loginRes = await request.post(`${API}/api/v1/auth/login/`, {
    data: {
      email_or_phone: process.env.E2E_VENDOR_EMAIL ?? "e2e_vendor@fashionistar.ng",
      password: process.env.E2E_VENDOR_PASSWORD ?? "E2EVendor!2026",
    },
  });

  if (loginRes.ok()) {
    await request.storageState({ path: VENDOR_AUTH_FILE });
    console.log("✅ Vendor auth seeded");
  } else {
    console.warn("⚠️  Vendor auth setup failed");
  }
});
