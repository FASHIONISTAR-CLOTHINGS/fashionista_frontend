"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  CheckCircle2,
  ChevronRight,
  Clock,
  ExternalLink,
  Heart,
  Loader2,
  MapPin,
  Package,
  PackageCheck,
  Palette,
  PackageSearch,
  Plus,
  RefreshCw,
  Ruler,
  Sparkles,
  TrendingUp,
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
import { clientApi } from "@/features/client/api/client.api";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  ClientAddress,
  ClientAddressCreatePayload,
  ClientOrder,
  ClientProfileUpdatePayload,
  Country,
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
      <section className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#01454A] via-[#01454A] to-[#012d31] p-8 md:p-10">
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/5" />
        <div className="pointer-events-none absolute bottom-0 right-0 h-32 w-32 rounded-tl-full bg-[#FDA600]/10" />
        <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#FDA600]">
              Fashionistar Client
            </p>
            <h1 className="mt-2 font-bon_foyage text-4xl leading-none text-white md:text-5xl">
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
          <h1 className="font-bon_foyage text-4xl text-black">My Orders</h1>
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
  const { data: profile, refetch } = useClientProfile();
  const [showModal, setShowModal] = useState(false);
  const queryClient = useQueryClient();

  const addresses: ClientAddress[] = (profile?.addresses ?? []) as ClientAddress[];

  const handleAddAddress = async (payload: ClientAddressCreatePayload) => {
    await clientApi.addAddress(payload);
    await queryClient.invalidateQueries({ queryKey: ["client-profile"] });
  };

  const handleDelete = async (id: string) => {
    await clientApi.deleteAddress(id);
    await queryClient.invalidateQueries({ queryKey: ["client-profile"] });
  };

  const handleSetDefault = async (id: string) => {
    await clientApi.setDefaultAddress(id);
    await queryClient.invalidateQueries({ queryKey: ["client-profile"] });
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
        <h1 className="font-bon_foyage text-4xl text-black">My Wallet</h1>
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

      {/* Quick top-up buttons */}
      <div className="rounded-[28px] bg-white p-6 shadow-sm">
        <p className="mb-4 text-xs font-bold uppercase tracking-[0.15em] text-[#7A6B44]">Quick Top-Up</p>
        <div className="flex flex-wrap gap-2">
          {[1000, 2000, 5000, 10000, 25000, 50000].map((amt) => (
            <button
              key={amt}
              type="button"
              className="rounded-full border border-[#ECE6D6] bg-[#F8F5ED] px-4 py-2 text-sm font-semibold text-black transition hover:bg-[#EDE7D9]"
            >
              {fmtNgn(amt)}
            </button>
          ))}
          <Link
            href="/client/dashboard/settings#wallet"
            className="ml-auto flex items-center gap-1.5 rounded-full bg-[#FDA600] px-5 py-2 text-sm font-semibold text-black"
          >
            <Plus className="h-4 w-4" /> Add Funds
          </Link>
        </div>
      </div>

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
