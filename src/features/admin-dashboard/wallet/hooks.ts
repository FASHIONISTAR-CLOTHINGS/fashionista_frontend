/**
 * features/admin-dashboard/wallet/hooks.ts
 *
 * Admin Wallet TanStack Query Hooks — Fashionistar Financial Dashboard.
 *
 * Hooks:
 *   useAdminWallets()         — Fetch all platform vendor/client wallets.
 *   useAdminWalletKPIs()      — Fetch platform-level wallet KPI aggregates.
 *   useCompanyWalletBalance() — Fetch company commission wallet balance.
 *   useCompanyPayout()        — Mutation: initiate company commission payout.
 *   useToggleWalletFreeze()   — Mutation: freeze or unfreeze a wallet.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchAdminWallets,
  fetchAdminWalletKPIs,
  fetchCompanyWalletBalance,
  initiateCompanyWithdrawal,
  toggleWalletFreeze,
} from "./api/admin-wallet.api";
import type { CompanyPayoutRequest } from "./api/admin-wallet.api";
import { useToast } from "@/shared/hooks/use-toast";

// ── Query Keys ────────────────────────────────────────────────────────────────

export const adminWalletKeys = {
  all: ["admin-wallets"] as const,
  kpis: ["admin-wallets", "kpis"] as const,
  companyBalance: ["company-wallet-balance"] as const,
};

// ── Read Hooks ─────────────────────────────────────────────────────────────────

/**
 * Fetch all vendor/client wallets for the admin wallet management view.
 */
export function useAdminWallets() {
  return useQuery({
    queryKey: adminWalletKeys.all,
    queryFn: fetchAdminWallets,
    staleTime: 30_000, // 30s — wallet lists change infrequently
  });
}

/**
 * Fetch platform-level wallet KPI aggregates.
 */
export function useAdminWalletKPIs() {
  return useQuery({
    queryKey: adminWalletKeys.kpis,
    queryFn: fetchAdminWalletKPIs,
    staleTime: 60_000, // 60s — KPIs are aggregated, not real-time
  });
}

/**
 * Fetch the company commission wallet balance snapshot.
 *
 * Returns balance, available_balance, pending_balance, escrow_balance, status.
 * Auto-refetches every 30 seconds for near-real-time commission tracking.
 */
export function useCompanyWalletBalance() {
  return useQuery({
    queryKey: adminWalletKeys.companyBalance,
    queryFn: fetchCompanyWalletBalance,
    staleTime: 15_000, // 15s — financial data should be relatively fresh
    refetchInterval: 30_000, // Auto-refetch every 30s
  });
}

// ── Mutation Hooks ─────────────────────────────────────────────────────────────

/**
 * Initiate a company commission payout.
 *
 * On success:
 *   - Invalidates company wallet balance query.
 *   - Shows success toast with transaction reference.
 *
 * On error:
 *   - Shows error toast with backend security violation message.
 *   - Security violations (Door 1/2 failures) are surfaced directly.
 *
 * Usage:
 *   const { mutate, isPending } = useCompanyPayout();
 *   mutate({ amount: 500000, bank_code: "044", ... });
 */
export function useCompanyPayout() {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (payload: CompanyPayoutRequest) =>
      initiateCompanyWithdrawal(payload),
    onSuccess: (result) => {
      success(
        `Commission payout initiated! Reference: ${result.reference}`,
        { duration: 8000 }
      );
      // Invalidate balance so the updated available_balance shows immediately
      queryClient.invalidateQueries({ queryKey: adminWalletKeys.companyBalance });
    },
    onError: (err: Error) => {
      error(
        err.message || "Company payout failed. Please check the details and try again."
      );
    },
  });
}

/**
 * Freeze or unfreeze a specific wallet.
 *
 * Invalidates the wallet list on success so the status column updates.
 */
export function useToggleWalletFreeze() {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: ({
      walletId,
      action,
    }: {
      walletId: string;
      action: "freeze" | "unfreeze";
    }) => toggleWalletFreeze(walletId, action),
    onSuccess: (_, variables) => {
      success(
        `Wallet ${variables.walletId} successfully ${variables.action}d`
      );
      queryClient.invalidateQueries({ queryKey: adminWalletKeys.all });
    },
    onError: (err: Error) => {
      error(err?.message || "Failed to update wallet status");
    },
  });
}
