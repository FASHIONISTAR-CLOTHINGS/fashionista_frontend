"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ExternalLink,
  Loader2,
  PackageCheck,
  Palette,
  Plus,
  Send,
  Sparkles,
  X,
  ZapIcon,
} from "lucide-react";

import { clientApi } from "@/features/client/api/client.api";
import type {
  CustomOrder,
  CustomOrderCreatePayload,
  MilestonePct,
} from "@/features/client/types/client.types";

// ── Utilities ─────────────────────────────────────────────────────────────────
function fmtNgn(n: number): string {
  return `₦${n.toLocaleString("en-NG", { minimumFractionDigits: 0 })}`;
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; bg: string; text: string }> = {
    draft:        { label: "Draft",         bg: "#F3F4F6", text: "#6B7280" },
    submitted:    { label: "Submitted",     bg: "#DBEAFE", text: "#1E40AF" },
    approved:     { label: "Approved",      bg: "#D1FAE5", text: "#065F46" },
    in_production:{ label: "In Production", bg: "#EDE9FE", text: "#6D28D9" },
    completed:    { label: "Completed",     bg: "#D1FAE5", text: "#065F46" },
    cancelled:    { label: "Cancelled",     bg: "#F3F4F6", text: "#6B7280" },
    disputed:     { label: "Disputed",      bg: "#FEE2E2", text: "#991B1B" },
  };
  const s = map[status] ?? { label: status, bg: "#F3F4F6", text: "#6B7280" };
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
      style={{ backgroundColor: s.bg, color: s.text }}
    >
      {s.label}
    </span>
  );
}

function MilestoneProgress({ milestones, agreedAmount }: {
  milestones: CustomOrder["milestones"];
  agreedAmount?: number;
}) {
  if (!milestones.length) return null;
  const paidPct = milestones
    .filter((m) => m.payment_status === "paid")
    .reduce((acc, m) => acc + m.milestone_pct, 0);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs font-bold uppercase tracking-[0.15em] text-[#7A6B44]">
        <span>Payment Progress</span>
        <span>{paidPct}% paid</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-[#ECE6D6]">
        <div
          className="h-full rounded-full bg-[#FDA600] transition-all duration-700"
          style={{ width: `${paidPct}%` }}
        />
      </div>
      <div className="flex gap-2">
        {milestones.map((m) => {
          const isPaid = m.payment_status === "paid";
          const isPending = m.payment_status === "pending";
          return (
            <div key={m.id} className="flex-1">
              <div
                className={`flex h-7 items-center justify-center rounded-lg text-[10px] font-bold ${
                  isPaid
                    ? "bg-[#FDA600] text-black"
                    : isPending
                    ? "border border-[#ECE6D6] bg-white text-[#7A6B44]"
                    : "bg-[#F3F4F6] text-[#6B7280]"
                }`}
              >
                {isPaid && <Check className="mr-1 h-2.5 w-2.5" />}
                {m.milestone_pct}%
              </div>
              {agreedAmount && (
                <p className="mt-1 text-center text-[9px] text-[#A89A7A]">
                  {fmtNgn((agreedAmount * m.milestone_pct) / 100)}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Custom Order Card ─────────────────────────────────────────────────────────
function CustomOrderCard({
  order,
  onPayMilestone,
}: {
  order: CustomOrder;
  onPayMilestone: (orderId: string, pct: MilestonePct) => Promise<void>;
}) {
  const [paying, setPaying] = useState(false);
  const nextMilestone = order.milestones.find((m) => m.payment_status === "pending");

  const handlePay = async () => {
    if (!nextMilestone) return;
    setPaying(true);
    try {
      await onPayMilestone(order.id, nextMilestone.milestone_pct as MilestonePct);
    } finally {
      setPaying(false);
    }
  };

  return (
    <div className="overflow-hidden rounded-[24px] border border-[#ECE6D6] bg-white shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between gap-4 px-6 py-5">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-xs font-bold uppercase tracking-[0.1em] text-[#7A6B44]">
              {order.reference}
            </p>
            <StatusBadge status={order.status} />
          </div>
          <p className="mt-2 text-sm font-semibold text-black">Vendor: {order.vendor_store_name}</p>
          <p className="mt-1 line-clamp-2 text-sm leading-6 text-[#5A6465]">{order.design_brief}</p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-xs text-[#7A6B44]">Budget</p>
          <p className="font-semibold text-black">{fmtNgn(order.budget_ngn)}</p>
        </div>
      </div>

      {/* Milestone progress */}
      {order.milestones.length > 0 && (
        <div className="border-t border-[#ECE6D6] px-6 py-4">
          <MilestoneProgress milestones={order.milestones} agreedAmount={order.budget_ngn} />
        </div>
      )}

      {/* Vendor narration */}
      {order.vendor_approval_note && (
        <div className="border-t border-[#ECE6D6] bg-[#F8F5ED] px-6 py-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#7A6B44]">Vendor Note</p>
          <p className="mt-1 text-sm leading-6 text-[#5A6465]">{order.vendor_approval_note}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between border-t border-[#ECE6D6] px-6 py-4">
        <p className="text-[10px] text-[#A89A7A]">
          {new Date(order.created_at).toLocaleDateString("en-NG", {
            day: "numeric", month: "long", year: "numeric",
          })}
        </p>
        <div className="flex items-center gap-2">
          <Link
            href={`/client/dashboard/custom-orders/${order.id}`}
            className="flex items-center gap-1 text-xs font-semibold text-[#01454A] hover:underline"
          >
            View Details <ExternalLink className="h-3 w-3" />
          </Link>
          {nextMilestone && (order.status === "approved" || order.status === "in_production") && (
            <button
              type="button"
              onClick={handlePay}
              disabled={paying}
              className="inline-flex items-center gap-1.5 rounded-full bg-[#FDA600] px-4 py-1.5 text-xs font-bold text-black transition hover:bg-[#f28705] disabled:opacity-60"
            >
              {paying ? <Loader2 className="h-3 w-3 animate-spin" /> : <ZapIcon className="h-3 w-3" />}
              Pay {nextMilestone.milestone_pct}%
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── 4-step creation wizard ────────────────────────────────────────────────────
function CreateCustomOrderModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<Partial<CustomOrderCreatePayload>>({
    design_brief: "",
    budget_ngn: 0,
    vendor_id: "",
    product_snapshot_id: "",
    order_snapshot_id: "",
    reference_images: [],
  });

  const createMutation = useMutation({
    mutationFn: (payload: CustomOrderCreatePayload) => clientApi.createCustomOrder(payload),
    onSuccess: (newOrder) => {
      void queryClient.invalidateQueries({ queryKey: ["client-custom-orders"] });
      onClose();
      router.push(`/client/dashboard/custom-orders/${newOrder.id}`);
    },
  });

  const STEPS = ["Starting Point", "Design Brief", "Select Vendor", "Review & Submit"];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-xl overflow-hidden rounded-[32px] bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#ECE6D6] px-7 py-5">
          <div>
            <h2 className="text-lg font-semibold text-black">New Custom Order</h2>
            <p className="text-xs text-[#5A6465]">Step {step} of {STEPS.length} — {STEPS[step - 1]}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-full p-1.5 hover:bg-[#F4F3EC]">
            <X className="h-4 w-4 text-[#5A6465]" />
          </button>
        </div>

        {/* Step progress bar */}
        <div className="flex h-1.5 bg-[#F4F3EC]">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`flex-1 transition-all duration-300 ${i < step ? "bg-[#FDA600]" : "bg-transparent"}`}
            />
          ))}
        </div>

        <div className="max-h-[60vh] overflow-y-auto px-7 py-6">
          {/* Step 1: Starting point */}
          {step === 1 && (
            <div className="space-y-3">
              <p className="text-sm font-semibold text-black">Start your bespoke order from:</p>
              {[
                { label: "A product I saw", value: "product", desc: "Use a Fashionistar product as your style reference" },
                { label: "A previous order", value: "order", desc: "Recreate or modify something you've ordered before" },
                { label: "From scratch", value: "scratch", desc: "Describe your vision entirely in the design brief" },
              ].map((opt) => (
                <label
                  key={opt.value}
                  className={`flex cursor-pointer items-start gap-4 rounded-[20px] border p-4 transition hover:border-[#FDA600] ${
                    (form.product_snapshot_id === "" && form.order_snapshot_id === "" && opt.value === "scratch") ||
                    (opt.value === "product" && form.product_snapshot_id) ||
                    (opt.value === "order" && form.order_snapshot_id)
                      ? "border-[#FDA600] bg-[#FFFDF5]"
                      : "border-[#ECE6D6]"
                  }`}
                >
                  <input type="radio" name="starting_point" value={opt.value} className="mt-1 accent-[#FDA600]"
                    onChange={() => {
                      if (opt.value === "scratch") setForm((f) => ({ ...f, product_snapshot_id: "", order_snapshot_id: "" }));
                    }}
                  />
                  <div>
                    <p className="text-sm font-semibold text-black">{opt.label}</p>
                    <p className="text-xs text-[#5A6465]">{opt.desc}</p>
                  </div>
                </label>
              ))}
              {form.product_snapshot_id !== undefined && (
                <input
                  className="mt-2 h-12 w-full rounded-[16px] border border-[#D9D9D9] bg-white px-4 text-sm outline-none focus:border-[#FDA600]"
                  placeholder="Product ID or URL (optional)"
                  value={form.product_snapshot_id}
                  onChange={(e) => setForm((f) => ({ ...f, product_snapshot_id: e.target.value }))}
                />
              )}
            </div>
          )}

          {/* Step 2: Design brief + budget */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-black">Design Brief *</label>
                <textarea
                  value={form.design_brief}
                  onChange={(e) => setForm((f) => ({ ...f, design_brief: e.target.value }))}
                  placeholder="Describe your custom garment in detail — fabric type, colours, occasion, fit, special requests..."
                  className="min-h-[140px] w-full rounded-[18px] border border-[#D9D9D9] bg-white px-4 py-4 text-sm text-black outline-none focus:border-[#FDA600]"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-black">Your Budget (NGN)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-[#5A6465]">₦</span>
                  <input
                    type="number"
                    value={form.budget_ngn || ""}
                    onChange={(e) => setForm((f) => ({ ...f, budget_ngn: Number(e.target.value) }))}
                    placeholder="50000"
                    className="h-14 w-full rounded-[18px] border border-[#D9D9D9] bg-white pl-8 pr-4 text-sm text-black outline-none focus:border-[#FDA600]"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  {[20000, 50000, 100000, 200000].map((amt) => (
                    <button key={amt} type="button" onClick={() => setForm((f) => ({ ...f, budget_ngn: amt }))}
                      className="rounded-full border border-[#ECE6D6] px-3 py-1.5 text-xs font-semibold text-[#5A6465] hover:border-[#FDA600] hover:text-black">
                      {fmtNgn(amt)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Select vendor */}
          {step === 3 && (
            <div className="space-y-3">
              <p className="text-sm font-semibold text-black">Choose a vendor for your commission:</p>
              <div className="space-y-2">
                <input
                  className="h-12 w-full rounded-[16px] border border-[#D9D9D9] bg-white px-4 text-sm outline-none focus:border-[#FDA600]"
                  placeholder="Vendor ID or store name"
                  value={form.vendor_id}
                  onChange={(e) => setForm((f) => ({ ...f, vendor_id: e.target.value }))}
                />
                <p className="text-xs text-[#5A6465]">
                  You can find vendor IDs by browsing{" "}
                  <Link href="/" className="text-[#01454A] underline">our catalog</Link>{" "}
                  and visiting their store.
                </p>
              </div>
            </div>
          )}

          {/* Step 4: Review */}
          {step === 4 && (
            <div className="space-y-4 rounded-[20px] bg-[#F8F5ED] p-5">
              <p className="text-sm font-bold text-black">Review Your Order</p>
              <div className="space-y-2 divide-y divide-[#ECE6D6]">
                {[
                  ["Vendor ID", form.vendor_id || "—"],
                  ["Budget", form.budget_ngn ? fmtNgn(form.budget_ngn) : "—"],
                  ["Product Reference", form.product_snapshot_id || "None"],
                  ["Order Reference", form.order_snapshot_id || "None"],
                ].map(([label, val]) => (
                  <div key={label} className="flex items-start justify-between gap-4 py-2.5">
                    <span className="text-xs font-semibold text-[#7A6B44]">{label}</span>
                    <span className="text-right text-sm text-black">{val}</span>
                  </div>
                ))}
                <div className="pt-3">
                  <p className="text-xs font-semibold text-[#7A6B44]">Design Brief</p>
                  <p className="mt-1 text-sm leading-6 text-black">{form.design_brief || "—"}</p>
                </div>
              </div>
              {createMutation.isError && (
                <p className="text-xs text-red-500">
                  Failed to submit. Please check your vendor ID and try again.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer navigation */}
        <div className="flex items-center justify-between border-t border-[#ECE6D6] px-7 py-5">
          <button
            type="button"
            onClick={() => (step > 1 ? setStep((s) => s - 1) : onClose())}
            className="flex items-center gap-2 rounded-full border border-[#ECE6D6] px-4 py-2.5 text-sm font-semibold text-[#5A6465] hover:bg-[#F8F5ED]"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            {step === 1 ? "Cancel" : "Back"}
          </button>
          {step < 4 ? (
            <button
              type="button"
              onClick={() => setStep((s) => s + 1)}
              disabled={step === 2 && (!form.design_brief || !form.budget_ngn)}
              className="inline-flex items-center gap-2 rounded-full bg-[#FDA600] px-5 py-2.5 text-sm font-semibold text-black disabled:opacity-50"
            >
              Next <ArrowRight className="h-3.5 w-3.5" />
            </button>
          ) : (
            <button
              type="button"
              disabled={createMutation.isPending || !form.vendor_id}
              onClick={() => {
                if (form.vendor_id && form.design_brief && form.budget_ngn) {
                  createMutation.mutate({
                    vendor_id: form.vendor_id,
                    design_brief: form.design_brief,
                    budget_ngn: form.budget_ngn,
                    product_snapshot_id: form.product_snapshot_id || undefined,
                    order_snapshot_id: form.order_snapshot_id || undefined,
                  });
                }
              }}
              className="inline-flex items-center gap-2 rounded-full bg-[#FDA600] px-5 py-2.5 text-sm font-bold text-black disabled:opacity-50"
            >
              {createMutation.isPending ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Submitting...</>
              ) : (
                <><Send className="h-4 w-4" /> Submit to Vendor</>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main Custom Orders View ────────────────────────────────────────────────────
export function ClientCustomOrderView() {
  const [statusFilter, setStatusFilter] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const queryClient = useQueryClient();

  const { data: customOrders = [], isLoading } = useQuery({
    queryKey: ["client-custom-orders", statusFilter],
    queryFn: () => clientApi.getCustomOrders(statusFilter ? { status: statusFilter } : undefined),
    staleTime: 30_000,
  });

  const handlePayMilestone = async (orderId: string, pct: MilestonePct) => {
    await clientApi.payMilestone(orderId, { milestone_pct: pct, payment_method: "wallet" });
    await queryClient.invalidateQueries({ queryKey: ["client-custom-orders"] });
  };

  const STATUS_FILTERS = [
    { value: "", label: "All" },
    { value: "submitted", label: "Submitted" },
    { value: "approved", label: "Approved" },
    { value: "in_production", label: "In Production" },
    { value: "completed", label: "Completed" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-bon_foyage text-4xl text-black">Custom Orders</h1>
          <p className="mt-1 text-sm text-[#5A6465]">
            Bespoke commissions with milestone payments (30 / 50 / 70 / 100%).
          </p>
        </div>
        <button
          type="button"
          id="create-custom-order-btn"
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center gap-2 rounded-full bg-[#FDA600] px-5 py-3 text-sm font-semibold text-black shadow-sm transition hover:bg-[#f28705]"
        >
          <Plus className="h-4 w-4" /> New Custom Order
        </button>
      </div>

      {/* How it works banner */}
      <div className="grid grid-cols-2 gap-3 rounded-[24px] bg-gradient-to-r from-[#01454A] to-[#012d31] p-5 text-white md:grid-cols-4">
        {[
          { label: "Submit Brief", icon: Send, desc: "Describe your design" },
          { label: "Vendor Approves", icon: Check, desc: "Agrees on price" },
          { label: "30% Deposit", icon: ZapIcon, desc: "Start production" },
          { label: "Progressive Pay", icon: PackageCheck, desc: "50→70→100% milestones" },
        ].map(({ label, icon: Icon, desc }) => (
          <div key={label} className="text-center">
            <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
              <Icon className="h-5 w-5 text-[#FDA600]" />
            </div>
            <p className="text-xs font-bold">{label}</p>
            <p className="mt-0.5 text-[10px] text-white/60">{desc}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setStatusFilter(f.value)}
            className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
              statusFilter === f.value
                ? "bg-[#FDA600] text-black"
                : "border border-[#ECE6D6] bg-white text-[#5A6465] hover:border-[#FDA600]"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-48 animate-pulse rounded-[24px] bg-white" />
          ))}
        </div>
      ) : customOrders.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-[32px] bg-white py-16 text-center shadow-sm">
          <Palette className="h-14 w-14 text-[#D9D9D9]" />
          <div>
            <p className="text-base font-semibold text-black">No custom orders yet</p>
            <p className="mt-1 text-sm text-[#5A6465]">
              Commission a bespoke garment from any Fashionistar vendor
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowCreate(true)}
            className="inline-flex items-center gap-2 rounded-full bg-[#FDA600] px-6 py-3 text-sm font-semibold text-black"
          >
            <Sparkles className="h-4 w-4" /> Start Your First Custom Order
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {customOrders.map((order) => (
            <CustomOrderCard
              key={order.id}
              order={order}
              onPayMilestone={handlePayMilestone}
            />
          ))}
        </div>
      )}

      {showCreate && <CreateCustomOrderModal onClose={() => setShowCreate(false)} />}
    </div>
  );
}
