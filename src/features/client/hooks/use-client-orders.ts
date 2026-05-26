// features/client/hooks/use-client-orders.ts
/**
 * TanStack Query hooks for client order management.
 * Aligned with: /api/v1/client/orders/* (async Ninja)
 */
import { useQuery } from "@tanstack/react-query";
import { clientApi } from "@/features/client/api/client.api";
import type { ClientOrder } from "@/features/client/types/client.types";

export const clientOrderKeys = {
  all:    ["client", "orders"] as const,
  list:   ["client", "orders", "list"] as const,
  filtered: (status: string) => ["client", "orders", "list", status] as const,
  detail: (oid: string) => ["client", "orders", oid] as const,
};

export function useClientOrders(status?: string) {
  return useQuery<ClientOrder[]>({
    queryKey:  status ? clientOrderKeys.filtered(status) : clientOrderKeys.list,
    queryFn:   () => clientApi.getOrders(status ? { status } : undefined),
    staleTime: 30_000,
  });
}

export function useClientOrder(oid: string) {
  return useQuery<ClientOrder>({
    queryKey:  clientOrderKeys.detail(oid),
    queryFn:   () => clientApi.getOrder(oid),
    staleTime: 30_000,
    enabled:   !!oid,
  });
}
