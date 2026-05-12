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
 *  - Sonner toast error on all failures with X-Trace-ID header
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
  baseURL: process.env.NEXT_PUBLIC_API_V1_URL,
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
    };

    // ── 401: Auto Token Refresh ──────────────────────────────────────────────
    // IMPORTANT: Skip refresh for PUBLIC auth endpoints — these return 401 for
    // wrong credentials, NOT for expired tokens. Attempting refresh for these
    // would cause a hard redirect that prevents error alerts from showing.
    const requestUrl = originalRequest.url ?? '';
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
      !originalRequest._retry &&
      !isPublicAuthEndpoint
    ) {
      if (isRefreshing) {
        // Queue this request until refresh completes
        return new Promise((resolve) => {
          subscribeTokenRefresh((token: string) => {
            if (originalRequest.headers) {
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
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/auth/token/refresh/`,
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
        if (originalRequest.headers) {
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
    if (typeof window !== "undefined") {
      const traceId = (error.response?.headers as Record<string, string>)?.[
        "x-trace-id"
      ];
      const responseData = error.response?.data as
        | { detail?: string; message?: string; error?: string }
        | undefined;
      const message =
        responseData?.detail ||
        responseData?.message ||
        responseData?.error ||
        error.message ||
        "An unexpected error occurred";

      const isNetworkError = !error.response;
      if (isNetworkError) {
        toast.error("Network Error", {
          description: "Cannot reach the backend. Check your connection.",
        });
      } else if (error.response?.status !== 401) {
        // Don't show toast on 401 (handled by refresh logic)
        toast.error(`Request Failed (${error.response?.status})`, {
          description: traceId ? `${message} — Trace: ${traceId}` : message,
          duration: 5000,
        });
      }
    }

    return Promise.reject(error);
  },
);

export default apiSync;
