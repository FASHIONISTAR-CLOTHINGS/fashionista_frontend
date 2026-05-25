"use client";

/**
 * vendor-extra-views.tsx
 *
 * Supplementary vendor views:
 *   - VendorNotificationsView  (/vendor/notifications)
 *   - VendorChatView           (/vendor/chat)
 *   - VendorSupportView        (/vendor/support)
 *
 * These views present premium, styled UI surfaces using the
 * Fashionistar brand palette (Forest Green, Gold, Cream, Milk).
 */

import Link from "next/link";
import { useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  Bell,
  BellOff,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  Headphones,
  MessageSquare,
  Package,
  RefreshCw,
  Send,
  Star,
  Ticket,
  TrendingUp,
  Wallet,
  X,
} from "lucide-react";

// ── Design Palette ─────────────────────────────────────────────────────────────
const C = {
  green:  "#1a2e14",
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
}: {
  eyebrow:     string;
  title:       string;
  description: string;
  icon:        React.ElementType;
}) {
  return (
    <div className="mb-8 flex items-start gap-4">
      <div
        className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl shadow-lg"
        style={{ background: `linear-gradient(135deg, ${C.green} 0%, #2d5016 100%)` }}
      >
        <Icon className="h-6 w-6 text-[#FDA600]" aria-hidden="true" />
      </div>
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.14em]" style={{ color: C.gold }}>{eyebrow}</p>
        <h1 className="mt-0.5 text-2xl font-bold" style={{ color: C.ink }}>{title}</h1>
        <p className="mt-1 text-sm" style={{ color: C.muted }}>{description}</p>
      </div>
    </div>
  );
}

// ── Notification Badge ────────────────────────────────────────────────────────
type NotifType = "order" | "payout" | "review" | "system";
interface VendorNotif {
  id:      string;
  type:    NotifType;
  title:   string;
  body:    string;
  time:    string;
  read:    boolean;
  href?:   string;
}

const NOTIF_ICON_MAP: Record<NotifType, { Icon: React.ElementType; color: string; bg: string }> = {
  order:  { Icon: Package,    color: "#1a2e14", bg: "#E8F5E0" },
  payout: { Icon: Wallet,     color: "#7c4700", bg: "#FFF3D1" },
  review: { Icon: Star,       color: "#6b46c1", bg: "#EDE9FE" },
  system: { Icon: AlertCircle,color: "#c0392b", bg: "#FDECEA" },
};

function NotifCard({ notif, onDismiss }: { notif: VendorNotif; onDismiss: (id: string) => void }) {
  const { Icon, color, bg } = NOTIF_ICON_MAP[notif.type];
  return (
    <div
      className={[
        "relative flex gap-4 rounded-2xl border p-4 transition-all duration-200",
        notif.read
          ? "border-[#ECE6D6] bg-white"
          : "border-[#FDA600]/30 bg-[#FFFBF0] shadow-sm",
      ].join(" ")}
    >
      {/* Icon */}
      <div
        className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl"
        style={{ background: bg }}
      >
        <Icon className="h-5 w-5" style={{ color }} aria-hidden="true" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={`text-sm font-semibold ${notif.read ? "text-[#1A1208]" : "text-[#0f1a0b]"}`}>
            {notif.title}
          </p>
          <button
            type="button"
            onClick={() => onDismiss(notif.id)}
            className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg text-[#7A6B44] hover:bg-[#F8F5ED] transition-colors"
            aria-label="Dismiss notification"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
        <p className="mt-0.5 text-sm text-[#7A6B44]">{notif.body}</p>
        <div className="mt-2 flex items-center gap-3">
          <span className="flex items-center gap-1 text-xs text-[#7A6B44]/70">
            <Clock className="h-3 w-3" />
            {notif.time}
          </span>
          {notif.href && (
            <Link
              href={notif.href}
              className="flex items-center gap-1 text-xs font-semibold hover:underline"
              style={{ color: C.gold }}
            >
              View <ArrowRight className="h-3 w-3" />
            </Link>
          )}
          {!notif.read && (
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

// ── Vendor Notifications View ─────────────────────────────────────────────────
const DEMO_NOTIFS: VendorNotif[] = [
  {
    id: "n1",
    type: "order",
    title: "New Order Received",
    body: "ORD-3821 for ₦85,000 was placed by a customer. Fulfillment required within 48h.",
    time: "2 minutes ago",
    read: false,
    href: "/vendor/orders",
  },
  {
    id: "n2",
    type: "payout",
    title: "Payout Processed",
    body: "₦125,000 has been successfully transferred to your registered bank account.",
    time: "1 hour ago",
    read: false,
    href: "/vendor/wallet",
  },
  {
    id: "n3",
    type: "review",
    title: "New 5-Star Review",
    body: "A customer left a 5-star review on your Silk Evening Gown. Keep up the excellent craftsmanship!",
    time: "3 hours ago",
    read: true,
    href: "/vendor/analytics",
  },
  {
    id: "n4",
    type: "system",
    title: "KYC Document Pending",
    body: "Your National ID verification is still under review. Payouts above ₦50,000 require full KYC.",
    time: "Yesterday",
    read: true,
    href: "/vendor/kyc",
  },
];

export function VendorNotificationsView() {
  const [notifs, setNotifs] = useState<VendorNotif[]>(DEMO_NOTIFS);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const displayed   = filter === "unread" ? notifs.filter((n) => !n.read) : notifs;
  const unreadCount = notifs.filter((n) => !n.read).length;

  const dismiss = (id: string) => setNotifs((prev) => prev.filter((n) => n.id !== id));
  const markAll = () => setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));

  return (
    <div className="space-y-6 py-2">
      <PageHero
        eyebrow="Activity"
        title="Notifications"
        description="Stay on top of orders, payouts, and customer reviews in real time."
        icon={Bell}
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
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={markAll}
            className="flex items-center gap-1.5 rounded-xl border border-[#ECE6D6] bg-white px-4 py-2 text-sm font-semibold text-[#7A6B44] transition hover:bg-[#F8F5ED]"
          >
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            Mark all read
          </button>
        )}
      </div>

      {/* List */}
      <div className="space-y-3">
        {displayed.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-3xl border border-[#ECE6D6] bg-white py-16 text-center">
            <BellOff className="h-10 w-10 text-[#ECE6D6]" />
            <p className="text-sm font-semibold text-[#7A6B44]">
              {filter === "unread" ? "All caught up!" : "No notifications yet"}
            </p>
          </div>
        ) : (
          displayed.map((n) => (
            <NotifCard key={n.id} notif={n} onDismiss={dismiss} />
          ))
        )}
      </div>
    </div>
  );
}

// ── Vendor Chat View ──────────────────────────────────────────────────────────

interface ChatConversation {
  id:        string;
  name:      string;
  avatar:    string;
  lastMsg:   string;
  time:      string;
  unread:    number;
  online:    boolean;
  orderId?:  string;
}

interface ChatMessage {
  id:        string;
  sender:    "vendor" | "client";
  text:      string;
  time:      string;
  read:      boolean;
}

const DEMO_CONVERSATIONS: ChatConversation[] = [
  {
    id: "c1", name: "Amaka Johnson", avatar: "AJ", lastMsg: "Can we adjust the sleeve length by 2 inches?",
    time: "2m", unread: 2, online: true, orderId: "ORD-3821",
  },
  {
    id: "c2", name: "Taiwo Adeleke", avatar: "TA", lastMsg: "The dress arrived beautifully, thank you!",
    time: "1h", unread: 0, online: false, orderId: "ORD-3750",
  },
  {
    id: "c3", name: "Ngozi Obi",     avatar: "NO", lastMsg: "Please confirm measurements before cutting.",
    time: "2h", unread: 1, online: true, orderId: "ORD-3790",
  },
];

const DEMO_MESSAGES: ChatMessage[] = [
  { id: "m1", sender: "client", text: "Hello! I placed an order for the custom evening gown.",       time: "10:02", read: true  },
  { id: "m2", sender: "vendor", text: "Hi Amaka! We received your order and are reviewing your measurements.", time: "10:04", read: true  },
  { id: "m3", sender: "client", text: "Great! Can we adjust the sleeve length by 2 inches?",         time: "10:06", read: true  },
  { id: "m4", sender: "client", text: "Also, I would prefer a deeper neckline if possible.",          time: "10:07", read: false },
];

export function VendorChatView() {
  const [activeConv, setActiveConv] = useState<ChatConversation>(DEMO_CONVERSATIONS[0]!);
  const [messages,   setMessages]   = useState<ChatMessage[]>(DEMO_MESSAGES);
  const [draft,      setDraft]      = useState("");
  const [showList,   setShowList]   = useState(true);

  const sendMessage = () => {
    const text = draft.trim();
    if (!text) return;
    setMessages((prev) => [
      ...prev,
      { id: `m${Date.now()}`, sender: "vendor", text, time: "Now", read: false },
    ]);
    setDraft("");
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      <div className="mb-4 flex-shrink-0">
        <PageHero
          eyebrow="Customer Communications"
          title="Messages"
          description="Real-time conversations with your buyers. Coordinate bespoke orders, measurements, and delivery."
          icon={MessageSquare}
        />
      </div>

      {/* Chat workspace */}
      <div className="flex flex-1 gap-0 overflow-hidden rounded-3xl border border-[#ECE6D6] bg-white shadow-sm">
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
            {DEMO_CONVERSATIONS.map((conv) => (
              <button
                key={conv.id}
                type="button"
                onClick={() => { setActiveConv(conv); setShowList(false); }}
                className={[
                  "flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors",
                  conv.id === activeConv.id ? "bg-[#F8F5ED]" : "hover:bg-[#FAFAF8]",
                ].join(" ")}
              >
                <div className="relative flex-shrink-0">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white"
                    style={{ background: `linear-gradient(135deg, ${C.green} 0%, #2d5016 100%)` }}
                  >
                    {conv.avatar}
                  </div>
                  {conv.online && (
                    <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-400" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between">
                    <p className="truncate text-sm font-semibold text-[#1A1208]">{conv.name}</p>
                    <span className="flex-shrink-0 text-[10px] text-[#7A6B44]/60">{conv.time}</span>
                  </div>
                  <p className="truncate text-xs text-[#7A6B44]">{conv.lastMsg}</p>
                </div>
                {conv.unread > 0 && (
                  <span
                    className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-black"
                    style={{ background: C.gold }}
                  >
                    {conv.unread}
                  </span>
                )}
              </button>
            ))}
          </div>
        </aside>

        {/* ── Message Thread ── */}
        <div
          className={[
            "flex flex-1 flex-col",
            !showList ? "flex" : "hidden lg:flex",
          ].join(" ")}
        >
          {/* Thread Header */}
          <div className="flex items-center gap-3 border-b border-[#ECE6D6] px-4 py-3">
            <button
              type="button"
              onClick={() => setShowList(true)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-[#7A6B44] hover:bg-[#F8F5ED] lg:hidden"
            >
              <ChevronRight className="h-4 w-4 rotate-180" />
            </button>
            <div
              className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-white flex-shrink-0"
              style={{ background: `linear-gradient(135deg, ${C.green} 0%, #2d5016 100%)` }}
            >
              {activeConv.avatar}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[#1A1208]">{activeConv.name}</p>
              <p className="text-xs text-[#7A6B44]">
                {activeConv.orderId && <span className="text-[#FDA600] font-medium">{activeConv.orderId} · </span>}
                {activeConv.online ? "Active now" : "Offline"}
              </p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === "vendor" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={[
                    "max-w-[70%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                    msg.sender === "vendor"
                      ? "text-black"
                      : "border border-[#ECE6D6] bg-[#F8F5ED] text-[#1A1208]",
                  ].join(" ")}
                  style={msg.sender === "vendor" ? { background: `linear-gradient(135deg, ${C.gold} 0%, ${C.goldD} 100%)` } : undefined}
                >
                  {msg.text}
                  <div className={`mt-1 flex items-center justify-end gap-1 text-[10px] ${msg.sender === "vendor" ? "text-black/50" : "text-[#7A6B44]/60"}`}>
                    {msg.time}
                    {msg.sender === "vendor" && (
                      <Check className={`h-3 w-3 ${msg.read ? "text-black/40" : ""}`} />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Composer */}
          <div className="border-t border-[#ECE6D6] p-3">
            <div className="flex items-center gap-2 rounded-2xl border border-[#ECE6D6] bg-[#FAFAF8] px-4 py-2">
              <input
                type="text"
                id="vendor-chat-input"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }}}
                placeholder={`Message ${activeConv.name}…`}
                className="flex-1 bg-transparent text-sm text-[#1A1208] placeholder:text-[#7A6B44]/50 outline-none"
              />
              <button
                type="button"
                onClick={sendMessage}
                disabled={!draft.trim()}
                className="flex h-8 w-8 items-center justify-center rounded-xl text-black transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105"
                style={{ background: `linear-gradient(135deg, ${C.gold} 0%, ${C.goldD} 100%)` }}
                aria-label="Send message"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Vendor Support View ───────────────────────────────────────────────────────

type TicketStatus = "open" | "in_progress" | "resolved" | "escalated";
type TicketPriority = "low" | "medium" | "high";

interface SupportTicket {
  id:       string;
  subject:  string;
  status:   TicketStatus;
  priority: TicketPriority;
  created:  string;
  updated:  string;
  excerpt:  string;
}

const TICKET_STATUS_CONFIG: Record<TicketStatus, { label: string; color: string; bg: string }> = {
  open:        { label: "Open",        color: "#1a2e14", bg: "#E8F5E0"  },
  in_progress: { label: "In Progress", color: "#7c4700", bg: "#FFF3D1"  },
  resolved:    { label: "Resolved",    color: "#065f46", bg: "#D1FAE5"  },
  escalated:   { label: "Escalated",   color: "#c0392b", bg: "#FDECEA"  },
};

const PRIORITY_CONFIG: Record<TicketPriority, { label: string; color: string }> = {
  low:    { label: "Low",    color: "#7A6B44" },
  medium: { label: "Medium", color: "#c97c00" },
  high:   { label: "High",   color: "#c0392b" },
};

const DEMO_TICKETS: SupportTicket[] = [
  {
    id: "TKT-1041", subject: "Order ORD-3821 — buyer claims wrong size delivered",
    status: "open", priority: "high",
    created: "2026-05-25", updated: "1 hour ago",
    excerpt: "Buyer says the dress was delivered in UK 12 instead of UK 10 as ordered. Requesting refund or replacement.",
  },
  {
    id: "TKT-1038", subject: "Payout not received after 3 business days",
    status: "in_progress", priority: "medium",
    created: "2026-05-22", updated: "Yesterday",
    excerpt: "Transfer of ₦85,000 initiated on 2026-05-22 has not reflected in my GTB account.",
  },
  {
    id: "TKT-1031", subject: "Product listing rejected — please review",
    status: "resolved", priority: "low",
    created: "2026-05-18", updated: "2026-05-19",
    excerpt: "Bridal gown listing was rejected due to missing size chart. Issue resolved after resubmission.",
  },
  {
    id: "TKT-1028", subject: "Customer abusive message — request for action",
    status: "escalated", priority: "high",
    created: "2026-05-16", updated: "2026-05-17",
    excerpt: "A buyer sent threatening messages via the chat system. Case escalated to Trust & Safety team.",
  },
];

function TicketRow({ ticket }: { ticket: SupportTicket }) {
  const st  = TICKET_STATUS_CONFIG[ticket.status];
  const pri = PRIORITY_CONFIG[ticket.priority];

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-[#ECE6D6] bg-white p-5 transition hover:shadow-md sm:flex-row sm:items-center">
      {/* Icon */}
      <div
        className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl"
        style={{ background: st.bg }}
      >
        <Ticket className="h-5 w-5" style={{ color: st.color }} aria-hidden="true" />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-start gap-2">
          <p className="text-sm font-semibold text-[#1A1208]">{ticket.subject}</p>
        </div>
        <p className="mt-1 text-xs text-[#7A6B44]">{ticket.excerpt}</p>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-[#7A6B44]/70">
          <span>{ticket.id}</span>
          <span>·</span>
          <span>Opened {ticket.created}</span>
          <span>·</span>
          <Clock className="h-3 w-3 inline" /> Updated {ticket.updated}
        </div>
      </div>

      {/* Badges */}
      <div className="flex flex-shrink-0 flex-col items-end gap-2">
        <span
          className="inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide"
          style={{ background: st.bg, color: st.color }}
        >
          {st.label}
        </span>
        <span className="text-[11px] font-semibold" style={{ color: pri.color }}>
          {pri.label} priority
        </span>
      </div>
    </div>
  );
}

export function VendorSupportView() {
  const [activeTab, setActiveTab] = useState<"tickets" | "new">("tickets");

  return (
    <div className="space-y-6 py-2">
      <PageHero
        eyebrow="Help Center"
        title="Support Tickets"
        description="Manage disputes, get help with payouts, and communicate with Fashionistar staff."
        icon={Headphones}
      />

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[#ECE6D6]">
        {([
          { key: "tickets", label: "My Tickets", Icon: Ticket },
          { key: "new",     label: "New Ticket", Icon: RefreshCw },
        ] as const).map(({ key, label, Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => setActiveTab(key)}
            className={[
              "flex items-center gap-1.5 px-4 py-2 text-sm font-semibold border-b-2 -mb-px transition-colors",
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
        <div className="space-y-3">
          {/* Stats Strip */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {(["open", "in_progress", "resolved", "escalated"] as TicketStatus[]).map((s) => {
              const cfg   = TICKET_STATUS_CONFIG[s];
              const count = DEMO_TICKETS.filter((t) => t.status === s).length;
              return (
                <div
                  key={s}
                  className="rounded-2xl p-4 text-center"
                  style={{ background: cfg.bg }}
                >
                  <p className="text-2xl font-bold" style={{ color: cfg.color }}>{count}</p>
                  <p className="mt-0.5 text-xs font-semibold uppercase tracking-wide" style={{ color: cfg.color }}>
                    {cfg.label}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Ticket list */}
          {DEMO_TICKETS.map((t) => <TicketRow key={t.id} ticket={t} />)}
        </div>
      ) : (
        /* New Ticket Form */
        <form
          className="rounded-3xl border border-[#ECE6D6] bg-white p-6 space-y-5"
          onSubmit={(e) => { e.preventDefault(); setActiveTab("tickets"); }}
        >
          <div className="space-y-1.5">
            <label htmlFor="ticket-subject" className="block text-sm font-semibold text-[#1A1208]">Subject *</label>
            <input
              id="ticket-subject"
              type="text"
              required
              placeholder="Brief summary of the issue…"
              className="w-full rounded-xl border border-[#ECE6D6] bg-[#FAFAF8] px-4 py-2.5 text-sm text-[#1A1208] placeholder:text-[#7A6B44]/50 outline-none focus:border-[#FDA600] focus:ring-2 focus:ring-[#FDA600]/20 transition"
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="ticket-priority" className="block text-sm font-semibold text-[#1A1208]">Priority</label>
            <select
              id="ticket-priority"
              className="w-full rounded-xl border border-[#ECE6D6] bg-[#FAFAF8] px-4 py-2.5 text-sm text-[#1A1208] outline-none focus:border-[#FDA600] transition"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label htmlFor="ticket-body" className="block text-sm font-semibold text-[#1A1208]">Description *</label>
            <textarea
              id="ticket-body"
              rows={5}
              required
              placeholder="Describe the issue in detail — include order IDs, dates, and any supporting context…"
              className="w-full rounded-xl border border-[#ECE6D6] bg-[#FAFAF8] px-4 py-2.5 text-sm text-[#1A1208] placeholder:text-[#7A6B44]/50 outline-none focus:border-[#FDA600] focus:ring-2 focus:ring-[#FDA600]/20 transition resize-none"
            />
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-bold text-black transition-all hover:scale-105 hover:shadow-md"
              style={{ background: `linear-gradient(135deg, ${C.gold} 0%, ${C.goldD} 100%)` }}
            >
              <TrendingUp className="h-4 w-4" />
              Submit Ticket
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
