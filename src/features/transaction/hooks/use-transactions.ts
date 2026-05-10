"use client";

/**
 * @file use-transactions.ts
 * @description TanStack Query hooks for the transaction FSD feature.
 *
 * Hook Tiers:
 *  - Legacy DRF hooks: useTransactions (paginated list), useTransactionSummary
 *  - Ninja async hooks: useNinjaTransactionDashboard, useNinjaTransactionSummary,
 *                       useNinjaRecentTransactions
 */
import { useQuery } from "@tanstack/react-query";
import {
  fetchTransactionSummary,
  fetchTransactions,
  getNinjaRecentTransactions,
  getNinjaTransactionDashboard,
  getNinjaTransactionSummary,
} from "../api/transaction.api";

// ─── Query Key Factory ────────────────────────────────────────────────────────

export const transactionKeys = {
  all: ["transaction"] as const,
  /** DRF paginated list */
  list: (page: number) => [...transactionKeys.all, "list", page] as const,
  /** DRF summary aggregate */
  summary: () => [...transactionKeys.all, "summary"] as const,
  /** Ninja full dashboard snapshot */
  ninjaDashboard: () => [...transactionKeys.all, "ninja", "dashboard"] as const,
  /** Ninja lightweight summary */
  ninjaSummary: () => [...transactionKeys.all, "ninja", "summary"] as const,
  /** Ninja recent list */
  ninjaRecent: (limit: number) => [...transactionKeys.all, "ninja", "recent", limit] as const,
};

// ─── DRF Sync Hooks ───────────────────────────────────────────────────────────

/** Paginated transaction list from DRF /v1/transactions/ */
export function useTransactions(page = 1) {
  return useQuery({
    queryKey: transactionKeys.list(page),
    queryFn: () => fetchTransactions(page),
    staleTime: 30_000,
  });
}

/** Inflow/outflow summary from DRF /v1/transactions/summary/ */
export function useTransactionSummary() {
  return useQuery({
    queryKey: transactionKeys.summary(),
    queryFn: fetchTransactionSummary,
    staleTime: 30_000,
  });
}

// ─── Ninja Async Hooks ────────────────────────────────────────────────────────

/**
 * Full transaction dashboard from Ninja /transactions/dashboard/
 * 3 DB queries: inflow/outflow aggregate + status breakdown + 5 recent.
 * Stale time: 30s (financial data refreshes frequently).
 */
export function useNinjaTransactionDashboard() {
  return useQuery({
    queryKey: transactionKeys.ninjaDashboard(),
    queryFn: getNinjaTransactionDashboard,
    staleTime: 30_000,
  });
}

/**
 * Lightweight summary from Ninja /transactions/summary/
 * 1 DB aggregate query: inflow, outflow, net, count.
 */
export function useNinjaTransactionSummary() {
  return useQuery({
    queryKey: transactionKeys.ninjaSummary(),
    queryFn: getNinjaTransactionSummary,
    staleTime: 30_000,
  });
}

/**
 * Recent transactions from Ninja /transactions/recent/?limit=N
 * Ordered by -created_at. Default 10, max 50.
 */
export function useNinjaRecentTransactions(limit = 10) {
  return useQuery({
    queryKey: transactionKeys.ninjaRecent(limit),
    queryFn: () => getNinjaRecentTransactions(limit),
    staleTime: 30_000,
  });
}
