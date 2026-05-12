"use client";

import Cookies from "js-cookie";

import type {
  AuthSessionMirror,
  PersistedAuthStateLike,
} from "@/features/auth/lib/auth.types";
import { normalizeCanonicalRole } from "@/features/auth/lib/auth-routing";

export const AUTH_STORAGE_KEY = "fashionistar-auth";
const AUTH_HINT_COOKIE = "fashionistar_auth_hint";
const AUTH_ROLE_COOKIE = "fashionistar_role";

interface PersistEnvelope {
  state?: PersistedAuthStateLike;
}

function canUseBrowserStorage(): boolean {
  return typeof window !== "undefined" && typeof window.sessionStorage !== "undefined";
}

function safeParseEnvelope(value: string | null): PersistEnvelope | null {
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as PersistEnvelope;
  } catch {
    return null;
  }
}

function safeCookieOptions() {
  return {
    sameSite: "lax" as const,
    secure: typeof window !== "undefined" && window.location.protocol === "https:",
  };
}

export function readStoredAuthState(): PersistedAuthStateLike | null {
  if (!canUseBrowserStorage()) {
    return null;
  }

  const envelope = safeParseEnvelope(window.sessionStorage.getItem(AUTH_STORAGE_KEY));
  return envelope?.state ?? null;
}

export function readAccessToken(): string | null {
  return readStoredAuthState()?.accessToken ?? null;
}

export function readRefreshToken(): string | null {
  return readStoredAuthState()?.refreshToken ?? null;
}

export function patchStoredAuthState(patch: Partial<PersistedAuthStateLike>): void {
  if (!canUseBrowserStorage()) {
    return;
  }

  const envelope = safeParseEnvelope(window.sessionStorage.getItem(AUTH_STORAGE_KEY)) ?? {
    state: {},
  };

  envelope.state = {
    ...(envelope.state ?? {}),
    ...patch,
  };

  window.sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(envelope));
}

export function clearStoredAuthState(): void {
  if (!canUseBrowserStorage()) {
    return;
  }

  window.sessionStorage.removeItem(AUTH_STORAGE_KEY);
}

export function buildAuthSessionMirror(state?: PersistedAuthStateLike | null): AuthSessionMirror {
  const currentState = state ?? readStoredAuthState();
  const role = normalizeCanonicalRole(
    currentState?.user?.role,
    currentState?.user?.is_staff === true,
  );

  return {
    authenticated: Boolean(currentState?.isAuthenticated && currentState?.accessToken),
    role,
  };
}

export function syncMirrorCookies(mirror: AuthSessionMirror): void {
  if (typeof document === "undefined") {
    return;
  }

  if (!mirror.authenticated) {
    clearMirrorCookies();
    return;
  }

  const options = safeCookieOptions();
  Cookies.set(AUTH_HINT_COOKIE, "1", options);

  if (mirror.role) {
    Cookies.set(AUTH_ROLE_COOKIE, mirror.role, options);
  } else {
    Cookies.remove(AUTH_ROLE_COOKIE);
  }
}

export function clearMirrorCookies(): void {
  if (typeof document === "undefined") {
    return;
  }

  Cookies.remove(AUTH_HINT_COOKIE);
  Cookies.remove(AUTH_ROLE_COOKIE);
}
