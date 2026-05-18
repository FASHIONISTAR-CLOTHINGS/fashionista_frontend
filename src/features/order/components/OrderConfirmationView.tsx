"use client";

/**
 * @file OrderConfirmationView.tsx
 * @description Enterprise-grade order confirmation page — 2027 Edition.
 *
 * Triggered after:
 *  (A) Wallet payment → CheckoutPage redirects here directly.
 *  (B) Paystack gateway → Payment provider redirects back with ?reference=XXX
 *
 * Data:
 *  - useOrderDetail(orderId) — already warm in TanStack Query cache from submit.
 *  - Falls back to a fresh fetch if cache is cold (direct URL visit).
 */

import { useMemo } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  MapPin,
  Package,
  ReceiptText,
  ShoppingBag,
  Star,
} from "lucide-react";
import { useOrderDetail } from "../hooks/use-order";

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatNGN(amount: string | number | null | undefined): string {
  const n = typeof amount === "string" ? parseFloat(amount) : (amount ?? 0);
  return `₦${n.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

const STATUS_STEPS = [
  { key: "pending_payment", label: "Awaiting Payment" },
  { key: "payment_confirmed", label: "Payment Confirmed" },
  { key: "processing", label: "Processing" },
  { key: "shipped", label: "Shipped" },
  { key: "delivered", label: "Delivered" },
  { key: "completed", label: "Completed" },
];

function getStepIndex(status: string): number {
  const idx = STATUS_STEPS.findIndex((s) => s.key === status);
  return idx === -1 ? 1 : idx;
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function ConfirmationSkeleton() {
  return (
    <div className="flex flex-col gap-6 px-4 py-8 md:px-8">
      <div className="mx-auto h-24 w-24 animate-pulse rounded-full bg-[hsl(var(--muted))]" />
      <div className="mx-auto h-8 w-64 animate-pulse rounded-lg bg-[hsl(var(--muted))]" />
      <div className="h-48 animate-pulse rounded-[2rem] bg-[hsl(var(--muted))]" />
      <div className="h-40 animate-pulse rounded-[2rem] bg-[hsl(var(--muted))]" />
    </div>
  );
}

// ── Stepper ───────────────────────────────────────────────────────────────────

function OrderStepper({ currentStatus }: { currentStatus: string }) {
  const activeIdx = getStepIndex(currentStatus);
  return (
    <div className="relative flex items-center justify-between gap-2 overflow-x-auto pb-2">
      {STATUS_STEPS.map((step, i) => {
        const done = i < activeIdx;
        const active = i === activeIdx;
        return (
          <div key={step.key} className="flex flex-1 flex-col items-center gap-2 min-w-[64px]">
            {/* Connector line */}
            {i > 0 && (
              <div
                className="absolute left-0 top-4 hidden h-0.5 md:block"
                style={{
                  width: `${(i / (STATUS_STEPS.length - 1)) * 100}%`,
                  background: i <= activeIdx
                    ? "hsl(var(--accent))"
                    : "hsl(var(--border))",
                }}
              />
            )}
            {/* Dot */}
            <div
              className={`relative z-10 flex h-9 w-9 items-center justify-center rounded-full border-2 transition-all ${
                done
                  ? "border-[hsl(var(--accent))] bg-[hsl(var(--accent))] text-white"
                  : active
                    ? "border-[hsl(var(--accent))] bg-[hsl(var(--card))] text-[hsl(var(--accent))]"
                    : "border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--muted-foreground))]"
              }`}
            >
              {done ? (
                <CheckCircle2 className="h-5 w-5" />
              ) : (
                <span className="text-xs font-bold">{i + 1}</span>
              )}
            </div>
            <p
              className={`text-center text-[10px] font-semibold leading-tight ${
                active
                  ? "text-[hsl(var(--accent))]"
                  : done
                    ? "text-[hsl(var(--foreground))]"
                    : "text-[hsl(var(--muted-foreground))]"
              }`}
            >
              {step.label}
            </p>
          </div>
        );
      })}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function OrderConfirmationView({ orderId }: { orderId: string }) {
  const { data: order, isLoading, isError } = useOrderDetail(orderId);

  const isPaid = useMemo(
    () => order?.is_fully_paid || order?.status === "payment_confirmed",
    [order],
  );

  if (isLoading) return <ConfirmationSkeleton />;

  if (isError || !order) {
    return (
      <div className="flex flex-col items-center gap-6 py-24 text-center px-4">
        <Package className="h-14 w-14 text-[hsl(var(--muted-foreground)/0.4)]" />
        <p className="text-xl font-bold text-[hsl(var(--foreground))]">
          Order not found
        </p>
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          We couldn&apos;t load your order. It may still be processing.
        </p>
        <Link
          href="/client/dashboard/orders"
          className="inline-flex items-center gap-2 rounded-full bg-[hsl(var(--accent))] px-8 py-3 text-sm font-bold text-[hsl(var(--accent-foreground))] shadow-md transition hover:brightness-110"
        >
          View All Orders <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <section className="flex flex-col gap-6 px-4 py-8 md:px-8 lg:px-10">
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col items-center gap-4 text-center">
        <div
          className="flex h-24 w-24 items-center justify-center rounded-full"
          style={{
            background: "radial-gradient(circle, hsl(var(--accent)/0.18) 0%, hsl(var(--accent)/0.05) 100%)",
            border: "3px solid hsl(var(--accent)/0.3)",
          }}
        >
          <CheckCircle2 className="h-12 w-12 text-[hsl(var(--accent))]" />
        </div>
        <div>
          <h1 className="font-bon_foyage text-4xl text-[hsl(var(--foreground))] md:text-5xl">
            Order Confirmed!
          </h1>
          <p className="mt-2 text-base text-[hsl(var(--muted-foreground))]">
            Thank you for shopping with Fashionistar 🎉
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full bg-[hsl(var(--accent)/0.12)] px-4 py-2 text-sm font-bold text-[hsl(var(--accent))]">
          <ReceiptText className="h-4 w-4" />
          {order.order_number}
        </div>
      </div>

      {/* ── Order Summary Card ────────────────────────────────────────────── */}
      <div className="rounded-[2rem] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-[var(--card-shadow)]">
        <h2 className="mb-4 text-lg font-bold text-[hsl(var(--foreground))]">
          Order Summary
        </h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Metric
            label="Order Total"
            value={formatNGN(order.final_total)}
          />
          <Metric
            label="Amount Paid"
            value={formatNGN(order.amount_paid_total)}
          />
          <Metric
            label="Items"
            value={String(order.item_count)}
          />
          <Metric
            label="Status"
            value={order.status.replace(/_/g, " ")}
            highlight
          />
        </div>

        {/* Items list */}
        <div className="mt-6 divide-y divide-[hsl(var(--border))]">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-4 py-4 text-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[hsl(var(--muted))]">
                  <Package className="h-5 w-5 text-[hsl(var(--muted-foreground))]" />
                </div>
                <div>
                  <p className="font-semibold text-[hsl(var(--foreground))]">
                    {item.product_title}
                  </p>
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">
                    Qty: {item.quantity} · SKU: {item.product_sku || "N/A"}
                  </p>
                </div>
              </div>
              <p className="font-bold text-[hsl(var(--foreground))]">
                {formatNGN(item.line_total)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Status Stepper ────────────────────────────────────────────────── */}
      <div className="rounded-[2rem] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-[var(--card-shadow)]">
        <div className="mb-6 flex items-center gap-2">
          <Clock className="h-5 w-5 text-[hsl(var(--accent))]" />
          <h2 className="text-base font-bold text-[hsl(var(--foreground))]">
            Order Progress
          </h2>
        </div>
        <OrderStepper currentStatus={order.status} />
      </div>

      {/* ── Delivery Info ─────────────────────────────────────────────────── */}
      {order.delivery_address && (
        <div className="rounded-[2rem] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-[var(--card-shadow)]">
          <div className="mb-3 flex items-center gap-2">
            <MapPin className="h-5 w-5 text-[hsl(var(--accent))]" />
            <h2 className="text-base font-bold text-[hsl(var(--foreground))]">
              Delivery Address
            </h2>
          </div>
          <p className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed">
            {typeof order.delivery_address === "string"
              ? order.delivery_address
              : JSON.stringify(order.delivery_address)}
          </p>
        </div>
      )}

      {/* ── Payment Prompt (if still outstanding) ────────────────────────── */}
      {!isPaid && (
        <div className="rounded-[2rem] border border-[hsl(var(--accent)/0.3)] bg-[hsl(var(--accent)/0.06)] p-6">
          <p className="text-sm font-semibold text-[hsl(var(--foreground))]">
            Payment outstanding
          </p>
          <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
            {formatNGN(order.amount_outstanding)} still to pay.
          </p>
          <Link
            href={`/client/dashboard/orders/${order.id}/payment`}
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-[hsl(var(--accent))] px-6 py-3 text-sm font-bold text-[hsl(var(--accent-foreground))] shadow transition hover:brightness-110"
          >
            Complete Payment <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}

      {/* ── CTA Row ───────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/client/dashboard/orders"
          className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-[hsl(var(--border))] px-6 py-3 text-sm font-bold text-[hsl(var(--foreground))] transition hover:bg-[hsl(var(--muted))]"
        >
          <ReceiptText className="h-4 w-4" /> View All Orders
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href={`/client/dashboard/orders/${order.id}`}
            className="inline-flex items-center gap-2 rounded-full border-2 border-[hsl(var(--accent)/0.3)] px-6 py-3 text-sm font-bold text-[hsl(var(--accent))] transition hover:bg-[hsl(var(--accent)/0.08)]"
          >
            Order Details
          </Link>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 rounded-full bg-[hsl(var(--accent))] px-6 py-3 text-sm font-bold text-[hsl(var(--accent-foreground))] shadow-md transition hover:brightness-110"
          >
            <ShoppingBag className="h-4 w-4" /> Continue Shopping
          </Link>
        </div>
      </div>

      {/* ── Trust Row ─────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-center gap-6 border-t border-[hsl(var(--border))] pt-4 text-xs text-[hsl(var(--muted-foreground))]">
        <span className="flex items-center gap-1">
          <Star className="h-3.5 w-3.5 text-amber-400" fill="currentColor" />
          Escrow-protected payment
        </span>
        <span className="flex items-center gap-1">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
          Order secured with SSL
        </span>
        <span className="flex items-center gap-1">
          <Package className="h-3.5 w-3.5" />
          Real-time tailoring updates
        </span>
      </div>
    </section>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Metric({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-xl bg-[hsl(var(--muted)/0.5)] px-4 py-3">
      <p className="text-[10px] font-bold uppercase tracking-widest text-[hsl(var(--muted-foreground))]">
        {label}
      </p>
      <p
        className={`mt-1 text-sm font-bold capitalize ${
          highlight ? "text-[hsl(var(--accent))]" : "text-[hsl(var(--foreground))]"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
