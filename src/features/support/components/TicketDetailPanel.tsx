/**
 * features/support/components/TicketDetailPanel.tsx
 *
 * Full ticket detail panel with:
 *   - Message thread (client vs staff bubbles)
 *   - Escalation notice banner
 *   - Resolution notes block
 *   - Loading skeleton state
 *   - Inline reply composer with send button
 */

"use client";

import { useState, useEffect, useRef } from "react";
import { AlertTriangle, CheckCircle2, ChevronDown, Paperclip } from "lucide-react";

import {
  TICKET_PRIORITY_COLORS,
  TICKET_STATUS_COLORS,
  TICKET_STATUS_LABELS,
  TICKET_CATEGORY_LABELS,
  type SupportTicket,
} from "../types/support.types";

export interface TicketDetailPanelProps {
  ticket:          SupportTicket | null;
  onSendMessage?:  (body: string) => Promise<void> | void;
  isSending?:      boolean;
  isLoading?:      boolean;
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────

function DetailSkeleton() {
  return (
    <section className="flex min-h-[26rem] flex-col overflow-hidden rounded-xl border border-black/10 bg-[#F4F3EC] shadow-sm">
      <div className="border-b border-black/10 bg-white px-5 py-4">
        <div className="h-5 w-2/3 animate-pulse rounded bg-black/10" />
        <div className="mt-2 h-3 w-1/3 animate-pulse rounded bg-black/8" />
      </div>
      <div className="flex-1 space-y-4 p-5">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className={`h-12 w-3/4 animate-pulse rounded-2xl bg-black/10 ${i % 2 === 1 ? "ml-auto" : ""}`}
          />
        ))}
      </div>
    </section>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <section className="flex min-h-[26rem] items-center justify-center rounded-xl border border-black/10 bg-[#F4F3EC]">
      <p className="text-sm text-black/45">Select a ticket to view the thread.</p>
    </section>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function TicketDetailPanel({
  ticket,
  onSendMessage,
  isSending = false,
  isLoading = false,
}: TicketDetailPanelProps) {
  const [reply, setReply] = useState("");
  const threadEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to latest message when thread updates
  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [ticket?.messages.length]);

  if (isLoading) return <DetailSkeleton />;
  if (!ticket)   return <EmptyState />;

  const isClosed   = ticket.status === "closed";
  const isResolved = ticket.status === "resolved";
  const canReply   = !!onSendMessage && !isClosed;

  return (
    <section className="flex min-h-[26rem] flex-col overflow-hidden rounded-xl border border-black/10 bg-[#F4F3EC] shadow-sm">

      {/* ── Ticket header ─────────────────────────────────────────── */}
      <div className="border-b border-black/10 bg-white px-5 py-4">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-base font-semibold text-[#141414]">{ticket.title}</h3>
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${TICKET_STATUS_COLORS[ticket.status]}`}>
            {TICKET_STATUS_LABELS[ticket.status]}
          </span>
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${TICKET_PRIORITY_COLORS[ticket.priority]}`}>
            {ticket.priority}
          </span>
          <span className="ml-auto text-[11px] text-black/45">
            {TICKET_CATEGORY_LABELS[ticket.category]}
          </span>
        </div>
        <p className="mt-2 text-sm leading-6 text-black/65">{ticket.description}</p>

        {/* Order reference */}
        {ticket.order_id && (
          <p className="mt-1 text-xs text-black/40">
            Order ref:{" "}
            <span className="font-mono font-semibold text-[#141414]">
              {ticket.order_id.slice(0, 8).toUpperCase()}
            </span>
          </p>
        )}
      </div>

      {/* ── Escalation banner ─────────────────────────────────────── */}
      {ticket.escalation && ticket.escalation.status !== "resolved" && (
        <div className="mx-4 mt-4 flex items-start gap-3 rounded-lg border border-orange-300 bg-orange-50 px-3 py-2.5 text-sm text-orange-900">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-orange-500" />
          <div>
            <p className="font-semibold">Escalated for admin review</p>
            <p className="text-xs text-orange-700 mt-0.5">{ticket.escalation.reason}</p>
          </div>
        </div>
      )}

      {/* ── Resolution notes ──────────────────────────────────────── */}
      {isResolved && ticket.resolution_notes && (
        <div className="mx-4 mt-4 flex items-start gap-3 rounded-lg border border-green-300 bg-green-50 px-3 py-2.5 text-sm text-green-900">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
          <div>
            <p className="font-semibold">Resolution</p>
            <p className="mt-0.5 text-xs text-green-800">{ticket.resolution_notes}</p>
          </div>
        </div>
      )}

      {/* ── Message thread ────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {ticket.messages.length === 0 ? (
          <p className="text-center text-sm text-black/40">
            No messages yet. Be the first to reply.
          </p>
        ) : (
          ticket.messages.map((message) => (
            <div
              key={message.id}
              className={[
                "flex flex-col gap-1",
                message.is_staff_reply ? "items-start" : "items-end",
              ].join(" ")}
            >
              <p className="text-[11px] text-black/45 px-1">
                {message.author_name}
                {message.is_staff_reply && (
                  <span className="ml-1 rounded-full bg-[#01454A] px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-white">
                    Staff
                  </span>
                )}
              </p>
              <div
                className={[
                  "max-w-[85%] rounded-2xl px-4 py-3 shadow-sm",
                  message.is_staff_reply
                    ? "bg-white text-[#141414]"
                    : "bg-[#01454A] text-white",
                ].join(" ")}
              >
                <p className="text-sm leading-6 whitespace-pre-wrap">{message.body}</p>
                {message.attachments && message.attachments.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {message.attachments.map((url, idx) => (
                      <a
                        key={idx}
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 rounded-md bg-black/10 px-2 py-1 text-[11px] underline-offset-2 hover:underline"
                      >
                        <Paperclip className="h-3 w-3" /> Attachment {idx + 1}
                      </a>
                    ))}
                  </div>
                )}
              </div>
              <p className="text-[10px] text-black/30 px-1">
                {new Date(message.created_at).toLocaleString()}
              </p>
            </div>
          ))
        )}
        <div ref={threadEndRef} />
      </div>

      {/* ── Closed notice ─────────────────────────────────────────── */}
      {isClosed && (
        <div className="border-t border-black/10 bg-white px-5 py-3 text-center text-sm text-black/45">
          This ticket is closed. Open a new ticket if you need further assistance.
        </div>
      )}

      {/* ── Reply composer ────────────────────────────────────────── */}
      {canReply && (
        <div className="border-t border-black/10 bg-white px-4 py-4">
          <div className="flex items-end gap-3">
            <textarea
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              onKeyDown={(e) => {
                // Ctrl/Cmd + Enter submits
                if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                  const body = reply.trim();
                  if (body) {
                    Promise.resolve(onSendMessage!(body)).then(() => setReply(""));
                  }
                }
              }}
              rows={3}
              placeholder="Reply to support… (Ctrl+Enter to send)"
              className="min-h-[72px] flex-1 resize-none rounded-xl border border-black/10 px-4 py-3 text-sm text-[#141414] outline-none transition focus:border-[#FDA600] focus:ring-2 focus:ring-[#FDA600]/20"
            />
            <button
              type="button"
              disabled={isSending || reply.trim().length < 2}
              onClick={async () => {
                const body = reply.trim();
                if (!body) return;
                await Promise.resolve(onSendMessage!(body));
                setReply("");
              }}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#FDA600] text-[#141414] shadow transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Send reply"
            >
              {isSending ? (
                <ChevronDown className="h-4 w-4 animate-bounce" />
              ) : (
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                  <path d="M2 21l21-9L2 3v7l15 2-15 2z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
