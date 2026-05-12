/**
 * features/support/hooks/use-sla.ts
 *
 * TanStack Query v5 hooks for SLA monitoring.
 *
 * Hooks:
 *   - useSlaStatus:     Aggregated SLA dashboard (metrics + all tickets) — 30s refetch
 *   - useTicketSla:     Single-ticket SLA inline status — for detail panel sidebar
 */

"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchSlaStatus, fetchTicketSlaStatus } from "../api/sla.api";
import { slaKeys } from "../types/sla.types";
import type { SlaStatusEnvelope } from "../types/sla.types";

// ─────────────────────────────────────────────────────────────────────────────
// Admin SLA Dashboard Query
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Aggregated SLA health across all active tickets.
 *
 * Auto-refreshes every 30s to keep the admin dashboard live.
 * Only usable by staff/admin — backend returns 403 for non-staff.
 *
 * @example
 *   const { data, isLoading } = useSlaStatus();
 *   // data.metrics.breach_rate_pct → 4.2
 *   // data.tickets[0].breach_status → "response_breach"
 */
export function useSlaStatus() {
  return useQuery<SlaStatusEnvelope, Error>({
    queryKey:       slaKeys.status(),
    queryFn:        fetchSlaStatus,
    staleTime:      30_000,
    refetchInterval: 30_000, // Keep SLA breach data live
    retry:          2,
  });
}

/**
 * SLA status for a single ticket (used in ticket detail sidebar).
 *
 * @param ticketId UUID of the SupportTicket — pass null to disable
 */
export function useTicketSla(ticketId: string | null) {
  return useQuery<SlaStatusEnvelope, Error>({
    queryKey:  [...slaKeys.status(), ticketId],
    queryFn:   () => fetchTicketSlaStatus(ticketId!),
    enabled:   !!ticketId,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}
