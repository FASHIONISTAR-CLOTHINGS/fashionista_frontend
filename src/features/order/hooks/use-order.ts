/**
 * @file use-order.ts
 * @description TanStack Query v5 hooks for the Order domain.
 *
 * Hook Tiers:
 *  - DRF sync hooks (mutations): useCancelOrder, useConfirmDelivery,
 *    useUpdateVendorProductionStatus, useUpdateAdminDeliveryStatus
 *  - Ninja async hooks (reads): useClientOrders, useOrderDetail, useVendorOrders,
 *    useAdminOrders, useNinjaClientOrderCounts, useNinjaVendorOrderCounts,
 *    useNinjaVendorFinancialSummary
 */
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  fetchClientOrders,
  fetchOrderDetail,
  fetchVendorOrderDetail,
  fetchAdminOrderDetail,
  cancelOrder,
  confirmDelivery,
  fetchVendorOrders,
  updateVendorProductionStatus,
  fetchAdminOrders,
  updateAdminDeliveryStatus,
  getNinjaClientOrderCounts,
  getNinjaVendorOrderCounts,
  getNinjaVendorFinancialSummary,
} from "../api/order.api";
import type {
  CancelOrderInput,
  VendorProductionStatusInput,
  AdminDeliveryStatusInput,
} from "../types/order.types";

// ─────────────────────────────────────────────────────────────────────────────
// QUERY KEY FACTORY
// ─────────────────────────────────────────────────────────────────────────────

export const orderKeys = {
  all: ["order"] as const,
  clientLists: () => [...orderKeys.all, "client", "list"] as const,
  clientList: (page: number) => [...orderKeys.clientLists(), page] as const,
  detail: (id: string) => [...orderKeys.all, "detail", id] as const,
  vendorDetail: (id: string) => [...orderKeys.all, "vendor", "detail", id] as const,
  adminDetail: (id: string) => [...orderKeys.all, "admin", "detail", id] as const,
  vendorLists: () => [...orderKeys.all, "vendor", "list"] as const,
  vendorList: (page: number) => [...orderKeys.vendorLists(), page] as const,
  adminLists: () => [...orderKeys.all, "admin", "list"] as const,
  adminList: (page: number) => [...orderKeys.adminLists(), page] as const,
  /** Ninja: per-status badge counts for client */
  clientCounts: () => [...orderKeys.all, "ninja", "client", "counts"] as const,
  /** Ninja: per-status badge counts for vendor */
  vendorCounts: () => [...orderKeys.all, "ninja", "vendor", "counts"] as const,
  /** Ninja: vendor financial summary (revenue/commission/payout/order_count) */
  vendorFinancials: () =>
    [...orderKeys.all, "ninja", "vendor", "financials"] as const,
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// CLIENT HOOKS
// ─────────────────────────────────────────────────────────────────────────────

export function useClientOrders(page = 1) {
  return useQuery({
    queryKey: orderKeys.clientList(page),
    queryFn: () => fetchClientOrders(page),
    staleTime: 30_000,
  });
}

export function useOrderDetail(orderId: string, enabled = true) {
  return useQuery({
    queryKey: orderKeys.detail(orderId),
    queryFn: () => fetchOrderDetail(orderId),
    staleTime: 30_000,
    enabled: enabled && !!orderId,
  });
}

export function useVendorOrderDetail(orderId: string, enabled = true) {
  return useQuery({
    queryKey: orderKeys.vendorDetail(orderId),
    queryFn: () => fetchVendorOrderDetail(orderId),
    staleTime: 30_000,
    enabled: enabled && !!orderId,
  });
}

export function useAdminOrderDetail(orderId: string, enabled = true) {
  return useQuery({
    queryKey: orderKeys.adminDetail(orderId),
    queryFn: () => fetchAdminOrderDetail(orderId),
    staleTime: 30_000,
    enabled: enabled && !!orderId,
  });
}

export function useCancelOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      orderId,
      input,
    }: {
      orderId: string;
      input: CancelOrderInput;
    }) => cancelOrder(orderId, input),
    onSuccess: (order) => {
      void qc.setQueryData(orderKeys.detail(order.id), order);
      void qc.invalidateQueries({ queryKey: orderKeys.clientLists() });
      void qc.invalidateQueries({ queryKey: orderKeys.clientCounts() });
      toast.success("Order cancelled successfully.");
    },
    onError: () => {
      toast.error("Could not cancel order. Please contact support.");
    },
  });
}

export function useConfirmDelivery() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (orderId: string) => confirmDelivery(orderId),
    onSuccess: (order) => {
      void qc.setQueryData(orderKeys.detail(order.id), order);
      void qc.invalidateQueries({ queryKey: orderKeys.clientLists() });
      void qc.invalidateQueries({ queryKey: orderKeys.clientCounts() });
      toast.success("Delivery confirmed! Payment released to vendor.");
    },
    onError: () => {
      toast.error("Could not confirm delivery.");
    },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// VENDOR HOOKS
// ─────────────────────────────────────────────────────────────────────────────

export function useVendorOrders(page = 1) {
  return useQuery({
    queryKey: orderKeys.vendorList(page),
    queryFn: () => fetchVendorOrders(page),
    staleTime: 30_000,
  });
}

export function useUpdateVendorProductionStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      orderId,
      input,
    }: {
      orderId: string;
      input: VendorProductionStatusInput;
    }) => updateVendorProductionStatus(orderId, input),
    onSuccess: (order) => {
      void qc.setQueryData(orderKeys.detail(order.id), order);
      void qc.invalidateQueries({ queryKey: orderKeys.vendorLists() });
      void qc.invalidateQueries({ queryKey: orderKeys.vendorCounts() });
      void qc.invalidateQueries({ queryKey: orderKeys.vendorFinancials() });
      toast.success("Order status updated.");
    },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN HOOKS
// ─────────────────────────────────────────────────────────────────────────────

export function useAdminOrders(page = 1) {
  return useQuery({
    queryKey: orderKeys.adminList(page),
    queryFn: () => fetchAdminOrders(page),
    staleTime: 30_000,
  });
}

export function useUpdateAdminDeliveryStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      orderId,
      input,
    }: {
      orderId: string;
      input: AdminDeliveryStatusInput;
    }) => updateAdminDeliveryStatus(orderId, input),
    onSuccess: (order) => {
      void qc.setQueryData(orderKeys.detail(order.id), order);
      void qc.invalidateQueries({ queryKey: orderKeys.adminLists() });
      toast.success("Delivery status updated.");
    },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// NINJA ASYNC HOOKS — Badge Counts & Financial Aggregates
// ─────────────────────────────────────────────────────────────────────────────

/**
 * useNinjaClientOrderCounts
 * Source: GET /ninja/orders/counts/ → single GROUP BY query.
 * Used for: navigation badge on "My Orders" pages.
 */
export function useNinjaClientOrderCounts() {
  return useQuery({
    queryKey: orderKeys.clientCounts(),
    queryFn: getNinjaClientOrderCounts,
    staleTime: 60_000,
  });
}

/**
 * useNinjaVendorOrderCounts
 * Source: GET /ninja/orders/vendor/counts/ → single GROUP BY query.
 * Used for: vendor dashboard sidebar badges.
 */
export function useNinjaVendorOrderCounts() {
  return useQuery({
    queryKey: orderKeys.vendorCounts(),
    queryFn: getNinjaVendorOrderCounts,
    staleTime: 60_000,
  });
}

/**
 * useNinjaVendorFinancialSummary
 * Source: GET /ninja/orders/vendor/financial-summary/
 * Delegates to aget_order_financial_summary_for_vendor() — single aaggregate().
 * Returns: { total_revenue, total_commission, total_payout, order_count }
 */
export function useNinjaVendorFinancialSummary() {
  return useQuery({
    queryKey: orderKeys.vendorFinancials(),
    queryFn: getNinjaVendorFinancialSummary,
    staleTime: 60_000,
  });
}
