/**
 * @file wallet.schemas.ts
 * @description Zod schemas for wallet API responses.
 */
import { z } from "zod";

export const WalletSchema = z.object({
  id: z.union([z.string(), z.number()]).transform(String),
  owner_type: z.enum(["client", "vendor", "support", "editor", "moderator", "admin", "company"]),
  name: z.string().optional().default("Fashionistar Wallet"),
  account_number: z.string().optional().default(""),
  account_name: z.string().optional().default(""),
  bank_name: z.string().optional().default("Fashionistar Wallet"),
  provider: z.string().optional().default("internal"),
  balance: z.union([z.string(), z.number()]).transform(String),
  available_balance: z.union([z.string(), z.number()]).transform(String),
  pending_balance: z.union([z.string(), z.number()]).optional().transform((value) => String(value ?? "0.00")),
  escrow_balance: z.union([z.string(), z.number()]).optional().transform((value) => String(value ?? "0.00")),
  status: z.enum(["active", "inactive", "frozen", "suspended", "closed"]),
  has_pin: z.boolean().optional().default(false),
  currency: z.union([
    z.string(),
    z.object({
      code: z.string().optional(),
      symbol: z.string().optional(),
    }),
  ]),
});

// ─── Ninja Async Dashboard Schemas ───────────────────────────────────────────

export const WalletBalanceSnapshotSchema = z.object({
  id: z.union([z.string(), z.number()]).transform(String).optional(),
  name: z.string().optional(),
  account_number: z.string().optional().default(""),
  account_name: z.string().optional().default(""),
  bank_name: z.string().optional().default("Fashionistar Wallet"),
  provider: z.string().optional().default("internal"),
  balance: z.union([z.string(), z.number()]).transform(String),
  available_balance: z.union([z.string(), z.number()]).transform(String),
  pending_balance: z.union([z.string(), z.number()]).transform(String),
  escrow_balance: z.union([z.string(), z.number()]).transform(String),
  status: z.enum(["active", "inactive", "frozen", "suspended", "closed"]).default("active"),
  has_pin: z.boolean().default(false),
  currency_code: z.string().default("NGN"),
  currency_symbol: z.string().optional(),
});

export const WalletHoldStatsSchema = z.object({
  active_holds_count: z.number().default(0),
  total_held_amount: z.union([z.string(), z.number()]).transform(String),
});

export const WalletDashboardSchema = WalletBalanceSnapshotSchema.merge(WalletHoldStatsSchema);

export function parseWalletResponse<T>(schema: z.ZodType<T>, data: unknown, ctx: string): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    const message = `[Zod/Wallet] Schema mismatch in ${ctx}: ${result.error.message}`;
    if (process.env.NODE_ENV === "development") {
      console.error(message, result.error.flatten(), data);
      throw new Error(message);
    }
    console.error(message);
    return data as T;
  }
  return result.data;
}

