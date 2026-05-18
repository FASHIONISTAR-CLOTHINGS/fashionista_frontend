"use client";

/**
 * @file OrderPaymentView.tsx
 * @description Premium order payment view — 2027 Edition.
 *
 * Logic preserved from v1: wallet/gateway/cod/pay_at_shop path,
 * percent-based installments, Paystack redirect, confirmation on success.
 * Now with full design-system token styling.
 */

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  BadgeCheck,
  Building,
  CreditCard,
  HandCoins,
  LockKeyhole,
  Package,
  RefreshCw,
  ShoppingBag,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import { useOrderDetail } from "../hooks/use-order";
import { useFundWalletPayment, type PaymentProvider } from "@/features/payment";

// ── Types ──────────────────────────────────────────────────────────────────────

type PaymentMethod = "wallet" | "gateway" | "cod" | "pay_at_shop";
type GatewayProvider = "paystack" | "flutterwave" | "olive_pay";

interface MethodConfig {
  value: PaymentMethod;
  label: string;
  description: string;
  icon: React.FC<{ className?: string }>;
}

interface ProviderConfig {
  value: GatewayProvider;
  label: string;
}

// ── Constants ──────────────────────────────────────────────────────────────────

const GATEWAY_PROVIDERS: ProviderConfig[] = [
  { value: "paystack", label: "Paystack" },
  { value: "flutterwave", label: "Flutterwave" },
  { value: "olive_pay", label: "Olive Pay" },
];

const METHOD_CONFIGS: MethodConfig[] = [
  {
    value: "wallet",
    label: "Fashionistar Wallet",
    description: "Instant debit from your wallet balance.",
    icon: Wallet,
  },
  {
    value: "gateway",
    label: "Card / Bank Gateway",
    description: "Pay with debit/credit card via Paystack or Flutterwave.",
    icon: CreditCard,
  },
  {
    value: "cod",
    label: "Cash on Delivery",
    description: "Pay cash when your order arrives.",
    icon: HandCoins,
  },
  {
    value: "pay_at_shop",
    label: "Pay at Shop",
    description: "Walk in and pay at the vendor location.",
    icon: Building,
  },
];

// ── Helpers ────────────────────────────────────────────────────────────────────

function formatNGN(amount: string | number | null | undefined): string {
  const n = typeof amount === "string" ? parseFloat(amount) : (amount ?? 0);
  return `₦${n.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// ── Skeleton ───────────────────────────────────────────────────────────────────

function PaymentSkeleton() {
  return (
    <div className="flex flex-col gap-6 p-4 md:p-8">
      <div className="h-10 w-36 animate-pulse rounded-lg bg-[hsl(var(--muted))]" />
      <div className="h-48 animate-pulse rounded-[2rem] bg-[hsl(var(--muted))]" />
      <div className="h-40 animate-pulse rounded-[2rem] bg-[hsl(var(--muted))]" />
      <div className="h-56 animate-pulse rounded-[2rem] bg-[hsl(var(--muted))]" />
    </div>
  );
}

// ── Payment ring ───────────────────────────────────────────────────────────────

function PaymentRing({ paidPercent }: { paidPercent: number }) {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (paidPercent / 100) * circumference;
  return (
    <div className="flex h-28 w-28 items-center justify-center">
      <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth="8"
        />
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="hsl(var(--accent))"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          className="transition-all duration-700"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-base font-black text-[hsl(var(--foreground))]">
          {paidPercent.toFixed(0)}%
        </span>
        <span className="text-[9px] font-bold uppercase tracking-widest text-[hsl(var(--muted-foreground))]">
          Paid
        </span>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function OrderPaymentView({ orderId }: { orderId: string }) {
  const router = useRouter();
  const { data: order, isLoading, isError } = useOrderDetail(orderId);
  const fundPayment = useFundWalletPayment();

  const [selectedPercent, setSelectedPercent] = useState<number>(100);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("wallet");
  const [selectedProvider, setSelectedProvider] = useState<GatewayProvider>("paystack");

  const percentOptions = useMemo(() => {
    if (!order) return [100];
    return order.cash_payment_mode_snapshot === "disabled" ? [100] : [30, 50, 70, 100];
  }, [order]);

  const showCod = useMemo(
    () =>
      order?.cash_payment_mode_snapshot === "cod" ||
      order?.cash_payment_mode_snapshot === "both",
    [order],
  );

  const showPayAtShop = useMemo(
    () =>
      order?.cash_payment_mode_snapshot === "pay_at_shop" ||
      order?.cash_payment_mode_snapshot === "both",
    [order],
  );

  const visibleMethods = METHOD_CONFIGS.filter((m) => {
    if (m.value === "cod") return showCod;
    if (m.value === "pay_at_shop") return showPayAtShop;
    return true;
  });

  const computedAmount = useMemo(() => {
    if (!order) return 0;
    const outstanding = parseFloat(order.amount_outstanding);
    return (outstanding * selectedPercent) / 100;
  }, [order, selectedPercent]);

  const paidPercent = order ? Math.min(100, parseFloat(order.percent_paid_total)) : 0;

  async function handleSubmit() {
    if (!order) return;
    try {
      const response = await fundPayment.mutateAsync({
        order_id: order.id,
        purpose: "order_payment",
        provider: (
          selectedMethod === "wallet"
            ? "wallet"
            : selectedMethod === "gateway"
              ? selectedProvider
              : "wallet" // cod / pay_at_shop: payment_path carries the mode; provider defaults to wallet
        ) as PaymentProvider,
        selected_percent: selectedPercent,
        payment_path:
          selectedMethod === "wallet"
            ? "wallet"
            : selectedMethod === "gateway"
              ? "gateway"
              : selectedMethod,
        cash_payment_mode: order.cash_payment_mode_snapshot,
        metadata: { order_number: order.order_number },
      });

      if (response.authorization_url) {
        window.location.href = response.authorization_url;
        return;
      }

      toast.success("Payment recorded successfully! 🎉");
      router.push(`/client/dashboard/orders/${order.id}/confirmation`);
    } catch {
      toast.error("Payment could not be processed. Please retry.");
    }
  }

  // ── Loading / Error ────────────────────────────────────────────────────────

  if (isLoading) return <PaymentSkeleton />;

  if (isError || !order) {
    return (
      <div className="rounded-[2rem] border border-[hsl(var(--destructive)/0.2)] bg-red-50 p-12 text-center">
        <Package className="mx-auto mb-4 h-10 w-10 text-red-400" />
        <p className="text-sm font-semibold text-red-700">
          Payment page could not be loaded.
        </p>
        <Link
          href={`/client/dashboard/orders/${orderId}`}
          className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-[hsl(var(--accent))]"
        >
          <ArrowLeft className="h-4 w-4" /> Back to order
        </Link>
      </div>
    );
  }

  // ── Fully paid guard ───────────────────────────────────────────────────────

  if (order.is_fully_paid) {
    return (
      <div className="flex flex-col items-center gap-5 rounded-[2rem] border border-emerald-200 bg-emerald-50 p-12 text-center">
        <BadgeCheck className="h-14 w-14 text-emerald-600" />
        <p className="text-xl font-bold text-emerald-700">Order fully paid!</p>
        <p className="text-sm text-emerald-600">
          No outstanding balance for {order.order_number}.
        </p>
        <Link
          href={`/client/dashboard/orders/${order.id}`}
          className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-emerald-700"
        >
          <ShoppingBag className="h-4 w-4" /> View Order
        </Link>
      </div>
    );
  }

  return (
    <section className="flex flex-col gap-6 px-4 py-6 md:px-8 lg:px-10">
      {/* ── Back Link ───────────────────────────────────────────────────────── */}
      <Link
        href={`/client/dashboard/orders/${order.id}`}
        className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-[hsl(var(--accent))] transition hover:opacity-70"
      >
        <ArrowLeft className="h-4 w-4" /> Back to order
      </Link>

      {/* ── Order Summary Card ───────────────────────────────────────────────── */}
      <div className="rounded-[2rem] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-[var(--card-shadow)]">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-bon_foyage text-4xl text-[hsl(var(--foreground))] md:text-5xl">
              Order Payment
            </h1>
            <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">
              {order.order_number}
            </p>
          </div>

          {/* Payment Ring */}
          <div className="relative flex shrink-0 items-center justify-center">
            <PaymentRing paidPercent={paidPercent} />
          </div>
        </div>

        {/* Metrics */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Metric label="Order Total" value={formatNGN(order.final_total)} />
          <Metric label="Amount Paid" value={formatNGN(order.amount_paid_total)} />
          <Metric label="Outstanding" value={formatNGN(order.amount_outstanding)} highlight />
          <Metric label="Progress" value={`${paidPercent.toFixed(1)}%`} />
        </div>
      </div>

      {/* ── Choose Amount ────────────────────────────────────────────────────── */}
      <div className="rounded-[2rem] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-[var(--card-shadow)]">
        <h2 className="mb-4 text-base font-bold text-[hsl(var(--foreground))]">
          Choose Payment Amount
        </h2>
        <div className="flex flex-wrap gap-3">
          {percentOptions.map((percent) => {
            const amt = (parseFloat(order.amount_outstanding) * percent) / 100;
            const isActive = selectedPercent === percent;
            return (
              <button
                key={percent}
                type="button"
                onClick={() => setSelectedPercent(percent)}
                className={`flex flex-col items-center rounded-2xl border-2 px-5 py-4 text-center transition-all ${
                  isActive
                    ? "border-[hsl(var(--accent))] bg-[hsl(var(--accent)/0.06)] text-[hsl(var(--accent))]"
                    : "border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--foreground))] hover:border-[hsl(var(--accent)/0.3)]"
                }`}
              >
                <span className="text-xl font-black">{percent}%</span>
                <span className="mt-0.5 text-xs font-semibold text-[hsl(var(--muted-foreground))]">
                  {formatNGN(amt)}
                </span>
              </button>
            );
          })}
        </div>
        <p className="mt-4 text-sm font-semibold text-[hsl(var(--foreground))]">
          You will pay:{" "}
          <span className="text-[hsl(var(--accent))]">{formatNGN(computedAmount)}</span>
        </p>
      </div>

      {/* ── Choose Payment Method ────────────────────────────────────────────── */}
      <div className="rounded-[2rem] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-[var(--card-shadow)]">
        <h2 className="mb-4 text-base font-bold text-[hsl(var(--foreground))]">
          Payment Method
        </h2>

        <div className="grid gap-3 sm:grid-cols-2">
          {visibleMethods.map(({ value, label, description, icon: Icon }) => {
            const isActive = selectedMethod === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => setSelectedMethod(value)}
                className={`flex items-start gap-4 rounded-2xl border-2 p-4 text-left transition-all ${
                  isActive
                    ? "border-[hsl(var(--accent))] bg-[hsl(var(--accent)/0.06)]"
                    : "border-[hsl(var(--border))] bg-[hsl(var(--card))] hover:border-[hsl(var(--accent)/0.3)]"
                }`}
              >
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                    isActive
                      ? "bg-[hsl(var(--accent))] text-white"
                      : "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p
                    className={`font-bold ${
                      isActive
                        ? "text-[hsl(var(--accent))]"
                        : "text-[hsl(var(--foreground))]"
                    }`}
                  >
                    {label}
                  </p>
                  <p className="mt-0.5 text-xs text-[hsl(var(--muted-foreground))]">
                    {description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Gateway provider selector */}
        {selectedMethod === "gateway" && (
          <div className="mt-6">
            <p className="mb-3 text-sm font-bold text-[hsl(var(--foreground))]">
              Gateway Provider
            </p>
            <div className="flex flex-wrap gap-3">
              {GATEWAY_PROVIDERS.map(({ value, label }) => {
                const isActive = selectedProvider === value;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setSelectedProvider(value)}
                    className={`rounded-xl border-2 px-5 py-3 text-sm font-bold transition-all ${
                      isActive
                        ? "border-[hsl(var(--accent))] bg-[hsl(var(--accent)/0.08)] text-[hsl(var(--accent))]"
                        : "border-[hsl(var(--border))] text-[hsl(var(--foreground))] hover:border-[hsl(var(--accent)/0.3)]"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Submit CTA */}
        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            disabled={fundPayment.isPending}
            onClick={handleSubmit}
            className="inline-flex items-center justify-center gap-3 rounded-full bg-[hsl(var(--accent))] px-8 py-4 text-base font-bold text-[hsl(var(--accent-foreground))] shadow-md transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {fundPayment.isPending ? (
              <>
                <RefreshCw className="h-5 w-5 animate-spin" /> Processing…
              </>
            ) : (
              <>
                <CreditCard className="h-5 w-5" />
                Pay {formatNGN(computedAmount)}
              </>
            )}
          </button>

          <div className="flex items-center gap-2 text-xs text-[hsl(var(--muted-foreground))]">
            <LockKeyhole className="h-3.5 w-3.5" />
            256-bit SSL encrypted · Escrow-protected
          </div>
        </div>
      </div>

      {/* ── Payment Timeline ─────────────────────────────────────────────────── */}
      {order.payment_records.length > 0 && (
        <div className="rounded-[2rem] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-[var(--card-shadow)]">
          <h2 className="mb-4 text-base font-bold text-[hsl(var(--foreground))]">
            Payment Timeline
          </h2>
          <div className="space-y-3">
            {order.payment_records.map((record) => (
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
                  Remaining: {formatNGN(record.remaining_amount)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
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
        className={`mt-1 text-sm font-bold ${
          highlight ? "text-[hsl(var(--accent))]" : "text-[hsl(var(--foreground))]"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
