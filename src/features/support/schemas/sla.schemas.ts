/**
 * features/support/schemas/sla.schemas.ts
 *
 * Zod runtime validation for the SLA dashboard API response.
 * Validates: GET /api/v1/ninja/support/sla/
 */

import { z } from "zod";
import { TicketPrioritySchema } from "./support.schemas";

// ── Breach status enum ────────────────────────────────────────────────────────

export const SlaBreachStatusSchema = z.enum([
  "on_track",
  "at_risk",
  "response_breach",
  "resolution_breach",
]);

// ── Per-ticket SLA status ─────────────────────────────────────────────────────

export const SlaTicketStatusSchema = z.object({
  ticket_id:               z.string().uuid(),
  priority:                TicketPrioritySchema,
  breach_status:           SlaBreachStatusSchema,
  response_breach:         z.boolean(),
  resolution_breach:       z.boolean(),
  minutes_to_response:     z.number(),
  minutes_to_resolution:   z.number(),
  elapsed_pct:             z.number().min(0).max(100),
  first_response_deadline: z.string().datetime({ offset: true }),
  resolution_deadline:     z.string().datetime({ offset: true }),
  first_response_at:       z.string().datetime({ offset: true }).nullable(),
});

// ── Aggregated metrics ────────────────────────────────────────────────────────

export const SlaMetricsSchema = z.object({
  total:             z.number().int().min(0),
  on_track:          z.number().int().min(0),
  at_risk:           z.number().int().min(0),
  response_breach:   z.number().int().min(0),
  resolution_breach: z.number().int().min(0),
  breach_rate_pct:   z.number().min(0).max(100),
});

// ── Envelope ──────────────────────────────────────────────────────────────────

export const SlaStatusEnvelopeSchema = z.object({
  metrics:  SlaMetricsSchema,
  tickets:  z.array(SlaTicketStatusSchema),
  as_of:    z.string().datetime({ offset: true }),
});

// ── Type inference ────────────────────────────────────────────────────────────

export type SlaTicketStatusFromSchema = z.infer<typeof SlaTicketStatusSchema>;
export type SlaMetricsFromSchema      = z.infer<typeof SlaMetricsSchema>;
export type SlaStatusEnvelopeFromSchema = z.infer<typeof SlaStatusEnvelopeSchema>;

// ── Safe parse helper ─────────────────────────────────────────────────────────

export function parseSlaEnvelope(raw: unknown) {
  return SlaStatusEnvelopeSchema.safeParse(raw);
}
