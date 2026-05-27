"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  XCircle,
  ExternalLink,
  ChevronRight,
  LifeBuoy,
} from "lucide-react";

interface SupportTicket {
  id: string;
  clientName: string;
  designerName: string;
  issueType: string;
  status: "open" | "resolved" | "escalated";
  priority: "high" | "medium" | "low";
  created_at: string;
  subject: string;
}

const MOCK_TICKETS: SupportTicket[] = [
  {
    id: "TCK-8801",
    clientName: "Amara Kalu",
    designerName: "Deji Luxury",
    issueType: "Milestone Dispute",
    status: "open",
    priority: "high",
    created_at: "2026-05-25",
    subject: "Aso-Oke train details are not aligned with agreed sizing profile sketch.",
  },
  {
    id: "TCK-8802",
    clientName: "Tobi Adebayo",
    designerName: "Vanguard Tailors",
    issueType: "Escrow Release Delay",
    status: "open",
    priority: "medium",
    created_at: "2026-05-24",
    subject: "Client confirmed delivery but wallet escrow is still locked in contract.",
  },
];

export default function AdminTicketsPage() {
  const [search, setSearch] = useState("");
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);

  const filteredTickets = MOCK_TICKETS.filter((ticket) =>
    ticket.clientName.toLowerCase().includes(search.toLowerCase()) ||
    ticket.designerName.toLowerCase().includes(search.toLowerCase()) ||
    ticket.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-10 bg-inherit min-h-screen pb-12 font-satoshi">
      {/* Header Banner */}
      <div>
        <h3 className="font-bon_foyage text-4xl text-black md:text-5xl">
          Support Queue &amp; Tickets
        </h3>
        <p className="text-sm text-[#5A6465] mt-1">
          Arbitrate tailor-client disputes, verify escrow contract states, and maintain SLA reply deadlines.
        </p>
      </div>

      {/* Main Directory */}
      <div className="w-full bg-[#F8F5ED]/40 border border-[#ECE6D6] rounded-[32px] p-6 md:p-8 space-y-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8A9596]" />
          <input
            type="text"
            placeholder="Search tickets by client name, tailored designer name, or ticket ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-12 pl-12 pr-4 bg-white border border-[#ECE6D6] focus:border-[#01454A] rounded-2xl outline-none text-sm text-black placeholder:text-[#8A9596] transition-all"
          />
        </div>

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
                        ticket.priority === "high"
                          ? "bg-red-50 text-red-600 border border-red-100"
                          : "bg-amber-50 text-[#FDA600] border border-amber-100"
                      }`}
                    >
                      {ticket.priority.toUpperCase()} PRIORITY
                    </span>
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100`}
                    >
                      {ticket.status.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="font-bon_foyage text-xl text-black">{ticket.issueType}</h4>
                  <p className="text-xs text-[#5A6465] leading-relaxed mt-2 italic">
                    "{ticket.subject}"
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-3 border-t border-[#ECE6D6]/40 text-xs">
                  <div>
                    <span className="text-[#8A9596]">Client</span>
                    <span className="font-semibold text-black block mt-0.5">{ticket.clientName}</span>
                  </div>
                  <div>
                    <span className="text-[#8A9596]">Tailor Shop</span>
                    <span className="font-semibold text-[#01454A] block mt-0.5">{ticket.designerName}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 mt-4 border-t border-[#ECE6D6]/30 flex items-center justify-between text-[10px] text-[#8A9596]">
                <span>Logged: {ticket.created_at}</span>
                <span className="font-bold flex items-center gap-0.5 text-[#01454A] group-hover:translate-x-0.5 transition">
                  Inspect <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
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
                    {selectedTicket.issueType}
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
