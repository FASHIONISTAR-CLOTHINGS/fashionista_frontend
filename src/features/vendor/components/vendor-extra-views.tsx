"use client";

/**
 * vendor-extra-views.tsx — Phase 7-9 Rewire (2026-Enterprise)
 *
 * Views:
 *   - VendorNotificationsView  (/vendor/notifications) — real API via features/notification
 *   - VendorSupportView        (/vendor/support)        — real API via features/support
 *   - VendorChatView           (/vendor/chat)           — real API + WS via features/chat
 *
 * Design Rules:
 *   - Consumes every existing shared primitive before creating anything new
 *   - Brand palette: Forest Green #01454A, Gold #FDA600, Cream #F8F5ED
 *   - Zero hardcoded demo data — all from real API hooks
 */


import React, { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { FashionistarImage } from "@/components/media";
import { toast } from "sonner";
import { useVendorCatalogProducts } from "@/features/product";
import {
  AlertCircle,
  Bell,
  BellOff,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Headphones,
  Loader2,
  MessageSquare,
  Package,
  Plus,
  RefreshCw,
  Send,
  Shield,
  ShoppingCart,
  Star,
  Ticket,
  TrendingUp,
  Wallet,
  Wifi,
  WifiOff,
} from "lucide-react";

// ── Real feature hooks ─────────────────────────────────────────────────────────
import {
  useNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
} from "@/features/notification";
import type { Notification as AppNotification } from "@/features/notification";
import {
  useMyTickets,
  useCreateTicket,
  useTicketDetail,
  useAddMessage,
} from "@/features/support/hooks/use-support";
import type {
  SupportTicketListItem,
  TicketCategory,
  TicketStatus,
  CreateTicketInput,
} from "@/features/support/types/support.types";
import {
  TICKET_STATUS_LABELS,
  TICKET_CATEGORY_LABELS,
  TICKET_PRIORITY_COLORS,
} from "@/features/support/types/support.types";
import {
  useConversations,
  useMessages,
  useSendMessage,
  useChatWebSocket,
} from "@/features/chat";
import type { Conversation, Message } from "@/features/chat";

import { useAuthStore, selectToken } from "@/features/auth/store/auth.store";
const C = {
  green:  "#01454A",
  greenM: "#01454A",
  gold:   "#FDA600",
  goldD:  "#E8960A",
  cream:  "#F8F5ED",
  creamB: "#ECE6D6",
  muted:  "#7A6B44",
  ink:    "#1A1208",
} as const;

// ── Shared Section Header ─────────────────────────────────────────────────────
function PageHero({
  eyebrow,
  title,
  description,
  icon: Icon,
  badge,
}: {
  eyebrow:     string;
  title:       string;
  description: string;
  icon:        React.ElementType;
  badge?:      number;
}) {
  return (
    <div className="mb-8 flex items-start gap-4">
      <div
        className="relative flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl shadow-lg"
        style={{ background: `linear-gradient(135deg, ${C.green} 0%, ${C.greenM} 100%)` }}
      >
        <Icon className="h-6 w-6 text-[#FDA600]" aria-hidden="true" />
        {badge != null && badge > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#FDA600] text-[9px] font-bold text-black ring-2 ring-white">
            {badge > 9 ? "9+" : badge}
          </span>
        )}
      </div>
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.14em]" style={{ color: C.gold }}>{eyebrow}</p>
        <h1 className="mt-0.5 text-2xl font-bold" style={{ color: C.ink }}>{title}</h1>
        <p className="mt-1 text-sm" style={{ color: C.muted }}>{description}</p>
      </div>
    </div>
  );
}

function LoadingSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-20 animate-pulse rounded-2xl bg-[#ECE6D6]" />
      ))}
    </div>
  );
}

function EmptyState({ icon: Icon, title, body }: { icon: React.ElementType; title: string; body: string }) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-3xl border border-[#ECE6D6] bg-white py-16 text-center px-6">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F8F5ED]">
        <Icon className="h-7 w-7 text-[#ECE6D6]" />
      </div>
      <div>
        <p className="text-sm font-bold text-[#1A1208]">{title}</p>
        <p className="mt-1 text-xs text-[#7A6B44]">{body}</p>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// PHASE 7: NOTIFICATIONS VIEW
// ══════════════════════════════════════════════════════════════════════════════

const NOTIF_TYPE_MAP: Record<string, { Icon: React.ElementType; color: string; bg: string }> = {
  order_placed:   { Icon: ShoppingCart, color: "#01454A", bg: "#E6F4F5" },
  order_shipped:  { Icon: Package,      color: "#01454A", bg: "#E6F4F5" },
  payout:         { Icon: Wallet,       color: "#7c4700", bg: "#FFF3D1" },
  review:         { Icon: Star,         color: "#6b46c1", bg: "#EDE9FE" },
  kyc:            { Icon: Shield,       color: "#1d4ed8", bg: "#EFF6FF" },
  system:         { Icon: AlertCircle,  color: "#c0392b", bg: "#FDECEA" },
};

function getNotifIcon(type: string) {
  const key = Object.keys(NOTIF_TYPE_MAP).find((k) => type?.toLowerCase().includes(k));
  return key ? NOTIF_TYPE_MAP[key] : NOTIF_TYPE_MAP["system"];
}

function NotifCard({
  notif,
  onMarkRead,
}: {
  notif: AppNotification;
  onMarkRead: (id: string) => void;
}) {
  const { Icon, color, bg } = getNotifIcon(notif.notification_type ?? "system");
  const timeAgo = new Date(notif.created_at).toLocaleString("en-NG", {
    dateStyle: "short",
    timeStyle: "short",
  });

  return (
    <div
      className={[
        "relative flex gap-4 rounded-2xl border p-4 transition-all duration-200",
        notif.is_read
          ? "border-[#ECE6D6] bg-white"
          : "border-[#FDA600]/30 bg-[#FFFBF0] shadow-sm",
      ].join(" ")}
    >
      <div
        className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl"
        style={{ background: bg }}
      >
        <Icon className="h-5 w-5" style={{ color }} aria-hidden="true" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={`text-sm font-semibold ${notif.is_read ? "text-[#1A1208]" : "text-[#0f1a0b]"}`}>
            {notif.title}
          </p>
          {!notif.is_read && (
            <button
              type="button"
              onClick={() => onMarkRead(notif.id)}
              className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg text-[#FDA600] hover:bg-[#FFF3D1] transition-colors"
              aria-label="Mark as read"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <p className="mt-0.5 text-sm text-[#7A6B44]">{notif.body}</p>
        <div className="mt-2 flex items-center gap-3">
          <span className="flex items-center gap-1 text-xs text-[#7A6B44]/70">
            <Clock className="h-3 w-3" />
            {timeAgo}
          </span>
          {!notif.is_read && (
            <span
              className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
              style={{ background: `${C.gold}20`, color: C.goldD }}
            >
              New
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export function VendorNotificationsView() {
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const { data: allNotifs, isLoading, isError, refetch } = useNotifications(1);
  const markRead    = useMarkNotificationRead();
  const markAll     = useMarkAllNotificationsRead();

  const notifs      = Array.isArray(allNotifs) ? allNotifs : [];
  const unreadCount = notifs.filter((n) => !n.is_read).length;
  const displayed   = filter === "unread" ? notifs.filter((n) => !n.is_read) : notifs;

  return (
    <div className="space-y-6 py-2">
      <PageHero
        eyebrow="Activity"
        title="Notifications"
        description="Real-time alerts for orders, payouts, reviews, and platform updates."
        icon={Bell}
        badge={unreadCount}
      />

      {/* Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          {(["all", "unread"] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={[
                "rounded-xl px-4 py-2 text-sm font-semibold transition-all capitalize",
                filter === f
                  ? "text-black shadow"
                  : "border border-[#ECE6D6] bg-white text-[#7A6B44] hover:bg-[#F8F5ED]",
              ].join(" ")}
              style={filter === f ? { background: `linear-gradient(135deg, ${C.gold} 0%, ${C.goldD} 100%)` } : undefined}
            >
              {f === "unread" ? `Unread (${unreadCount})` : "All"}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => void refetch()}
            className="flex items-center gap-1.5 rounded-xl border border-[#ECE6D6] bg-white px-3 py-2 text-sm font-semibold text-[#7A6B44] transition hover:bg-[#F8F5ED]"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </button>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={() => void markAll.mutateAsync()}
              disabled={markAll.isPending}
              className="flex items-center gap-1.5 rounded-xl border border-[#ECE6D6] bg-white px-4 py-2 text-sm font-semibold text-[#7A6B44] transition hover:bg-[#F8F5ED] disabled:opacity-50"
            >
              {markAll.isPending
                ? <Loader2 className="h-4 w-4 animate-spin" />
                : <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
              Mark all read
            </button>
          )}
        </div>
      </div>

      {/* List */}
      {isLoading ? (
        <LoadingSkeleton rows={5} />
      ) : isError ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
          <p className="text-sm font-semibold text-red-700">Could not load notifications.</p>
          <button onClick={() => void refetch()} className="mt-2 text-xs text-red-600 underline">Retry</button>
        </div>
      ) : displayed.length === 0 ? (
        <EmptyState
          icon={BellOff}
          title={filter === "unread" ? "All caught up! 🎉" : "No notifications yet"}
          body={filter === "unread" ? "You've read all your notifications." : "Activity will appear here as orders, reviews, and payouts come in."}
        />
      ) : (
        <div className="space-y-3">
          {displayed.map((n) => (
            <NotifCard
              key={n.id}
              notif={n}
              onMarkRead={(id) => void markRead.mutateAsync(id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// PHASE 8: SUPPORT TICKETS VIEW
// ══════════════════════════════════════════════════════════════════════════════

const STATUS_STYLE: Record<TicketStatus, { label: string; color: string; bg: string }> = {
  open:             { label: "Open",               color: "#1d4ed8", bg: "#EFF6FF" },
  in_review:        { label: "In Review",          color: "#92400e", bg: "#FEF3C7" },
  awaiting_client:  { label: "Awaiting You",       color: "#b45309", bg: "#FFF7ED" },
  awaiting_vendor:  { label: "Awaiting Vendor",    color: "#0f766e", bg: "#F0FDF4" },
  resolved:         { label: "Resolved ✓",         color: "#065f46", bg: "#D1FAE5" },
  closed:           { label: "Closed",             color: "#6b7280", bg: "#F3F4F6" },
};

const CATEGORIES: Array<{ value: TicketCategory | ""; label: string }> = [
  { value: "",                  label: "All Categories"     },
  { value: "order_dispute",     label: "Order Dispute"      },
  { value: "payment_issue",     label: "Payment Issue"      },
  { value: "product_complaint", label: "Product Complaint"  },
  { value: "delivery_problem",  label: "Delivery Problem"   },
  { value: "refund_request",    label: "Refund Request"     },
  { value: "measurement_issue", label: "Measurement Issue"  },
  { value: "general",           label: "General"            },
];

function TicketCard({
  ticket,
  onSelect,
}: {
  ticket: SupportTicketListItem;
  onSelect: () => void;
}) {
  const st  = STATUS_STYLE[ticket.status] ?? STATUS_STYLE.open;
  const pri = TICKET_PRIORITY_COLORS[ticket.priority] ?? "bg-slate-100 text-slate-600";

  return (
    <button
      type="button"
      onClick={onSelect}
      className="flex w-full flex-col gap-3 rounded-2xl border border-[#ECE6D6] bg-white p-5 text-left transition hover:shadow-md hover:border-[#FDA600]/30 sm:flex-row sm:items-center"
    >
      <div
        className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl"
        style={{ background: st.bg }}
      >
        <Ticket className="h-5 w-5" style={{ color: st.color }} />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[#1A1208] truncate">{ticket.title}</p>
        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-[#7A6B44]">
          <span>{TICKET_CATEGORY_LABELS[ticket.category] ?? ticket.category}</span>
          {ticket.order_id && <><span>·</span><span className="font-mono text-[#FDA600]">{ticket.order_id}</span></>}
          <span>·</span>
          <span className="flex items-center gap-0.5">
            <Clock className="h-3 w-3" />
            {new Date(ticket.updated_at).toLocaleDateString("en-NG")}
          </span>
        </div>
      </div>

      <div className="flex flex-shrink-0 flex-col items-end gap-2">
        <span
          className="inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide"
          style={{ background: st.bg, color: st.color }}
        >
          {st.label}
        </span>
        <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${pri}`}>
          {ticket.priority}
        </span>
      </div>

      <ChevronRight className="h-4 w-4 flex-shrink-0 text-[#7A6B44]" />
    </button>
  );
}

function TicketDetailDrawer({
  ticketId,
  onBack,
}: {
  ticketId: string;
  onBack: () => void;
}) {
  const { data: ticket, isLoading } = useTicketDetail(ticketId);
  const addMessage = useAddMessage(ticketId);
  const [draft, setDraft] = useState("");

  const send = () => {
    const body = draft.trim();
    if (!body) return;
    void addMessage.mutateAsync({ body });
    setDraft("");
  };

  if (isLoading) return <LoadingSkeleton rows={6} />;
  if (!ticket) return null;

  const st = STATUS_STYLE[ticket.status] ?? STATUS_STYLE.open;

  return (
    <div className="space-y-5">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm font-semibold text-[#7A6B44] hover:text-[#1A1208] transition"
      >
        <ChevronLeft className="h-4 w-4" /> Back to tickets
      </button>

      {/* Header */}
      <div className="rounded-2xl border border-[#ECE6D6] bg-white p-5 space-y-2">
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-base font-bold text-[#1A1208]">{ticket.title}</h2>
          <span
            className="inline-flex flex-shrink-0 items-center rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide"
            style={{ background: st.bg, color: st.color }}
          >
            {st.label}
          </span>
        </div>
        <p className="text-sm text-[#7A6B44]">{ticket.description}</p>
        <div className="flex flex-wrap gap-2 text-xs text-[#7A6B44]">
          <span>{TICKET_CATEGORY_LABELS[ticket.category]}</span>
          {ticket.order_id && <span className="font-mono text-[#FDA600]">Order: {ticket.order_id}</span>}
          <span>Opened {new Date(ticket.created_at).toLocaleString("en-NG")}</span>
        </div>
      </div>

      {/* Thread */}
      <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
        {ticket.messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.is_staff_reply ? "justify-start" : "justify-end"}`}>
            <div
              className={[
                "max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                msg.is_staff_reply
                  ? "border border-[#ECE6D6] bg-[#F8F5ED] text-[#1A1208]"
                  : "text-black",
              ].join(" ")}
              style={!msg.is_staff_reply ? { background: `linear-gradient(135deg, ${C.gold} 0%, ${C.goldD} 100%)` } : undefined}
            >
              <p className="text-[10px] font-bold mb-1 opacity-70">{msg.author_name}</p>
              {msg.body}
              <p className="mt-1 text-[10px] opacity-60">{new Date(msg.created_at).toLocaleTimeString("en-NG")}</p>
            </div>
          </div>
        ))}
        {ticket.messages.length === 0 && (
          <p className="text-center text-xs text-[#7A6B44]">No messages yet. Send the first message below.</p>
        )}
      </div>

      {/* Reply composer */}
      {ticket.status !== "resolved" && ticket.status !== "closed" && (
        <div className="flex items-center gap-2 rounded-2xl border border-[#ECE6D6] bg-[#FAFAF8] px-4 py-2.5">
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder="Add a message to support staff…"
            className="flex-1 bg-transparent text-sm text-[#1A1208] placeholder:text-[#7A6B44]/50 outline-none"
          />
          <button
            type="button"
            onClick={send}
            disabled={!draft.trim() || addMessage.isPending}
            className="flex h-8 w-8 items-center justify-center rounded-xl text-black transition-all disabled:opacity-40 hover:scale-105"
            style={{ background: `linear-gradient(135deg, ${C.gold} 0%, ${C.goldD} 100%)` }}
          >
            {addMessage.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </button>
        </div>
      )}
    </div>
  );
}

export function VendorSupportView() {
  const [activeTab,   setActiveTab]   = useState<"tickets" | "new">("tickets");
  const [selectedId,  setSelectedId]  = useState<string | null>(null);
  const [category,    setCategory]    = useState<TicketCategory | "">("");
  const [form, setForm] = useState<CreateTicketInput>({
    title: "", description: "", category: "general", priority: "medium",
  });

  const searchParams = useSearchParams();
  useEffect(() => {
    const pCategory = searchParams.get("category");
    const pTitle = searchParams.get("title") || searchParams.get("subject");
    const pBody = searchParams.get("body") || searchParams.get("description");

    if (pCategory || pTitle || pBody) {
      setForm({
        title: pTitle || "",
        description: pBody || "",
        category: (pCategory as TicketCategory) || "general",
        priority: "high",
      });
      setActiveTab("new");
    }
  }, [searchParams]);

  const { data: tickets, isLoading, isError } = useMyTickets(
    category ? { category } : undefined
  );
  const createTicket = useCreateTicket();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createTicket.mutateAsync(form);
    setForm({ title: "", description: "", category: "general", priority: "medium" });
    setActiveTab("tickets");
  };

  const ticketList = Array.isArray(tickets) ? tickets : [];

  if (selectedId) {
    return (
      <div className="space-y-6 py-2">
        <PageHero eyebrow="Help Center" title="Ticket Detail" description="View and reply to your support thread." icon={Headphones} />
        <TicketDetailDrawer ticketId={selectedId} onBack={() => setSelectedId(null)} />
      </div>
    );
  }

  return (
    <div className="space-y-6 py-2">
      <PageHero
        eyebrow="Help Center"
        title="Support Tickets"
        description="Manage disputes, get help with payouts, and escalate issues to Fashionistar staff."
        icon={Headphones}
        badge={ticketList.filter((t) => t.status === "open" || t.status === "awaiting_client").length}
      />

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[#ECE6D6]">
        {([
          { key: "tickets", label: "My Tickets",  Icon: Ticket    },
          { key: "new",     label: "Open Ticket", Icon: RefreshCw },
        ] as const).map(({ key, label, Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => setActiveTab(key)}
            className={[
              "flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors",
              activeTab === key
                ? "border-[#FDA600] text-[#1A1208]"
                : "border-transparent text-[#7A6B44] hover:text-[#1A1208]",
            ].join(" ")}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {activeTab === "tickets" ? (
        <div className="space-y-4">
          {/* Stats strip */}
          {!isLoading && ticketList.length > 0 && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {(Object.entries(STATUS_STYLE) as [TicketStatus, typeof STATUS_STYLE[TicketStatus]][]).map(([s, cfg]) => {
                const count = ticketList.filter((t) => t.status === s).length;
                return (
                  <div key={s} className="rounded-2xl p-3 text-center" style={{ background: cfg.bg }}>
                    <p className="text-xl font-bold" style={{ color: cfg.color }}>{count}</p>
                    <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wide" style={{ color: cfg.color }}>
                      {TICKET_STATUS_LABELS[s]}
                    </p>
                  </div>
                );
              })}
            </div>
          )}

          {/* Category filter */}
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => setCategory(value as TicketCategory | "")}
                className={[
                  "rounded-xl px-3 py-1.5 text-xs font-semibold transition-all",
                  category === value
                    ? "text-black"
                    : "border border-[#ECE6D6] bg-white text-[#7A6B44] hover:bg-[#F8F5ED]",
                ].join(" ")}
                style={category === value ? { background: `linear-gradient(135deg, ${C.gold} 0%, ${C.goldD} 100%)` } : undefined}
              >
                {label}
              </button>
            ))}
          </div>

          {/* List */}
          {isLoading ? (
            <LoadingSkeleton rows={4} />
          ) : isError ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
              <p className="text-sm font-semibold text-red-700">Could not load tickets.</p>
            </div>
          ) : ticketList.length === 0 ? (
            <EmptyState icon={Ticket} title="No tickets yet" body="Open a ticket if you need help with an order, payout, or dispute." />
          ) : (
            <div className="space-y-3">
              {ticketList.map((t) => (
                <TicketCard key={t.id} ticket={t} onSelect={() => setSelectedId(t.id)} />
              ))}
            </div>
          )}
        </div>
      ) : (
        /* ── New Ticket Form ── */
        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-[#ECE6D6] bg-white p-6 space-y-5"
        >
          <div className="space-y-1.5">
            <label htmlFor="ticket-title" className="block text-sm font-semibold text-[#1A1208]">Subject *</label>
            <input
              id="ticket-title"
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="Brief summary of the issue…"
              className="w-full rounded-xl border border-[#ECE6D6] bg-[#FAFAF8] px-4 py-2.5 text-sm text-[#1A1208] placeholder:text-[#7A6B44]/50 outline-none focus:border-[#FDA600] focus:ring-2 focus:ring-[#FDA600]/20 transition"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label htmlFor="ticket-category" className="block text-sm font-semibold text-[#1A1208]">Category</label>
              <select
                id="ticket-category"
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as TicketCategory }))}
                className="w-full rounded-xl border border-[#ECE6D6] bg-[#FAFAF8] px-4 py-2.5 text-sm text-[#1A1208] outline-none focus:border-[#FDA600] transition"
              >
                {CATEGORIES.filter((c) => c.value).map(({ value, label }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label htmlFor="ticket-priority" className="block text-sm font-semibold text-[#1A1208]">Priority</label>
              <select
                id="ticket-priority"
                value={form.priority}
                onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value as CreateTicketInput["priority"] }))}
                className="w-full rounded-xl border border-[#ECE6D6] bg-[#FAFAF8] px-4 py-2.5 text-sm text-[#1A1208] outline-none focus:border-[#FDA600] transition"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>
          <div className="space-y-1.5">
            <label htmlFor="ticket-order" className="block text-sm font-semibold text-[#1A1208]">Related Order ID (optional)</label>
            <input
              id="ticket-order"
              type="text"
              value={form.order_id ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, order_id: e.target.value || undefined }))}
              placeholder="e.g. ORD-20260428-00012"
              className="w-full rounded-xl border border-[#ECE6D6] bg-[#FAFAF8] px-4 py-2.5 text-sm text-[#1A1208] font-mono placeholder:text-[#7A6B44]/50 outline-none focus:border-[#FDA600] transition"
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="ticket-body" className="block text-sm font-semibold text-[#1A1208]">Description *</label>
            <textarea
              id="ticket-body"
              rows={5}
              required
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Describe the issue in detail — include order IDs, dates, and any supporting context…"
              className="w-full rounded-xl border border-[#ECE6D6] bg-[#FAFAF8] px-4 py-2.5 text-sm text-[#1A1208] placeholder:text-[#7A6B44]/50 outline-none focus:border-[#FDA600] focus:ring-2 focus:ring-[#FDA600]/20 transition resize-none"
            />
          </div>
          <div className="flex items-center justify-between">
            <p className="text-xs text-[#7A6B44]">Our team responds within 24 hours on business days.</p>
            <button
              type="submit"
              disabled={createTicket.isPending}
              className="flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-bold text-black transition-all hover:scale-105 hover:shadow-md disabled:opacity-50"
              style={{ background: `linear-gradient(135deg, ${C.gold} 0%, ${C.goldD} 100%)` }}
            >
              {createTicket.isPending
                ? <Loader2 className="h-4 w-4 animate-spin" />
                : <TrendingUp className="h-4 w-4" />}
              Submit Ticket
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// PHASE 9: CHAT VIEW — Real WebSocket + TanStack Query
// ══════════════════════════════════════════════════════════════════════════════

export function VendorChatView() {
  const [activeConv,   setActiveConv]   = useState<Conversation | null>(null);
  const [showList,     setShowList]     = useState(true);
  const [draft,        setDraft]        = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const [showCatalogModal, setShowCatalogModal] = useState(false);
  const { data: catalogData } = useVendorCatalogProducts();
  const catalogProducts = catalogData?.results ?? [];

  const authToken = useAuthStore(selectToken);

  // 1. WebSocket — connect first so wsConnected is available for REST polling fallbacks
  const { readyState } = useChatWebSocket(
    activeConv?.id ? { conversationId: activeConv.id, authToken } : { conversationId: "", authToken: null }
  );
  const wsConnected = readyState === "open";

  // 2. Conversation list (ConversationFeed = Conversation[])
  const { data: feed, isLoading: feedLoading } = useConversations(wsConnected);
  const conversations: Conversation[] = Array.isArray(feed) ? (feed as Conversation[]) : [];

  // 3. Messages for active conversation
  const { data: msgData } = useMessages(activeConv?.id ?? null, wsConnected);
  const messages: Message[] = msgData?.messages ?? [];

  // 4. Send message mutation — conversationId at hook level (optimistic updates)
  const sendMsg = useSendMessage(activeConv?.id ?? "");

  // Auto-scroll on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const handleSend = () => {
    const text = draft.trim();
    if (!text || !activeConv) return;
    void sendMsg.mutateAsync({ body: text });
    setDraft("");
  };

  return (
    <div className="flex h-[calc(100vh-5rem)] flex-col">
      <div className="mb-4 flex-shrink-0">
        <PageHero
          eyebrow="Customer Communications"
          title="Messages"
          description="Real-time conversations with buyers. Coordinate bespoke orders, measurements, and delivery."
          icon={MessageSquare}
          badge={conversations.reduce((acc, c) => acc + (c.unread_count ?? 0), 0) || undefined}
        />
        {/* WS status indicator */}
        <div className="flex items-center gap-1.5 text-xs font-semibold">
          {wsConnected
            ? <><Wifi className="h-3.5 w-3.5 text-emerald-500" /><span className="text-emerald-600">Live</span></>
            : <><WifiOff className="h-3.5 w-3.5 text-[#7A6B44]" /><span className="text-[#7A6B44]">Connecting…</span></>
          }
        </div>
      </div>

      {/* Chat workspace */}
      <div className="flex flex-1 gap-0 overflow-hidden rounded-3xl border border-[#ECE6D6] bg-white shadow-sm font-sans">
        {/* ── Conversation List ── */}
        <aside
          className={[
            "flex w-full flex-col border-r border-[#ECE6D6] lg:w-80 lg:flex-shrink-0",
            showList ? "flex" : "hidden lg:flex",
          ].join(" ")}
        >
          <div className="border-b border-[#ECE6D6] px-4 py-3">
            <p className="text-xs font-bold uppercase tracking-widest text-[#7A6B44]">Conversations</p>
          </div>
          <div className="flex-1 overflow-y-auto">
            {feedLoading ? (
              <div className="p-4 space-y-2">
                {[1, 2, 3].map((i) => <div key={i} className="h-14 animate-pulse rounded-xl bg-[#ECE6D6]" />)}
              </div>
            ) : conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-12 text-center px-4">
                <MessageSquare className="h-8 w-8 text-[#ECE6D6] mb-2" />
                <p className="text-xs text-[#7A6B44]">No conversations yet.</p>
              </div>
            ) : (
              conversations.map((conv) => (
                <button
                  key={conv.id}
                  type="button"
                  onClick={() => { setActiveConv(conv); setShowList(false); }}
                  className={[
                    "flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors",
                    conv.id === activeConv?.id ? "bg-[#F8F5ED]" : "hover:bg-[#FAFAF8]",
                  ].join(" ")}
                >
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white"
                      style={{ background: `linear-gradient(135deg, ${C.green} 0%, ${C.greenM} 100%)` }}
                    >
                      {(conv.other_party_name ?? "?")[0]?.toUpperCase()}
                    </div>
                  </div>
                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between">
                      <p className="truncate text-sm font-semibold text-[#1A1208]">
                        {conv.other_party_name ?? "Customer"}
                      </p>
                      <span className="flex-shrink-0 text-[10px] text-[#7A6B44]/60">
                        {conv.last_message_at
                          ? new Date(conv.last_message_at).toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" })
                          : ""}
                      </span>
                    </div>
                    <p className="truncate text-xs text-[#7A6B44]">{conv.last_message_preview ?? ""}</p>
                  </div>
                  {(conv.unread_count ?? 0) > 0 && (
                    <span
                      className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-black"
                      style={{ background: C.gold }}
                    >
                      {(conv.unread_count ?? 0) > 9 ? "9+" : conv.unread_count}
                    </span>
                  )}
                </button>
              ))
            )}
          </div>
        </aside>

        {/* ── Message Thread ── */}
        <div className={["flex flex-1 flex-col", !showList ? "flex" : "hidden lg:flex"].join(" ")}>
          {!activeConv ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-3">
              <MessageSquare className="h-12 w-12 text-[#ECE6D6]" />
              <p className="text-sm font-semibold text-[#7A6B44]">Select a conversation to begin</p>
            </div>
          ) : (
            <>
              {/* Thread Header */}
              <div className="flex items-center gap-3 border-b border-[#ECE6D6] px-4 py-3">
                <button
                  type="button"
                  onClick={() => setShowList(true)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-[#7A6B44] hover:bg-[#F8F5ED] lg:hidden"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-white flex-shrink-0"
                  style={{ background: `linear-gradient(135deg, ${C.green} 0%, ${C.greenM} 100%)` }}
                >
                  {(activeConv.other_party_name ?? "?")[0]?.toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[#1A1208]">
                    {activeConv.other_party_name ?? "Customer"}
                  </p>
                  <p className="text-xs text-[#7A6B44]">
                    {wsConnected
                      ? <span className="text-emerald-600">Connected</span>
                      : <span>Offline</span>}
                  </p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-[#FAFAF9]">
                {messages.map((msg) => {
                  const isMine = msg.is_own === true;
                  let isProductAttachment = false;
                  let attachedProduct: any = null;
                  try {
                    if (msg.body.startsWith('{"type":"product_attachment"')) {
                      attachedProduct = JSON.parse(msg.body);
                      isProductAttachment = true;
                    }
                  } catch {}

                  return (
                    <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                      <div
                        className={[
                          "max-w-[70%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm",
                          isMine
                            ? "text-black bg-[#FDA600]/10"
                            : "border border-[#ECE6D6] bg-white text-[#1A1208]",
                        ].join(" ")}
                        style={isMine && !isProductAttachment ? { background: `linear-gradient(135deg, ${C.gold} 0%, ${C.goldD} 100%)` } : undefined}
                      >
                        {isProductAttachment ? (
                          <div className="flex flex-col gap-2 rounded-xl bg-white border border-[#ECE6D6] p-3 max-w-[280px]">
                            {attachedProduct.image_url && (
                              <div className="relative h-32 w-full overflow-hidden rounded-lg bg-[#F8F5ED]">
                                <FashionistarImage
                                  src={attachedProduct.image_url}
                                  alt={attachedProduct.title}
                                  fill={true}
                                  objectFit="cover"
                                />
                              </div>
                            )}
                            <div className="min-w-0">
                              <span className="text-[9px] font-bold uppercase tracking-widest text-[#FDA600]">Catalog Share</span>
                              <h4 className="text-xs font-bold text-[#1A1208] truncate mt-0.5">{attachedProduct.title}</h4>
                              <p className="text-xs font-semibold text-[#01454A] mt-1">₦{Number(attachedProduct.price).toLocaleString("en-NG")}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                toast.success(`Opening customization flow for ${attachedProduct.title}`);
                              }}
                              className="mt-1 w-full rounded-lg bg-[#01454A] text-white py-1.5 text-[10px] font-bold hover:bg-[#01454A] transition cursor-pointer"
                            >
                              Customize Order
                            </button>
                          </div>
                        ) : (
                          msg.body
                        )}
                        <div className={`mt-1 flex items-center justify-end gap-1 text-[10px] ${isMine ? "text-black/50" : "text-[#7A6B44]/60"}`}>
                          {new Date(msg.created_at).toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" })}
                          {isMine && <Check className="h-3 w-3" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>

              {/* Composer */}
              <div className="border-t border-[#ECE6D6] p-3 relative bg-white">
                <div className="flex items-center gap-2 rounded-2xl border border-[#ECE6D6] bg-[#FAFAF8] px-4 py-2">
                  <button
                    type="button"
                    onClick={() => setShowCatalogModal((c) => !c)}
                    className="flex h-8 w-8 items-center justify-center rounded-xl border border-[#ECE6D6] bg-white text-[#7A6B44] hover:bg-[#F8F5ED] hover:text-black transition-all cursor-pointer"
                    title="Attach product snapshot"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                  <input
                    type="text"
                    id="vendor-chat-input"
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                    placeholder={`Message ${activeConv.other_party_name ?? "customer"}…`}
                    className="flex-1 bg-transparent text-sm text-[#1A1208] placeholder:text-[#7A6B44]/50 outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleSend}
                    disabled={!draft.trim() || sendMsg.isPending}
                    className="flex h-8 w-8 items-center justify-center rounded-xl text-black transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105"
                    style={{ background: `linear-gradient(135deg, ${C.gold} 0%, ${C.goldD} 100%)` }}
                    aria-label="Send message"
                  >
                    {sendMsg.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </button>
                </div>

                {/* Catalog Select Dropdown */}
                {showCatalogModal && (
                  <div className="absolute bottom-16 left-3 w-80 max-h-80 bg-white border border-[#ECE6D6] rounded-2xl shadow-xl z-10 overflow-y-auto p-3 space-y-2">
                    <div className="flex items-center justify-between pb-2 border-b border-[#ECE6D6]">
                      <span className="text-xs font-bold text-[#1A1208]">Attach Catalog Product</span>
                      <button
                        type="button"
                        onClick={() => setShowCatalogModal(false)}
                        className="text-[10px] font-bold text-[#7A6B44] hover:text-black"
                      >
                        Cancel
                      </button>
                    </div>
                    {catalogProducts.length === 0 ? (
                      <p className="text-xs text-[#7A6B44] text-center py-4">No products in your catalog.</p>
                    ) : (
                      <div className="space-y-1.5">
                        {catalogProducts.map((prod) => (
                          <button
                            key={prod.id}
                            type="button"
                            onClick={() => {
                              const payload = {
                                type: "product_attachment",
                                id: prod.id,
                                title: prod.title,
                                price: prod.price,
                                image_url: prod.image_url,
                                sku: prod.sku,
                              };
                              void sendMsg.mutateAsync({ body: JSON.stringify(payload) });
                              setShowCatalogModal(false);
                            }}
                            className="flex w-full items-center gap-2.5 rounded-xl p-2 hover:bg-[#FAFAF8] text-left border border-transparent hover:border-[#ECE6D6] transition"
                          >
                            {prod.image_url ? (
                              <div className="relative h-10 w-10 overflow-hidden rounded-lg bg-[#F8F5ED] flex-shrink-0">
                                <FashionistarImage
                                  src={prod.image_url}
                                  alt={prod.title}
                                  fill={true}
                                  objectFit="cover"
                                />
                              </div>
                            ) : (
                              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[#F8F5ED] border border-[#ECE6D6] text-[#FDA600]">
                                <ShoppingCart className="h-5 w-5" />
                              </div>
                            )}
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-bold text-[#1A1208] truncate leading-tight">{prod.title}</p>
                              <p className="text-[10px] text-[#7A6B44] mt-0.5">₦{Number(prod.price).toLocaleString("en-NG")}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

