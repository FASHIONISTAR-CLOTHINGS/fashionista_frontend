"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Bell,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  Clock,
  ExternalLink,
  FileCheck2,
  Heart,
  Loader2,
  MapPin,
  MessageSquarePlus,
  Package,
  PackageCheck,
  Palette,
  PackageSearch,
  Plus,
  RefreshCw,
  Ruler,
  ShieldCheck,
  Sparkles,
  TicketCheck,
  TrendingUp,
  UploadCloud,
  Wallet,
  X,
  ZapIcon,
} from "lucide-react";

import { Transactions } from "@/features/account/components";
import { LoyaltyPointsWidget } from "@/features/account/components/LoyaltyPointsWidget";
import {
  useClientDashboard,
  useClientProfile,
  useUpdateClientProfile,
} from "@/features/client/hooks/use-client-profile";
import { useClientWalletBalance } from "@/features/client/hooks/use-client-wallet";
import { useMarkAllNotificationsRead, useNotifications } from "@/features/notification/hooks/use-notification";
import type { Notification as GlobalNotification } from "@/features/notification/types/notification.types";
import { clientApi } from "@/features/client/api/client.api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  ClientAddress,
  ClientAddressCreatePayload,
  ClientOrder,
  ClientProfileUpdatePayload,
  Country,
  SupportTicket,
  SupportTicketCreatePayload,
  TicketCategory,
} from "@/features/client/types/client.types";

// ── Design Tokens ──────────────────────────────────────────────────────────────
// (Colors applied inline for direct reference across components)

// ── Utility ────────────────────────────────────────────────────────────────────
function fmtNgn(amount: number): string {
  return `₦${amount.toLocaleString("en-NG", { minimumFractionDigits: 0 })}`;
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; bg: string; text: string }> = {
    pending_payment:    { label: "Pending Payment",  bg: "#FEF3C7", text: "#92400E" },
    payment_confirmed:  { label: "Confirmed",        bg: "#DCFCE7", text: "#166534" },
    processing:         { label: "Processing",       bg: "#DBEAFE", text: "#1E40AF" },
    shipped:            { label: "Shipped",          bg: "#EDE9FE", text: "#6D28D9" },
    out_for_delivery:   { label: "Out for Delivery", bg: "#FEE2E2", text: "#991B1B" },
    delivered:          { label: "Delivered",        bg: "#D1FAE5", text: "#065F46" },
    completed:          { label: "Completed",        bg: "#D1FAE5", text: "#065F46" },
    cancelled:          { label: "Cancelled",        bg: "#F3F4F6", text: "#6B7280" },
    refunded:           { label: "Refunded",         bg: "#FEF9C3", text: "#854D0E" },
    disputed:           { label: "Disputed",         bg: "#FEE2E2", text: "#991B1B" },
    // Custom order statuses
    draft:              { label: "Draft",            bg: "#F3F4F6", text: "#6B7280" },
    submitted:          { label: "Submitted",        bg: "#DBEAFE", text: "#1E40AF" },
    approved:           { label: "Approved",         bg: "#D1FAE5", text: "#065F46" },
    in_production:      { label: "In Production",    bg: "#EDE9FE", text: "#6D28D9" },
  };
  const style = map[status] ?? { label: status, bg: "#F3F4F6", text: "#6B7280" };
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
      style={{ backgroundColor: style.bg, color: style.text }}
    >
      {style.label}
    </span>
  );
}

// ── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({
  title, value, hint, icon: Icon, accent = false, trend,
}: {
  title: string;
  value: string;
  hint?: string;
  icon?: React.ElementType;
  accent?: boolean;
  trend?: number;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-[24px] p-6 shadow-sm transition hover:shadow-md ${
        accent
          ? "bg-gradient-to-br from-[#01454A] to-[#012d31] text-white"
          : "bg-white text-black"
      }`}
    >
      {accent && (
        <div className="pointer-events-none absolute -right-6 -top-6 h-32 w-32 rounded-full bg-white/5" />
      )}
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p
            className={`text-xs font-bold uppercase tracking-[0.18em] ${
              accent ? "text-white/60" : "text-[#7A6B44]"
            }`}
          >
            {title}
          </p>
          <p
            className={`mt-2 font-bon_foyage text-3xl leading-none ${
              accent ? "text-white" : "text-black"
            }`}
          >
            {value}
          </p>
          {hint && (
            <p className={`mt-1.5 text-xs leading-5 ${accent ? "text-white/50" : "text-[#5A6465]"}`}>
              {hint}
            </p>
          )}
        </div>
        {Icon && (
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
              accent ? "bg-white/10" : "bg-[#F4F3EC]"
            }`}
          >
            <Icon className={`h-5 w-5 ${accent ? "text-[#FDA600]" : "text-[#01454A]"}`} />
          </div>
        )}
      </div>
      {trend !== undefined && (
        <div className="mt-3 flex items-center gap-1">
          <TrendingUp className={`h-3.5 w-3.5 ${trend >= 0 ? "text-emerald-500" : "text-red-400"}`} />
          <span className={`text-xs font-semibold ${trend >= 0 ? "text-emerald-600" : "text-red-500"}`}>
            {trend >= 0 ? "+" : ""}{trend}% this month
          </span>
        </div>
      )}
    </div>
  );
}

// ── Mini Order Row ─────────────────────────────────────────────────────────────
function MiniOrderRow({ order }: { order: ClientOrder }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-[16px] bg-[#F8F5ED] px-5 py-3.5 transition hover:bg-[#ECE6D6]">
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-black">
          {order.vendor__store_name || "Order"}
        </p>
        <p className="text-xs text-[#5A6465]">
          {order.order_number} · {new Date(order.created_at).toLocaleDateString("en-NG", { day: "numeric", month: "short" })}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <span className="hidden text-sm font-semibold text-black sm:block">
          {fmtNgn(order.total_amount)}
        </span>
        <StatusBadge status={order.status} />
        <Link href={`/client/dashboard/orders?id=${order.id}`}>
          <ChevronRight className="h-4 w-4 text-[#A89A7A]" />
        </Link>
      </div>
    </div>
  );
}

// ── Field Components ──────────────────────────────────────────────────────────
function FieldLabel({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="text-sm font-semibold text-black">
      {children}
    </label>
  );
}

function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`h-14 w-full rounded-[18px] border border-[#D9D9D9] bg-white px-4 text-black outline-none transition focus:border-[#FDA600] focus:ring-2 focus:ring-[#FDA600]/20 ${props.className ?? ""}`}
    />
  );
}

function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`min-h-[120px] w-full rounded-[18px] border border-[#D9D9D9] bg-white px-4 py-4 text-black outline-none transition focus:border-[#FDA600] focus:ring-2 focus:ring-[#FDA600]/20 ${props.className ?? ""}`}
    />
  );
}

function SelectInput({
  value, onChange, children, id,
}: {
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
  id?: string;
}) {
  return (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-14 w-full rounded-[18px] border border-[#D9D9D9] bg-white px-4 text-black outline-none transition focus:border-[#FDA600] focus:ring-2 focus:ring-[#FDA600]/20"
    >
      {children}
    </select>
  );
}

function ActionBtn({
  children, onClick, variant = "primary", disabled, loading,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "ghost";
  disabled?: boolean;
  loading?: boolean;
}) {
  const base = "inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition disabled:opacity-60 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-[#FDA600] text-black hover:bg-[#f28705] shadow-sm",
    secondary: "bg-[#01454A] text-white hover:bg-[#012d31]",
    ghost: "border border-[#D9D9D9] text-[#5A6465] hover:bg-[#F8F5ED] hover:text-black",
  };
  return (
    <button type="button" onClick={onClick} disabled={disabled || loading} className={`${base} ${variants[variant]}`}>
      {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
      {children}
    </button>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  DASHBOARD VIEW
// ══════════════════════════════════════════════════════════════════════════════

export function ClientDashboardView() {
  const { data: dashboard, isLoading } = useClientDashboard();

  // Live recent orders (last 5)
  const { data: recentOrders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ["client-orders-recent"],
    queryFn: () => clientApi.getOrders({ limit: 5 }),
    staleTime: 30_000,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-[180px] animate-pulse rounded-[32px] bg-white" />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-[140px] animate-pulse rounded-[24px] bg-white" />
          ))}
        </div>
      </div>
    );
  }

  const analytics = dashboard?.analytics;

  return (
    <div className="space-y-6">
      {/* ── Hero banner ────────────────────────────────────────────────── */}
      <section
        data-testid="client-dashboard-hero"
        className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#01454A] via-[#01454A] to-[#012d31] p-8 md:p-10"
      >
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/5" />
        <div className="pointer-events-none absolute bottom-0 right-0 h-32 w-32 rounded-tl-full bg-[#FDA600]/10" />
        <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#FDA600]">
              Fashionistar Client
            </p>
            <h1
              data-testid="client-dashboard-welcome"
              className="mt-2 font-bon_foyage text-4xl leading-none text-white md:text-5xl"
            >
              Welcome back
            </h1>
            <p className="mt-3 max-w-lg text-sm leading-6 text-white/60">
              Your personal fashion command centre. Track orders, manage custom designs, and explore new styles.
            </p>
            {!dashboard?.profile.is_profile_complete && (
              <div className="mt-4 flex items-center gap-2 rounded-xl bg-[#FDA600]/15 px-4 py-2.5">
                <AlertCircle className="h-4 w-4 shrink-0 text-[#FDA600]" />
                <span className="text-xs font-semibold text-white/90">
                  Complete your profile to unlock personalised recommendations
                </span>
                <Link href="/client/dashboard/account-details" className="ml-auto">
                  <ArrowRight className="h-3.5 w-3.5 text-[#FDA600]" />
                </Link>
              </div>
            )}
          </div>
          <div className="flex shrink-0 flex-col gap-3 sm:flex-row md:flex-col">
            <Link
              href="/client/dashboard/custom-orders/new"
              className="inline-flex items-center gap-2 rounded-full bg-[#FDA600] px-5 py-2.5 text-sm font-semibold text-black shadow-lg transition hover:bg-[#f28705]"
            >
              <Palette className="h-4 w-4" />
              Custom Order
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              <Sparkles className="h-4 w-4" />
              Browse Styles
            </Link>
          </div>
        </div>
      </section>

      {/* ── 6-card stats grid ──────────────────────────────────────────── */}
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <StatCard
          title="Total Orders"
          value={String(analytics?.total_orders ?? 0)}
          hint="All orders across your account"
          icon={Package}
          trend={5}
        />
        <StatCard
          title="Total Spent"
          value={fmtNgn(analytics?.total_spent_ngn ?? 0)}
          hint="Lifetime spend on Fashionistar"
          icon={TrendingUp}
          accent
        />
        <StatCard
          title="Active Orders"
          value={String(analytics?.active_orders ?? 0)}
          hint="Currently being processed"
          icon={ZapIcon}
        />
        <StatCard
          title="Pending Payment"
          value={String(analytics?.pending_orders ?? 0)}
          hint="Awaiting your payment"
          icon={Clock}
        />
        <StatCard
          title="Completed"
          value={String(analytics?.completed_orders ?? 0)}
          hint="Successfully delivered orders"
          icon={PackageCheck}
        />
        <StatCard
          title="Wishlist Items"
          value={String(analytics?.wishlist_count ?? 0)}
          hint="Products saved for later"
          icon={Heart}
        />
      </section>

      {/* ── Loyalty + Measurement strip ───────────────────────────────── */}
      <div className="grid gap-4 lg:grid-cols-2">
        <LoyaltyPointsWidget className="" />
        <div className="flex items-center gap-4 rounded-[24px] bg-white p-6 shadow-sm">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#F4F3EC]">
            <Ruler className="h-6 w-6 text-[#01454A]" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#7A6B44]">Measurements</p>
            {dashboard?.measurement_snapshot?.chest_cm ? (
              <p className="mt-1 text-sm text-[#5A6465]">
                Chest {dashboard.measurement_snapshot.chest_cm}cm · Waist {dashboard.measurement_snapshot.waist_cm}cm
              </p>
            ) : (
              <p className="mt-1 text-sm text-[#5A6465]">No measurements saved yet</p>
            )}
          </div>
          <Link href="/client/dashboard/settings#measurements" className="shrink-0">
            <ArrowUpRight className="h-4 w-4 text-[#A89A7A]" />
          </Link>
        </div>
      </div>

      {/* ── Recent Orders + Quick Links ───────────────────────────────── */}
      <div className="grid gap-4 lg:grid-cols-[1.5fr_0.5fr]">
        {/* Recent Orders */}
        <div className="rounded-[28px] bg-white p-6 shadow-sm md:p-8">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <BarChart3 className="h-5 w-5 text-[#FDA600]" />
              <h2 className="text-base font-semibold text-black">Recent Orders</h2>
            </div>
            <Link
              href="/client/dashboard/orders"
              className="flex items-center gap-1 text-xs font-semibold text-[#01454A] hover:underline"
            >
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {ordersLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-14 animate-pulse rounded-[16px] bg-[#F4F3EC]" />
              ))}
            </div>
          ) : recentOrders.length > 0 ? (
            <div className="space-y-2">
              {recentOrders.map((order) => (
                <MiniOrderRow key={order.id} order={order} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <Package className="h-10 w-10 text-[#D9D9D9]" />
              <p className="text-sm text-[#5A6465]">No orders yet.</p>
              <Link
                href="/categories"
                className="inline-flex items-center gap-1.5 rounded-full bg-[#FDA600] px-4 py-2 text-xs font-semibold text-black"
              >
                <Sparkles className="h-3 w-3" /> Browse styles
              </Link>
            </div>
          )}
        </div>

        {/* Quick Actions column */}
        <div className="rounded-[28px] bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-[0.15em] text-[#7A6B44]">
            Quick Actions
          </h2>
          <div className="space-y-2">
            {[
              { href: "/client/dashboard/custom-orders/new", label: "Start Custom Order", Icon: Palette },
              { href: "/client/dashboard/orders/track-order", label: "Track Order", Icon: PackageSearch },
              { href: "/client/dashboard/wallet", label: "My Wallet", Icon: Wallet },
              { href: "/client/dashboard/wishlist", label: "My Wishlist", Icon: Heart },
              { href: "/client/dashboard/address", label: "Manage Addresses", Icon: MapPin },
            ].map(({ href, label, Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center justify-between rounded-xl bg-[#F8F5ED] px-4 py-3 text-sm font-medium text-black transition hover:bg-[#EDE7D9]"
              >
                <span className="flex items-center gap-2.5">
                  <Icon className="h-3.5 w-3.5 text-[#FDA600]" />
                  {label}
                </span>
                <ChevronRight className="h-3.5 w-3.5 text-[#A89A7A]" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  ORDERS VIEW  (live API, not mock)
// ══════════════════════════════════════════════════════════════════════════════

export function ClientOrdersView() {
  const [statusFilter, setStatusFilter] = useState("");
  const { data: orders = [], isLoading, refetch: refetchOrders } = useQuery({
    queryKey: ["client-orders", statusFilter],
    queryFn: () => clientApi.getOrders(statusFilter ? { status: statusFilter } : undefined),
    staleTime: 30_000,
  });

  const STATUS_FILTERS = [
    { value: "", label: "All Orders" },
    { value: "pending_payment", label: "Pending Payment" },
    { value: "processing", label: "Processing" },
    { value: "shipped", label: "Shipped" },
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 data-testid="client-orders-heading" className="font-bon_foyage text-4xl text-black">My Orders</h1>
          <p className="mt-1 text-sm text-[#5A6465]">{orders.length} order{orders.length !== 1 ? "s" : ""} found</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-[#D9D9D9] bg-white px-3 py-2 text-sm font-medium text-black outline-none"
          >
            {STATUS_FILTERS.map((f) => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => void refetchOrders()}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#D9D9D9] bg-white text-[#5A6465] transition hover:text-black"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-[20px] bg-white" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-[32px] bg-white py-16 text-center shadow-sm">
          <Package className="h-14 w-14 text-[#D9D9D9]" />
          <div>
            <p className="text-base font-semibold text-black">No orders yet</p>
            <p className="mt-1 text-sm text-[#5A6465]">Start shopping to see your orders here</p>
          </div>
          <Link
            href="/categories"
            className="inline-flex items-center gap-2 rounded-full bg-[#FDA600] px-6 py-3 text-sm font-semibold text-black"
          >
            <Sparkles className="h-4 w-4" /> Browse Styles
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-[28px] bg-white shadow-sm">
          {/* Table header */}
          <div className="hidden grid-cols-[2fr_1.5fr_1fr_1fr_1fr] gap-4 bg-[#F8F5ED] px-6 py-4 text-[11px] font-bold uppercase tracking-[0.15em] text-[#7A6B44] md:grid">
            <span>Vendor / Order</span>
            <span>Date</span>
            <span>Amount</span>
            <span>Status</span>
            <span></span>
          </div>
          <div className="divide-y divide-[#F4F3EC]">
            {orders.map((order) => (
              <div
                key={order.id}
                className="grid items-center gap-4 px-6 py-5 transition hover:bg-[#FFFDF5] md:grid-cols-[2fr_1.5fr_1fr_1fr_1fr]"
              >
                {/* Vendor + order number */}
                <div>
                  <p className="font-semibold text-black">{order.vendor__store_name || "—"}</p>
                  <p className="text-xs text-[#5A6465]">{order.order_number}</p>
                </div>
                {/* Date */}
                <p className="text-sm text-[#5A6465]">
                  {new Date(order.created_at).toLocaleDateString("en-NG", {
                    day: "numeric", month: "short", year: "numeric",
                  })}
                </p>
                {/* Amount */}
                <p className="font-semibold text-black">{fmtNgn(order.total_amount)}</p>
                {/* Status */}
                <StatusBadge status={order.status} />
                {/* Action */}
                <div className="flex justify-end">
                  {order.tracking_number && (
                    <Link
                      href={`/client/dashboard/orders/track-order?order=${order.order_number}`}
                      className="flex items-center gap-1 text-xs font-semibold text-[#01454A] hover:underline"
                    >
                      Track <ExternalLink className="h-3 w-3" />
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  ADDRESS VIEW  (with add modal + Countries API)
// ══════════════════════════════════════════════════════════════════════════════

function AddressCard({
  address,
  onDelete,
  onSetDefault,
}: {
  address: ClientAddress;
  onDelete: (id: string) => void;
  onSetDefault: (id: string) => void;
}) {
  return (
    <div className={`relative rounded-[24px] border p-6 shadow-sm transition hover:shadow-md ${
      address.is_default ? "border-[#FDA600] bg-[#FFFDF5]" : "border-[#ECE6D6] bg-white"
    }`}>
      {address.is_default && (
        <span className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-[#FDA600] px-2.5 py-0.5 text-[10px] font-bold text-black">
          <CheckCircle2 className="h-3 w-3" /> Default
        </span>
      )}
      <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#7A6B44]">{address.label}</p>
      <h2 className="mt-2 text-base font-semibold text-black">{address.full_name}</h2>
      <p className="mt-2 text-sm leading-6 text-[#5A6465]">
        {address.street_address}, {address.city}, {address.state}, {address.country}{" "}
        {address.postal_code}
      </p>
      <p className="mt-1 text-sm text-[#5A6465]">{address.phone}</p>
      <div className="mt-4 flex items-center gap-3">
        {!address.is_default && (
          <button
            type="button"
            onClick={() => onSetDefault(address.id)}
            className="text-xs font-semibold text-[#01454A] hover:underline"
          >
            Set as default
          </button>
        )}
        <button
          type="button"
          onClick={() => onDelete(address.id)}
          className="ml-auto text-xs font-semibold text-red-400 hover:text-red-600"
        >
          Remove
        </button>
      </div>
    </div>
  );
}

function AddAddressModal({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (payload: ClientAddressCreatePayload) => Promise<void>;
}) {
  const { data: countries = [] } = useQuery<Country[]>({
    queryKey: ["countries"],
    queryFn: () => clientApi.getCountries(),
    staleTime: 3_600_000,
  });

  const [form, setForm] = useState<ClientAddressCreatePayload>({
    label: "Home",
    full_name: "",
    phone: "",
    street_address: "",
    city: "",
    state: "",
    country: "Nigeria",
    postal_code: "",
    is_default: false,
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(form);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg overflow-hidden rounded-[32px] bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#ECE6D6] px-7 py-5">
          <h2 className="text-lg font-semibold text-black">Add New Address</h2>
          <button type="button" onClick={onClose} className="rounded-full p-1.5 hover:bg-[#F4F3EC]">
            <X className="h-4 w-4 text-[#5A6465]" />
          </button>
        </div>
        <div className="max-h-[65vh] overflow-y-auto px-7 py-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <FieldLabel htmlFor="addr-label">Label</FieldLabel>
              <SelectInput id="addr-label" value={form.label} onChange={(v) => setForm((f) => ({ ...f, label: v }))}>
                {["Home", "Work", "Other"].map((l) => <option key={l} value={l}>{l}</option>)}
              </SelectInput>
            </div>
            <div>
              <FieldLabel htmlFor="addr-full-name">Full Name</FieldLabel>
              <TextInput id="addr-full-name" value={form.full_name} onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))} placeholder="Oluwaseun Adebayo" />
            </div>
            <div>
              <FieldLabel htmlFor="addr-phone">Phone</FieldLabel>
              <TextInput id="addr-phone" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} placeholder="+234 800 000 0000" />
            </div>
            <div className="sm:col-span-2">
              <FieldLabel htmlFor="addr-street">Street Address</FieldLabel>
              <TextInput id="addr-street" value={form.street_address} onChange={(e) => setForm((f) => ({ ...f, street_address: e.target.value }))} placeholder="15 Bode Thomas Street" />
            </div>
            <div>
              <FieldLabel htmlFor="addr-city">City</FieldLabel>
              <TextInput id="addr-city" value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} placeholder="Lagos" />
            </div>
            <div>
              <FieldLabel htmlFor="addr-state">State</FieldLabel>
              <TextInput id="addr-state" value={form.state} onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))} placeholder="Lagos State" />
            </div>
            <div>
              <FieldLabel htmlFor="addr-country">Country</FieldLabel>
              {countries.length > 0 ? (
                <SelectInput id="addr-country" value={form.country ?? "Nigeria"} onChange={(v) => setForm((f) => ({ ...f, country: v }))}>
                  {countries.map((c) => <option key={c.code} value={c.name}>{c.name}</option>)}
                </SelectInput>
              ) : (
                <TextInput id="addr-country" value={form.country ?? ""} onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))} placeholder="Nigeria" />
              )}
            </div>
            <div>
              <FieldLabel htmlFor="addr-postal">Postal Code</FieldLabel>
              <TextInput id="addr-postal" value={form.postal_code ?? ""} onChange={(e) => setForm((f) => ({ ...f, postal_code: e.target.value }))} placeholder="100001" />
            </div>
            <div className="sm:col-span-2 flex items-center gap-3">
              <input
                type="checkbox"
                id="addr-default"
                checked={!!form.is_default}
                onChange={(e) => setForm((f) => ({ ...f, is_default: e.target.checked }))}
                className="h-4 w-4 accent-[#FDA600]"
              />
              <label htmlFor="addr-default" className="text-sm font-medium text-black">Set as default shipping address</label>
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-3 border-t border-[#ECE6D6] px-7 py-5">
          <ActionBtn variant="ghost" onClick={onClose}>Cancel</ActionBtn>
          <ActionBtn variant="primary" onClick={handleSave} loading={saving} disabled={!form.full_name || !form.street_address}>
            Save Address
          </ActionBtn>
        </div>
      </div>
    </div>
  );
}

export function ClientAddressView() {
  const { data: profile } = useClientProfile();
  const [showModal, setShowModal] = useState(false);
  const queryClient = useQueryClient();

  const addresses: ClientAddress[] = (profile?.addresses ?? []) as ClientAddress[];

  const handleAddAddress = async (payload: ClientAddressCreatePayload) => {
    await clientApi.addAddress(payload);
    await queryClient.invalidateQueries({ queryKey: ["client", "profile"] });
  };

  const handleDelete = async (id: string) => {
    await clientApi.deleteAddress(id);
    await queryClient.invalidateQueries({ queryKey: ["client", "profile"] });
  };

  const handleSetDefault = async (id: string) => {
    await clientApi.setDefaultAddress(id);
    await queryClient.invalidateQueries({ queryKey: ["client", "profile"] });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bon_foyage text-4xl text-black">My Addresses</h1>
          <p className="mt-1 text-sm text-[#5A6465]">{addresses.length} saved address{addresses.length !== 1 ? "es" : ""}</p>
        </div>
        <ActionBtn variant="primary" onClick={() => setShowModal(true)}>
          <Plus className="h-4 w-4" /> Add Address
        </ActionBtn>
      </div>

      {addresses.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {addresses.map((address) => (
            <AddressCard
              key={address.id}
              address={address}
              onDelete={handleDelete}
              onSetDefault={handleSetDefault}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 rounded-[32px] bg-white py-16 text-center shadow-sm">
          <MapPin className="h-14 w-14 text-[#D9D9D9]" />
          <div>
            <p className="text-base font-semibold text-black">No addresses saved yet</p>
            <p className="mt-1 text-sm text-[#5A6465]">Add an address for faster checkout</p>
          </div>
          <ActionBtn variant="primary" onClick={() => setShowModal(true)}>
            <Plus className="h-4 w-4" /> Add First Address
          </ActionBtn>
        </div>
      )}

      {showModal && (
        <AddAddressModal onClose={() => setShowModal(false)} onSave={handleAddAddress} />
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  ACCOUNT DETAILS VIEW
// ══════════════════════════════════════════════════════════════════════════════

export function ClientAccountDetailsView() {
  const { data: profile } = useClientProfile();
  const updateProfile = useUpdateClientProfile();
  const [form, setForm] = useState<ClientProfileUpdatePayload>({
    bio: "",
    default_shipping_address: "",
    state: "",
    country: "",
    preferred_size: "",
    style_preferences: [],
    favourite_colours: [],
    email_notifications_enabled: true,
    sms_notifications_enabled: true,
  });

  useEffect(() => {
    if (!profile) return;
    setForm({
      bio: profile.bio || "",
      default_shipping_address: profile.default_shipping_address || "",
      state: profile.state || "",
      country: profile.country || "",
      preferred_size: profile.preferred_size || "",
      style_preferences: profile.style_preferences || [],
      favourite_colours: profile.favourite_colours || [],
      email_notifications_enabled: profile.email_notifications_enabled,
      sms_notifications_enabled: profile.sms_notifications_enabled,
    });
  }, [profile]);

  const stylePreferencesText = useMemo(() => (form.style_preferences ?? []).join(", "), [form.style_preferences]);
  const colourText = useMemo(() => (form.favourite_colours ?? []).join(", "), [form.favourite_colours]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await updateProfile.mutateAsync(form);
  };

  const SIZE_OPTS = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-bon_foyage text-4xl text-black">Account Details</h1>
        <p className="mt-1 text-sm text-[#5A6465]">
          Keep your profile up to date for personalised recommendations.
        </p>
      </div>

      <form
        onSubmit={onSubmit}
        className="grid gap-5 rounded-[28px] bg-white p-7 shadow-sm md:grid-cols-2 md:p-10"
      >
        {/* Bio */}
        <div className="space-y-2 md:col-span-2">
          <FieldLabel htmlFor="bio">Bio</FieldLabel>
          <TextArea
            id="bio"
            value={form.bio ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
            placeholder="Tell Fashionistar what styles you love — Agbada, Ankara fusion, minimal..."
          />
        </div>

        {/* Default shipping address */}
        <div className="space-y-2 md:col-span-2">
          <FieldLabel htmlFor="default_shipping_address">Default Shipping Address</FieldLabel>
          <TextInput
            id="default_shipping_address"
            value={form.default_shipping_address ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, default_shipping_address: e.target.value }))}
            placeholder="15 Bode Thomas Street, Surulere, Lagos"
          />
        </div>

        {/* State */}
        <div className="space-y-2">
          <FieldLabel htmlFor="state">State</FieldLabel>
          <TextInput
            id="state"
            value={form.state ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))}
            placeholder="Lagos State"
          />
        </div>

        {/* Country */}
        <div className="space-y-2">
          <FieldLabel htmlFor="country">Country</FieldLabel>
          <TextInput
            id="country"
            value={form.country ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))}
            placeholder="Nigeria"
          />
        </div>

        {/* Preferred size */}
        <div className="space-y-2">
          <FieldLabel htmlFor="preferred_size">Preferred Size</FieldLabel>
          <SelectInput
            id="preferred_size"
            value={form.preferred_size ?? ""}
            onChange={(v) => setForm((f) => ({ ...f, preferred_size: v }))}
          >
            <option value="">Select size</option>
            {SIZE_OPTS.map((s) => <option key={s} value={s}>{s}</option>)}
          </SelectInput>
        </div>

        {/* Style preferences */}
        <div className="space-y-2">
          <FieldLabel htmlFor="style_preferences">Style Preferences</FieldLabel>
          <TextInput
            id="style_preferences"
            value={stylePreferencesText}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                style_preferences: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
              }))
            }
            placeholder="Agbada, Ankara, minimal — comma separated"
          />
        </div>

        {/* Favourite colours */}
        <div className="space-y-2 md:col-span-2">
          <FieldLabel htmlFor="favourite_colours">Favourite Colours</FieldLabel>
          <TextInput
            id="favourite_colours"
            value={colourText}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                favourite_colours: e.target.value.split(",").map((c) => c.trim()).filter(Boolean),
              }))
            }
            placeholder="Black, gold, emerald — comma separated"
          />
        </div>

        {/* Notifications */}
        <div className="flex flex-col gap-3 rounded-[20px] border border-[#ECE6D6] bg-[#FFFDF5] p-5 md:col-span-2">
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#7A6B44]">Notifications</p>
          <label className="flex items-center justify-between gap-4 text-sm font-medium text-black">
            <div>
              <span>Email updates</span>
              <p className="text-xs text-[#5A6465]">Order confirmations, dispatch alerts, deals</p>
            </div>
            <input
              type="checkbox"
              checked={Boolean(form.email_notifications_enabled)}
              onChange={(e) => setForm((f) => ({ ...f, email_notifications_enabled: e.target.checked }))}
              className="h-4 w-4 accent-[#FDA600]"
            />
          </label>
          <label className="flex items-center justify-between gap-4 text-sm font-medium text-black">
            <div>
              <span>SMS updates</span>
              <p className="text-xs text-[#5A6465]">Critical order and delivery alerts via SMS</p>
            </div>
            <input
              type="checkbox"
              checked={Boolean(form.sms_notifications_enabled)}
              onChange={(e) => setForm((f) => ({ ...f, sms_notifications_enabled: e.target.checked }))}
              className="h-4 w-4 accent-[#FDA600]"
            />
          </label>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3 md:col-span-2">
          {updateProfile.isSuccess && (
            <span className="flex items-center gap-1.5 text-sm font-semibold text-emerald-600">
              <CheckCircle2 className="h-4 w-4" /> Saved successfully
            </span>
          )}
          <button
            type="submit"
            disabled={updateProfile.isPending}
            className="inline-flex items-center gap-2 rounded-full bg-[#FDA600] px-6 py-3 text-sm font-semibold text-black transition hover:bg-[#f28705] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {updateProfile.isPending ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</>
            ) : (
              <><ArrowRight className="h-4 w-4" /> Save Changes</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  WALLET VIEW
// ══════════════════════════════════════════════════════════════════════════════

export function ClientWalletView() {
  const { data: walletData, isLoading: walletLoading } = useClientWalletBalance();

  const totalAmount  = walletData?.total_amount_ngn ?? 0;
  const balance      = walletData?.balance_ngn ?? 0;
  const txCount      = walletData?.transaction_count ?? 0;
  const transactions = walletData?.transactions ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 data-testid="client-wallet-heading" className="font-bon_foyage text-4xl text-black">My Wallet</h1>
        <p className="mt-1 text-sm text-[#5A6465]">
          Manage your balance, top up, and view transaction history.
        </p>
      </div>

      {/* Wallet cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="Available Balance"
          value={walletLoading ? "—" : fmtNgn(balance)}
          hint="Ready to spend at checkout"
          icon={Wallet}
          accent
        />
        <StatCard
          title="Total Funded"
          value={walletLoading ? "—" : fmtNgn(totalAmount)}
          hint="Historical wallet inflow"
          icon={TrendingUp}
        />
        <StatCard
          title="Transactions"
          value={walletLoading ? "—" : String(txCount)}
          hint="All financial events on this account"
          icon={BarChart3}
        />
      </div>

      {/* Quick top-up — wired to live initiateTopUp API */}
      <WalletTopUpPanel />

      {/* Full transaction dashboard */}
      <Transactions
        transactions={transactions}
        isLoading={walletLoading}
        showWalletDashboard
      />
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  TRACK ORDER VIEW
// ══════════════════════════════════════════════════════════════════════════════

export function ClientTrackOrderView() {
  const [orderId, setOrderId] = useState("");
  const [email, setEmail] = useState("");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-bon_foyage text-4xl text-black">Track Your Order</h1>
        <p className="mt-1 text-sm text-[#5A6465]">
          Enter the order ID and billing email from your receipt.
        </p>
      </div>

      <div className="grid gap-5 rounded-[28px] bg-white p-7 shadow-sm md:grid-cols-2 md:p-10">
        <div className="space-y-2">
          <FieldLabel htmlFor="order_id">Order ID</FieldLabel>
          <TextInput
            id="order_id"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            placeholder="FASH-ORD-1007"
          />
        </div>
        <div className="space-y-2">
          <FieldLabel htmlFor="billing_email">Billing Email</FieldLabel>
          <TextInput
            id="billing_email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </div>
        <div className="flex justify-start md:col-span-2">
          <ActionBtn variant="primary">
            <PackageSearch className="h-4 w-4" /> Track Order
          </ActionBtn>
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
//  WALLET TOP-UP PANEL (live Paystack initiate)
// ──────────────────────────────────────────────────────────────────────────────

function WalletTopUpPanel() {
  const [amount, setAmount] = useState<number | null>(null);
  const topUpMutation = useMutation({
    mutationFn: (amountNgn: number) =>
      clientApi.initiateTopUp({ amount: amountNgn, payment_method: "card" }),
    onSuccess: (res) => {
      if (res.payment_url) window.location.href = res.payment_url;
    },
  });

  const PRESETS = [1000, 2000, 5000, 10000, 25000, 50000];

  return (
    <div className="rounded-[28px] bg-white p-6 shadow-sm">
      <p className="mb-4 text-xs font-bold uppercase tracking-[0.15em] text-[#7A6B44]">Top Up Wallet</p>
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((preset) => (
          <button
            key={preset}
            type="button"
            onClick={() => setAmount(preset)}
            className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
              amount === preset
                ? "border-[#FDA600] bg-[#FDA600] text-black"
                : "border-[#ECE6D6] bg-[#F8F5ED] text-black hover:bg-[#EDE7D9]"
            }`}
          >
            {fmtNgn(preset)}
          </button>
        ))}
      </div>
      <div className="mt-4 flex gap-3">
        <input
          type="number"
          value={amount ?? ""}
          onChange={(e) => setAmount(Number(e.target.value) || null)}
          placeholder="Custom amount (₦)"
          min={100}
          className="h-12 flex-1 rounded-[16px] border border-[#D9D9D9] bg-white px-4 text-sm text-black outline-none transition focus:border-[#FDA600] focus:ring-2 focus:ring-[#FDA600]/20"
        />
        <button
          type="button"
          onClick={() => amount && topUpMutation.mutate(amount)}
          disabled={!amount || amount < 100 || topUpMutation.isPending}
          className="inline-flex items-center gap-2 rounded-full bg-[#FDA600] px-6 py-2.5 text-sm font-bold text-black transition hover:bg-[#f28705] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {topUpMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
          Fund Wallet
        </button>
      </div>
      {topUpMutation.isError && (
        <p className="mt-2 text-xs font-semibold text-red-500">
          Top-up failed. Please try again.
        </p>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  NOTIFICATIONS VIEW  (global feed, mark-read, filter by type)
// ══════════════════════════════════════════════════════════════════════════════

const NOTIF_TYPE_LABELS: Record<string, string> = {
  all: "All",
  order: "Orders",
  payment: "Payments",
  custom_order: "Custom Orders",
  promo: "Promotions",
  kyc: "KYC",
  support: "Support",
};

function NotifRow({ notif, onMarkRead }: { notif: GlobalNotification; onMarkRead: (id: string) => void }) {
  const typeColors: Record<string, string> = {
    order: "bg-[#DBEAFE] text-[#1E40AF]",
    payment: "bg-[#D1FAE5] text-[#065F46]",
    custom_order: "bg-[#EDE9FE] text-[#6D28D9]",
    promo: "bg-[#FEF3C7] text-[#92400E]",
    kyc: "bg-[#DCFCE7] text-[#166534]",
    support: "bg-[#FEE2E2] text-[#991B1B]",
  };
  const typeKey = (notif.notification_type ?? "").split(".")[0];
  const colourClass = typeColors[typeKey] ?? "bg-[#F3F4F6] text-[#6B7280]";

  return (
    <div
      className={`flex items-start gap-4 rounded-[20px] p-4 transition hover:bg-[#FFFDF5] ${
        !notif.is_read ? "bg-[#FFFDF5] ring-1 ring-[#FDA600]/20" : "bg-white"
      }`}
    >
      {/* Unread dot */}
      <div className={`mt-2 h-2 w-2 shrink-0 rounded-full ${
        !notif.is_read ? "bg-[#FDA600]" : "bg-transparent"
      }`} />
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className="font-semibold text-black">{notif.title}</p>
          <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${colourClass}`}>
            {NOTIF_TYPE_LABELS[typeKey] ?? typeKey}
          </span>
        </div>
        <p className="mt-1 text-sm leading-6 text-[#5A6465]">{notif.body}</p>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-[10px] text-[#A89A7A]">
            {new Date(notif.created_at).toLocaleDateString("en-NG", {
              day: "numeric", month: "short", year: "numeric",
              hour: "2-digit", minute: "2-digit",
            })}
          </span>
          {!notif.is_read && (
            <button
              type="button"
              onClick={() => onMarkRead(notif.id)}
              className="text-[10px] font-semibold text-[#01454A] hover:underline"
            >
              Mark read
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function ClientNotificationsView() {
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState("all");

  const { data: notifications = [], isLoading, refetch } = useNotifications(page);
  const markAllMutation = useMarkAllNotificationsRead();
  const markReadMutation = useMutation({
    mutationFn: (id: string) => clientApi.markNotificationRead(id),
    onSuccess: () => void refetch(),
  });

  const filtered = typeFilter === "all"
    ? (notifications as GlobalNotification[])
    : (notifications as GlobalNotification[]).filter((n) => (n.notification_type ?? "").startsWith(typeFilter));

  const unreadCount = (notifications as GlobalNotification[]).filter((n) => !n.is_read).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 data-testid="client-notifications-heading" className="font-bon_foyage text-4xl text-black">Notifications</h1>
            {unreadCount > 0 && (
              <span className="flex h-6 min-w-[24px] items-center justify-center rounded-full bg-[#FDA600] px-1.5 text-xs font-bold text-black">
                {unreadCount}
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-[#5A6465]">
            {notifications.length} notification{notifications.length !== 1 ? "s" : ""} · {unreadCount} unread
          </p>
        </div>
        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={() => markAllMutation.mutate()}
              disabled={markAllMutation.isPending}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#ECE6D6] bg-white px-4 py-2 text-sm font-semibold text-[#01454A] transition hover:bg-[#F8F5ED] disabled:opacity-60"
            >
              {markAllMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
              Mark all read
            </button>
          )}
          <button
            type="button"
            onClick={() => void refetch()}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#D9D9D9] bg-white text-[#5A6465] transition hover:text-black"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Type filter chips */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(NOTIF_TYPE_LABELS).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setTypeFilter(key)}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
              typeFilter === key
                ? "bg-[#FDA600] text-black shadow-sm"
                : "border border-[#ECE6D6] bg-white text-[#5A6465] hover:bg-[#F8F5ED]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Notification list */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-[20px] bg-white" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-[32px] bg-white py-16 text-center shadow-sm">
          <Bell className="h-12 w-12 text-[#D9D9D9]" />
          <div>
            <p className="text-base font-semibold text-black">No notifications yet</p>
            <p className="mt-1 text-sm text-[#5A6465]">We’ll notify you about orders, payments, and more.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((n: GlobalNotification) => (
            <NotifRow
              key={n.id}
              notif={n}
              onMarkRead={(id) => markReadMutation.mutate(id)}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-center gap-2">
        <button
          type="button"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          className="rounded-full border border-[#ECE6D6] bg-white px-4 py-2 text-sm font-semibold text-[#5A6465] transition hover:bg-[#F8F5ED] disabled:opacity-40"
        >
          ← Previous
        </button>
        <span className="text-sm text-[#5A6465]">Page {page}</span>
        <button
          type="button"
          onClick={() => setPage((p) => p + 1)}
          disabled={notifications.length < 20}
          className="rounded-full border border-[#ECE6D6] bg-white px-4 py-2 text-sm font-semibold text-[#5A6465] transition hover:bg-[#F8F5ED] disabled:opacity-40"
        >
          Next →
        </button>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  SUPPORT TICKETS VIEW
// ══════════════════════════════════════════════════════════════════════════════

const TICKET_STATUS_MAP: Record<string, { label: string; bg: string; text: string }> = {
  open:            { label: "Open",            bg: "#DBEAFE", text: "#1E40AF" },
  awaiting_client: { label: "Awaiting Client", bg: "#FEF3C7", text: "#92400E" },
  awaiting_vendor: { label: "Awaiting Vendor", bg: "#EDE9FE", text: "#6D28D9" },
  in_review:       { label: "In Review",       bg: "#FCE7F3", text: "#9D174D" },
  resolved:        { label: "Resolved",        bg: "#D1FAE5", text: "#065F46" },
  closed:          { label: "Closed",          bg: "#F3F4F6", text: "#6B7280" },
};

const TICKET_CATEGORIES: Array<{ value: TicketCategory; label: string }> = [
  { value: "order_dispute", label: "Order Dispute" },
  { value: "payment_issue", label: "Payment Issue" },
  { value: "product_complaint", label: "Product Complaint" },
  { value: "vendor_conduct", label: "Vendor Conduct" },
  { value: "delivery_problem", label: "Delivery Problem" },
  { value: "refund_request", label: "Refund Request" },
  { value: "measurement_issue", label: "Measurement Issue" },
  { value: "general", label: "General" },
];

function CreateTicketModal({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<SupportTicketCreatePayload>({
    title: "",
    category: TICKET_CATEGORIES[0].value,
    description: "",
  });
  const mutation = useMutation({
    mutationFn: (payload: SupportTicketCreatePayload) => clientApi.createSupportTicket(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["client-support-tickets"] });
      onClose();
    },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg overflow-hidden rounded-[28px] bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#ECE6D6] px-7 py-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#7A6B44]">New Ticket</p>
            <h2 className="font-bon_foyage text-2xl text-black">Contact Support</h2>
          </div>
          <button type="button" onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full border border-[#ECE6D6] text-[#5A6465] hover:text-black">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="space-y-4 px-7 py-6">
          <div className="space-y-2">
            <FieldLabel htmlFor="ticket-subject">Subject</FieldLabel>
            <TextInput
              id="ticket-subject"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="Briefly describe your issue"
            />
          </div>
          <div className="space-y-2">
            <FieldLabel htmlFor="ticket-category">Category</FieldLabel>
            <SelectInput
              id="ticket-category"
              value={form.category}
              onChange={(v) => setForm((f) => ({ ...f, category: v as TicketCategory }))}
            >
              {TICKET_CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </SelectInput>
          </div>
          <div className="space-y-2">
            <FieldLabel htmlFor="ticket-desc">Description</FieldLabel>
            <TextArea
              id="ticket-desc"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Describe the issue in detail — order numbers, dates, screenshots..."
              rows={5}
            />
          </div>
        </div>
        <div className="flex justify-end gap-3 border-t border-[#ECE6D6] px-7 py-5">
          <ActionBtn variant="ghost" onClick={onClose}>Cancel</ActionBtn>
          <ActionBtn
            variant="primary"
            onClick={() => mutation.mutate(form)}
            loading={mutation.isPending}
            disabled={!form.title || !form.description}
          >
            <MessageSquarePlus className="h-4 w-4" /> Submit Ticket
          </ActionBtn>
        </div>
      </div>
    </div>
  );
}

export function ClientSupportView() {
  const [showCreate, setShowCreate] = useState(false);
  const { data: tickets = [], isLoading, refetch } = useQuery<SupportTicket[]>({
    queryKey: ["client-support-tickets"],
    queryFn: () => clientApi.getSupportTickets(),
    staleTime: 30_000,
    refetchInterval: 30_000,
  });

  const openCount = tickets.filter((t) => t.status !== "resolved" && t.status !== "closed").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 data-testid="client-support-heading" className="font-bon_foyage text-4xl text-black">Support Tickets</h1>
          <p className="mt-1 text-sm text-[#5A6465]">
            {tickets.length} ticket{tickets.length !== 1 ? "s" : ""} · {openCount} open
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => void refetch()} className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#D9D9D9] bg-white text-[#5A6465] hover:text-black">
            <RefreshCw className="h-4 w-4" />
          </button>
          <ActionBtn variant="primary" onClick={() => setShowCreate(true)}>
            <MessageSquarePlus className="h-4 w-4" /> New Ticket
          </ActionBtn>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-20 animate-pulse rounded-[20px] bg-white" />)}
        </div>
      ) : tickets.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-[32px] bg-white py-16 text-center shadow-sm">
          <TicketCheck className="h-14 w-14 text-[#D9D9D9]" />
          <div>
            <p className="text-base font-semibold text-black">No support tickets yet</p>
            <p className="mt-1 text-sm text-[#5A6465]">Our team is ready to help with any issue</p>
          </div>
          <ActionBtn variant="primary" onClick={() => setShowCreate(true)}>
            <MessageSquarePlus className="h-4 w-4" /> Open First Ticket
          </ActionBtn>
        </div>
      ) : (
        <div className="overflow-hidden rounded-[28px] bg-white shadow-sm">
          <div className="hidden grid-cols-[2fr_1fr_1fr_1fr] gap-4 bg-[#F8F5ED] px-6 py-4 text-[11px] font-bold uppercase tracking-[0.15em] text-[#7A6B44] md:grid">
            <span>Subject</span>
            <span>Category</span>
            <span>Status</span>
            <span>Date</span>
          </div>
          <div className="divide-y divide-[#F4F3EC]">
            {tickets.map((ticket) => {
              const st = TICKET_STATUS_MAP[ticket.status] ?? TICKET_STATUS_MAP.open;
              return (
                <div key={ticket.id} className="grid items-center gap-4 px-6 py-5 hover:bg-[#FFFDF5] md:grid-cols-[2fr_1fr_1fr_1fr]">
                  <div>
                    <p className="font-semibold text-black">{ticket.title}</p>
                    <p className="text-xs text-[#5A6465] line-clamp-1">{ticket.description}</p>
                  </div>
                  <p className="text-sm text-[#5A6465]">{ticket.category}</p>
                  <span
                    className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
                    style={{ backgroundColor: st.bg, color: st.text }}
                  >
                    {st.label}
                  </span>
                  <p className="text-xs text-[#5A6465]">
                    {new Date(ticket.created_at).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {showCreate && <CreateTicketModal onClose={() => setShowCreate(false)} />}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  KYC VIEW
// ══════════════════════════════════════════════════════════════════════════════

type KycStatus = "verified" | "pending" | "not_started" | "rejected";

export function ClientKycView() {
  const { data: profile } = useClientProfile();
  // Derive status from profile — backend exposes kyc_status on ClientProfile
  const kycStatus = (profile as { kyc_status?: KycStatus } | undefined)?.kyc_status ?? "not_started";

  const STATUS_CONFIG: Record<KycStatus, { label: string; bg: string; text: string; icon: React.ElementType }> = {
    verified:    { label: "Verified ✅",     bg: "#D1FAE5", text: "#065F46", icon: ShieldCheck },
    pending:     { label: "Under Review ⏳",  bg: "#FEF3C7", text: "#92400E", icon: Clock },
    not_started: { label: "Not Started",   bg: "#F3F4F6", text: "#6B7280", icon: ClipboardCheck },
    rejected:    { label: "Action Required", bg: "#FEE2E2", text: "#991B1B", icon: AlertCircle },
  };
  const cfg = STATUS_CONFIG[kycStatus];

  const KYC_STEPS = [
    {
      id: "bvn",
      label: "BVN Verification",
      desc: "Link your Bank Verification Number for identity check",
      icon: FileCheck2,
      done: kycStatus === "verified",
    },
    {
      id: "id",
      label: "Government ID",
      desc: "Upload National ID, International Passport, or Driver’s Licence",
      icon: UploadCloud,
      done: kycStatus === "verified",
    },
    {
      id: "address",
      label: "Address Proof",
      desc: "Utility bill or bank statement (not older than 3 months)",
      icon: MapPin,
      done: kycStatus === "verified",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 data-testid="client-kyc-heading" className="font-bon_foyage text-4xl text-black">KYC Verification</h1>
        <p className="mt-1 text-sm text-[#5A6465]">
          Complete identity verification to unlock full platform features.
        </p>
      </div>

      {/* Status banner */}
      <div
        className="flex items-center gap-4 rounded-[24px] p-6"
        style={{ backgroundColor: cfg.bg, color: cfg.text }}
      >
        <cfg.icon className="h-8 w-8 shrink-0" />
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.15em]">{cfg.label}</p>
          {kycStatus === "verified" && (
            <p className="mt-1 text-sm">Your identity has been verified. Full platform access granted.</p>
          )}
          {kycStatus === "pending" && (
            <p className="mt-1 text-sm">Your documents are under review. This typically takes 24–48 hours.</p>
          )}
          {kycStatus === "not_started" && (
            <p className="mt-1 text-sm">Complete the steps below to verify your identity and unlock payouts.</p>
          )}
          {kycStatus === "rejected" && (
            <p className="mt-1 text-sm">Your submission was rejected. Please re-upload valid documents.</p>
          )}
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-3">
        {KYC_STEPS.map((step) => (
          <div
            key={step.id}
            className={`flex items-center gap-5 rounded-[24px] border p-6 transition ${
              step.done
                ? "border-[#D1FAE5] bg-[#F0FDF4]"
                : "border-[#ECE6D6] bg-white hover:shadow-sm"
            }`}
          >
            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
              step.done ? "bg-[#D1FAE5]" : "bg-[#F4F3EC]"
            }`}>
              <step.icon className={`h-6 w-6 ${step.done ? "text-[#065F46]" : "text-[#01454A]"}`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-black">{step.label}</p>
                {step.done && (
                  <span className="rounded-full bg-[#D1FAE5] px-2 py-0.5 text-[10px] font-bold text-[#065F46]">
                    Complete
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm text-[#5A6465]">{step.desc}</p>
            </div>
            {!step.done && (
              <Link
                href={`/client/dashboard/kyc/${step.id}`}
                className="shrink-0 inline-flex items-center gap-1.5 rounded-full bg-[#FDA600] px-4 py-2 text-xs font-bold text-black"
              >
                Start <ArrowRight className="h-3 w-3" />
              </Link>
            )}
          </div>
        ))}
      </div>

      {/* Help note */}
      <div className="rounded-[20px] border border-[#ECE6D6] bg-[#F8F5ED] p-5">
        <p className="text-sm font-semibold text-black">Need help?</p>
        <p className="mt-1 text-sm text-[#5A6465]">
          Contact our support team via the{" "}
          <Link href="/client/dashboard/support" className="font-semibold text-[#01454A] hover:underline">
            Support Tickets
          </Link>{" "}
          page if you face any issues during verification.
        </p>
      </div>
    </div>
  );
}
