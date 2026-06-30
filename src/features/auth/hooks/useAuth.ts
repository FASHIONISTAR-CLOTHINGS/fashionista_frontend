/**
 * useAuth Hook — Composable auth hook for components
 *
 * Combines Zustand store selectors + TanStack Query mutations
 * into a single, ergonomic interface for auth operations.
 *
 * Wave B3 (Fix 2 — T4.5):
 *   - onSuccess: surfaces data.message in the "Signed out" success toast
 *   - onError: shows a warning toast (not silent) before forced local logout
 */
"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  useAuthStore,
  selectIsAuthenticated,
  selectUser,
  selectToken,
} from "@/features/auth/store/auth.store";
import { logout as logoutService } from "@/features/auth/services/auth.service";
import { parseApiError } from "@/lib/api/parseApiError";

export function useAuth() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const isAuthenticated = useAuthStore(selectIsAuthenticated);
  const user = useAuthStore(selectUser);
  const token = useAuthStore(selectToken);
  const logoutStore = useAuthStore((s) => s.logout);

  const { mutate: logout, isPending: isLoggingOut } = useMutation({
    mutationFn: logoutService,
    onSuccess: (data) => {
      logoutStore();
      queryClient.clear();
      toast.success("Signed out", {
        description:
          (data as { message?: string } | undefined)?.message ??
          "See you next time 👋",
      });
      router.push("/auth/sign-in");
    },
    onError: (error) => {
      // Force logout locally even if backend call fails (e.g. network error, token already revoked).
      // Show a low-noise warning so the user knows the backend was unreachable.
      const parsed = parseApiError(
        error,
        "Connection issue — we've signed you out locally.",
      );
      toast.warning("Signed out", {
        description: parsed.message,
        duration: 4000,
      });
      logoutStore();
      queryClient.clear();
      router.push("/auth/sign-in");
    },
  });

  return {
    isAuthenticated,
    user,
    token,
    isLoggingOut,
    logout: () => logout(),
  };
}
