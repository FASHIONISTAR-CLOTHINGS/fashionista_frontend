/**
 * features/payment/hooks/use-payout.ts
 *
 * TanStack Query v5 hooks for vendor payout management.
 *
 * Hooks:
 *   - usePayoutHistory:      Paginated payout history with optional filters.
 *   - useInitiateVendorPayout: Atomic payout mutation with optimistic cache update.
 */

"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { initiateVendorPayout, fetchPayoutHistory } from "../api/payout.api";
import { payoutKeys } from "../types/payout.types";
import type {
  VendorPayout,
  VendorPayoutListEnvelope,
  PayoutInitiateInput,
  PayoutHistoryFilters,
} from "../types/payout.types";

// ─────────────────────────────────────────────────────────────────────────────
// Payout History Query
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fetch vendor payout history with optional filtering.
 *
 * Refreshes every 60 seconds to reflect completed payouts without
 * requiring a manual page reload.
 *
 * @param filters Optional status/provider/page filters
 */
export function usePayoutHistory(filters?: PayoutHistoryFilters) {
  return useQuery<VendorPayoutListEnvelope, Error>({
    queryKey:        payoutKeys.history(filters),
    queryFn:         () => fetchPayoutHistory(filters),
    staleTime:       60_000,
    refetchInterval: 60_000,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Initiate Payout Mutation
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Initiate a vendor payout.
 *
 * On success:
 *   - Invalidates payout history cache (forces re-fetch)
 *   - Toasts "Payout initiated" with the reference number
 *
 * On error:
 *   - Surfaces backend error message (e.g., KYC not verified, insufficient balance)
 */
export function useInitiateVendorPayout() {
  const queryClient = useQueryClient();

  return useMutation<VendorPayout, Error, PayoutInitiateInput>({
    mutationFn: initiateVendorPayout,

    onSuccess: (payout) => {
      // Invalidate history so new payout appears in the list
      queryClient.invalidateQueries({ queryKey: payoutKeys.all() });

      // Also invalidate wallet balance (it was debited)
      queryClient.invalidateQueries({ queryKey: ["wallet"] });

      toast.success(
        `Payout initiated! Reference: ${payout.reference}. ` +
        `Funds will be disbursed within 24 hours.`
      );
    },

    onError: (error) => {
      // Surface backend validation error (KYC, balance, provider errors)
      const message =
        (error as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail ?? "Payout initiation failed. Please try again.";
      toast.error(message);
    },
  });
}
