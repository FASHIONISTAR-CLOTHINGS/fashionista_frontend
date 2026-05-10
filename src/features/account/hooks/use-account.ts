/**
 * @file use-account.ts
 * @description TanStack Query v5 hooks for the unified Account domain.
 *
 * Hook Architecture:
 *  - `useAccountDashboard()` → parallel asyncio.gather-style bundle: 4 concurrent reads
 *  - `useAccountProfile()` → client profile + addresses (Ninja read)
 *  - `useAccountWalletBalance()` → wallet balance widget (Ninja read, 30s stale)
 *  - `useAccountOrderCounts()` → badge counts per status (Ninja read, 60s stale)
 *  - `useAccountRecentTransactions()` → transaction feed (Ninja read)
 *  - `useUpdateProfile()` → profile mutation (DRF sync)
 *  - `useAddAddress()` / `useUpdateAddress()` / `useDeleteAddress()` → address mutations
 *  - `useSetDefaultAddress()` → set default shipping address
 */
"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
  useQueries,
} from "@tanstack/react-query";
import { toast } from "sonner";
import {
  fetchAccountProfile,
  fetchAccountWalletBalance,
  fetchAccountOrderCounts,
  fetchAccountRecentTransactions,
  updateAccountProfile,
  addAccountAddress,
  updateAccountAddress,
  deleteAccountAddress,
  setDefaultAddress,
} from "../api/account.api";
import type {
  UpdateProfileInput,
  AddAddressInput,
  AccountDashboard,
} from "../types/account.types";

// ─────────────────────────────────────────────────────────────────────────────
// QUERY KEY FACTORY
// ─────────────────────────────────────────────────────────────────────────────

export const accountKeys = {
  all: ["account"] as const,
  profile: () => [...accountKeys.all, "profile"] as const,
  walletBalance: () => [...accountKeys.all, "wallet", "balance"] as const,
  orderCounts: () => [...accountKeys.all, "order", "counts"] as const,
  recentTransactions: (limit: number) =>
    [...accountKeys.all, "transactions", "recent", limit] as const,
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// INDIVIDUAL READS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Hook: fetch client profile + addresses.
 * Source: GET /api/v1/ninja/client/profile/
 * Used in: /account/profile page, settings panel.
 */
export function useAccountProfile() {
  return useQuery({
    queryKey: accountKeys.profile(),
    queryFn: fetchAccountProfile,
    staleTime: 60_000,
  });
}

/**
 * Hook: fetch wallet balance widget data.
 * Source: GET /api/v1/ninja/wallet/dashboard/
 * Used in: account dashboard balance card, header balance indicator.
 */
export function useAccountWalletBalance() {
  return useQuery({
    queryKey: accountKeys.walletBalance(),
    queryFn: fetchAccountWalletBalance,
    staleTime: 30_000,
  });
}

/**
 * Hook: fetch per-status order counts for navigation badges.
 * Source: GET /api/v1/ninja/orders/counts/
 * Backend: single GROUP BY query — <5ms.
 */
export function useAccountOrderCounts() {
  return useQuery({
    queryKey: accountKeys.orderCounts(),
    queryFn: fetchAccountOrderCounts,
    staleTime: 60_000,
  });
}

/**
 * Hook: fetch recent transactions for the account dashboard feed.
 * Source: GET /api/v1/ninja/transactions/recent/?limit=N
 * @param limit Max number of transactions to fetch (default 10).
 */
export function useAccountRecentTransactions(limit = 10) {
  return useQuery({
    queryKey: accountKeys.recentTransactions(limit),
    queryFn: () => fetchAccountRecentTransactions(limit),
    staleTime: 30_000,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// BUNDLE HOOK (Parallel 4-way fetch)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * useAccountDashboard
 *
 * Fires all 4 Ninja reads in parallel using useQueries().
 * This mirrors the asyncio.gather() pattern on the backend.
 * The dashboard only mounts once all 4 queries resolve.
 *
 * Returns:
 *  - dashboard: AccountDashboard | undefined — assembled once all 4 succeed
 *  - isLoading: true while any query is pending
 *  - isError: true if any query fails
 *
 * Used in: /account/dashboard page, /account/overview
 */
export function useAccountDashboard() {
  const results = useQueries({
    queries: [
      {
        queryKey: accountKeys.profile(),
        queryFn: fetchAccountProfile,
        staleTime: 60_000,
      },
      {
        queryKey: accountKeys.walletBalance(),
        queryFn: fetchAccountWalletBalance,
        staleTime: 30_000,
      },
      {
        queryKey: accountKeys.orderCounts(),
        queryFn: fetchAccountOrderCounts,
        staleTime: 60_000,
      },
      {
        queryKey: accountKeys.recentTransactions(10),
        queryFn: () => fetchAccountRecentTransactions(10),
        staleTime: 30_000,
      },
    ],
  });

  const [profileResult, walletResult, orderCountsResult, txResult] = results;

  const isLoading = results.some((r) => r.isLoading);
  const isError = results.some((r) => r.isError);
  const isSuccess = results.every((r) => r.isSuccess);

  const dashboard: AccountDashboard | undefined =
    isSuccess && profileResult.data && walletResult.data && orderCountsResult.data && txResult.data
      ? {
          profile: profileResult.data,
          wallet: walletResult.data,
          order_counts: orderCountsResult.data,
          recent_transactions: txResult.data,
        }
      : undefined;

  return {
    dashboard,
    isLoading,
    isError,
    isSuccess,
    profileQuery: profileResult,
    walletQuery: walletResult,
    orderCountsQuery: orderCountsResult,
    transactionsQuery: txResult,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// PROFILE MUTATIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Mutation: update client profile (partial patch via DRF sync).
 * Invalidates profile query on success.
 */
export function useUpdateAccountProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateProfileInput) => updateAccountProfile(input),
    onSuccess: (profile) => {
      void qc.setQueryData(accountKeys.profile(), profile);
      toast.success("Profile updated successfully.");
    },
    onError: () => {
      toast.error("Could not update profile. Please try again.");
    },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// ADDRESS MUTATIONS
// ─────────────────────────────────────────────────────────────────────────────

/** Mutation: add a new shipping address. */
export function useAddAccountAddress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: AddAddressInput) => addAccountAddress(input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: accountKeys.profile() });
      toast.success("Address added.");
    },
    onError: () => {
      toast.error("Could not add address.");
    },
  });
}

/** Mutation: update an existing shipping address. */
export function useUpdateAccountAddress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: number;
      input: Partial<AddAddressInput>;
    }) => updateAccountAddress(id, input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: accountKeys.profile() });
      toast.success("Address updated.");
    },
    onError: () => {
      toast.error("Could not update address.");
    },
  });
}

/** Mutation: delete a shipping address. */
export function useDeleteAccountAddress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteAccountAddress(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: accountKeys.profile() });
      toast.success("Address removed.");
    },
    onError: () => {
      toast.error("Could not remove address.");
    },
  });
}

/** Mutation: set an address as the default shipping destination. */
export function useSetDefaultAddress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => setDefaultAddress(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: accountKeys.profile() });
      toast.success("Default address updated.");
    },
    onError: () => {
      toast.error("Could not update default address.");
    },
  });
}
