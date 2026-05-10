/**
 * features/payment/schemas/payout.schemas.ts
 *
 * Zod runtime validation for vendor payout API responses.
 */

import { z } from "zod";

// ── Payout status ─────────────────────────────────────────────────────────────

export const PayoutStatusSchema = z.enum([
  "pending",
  "processing",
  "success",
  "failed",
  "reversed",
]);

// ── Single payout record ──────────────────────────────────────────────────────

export const VendorPayoutSchema = z.object({
  id:             z.string().uuid(),
  reference:      z.string(),
  transfer_code:  z.string(),
  provider:       z.string(),
  amount:         z.string(),
  currency:       z.string().default("NGN"),
  status:         PayoutStatusSchema,
  recipient_code: z.string(),
  bank_name:      z.string(),
  account_number: z.string(),
  initiated_at:   z.string().datetime({ offset: true }),
  completed_at:   z.string().datetime({ offset: true }).nullable(),
  metadata:       z.record(z.unknown()).default({}),
});

// ── Payout list envelope ──────────────────────────────────────────────────────

export const VendorPayoutListEnvelopeSchema = z.object({
  total:   z.number().int().min(0),
  payouts: z.array(VendorPayoutSchema),
});

// ── Initiation response ───────────────────────────────────────────────────────

export const PayoutInitiateResponseSchema = z.object({
  reference:     z.string(),
  transfer_code: z.string(),
  status:        PayoutStatusSchema,
  message:       z.string().optional(),
});

// ── Type inference ────────────────────────────────────────────────────────────

export type VendorPayoutFromSchema           = z.infer<typeof VendorPayoutSchema>;
export type VendorPayoutListEnvelopeFromSchema = z.infer<typeof VendorPayoutListEnvelopeSchema>;
export type PayoutInitiateResponseFromSchema  = z.infer<typeof PayoutInitiateResponseSchema>;

// ── Safe parse helpers ────────────────────────────────────────────────────────

export function parsePayoutHistory(raw: unknown) {
  return VendorPayoutListEnvelopeSchema.safeParse(raw);
}

export function parsePayoutInitiateResponse(raw: unknown) {
  return PayoutInitiateResponseSchema.safeParse(raw);
}
