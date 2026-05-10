/**
 * useAuth Hook — Composable auth hook for components
 *
 * Combines Zustand store selectors + TanStack Query mutations
 * into a single, ergonomic interface for auth operations.
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

export function useAuth() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const isAuthenticated = useAuthStore(selectIsAuthenticated);
  const user = useAuthStore(selectUser);
  const token = useAuthStore(selectToken);
  const logoutStore = useAuthStore((s) => s.logout);

  const { mutate: logout, isPending: isLoggingOut } = useMutation({
    mutationFn: logoutService,
    onSuccess: () => {
      logoutStore();
      queryClient.clear();
      toast.success("Signed out", { description: "See you next time 👋" });
      router.push("/auth/sign-in");
    },
    onError: () => {
      // Force logout locally even if backend call fails
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
