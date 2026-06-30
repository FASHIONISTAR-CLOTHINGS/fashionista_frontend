/**
 * @file kyc.schemas.ts
 * @description Zod schemas for KYC payloads.
 */
import { z } from "zod";

export const KycSubmissionSchema = z.object({
  id: z.string().optional(),
  status: z.enum(["pending", "in_review", "approved", "rejected", "resubmit", "not_started"]),
  is_approved: z.boolean().optional().default(false),
  is_pending: z.boolean().optional().default(false),
  is_rejected: z.boolean().optional().default(false),
  can_resubmit: z.boolean().optional().default(false),
  provider_reference: z.string().optional().default(""),
  review_notes: z.string().optional().default(""),
  submitted_at: z.string().optional().default(""),
  reviewed_at: z.string().nullable().optional().default(null),
  documents: z.array(z.unknown()).optional().default([]),
  created_at: z.string().optional().default(""),
  updated_at: z.string().optional().default(""),
});

export function parseKycResponse<T>(schema: z.ZodType<T>, data: unknown, ctx: string): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    const message = `[Zod/KYC] Schema mismatch in ${ctx}: ${result.error.message}`;
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

/** Validates /ninja/kyc/status/ response */
export const NinjaKycStatusSchema = z.object({
  id: z.string().optional(),
  status: z.enum(["pending", "in_review", "approved", "rejected", "resubmit", "not_started"]),
  is_approved: z.boolean().default(false),
  is_pending: z.boolean().optional(),
  document_count: z.number().int().min(0).default(0),
  submitted_at: z.string().nullable().optional().default(null),
  reviewed_at: z.string().nullable().optional().default(null),
  review_notes: z.string().optional().default(""),
  provider_reference: z.string().optional().default(""),
});

/** Validates /ninja/kyc/documents/ response */
export const KycDocumentSchema = z.object({
  id: z.string(),
  document_type: z.string(),
  secure_url: z.string().optional().default(""),
  public_id: z.string().optional().default(""),
  provider_verified: z.boolean().optional().default(false),
  uploaded_at: z.string().optional().default(""),
});

export const NinjaKycWithDocumentsSchema = z.object({
  id: z.string().optional(),
  status: z.enum(["pending", "in_review", "approved", "rejected", "resubmit", "not_started"]),
  is_approved: z.boolean().default(false),
  review_notes: z.string().optional().default(""),
  provider_reference: z.string().optional().default(""),
  submitted_at: z.string().nullable().optional().default(null),
  reviewed_at: z.string().nullable().optional().default(null),
  documents: z.array(KycDocumentSchema).default([]),
});
