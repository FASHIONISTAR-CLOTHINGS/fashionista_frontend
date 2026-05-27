/**
 * features/custom-order/admin-dashboard/hooks.ts
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  fetchAdminCustomOrders,
  fetchAdminCustomOrderDetail,
  updateAdminCustomOrderStatus,
} from "./api";
import type { AdminCustomOrderFilters } from "./types";

export const adminCustomOrderKeys = {
  all: ["admin-custom-orders"] as const,
  filtered: (filters: AdminCustomOrderFilters) => ["admin-custom-orders", filters] as const,
  detail: (id: string) => ["admin-custom-order", id] as const,
};

export function useAdminCustomOrders(filters: AdminCustomOrderFilters = {}) {
  return useQuery({
    queryKey: adminCustomOrderKeys.filtered(filters),
    queryFn: () => fetchAdminCustomOrders(filters),
    staleTime: 30_000,
  });
}

export function useAdminCustomOrderDetail(id: string, enabled = true) {
  return useQuery({
    queryKey: adminCustomOrderKeys.detail(id),
    queryFn: () => fetchAdminCustomOrderDetail(id),
    staleTime: 30_000,
    enabled: enabled && !!id,
  });
}

export function useUpdateAdminCustomOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: { id: string; status: string; reason?: string }) =>
      updateAdminCustomOrderStatus(variables.id, variables.status, variables.reason),
    onSuccess: (data) => {
      toast.success("Bespoke custom order status updated.");
      void queryClient.invalidateQueries({ queryKey: adminCustomOrderKeys.all });
      void queryClient.invalidateQueries({ queryKey: adminCustomOrderKeys.detail(data.id) });
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to update status.");
    },
  });
}
