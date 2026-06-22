"use client";

/**
 * @file hooks.ts
 * @description Admin hooks for the Cart domain using TanStack Query v5.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { fetchAdminCarts, fetchAdminCartDetail, clearAdminCart, PaginatedAdminCarts } from "./api";



export const cartAdminKeys = {
  all: ["cart", "admin"] as const,
  lists: () => [...cartAdminKeys.all, "list"] as const,
  list: (page: number) => [...cartAdminKeys.lists(), page] as const,
  details: () => [...cartAdminKeys.all, "detail"] as const,
  detail: (id: string) => [...cartAdminKeys.details(), id] as const,
} as const;

export function useAdminCarts(page = 1, search?: string) {
  return useQuery<PaginatedAdminCarts, Error>({
    queryKey: [...cartAdminKeys.list(page), search],
    queryFn: () => fetchAdminCarts(page, search),
    staleTime: 30_000,
  });
}

export function useAdminCartDetail(cartId: string, enabled = true) {
  return useQuery({
    queryKey: cartAdminKeys.detail(cartId),
    queryFn: () => fetchAdminCartDetail(cartId),
    staleTime: 30_000,
    enabled: enabled && !!cartId,
  });
}

export function useClearAdminCart() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (cartId: string) => clearAdminCart(cartId),
    onSuccess: (_, cartId) => {
      void qc.invalidateQueries({ queryKey: cartAdminKeys.lists() });
      void qc.invalidateQueries({ queryKey: cartAdminKeys.detail(cartId) });
      toast.success("Shopping cart cleared successfully by admin.");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || err.message || "Failed to clear cart.");
    },
  });
}
