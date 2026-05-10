/**
 * features/support/api/support.api.ts
 *
 * REST API client for the Support domain.
 *
 * Endpoint routing (Dual-Engine):
 *   Reads  → apiAsync (Ky) → /api/v1/ninja/support/tickets/
 *   Writes → apiSync (Axios) → /v1/support/tickets/
 *
 * Route inventory:
 *   GET    /ninja/support/tickets/               → fetchMyTickets      (Ninja feed)
 *   GET    /ninja/support/tickets/<id>/          → fetchTicketDetail   (Ninja detail)
 *   GET    /ninja/support/admin/queue/           → fetchAdminQueue     (Ninja staff)
 *   POST   /v1/support/tickets/                  → createTicket        (DRF sync)
 *   POST   /v1/support/tickets/<id>/messages/    → addTicketMessage    (DRF sync)
 *   PATCH  /v1/support/tickets/<id>/status/      → updateTicketStatus  (DRF sync staff)
 *   POST   /v1/support/tickets/<id>/escalate/    → escalateTicket      (DRF sync staff)
 */

import { apiSync } from "@/core/api/client.sync";
import { apiAsync } from "@/core/api/client.async";
import type {
  SupportTicket,
  SupportTicketListItem,
  NinjaTicketFeedEnvelope,
  NinjaTicketListItem,
  TicketMessage,
  TicketEscalation,
  CreateTicketInput,
  AddMessageInput,
  UpdateStatusInput,
  EscalateInput,
  TicketListFilters,
} from "../types/support.types";

const DRF_BASE = "v1/support";

// ─── Helper: normalise DRF success_response envelope ─────────────────────────

function unwrapDrf<T>(raw: { status?: string; data?: T } & T): T {
  return (raw as { data?: T }).data ?? (raw as T);
}

// ─────────────────────────────────────────────────────────────────────────────
// READS — Ninja Async (GET requests only)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /api/v1/ninja/support/tickets/
 *
 * Returns the authenticated user's ticket feed via Ninja async router.
 * Ninja response shape: { total: number; tickets: NinjaTicketListItem[] }
 * We map these to SupportTicketListItem for UI consumption.
 */
export async function fetchMyTickets(
  filters?: TicketListFilters
): Promise<SupportTicketListItem[]> {
  const raw = await apiAsync
    .get("support/tickets/", { searchParams: filters as Record<string, string> })
    .json<NinjaTicketFeedEnvelope>();
  // Ninja returns NinjaTicketListItem; map to SupportTicketListItem (superset)
  return (raw.tickets ?? []).map((t: NinjaTicketListItem) => ({
    id:              t.id,
    submitter_email: null,         // Not present in Ninja feed (by design)
    category:        t.category,
    priority:        t.priority,
    status:          t.status,
    title:           t.title,
    order_id:        t.order_id,
    created_at:      t.created_at,
    updated_at:      t.created_at, // Ninja feed doesn't include updated_at
  }));
}

/**
 * GET /api/v1/ninja/support/tickets/<ticketId>/
 *
 * Returns full ticket detail (messages thread included) via Ninja.
 */
export async function fetchTicketDetail(ticketId: string): Promise<SupportTicket> {
  const raw = await apiAsync
    .get(`support/tickets/${ticketId}/`)
    .json<SupportTicket>();
  return raw;
}

/**
 * GET /api/v1/ninja/support/admin/queue/
 *
 * Staff-only async admin ticket queue. Returns Ninja feed envelope.
 */
export async function fetchAdminQueue(
  filters?: TicketListFilters
): Promise<SupportTicketListItem[]> {
  const raw = await apiAsync
    .get("support/admin/queue/", {
      searchParams: filters as Record<string, string>,
    })
    .json<NinjaTicketFeedEnvelope>();
  return (raw.tickets ?? []).map((t: NinjaTicketListItem) => ({
    id:              t.id,
    submitter_email: null,
    category:        t.category,
    priority:        t.priority,
    status:          t.status,
    title:           t.title,
    order_id:        t.order_id,
    created_at:      t.created_at,
    updated_at:      t.created_at,
  }));
}

// ─────────────────────────────────────────────────────────────────────────────
// WRITES — DRF Sync (mutations via Axios)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * POST /v1/support/tickets/
 *
 * Open a new support ticket. Idempotent per order_id (backend-enforced).
 */
export async function createTicket(input: CreateTicketInput): Promise<SupportTicket> {
  const raw = await apiSync.post<{ status?: string; data?: SupportTicket } & SupportTicket>(
    `${DRF_BASE}/tickets/`,
    input
  );
  return unwrapDrf(raw.data as { status?: string; data?: SupportTicket } & SupportTicket);
}

/**
 * POST /v1/support/tickets/<ticketId>/messages/
 *
 * Append a threaded reply. is_staff resolved server-side from request.user.
 */
export async function addTicketMessage(
  ticketId: string,
  input: AddMessageInput
): Promise<TicketMessage> {
  const raw = await apiSync.post<{ status?: string; data?: TicketMessage } & TicketMessage>(
    `${DRF_BASE}/tickets/${ticketId}/messages/`,
    input
  );
  return unwrapDrf(raw.data as { status?: string; data?: TicketMessage } & TicketMessage);
}

// ─── Staff mutations ──────────────────────────────────────────────────────────

/**
 * PATCH /v1/support/tickets/<ticketId>/status/
 *
 * Staff-only: atomic status transition with optional resolution notes.
 */
export async function updateTicketStatus(
  ticketId: string,
  input: UpdateStatusInput
): Promise<SupportTicket> {
  const raw = await apiSync.patch<{ status?: string; data?: SupportTicket } & SupportTicket>(
    `${DRF_BASE}/tickets/${ticketId}/status/`,
    input
  );
  return unwrapDrf(raw.data as { status?: string; data?: SupportTicket } & SupportTicket);
}

/**
 * POST /v1/support/tickets/<ticketId>/escalate/
 *
 * Staff-only: create or return a TicketEscalation (idempotent).
 */
export async function escalateTicket(
  ticketId: string,
  input: EscalateInput
): Promise<TicketEscalation> {
  const raw = await apiSync.post<{ status?: string; data?: TicketEscalation } & TicketEscalation>(
    `${DRF_BASE}/tickets/${ticketId}/escalate/`,
    input
  );
  return unwrapDrf(raw.data as { status?: string; data?: TicketEscalation } & TicketEscalation);
}
