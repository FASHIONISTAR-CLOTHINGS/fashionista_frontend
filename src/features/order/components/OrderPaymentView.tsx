"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useOrderDetail } from "../hooks/use-order";
import { useFundWalletPayment } from "@/features/payment";

type PaymentMethod = "wallet" | "gateway" | "cod" | "pay_at_shop";

const PROVIDERS = [
  { value: "wallet", label: "Wallet" },
  { value: "paystack", label: "Paystack" },
  { value: "flutterwave", label: "Flutterwave" },
  { value: "olive_pay", label: "Olive Pay" },
] as const;

export default function OrderPaymentView({ orderId }: { orderId: string }) {
  const router = useRouter();
  const { data: order, isLoading, isError } = useOrderDetail(orderId);
  const fundPayment = useFundWalletPayment();
  const [selectedPercent, setSelectedPercent] = useState<number>(100);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("wallet");
  const [selectedProvider, setSelectedProvider] = useState<(typeof PROVIDERS)[number]["value"]>("paystack");

  const percentOptions = useMemo(() => {
    if (!order) return [100];
    return order.cash_payment_mode_snapshot === "disabled"
      ? [100]
      : [30, 50, 70, 100];
  }, [order]);

  const showCod = order?.cash_payment_mode_snapshot === "cod" || order?.cash_payment_mode_snapshot === "both";
  const showPayAtShop =
    order?.cash_payment_mode_snapshot === "pay_at_shop" || order?.cash_payment_mode_snapshot === "both";
  const providerOptions =
    selectedMethod === "gateway"
      ? PROVIDERS.filter((provider) => provider.value !== "wallet")
      : selectedMethod === "wallet"
        ? PROVIDERS.filter((provider) => provider.value === "wallet")
        : PROVIDERS;

  async function handleSubmit(method: PaymentMethod) {
    if (!order) return;
    try {
      const response = await fundPayment.mutateAsync({
        order_id: order.id,
        purpose: "order_payment",
        provider:
          method === "wallet"
            ? "wallet"
            : method === "gateway"
              ? selectedProvider === "wallet"
                ? "paystack"
                : selectedProvider
              : selectedProvider,
        selected_percent: selectedPercent,
        payment_path: method === "wallet" ? "wallet" : method === "gateway" ? "gateway" : method,
        cash_payment_mode: order.cash_payment_mode_snapshot,
        metadata: {
          order_number: order.order_number,
        },
      });
      if (response.authorization_url) {
        window.location.href = response.authorization_url;
        return;
      }
      toast.success("Payment recorded successfully.");
      router.push(`/client/dashboard/orders/${order.id}`);
      router.refresh();
    } catch {
      toast.error("Payment could not be processed.");
    }
  }

  if (isLoading) {
    return <div className="h-48 animate-pulse rounded-xl bg-white shadow-sm" />;
  }

  if (isError || !order) {
    return (
      <div className="rounded-xl bg-white p-8 text-sm text-red-600 shadow-sm">
        Payment page could not be loaded.
      </div>
    );
  }

  return (
    <section className="flex flex-col gap-6">
      <Link href={`/client/dashboard/orders/${order.id}`} className="inline-flex items-center gap-2 text-sm font-medium text-[#01454A]">
        <ArrowLeft size={16} />
        Back to order
      </Link>

      <div className="rounded-xl bg-white p-6 shadow-sm">
        <h1 className="font-bon_foyage text-4xl text-black">Order Payment</h1>
        <p className="mt-2 text-sm text-[#5A6465]">{order.order_number}</p>

        <div className="mt-6 grid gap-3 sm:grid-cols-4">
          <Metric label="Total" value={`${order.currency} ${Number(order.final_total).toLocaleString("en-NG")}`} />
          <Metric label="Paid" value={`${order.currency} ${Number(order.amount_paid_total).toLocaleString("en-NG")}`} />
          <Metric label="Outstanding" value={`${order.currency} ${Number(order.amount_outstanding).toLocaleString("en-NG")}`} />
          <Metric label="Progress" value={`${Number(order.percent_paid_total).toFixed(2)}%`} />
        </div>
      </div>

      <div className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="text-base font-semibold text-black">Choose Amount</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          {percentOptions.map((percent) => (
            <button
              key={percent}
              type="button"
              onClick={() => setSelectedPercent(percent)}
              className={`rounded-lg border px-4 py-3 text-sm font-semibold transition ${
                selectedPercent === percent
                  ? "border-[#01454A] bg-[#01454A] text-white"
                  : "border-[#D9E1E2] bg-white text-[#01454A]"
              }`}
            >
              {percent}%
            </button>
          ))}
        </div>
        <p className="mt-3 text-sm text-[#5A6465]">
          Cash mode for this order: {order.cash_payment_mode_snapshot.replace(/_/g, " ")}
        </p>
      </div>

      <div className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="text-base font-semibold text-black">Choose Payment Method</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <MethodButton label="Pay from Wallet" active={selectedMethod === "wallet"} onClick={() => setSelectedMethod("wallet")} />
          <MethodButton label="Pay with Gateway" active={selectedMethod === "gateway"} onClick={() => setSelectedMethod("gateway")} />
          {showCod && <MethodButton label="Cash on Delivery" active={selectedMethod === "cod"} onClick={() => setSelectedMethod("cod")} />}
          {showPayAtShop && (
            <MethodButton
              label="Pay at Shop"
              active={selectedMethod === "pay_at_shop"}
              onClick={() => setSelectedMethod("pay_at_shop")}
            />
          )}
        </div>

        {selectedMethod !== "wallet" && (
          <div className="mt-6 space-y-3">
            <p className="text-sm font-semibold text-black">
              {selectedMethod === "gateway" ? "Choose Gateway Provider" : "Choose Commitment Source"}
            </p>
            <div className="flex flex-wrap gap-3">
              {providerOptions.map((provider) => (
                <button
                  key={provider.value}
                  type="button"
                  onClick={() => setSelectedProvider(provider.value)}
                  className={`rounded-lg border px-4 py-3 text-sm font-semibold transition ${
                    selectedProvider === provider.value
                      ? "border-[#FDA600] bg-[#FFF7E1] text-[#01454A]"
                      : "border-[#D9E1E2] bg-white text-[#01454A]"
                  }`}
                >
                  {provider.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <button
          type="button"
          disabled={fundPayment.isPending}
          onClick={() => handleSubmit(selectedMethod)}
          className="mt-6 inline-flex items-center rounded-lg bg-[#01454A] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#01383C] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {fundPayment.isPending ? "Processing..." : "Continue"}
        </button>
      </div>

      <div className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="text-base font-semibold text-black">Payment Timeline</h2>
        <div className="mt-4 space-y-3">
          {order.payment_records.length > 0 ? (
            order.payment_records.map((record) => (
              <div key={`${record.sequence_number}-${record.correlation_id}`} className="rounded-lg border border-[#E9ECEF] p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-black">
                    Payment #{record.sequence_number} - {record.selected_percent}%
                  </p>
                  <p className="text-sm text-[#01454A]">
                    {record.currency} {Number(record.amount).toLocaleString("en-NG")}
                  </p>
                </div>
                <p className="mt-2 text-xs text-[#5A6465]">
                  Remaining balance: {record.currency} {Number(record.remaining_amount).toLocaleString("en-NG")}
                </p>
              </div>
            ))
          ) : (
            <p className="text-sm text-[#5A6465]">No payments have been recorded yet.</p>
          )}
        </div>
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-[#F8F9FC] px-4 py-3">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-[#858585]">{label}</p>
      <p className="mt-1 text-sm font-semibold capitalize text-black">{value}</p>
    </div>
  );
}

function MethodButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg border px-4 py-4 text-left text-sm font-semibold transition ${
        active
          ? "border-[#01454A] bg-[#01454A] text-white"
          : "border-[#D9E1E2] bg-white text-[#01454A]"
      }`}
    >
      {label}
    </button>
  );
}
