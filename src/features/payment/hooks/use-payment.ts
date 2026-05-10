"use client";

/**
 * @file use-payment.ts
 * @description TanStack Query hooks for the payment FSD feature.
 *
 * Hook Tiers:
 *  - DRF mutation hooks: useInitializePayment, useVerifyPayment, useFetchBanks
 *  - Ninja async hooks: useNinjaPaymentDashboard, useNinjaPaymentSummary,
 *                       useNinjaPaymentHistory
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createTransferRecipient,
  fetchBanks,
  getNinjaPaymentDashboard,
  getNinjaPaymentHistory,
  getNinjaPaymentSummary,
  initializePayment,
  verifyPayment,
} from "../api/payment.api";
import type { InitializePaymentInput, TransferRecipientInput } from "../types/payment.types";

// ─── Query Key Factory ────────────────────────────────────────────────────────

export const paymentKeys = {
  all: ["payment"] as const,
  banks: () => [...paymentKeys.all, "banks"] as const,
  verify: (ref: string) => [...paymentKeys.all, "verify", ref] as const,
  ninjaDashboard: () => [...paymentKeys.all, "ninja", "dashboard"] as const,
  ninjaSummary: () => [...paymentKeys.all, "ninja", "summary"] as const,
  ninjaHistory: (limit: number) => [...paymentKeys.all, "ninja", "history", limit] as const,
};

// ─── DRF Sync Hooks ───────────────────────────────────────────────────────────

/** Initialize a Paystack payment intent (DRF sync mutation) */
export function useInitializePayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: InitializePaymentInput) => initializePayment(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: paymentKeys.ninjaDashboard() });
      qc.invalidateQueries({ queryKey: paymentKeys.ninjaSummary() });
    },
  });
}

/** Verify a Paystack payment by reference (DRF sync) */
export function useVerifyPayment(reference: string) {
  return useQuery({
    queryKey: paymentKeys.verify(reference),
    queryFn: () => verifyPayment(reference),
    enabled: Boolean(reference),
    staleTime: 60_000,
  });
}

/** List available banks for transfer (DRF sync) */
export function useBanks() {
  return useQuery({
    queryKey: paymentKeys.banks(),
    queryFn: fetchBanks,
    staleTime: 10 * 60_000, // 10 minutes — bank list rarely changes
  });
}

/** Create a transfer recipient (DRF sync mutation) */
export function useCreateTransferRecipient() {
  return useMutation({
    mutationFn: (input: TransferRecipientInput) => createTransferRecipient(input),
  });
}

// ─── Ninja Async Hooks ────────────────────────────────────────────────────────

/**
 * Full payment dashboard from Ninja /payments/dashboard/
 * 2 DB queries: aggregate stats + 5 recent intents.
 */
export function useNinjaPaymentDashboard() {
  return useQuery({
    queryKey: paymentKeys.ninjaDashboard(),
    queryFn: getNinjaPaymentDashboard,
    staleTime: 30_000,
  });
}

/**
 * Lightweight payment summary from Ninja /payments/summary/
 * total_count, pending_count, succeeded_total
 */
export function useNinjaPaymentSummary() {
  return useQuery({
    queryKey: paymentKeys.ninjaSummary(),
    queryFn: getNinjaPaymentSummary,
    staleTime: 30_000,
  });
}

/**
 * Recent payment history from Ninja /payments/history/?limit=N
 * Ordered by -created_at. Default 10, max 50.
 */
export function useNinjaPaymentHistory(limit = 10) {
  return useQuery({
    queryKey: paymentKeys.ninjaHistory(limit),
    queryFn: () => getNinjaPaymentHistory(limit),
    staleTime: 30_000,
  });
}
