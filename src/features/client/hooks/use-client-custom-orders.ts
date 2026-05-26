// features/client/hooks/use-client-custom-orders.ts
/**
 * TanStack Query hooks for client Custom Orders (bespoke commissions).
 *
 * Architecture: /api/v1/ninja/client/custom-orders/
 *
 * Hooks:
 *   - useClientCustomOrders()   → list with optional status filter
 *   - useClientCustomOrder(id)  → single detail
 *   - useCreateCustomOrder()    → mutation to submit new bespoke commission
 *   - usePayMilestone()         → mutation to pay next milestone
 */
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { clientApi } from "@/features/client/api/client.api";
import type {
  CustomOrder,
  CustomOrderCreatePayload,
  MilestonePayPayload,
} from "@/features/client/types/client.types";

export const customOrderKeys = {
  all:    (status?: string) => ["client", "custom-orders", status ?? "all"] as const,
  detail: (id: string)      => ["client", "custom-orders", "detail", id]   as const,
};

export function useClientCustomOrders(status?: string) {
  return useQuery<CustomOrder[]>({
    queryKey: customOrderKeys.all(status),
    queryFn:  () => clientApi.getCustomOrders(status ? { status } : undefined),
    staleTime: 30_000,
  });
}

export function useClientCustomOrder(id: string) {
  return useQuery<CustomOrder>({
    queryKey: customOrderKeys.detail(id),
    queryFn:  () => clientApi.getCustomOrder(id),
    staleTime: 30_000,
    enabled:  Boolean(id),
  });
}

export function useCreateCustomOrder() {
  const queryClient = useQueryClient();
  return useMutation<CustomOrder, Error, CustomOrderCreatePayload>({
    mutationFn: (payload) => clientApi.createCustomOrder(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["client", "custom-orders"] });
    },
  });
}

export function usePayMilestone(customOrderId: string) {
  const queryClient = useQueryClient();
  return useMutation<CustomOrder, Error, MilestonePayPayload>({
    mutationFn: (payload) => clientApi.payMilestone(customOrderId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: customOrderKeys.detail(customOrderId),
      });
      queryClient.invalidateQueries({ queryKey: ["client", "custom-orders"] });
    },
  });
}
