// features/vendor/hooks/use-vendor-orders.ts
/**
 * TanStack Query hooks for vendor order management.
 * Aligned with: /api/v1/vendor/orders/*
 */
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { vendorApi } from "@/features/vendor/api/vendor.api";
import type { OrderStatus } from "@/features/vendor/types/vendor.types";

export const vendorOrderKeys = {
  all:    ["vendor", "orders"] as const,
  list:   ["vendor", "orders", "list"] as const,
  detail: (id: number) => ["vendor", "orders", id] as const,
  counts: ["vendor", "orders", "status-counts"] as const,
};

export function useVendorOrders() {
  return useQuery({
    queryKey:  vendorOrderKeys.list,
    queryFn:   vendorApi.getOrders,
    staleTime: 30_000,
  });
}

export function useVendorOrder(orderId: number) {
  return useQuery({
    queryKey:  vendorOrderKeys.detail(orderId),
    queryFn:   () => vendorApi.getOrder(orderId),
    staleTime: 30_000,
    enabled:   !!orderId,
  });
}

export function useVendorOrderStatusCounts() {
  return useQuery({
    queryKey:  vendorOrderKeys.counts,
    queryFn:   vendorApi.getOrderStatusCounts,
    staleTime: 30_000,
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, order_status }: { orderId: number; order_status: OrderStatus }) =>
      vendorApi.updateOrderStatus(orderId, order_status),
    onSuccess: (_data, { orderId }) => {
      queryClient.invalidateQueries({ queryKey: vendorOrderKeys.list });
      queryClient.invalidateQueries({ queryKey: vendorOrderKeys.detail(orderId) });
      queryClient.invalidateQueries({ queryKey: vendorOrderKeys.counts });
    },
  });
}
