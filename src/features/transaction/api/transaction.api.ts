/**
 * @file transaction.api.ts
 * @description Transaction read/write API client.
 *
 * Endpoint Routing:
 *  - DRF sync  → /v1/transactions/ (reads + writes, CustomJSONRenderer)
 *  - Ninja async → /transactions/ through apiAsync prefix /api/v1/ninja
 */
import { apiSync } from "@/core/api/client.sync";
import { apiAsync } from "@/core/api/client.async";
import { unwrapApiData } from "@/core/api/response";
import {
  NinjaRecentTransactionsSchema,
  PaginatedTransactionsSchema,
  TransactionDashboardSchema,
  TransactionSummarySchema,
  parseTransactionResponse,
} from "../schemas/transaction.schemas";
import type {
  NinjaRecentTransactions,
  PaginatedTransactions,
  TransactionDashboard,
  TransactionSummary,
} from "../types/transaction.types";

function normalizeList(payload: unknown): PaginatedTransactions {
  const data = unwrapApiData<unknown>(payload);
  if (Array.isArray(data)) {
    return { count: data.length, next: null, previous: null, results: data as never[] };
  }
  if (data && typeof data === "object" && "results" in data) {
    return data as PaginatedTransactions;
  }
  return { count: 0, next: null, previous: null, results: [] };
}

// ─── DRF Sync Endpoints ───────────────────────────────────────────────────────

export async function fetchTransactions(page = 1): Promise<PaginatedTransactions> {
  const { data } = await apiSync.get<unknown>("/v1/transactions/", { params: { page } });
  return parseTransactionResponse(
    PaginatedTransactionsSchema,
    normalizeList(data),
    "fetchTransactions",
  ) as PaginatedTransactions;
}

export async function fetchTransactionSummary(): Promise<TransactionSummary> {
  const { data } = await apiSync.get<unknown>("/v1/transactions/summary/");
  return parseTransactionResponse(
    TransactionSummarySchema,
    unwrapApiData(data),
    "fetchTransactionSummary",
  ) as TransactionSummary;
}

// ─── Ninja Async Endpoints ────────────────────────────────────────────────────

/**
 * GET /api/v1/ninja/transactions/dashboard/
 * Returns: TransactionDashboard (inflow/outflow + breakdown + recent 5)
 * Delegates to Transaction.aget_full_dashboard_data()
 */
export async function getNinjaTransactionDashboard(): Promise<TransactionDashboard> {
  const envelope = await apiAsync
    .get("transactions/dashboard/")
    .json<{ status: string; data: unknown }>();
  return parseTransactionResponse(
    TransactionDashboardSchema,
    envelope?.data ?? envelope,
    "getNinjaTransactionDashboard",
  ) as TransactionDashboard;
}

/**
 * GET /api/v1/ninja/transactions/summary/
 * Returns: TransactionSummary (inflow/outflow/net/count)
 */
export async function getNinjaTransactionSummary(): Promise<TransactionSummary> {
  const envelope = await apiAsync
    .get("transactions/summary/")
    .json<{ status: string; data: unknown }>();
  return parseTransactionResponse(
    TransactionSummarySchema,
    envelope?.data ?? envelope,
    "getNinjaTransactionSummary",
  ) as TransactionSummary;
}

/**
 * GET /api/v1/ninja/transactions/recent/?limit=N
 * Returns: NinjaRecentTransactions
 */
export async function getNinjaRecentTransactions(limit = 10): Promise<NinjaRecentTransactions> {
  const envelope = await apiAsync
    .get(`transactions/recent/?limit=${limit}`)
    .json<{ status: string; data: unknown[]; count: number }>();
  return parseTransactionResponse(
    NinjaRecentTransactionsSchema,
    { data: envelope?.data ?? [], count: envelope?.count ?? 0 },
    "getNinjaRecentTransactions",
  ) as NinjaRecentTransactions;
}
