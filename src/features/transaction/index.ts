/**
 * @file index.ts
 * @description Public API for the `features/transaction` canonical FSD slice.
 *
 * Dual-Engine Strategy:
 *  - DRF (sync)   → /v1/transactions/ (paginated list + summary)
 *  - Ninja (async) → /ninja/transactions/ (dashboard, summary, recent)
 */

// ── Types ──────────────────────────────────────────────────────────────────
export type {
  TransactionRecord,
  TransactionSummary,
  TransactionDashboard,
  NinjaRecentTransactions,
  PaginatedTransactions,
  TransactionAudience,
  TransactionStatus,
  TransactionDirection,
  TransactionStatusBreakdown,
} from "./types/transaction.types";

// ── Schemas ────────────────────────────────────────────────────────────────
export {
  TransactionRecordSchema,
  TransactionSummarySchema,
  TransactionDashboardSchema,
  NinjaRecentTransactionsSchema,
  PaginatedTransactionsSchema,
  parseTransactionResponse,
} from "./schemas/transaction.schemas";

// ── API — DRF Sync + Ninja Async ───────────────────────────────────────────
export {
  fetchTransactions,
  fetchTransactionSummary,
  getNinjaTransactionDashboard,
  getNinjaTransactionSummary,
  getNinjaRecentTransactions,
} from "./api/transaction.api";

// ── TanStack Query Hooks ───────────────────────────────────────────────────
export {
  transactionKeys,
  useTransactions,
  useTransactionSummary,
  useNinjaTransactionDashboard,
  useNinjaTransactionSummary,
  useNinjaRecentTransactions,
} from "./hooks/use-transactions";

// ── Components ─────────────────────────────────────────────────────────────
export * from "./components/TransactionTable";
export * from "./components/TransactionViews";
export * from "./components/ClientTransactionsView";
export * from "./components/VendorTransactionsView";
export * from "./components/AdminTransactionsView";
