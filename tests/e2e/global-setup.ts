import fs from "node:fs";
import path from "node:path";

import type { FullConfig } from "@playwright/test";

type SeededAuthSession = {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    role: string;
    is_staff: boolean;
    first_name: string;
    last_name: string;
    is_verified: boolean;
    has_vendor_profile?: boolean;
    has_client_profile?: boolean;
  };
};

type SeededAuthMap = Record<string, SeededAuthSession>;

const seededAuthPath = path.resolve(
  process.cwd(),
  "tests/e2e/.tmp/seeded-auth.json",
);

function decodeJwtExp(token: string): number | null {
  try {
    const [, payload] = token.split(".");
    const json = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as {
      exp?: number;
    };
    return json.exp ?? null;
  } catch {
    return null;
  }
}

function shouldRefresh(token: string): boolean {
  const exp = decodeJwtExp(token);
  if (!exp) return true;
  const now = Math.floor(Date.now() / 1000);
  return exp <= now + 300;
}

async function refreshSession(
  backendBaseUrl: string,
  session: SeededAuthSession,
): Promise<SeededAuthSession> {
  const response = await fetch(`${backendBaseUrl}/api/v1/auth/token/refresh/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh: session.refreshToken }),
  });
  if (!response.ok) {
    throw new Error(`Token refresh failed with status ${response.status}`);
  }
  const payload = (await response.json()) as {
    data?: { access?: string; refresh?: string };
    access?: string;
    refresh?: string;
  };
  const accessToken = payload?.data?.access ?? payload?.access ?? session.accessToken;
  const refreshToken = payload?.data?.refresh ?? payload?.refresh ?? session.refreshToken;
  return {
    ...session,
    accessToken,
    refreshToken,
  };
}

export default async function globalSetup(_config: FullConfig) {
  if (!fs.existsSync(seededAuthPath)) return;

  const backendBaseUrl =
    process.env.PLAYWRIGHT_BACKEND_BASE_URL ?? "http://127.0.0.1:8000";

  const content = fs.readFileSync(seededAuthPath, "utf8");
  const sessions = JSON.parse(content) as SeededAuthMap;

  let updated = false;
  for (const [key, session] of Object.entries(sessions)) {
    if (!shouldRefresh(session.accessToken)) {
      continue;
    }
    try {
      sessions[key] = await refreshSession(backendBaseUrl, session);
      updated = true;
    } catch (error) {
      console.warn(`[playwright global-setup] Could not refresh seeded auth for ${key}:`, error);
    }
  }

  if (updated) {
    fs.writeFileSync(seededAuthPath, JSON.stringify(sessions, null, 2));
  }
}
