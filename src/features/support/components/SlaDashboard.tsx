/**
 * features/support/components/SlaDashboard.tsx
 *
 * Admin SLA Breach Monitoring Dashboard.
 *
 * Displays real-time SLA health across all active support tickets:
 *   - Aggregate metrics bar (total, on_track, at_risk, breach counts)
 *   - Per-ticket SLA status table with countdown timers
 *   - Auto-refreshes every 30 seconds (via useSlaStatus hook)
 *
 * Routing: /admin-dashboard/support/sla
 * Auth: IsAdminUser (enforced backend-side; frontend guarded by layout)
 */

"use client";

import React from "react";
import { AlertTriangle, CheckCircle2, Clock, RefreshCw, ShieldAlert } from "lucide-react";
import { useSlaStatus } from "../hooks/use-sla";
import {
  SLA_BREACH_COLORS,
  SLA_BREACH_LABELS,
  SLA_BREACH_DOT_COLORS,
  formatMinutesRemaining,
} from "../types/sla.types";
import {
  TICKET_PRIORITY_COLORS,
} from "../types/support.types";
import type { SlaBreachStatus, SlaTicketStatus } from "../types/sla.types";

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

function MetricCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <div className={`rounded-2xl border p-5 ${color} flex items-start gap-4 shadow-sm`}>
      <div className="rounded-xl bg-white/60 p-2.5 backdrop-blur-sm">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-sm font-medium opacity-80">{label}</p>
        <p className="text-3xl font-bold tracking-tight">{value}</p>
      </div>
    </div>
  );
}

function CountdownCell({ minutes, overdue }: { minutes: number; overdue: boolean }) {
  const { label } = formatMinutesRemaining(minutes);
  return (
    <span
      className={`inline-flex items-center gap-1 text-sm font-mono font-medium ${
        overdue ? "text-red-700" : "text-slate-700"
      }`}
    >
      {overdue ? (
        <AlertTriangle className="h-3.5 w-3.5 text-red-500 shrink-0" />
      ) : (
        <Clock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
      )}
      {overdue ? `-${label}` : label}
    </span>
  );
}

function BreachBadge({ status }: { status: SlaBreachStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${SLA_BREACH_COLORS[status]}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${SLA_BREACH_DOT_COLORS[status]}`} />
      {SLA_BREACH_LABELS[status]}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SLA Ticket Table Row
// ─────────────────────────────────────────────────────────────────────────────

function SlaTicketRow({ ticket }: { ticket: SlaTicketStatus }) {
  const responseMinutes = ticket.minutes_to_response;
  const resolutionMinutes = ticket.minutes_to_resolution;

  return (
    <tr className="border-b border-slate-100 hover:bg-slate-50/60 transition-colors">
      {/* Ticket ID */}
      <td className="px-4 py-3">
        <span className="font-mono text-xs text-slate-500">
          {ticket.ticket_id.slice(0, 8)}…
        </span>
      </td>

      {/* Priority */}
      <td className="px-4 py-3">
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${TICKET_PRIORITY_COLORS[ticket.priority]}`}
        >
          {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
        </span>
      </td>

      {/* Breach Status */}
      <td className="px-4 py-3">
        <BreachBadge status={ticket.breach_status} />
      </td>

      {/* Response Countdown */}
      <td className="px-4 py-3">
        {ticket.first_response_at ? (
          <span className="flex items-center gap-1 text-xs text-emerald-700">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Responded
          </span>
        ) : (
          <CountdownCell
            minutes={responseMinutes}
            overdue={ticket.response_breach}
          />
        )}
      </td>

      {/* Resolution Countdown */}
      <td className="px-4 py-3">
        <CountdownCell
          minutes={resolutionMinutes}
          overdue={ticket.resolution_breach}
        />
      </td>

      {/* Elapsed % */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-20 overflow-hidden rounded-full bg-slate-200">
            <div
              className={`h-full rounded-full transition-all ${
                ticket.elapsed_pct >= 100
                  ? "bg-red-600"
                  : ticket.elapsed_pct >= 80
                  ? "bg-amber-400"
                  : "bg-emerald-500"
              }`}
              style={{ width: `${Math.min(ticket.elapsed_pct, 100)}%` }}
            />
          </div>
          <span className="text-xs text-slate-500">{ticket.elapsed_pct}%</span>
        </div>
      </td>
    </tr>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Dashboard Component
// ─────────────────────────────────────────────────────────────────────────────

export function SlaDashboard() {
  const { data, isLoading, isError, dataUpdatedAt, refetch, isFetching } =
    useSlaStatus();

  // Sort: most severe first
  const sortedTickets = React.useMemo(() => {
    if (!data?.tickets) return [];
    const severityOrder: Record<SlaBreachStatus, number> = {
      resolution_breach: 0,
      response_breach:   1,
      at_risk:           2,
      on_track:          3,
    };
    return [...data.tickets].sort(
      (a, b) =>
        severityOrder[a.breach_status] - severityOrder[b.breach_status]
    );
  }, [data?.tickets]);

  const lastUpdated = dataUpdatedAt
    ? new Date(dataUpdatedAt).toLocaleTimeString()
    : "—";

  // ── Loading skeleton ────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-slate-200" />
          ))}
        </div>
        <div className="h-64 rounded-2xl bg-slate-200" />
      </div>
    );
  }

  // ── Error state ─────────────────────────────────────────────────────────────
  if (isError || !data) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-red-200 bg-red-50 p-12 text-center">
        <ShieldAlert className="h-12 w-12 text-red-400" />
        <div>
          <p className="font-semibold text-red-800">SLA data unavailable</p>
          <p className="mt-1 text-sm text-red-600">
            Could not load SLA status. Check your permissions or backend connectivity.
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  const { metrics } = data;
  const totalBreaches = metrics.response_breach + metrics.resolution_breach;

  return (
    <div className="space-y-6">
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            SLA Monitoring
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Real-time SLA health across all active support tickets
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400">Updated {lastUpdated}</span>
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50 transition-colors"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
        </div>
      </div>

      {/* ── Global breach alert banner ───────────────────────────────────────── */}
      {totalBreaches > 0 && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-5 py-3.5">
          <AlertTriangle className="h-5 w-5 shrink-0 text-red-600" />
          <p className="text-sm font-medium text-red-800">
            <span className="font-bold">{totalBreaches}</span>{" "}
            {totalBreaches === 1 ? "ticket has" : "tickets have"} breached SLA
            commitments — immediate action required.
          </p>
        </div>
      )}

      {/* ── Metric cards ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
        <MetricCard
          label="Total Active"
          value={metrics.total}
          icon={CheckCircle2}
          color="bg-slate-100 text-slate-800 border-slate-200"
        />
        <MetricCard
          label="On Track"
          value={metrics.on_track}
          icon={CheckCircle2}
          color="bg-emerald-50 text-emerald-900 border-emerald-200"
        />
        <MetricCard
          label="At Risk"
          value={metrics.at_risk}
          icon={Clock}
          color="bg-amber-50 text-amber-900 border-amber-200"
        />
        <MetricCard
          label="Response Breach"
          value={metrics.response_breach}
          icon={AlertTriangle}
          color="bg-red-50 text-red-900 border-red-200"
        />
        <MetricCard
          label="Resolution Breach"
          value={metrics.resolution_breach}
          icon={ShieldAlert}
          color="bg-red-100 text-red-950 border-red-300"
        />
      </div>

      {/* ── Breach rate bar ──────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-medium text-slate-700">
            Overall SLA Breach Rate
          </span>
          <span
            className={`text-sm font-bold ${
              metrics.breach_rate_pct > 10
                ? "text-red-600"
                : metrics.breach_rate_pct > 5
                ? "text-amber-600"
                : "text-emerald-600"
            }`}
          >
            {metrics.breach_rate_pct}%
          </span>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              metrics.breach_rate_pct > 10
                ? "bg-red-500"
                : metrics.breach_rate_pct > 5
                ? "bg-amber-400"
                : "bg-emerald-500"
            }`}
            style={{ width: `${Math.min(metrics.breach_rate_pct, 100)}%` }}
          />
        </div>
        <p className="mt-1.5 text-xs text-slate-400">
          Target: &lt;5% breach rate per CBN SLA commitment
        </p>
      </div>

      {/* ── Per-ticket table ─────────────────────────────────────────────────── */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-4">
          <h3 className="text-base font-semibold text-slate-900">
            Active Tickets — SLA Status
          </h3>
          <p className="mt-0.5 text-xs text-slate-400">
            Sorted by severity · Auto-refreshes every 30 seconds
          </p>
        </div>

        {sortedTickets.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-16 text-center text-slate-400">
            <CheckCircle2 className="h-10 w-10 text-emerald-300" />
            <p className="text-sm font-medium">No active tickets</p>
            <p className="text-xs">All tickets are resolved or closed.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Ticket
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Priority
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Response Due
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Resolution Due
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Elapsed
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedTickets.map((ticket) => (
                  <SlaTicketRow key={ticket.ticket_id} ticket={ticket} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
