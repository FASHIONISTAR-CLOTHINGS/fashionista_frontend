/**
 * axiosInstance.ts
 * ─────────────────
 * Canonical Axios instance for synchronous DRF API calls.
 *
 * Audit Header Injection (Wave B3):
 *   Every outgoing request automatically carries the X-Client-* audit
 *   header envelope from audit-headers.ts. This enriches the backend
 *   AuditEventLog with device ID, timezone, locale, and platform —
 *   fields the server cannot derive from IP address alone.
 *
 *   The sync variant (buildAuditHeadersSync) is used here because
 *   Axios interceptors must be synchronous. Geo headers are therefore
 *   not included here — they are added by the async variant in
 *   mutation hooks that can await the full buildAuditHeaders() call.
 *
 *   SSR safety: the interceptor registration is wrapped in a
 *   typeof window guard so it only runs in browser environments.
 *   The static import itself is safe in both SSR and browser.
 */
import axios from "axios";
import { getSyncApiBaseUrl } from "@/core/config/api-roots";
import { buildAuditHeadersSync } from "@/lib/audit-headers";

export const axiosInstance = axios.create({
  baseURL: getSyncApiBaseUrl(),
  headers: {
    "Content-Type": "application/json",
  },
});

// ── Audit header injection interceptor ────────────────────────────────────────
// Only run in browser environments — SSR has no localStorage or navigator.
// The typeof window check ensures this interceptor never executes during SSR
// (e.g. in Next.js server components or API routes).
if (typeof window !== "undefined") {
  axiosInstance.interceptors.request.use(
    (config) => {
      try {
        const auditHeaders = buildAuditHeadersSync();
        Object.assign(config.headers, auditHeaders);
      } catch {
        // Never let audit header injection break a request
      }
      return config;
    },
    (error) => Promise.reject(error),
  );
}

export default axiosInstance;
