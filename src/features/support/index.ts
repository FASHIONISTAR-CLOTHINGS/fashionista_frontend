/**
 * features/support/index.ts
 *
 * Public barrel for the `features/support` canonical FSD slice.
 *
 * Import ONLY from 'features/support' — never from deep internal paths.
 */

// ── Types ────────────────────────────────────────────────────────────────────
export type {
  SupportTicket,
  SupportTicketListItem,
  NinjaTicketListItem,
  NinjaTicketFeedEnvelope,
  TicketMessage,
  TicketEscalation,
  CreateTicketInput,
  AddMessageInput,
  UpdateStatusInput,
  EscalateInput,
  TicketStatus,
  TicketPriority,
  TicketCategory,
  EscalationStatus,
  TicketListFilters,
} from "./types/support.types";

export {
  supportKeys,
  TICKET_STATUS_LABELS,
  TICKET_STATUS_COLORS,
  TICKET_PRIORITY_COLORS,
  TICKET_CATEGORY_LABELS,
} from "./types/support.types";

// ── Schemas ──────────────────────────────────────────────────────────────────
export {
  TicketStatusSchema,
  TicketPrioritySchema,
  TicketCategorySchema,
  EscalationStatusSchema,
  SupportTicketSchema,
  SupportTicketListItemSchema,
  CreateTicketInputSchema,
  AddMessageInputSchema,
} from "./schemas/support.schemas";

// ── API Functions ─────────────────────────────────────────────────────────────
export {
  fetchMyTickets,
  fetchTicketDetail,
  createTicket,
  addTicketMessage,
  updateTicketStatus,
  escalateTicket,
  fetchAdminQueue,
} from "./api/support.api";

// ── TanStack Query Hooks ──────────────────────────────────────────────────────
export {
  useMyTickets,
  useTicketDetail,
  useAdminQueue,
  useCreateTicket,
  useAddMessage,
  useUpdateTicketStatus,
  useEscalateTicket,
} from "./hooks/use-support";

// ── SLA Types ────────────────────────────────────────────────────────────────
export type {
  SlaBreachStatus,
  SlaTicketStatus,
  SlaMetrics,
  SlaStatusEnvelope,
} from "./types/sla.types";

export {
  slaKeys,
  SLA_BREACH_LABELS,
  SLA_BREACH_COLORS,
  SLA_BREACH_DOT_COLORS,
  formatMinutesRemaining,
} from "./types/sla.types";

// ── SLA Schemas ──────────────────────────────────────────────────────────────
export {
  SlaBreachStatusSchema,
  SlaTicketStatusSchema,
  SlaMetricsSchema,
  SlaStatusEnvelopeSchema,
  parseSlaEnvelope,
} from "./schemas/sla.schemas";

// ── SLA API ───────────────────────────────────────────────────────────────────
export { fetchSlaStatus, fetchTicketSlaStatus } from "./api/sla.api";

// ── SLA Hooks ─────────────────────────────────────────────────────────────────
export { useSlaStatus, useTicketSla } from "./hooks/use-sla";

// ── UI Components ─────────────────────────────────────────────────────────────
export { SupportWorkspace }    from "./components/SupportWorkspace";
export { SupportTicketList }   from "./components/SupportTicketList";
export { TicketDetailPanel }   from "./components/TicketDetailPanel";
export { NewTicketModal }      from "./components/NewTicketModal";
export { SlaDashboard }        from "./components/SlaDashboard";
