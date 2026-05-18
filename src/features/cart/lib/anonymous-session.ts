/**
 * Anonymous commerce session helpers — 2027 Edition.
 *
 * The key is intentionally not a JWT and contains no PII. It only links
 * anonymous cart, wishlist, and product-view rows until login/checkout merges
 * those rows into the authenticated user account.
 *
 * Changes (2027 modernization):
 *  • Cookie now sets Secure flag when running on HTTPS.
 *  • clearFashionistarSessionKey() — call after successful merge to prevent
 *    the anonymous key from being reused post-login.
 *  • sessionKeyExists() — boolean check used by mergeAnonymousCommerce before
 *    making the merge API call (avoids a network round-trip when no guest key).
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
  const isSecure =
    typeof location !== "undefined" && location.protocol === "https:";
  document.cookie = [
    `${COOKIE_NAME}=${encodeURIComponent(value)}`,
    `Max-Age=${ONE_YEAR_SECONDS}`,
    "Path=/",
    "SameSite=Lax",
    ...(isSecure ? ["Secure"] : []),
  ].join("; ");
}

function deleteCookie() {
  if (typeof document === "undefined") return;
  // Max-Age=0 instructs the browser to expire the cookie immediately.
  document.cookie = `${COOKIE_NAME}=; Max-Age=0; Path=/; SameSite=Lax`;
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

/**
 * Returns true when an anonymous session key is already stored.
 * Used by mergeAnonymousCommerce to skip the merge API call when the user
 * never added anything as a guest.
 */
export function sessionKeyExists(): boolean {
  if (typeof window === "undefined") return false;
  return Boolean(window.localStorage.getItem(STORAGE_KEY));
}

/**
 * Clear the anonymous session key from both localStorage and the cookie.
 * Called after a successful cart/wishlist merge so the anonymous identity
 * cannot be re-used across multiple authenticated sessions.
 */
export function clearFashionistarSessionKey(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
  deleteCookie();
}

export function anonymousSessionHeaders(): Record<string, string> {
  const sessionKey = getFashionistarSessionKey();
  return sessionKey ? { "X-Fashionistar-Session-Key": sessionKey } : {};
}

export function anonymousSessionPayload(): { session_key?: string } {
  const sessionKey = getFashionistarSessionKey();
  return sessionKey ? { session_key: sessionKey } : {};
}
