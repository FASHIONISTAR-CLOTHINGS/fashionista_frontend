"use client";

/**
 * @file OrderDetailView.tsx
 * @description Premium order detail view — 2027 Edition.
 *
 * Features:
 *  - Order status stepper with completed/active/pending states.
 *  - Full financial metrics (total, paid, outstanding, %).
 *  - Item snapshot list with product thumbnails.
 *  - Payment timeline records.
 *  - Status history timeline.
 *  - "Confirm Delivery" CTA (releases escrow) — client scope only.
 *  - "Cancel Order" CTA — only shown for cancellable statuses.
 *  - "Continue Payment" CTA — if outstanding amount exists.
 *  - "Admin Operations Desk" — rich administrative control panel.
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
  PackageCheck,
  ReceiptText,
  RefreshCw,
  Sparkles,
  Truck,
} from "lucide-react";
import { toast } from "sonner";
import {
  useCancelOrder,
  useConfirmDelivery,
  useOrderDetail,
  useVendorOrderDetail,
  useVerifyPickup,
} from "../hooks/use-order";

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

const CANCELLABLE_STATUSES = new Set(["pending_payment", "payment_confirmed"]);

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
  scope?: "client" | "vendor";
};

// ── Main Component ─────────────────────────────────────────────────────────────

export default function OrderDetailView({
  orderId,
  backHref,
  scope = "client",
}: Props) {
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [showHistory, setShowHistory] = useState(false);

  const clientQuery = useOrderDetail(orderId, scope === "client");
  const vendorQuery = useVendorOrderDetail(orderId, scope === "vendor");
  const activeQuery = scope === "vendor" ? vendorQuery : clientQuery;

  const { data: order, isLoading, isError } = activeQuery;
  const { mutate: cancelOrder, isPending: cancelling } = useCancelOrder();
  const { mutate: confirmDelivery, isPending: confirming } = useConfirmDelivery();
  const { mutate: verifyPickup, isPending: verifyingPickup } = useVerifyPickup();

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
  const canCancel = scope === "client" && CANCELLABLE_STATUSES.has(safeOrder.status);
  const canConfirm =
    scope === "client" && safeOrder.status === "delivered" && safeOrder.escrow_status === "held";
  const hasOutstanding = !safeOrder.is_fully_paid && parseFloat(safeOrder.amount_outstanding) > 0;
  const paidPercent = Math.min(100, parseFloat(safeOrder.percent_paid_total));

  function handleCancel() {
    if (!cancelReason.trim()) {
      toast.error("Please provide a cancellation reason.");
      return;
    }
    cancelOrder(
      { orderId: safeOrder.id, input: { reason: cancelReason } },
      {
        onSuccess: () => setCancelOpen(false),
      },
    );
  }

  function handleConfirmDelivery() {
    confirmDelivery(safeOrder.id);
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
            <h1 className="font-bon_foyage text-4xl text-[hsl(var(--foreground))] md:text-5xl">
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

        {/* Action buttons (client only) */}
        <div className="mt-6 flex flex-wrap items-center gap-3">
          {hasOutstanding && scope === "client" && (
            <Link
              href={`/client/dashboard/orders/${order.id}/payment`}
              className="inline-flex items-center gap-2 rounded-full bg-[hsl(var(--accent))] px-5 py-2.5 text-sm font-bold text-[hsl(var(--accent-foreground))] shadow transition hover:brightness-110"
            >
              <CreditCard className="h-4 w-4" /> Continue Payment
            </Link>
          )}
          {canConfirm && (
            <button
              type="button"
              disabled={confirming}
              onClick={handleConfirmDelivery}
              className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white shadow transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {confirming ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <PackageCheck className="h-4 w-4" />
              )}
              Confirm Delivery
            </button>
          )}
          {canCancel && (
            <button
              type="button"
              onClick={() => setCancelOpen((o) => !o)}
              className="inline-flex items-center gap-2 rounded-full border border-[hsl(var(--destructive)/0.3)] px-5 py-2.5 text-sm font-bold text-[hsl(var(--destructive))] transition hover:bg-[hsl(var(--destructive)/0.06)]"
            >
              Cancel Order
            </button>
          )}
        </div>

        {/* Cancel form (client only) */}
        {cancelOpen && (
          <div className="mt-4 rounded-xl border border-[hsl(var(--destructive)/0.2)] bg-red-50 p-4">
            <p className="mb-2 text-sm font-semibold text-red-700">
              Cancellation Reason
            </p>
            <textarea
              rows={3}
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Tell us why you're cancelling…"
              className="w-full resize-none rounded-lg border border-red-200 bg-white p-3 text-sm text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--destructive)/0.3)]"
            />
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                disabled={cancelling}
                onClick={handleCancel}
                className="rounded-full bg-[hsl(var(--destructive))] px-4 py-2 text-xs font-bold text-white transition hover:brightness-110 disabled:opacity-60"
              >
                {cancelling ? "Cancelling…" : "Confirm Cancellation"}
              </button>
              <button
                type="button"
                onClick={() => setCancelOpen(false)}
                className="rounded-full border border-red-200 px-4 py-2 text-xs font-bold text-red-700"
              >
                Keep Order
              </button>
            </div>
          </div>
        )}
      </div>



      {/* ── Status Stepper ───────────────────────────────────────────────────── */}
      <div className="rounded-[2rem] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-[var(--card-shadow)]">
        <div className="mb-6 flex items-center gap-2">
          <Truck className="h-5 w-5 text-[hsl(var(--accent))]" />
          <h2 className="text-base font-bold text-[hsl(var(--foreground))]">
            Order Progress
          </h2>
        </div>
        <StatusStepper currentStatus={order.status} />
      </div>

      {/* ── QR Code Shop Pickup Card ────────────────────────────────────────── */}
      {order.delivery_mode === "vendor_shop_pickup" && (
        <div className="rounded-[2rem] border border-[hsl(var(--border))] bg-gradient-to-br from-white to-[#FFFDF5] p-6 shadow-[var(--card-shadow)] relative overflow-hidden">
          {/* Decorative design elements */}
          <div className="absolute right-0 top-0 h-32 w-32 translate-x-8 translate-y-[-8px] rounded-full bg-[#FDA600]/10 blur-2xl pointer-events-none" />
          <div className="absolute left-0 bottom-0 h-32 w-32 translate-x-[-16px] translate-y-[16px] rounded-full bg-[#01454A]/5 blur-2xl pointer-events-none" />
          
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#01454A]/10 text-[#01454A]">
                <Package className="h-4 w-4" />
              </span>
              <h2 className="text-base font-bold text-black">
                Shop Pickup Pass
              </h2>
            </div>
            <span className={`rounded-full px-3 py-1 text-xs font-bold ${order.status === "completed" ? "bg-emerald-100 text-emerald-800" : "bg-[#FDA600]/15 text-[#7A6B44]"}`}>
              {order.status === "completed" ? "Verified & Released" : "Ready for Pickup"}
            </span>
          </div>

          <div className="flex flex-col items-center justify-center gap-6 py-6 text-center">
            {/* Elegant QR Code SVG */}
            <div className="relative rounded-2xl bg-white p-4 shadow-sm border border-[#F4F3EC]">
              {order.status === "completed" && (
                <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl bg-white/95 backdrop-blur-sm z-10">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mb-2">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <p className="text-xs font-bold text-emerald-800">PICKUP VERIFIED</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">Escrow Released</p>
                </div>
              )}
              
              <svg width="160" height="160" viewBox="0 0 100 100" className="text-black">
                <rect x="5" y="5" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="4" />
                <rect x="10" y="10" width="10" height="10" fill="currentColor" />
                <rect x="75" y="5" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="4" />
                <rect x="80" y="10" width="10" height="10" fill="currentColor" />
                <rect x="5" y="75" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="4" />
                <rect x="10" y="80" width="10" height="10" fill="currentColor" />
                
                <rect x="35" y="5" width="5" height="5" fill="currentColor" />
                <rect x="45" y="10" width="10" height="5" fill="currentColor" />
                <rect x="60" y="5" width="5" height="15" fill="currentColor" />
                <rect x="35" y="20" width="15" height="5" fill="currentColor" />
                <rect x="55" y="25" width="5" height="5" fill="currentColor" />
                <rect x="5" y="35" width="5" height="10" fill="currentColor" />
                <rect x="15" y="40" width="15" height="5" fill="currentColor" />
                <rect x="25" y="30" width="5" height="15" fill="currentColor" />
                <rect x="35" y="35" width="10" height="10" fill="currentColor" />
                <rect x="50" y="45" width="15" height="5" fill="currentColor" />
                <rect x="70" y="35" width="5" height="5" fill="currentColor" />
                <rect x="80" y="30" width="15" height="5" fill="currentColor" />
                <rect x="85" y="45" width="5" height="10" fill="currentColor" />
                <rect x="5" y="55" width="15" height="5" fill="currentColor" />
                <rect x="25" y="50" width="10" height="10" fill="currentColor" />
                <rect x="40" y="60" width="5" height="10" fill="currentColor" />
                <rect x="50" y="55" width="15" height="5" fill="currentColor" />
                <rect x="70" y="50" width="5" height="15" fill="currentColor" />
                <rect x="80" y="60" width="10" height="5" fill="currentColor" />
                <rect x="35" y="75" width="5" height="10" fill="currentColor" />
                <rect x="45" y="85" width="15" height="5" fill="currentColor" />
                <rect x="55" y="75" width="10" height="5" fill="currentColor" />
                <rect x="70" y="80" width="15" height="10" fill="currentColor" />
                <rect x="90" y="75" width="5" height="5" fill="currentColor" />
              </svg>
            </div>

            <div className="max-w-md">
              <p className="text-xs font-bold tracking-widest text-[#7A6B44] uppercase">Secure Verification Token</p>
              <p className="mt-1 font-mono text-sm font-semibold select-all text-black bg-[#F8F5ED] px-4 py-2 rounded-xl border border-[#EDE7D9] break-all">
                FASHIONISTAR-PICKUP-644178250108-{order.id}
              </p>
              <p className="mt-3 text-xs text-gray-500 max-w-sm mx-auto leading-relaxed">
                Present this QR code or secure verification token to the store manager during pickup. Once scanned, your pickup is instant and escrow is safely released.
              </p>
            </div>

            {/* Simulated QR Scan trigger (PUT request to verify-pickup) */}
            {order.status !== "completed" && (
              <button
                type="button"
                disabled={verifyingPickup}
                onClick={() => verifyPickup(`FASHIONISTAR-PICKUP-644178250108-${order.id}`)}
                className="inline-flex items-center gap-2 rounded-full bg-[#01454A] hover:bg-[#01454A]/90 text-white px-6 py-2.5 text-xs font-bold tracking-wide transition shadow disabled:opacity-60 cursor-pointer"
              >
                {verifyingPickup ? (
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Sparkles className="h-3.5 w-3.5 text-[#FDA600]" />
                )}
                Simulate Shop-Owner QR Scan
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── Items ────────────────────────────────────────────────────────────── */}
      <div className="rounded-[2rem] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-[var(--card-shadow)]">
        <div className="mb-4 flex items-center gap-2">
          <Package className="h-5 w-5 text-[hsl(var(--accent))]" />
          <h2 className="text-base font-bold text-[hsl(var(--foreground))]">
            Order Items
          </h2>
        </div>
        <div className="divide-y divide-[hsl(var(--border))]">
          {order.items?.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-4 py-4 text-sm"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[hsl(var(--muted))]">
                  <Package className="h-6 w-6 text-[hsl(var(--muted-foreground)/0.5)]" />
                </div>
                <div>
                  <p className="font-semibold text-[hsl(var(--foreground))]">
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
              <p className="shrink-0 font-bold text-[hsl(var(--foreground))]">
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
          <h2 className="text-base font-bold text-[hsl(var(--foreground))]">
            Payment Timeline
          </h2>
        </div>
        <div className="space-y-3">
          {(order.payment_records || []).length > 0 ? (
            (order.payment_records || []).map((record) => (
              <div
                key={`${record.sequence_number}-${record.correlation_id}`}
                className="rounded-xl border border-[hsl(var(--border))] p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-bold text-[hsl(var(--foreground))]">
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
          <h2 className="text-base font-bold text-[hsl(var(--foreground))]">
            Delivery Details
          </h2>
        </div>
        <div className="grid gap-2 text-sm text-[hsl(var(--muted-foreground))]">
          <p>
            <span className="font-semibold text-[hsl(var(--foreground))]">
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
            className="flex w-full items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <ReceiptText className="h-5 w-5 text-[hsl(var(--accent))]" />
              <h2 className="text-base font-bold text-[hsl(var(--foreground))]">
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
              {(order.status_history || []).map((entry) => (
                <div key={entry.id} className="rounded-xl border border-[hsl(var(--border))] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-[hsl(var(--foreground))]">
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
      <p className="mt-1 text-sm font-bold capitalize text-[hsl(var(--foreground))]">
        {value}
      </p>
    </div>
  );
}
