// features/vendor/hooks/use-vendor-orders.ts
/**
 * TanStack Query hooks for vendor orders & finance mutations.
 * Aligned with:
 *   GET   /api/v1/vendor/orders/              — DRF sync list (all orders)
 *   GET   /api/v1/vendor/orders/{id}/         — DRF sync detail
 *   PATCH /api/v1/vendor/orders/{id}/status/  — order status update
 *   POST  /api/v1/vendor/payout/              — save payout (bank) profile
 *   POST  /api/v1/vendor/pin/set/             — set wallet PIN
 *   POST  /api/v1/vendor/pin/verify/          — verify wallet PIN
 */
"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { vendorApi } from "@/features/vendor/api/vendor.api";
import type {
  VendorOrderStatus,
  VendorPayoutPayload,
  VendorPinSetPayload,
  VendorPinVerifyPayload,
} from "@/features/vendor/types/vendor.types";

// ── Query Keys ────────────────────────────────────────────────────────────────
export const vendorOrderKeys = {
  all:    ["vendor", "orders"] as const,
  list:   (filter?: string) => ["vendor", "orders", "list", filter ?? ""] as const,
  detail: (id: number) => ["vendor", "orders", id] as const,
  counts: ["vendor", "orders", "status-counts"] as const,
};

// ── Order List ────────────────────────────────────────────────────────────────
/**
 * Fetches ALL vendor orders from the DRF sync endpoint.
 * Unlike `useVendorDashboard()`, this is not limited to 10 recent orders.
 * `filterStatus` is applied client-side after fetch for instant tab switching.
 */
export function useVendorOrders(filterStatus?: string) {
  return useQuery({
    queryKey:  vendorOrderKeys.list(filterStatus),
    queryFn:   vendorApi.getOrders,
    staleTime: 30_000,
    select: (raw) => {
      // Normalise: API may return array or { results: [] }
      const arr = Array.isArray(raw)
        ? raw
        : ((raw as { results?: unknown[] })?.results ?? ([] as unknown[]));

      type OrderRow = {
        id: number;
        oid?: string;
        buyer_email: string;
        buyer_full_name?: string;
        order_status: string;
        payment_status?: string;
        total_price?: number;
        date: string;
      };

      const rows = arr as OrderRow[];

      if (!filterStatus || filterStatus === "all") return rows;
      return rows.filter(
        (o) => o.order_status?.toLowerCase() === filterStatus.toLowerCase(),
      );
    },
  });
}

// ── Single Order Detail ────────────────────────────────────────────────────────
export function useVendorOrder(orderId: number | null) {
  return useQuery({
    queryKey:  vendorOrderKeys.detail(orderId ?? 0),
    queryFn:   () => vendorApi.getOrder(orderId!),
    enabled:   !!orderId && orderId > 0,
    staleTime: 30_000,
  });
}

// ── Status Count Badges ───────────────────────────────────────────────────────
export function useVendorOrderStatusCounts() {
  return useQuery({
    queryKey:  vendorOrderKeys.counts,
    queryFn:   vendorApi.getOrderStatusCounts,
    staleTime: 60_000,
  });
}

// ── Update Order Status ───────────────────────────────────────────────────────
export function useUpdateOrderStatus() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({
      orderId,
      order_status,
    }: {
      orderId: number;
      order_status: VendorOrderStatus;
    }) => vendorApi.updateOrderStatus(orderId, order_status),

    onSuccess: (_data, { orderId }) => {
      toast.success("Order status updated ✓");
      qc.invalidateQueries({ queryKey: ["vendor", "orders"] });
      qc.invalidateQueries({ queryKey: vendorOrderKeys.detail(orderId) });
      qc.invalidateQueries({ queryKey: vendorOrderKeys.counts });
      // Refresh dashboard recent orders
      qc.invalidateQueries({ queryKey: ["vendor", "dashboard"] });
    },

    onError: () => {
      toast.error("Status update failed. Please try again.");
    },
  });
}

// ── Payout Profile Mutation ───────────────────────────────────────────────────
export function useSubmitPayoutProfile() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload: VendorPayoutPayload) => vendorApi.savePayout(payload),

    onSuccess: () => {
      toast.success("Bank account saved! 🎉", {
        description: "Your account is under verification — usually takes 24h.",
        duration: 5000,
      });
      qc.invalidateQueries({ queryKey: ["vendor", "dashboard"] });
    },

    onError: () => {
      toast.error("Could not save bank account. Check details and retry.");
    },
  });
}

// ── Wallet PIN Hooks ──────────────────────────────────────────────────────────
export function useSetVendorPin() {
  return useMutation({
    mutationFn: (payload: VendorPinSetPayload) => vendorApi.setPin(payload),
    onSuccess:  () => toast.success("Wallet PIN set successfully!"),
    onError:    () => toast.error("Failed to set PIN. Please try again."),
  });
}

export function useVerifyVendorPin() {
  return useMutation({
    mutationFn: (payload: VendorPinVerifyPayload) => vendorApi.verifyPin(payload),
  });
}
