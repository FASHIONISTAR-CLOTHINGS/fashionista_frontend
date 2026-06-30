/**
 * features/support/schemas/support.schemas.ts
 *
 * Zod runtime validation schemas for the Support domain.
 * Mirrors: apps/support/serializers/support_serializers.py
 *
 * Usage: parse API responses before they reach component state.
 */

import { z } from "zod";

// ─── Enum schemas ──────────────────────────────────────────────────────────────

export const TicketStatusSchema = z.enum([
  "open",
  "in_review",
  "awaiting_client",
  "awaiting_vendor",
  "resolved",
  "closed",
]);

export const TicketPrioritySchema = z.enum(["low", "medium", "high", "urgent"]);

export const TicketCategorySchema = z.enum([
  "order_dispute",
  "payment_issue",
  "product_complaint",
  "vendor_conduct",
  "delivery_problem",
  "refund_request",
  "measurement_issue",
  "general",
]);

export const EscalationStatusSchema = z.enum([
  "open",
  "under_review",
  "resolved",
  "dismissed",
]);

// ─── Entity schemas ────────────────────────────────────────────────────────────

export const TicketMessageSchema = z.object({
  id:            z.string().uuid(),
  author_name:   z.string(),
  body:          z.string(),
  is_staff_reply: z.boolean(),
  attachments:   z.array(z.string()).default([]),
  created_at:    z.string(),
});

export const TicketEscalationSchema = z.object({
  id:               z.string().uuid(),
  status:           EscalationStatusSchema,
  reason:           z.string(),
  resolution_notes: z.string().default(""),
  resolved_at:      z.string().nullable(),
  created_at:       z.string(),
});

export const SupportTicketSchema = z.object({
  id:               z.string().uuid(),
  submitter_email:  z.string().nullable(),
  assigned_to_name: z.string().nullable(),
  order_id:         z.string().nullable(),
  category:         TicketCategorySchema,
  priority:         TicketPrioritySchema,
  status:           TicketStatusSchema,
  title:            z.string(),
  description:      z.string(),
  metadata:         z.record(z.unknown()).default({}),
  resolution_notes: z.string().default(""),
  resolved_at:      z.string().nullable(),
  closed_at:        z.string().nullable(),
  messages:         z.array(TicketMessageSchema).default([]),
  escalation:       TicketEscalationSchema.nullable(),
  created_at:       z.string(),
  updated_at:       z.string(),
});

export const SupportTicketListItemSchema = z.object({
  id:              z.string().uuid(),
  submitter_email: z.string().nullable(),
  category:        TicketCategorySchema,
  priority:        TicketPrioritySchema,
  status:          TicketStatusSchema,
  title:           z.string(),
  order_id:        z.string().nullable(),
  created_at:      z.string(),
  updated_at:      z.string(),
});

// ─── Envelope schemas ──────────────────────────────────────────────────────────

/** DRF success_response envelope: { status, data } */
export const TicketDetailEnvelopeSchema = z.object({
  status: z.string().optional(),
  data:   SupportTicketSchema,
});

/** DRF list envelope — data is an array */
export const TicketListEnvelopeSchema = z.object({
  status: z.string().optional(),
  data:   z.array(SupportTicketListItemSchema),
});

/** Ninja async feed envelope — { total, tickets } */
export const NinjaTicketFeedSchema = z.object({
  total:   z.number(),
  tickets: z.array(
    z.object({
      id:         z.string(),
      category:   TicketCategorySchema,
      priority:   TicketPrioritySchema,
      status:     TicketStatusSchema,
      title:      z.string(),
      order_id:   z.string().nullable(),
      created_at: z.string(),
    })
  ),
});

// ─── Write input schemas ───────────────────────────────────────────────────────

export const CreateTicketInputSchema = z.object({
  title:       z.string().min(5, "Title must be at least 5 characters."),
  description: z.string().min(10, "Description must be at least 10 characters."),
  category:    TicketCategorySchema.default("general"),
  priority:    TicketPrioritySchema.default("medium"),
  order_id:    z.string().uuid("Invalid order ID format.").optional(),
  metadata:    z.record(z.unknown()).optional(),
});

export const AddMessageInputSchema = z.object({
  body:        z.string().min(2, "Message must be at least 2 characters.").max(5000),
  attachments: z.array(z.string()).max(5).optional(),
});

export type CreateTicketInputSchema = z.infer<typeof CreateTicketInputSchema>;
export type AddMessageInputSchema = z.infer<typeof AddMessageInputSchema>;
