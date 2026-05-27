"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  XCircle,
  ExternalLink,
  ChevronRight,
  LifeBuoy,
  UserCheck,
  Loader2,
} from "lucide-react";
import { useAdminTickets, useAssignTicket, useAdminSlaMetrics } from "@/features/support";

export default function AdminTicketsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [priorityFilter, setPriorityFilter] = useState<string>("");
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
  const [assigneeName, setAssigneeName] = useState("");

  const { data: tickets = [], isLoading, isError } = useAdminTickets({
    status: statusFilter || undefined,
    priority: priorityFilter || undefined,
  });

  const { data: metrics } = useAdminSlaMetrics();
  const assignMutation = useAssignTicket();

  const handleAssign = (ticketId: string) => {
    if (!assigneeName.trim()) return;
    assignMutation.mutate(
      { ticketId, assignedTo: assigneeName },
      {
        onSuccess: (updated) => {
          setSelectedTicket(updated);
          setAssigneeName("");
        },
      }
    );
  };

  const filteredTickets = tickets.filter((ticket) =>
    ticket.subject.toLowerCase().includes(search.toLowerCase()) ||
    ticket.id.toLowerCase().includes(search.toLowerCase()) ||
    ticket.user_email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-10 bg-inherit min-h-screen pb-12 font-satoshi">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="font-bon_foyage text-4xl text-black md:text-5xl">
            Support Queue &amp; Tickets
          </h3>
          <p className="text-sm text-[#5A6465] mt-1">
            Arbitrate tailor-client disputes, verify escrow contract states, and maintain SLA reply deadlines.
          </p>
        </div>

        {metrics && (
          <div className="flex items-center gap-4 bg-[#F8F5ED] border border-[#ECE6D6] rounded-2xl p-4 text-xs font-mono">
            <div>
              <span className="text-[#8A9596] block">Active Support Queue</span>
              <span className="font-bold text-black text-lg">{metrics.active_tickets}</span>
            </div>
            <div className="h-8 w-[1px] bg-[#ECE6D6]" />
            <div>
              <span className="text-amber-600 block">At-Risk Tickets</span>
              <span className="font-bold text-amber-600 text-lg">{metrics.at_risk_tickets}</span>
            </div>
            <div className="h-8 w-[1px] bg-[#ECE6D6]" />
            <div>
              <span className="text-emerald-700 block">Avg. Resolution Time</span>
              <span className="font-bold text-emerald-700 text-lg">{metrics.average_resolution_hours}h</span>
            </div>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8A9596]" />
          <input
            type="text"
            placeholder="Search tickets by subject, email, or ticket ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-12 pl-12 pr-4 bg-white border border-[#ECE6D6] focus:border-[#01454A] rounded-2xl outline-none text-sm text-black placeholder:text-[#8A9596] transition-all"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-12 px-4 bg-white border border-[#ECE6D6] rounded-2xl text-xs outline-none text-black cursor-pointer focus:border-[#01454A]"
          >
            <option value="">All Statuses</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="h-12 px-4 bg-white border border-[#ECE6D6] rounded-2xl text-xs outline-none text-black cursor-pointer focus:border-[#01454A]"
          >
            <option value="">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>
      </div>

      {/* Main Directory */}
      <div className="w-full bg-[#F8F5ED]/40 border border-[#ECE6D6] rounded-[32px] p-6 md:p-8 space-y-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-8 h-8 text-[#01454A] animate-spin" />
            <p className="text-xs text-[#5A6465]">Loading active support queue...</p>
          </div>
        ) : isError ? (
          <div className="text-center py-20 border border-dashed border-[#ECE6D6] rounded-[24px] bg-white">
            <p className="text-sm text-red-600">Failed to load support tickets. Please try again.</p>
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-[#ECE6D6] rounded-[24px] bg-white">
            <p className="text-sm text-[#8A9596]">No support tickets match your search filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredTickets.map((ticket) => (
              <div
                key={ticket.id}
                onClick={() => setSelectedTicket(ticket)}
                className="bg-white border border-[#ECE6D6] hover:border-[#01454A] rounded-[24px] p-6 shadow-xs hover:shadow transition duration-200 cursor-pointer flex flex-col justify-between group"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-[#8A9596]">{ticket.id}</span>
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                          ticket.priority === "critical" || ticket.priority === "high"
                            ? "bg-red-50 text-red-600 border border-red-100"
                            : "bg-amber-50 text-[#FDA600] border border-amber-100"
                        }`}
                      >
                        {ticket.priority.toUpperCase()} PRIORITY
                      </span>
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100`}
                      >
                        {ticket.status.replace("_", " ").toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bon_foyage text-xl text-black">
                      {ticket.category.replace("_", " ").toUpperCase()}
                    </h4>
                    <p className="text-xs text-[#5A6465] leading-relaxed mt-2 italic">
                      "{ticket.subject}"
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[#ECE6D6]/40 text-xs">
                    <span className="text-[#8A9596]">Reporter</span>
                    <span className="font-semibold text-black block mt-0.5">{ticket.user_email}</span>
                  </div>
                </div>

                <div className="pt-3 mt-4 border-t border-[#ECE6D6]/30 flex items-center justify-between text-[10px] text-[#8A9596]">
                  <span>Assigned to: {ticket.assigned_to || "Unassigned"}</span>
                  <span className="font-bold flex items-center gap-0.5 text-[#01454A] group-hover:translate-x-0.5 transition">
                    Inspect <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Details drawer */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-md h-full bg-[#F8F5ED] p-6 md:p-8 overflow-y-auto shadow-2xl flex flex-col justify-between border-l border-[#ECE6D6] animate-in slide-in-from-right duration-300">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-widest text-[#5A6465]">
                  Support Ticket Auditor
                </span>
                <button
                  onClick={() => setSelectedTicket(null)}
                  className="p-1 rounded-full border border-[#ECE6D6] bg-white hover:bg-black hover:text-white transition"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <div className="py-4 border-b border-[#ECE6D6]/80 flex items-center gap-3">
                <div className="p-3 bg-[#01454A]/5 text-[#01454A] rounded-xl border border-[#01454A]/15">
                  <LifeBuoy className="w-6 h-6" />
                </div>
                <div>
                  <span className="font-mono text-xs text-[#8A9596] block">{selectedTicket.id}</span>
                  <h4 className="font-bon_foyage text-2xl text-black">
                    {selectedTicket.category.replace("_", " ").toUpperCase()}
                  </h4>
                </div>
              </div>

              <div className="space-y-4 bg-white border border-[#ECE6D6] rounded-2xl p-5 text-sm">
                <p className="font-bon_foyage text-lg text-black border-b border-[#ECE6D6]/50 pb-2">
                  Complaint Details
                </p>
                <p className="text-[#5A6465] leading-relaxed italic">
                  "{selectedTicket.subject}"
                </p>
              </div>

              <div className="space-y-4 bg-white border border-[#ECE6D6] rounded-2xl p-5 text-sm">
                <p className="font-bon_foyage text-lg text-black border-b border-[#ECE6D6]/50 pb-2">
                  Assign Staff
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter Staff / Admin Name..."
                    value={assigneeName}
                    onChange={(e) => setAssigneeName(e.target.value)}
                    className="flex-1 h-10 px-3 border border-[#ECE6D6] rounded-xl text-xs outline-none focus:border-[#01454A]"
                  />
                  <button
                    onClick={() => handleAssign(selectedTicket.id)}
                    disabled={assignMutation.isPending || !assigneeName.trim()}
                    className="h-10 px-4 bg-[#01454A] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 disabled:opacity-50 transition"
                  >
                    {assignMutation.isPending ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <UserCheck className="w-3.5 h-3.5" />
                    )}
                    Assign
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-[#ECE6D6]/80 bg-inherit space-y-3">
              <Link
                href={`${process.env.NEXT_PUBLIC_API_V1_URL || "http://127.0.0.1:8001"}/admin/support/ticket/${selectedTicket.id}/change/`}
                target="_blank"
                className="w-full bg-[#01454A] hover:bg-[#01454A]/90 text-white font-bold text-sm py-3.5 rounded-xl shadow-sm flex items-center justify-center gap-2 transition"
              >
                <ExternalLink className="w-4 h-4" />
                Open In Django Super-Admin
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
