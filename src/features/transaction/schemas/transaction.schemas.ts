/**
 * @file transaction.schemas.ts
 * @description Zod validation schemas for transaction reads.
 */
import { z } from "zod";

export const TransactionRecordSchema = z.object({
  id: z.union([z.string(), z.number()]).transform(String),
  reference: z.string().optional().default(""),
  transaction_type: z.string().optional().default("transfer"),
  status: z.enum([
    "pending",
    "processing",
    "completed",
    "failed",
    "cancelled",
    "reversed",
    "disputed",
  ]).optional().default("pending"),
  direction: z.enum(["inbound", "outbound", "internal"]).optional().default("internal"),
  amount: z.union([z.string(), z.number()]).transform(String),
  fee_amount: z.union([z.string(), z.number()]).optional().transform((value) => String(value ?? "0.00")),
  net_amount: z.union([z.string(), z.number()]).optional().transform((value) => String(value ?? "0.00")),
  description: z.string().optional().default(""),
  order_id: z.string().optional().default(""),
  created_at: z.string().optional().default(""),
});

export const TransactionSummarySchema = z.object({
  inflow: z.union([z.string(), z.number()]).optional().transform((value) => String(value ?? "0.00")),
  outflow: z.union([z.string(), z.number()]).optional().transform((value) => String(value ?? "0.00")),
  net: z.union([z.string(), z.number()]).optional().transform((value) => String(value ?? "0.00")),
  count: z.number().int().min(0).optional().default(0),
});

export const PaginatedTransactionsSchema = z.object({
  count: z.number().int().min(0),
  next: z.string().nullable(),
  previous: z.string().nullable(),
  results: z.array(TransactionRecordSchema),
});

export function parseTransactionResponse<T>(
  schema: z.ZodType<T>,
  data: unknown,
  ctx: string,
): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    const message = `[Zod/Transaction] Schema mismatch in ${ctx}: ${result.error.message}`;
    if (process.env.NODE_ENV === "development") {
      console.error(message, result.error.flatten(), data);
      throw new Error(message);
    }
    console.error(message);
    return data as T;
  }
  return result.data;
}

// ── Ninja Async Dashboard Schemas ─────────────────────────────────────────────

/** Validates full dashboard response from GET /ninja/transactions/dashboard/ */
export const TransactionDashboardSchema = z.object({
  inflow: z.union([z.string(), z.number()]).transform(String),
  outflow: z.union([z.string(), z.number()]).transform(String),
  net: z.union([z.string(), z.number()]).transform(String),
  count: z.number().int().min(0).default(0),
  status_breakdown: z.record(z.string(), z.number()).default({}),
  recent_transactions: z.array(TransactionRecordSchema).default([]),
});

/** Validates response from GET /ninja/transactions/recent/ */
export const NinjaRecentTransactionsSchema = z.object({
  data: z.array(TransactionRecordSchema).default([]),
  count: z.number().int().min(0).default(0),
});

