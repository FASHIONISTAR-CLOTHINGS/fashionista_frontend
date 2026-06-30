/**
 * FASHIONISTAR — Frontend Audit Context Header Builder
 *
 * ============================================================================
 * PURPOSE:
 *   Builds the X-Client-* header envelope that enriches backend audit logs
 *   with accurate client-side context. The backend uses these headers to
 *   populate AuditEventLog rows with device ID, timezone, locale, platform,
 *   and optional GPS coordinates — fields that IP-based geolocation cannot
 *   accurately provide (especially for VPN/NAT users).
 *
 * CONTRACT:
 *   - Headers are ADDITIVE — they ENRICH, never REPLACE, server-derived context
 *   - X-Device-ID is generated once per browser session (localStorage-persisted)
 *   - Geo headers are OPTIONAL — omitted when geolocation permission is denied
 *   - All values are safe to log — no sensitive PII beyond what the server sees
 *   - Never throws — all errors are silently caught to avoid blocking requests
 *
 * HEADER FIELDS:
 *   X-Device-ID:           UUID v4, once per browser, localStorage-persisted
 *   X-Client-Timezone:     IANA timezone from Intl.DateTimeFormat() — accurate even behind VPN
 *   X-Client-Locale:       Browser language (navigator.language)
 *   X-Client-Platform:     OS platform via userAgentData (modern) or platform (legacy)
 *   X-Client-Geo-Lat:      GPS latitude — only if user grants geolocation permission
 *   X-Client-Geo-Lng:      GPS longitude — only if user grants geolocation permission
 *   X-Client-Geo-Accuracy: GPS accuracy in metres — < 50m indicates mobile GPS quality
 *
 * BACKEND CONSUMPTION:
 *   apps/audit_logs/middleware.py reads HTTP_X_DEVICE_ID, HTTP_X_CLIENT_TIMEZONE, etc.
 *   and stores them in the thread-local audit context alongside server-derived values.
 *
 * USAGE:
 *   import { buildAuditHeaders } from "@/lib/audit-headers";
 *   const auditHeaders = await buildAuditHeaders();
 *   // Pass to Axios instance defaults or Ky headers
 * ============================================================================
 */

// ── Header name constants ─────────────────────────────────────────────────────
export const AUDIT_HEADER_DEVICE_ID   = "X-Device-ID";
export const AUDIT_HEADER_TIMEZONE    = "X-Client-Timezone";
export const AUDIT_HEADER_LOCALE      = "X-Client-Locale";
export const AUDIT_HEADER_PLATFORM    = "X-Client-Platform";
export const AUDIT_HEADER_GEO_LAT     = "X-Client-Geo-Lat";
export const AUDIT_HEADER_GEO_LNG     = "X-Client-Geo-Lng";
export const AUDIT_HEADER_GEO_ACC     = "X-Client-Geo-Accuracy";

const DEVICE_ID_STORAGE_KEY = "fashionistar_device_id";

/**
 * getOrCreateDeviceId
 * ────────────────────
 * Returns a stable UUID v4 that uniquely identifies this browser instance.
 * Created once and persisted in localStorage so the same device ID appears
 * across page reloads and sessions — enabling cross-session device correlation
 * in the audit trail.
 *
 * Falls back gracefully if localStorage is unavailable (SSR, private browsing
 * in strict mode, or browser policy restrictions).
 *
 * @returns string — UUID v4, e.g. "550e8400-e29b-41d4-a716-446655440000"
 */
function getOrCreateDeviceId(): string {
  try {
    let id = localStorage.getItem(DEVICE_ID_STORAGE_KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(DEVICE_ID_STORAGE_KEY, id);
    }
    return id;
  } catch {
    // localStorage not available — generate a session-only ID as fallback
    return crypto.randomUUID();
  }
}

/**
 * buildAuditHeaders
 * ─────────────────
 * Builds the complete frontend audit context header envelope.
 *
 * Async because:
 *   1. The Permissions API (navigator.permissions.query) is async
 *   2. The Geolocation API (getCurrentPosition) is async
 *
 * The function NEVER throws — all errors are silently caught. If any header
 * cannot be built, it is simply omitted from the result object. This ensures
 * the function can safely be called in any request interceptor without risk
 * of breaking the HTTP request pipeline.
 *
 * Performance:
 *   - Timezone, locale, platform: synchronous → zero cost
 *   - Device ID: localStorage read → ~1μs
 *   - Geolocation: only attempted if permission already granted → does NOT
 *     show a browser permission prompt. If permission is "prompt" or "denied",
 *     geo headers are silently omitted.
 *
 * @returns Promise<Record<string, string>> — headers ready to inject
 */
export async function buildAuditHeaders(): Promise<Record<string, string>> {
  // ── Required headers (always present) ────────────────────────────────────
  const headers: Record<string, string> = {
    [AUDIT_HEADER_DEVICE_ID]: getOrCreateDeviceId(),
    [AUDIT_HEADER_TIMEZONE]:  Intl.DateTimeFormat().resolvedOptions().timeZone,
    [AUDIT_HEADER_LOCALE]:    navigator.language,
    [AUDIT_HEADER_PLATFORM]:  (navigator as unknown as { userAgentData?: { platform?: string } })
                                .userAgentData?.platform ?? navigator.platform,
  };

  // ── Optional geo headers (only when user has previously granted permission) ──
  // We check permission state FIRST before calling getCurrentPosition.
  // This ensures we NEVER trigger a permission prompt here — geo is advisory only.
  try {
    const permissionStatus = await navigator.permissions.query({
      name: "geolocation" as PermissionName,
    });

    if (permissionStatus.state === "granted") {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          timeout: 3000,        // 3 second max wait — audit headers must be fast
          maximumAge: 300_000,  // Accept cached position up to 5 minutes old
          enableHighAccuracy: false,  // Don't drain battery — coarse accuracy sufficient
        });
      });

      headers[AUDIT_HEADER_GEO_LAT] = String(position.coords.latitude);
      headers[AUDIT_HEADER_GEO_LNG] = String(position.coords.longitude);
      headers[AUDIT_HEADER_GEO_ACC] = String(position.coords.accuracy);
    }
  } catch {
    // Geolocation is optional — permission denied or timeout → silently omit geo headers
  }

  return headers;
}

/**
 * buildAuditHeadersSync
 * ──────────────────────
 * Synchronous variant — returns required headers only (no geo).
 * Use this in Axios request interceptors where async is not available,
 * or when geo context is not needed.
 *
 * @returns Record<string, string> — core audit headers (no geo)
 */
export function buildAuditHeadersSync(): Record<string, string> {
  return {
    [AUDIT_HEADER_DEVICE_ID]: getOrCreateDeviceId(),
    [AUDIT_HEADER_TIMEZONE]:  Intl.DateTimeFormat().resolvedOptions().timeZone,
    [AUDIT_HEADER_LOCALE]:    navigator.language,
    [AUDIT_HEADER_PLATFORM]:  (navigator as unknown as { userAgentData?: { platform?: string } })
                                .userAgentData?.platform ?? navigator.platform,
  };
}
