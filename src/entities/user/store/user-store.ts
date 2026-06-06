/**
 * entities/user/store/user-store.ts
 * Zustand client-state store for authenticated user.
 * Handles persist middleware for localStorage hydration.
 */

"use client";

import { create } from "zustand";
import { persist, devtools } from "zustand/middleware";
import type { User, AuthTokens } from "../types";

interface UserState {
  user: User | null;
  tokens: AuthTokens | null;
  isHydrated: boolean;
}

interface UserActions {
  setUser: (user: User | null) => void;
  setTokens: (tokens: AuthTokens | null) => void;
  clearAuth: () => void;
  updateUser: (patch: Partial<User>) => void;
  setHydrated: (val: boolean) => void;
}

export type UserStore = UserState & UserActions;

export const useUserStore = create<UserStore>()(
  devtools(
    persist(
      (set) => ({
        user: null,
        tokens: null,
        isHydrated: false,

        setUser: (user) => set({ user }, false, "setUser"),
        setTokens: (tokens) => set({ tokens }, false, "setTokens"),
        clearAuth: () => set({ user: null, tokens: null }, false, "clearAuth"),
        updateUser: (patch) =>
          set(
            (state) => ({ user: state.user ? { ...state.user, ...patch } : null }),
            false,
            "updateUser"
          ),
        setHydrated: (val) => set({ isHydrated: val }, false, "setHydrated"),
      }),
      {
        name: "fashionistar-user",
        partialize: (state) => ({ user: state.user, tokens: state.tokens }),
        onRehydrateStorage: () => (state) => {
          state?.setHydrated(true);
        },
      }
    ),
    { name: "UserStore" }
  )
);

// Typed selectors — avoid re-renders by selecting minimal slices
export const selectUser = (s: UserStore) => s.user;
export const selectTokens = (s: UserStore) => s.tokens;
export const selectIsAuthenticated = (s: UserStore) => !!s.user && !!s.tokens;
export const selectUserRole = (s: UserStore) => s.user?.role ?? null;
export const selectIsHydrated = (s: UserStore) => s.isHydrated;
