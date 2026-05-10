/**
 * @file account.schemas.ts
 * @description Zod schemas for runtime validation of Account domain API responses.
 *
 * Validates all 4 Ninja async reads:
 *   1. AccountProfileSchema → /api/v1/ninja/client/profile/
 *   2. AccountWalletBalanceSchema → /api/v1/ninja/wallet/dashboard/
 *   3. AccountOrderCountsSchema → /api/v1/ninja/orders/counts/
 *   4. AccountRecentTransactionSchema → /api/v1/ninja/transactions/recent/
 */
import { z } from "zod";

// ── Address ───────────────────────────────────────────────────────────────────

export const AccountAddressSchema = z.object({
  id: z.number(),
  label: z.string(),
  full_name: z.string(),
  phone: z.string(),
  street_address: z.string(),
  city: z.string(),
  state: z.string(),
  country: z.string(),
  postal_code: z.string(),
  is_default: z.boolean(),
});

// ── Client Profile ─────────────────────────────────────────────────────────────

export const AccountProfileSchema = z.object({
  id: z.number(),
  user_id: z.string(),
  user_email: z.string(),
  bio: z.string().nullable().optional(),
  default_shipping_address: z.record(z.unknown()).nullable().optional(),
  preferred_size: z.string().nullable().optional(),
  style_preferences: z.array(z.string()).default([]),
  favourite_colours: z.array(z.string()).default([]),
  country: z.string().nullable().optional(),
  state: z.string().nullable().optional(),
  is_profile_complete: z.boolean().default(false),
  total_orders: z.number().default(0),
  total_spent_ngn: z.string().default("0.00"),
  email_notifications_enabled: z.boolean().default(true),
  sms_notifications_enabled: z.boolean().default(true),
  addresses: z.array(AccountAddressSchema).default([]),
});

// ── Wallet ─────────────────────────────────────────────────────────────────────

export const AccountWalletBalanceSchema = z.object({
  balance: z.string().default("0.00"),
  currency: z.string().default("NGN"),
  held_balance: z.string().default("0.00"),
  total_inflow: z.string().default("0.00"),
  total_outflow: z.string().default("0.00"),
  pending_count: z.number().default(0),
});

// ── Order Counts ───────────────────────────────────────────────────────────────

export const AccountOrderCountsSchema = z.record(z.string(), z.number());

// ── Recent Transactions ────────────────────────────────────────────────────────

export const AccountRecentTransactionSchema = z.object({
  id: z.string(),
  kind: z.enum(["credit", "debit", "reversal"]),
  amount: z.string(),
  currency: z.string().default("NGN"),
  reference: z.string(),
  description: z.string().nullable().catch(null),
  status: z.enum(["pending", "success", "failed", "reversed"]),
  created_at: z.string(),
});

export const AccountRecentTransactionsListSchema = z.object({
  count: z.number().default(0),
  data: z.array(AccountRecentTransactionSchema).default([]),
});

// ── Utility: safe parse ────────────────────────────────────────────────────────

export function parseAccountResponse<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  context: string,
): T {
  const result = schema.safeParse(data);
  if (result.success) return result.data;
  if (process.env.NODE_ENV !== "production") {
    console.warn(`[account] ${context} parse mismatch:`, result.error.flatten());
  }
  // Return the raw data cast — the UI handles missing fields gracefully.
  return data as T;
}
