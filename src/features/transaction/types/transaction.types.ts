/**
 * @file transaction.types.ts
 * @description TypeScript contracts for the financial transaction feature.
 */

export type TransactionAudience = "client" | "vendor" | "admin";

export type TransactionStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed"
  | "cancelled"
  | "reversed"
  | "disputed";

export type TransactionDirection = "inbound" | "outbound" | "internal";

export interface TransactionRecord {
  id: string;
  reference: string;
  transaction_type: string;
  status: TransactionStatus;
  direction: TransactionDirection;
  amount: string;
  fee_amount: string;
  net_amount: string;
  description: string;
  order_id: string;
  created_at: string;
}

export interface TransactionSummary {
  inflow: string;
  outflow: string;
  net: string;
  count: number;
}

export interface PaginatedTransactions {
  count: number;
  next: string | null;
  previous: string | null;
  results: TransactionRecord[];
}

// ── Ninja Async Dashboard Types ───────────────────────────────────────────────

/** Status → count map from Ninja /transactions/dashboard/ */
export type TransactionStatusBreakdown = Partial<Record<TransactionStatus, number>>;

/**
 * Full dashboard response from GET /api/v1/ninja/transactions/dashboard/
 * Combines inflow/outflow aggregate + status breakdown + 5 recent transactions.
 */
export interface TransactionDashboard extends TransactionSummary {
  status_breakdown: TransactionStatusBreakdown;
  recent_transactions: TransactionRecord[];
}

/**
 * Response envelope for Ninja async recent transactions list.
 * GET /api/v1/ninja/transactions/recent/
 */
export interface NinjaRecentTransactions {
  data: TransactionRecord[];
  count: number;
}

