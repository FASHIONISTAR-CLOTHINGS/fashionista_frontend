/**
 * entities/user/hooks/use-current-user.ts
 * TanStack Query hook for fetching the current authenticated user profile.
 * Syncs server state with Zustand store on success.
 */

"use client";

import { useQuery } from "@tanstack/react-query";
import { useUserStore, selectUser, selectTokens } from "../store/user-store";
import type { User } from "../types";

const USER_PROFILE_QUERY_KEY = ["user", "profile"] as const;

async function fetchCurrentUser(accessToken: string): Promise<User> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/me/`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message ?? "Failed to load profile");
  }
  return res.json();
}

export function useCurrentUser() {
  const tokens = useUserStore(selectTokens);
  const setUser = useUserStore((s) => s.setUser);

  return useQuery<User, Error>({
    queryKey: USER_PROFILE_QUERY_KEY,
    queryFn: () => fetchCurrentUser(tokens!.access),
    enabled: !!tokens?.access,
    staleTime: 5 * 60 * 1000, // 5 min — profile data rarely changes
    gcTime: 10 * 60 * 1000,
    select: (data) => {
      setUser(data);
      return data;
    },
    retry: 1,
  });
}

/** Quick selector hook — no server fetch. Returns cached Zustand user. */
export function useUser(): User | null {
  return useUserStore(selectUser);
}

/** Role-guard hook: returns true if user has any of the given roles. */
export function useHasRole(...roles: string[]): boolean {
  const user = useUserStore(selectUser);
  if (!user) return false;
  return roles.includes(user.role);
}

/** Check if current user is a vendor */
export function useIsVendor(): boolean {
  return useHasRole("VENDOR", "SUPER_VENDOR");
}

/** Check if current user is admin or staff */
export function useIsAdmin(): boolean {
  return useHasRole("ADMIN", "SUPER_ADMIN", "STAFF", "SUPER_STAFF");
}
