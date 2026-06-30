/**
 * features/support/api/sla.api.ts
 *
 * API client for the SLA monitoring dashboard.
 *
 * Endpoint: GET /api/v1/ninja/support/sla/
 *
 * Auth: Staff/superadmin only (enforced by backend IsAdminUser permission).
 * Client: apiAsync (Ky) — Ninja async endpoint, non-blocking.
 *
 * Response shape:
 *   {
 *     metrics:  SlaMetrics
 *     tickets:  SlaTicketStatus[]
 *     as_of:    string (ISO 8601)
 *   }
 */

import { apiAsync } from "@/core/api/client.async";
import type { SlaStatusEnvelope } from "../types/sla.types";

// ─────────────────────────────────────────────────────────────────────────────
// SLA Dashboard Read
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fetch aggregated SLA status for all active tickets.
 *
 * Used by the admin SLA dashboard to display breach metrics and per-ticket
 * countdown timers. Pure computation — no DB writes, safe to call frequently.
 *
 * @returns SlaStatusEnvelope with metrics + per-ticket statuses
 */
export async function fetchSlaStatus(): Promise<SlaStatusEnvelope> {
  return apiAsync.get("support/sla/").json<SlaStatusEnvelope>();
}

/**
 * Fetch SLA status for a specific ticket.
 *
 * For the ticket detail panel sidebar — shows first-response and
 * resolution countdown inline.
 *
 * @param ticketId UUID of the SupportTicket
 */
export async function fetchTicketSlaStatus(
  ticketId: string
): Promise<SlaStatusEnvelope> {
  return apiAsync
    .get("support/sla/", { searchParams: { ticket_id: ticketId } })
    .json<SlaStatusEnvelope>();
}
