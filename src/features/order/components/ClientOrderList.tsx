/**
 * @file ClientOrderList.tsx
 * @description Premium client-facing order history — 2027 Edition.
 *
 * Data:
 *  - useClientOrders() → Ninja async paginated list
 *  - useNinjaClientOrderCounts() → per-status badge counts
 *
 * UX:
 *  - Status-coded badge colours mapped to design system tokens.
 *  - Shimmer skeleton grid on first load.
 *  - Premium "No orders yet" empty state with shop CTA.
 *  - Pagination controls.
 */
"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Package,
  ReceiptText,
} from "lucide-react";
import { useClientOrders, useNinjaClientOrderCounts } from "../hooks/use-order";

// ── Status helpers ─────────────────────────────────────────────────────────────

const STATUS_LABELS: Record<string, string> = {
  pending_payment: "Pending Payment",
  payment_confirmed: "Payment Confirmed",
  processing: "Processing",
  shipped: "Shipped",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  completed: "Completed",
  cancelled: "Cancelled",
  refund_requested: "Refund Requested",
  refunded: "Refunded",
  disputed: "Disputed",
};

const STATUS_COLORS: Record<string, string> = {
  pending_payment: "bg-amber-50 text-amber-700 border-amber-200",
  payment_confirmed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  processing: "bg-blue-50 text-blue-700 border-blue-200",
  shipped: "bg-purple-50 text-purple-700 border-purple-200",
  out_for_delivery: "bg-cyan-50 text-cyan-700 border-cyan-200",
  delivered: "bg-teal-50 text-teal-700 border-teal-200",
  completed: "bg-emerald-50 text-emerald-800 border-emerald-300",
  cancelled: "bg-red-50 text-red-700 border-red-200",
  refund_requested: "bg-orange-50 text-orange-700 border-orange-200",
  refunded: "bg-gray-50 text-gray-600 border-gray-200",
  disputed: "bg-rose-50 text-rose-700 border-rose-200",
};

function statusBadge(status: string) {
  const cls = STATUS_COLORS[status] ?? "bg-gray-50 text-gray-600 border-gray-200";
  const label = STATUS_LABELS[status] ?? status.replace(/_/g, " ");
  return { cls, label };
}

// ── Skeleton ───────────────────────────────────────────────────────────────────

function OrderListSkeleton() {
  return (
    <div className="divide-y divide-[hsl(var(--border))]">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex animate-pulse items-center gap-4 p-5">
          <div className="h-10 w-10 rounded-xl bg-[hsl(var(--muted))]" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-32 rounded bg-[hsl(var(--muted))]" />
            <div className="h-3 w-24 rounded bg-[hsl(var(--muted))]" />
          </div>
          <div className="hidden space-y-2 sm:block">
            <div className="h-4 w-20 rounded bg-[hsl(var(--muted))]" />
            <div className="h-3 w-16 rounded bg-[hsl(var(--muted))]" />
          </div>
          <div className="h-6 w-24 rounded-full bg-[hsl(var(--muted))]" />
        </div>
      ))}
    </div>
  );
}

// ── Count badges ───────────────────────────────────────────────────────────────

const COUNT_TABS = ["processing", "shipped", "completed", "cancelled"] as const;

// ── Main Component ─────────────────────────────────────────────────────────────

export default function ClientOrderList() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError } = useClientOrders(page);
  const { data: counts } = useNinjaClientOrderCounts();

  const orders = data?.results ?? [];
  const hasMore = !!data?.next;

  return (
    <section className="flex flex-col gap-6 px-4 py-6 md:px-8 lg:px-10">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-bon_foyage text-4xl text-[hsl(var(--foreground))] md:text-5xl">
            My Orders
          </h1>
          <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
            Track tailoring progress, payment state, delivery, and escrow.
          </p>
        </div>

        {/* Status count pills */}
        <div className="flex flex-wrap gap-2">
          {COUNT_TABS.map((tab) => (
            <div
              key={tab}
              className={`inline-flex flex-col items-center rounded-[1rem] border px-3 py-2 text-center ${STATUS_COLORS[tab] ?? "bg-gray-50 border-gray-200 text-gray-600"}`}
            >
              <span className="text-lg font-bold leading-none">
                {counts?.[tab] ?? 0}
              </span>
              <span className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider">
                {STATUS_LABELS[tab]}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Order List Card ──────────────────────────────────────────────────── */}
      <div className="overflow-hidden rounded-[2rem] border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-[var(--card-shadow)]">
        {isLoading ? (
          <OrderListSkeleton />
        ) : isError ? (
          <div className="flex flex-col items-center gap-3 p-16 text-center">
            <Package className="h-10 w-10 text-[hsl(var(--destructive)/0.4)]" />
            <p className="text-sm font-semibold text-[hsl(var(--destructive))]">
              Failed to load your orders.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="rounded-full bg-[hsl(var(--destructive)/0.08)] px-4 py-2 text-xs font-bold text-[hsl(var(--destructive))] transition hover:bg-[hsl(var(--destructive)/0.14)]"
            >
              Retry
            </button>
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center gap-6 p-16 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[hsl(var(--muted))]">
              <Package className="h-10 w-10 text-[hsl(var(--muted-foreground)/0.4)]" />
            </div>
            <div>
              <p className="text-xl font-bold text-[hsl(var(--foreground))]">
                No orders yet
              </p>
              <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
                Discover our collections and place your first order.
              </p>
            </div>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 rounded-full bg-[hsl(var(--accent))] px-8 py-3 text-sm font-bold text-[hsl(var(--accent-foreground))] shadow-md transition hover:brightness-110"
            >
              Shop Now <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-[hsl(var(--border))]">
            {orders.map((order) => {
              const { cls, label } = statusBadge(order.status);
              return (
                <Link
                  key={order.id}
                  href={`/client/dashboard/orders/${order.id}`}
                  className="group flex flex-col gap-3 p-5 transition-colors hover:bg-[hsl(var(--accent)/0.04)] md:flex-row md:items-center md:justify-between"
                >
                  {/* Left: icon + order number */}
                  <div className="flex items-start gap-4">
                    <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[hsl(var(--accent)/0.1)] text-[hsl(var(--accent))]">
                      <ReceiptText size={20} />
                    </span>
                    <div>
                      <p className="font-bold text-[hsl(var(--foreground))] group-hover:text-[hsl(var(--accent))] transition-colors">
                        {order.order_number}
                      </p>
                      <p className="text-xs text-[hsl(var(--muted-foreground))]">
                        {new Date(order.created_at).toLocaleDateString("en-NG", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Mid: items + total */}
                  <div className="flex items-center gap-6 text-sm md:min-w-[240px]">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
                        Items
                      </p>
                      <p className="font-semibold text-[hsl(var(--foreground))]">
                        {order.item_count}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
                        Total
                      </p>
                      <p className="font-semibold text-[hsl(var(--foreground))]">
                        {order.currency} {Number(order.final_total).toLocaleString("en-NG")}
                      </p>
                    </div>
                  </div>

                  {/* Right: status badge */}
                  <span
                    className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-bold capitalize ${cls}`}
                  >
                    {label}
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Pagination ──────────────────────────────────────────────────────── */}
      {(page > 1 || hasMore) && (
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--foreground))] transition hover:bg-[hsl(var(--muted))] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm font-semibold text-[hsl(var(--foreground))]">
            Page {page}
          </span>
          <button
            type="button"
            disabled={!hasMore}
            onClick={() => setPage((p) => p + 1)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--foreground))] transition hover:bg-[hsl(var(--muted))] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </section>
  );
}
