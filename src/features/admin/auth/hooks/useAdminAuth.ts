/**
 * features/admin/auth/hooks/useAdminAuth.ts
 *
 * Query and mutation hooks for user/auth management in admin panel.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchAdminUsers,
  fetchAdminUserDetail,
  fetchAdminUserSessions,
  fetchAdminUserLoginEvents,
  fetchAdminUserStats,
  suspendUser,
  reactivateUser,
  verifyUser,
  forcePasswordReset,
  updateUserRole,
  updateAdminUser,
} from "../api";
import { toast } from "sonner";

export function useAdminUsers(filters?: {
  role?: string;
  is_active?: boolean;
  is_verified?: boolean;
  search?: string;
  ordering?: string;
  page?: number;
  page_size?: number;
}) {
  return useQuery({
    queryKey: ["admin", "users", filters],
    queryFn: () => fetchAdminUsers(filters),
    placeholderData: (previousData) => previousData,
    staleTime: 15_000,
  });
}

export function useAdminUserDetail(userId: string | null) {
  return useQuery({
    queryKey: ["admin", "users", "detail", userId],
    queryFn: () => fetchAdminUserDetail(userId!),
    enabled: !!userId,
    staleTime: 30_000,
  });
}

export function useAdminUserSessions(userId: string | null, page = 1) {
  return useQuery({
    queryKey: ["admin", "users", "sessions", userId, page],
    queryFn: () => fetchAdminUserSessions(userId!, page),
    enabled: !!userId,
    staleTime: 30_000,
  });
}

export function useAdminUserLoginEvents(userId: string | null, page = 1) {
  return useQuery({
    queryKey: ["admin", "users", "events", userId, page],
    queryFn: () => fetchAdminUserLoginEvents(userId!, page),
    enabled: !!userId,
    staleTime: 30_000,
  });
}

export function useAdminUserStats() {
  return useQuery({
    queryKey: ["admin", "users", "stats"],
    queryFn: fetchAdminUserStats,
    staleTime: 60_000,
  });
}

// ── Mutation Hooks ──────────────────────────────────────────────────────────

export function useSuspendUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, reason }: { userId: string; reason: string }) =>
      suspendUser(userId, reason),
    onSuccess: () => {
      toast.success("User account has been suspended.");
      void queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || err?.message || "Failed to suspend user.");
    },
  });
}

export function useReactivateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId }: { userId: string }) => reactivateUser(userId),
    onSuccess: () => {
      toast.success("User account reactivated successfully.");
      void queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || err?.message || "Failed to reactivate user.");
    },
  });
}

export function useVerifyUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId }: { userId: string }) => verifyUser(userId),
    onSuccess: () => {
      toast.success("User has been verified.");
      void queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || err?.message || "Failed to verify user.");
    },
  });
}

export function useForcePasswordReset() {
  return useMutation({
    mutationFn: ({ userId }: { userId: string }) => forcePasswordReset(userId),
    onSuccess: () => {
      toast.success("Password reset email sent to user.");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || err?.message || "Failed to trigger password reset.");
    },
  });
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: string }) =>
      updateUserRole(userId, role),
    onSuccess: () => {
      toast.success("User role updated successfully.");
      void queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || err?.message || "Failed to update role.");
    },
  });
}

export function useUpdateAdminUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: any }) =>
      updateAdminUser(userId, data),
    onSuccess: () => {
      toast.success("User updated successfully.");
      void queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || err?.message || "Failed to update user.");
    },
  });
}
