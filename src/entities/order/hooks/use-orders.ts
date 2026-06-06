// src/entities/order/hooks/use-orders.ts
/**
 * TanStack Query hooks for the Order entity.
 * Consumers: features/order, features/checkout, features/vendor.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import ky from "ky";

const ORDERS_BASE = "/api/v1/ninja/orders/";

// ── Keys ──────────────────────────────────────────────────────────────────────

export const orderKeys = {
  all: ["orders"] as const,
  lists: () => [...orderKeys.all, "list"] as const,
  list: (params: Record<string, unknown>) => [...orderKeys.lists(), params] as const,
  details: () => [...orderKeys.all, "detail"] as const,
  detail: (id: string) => [...orderKeys.details(), id] as const,
};

// ── Types ─────────────────────────────────────────────────────────────────────

interface OrderListParams {
  page?: number;
  pageSize?: number;
  status?: string;
}

// ── Hooks ─────────────────────────────────────────────────────────────────────

/**
 * Paginated order list for the current authenticated user.
 */
export function useOrders(params: OrderListParams = {}) {
  const { page = 1, pageSize = 10, status } = params;
  const searchParams = new URLSearchParams({
    page: String(page),
    page_size: String(pageSize),
    ...(status ? { status } : {}),
  });

  return useQuery({
    queryKey: orderKeys.list(params),
    queryFn: async () => {
      const res = await ky.get(`${ORDERS_BASE}?${searchParams}`).json<{
        results: unknown[];
        count: number;
        next: string | null;
        previous: string | null;
      }>();
      return res;
    },
    staleTime: 30_000,
    placeholderData: (prev) => prev,
  });
}

/**
 * Single order detail by ID.
 */
export function useOrder(orderId: string | null) {
  return useQuery({
    queryKey: orderKeys.detail(orderId ?? ""),
    queryFn: async () => {
      const res = await ky.get(`${ORDERS_BASE}${orderId}/`).json();
      return res;
    },
    enabled: Boolean(orderId),
    staleTime: 60_000,
  });
}

/**
 * Cancel an order (PATCH status → cancelled).
 */
export function useCancelOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (orderId: string) => {
      return ky.patch(`${ORDERS_BASE}${orderId}/cancel/`).json();
    },
    onSuccess: (_, orderId) => {
      qc.invalidateQueries({ queryKey: orderKeys.detail(orderId) });
      qc.invalidateQueries({ queryKey: orderKeys.lists() });
    },
  });
}
