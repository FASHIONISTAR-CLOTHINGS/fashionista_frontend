/**
 * features/support/types/sla.types.ts
 *
 * Canonical TypeScript types for the SLA (Service-Level Agreement) sub-domain.
 *
 * Mirror of: apps/support/services/sla_service.py (Python dataclasses)
 *
 * SLA Matrix (CBN / Fashionistar internal SLA):
 *   Priority  First Response  Resolution
 *   ────────  ─────────────  ──────────
 *   urgent    30 min         4 h
 *   high      2 h            24 h
 *   medium    8 h            72 h
 *   low       24 h           7 days
 *
 * Backend endpoint: GET /api/v1/ninja/support/sla/
 */

import type { TicketPriority } from "./support.types";

// ─────────────────────────────────────────────────────────────────────────────
// BREACH STATUS CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

export type SlaBreachStatus =
  | "on_track"
  | "at_risk"
  | "response_breach"
  | "resolution_breach";

export const SLA_BREACH_LABELS: Record<SlaBreachStatus, string> = {
  on_track:          "On Track",
  at_risk:           "At Risk",
  response_breach:   "Response Breach",
  resolution_breach: "Resolution Breach",
};

export const SLA_BREACH_COLORS: Record<SlaBreachStatus, string> = {
  on_track:          "bg-emerald-100 text-emerald-800 border-emerald-200",
  at_risk:           "bg-amber-100  text-amber-800  border-amber-200",
  response_breach:   "bg-red-100    text-red-800    border-red-200",
  resolution_breach: "bg-red-200    text-red-900    border-red-300 font-semibold",
};

export const SLA_BREACH_DOT_COLORS: Record<SlaBreachStatus, string> = {
  on_track:          "bg-emerald-500",
  at_risk:           "bg-amber-400",
  response_breach:   "bg-red-500",
  resolution_breach: "bg-red-700",
};

// ─────────────────────────────────────────────────────────────────────────────
// PER-TICKET SLA STATUS
// ─────────────────────────────────────────────────────────────────────────────

/** Mirrors Python SLAStatus dataclass from sla_service.py */
export interface SlaTicketStatus {
  ticket_id:              string;
  priority:               TicketPriority;
  breach_status:          SlaBreachStatus;
  response_breach:        boolean;
  resolution_breach:      boolean;
  minutes_to_response:    number;  // negative = overdue
  minutes_to_resolution:  number;  // negative = overdue
  elapsed_pct:            number;  // 0–100
  first_response_deadline: string; // ISO 8601
  resolution_deadline:    string;  // ISO 8601
  first_response_at:      string | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// AGGREGATED SLA METRICS (admin dashboard)
// ─────────────────────────────────────────────────────────────────────────────

/** Mirrors SLAService.compute_metrics() return shape */
export interface SlaMetrics {
  total:             number;
  on_track:          number;
  at_risk:           number;
  response_breach:   number;
  resolution_breach: number;
  breach_rate_pct:   number;
}

// ─────────────────────────────────────────────────────────────────────────────
// API RESPONSE ENVELOPE
// ─────────────────────────────────────────────────────────────────────────────

/** Shape returned by GET /api/v1/ninja/support/sla/ */
export interface SlaStatusEnvelope {
  metrics:  SlaMetrics;
  tickets:  SlaTicketStatus[];
  as_of:    string;  // ISO 8601 timestamp of computation
}

// ─────────────────────────────────────────────────────────────────────────────
// QUERY KEY FACTORY
// ─────────────────────────────────────────────────────────────────────────────

export const slaKeys = {
  all:     () => ["sla"] as const,
  status:  () => [...slaKeys.all(), "status"] as const,
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// DISPLAY HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Format a "minutes remaining" value into a human-readable countdown.
 * Negative values indicate the SLA is overdue.
 */
export function formatMinutesRemaining(minutes: number): {
  label: string;
  overdue: boolean;
} {
  const overdue = minutes < 0;
  const abs = Math.abs(minutes);

  if (abs < 60) {
    return { label: `${Math.round(abs)}m`, overdue };
  }
  if (abs < 1440) {
    const h = Math.floor(abs / 60);
    const m = Math.round(abs % 60);
    return { label: m > 0 ? `${h}h ${m}m` : `${h}h`, overdue };
  }
  const d = Math.floor(abs / 1440);
  const h = Math.floor((abs % 1440) / 60);
  return { label: h > 0 ? `${d}d ${h}h` : `${d}d`, overdue };
}
