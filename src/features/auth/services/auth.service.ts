/**
 * Auth Service — All Authentication Operations
 *
 * Maps exactly to fashionistar_backend/apps/authentication/urls.py:
 *   DRF Sync:  /api/v1/auth/*  /api/v1/password/*  /api/v1/auth/sessions/*
 *   Ninja:     /api/v1/ninja/auth/*
 *
 * Uses apiSync (Axios) for all DRF endpoints.
 * Uses apiAsync (Ky) for Ninja endpoints when high-concurrency is needed.
 */
import { apiSync } from "@/core/api/client.sync";
import {
  AUTH_ENDPOINTS,
  PASSWORD_ENDPOINTS,
} from "@/core/constants/api.constants";
import type {
  LoginPayload,
  LoginResponse,
  RegisterPayload,
  OTPPayload,
  ResendOTPPayload,
  PasswordResetConfirmEmailPayload,
  PasswordResetConfirmPhonePayload,
  ChangePasswordPayload,
} from "@/features/auth/schemas/auth.schemas";
import { LoginResponseSchema } from "@/features/auth/schemas/auth.schemas";
import type { AuthSession, LoginEvent } from "@/features/auth/store/auth.store";
import {
  AuthUserSchema,
  type AuthUserProfile,
} from "@/features/auth/schemas/security.schemas";

// ── Me (Profile) ─────────────────────────────────────────────────────────────
/**
 * GET /api/v1/auth/me/
 * Rehydrates Zustand user state on page refresh. Validates response shape.
 */
export async function getMe(): Promise<AuthUserProfile> {
  const { data } = await apiSync.get(AUTH_ENDPOINTS.ME);
  const payload = typeof data === 'object' && data !== null && 'data' in data
    ? (data as { data: unknown }).data
    : data;
  return AuthUserSchema.parse(payload);
}


// ── Login ─────────────────────────────────────────────────────────────────────
/**
 * POST /api/v1/auth/login/
 * Returns: JWT access token + user info. May set requires_otp=true.
 */
export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const { data } = await apiSync.post(AUTH_ENDPOINTS.LOGIN, payload);
  // Validate response shape against Zod schema (zero-trust)
  return LoginResponseSchema.parse(data);
}

// ── Register ──────────────────────────────────────────────────────────────────
/**
 * POST /api/v1/auth/register/
 * Triggers OTP send to email or phone. User must verify before logging in.
 */
export async function register(
  payload: RegisterPayload,
): Promise<{ message: string }> {
  // Map frontend field names to backend serializer field names:
  //   password_confirm → password2 (Django UserRegistrationSerializer)
  //   first_name / last_name passed through directly
  //   role passed from route searchParam (vendor | client)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const backendPayload: Record<string, any> = {
    email: payload.email || undefined,
    phone: payload.phone || undefined,
    first_name: payload.first_name || undefined,
    last_name: payload.last_name || undefined,
    password: payload.password,
    password2: payload.password_confirm, // Backend expects password2
    role: payload.role ?? "client",       // From route searchParam via form prop
  };

  // Remove empty optional fields to avoid backend validation errors
  if (!backendPayload.email) delete backendPayload.email;
  if (!backendPayload.phone) delete backendPayload.phone;
  if (!backendPayload.first_name) delete backendPayload.first_name;
  if (!backendPayload.last_name) delete backendPayload.last_name;

  const { data } = await apiSync.post(AUTH_ENDPOINTS.REGISTER, backendPayload);
  return data;
}

// ── OTP Verification ──────────────────────────────────────────────────────────
/**
 * POST /api/v1/auth/verify-otp/
 * Verifies OTP after registration or login. Returns JWT tokens on success.
 */
export async function verifyOTP(payload: OTPPayload): Promise<LoginResponse> {
  const { data } = await apiSync.post(AUTH_ENDPOINTS.VERIFY_OTP, payload);
  return LoginResponseSchema.parse(data);
}

// ── Resend OTP ────────────────────────────────────────────────────────────────
/**
 * POST /api/v1/auth/resend-otp/
 * Re-sends OTP to email or phone.
 * Backend ResendOTPRequestSerializer expects: { email_or_phone: string }
 */
export async function resendOTP(
  payload: ResendOTPPayload,
): Promise<{ message: string }> {
  const { data } = await apiSync.post(AUTH_ENDPOINTS.RESEND_OTP, payload);
  return data;
}

// ── Google OAuth ──────────────────────────────────────────────────────────────
/**
 * POST /api/v1/auth/google/
 *
 * Sends { id_token, role? } to the Django backend.
 * The backend verifies the id_token with Google's public keys (google-auth library),
 * finds or creates the user, and issues our own JWT access + refresh tokens.
 *
 * - For LOGIN:    call with (idToken) — role is optional (derived from DB)
 * - For REGISTER: call with (idToken, role) — role required for new user creation
 */
export async function googleAuth(
  idToken: string,
  role?: string,
): Promise<LoginResponse> {
  const payload: Record<string, string> = { id_token: idToken };
  if (role) payload.role = role;
  const { data } = await apiSync.post(AUTH_ENDPOINTS.GOOGLE, payload);
  return LoginResponseSchema.parse(data);
}


// ── Logout ────────────────────────────────────────────────────────────────────
/**
 * POST /api/v1/auth/logout/
 * Sends refresh token to backend for blacklisting.
 * Caller (AccountOptions) MUST also call clearAuth() from the Zustand store
 * to clear local state — regardless of whether this API call succeeds.
 */
export async function logout(): Promise<void> {
  try {
    const store = await import("@/features/auth/store/auth.store");
    const refreshToken = store.useAuthStore.getState().refreshToken;
    if (refreshToken) {
      await apiSync.post(AUTH_ENDPOINTS.LOGOUT, { refresh: refreshToken });
    } else {
      await apiSync.post(AUTH_ENDPOINTS.LOGOUT, {});
    }
  } catch {
    // Silently ignore — local auth is cleared regardless of API response
  }
}

// ── Token Refresh ─────────────────────────────────────────────────────────────
/**
 * POST /api/v1/auth/token/refresh/
 * Sends HTTP-only refresh token cookie → returns new access token.
 * Handled automatically by apiSync interceptor.
 */
export async function refreshToken(): Promise<{ access: string }> {
  const { data } = await apiSync.post(AUTH_ENDPOINTS.REFRESH, {});
  return data;
}

// ── Session Management ────────────────────────────────────────────────────────
/**
 * GET /api/v1/auth/sessions/
 * Returns all active sessions for the authenticated user (Telegram-style).
 */
export async function getSessions(): Promise<AuthSession[]> {
  const { data } = await apiSync.get(AUTH_ENDPOINTS.SESSIONS);
  return data;
}

/**
 * DELETE /api/v1/auth/sessions/<id>/
 * Revokes a specific session by numeric ID.
 */
export async function revokeSession(sessionId: number): Promise<void> {
  await apiSync.delete(AUTH_ENDPOINTS.SESSION_REVOKE(String(sessionId)));
}

/**
 * POST /api/v1/auth/sessions/revoke-others/
 * Revoke all sessions except the current one (logout all other devices).
 */
export async function revokeOtherSessions(): Promise<{ message: string }> {
  const { data } = await apiSync.post(
    AUTH_ENDPOINTS.SESSIONS_REVOKE_OTHERS,
    {},
  );
  return data;
}

/**
 * GET /api/v1/auth/login-events/
 * Binance-style login audit log — IP, device, location, success/failure.
 */
export async function getLoginEvents(): Promise<LoginEvent[]> {
  const { data } = await apiSync.get(AUTH_ENDPOINTS.LOGIN_EVENTS);
  return data;
}

// ── Password Management ───────────────────────────────────────────────────────
/**
 * POST /api/v1/password/reset-request/
 *
 * Backend: PasswordResetRequestSerializer expects: { email_or_phone: string }
 * The serializer detects email vs phone and routes accordingly.
 * Always returns 200 (anti-enumeration — same response whether user exists or not).
 */
export async function requestPasswordReset(
  payload: { email_or_phone: string },
): Promise<{ message: string }> {
  const { data } = await apiSync.post(
    PASSWORD_ENDPOINTS.RESET_REQUEST,
    payload,
  );
  return data;
}

/**
 * POST /api/v1/password/reset-confirm/<uidb64>/<token>/
 * Confirms email-based reset (link from email).
 */
export async function confirmPasswordResetEmail(
  payload: PasswordResetConfirmEmailPayload,
): Promise<{ message: string }> {
  const { uidb64, token, new_password, new_password_confirm } = payload;
  const { data } = await apiSync.post(
    PASSWORD_ENDPOINTS.RESET_CONFIRM_EMAIL(uidb64, token),
    {
      password: new_password,
      password2: new_password_confirm,
    },
  );
  return data;
}

/**
 * POST /api/v1/password/reset-phone-confirm/
 * Confirms phone-based reset using OTP only (no phone field in payload).
 */
export async function confirmPasswordResetPhone(
  payload: PasswordResetConfirmPhonePayload,
): Promise<{ message: string }> {
  const { data } = await apiSync.post(
    PASSWORD_ENDPOINTS.RESET_CONFIRM_PHONE,
    payload,
  );
  return data;
}

/**
 * POST /api/v1/password/change/
 * Change password for an authenticated user (requires old password).
 */
export async function changePassword(
  payload: ChangePasswordPayload,
): Promise<{ message: string }> {
  const { data } = await apiSync.post(PASSWORD_ENDPOINTS.CHANGE, payload);
  return data;
}
