// features/client/hooks/use-client-orders.ts
/**
 * TanStack Query hooks for client order management.
 * Aligned with: /api/v1/client/orders/*
 */
import { useQuery } from "@tanstack/react-query";
import { clientApi } from "@/features/client/api/client.api";

export const clientOrderKeys = {
  all:    ["client", "orders"] as const,
  list:   ["client", "orders", "list"] as const,
  detail: (oid: string) => ["client", "orders", oid] as const,
};

export function useClientOrders() {
  return useQuery({
    queryKey:  clientOrderKeys.list,
    queryFn:   clientApi.getOrders,
    staleTime: 30_000,
  });
}

export function useClientOrder(oid: string) {
  return useQuery({
    queryKey:  clientOrderKeys.detail(oid),
    queryFn:   () => clientApi.getOrder(oid),
    staleTime: 30_000,
    enabled:   !!oid,
  });
}
