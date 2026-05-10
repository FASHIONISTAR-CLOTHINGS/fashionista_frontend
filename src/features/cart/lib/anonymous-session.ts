/**
 * Anonymous commerce session helpers.
 *
 * The key is intentionally not a JWT and contains no PII. It only links
 * anonymous cart, wishlist, and product-view rows until login/checkout merges
 * those rows into the authenticated user account.
 */

const STORAGE_KEY = "fashionistar_session_key";
const COOKIE_NAME = "fashionistar_session_key";
const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

function createSessionKey(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function writeCookie(value: string) {
  if (typeof document === "undefined") return;
  document.cookie = [
    `${COOKIE_NAME}=${encodeURIComponent(value)}`,
    `Max-Age=${ONE_YEAR_SECONDS}`,
    "Path=/",
    "SameSite=Lax",
  ].join("; ");
}

export function getFashionistarSessionKey(): string {
  if (typeof window === "undefined") return "";

  const existing = window.localStorage.getItem(STORAGE_KEY);
  if (existing) {
    writeCookie(existing);
    return existing;
  }

  const next = createSessionKey().slice(0, 40);
  window.localStorage.setItem(STORAGE_KEY, next);
  writeCookie(next);
  return next;
}

export function peekFashionistarSessionKey(): string {
  if (typeof window === "undefined") return "";

  const existing = window.localStorage.getItem(STORAGE_KEY) ?? "";
  if (existing) {
    writeCookie(existing);
  }
  return existing;
}

export function anonymousSessionHeaders(): Record<string, string> {
  const sessionKey = getFashionistarSessionKey();
  return sessionKey ? { "X-Fashionistar-Session-Key": sessionKey } : {};
}

export function anonymousSessionPayload(): { session_key?: string } {
  const sessionKey = getFashionistarSessionKey();
  return sessionKey ? { session_key: sessionKey } : {};
}
