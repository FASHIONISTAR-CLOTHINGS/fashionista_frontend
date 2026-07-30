/**
 * e2e/global.setup.ts
 * Global setup — runs ONCE before all Playwright tests.
 *
 * Logs in test users via the backend API and saves auth state
 * (sessionStorage-compatible JSON) to disk for reuse by test workers.
 *
 * Auth state structure matches the Zustand auth store key "fashionistar-auth"
 * so tests can inject it via page.addInitScript before navigation.
 */
import { test as setup } from "@playwright/test";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8001";

// Auth state files — JSON saved to disk, loaded by test fixtures
const AUTH_DIR = path.join(__dirname, ".auth");
export const CLIENT_AUTH_FILE = path.join(AUTH_DIR, "client.json");
export const VENDOR_AUTH_FILE = path.join(AUTH_DIR, "vendor.json");

// Ensure .auth directory exists
fs.mkdirSync(AUTH_DIR, { recursive: true });

// ── Helper: Login via API and save auth state ─────────────────────────────────

interface AuthStatePayload {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string | number;
    email: string;
    role: string;
    is_verified: boolean;
    is_staff: boolean;
    first_name: string;
    last_name: string;
  };
}

async function loginAndSaveAuth(
  request: import("@playwright/test").APIRequestContext,
  email: string,
  password: string,
  outputFile: string,
): Promise<void> {
  const loginRes = await request.post(`${API}/api/v1/auth/login/`, {
    data: { email_or_phone: email, password },
    headers: {
      "Content-Type": "application/json",
      "ngrok-skip-browser-warning": "true",
    },
  });

  if (!loginRes.ok()) {
    console.warn(`⚠️  Auth setup failed for ${email} — status ${loginRes.status()}`);
    return;
  }

  const body = await loginRes.json();
  const payload = body.data ?? body;

  const authData: AuthStatePayload = {
    accessToken: payload.access,
    refreshToken: payload.refresh,
    user: {
      id: payload.user_id,
      email,
      role: payload.role ?? "client",
      is_verified: true,
      is_staff: payload.role === "admin" || payload.role === "staff",
      first_name: payload.first_name ?? "",
      last_name: payload.last_name ?? "",
    },
  };

  // Save in the Zustand persist envelope format so addInitScript can inject directly
  const envelope = { state: authData, version: 0 };
  fs.writeFileSync(outputFile, JSON.stringify(envelope, null, 2));
  console.log(`✅ Auth saved to ${path.basename(outputFile)} for ${email}`);
}

// ── Seed client user ──────────────────────────────────────────────────────────
setup("seed: client auth", async ({ request }) => {
  await loginAndSaveAuth(
    request,
    process.env.E2E_CLIENT_EMAIL ?? "client@fashionistar.test",
    process.env.E2E_CLIENT_PASSWORD ?? "Client@Secure99!",
    CLIENT_AUTH_FILE,
  );
});

// ── Seed vendor user ──────────────────────────────────────────────────────────
setup("seed: vendor auth", async ({ request }) => {
  await loginAndSaveAuth(
    request,
    process.env.E2E_VENDOR_EMAIL ?? "vendor@fashionistar.test",
    process.env.E2E_VENDOR_PASSWORD ?? "Vendor@Secure99!",
    VENDOR_AUTH_FILE,
  );
});
