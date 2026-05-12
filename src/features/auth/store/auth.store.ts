/**
 * Auth Store — Zustand v5 with sessionStorage persistence
 *
 * Stores: access token, user info, authentication status
 * Persisted to sessionStorage (clears on browser tab close — security best practice)
 */
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  buildAuthSessionMirror,
  clearMirrorCookies,
  syncMirrorCookies,
} from "@/features/auth/lib/auth-session.client";

// ── Types ─────────────────────────────────────────────────────────────────────
export interface AuthUser {
  id: string;
  email?: string;
  phone?: string;
  first_name: string;
  last_name: string;
  /** "vendor" | "client" | "admin" — used for post-auth redirect logic */
  role?: string;
  is_verified: boolean;
  is_staff: boolean;
  /** True when the backend confirms a provisioned client profile exists. */
  has_client_profile?: boolean;
  /** True when the backend confirms a provisioned vendor profile exists. */
  has_vendor_profile?: boolean;
  /** Minimal backend client profile snapshot returned after auth. */
  client_profile?: Record<string, unknown> | null;
  /** Minimal backend vendor profile snapshot returned after auth. */
  vendor_profile?: Record<string, unknown> | null;
  /** Cloudinary URL — null when user has no avatar uploaded yet */
  avatar?: string | null;
  date_joined?: string;
}

export interface AuthSession {
  id: string; // UUID7 string — all backend models use string UUIDs, never numeric IDs
  device: string;
  ip_address: string;
  location?: string;
  last_seen: string;
  is_current: boolean;
}

export interface LoginEvent {
  id: number;
  timestamp: string;
  ip_address: string;
  device: string;
  location?: string;
  success: boolean;
}

interface AuthState {
  // ── State ──────────────────────────────────────────────────────────────
  accessToken: string | null;
  refreshToken: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  pendingOTPEmail?: string;
  pendingOTPPhone?: string;

  // ── Actions ────────────────────────────────────────────────────────────
  setToken: (token: string) => void;
  setTokens: (access: string, refresh: string) => void;
  setUser: (user: AuthUser) => void;
  setPendingOTP: (opts: { email?: string; phone?: string }) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
  /** Alias for logout — clears all auth state from store + sessionStorage */
  clearAuth: () => void;
}

// ── Store ─────────────────────────────────────────────────────────────────────
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,
      isLoading: false,
      pendingOTPEmail: undefined,
      pendingOTPPhone: undefined,

      setToken: (token) =>
        set((state) => {
          const nextState = { ...state, accessToken: token, isAuthenticated: true };
          syncMirrorCookies(buildAuthSessionMirror(nextState));
          return nextState;
        }),

      setTokens: (access, refresh) =>
        set((state) => {
          const nextState = {
            ...state,
            accessToken: access,
            refreshToken: refresh,
            isAuthenticated: true,
          };
          syncMirrorCookies(buildAuthSessionMirror(nextState));
          return nextState;
        }),

      setUser: (user) =>
        set((state) => {
          const nextState = { ...state, user };
          syncMirrorCookies(buildAuthSessionMirror(nextState));
          return nextState;
        }),

      setPendingOTP: ({ email, phone }) =>
        set({ pendingOTPEmail: email, pendingOTPPhone: phone }),

      setLoading: (loading) => set({ isLoading: loading }),

      logout: () =>
        set(() => {
          clearMirrorCookies();
          return {
            accessToken: null,
            refreshToken: null,
            user: null,
            isAuthenticated: false,
            pendingOTPEmail: undefined,
            pendingOTPPhone: undefined,
          };
        }),

      // clearAuth is an alias for logout — same behaviour
      clearAuth: () =>
        set(() => {
          clearMirrorCookies();
          return {
            accessToken: null,
            refreshToken: null,
            user: null,
            isAuthenticated: false,
            pendingOTPEmail: undefined,
            pendingOTPPhone: undefined,
          };
        }),
    }),
    {
      name: "fashionistar-auth",
      // sessionStorage: clears when the browser tab is closed
      // This is the correct security posture for JWT access tokens
      storage: createJSONStorage(() =>
        typeof window !== "undefined" ? sessionStorage : localStorage,
      ),
      // Only persist essential fields — NOT the loading state
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        pendingOTPEmail: state.pendingOTPEmail,
        pendingOTPPhone: state.pendingOTPPhone,
      }),
      onRehydrateStorage: () => (state) => {
        syncMirrorCookies(buildAuthSessionMirror(state));
      },
    },
  ),
);

// ── Selectors (for performance — avoid object spread re-renders) ───────────────
export const selectIsAuthenticated = (state: AuthState) =>
  state.isAuthenticated;
export const selectUser = (state: AuthState) => state.user;
export const selectToken = (state: AuthState) => state.accessToken;
