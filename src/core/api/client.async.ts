/**
 * ASYNC API CLIENT — Ky + Django Ninja
 *
 * Used for: AI Measurement, Search, Analytics, Streaming, High-concurrency ops
 * Used for: Django-Ninja GET/HEAD reads under `/api/v1/ninja/*`.
 * Base URL: NEXT_PUBLIC_API_NINJA_URL (e.g. .../api/v1/ninja)
 *
 * Features:
 *  - 60s timeout for AI/streaming operations
 *  - Auto-retry: read-only 3x on 408, 429, 500-504 with exponential backoff
 *  - Bearer token injection before each request
 *  - ngrok-skip-browser-warning header in development
 *  - Unified dedup sonner toast on errors (same IDs as client.sync.ts)
 */
import ky, { type KyInstance, HTTPError } from "ky";
import { toast } from "sonner";
import {
  readAccessToken,
  readRefreshToken,
  patchStoredAuthState,
  syncMirrorCookies,
  buildAuthSessionMirror,
  clearStoredAuthState,
  clearMirrorCookies,
} from "@/features/auth/lib/auth-session.client";
import { getAsyncApiBaseUrl, getClientBackendRootUrl } from "@/core/config/api-roots";
import { buildAuditHeadersSync } from "@/lib/audit-headers";
import {
  isRefreshing,
  setRefreshing,
  subscribeTokenRefresh,
  onRefreshed,
} from "./refresh-state";
import axios from "axios";

// ── Async Client Instance ─────────────────────────────────────────────────────
export const apiAsync: KyInstance = ky.create({
  prefixUrl: getAsyncApiBaseUrl(),
  timeout: 60_000, // 60s for AI / streaming ops
  credentials: "include",
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },

  // ── Auto-Retry Logic ─────────────────────────────────────────────────────
  retry: {
    limit: 3,
    methods: ["get", "head"],
    statusCodes: [408, 413, 429, 500, 502, 503, 504],
    backoffLimit: 5000,
  },

  hooks: {
    // ── Before Request: inject auth token + ngrok header ──────────────────
    beforeRequest: [
      (request) => {
        // Inject JWT Bearer token
        const token = readAccessToken();
        if (token) {
          request.headers.set("Authorization", `Bearer ${token}`);
        }

        // Skip ngrok browser warning page in development
        if (process.env.NODE_ENV === "development") {
          request.headers.set("ngrok-skip-browser-warning", "true");
        }

        // Inject audit context headers (device ID, timezone, locale, platform)
        if (typeof window !== "undefined") {
          const auditHeaders = buildAuditHeadersSync();
          for (const [key, value] of Object.entries(auditHeaders)) {
            request.headers.set(key, value);
          }
        }
        // Ninja writes are intentionally outside the canonical frontend client.
        // Mutations use apiSync -> DRF so transaction/idempotency semantics stay sync.
      },
    ],

    // ── Before Retry: log retry attempt ───────────────────────────────────
    beforeRetry: [
      ({ request, retryCount }) => {
        if (process.env.NODE_ENV === "development") {
          console.warn(`[apiAsync] Retry #${retryCount} for ${request.url}`);
        }
      },
    ],

    // ── After Response: normalize errors + dedup toast ────────────────────
    afterResponse: [
      async (request, options, response) => {
        const isAuthEndpoint = (
          request.url.includes("/auth/login") ||
          request.url.includes("/auth/register") ||
          request.url.includes("/auth/google") ||
          request.url.includes("/auth/verify-otp") ||
          request.url.includes("/auth/resend-otp") ||
          request.url.includes("/password/reset") ||
          request.url.includes("/auth/token/refresh")
        );

        if (response.status === 401 && !isAuthEndpoint) {
          if (isRefreshing) {
            return new Promise((resolve) => {
              subscribeTokenRefresh((token: string) => {
                request.headers.set("Authorization", `Bearer ${token}`);
                resolve(ky(request, options));
              });
            });
          }

          setRefreshing(true);

          try {
            const refreshToken = readRefreshToken();
            if (!refreshToken) throw new Error("No refresh token");

            const { data } = await axios.post(
              `${getClientBackendRootUrl()}/api/v1/auth/token/refresh/`,
              { refresh: refreshToken },
              {
                withCredentials: true,
                headers: { "ngrok-skip-browser-warning": "true" },
              },
            );

            const newToken: string = data.access || data.data?.access;
            patchStoredAuthState({
              accessToken: newToken,
              isAuthenticated: true,
            });
            syncMirrorCookies(buildAuthSessionMirror());

            onRefreshed(newToken);
            request.headers.set("Authorization", `Bearer ${newToken}`);
            return ky(request, options);
          } catch (error) {
            if (typeof window !== "undefined") {
              clearStoredAuthState();
              clearMirrorCookies();
              window.location.href = "/auth/sign-in";
            }
            throw error;
          } finally {
            setRefreshing(false);
          }
        }

        if (!response.ok) {
          // ── Dev logging: silence 401 (expected during refresh/logout) ───
          if (process.env.NODE_ENV === "development" && response.status !== 401) {
            const body = await response.clone().text();
            console.error(
              `[apiAsync] ${response.status} ${response.url}\n${body}`,
            );
          }

          // ── Dedup toast (mirrors client.sync.ts logic) ──────────────────
          if (typeof window !== "undefined") {
            const status = response.status;
            // Only show for non-401 (handled by refresh logic above)
            if (status !== 401 && !(options as any)._suppressGlobalToast) {
              let richMessage = "An unexpected error occurred. Please try again.";
              try {
                const body = await response.clone().json() as Record<string, unknown>;
                if (typeof body.detail === "string" && body.detail) richMessage = body.detail;
                else if (typeof body.message === "string" && body.message) richMessage = body.message;
                else if (typeof body.error === "string" && body.error) richMessage = body.error;
              } catch {
                // Could not parse JSON — use default message
              }

              const statusLabel =
                status === 400 ? "Validation Error" :
                status === 403 ? "Access Denied" :
                status === 404 ? "Not Found" :
                status === 429 ? "Too Many Requests — Please Slow Down" :
                status >= 500 ? "Server Error" :
                `Request Failed (${status})`;

              toast.error(statusLabel, {
                id: `fashionistar-api-error-${status}`,
                description: richMessage,
                duration: 6000,
              });
            }
          }
        }
        return response;
      },
    ],

    // ── Before Error: handle network failures ─────────────────────────────
    beforeError: [
      (error) => {
        if (typeof window !== "undefined" && !(error instanceof HTTPError)) {
          // True network error (no response)
          toast.error("Backend Unreachable 🔌", {
            id: "fashionistar-network-error",
            description:
              "Cannot connect to the Fashionistar server. Please check your internet connection and try again.",
            duration: 8000,
          });
        }
        return error;
      },
    ],
  },
});

export default apiAsync;
