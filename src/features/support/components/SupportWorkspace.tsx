/**
 * features/support/components/SupportWorkspace.tsx
 *
 * Enterprise orchestrator for the client support workspace.
 *
 * Architecture:
 *   - Reads: useMyTickets (Ninja async) + useTicketDetail (Ninja async)
 *   - Writes: useCreateTicket + useAddMessage (DRF sync)
 *   - Renders: ticket rail (left) + detail/thread panel (right) + NewTicketModal
 *   - Full loading/error/empty states — zero unhandled suspense boundaries
 *
 * URL sync: active ticket tracked in local state (not URL — avoids hydration).
 */

"use client";

import { useCallback, useMemo, useState } from "react";
import { LifeBuoy, Plus, RefreshCw } from "lucide-react";

import {
  TICKET_CATEGORY_LABELS,
  TICKET_PRIORITY_COLORS,
  TICKET_STATUS_COLORS,
  TICKET_STATUS_LABELS,
  type SupportTicketListItem,
} from "../types/support.types";
import { useMyTickets, useTicketDetail, useCreateTicket, useAddMessage } from "../hooks/use-support";
import { NewTicketModal } from "./NewTicketModal";
import { TicketDetailPanel } from "./TicketDetailPanel";

// ─── Sub-component: Ticket Rail ───────────────────────────────────────────────

interface TicketRailProps {
  tickets: SupportTicketListItem[];
  activeId: string | null;
  isLoading: boolean;
  isError: boolean;
  onSelect: (id: string) => void;
  onRefresh: () => void;
}

function TicketRail({ tickets, activeId, isLoading, isError, onSelect, onRefresh }: TicketRailProps) {
  if (isError) {
    return (
      <aside className="flex min-h-[26rem] flex-col items-center justify-center gap-3 rounded-xl border border-red-200 bg-red-50 p-8 text-center">
        <LifeBuoy className="h-8 w-8 text-red-400" />
        <p className="text-sm font-medium text-red-700">Failed to load tickets.</p>
        <button
          type="button"
          onClick={onRefresh}
          className="mt-1 flex items-center gap-1 rounded-full border border-red-300 px-3 py-1 text-xs font-medium text-red-700 transition hover:bg-red-100"
        >
          <RefreshCw className="h-3 w-3" /> Retry
        </button>
      </aside>
    );
  }

  if (isLoading) {
    return (
      <aside className="flex min-h-[26rem] flex-col gap-3 rounded-xl border border-black/10 bg-white p-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-16 animate-pulse rounded-lg bg-black/5" />
        ))}
      </aside>
    );
  }

  return (
    <aside className="flex min-h-[26rem] flex-col overflow-hidden rounded-xl border border-black/10 bg-white shadow-sm">
      <div className="border-b border-black/8 px-4 py-3">
        <p className="text-[13px] font-semibold text-[#141414]">
          {tickets.length} {tickets.length === 1 ? "ticket" : "tickets"}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto">
        {tickets.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 px-6 py-12 text-center">
            <LifeBuoy className="h-9 w-9 text-[#01454A]/40" />
            <p className="text-sm text-black/50">No tickets yet.</p>
            <p className="text-xs text-black/35">Open a ticket for help.</p>
          </div>
        ) : (
          tickets.map((ticket) => {
            const isActive = ticket.id === activeId;
            return (
              <button
                key={ticket.id}
                type="button"
                onClick={() => onSelect(ticket.id)}
                aria-pressed={isActive}
                className={[
                  "flex w-full flex-col gap-2 border-b border-black/5 px-4 py-3 text-left transition-colors",
                  isActive
                    ? "bg-[#01454A]/8 ring-l-2 ring-[#01454A]"
                    : "hover:bg-black/[0.02]",
                ].join(" ")}
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="truncate text-[13px] font-semibold text-[#141414]">
                    {ticket.title}
                  </p>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${TICKET_PRIORITY_COLORS[ticket.priority]}`}
                  >
                    {ticket.priority}
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${TICKET_STATUS_COLORS[ticket.status]}`}
                  >
                    {TICKET_STATUS_LABELS[ticket.status]}
                  </span>
                  <span className="text-[11px] text-black/45">
                    {TICKET_CATEGORY_LABELS[ticket.category]}
                  </span>
                </div>
              </button>
            );
          })
        )}
      </div>
    </aside>
  );
}

// ─── Main Workspace Component ─────────────────────────────────────────────────

export function SupportWorkspace() {
  const [activeTicketId, setActiveTicketId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Queries
  const ticketsQuery = useMyTickets();
  const tickets = useMemo(() => ticketsQuery.data ?? [], [ticketsQuery.data]);

  // Auto-select first ticket
  const selectedId = activeTicketId ?? tickets[0]?.id ?? null;

  const ticketDetailQuery = useTicketDetail(selectedId);

  // Mutations
  const createMutation  = useCreateTicket();
  const addMsgMutation  = useAddMessage(selectedId ?? "");

  const handleSelectTicket = useCallback((id: string) => {
    setActiveTicketId(id);
  }, []);

  const handleSendMessage = useCallback(
    async (body: string) => {
      if (!selectedId) return;
      await addMsgMutation.mutateAsync({ body });
    },
    [selectedId, addMsgMutation]
  );

  return (
    <main className="space-y-6 px-4 py-6 md:px-6">
      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#141414]">Support</h1>
          <p className="mt-1 text-sm text-black/55">
            Track disputes, payment issues, delivery problems, and general inquiries.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 rounded-full bg-[#FDA600] px-4 py-2 text-sm font-semibold text-[#141414] shadow-sm transition hover:brightness-95 active:scale-[0.98]"
        >
          <Plus className="h-4 w-4" />
          New ticket
        </button>
      </div>

      {/* ── Awaiting Response Banner ────────────────────────────────── */}
      {ticketDetailQuery.data?.status === "awaiting_client" && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <RefreshCw className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
          <p>
            <strong>Staff is waiting for your reply</strong> on{" "}
            <span className="font-medium">&ldquo;{ticketDetailQuery.data.title}&rdquo;</span>.
            Reply in the thread below to continue.
          </p>
        </div>
      )}

      {/* ── Resolved Banner ─────────────────────────────────────────── */}
      {ticketDetailQuery.data?.status === "resolved" && (
        <div className="flex items-start gap-3 rounded-xl border border-green-300 bg-green-50 px-4 py-3 text-sm text-green-900">
          <LifeBuoy className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
          <p>
            <strong>Ticket resolved.</strong>{" "}
            {ticketDetailQuery.data.resolution_notes
              ? `Notes: ${ticketDetailQuery.data.resolution_notes}`
              : "This ticket has been marked as resolved by our team."}
          </p>
        </div>
      )}

      {/* ── Two-panel Layout ─────────────────────────────────────────── */}
      <div className="grid gap-4 lg:grid-cols-[22rem,minmax(0,1fr)]">
        <TicketRail
          tickets={tickets}
          activeId={selectedId}
          isLoading={ticketsQuery.isLoading}
          isError={ticketsQuery.isError}
          onSelect={handleSelectTicket}
          onRefresh={() => ticketsQuery.refetch()}
        />
        <TicketDetailPanel
          ticket={ticketDetailQuery.data ?? null}
          isLoading={ticketDetailQuery.isLoading && !!selectedId}
          isSending={addMsgMutation.isPending}
          onSendMessage={selectedId ? handleSendMessage : undefined}
        />
      </div>

      {/* ── New Ticket Modal ─────────────────────────────────────────── */}
      <NewTicketModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        isSubmitting={createMutation.isPending}
        onSubmit={async (payload) => {
          const ticket = await createMutation.mutateAsync(payload);
          setActiveTicketId(ticket.id);
          setIsModalOpen(false);
        }}
      />
    </main>
  );
}
