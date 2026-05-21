/**
 * SYNC API CLIENT — Axios + Django DRF
 *
 * Used for: Auth, Orders, Payments, Sessions, CRUD operations
 * Base URL: NEXT_PUBLIC_API_V1_URL (e.g. https://hydrographically-tawdrier.ngrok-free.dev/api)
 *
 * Features:
 *  - JWT Bearer token injection from Zustand auth store
 *  - Automatic token refresh on 401 (with subscriber queue for concurrent requests)
 *  - Circuit breaker (auto-opens after 5 consecutive failures)
 *  - Rich Sonner toast error on all failures with X-Trace-ID header
 *  - Dedup toast IDs prevent stacking on retries
 *  - Auth-form endpoints excluded from interceptor toast (they show AuthAlert inline)
 *  - ngrok-skip-browser-warning header injected in development
 */
import axios, {
  type AxiosInstance,
  type AxiosError,
  type InternalAxiosRequestConfig,
} from "axios";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import {
  buildAuthSessionMirror,
  clearMirrorCookies,
  clearStoredAuthState,
  patchStoredAuthState,
  readAccessToken,
  readRefreshToken,
  syncMirrorCookies,
} from "@/features/auth/lib/auth-session.client";
import { getClientBackendRootUrl, getSyncApiBaseUrl } from "@/core/config/api-roots";

// ── Circuit Breaker State ─────────────────────────────────────────────────────
let circuitOpen = false;
let consecutiveFailures = 0;
const CIRCUIT_THRESHOLD = 5;
const CIRCUIT_RESET_MS = 30_000; // 30 seconds

// ── Token Refresh Queue ───────────────────────────────────────────────────────
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

function subscribeTokenRefresh(cb: (token: string) => void) {
  refreshSubscribers.push(cb);
}

function onRefreshed(token: string) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

// ── Axios Instance ────────────────────────────────────────────────────────────
export const apiSync: AxiosInstance = axios.create({
  baseURL: getSyncApiBaseUrl(),
  timeout: 15_000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// ── Request Interceptor ───────────────────────────────────────────────────────
apiSync.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Circuit breaker guard
    if (circuitOpen) {
      return Promise.reject(
        new Error(
          "API circuit breaker is open. Too many consecutive failures.",
        ),
      ) as never;
    }

    const token = readAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Skip ngrok browser warning page in development
    if (process.env.NODE_ENV === "development" && config.headers) {
      config.headers["ngrok-skip-browser-warning"] = "true";
    }

    // Inject Idempotency-Key for write operations
    const method = config.method?.toUpperCase();
    if (method && ["POST", "PUT", "PATCH"].includes(method)) {
      if (config.headers && !config.headers["X-Idempotency-Key"] && !config.headers["x-idempotency-key"]) {
        config.headers["X-Idempotency-Key"] = uuidv4();
      }
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// ── Response Interceptor ──────────────────────────────────────────────────────
apiSync.interceptors.response.use(
  (response) => {
    // Reset circuit breaker on success
    consecutiveFailures = 0;
    if (circuitOpen) circuitOpen = false;

    // ── Fashionistar Envelope Unwrapping ─────────────────────────────────────
    // The backend FashionistarRenderer wraps ALL responses in:
    //   { "success": true, "message": "...", "data": { ...actual_payload... } }
    // We transparently unwrap the inner "data" field so service functions
    // can parse the actual API payload directly without knowing about the envelope.
    // Pass-through if: the response is a pre-wrapped payload already used by a service,
    // or if "data" key is missing (e.g., raw JSON from health endpoint).
    if (
      response.data &&
      typeof response.data === "object" &&
      "success" in response.data &&
      response.data.success === true &&
      "data" in response.data &&
      response.data.data !== null
    ) {
      // Unwrap: merge "data" inner payload with top-level fields
      // This allows services to access both access tokens AND message at root
      response.data = {
        ...response.data.data,
        message: response.data.message,
        _envelope: true, // Debug marker
      };
    }

    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
      /** Feature hooks that handle their own onError toast should set this to
       * true to bypass the global interceptor toast and prevent duplication. */
      _suppressGlobalToast?: boolean;
    };

    // ── 401: Auto Token Refresh ──────────────────────────────────────────────
    // IMPORTANT: Skip refresh for PUBLIC auth endpoints — these return 401 for
    // wrong credentials, NOT for expired tokens. Attempting refresh for these
    // would cause a hard redirect that prevents error alerts from showing.
    const requestUrl = originalRequest?.url ?? '';
    const isPublicAuthEndpoint = (
      requestUrl.includes('/auth/login') ||
      requestUrl.includes('/auth/register') ||
      requestUrl.includes('/auth/google') ||
      requestUrl.includes('/auth/verify-otp') ||
      requestUrl.includes('/auth/resend-otp') ||
      requestUrl.includes('/password/reset') ||
      requestUrl.includes('/auth/token/refresh')
    );

    if (
      error.response?.status === 401 &&
      !originalRequest?._retry &&
      !isPublicAuthEndpoint
    ) {
      if (isRefreshing) {
        // Queue this request until refresh completes
        return new Promise((resolve) => {
          subscribeTokenRefresh((token: string) => {
            if (originalRequest?.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            resolve(apiSync(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = readRefreshToken();

        // Only attempt refresh if we have a refresh token
        if (!refreshToken) {
          throw new Error("No refresh token available");
        }

        const { data } = await axios.post(
          `${getClientBackendRootUrl()}/api/v1/auth/token/refresh/`,
          { refresh: refreshToken },
          {
            withCredentials: true,
            headers: { "ngrok-skip-browser-warning": "true" },
          },
        );

        // Extract token — handle both raw response and Fashionistar envelope
        // {access: "..."} OR {success: true, data: {access: "..."}}
        const newToken: string = data.access || data.data?.access;

        patchStoredAuthState({
          accessToken: newToken,
          isAuthenticated: true,
        });
        syncMirrorCookies(buildAuthSessionMirror());

        onRefreshed(newToken);
        if (originalRequest?.headers) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
        }
        return apiSync(originalRequest);
      } catch (refreshError) {
        // Refresh truly failed for an authenticated request — force logout
        if (typeof window !== "undefined") {
          clearStoredAuthState();
          clearMirrorCookies();
          window.location.href = "/auth/sign-in"; // Canonical sign-in URL
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }


    // ── Circuit Breaker Logic ────────────────────────────────────────────────
    consecutiveFailures++;
    if (consecutiveFailures >= CIRCUIT_THRESHOLD) {
      circuitOpen = true;
      setTimeout(() => {
        circuitOpen = false;
        consecutiveFailures = 0;
      }, CIRCUIT_RESET_MS);
    }

    // ── Global Error Toast ───────────────────────────────────────────────────
    // ⚠️  AUTH-FORM ENDPOINTS ARE EXCLUDED:
    // LoginForm / RegisterForm / OTPVerifyForm display an AuthAlert banner
    // inline — firing a second toast from this interceptor would be the exact
    // duplicate the user reported. Skip toasting for those routes.
    const isAuthFormEndpoint = (
      requestUrl.includes('/auth/login') ||
      requestUrl.includes('/auth/register') ||
      requestUrl.includes('/auth/google') ||
      requestUrl.includes('/auth/verify-otp') ||
      requestUrl.includes('/auth/resend-otp') ||
      requestUrl.includes('/password/reset') ||
      requestUrl.includes('/auth/token/refresh')
    );

    if (typeof window !== "undefined" && !isAuthFormEndpoint && !originalRequest?._suppressGlobalToast) {
      const traceId = (error.response?.headers as Record<string, string>)?.[
        "x-trace-id"
      ];

      const isNetworkError = !error.response;

      if (isNetworkError) {
        // Fixed dedup ID — rapid retries never stack duplicate toasts
        toast.error("Backend Unreachable 🔌", {
          id: "fashionistar-network-error",
          description:
            "Cannot connect to the Fashionistar server. Please check your internet connection and try again.",
          duration: 8000,
        });
      } else if (error.response?.status !== 401) {
        // Don't toast on 401 — handled by refresh / logout logic above.
        // Extract the richest human-readable message from the Fashionistar envelope.
        const responseData = error.response?.data as Record<string, unknown> | undefined;
        let richMessage = "An unexpected error occurred. Please try again.";

        if (responseData && typeof responseData === "object") {
          const d = responseData;
          if (typeof d.detail === "string" && d.detail) {
            richMessage = d.detail;
          } else if (typeof d.message === "string" && d.message) {
            richMessage = d.message;
          } else if (typeof d.error === "string" && d.error) {
            richMessage = d.error;
          } else if (d.errors && typeof d.errors === "object" && !Array.isArray(d.errors)) {
            const firstErr = Object.values(d.errors as Record<string, unknown>).find(
              (v) => typeof v === "string",
            ) as string | undefined;
            if (firstErr) richMessage = firstErr;
          }
        }

        const status = error.response?.status;
        const statusLabel =
          status === 400 ? "Validation Error" :
          status === 403 ? "Access Denied" :
          status === 404 ? "Not Found" :
          status === 429 ? "Too Many Requests — Please Slow Down" :
          status === 500 ? "Server Error" :
          `Request Failed (${status})`;

        toast.error(statusLabel, {
          // Dedup by status so rapid same-error retries don't stack
          id: `fashionistar-api-error-${status}`,
          description: traceId
            ? `${richMessage} (Trace: ${traceId})`
            : richMessage,
          duration: 6000,
        });
      }
    }

    return Promise.reject(error);
  },
);

export default apiSync;
