/**
 * @file hooks.ts
 * @description Admin hooks for the Order domain using TanStack Query v5.
 */
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  fetchAdminOrders,
  fetchAdminOrderDetail,
  updateAdminDeliveryStatus,
  transitionAdminOrderStatus,
  releaseAdminOrderEscrow,
  cancelAdminOrder,
} from "./api";
import type { AdminDeliveryStatusInput } from "@/features/order/types/order.types";

export const orderAdminKeys = {
  all: ["order", "admin"] as const,
  lists: () => [...orderAdminKeys.all, "list"] as const,
  list: (page: number) => [...orderAdminKeys.lists(), page] as const,
  details: () => [...orderAdminKeys.all, "detail"] as const,
  detail: (id: string) => [...orderAdminKeys.details(), id] as const,
} as const;

export function useAdminOrders(page = 1, search?: string, status?: string) {
  return useQuery({
    queryKey: [...orderAdminKeys.list(page), search, status],
    queryFn: () => fetchAdminOrders(page, search, status),
    staleTime: 30_000,
  });
}

export function useAdminOrderDetail(orderId: string, enabled = true) {
  return useQuery({
    queryKey: orderAdminKeys.detail(orderId),
    queryFn: () => fetchAdminOrderDetail(orderId),
    staleTime: 30_000,
    enabled: enabled && !!orderId,
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
      void qc.setQueryData(orderAdminKeys.detail(order.id), order);
      void qc.invalidateQueries({ queryKey: orderAdminKeys.lists() });
      toast.success("Delivery status updated successfully.");
    },
  });
}

export function useTransitionAdminOrderStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      orderId,
      newStatus,
      note,
    }: {
      orderId: string;
      newStatus: string;
      note?: string;
    }) => transitionAdminOrderStatus(orderId, newStatus, note),
    onSuccess: (order) => {
      void qc.setQueryData(orderAdminKeys.detail(order.id), order);
      void qc.invalidateQueries({ queryKey: orderAdminKeys.lists() });
      toast.success("Order status transitioned successfully.");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || err.message || "Failed to transition order status.");
    },
  });
}

export function useReleaseAdminOrderEscrow() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (orderId: string) => releaseAdminOrderEscrow(orderId),
    onSuccess: (order) => {
      void qc.setQueryData(orderAdminKeys.detail(order.id), order);
      void qc.invalidateQueries({ queryKey: orderAdminKeys.lists() });
      toast.success("Escrow funds released to vendor successfully.");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || err.message || "Failed to release escrow.");
    },
  });
}

export function useCancelAdminOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, reason }: { orderId: string; reason?: string }) =>
      cancelAdminOrder(orderId, reason),
    onSuccess: (order) => {
      void qc.setQueryData(orderAdminKeys.detail(order.id), order);
      void qc.invalidateQueries({ queryKey: orderAdminKeys.lists() });
      toast.success("Order cancelled by admin successfully.");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || err.message || "Failed to cancel order.");
    },
  });
}
