/**
 * API Constants — Single Source of Truth for All Backend Endpoint Paths
 *
 * Mirrors fashionistar_backend URL configuration exactly:
 *   - apps/authentication/urls.py  (DRF + Ninja)
 *   - apps/common/urls.py          (Health, Cloudinary)
 *
 * Usage:
 *   import { AUTH_ENDPOINTS } from '@/core/constants/api.constants';
 *   apiSync.post(AUTH_ENDPOINTS.LOGIN, payload)
 */

// ── Authentication Endpoints (DRF Sync) — /api/v1/auth/* ─────────────────────
export const AUTH_ENDPOINTS = {
  // POST — Email/Phone + Password login → JWT tokens
  LOGIN: "/v1/auth/login/",

  // POST — Create new user account
  REGISTER: "/v1/auth/register/",

  // POST — Verify OTP after registration or login
  VERIFY_OTP: "/v1/auth/verify-otp/",

  // POST — Re-send OTP to email or phone
  RESEND_OTP: "/v1/auth/resend-otp/",

  // POST — Google OAuth2 — send `code` from Google redirect
  GOOGLE: "/v1/auth/google/",

  // POST — Invalidate all tokens and sessions for current user
  LOGOUT: "/v1/auth/logout/",

  // POST — Send refresh token → receive new access token
  REFRESH: "/v1/auth/token/refresh/",

  // GET — List all active sessions (Telegram-style security dashboard)
  SESSIONS: "/v1/auth/sessions/",

  // DELETE — Revoke a specific session by UUID7 string ID
  SESSION_REVOKE: (sessionId: string) => `/v1/auth/sessions/${sessionId}/`,

  // POST — Revoke all sessions except the current one
  SESSIONS_REVOKE_OTHERS: "/v1/auth/sessions/revoke-others/",

  // GET — Binance-style login audit log
  LOGIN_EVENTS: "/v1/auth/login-events/",

  // GET — Authenticated user profile (for SSR rehydration on page refresh)
  ME: "/v1/auth/me/",
} as const;

// ── Password Endpoints (DRF Sync) — /api/v1/password/* ───────────────────────
export const PASSWORD_ENDPOINTS = {
  // POST — Request password reset (sends email or SMS OTP)
  RESET_REQUEST: "/v1/password/reset-request/",

  // POST — Confirm email-based reset (uidb64 + token from email link)
  RESET_CONFIRM_EMAIL: (uidb64: string, token: string) =>
    `/v1/password/reset-confirm/${uidb64}/${token}/`,

  // POST — Confirm phone-based reset (OTP from SMS, no phone field)
  RESET_CONFIRM_PHONE: "/v1/password/reset-phone-confirm/",

  // POST — Change password (authenticated user, requires old password)
  CHANGE: "/v1/password/change/",
} as const;

// ── Common Endpoints — /api/v1/ ───────────────────────────────────────────────
export const COMMON_ENDPOINTS = {
  // GET — Health probe (ELB, Kubernetes, Uptime Robot)
  HEALTH: "/v1/health/",

  // POST — Cloudinary signed upload token (JWT required)
  UPLOAD_PRESIGN: "/v1/upload/presign/",

  // POST — Cloudinary webhook receiver (backend-only, no frontend call needed)
  CLOUDINARY_WEBHOOK: "/v1/upload/webhook/cloudinary/",
} as const;

// ── Django Ninja Async Endpoints — /api/v1/ninja/* ────────────────────────────
export const NINJA_ENDPOINTS = {
  // Base path for all Ninja auth routes (auto-mounted from ninja_api)
  AUTH_BASE: "/v1/ninja/auth/",
} as const;

// ── HTTP Status Codes — For consistent response handling ──────────────────────
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
} as const;

// ── API Configuration ─────────────────────────────────────────────────────────
export const API_CONFIG = {
  // DRF Sync client timeout (ms)
  SYNC_TIMEOUT: 15_000,
  // Ky Async client timeout — longer for AI/streaming ops
  ASYNC_TIMEOUT: 60_000,
  // Auto-refresh retry window
  REFRESH_RETRY_LIMIT: 3,
  // Circuit breaker — open after N consecutive failures
  CIRCUIT_BREAKER_THRESHOLD: 5,
} as const;
