"use client";

/**
 * @file use-wallet.ts
 * @description TanStack Query hooks for wallet reads and PIN operations.
 *
 * Hook routing:
 *  - DRF sync: useWallet, useSetWalletPin, useVerifyWalletPin, useChangeWalletPin
 *  - Ninja async: useWalletDashboard (balance + hold stats from DB classmethods)
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  changeWalletPin,
  fetchWallet,
  getNinjaWalletDashboard,
  initiateWithdrawal,
  setWalletPin,
  verifyWalletPin,
} from "../api/wallet.api";
import type { WithdrawalInput } from "../types/wallet.types";

// ─── Query Key Factories ──────────────────────────────────────────────────────

export const walletKeys = {
  all: ["wallet"] as const,
  me: () => [...walletKeys.all, "me"] as const,
  /** Ninja async dashboard snapshot (balance + hold stats) */
  dashboard: () => [...walletKeys.all, "dashboard"] as const,
};

// ─── DRF Sync Hooks ───────────────────────────────────────────────────────────

export function useWallet() {
  return useQuery({
    queryKey: walletKeys.me(),
    queryFn: fetchWallet,
    staleTime: 15_000,
  });
}

export function useSetWalletPin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: setWalletPin,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: walletKeys.all }),
  });
}

export function useVerifyWalletPin() {
  return useMutation({ mutationFn: verifyWalletPin });
}

export function useChangeWalletPin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: changeWalletPin,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: walletKeys.all }),
  });
}

// ─── Ninja Async Hooks ────────────────────────────────────────────────────────

/**
 * useWalletDashboard — Full wallet dashboard snapshot.
 * Source: GET /ninja/wallet/dashboard/ → Wallet.aget_full_dashboard_data()
 * Includes: balance, available_balance, escrow_balance, pending_balance,
 *           active_holds_count, total_held_amount, has_pin, currency_code.
 */
export function useWalletDashboard() {
  return useQuery({
    queryKey: walletKeys.dashboard(),
    queryFn: getNinjaWalletDashboard,
    staleTime: 15_000,
  });
}

/**
 * useInitiateWithdrawal — Initiate a wallet withdrawal with KYC gate.
 *
 * Source: POST /api/v1/wallet/withdraw/
 * Server enforces KYC approval + PIN + balance checks.
 *
 * KYC Error: HTTP 403 → displays a targeted message directing user to KYC
 * instead of a generic failure.
 */
export function useInitiateWithdrawal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: WithdrawalInput) => initiateWithdrawal(payload),
    onSuccess: () => {
      // Refresh balance data after successful withdrawal
      void queryClient.invalidateQueries({ queryKey: walletKeys.all });
    },
    onError: (err: unknown) => {
      // Surface KYC-specific messaging if the gate fires
      if (
        err &&
        typeof err === "object" &&
        "response" in err
      ) {
        const resp = (err as { response?: { status?: number; data?: { detail?: string } } }).response;
        if (resp?.status === 403) {
          throw new Error(
            resp?.data?.detail ??
            "KYC not approved. Complete identity verification before withdrawing.",
          );
        }
      }
      throw err;
    },
  });
}
