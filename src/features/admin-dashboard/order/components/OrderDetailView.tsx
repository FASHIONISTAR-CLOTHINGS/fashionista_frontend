"use client";

/**
 * @file OrderDetailView.tsx
 * @description Premium administrative order detail view.
 * Fully isolated under the admin-dashboard subdirectory.
 */

import { useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  CreditCard,
  MapPin,
  Package,
  ReceiptText,
  Truck,
} from "lucide-react";
import {
  useAdminOrderDetail,
  useTransitionAdminOrderStatus,
  useReleaseAdminOrderEscrow,
  useCancelAdminOrder,
} from "../hooks";

// ── Helpers ────────────────────────────────────────────────────────────────────

function formatNGN(amount: string | number | null | undefined): string {
  const n = typeof amount === "string" ? parseFloat(amount) : (amount ?? 0);
  return `₦${n.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

const STATUS_FLOW = [
  "pending_payment",
  "payment_confirmed",
  "processing",
  "shipped",
  "out_for_delivery",
  "delivered",
  "completed",
];

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

// ── Skeleton ───────────────────────────────────────────────────────────────────

function OrderDetailSkeleton() {
  return (
    <div className="flex flex-col gap-6 p-4 md:p-8">
      <div className="h-10 w-48 animate-pulse rounded-lg bg-[hsl(var(--muted))]" />
      <div className="h-48 animate-pulse rounded-[2rem] bg-[hsl(var(--muted))]" />
      <div className="h-64 animate-pulse rounded-[2rem] bg-[hsl(var(--muted))]" />
      <div className="h-40 animate-pulse rounded-[2rem] bg-[hsl(var(--muted))]" />
    </div>
  );
}

// ── Status Stepper ─────────────────────────────────────────────────────────────

function StatusStepper({ currentStatus }: { currentStatus: string }) {
  const activeIdx = STATUS_FLOW.indexOf(currentStatus);
  const isCancelled = ["cancelled", "refunded", "disputed"].includes(currentStatus);

  if (isCancelled) {
    return (
      <div className="flex items-center gap-3 rounded-xl bg-red-50 p-4">
        <AlertCircle className="h-5 w-5 text-red-600" />
        <p className="text-sm font-semibold text-red-700">
          {STATUS_LABELS[currentStatus] ?? currentStatus}
        </p>
      </div>
    );
  }

  return (
    <div className="relative overflow-x-auto">
      <div className="flex min-w-max items-start gap-0">
        {STATUS_FLOW.map((step, i) => {
          const done = activeIdx > -1 ? i < activeIdx : false;
          const active = i === activeIdx;
          const isLast = i === STATUS_FLOW.length - 1;
          return (
            <div key={step} className="flex flex-1 items-start">
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-full border-2 transition-all shrink-0 ${
                    done
                      ? "border-[hsl(var(--accent))] bg-[hsl(var(--accent))] text-white"
                      : active
                        ? "border-[hsl(var(--accent))] bg-white text-[hsl(var(--accent))]"
                        : "border-[hsl(var(--border))] bg-white text-[hsl(var(--muted-foreground))]"
                  }`}
                >
                  {done ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    <span className="text-xs font-bold">{i + 1}</span>
                  )}
                </div>
                <p
                  className={`mt-2 w-16 text-center text-[10px] font-semibold leading-tight ${
                    active
                      ? "text-[hsl(var(--accent))]"
                      : done
                        ? "text-[hsl(var(--foreground))]"
                        : "text-[hsl(var(--muted-foreground))]"
                  }`}
                >
                  {STATUS_LABELS[step] ?? step}
                </p>
              </div>
              {!isLast && (
                <div
                  className={`mt-4 h-0.5 flex-1 transition-colors ${
                    done ? "bg-[hsl(var(--accent))]" : "bg-[hsl(var(--border))]"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Props ──────────────────────────────────────────────────────────────────────

type Props = {
  orderId: string;
  backHref: string;
};

// ── Main Component ─────────────────────────────────────────────────────────────

export function OrderDetailView({ orderId, backHref }: Props) {
  const [showHistory, setShowHistory] = useState(false);

  // Admin operational states
  const [adminNewStatus, setAdminNewStatus] = useState("");
  const [adminTransitionNote, setAdminTransitionNote] = useState("");
  const [adminCancelReason, setAdminCancelReason] = useState("");

  const { data: order, isLoading, isError } = useAdminOrderDetail(orderId);

  // Admin Mutations
  const { mutate: transitionAdminStatus, isPending: transitioning } = useTransitionAdminOrderStatus();
  const { mutate: releaseAdminEscrow, isPending: releasing } = useReleaseAdminOrderEscrow();
  const { mutate: cancelAdminOrderMutation, isPending: adminCancelling } = useCancelAdminOrder();

  if (isLoading) return <OrderDetailSkeleton />;

  if (isError || !order) {
    return (
      <div className="rounded-[2rem] bg-[hsl(var(--card))] p-12 text-center shadow-[var(--card-shadow)]">
        <Package className="mx-auto mb-4 h-12 w-12 text-[hsl(var(--destructive)/0.4)]" />
        <p className="text-sm font-semibold text-[hsl(var(--destructive))]">
          Order detail could not be loaded.
        </p>
        <Link
          href={backHref}
          className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[hsl(var(--accent))]"
        >
          <ArrowLeft className="h-4 w-4" /> Go back
        </Link>
      </div>
    );
  }

  const safeOrder = order;

  const badgeCls =
    STATUS_COLORS[safeOrder.status] ?? "bg-gray-50 text-gray-600 border-gray-200";
  const paidPercent = Math.min(100, parseFloat(safeOrder.percent_paid_total));

  // Admin operations handlers
  function handleAdminStatusTransition() {
    if (!adminNewStatus) return;
    transitionAdminStatus(
      { orderId: safeOrder.id, newStatus: adminNewStatus, note: adminTransitionNote },
      {
        onSuccess: () => {
          setAdminNewStatus("");
          setAdminTransitionNote("");
        },
      }
    );
  }

  function handleAdminEscrowRelease() {
    if (confirm("Are you sure you want to release the escrow funds for this order to the vendor? This action is irreversible.")) {
      releaseAdminEscrow(safeOrder.id);
    }
  }

  function handleAdminCancel() {
    if (!adminCancelReason.trim()) return;
    if (confirm("Are you sure you want to FORCE cancel this order? This will void all payments and cannot be undone.")) {
      cancelAdminOrderMutation(
        { orderId: safeOrder.id, reason: adminCancelReason },
        {
          onSuccess: () => {
            setAdminCancelReason("");
          },
        }
      );
    }
  }

  return (
    <section className="flex flex-col gap-6 px-4 py-6 md:px-8 lg:px-10">
      {/* ── Back link ────────────────────────────────────────────────────────── */}
      <Link
        href={backHref}
        className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-[hsl(var(--accent))] transition hover:opacity-70"
      >
        <ArrowLeft className="h-4 w-4" /> Back to orders
      </Link>

      {/* ── Header card ──────────────────────────────────────────────────────── */}
      <div className="rounded-[2rem] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-[var(--card-shadow)]">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="font-bon_foyage text-4xl text-[hsl(var(--foreground))] md:text-5xl text-black">
              {order.order_number}
            </h1>
            <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">
              Placed {new Date(order.created_at).toLocaleString("en-NG")}
            </p>
          </div>
          <span className={`inline-flex items-center self-start rounded-full border px-4 py-2 text-sm font-bold capitalize ${badgeCls}`}>
            {STATUS_LABELS[order.status] ?? order.status.replace(/_/g, " ")}
          </span>
        </div>

        {/* Financial metrics */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Metric label="Order Total" value={formatNGN(order.final_total)} />
          <Metric label="Amount Paid" value={formatNGN(order.amount_paid_total)} />
          <Metric label="Outstanding" value={formatNGN(order.amount_outstanding)} />
          <Metric label="Items" value={String(order.item_count)} />
        </div>

        {/* Payment progress bar */}
        <div className="mt-6">
          <div className="mb-1 flex items-center justify-between text-xs font-semibold text-[hsl(var(--muted-foreground))]">
            <span>Payment Progress</span>
            <span>{paidPercent.toFixed(0)}%</span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-[hsl(var(--muted))]">
            <div
              className="h-full rounded-full bg-[hsl(var(--accent))] transition-all duration-700"
              style={{ width: `${paidPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* ── Admin Operations Panel ────────────────────────────────────────── */}
      <div className="rounded-[2rem] border border-[#01454A]/25 bg-[#F4F3EC] p-6 shadow-md">
        <div className="flex items-center gap-2 mb-4">
          <AlertCircle className="h-5 w-5 text-[#01454A]" />
          <h2 className="text-base font-bold text-[#01454A] font-satoshi">
            Admin Operations Desk
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Status Transition Selector */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 font-satoshi">
                Transition Order Status
              </h3>
              <p className="text-xs text-gray-400 mb-3 font-satoshi">Force transition this order's lifecycle status.</p>
              <select
                value={adminNewStatus}
                onChange={(e) => setAdminNewStatus(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#01454A] font-satoshi text-black"
              >
                <option value="">-- Select Status --</option>
                {Object.entries(STATUS_LABELS).map(([val, lbl]) => (
                  <option key={val} value={val}>{lbl}</option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Optional transition note..."
                value={adminTransitionNote}
                onChange={(e) => setAdminTransitionNote(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-xs mt-2 focus:outline-none focus:ring-1 focus:ring-[#01454A] font-satoshi text-black"
              />
            </div>
            <button
              type="button"
              disabled={transitioning || !adminNewStatus}
              onClick={handleAdminStatusTransition}
              className="w-full mt-4 bg-[#01454A] hover:bg-[#026269] text-white text-xs py-2.5 rounded-lg font-bold transition-all disabled:opacity-45 cursor-pointer"
            >
              {transitioning ? "Transitioning..." : "Apply Transition"}
            </button>
          </div>

          {/* Escrow Release Card */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 font-satoshi">
                Escrow Funds Governance
              </h3>
              <p className="text-xs text-gray-400 mb-3 font-satoshi">Release payment escrow directly to the tailor/vendor profile.</p>
              <div className="bg-amber-50 border border-amber-200/50 p-3 rounded-lg text-[11px] text-amber-800 font-satoshi font-semibold">
                Current Status: <span className="uppercase text-amber-900 font-bold">{safeOrder.escrow_status}</span>
              </div>
            </div>
            <button
              type="button"
              disabled={releasing || safeOrder.escrow_status !== "held"}
              onClick={handleAdminEscrowRelease}
              className="w-full mt-4 bg-[#FDA600] hover:bg-[#e09500] text-black text-xs py-2.5 rounded-lg font-bold transition-all disabled:opacity-45 cursor-pointer"
            >
              {releasing ? "Releasing..." : safeOrder.escrow_status === "released" ? "Escrow Released" : "Release Escrow Direct"}
            </button>
          </div>

          {/* Admin Force Cancellation Card */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 font-satoshi">
                Force Cancel & Void
              </h3>
              <p className="text-xs text-gray-400 mb-3 font-satoshi">Cancel this order in full and trigger payment refunds if applicable.</p>
              <input
                type="text"
                placeholder="Reason for cancel..."
                value={adminCancelReason}
                onChange={(e) => setAdminCancelReason(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-red-500 font-satoshi text-black"
              />
            </div>
            <button
              type="button"
              disabled={adminCancelling || !adminCancelReason.trim() || safeOrder.status === "cancelled"}
              onClick={handleAdminCancel}
              className="w-full mt-4 bg-red-600 hover:bg-red-700 text-white text-xs py-2.5 rounded-lg font-bold transition-all disabled:opacity-45 cursor-pointer"
            >
              {adminCancelling ? "Cancelling..." : "Force Cancel Order"}
            </button>
          </div>
        </div>
      </div>

      {/* ── Status Stepper ───────────────────────────────────────────────────── */}
      <div className="rounded-[2rem] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-[var(--card-shadow)]">
        <div className="mb-6 flex items-center gap-2">
          <Truck className="h-5 w-5 text-[hsl(var(--accent))]" />
          <h2 className="text-base font-bold text-[hsl(var(--foreground))] text-black">
            Order Progress
          </h2>
        </div>
        <StatusStepper currentStatus={order.status} />
      </div>

      {/* ── Items ────────────────────────────────────────────────────────────── */}
      <div className="rounded-[2rem] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-[var(--card-shadow)]">
        <div className="mb-4 flex items-center gap-2">
          <Package className="h-5 w-5 text-[hsl(var(--accent))]" />
          <h2 className="text-base font-bold text-[hsl(var(--foreground))] text-black">
            Order Items
          </h2>
        </div>
        <div className="divide-y divide-[hsl(var(--border))]">
          {order.items.map((item: any) => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-4 py-4 text-sm"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[hsl(var(--muted))]">
                  <Package className="h-6 w-6 text-[hsl(var(--muted-foreground)/0.5)]" />
                </div>
                <div>
                  <p className="font-semibold text-[hsl(var(--foreground))] text-black">
                    {item.product_title}
                  </p>
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">
                    Qty: {item.quantity} · {item.vendor_name}
                    {item.size_label ? ` · ${item.size_label}` : ""}
                    {item.color_label ? ` · ${item.color_label}` : ""}
                  </p>
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">
                    SKU: {item.product_sku || "N/A"}
                  </p>
                </div>
              </div>
              <p className="shrink-0 font-bold text-[hsl(var(--foreground))] text-black">
                {formatNGN(item.line_total)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Payment Timeline ─────────────────────────────────────────────────── */}
      <div className="rounded-[2rem] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-[var(--card-shadow)]">
        <div className="mb-4 flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-[hsl(var(--accent))]" />
          <h2 className="text-base font-bold text-[hsl(var(--foreground))] text-black">
            Payment Timeline
          </h2>
        </div>
        <div className="space-y-3">
          {order.payment_records.length > 0 ? (
            order.payment_records.map((record: any) => (
              <div
                key={`${record.sequence_number}-${record.correlation_id}`}
                className="rounded-xl border border-[hsl(var(--border))] p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-bold text-[hsl(var(--foreground))] text-black">
                    Payment #{record.sequence_number} — {record.selected_percent}%
                  </p>
                  <p className="text-sm font-bold text-[hsl(var(--accent))]">
                    {formatNGN(record.amount)}
                  </p>
                </div>
                <p className="mt-1.5 text-xs text-[hsl(var(--muted-foreground))]">
                  {record.provider} via {record.payment_source.replace(/_/g, " ")}
                </p>
                <p className="mt-0.5 text-xs text-[hsl(var(--muted-foreground))]">
                  Cumulative: {record.cumulative_percent_paid}% ·
                  Remaining: {formatNGN(record.remaining_amount)}
                </p>
              </div>
            ))
          ) : (
            <div className="flex items-center gap-3 rounded-xl bg-[hsl(var(--muted)/0.5)] p-4">
              <Clock className="h-5 w-5 text-[hsl(var(--muted-foreground))]" />
              <p className="text-sm text-[hsl(var(--muted-foreground))]">
                No payments recorded yet.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Delivery Address ─────────────────────────────────────────────────── */}
      <div className="rounded-[2rem] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-[var(--card-shadow)]">
        <div className="mb-3 flex items-center gap-2">
          <MapPin className="h-5 w-5 text-[hsl(var(--accent))]" />
          <h2 className="text-base font-bold text-[hsl(var(--foreground))] text-black">
            Delivery Details
          </h2>
        </div>
        <div className="grid gap-2 text-sm text-[hsl(var(--muted-foreground))]">
          <p>
            <span className="font-semibold text-[hsl(var(--foreground))] text-black">
              {order.buyer_name}
            </span>
          </p>
          {order.buyer_phone && <p>{order.buyer_phone}</p>}
          {order.buyer_address && (
            <p>
              {typeof order.buyer_address === "object"
                ? Object.values(order.buyer_address).filter(Boolean).join(", ")
                : String(order.buyer_address)}
            </p>
          )}
        </div>
      </div>

      {/* ── Status History (collapsible) ─────────────────────────────────────── */}
      {order.status_history?.length > 0 && (
        <div className="rounded-[2rem] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-[var(--card-shadow)]">
          <button
            type="button"
            onClick={() => setShowHistory((h) => !h)}
            className="flex w-full items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <ReceiptText className="h-5 w-5 text-[hsl(var(--accent))]" />
              <h2 className="text-base font-bold text-[hsl(var(--foreground))] text-black">
                Status History
              </h2>
            </div>
            {showHistory ? (
              <ChevronUp className="h-5 w-5 text-[hsl(var(--muted-foreground))]" />
            ) : (
              <ChevronDown className="h-5 w-5 text-[hsl(var(--muted-foreground))]" />
            )}
          </button>
          {showHistory && (
            <div className="mt-4 space-y-3">
              {order.status_history.map((entry: any) => (
                <div key={entry.id} className="rounded-xl border border-[hsl(var(--border))] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-[hsl(var(--foreground))] text-black">
                        {entry.to_status
                           ? `→ ${STATUS_LABELS[entry.to_status] ?? entry.to_status}`
                           : STATUS_LABELS[entry.status ?? ""] ?? entry.status}
                      </p>
                      {(entry.note || entry.notes) && (
                        <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))] font-satoshi text-[#444]">
                          {entry.note || entry.notes}
                        </p>
                      )}
                    </div>
                    <p className="shrink-0 text-xs text-[hsl(var(--muted-foreground))]">
                      {new Date(entry.created_at).toLocaleDateString("en-NG")}
                    </p>
                  </div>
                  {entry.actor_name && (
                    <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))] italic">
                      By: {entry.actor_name}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-[hsl(var(--muted)/0.5)] px-4 py-3">
      <p className="text-[10px] font-bold uppercase tracking-widest text-[hsl(var(--muted-foreground))]">
        {label}
      </p>
      <p className="mt-1 text-sm font-bold capitalize text-[hsl(var(--foreground))] text-black">
        {value}
      </p>
    </div>
  );
}
