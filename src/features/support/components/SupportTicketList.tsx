/**
 * Ticket rail for the support workspace.
 */

"use client";

import { LifeBuoy } from "lucide-react";

import {
  TICKET_PRIORITY_COLORS,
  TICKET_STATUS_COLORS,
  TICKET_STATUS_LABELS,
  type SupportTicketListItem,
} from "../types/support.types";

export interface SupportTicketListProps {
  tickets: SupportTicketListItem[];
  activeTicketId: string | null;
  onSelectTicket: (ticketId: string) => void;
}

export function SupportTicketList({
  tickets,
  activeTicketId,
  onSelectTicket,
}: SupportTicketListProps) {
  return (
    <aside className="flex h-full min-h-[28rem] flex-col border border-black/10 bg-white">
      <div className="border-b border-black/10 px-4 py-3">
        <h2 className="text-sm font-semibold text-[#141414]">Support tickets</h2>
      </div>

      <div className="flex-1 overflow-y-auto">
        {tickets.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 px-6 py-10 text-center text-sm text-black/55">
            <LifeBuoy className="h-8 w-8 text-[#01454A]" />
            <p>No tickets yet.</p>
          </div>
        ) : (
          tickets.map((ticket) => {
            const isActive = ticket.id === activeTicketId;

            return (
              <button
                key={ticket.id}
                type="button"
                onClick={() => onSelectTicket(ticket.id)}
                className={[
                  "flex w-full flex-col gap-2 border-b border-black/5 px-4 py-3 text-left transition",
                  isActive ? "bg-[#F4F3EC]" : "hover:bg-black/[0.02]",
                ].join(" ")}
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="truncate text-sm font-semibold text-[#141414]">
                    {ticket.title}
                  </p>
                  <span className={`rounded-full px-2 py-1 text-[11px] font-medium ${TICKET_PRIORITY_COLORS[ticket.priority]}`}>
                    {ticket.priority}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-2 py-1 text-[11px] font-medium ${TICKET_STATUS_COLORS[ticket.status]}`}>
                    {TICKET_STATUS_LABELS[ticket.status]}
                  </span>
                  <span className="text-xs text-black/55">{ticket.category}</span>
                </div>
              </button>
            );
          })
        )}
      </div>
    </aside>
  );
}
