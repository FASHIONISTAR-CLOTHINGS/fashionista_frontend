"use client";

import { useState } from "react";
import {
  Tag, Copy, Clock, CheckCircle2, XCircle, Plus, Trash2, X, AlertCircle, Percent, Coins
} from "lucide-react";
import { useVendorCoupons, useCreateCoupon, useDeactivateCoupon } from "@/features/vendor/hooks/use-vendor-analytics";
import { useVendorDashboard } from "@/features/vendor/hooks/use-vendor-setup";

type CouponStatus = "active" | "expired" | "scheduled";
interface Coupon {
  id: string;
  code: string;
  type: "percentage" | "fixed";
  value: number;
  minOrder: number;
  uses: number;
  maxUses: number;
  expiresAt: string;
  status: CouponStatus;
}

const statusConfig: Record<CouponStatus, { label: string; Icon: typeof CheckCircle2; cls: string }> = {
  active: { label: "Active", Icon: CheckCircle2, cls: "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" },
  expired: { label: "Inactive", Icon: XCircle, cls: "bg-rose-500/10 text-rose-500 border border-rose-500/20" },
  scheduled: { label: "Scheduled", Icon: Clock, cls: "bg-amber-500/10 text-amber-500 border border-amber-500/20" },
};

function CouponCard({ coupon }: { coupon: Coupon }) {
  const { label, Icon, cls } = statusConfig[coupon.status];
  const [copied, setCopied] = useState(false);
  const deactivateMutation = useDeactivateCoupon();

  const handleCopy = () => {
    navigator.clipboard.writeText(coupon.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDeactivate = () => {
    if (confirm(`Are you sure you want to deactivate and delete the coupon "${coupon.code}"?`)) {
      deactivateMutation.mutate(coupon.id);
    }
  };

  return (
    <div className="flex flex-col justify-between gap-5 rounded-[2rem] border border-[hsl(var(--brand-cream-dark))] bg-[hsl(var(--card))] p-6 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      {/* Code and Status Row */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#01454A]/10 text-[#01454A]">
            <Tag className="h-6 w-6" />
          </div>
          <div>
            <p className="font-mono text-xl font-black tracking-widest text-[#01454A]">
              {coupon.code}
            </p>
            <p className="mt-1 text-sm font-medium text-[hsl(var(--muted-foreground))]">
              {coupon.type === "percentage" ? `${coupon.value}% Off` : `₦${coupon.value.toLocaleString()} Off`}
            </p>
          </div>
        </div>
        <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${cls}`}>
          <Icon className="h-3.5 w-3.5" /> {label}
        </span>
      </div>

      {/* Expiry Details */}
      <div className="rounded-xl bg-[#F8F5ED] p-3 text-xs text-[#7A6B44]">
        <p className="flex items-center gap-1.5 font-semibold">
          <Clock className="h-3.5 w-3.5 text-[#FDA600]" />
          Expires on {coupon.expiresAt}
        </p>
      </div>

      {/* Action Buttons Row */}
      <div className="flex items-center gap-2 pt-2 border-t border-[hsl(var(--brand-cream-dark))]">
        <button
          type="button"
          onClick={handleCopy}
          className="flex flex-1 items-center justify-center gap-2 rounded-full border border-[#01454A]/20 bg-white px-4 py-2 text-xs font-bold text-[#01454A] transition hover:bg-[#F8F5ED] active:scale-95"
        >
          {copied ? (
            <>
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              Copy Code
            </>
          )}
        </button>
        <button
          type="button"
          onClick={handleDeactivate}
          disabled={deactivateMutation.isPending}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-rose-200 bg-rose-50 text-rose-600 transition hover:bg-rose-100 hover:text-rose-700 disabled:opacity-50 active:scale-95"
          title="Deactivate Coupon"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function mapCoupon(coupon: {
  id: string | number;
  code: string;
  discount: number;
  discount_type?: string;
  active: boolean;
  valid_until?: string;
}): Coupon {
  return {
    id: String(coupon.id),
    code: coupon.code,
    type: coupon.discount_type === "fixed" ? "fixed" : "percentage",
    value: coupon.discount,
    minOrder: 0,
    uses: 0,
    maxUses: 0,
    expiresAt: coupon.valid_until
      ? new Date(coupon.valid_until).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : "No expiry set",
    status: coupon.active ? "active" : "expired",
  };
}

export function VendorCouponsView() {
  const { data, isLoading, isError } = useVendorCoupons();
  const { data: dashboard } = useVendorDashboard();
  const createMutation = useCreateCoupon();

  // Modal form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState<"percentage" | "fixed">("percentage");
  const [discountValue, setDiscountValue] = useState("");
  const [minimumOrder, setMinimumOrder] = useState("0");
  const [validFrom, setValidFrom] = useState("");
  const [validTo, setValidTo] = useState("");
  const [active, setActive] = useState(true);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const rawCouponList = Array.isArray((data as { data?: unknown } | undefined)?.data)
    ? ((data as { data: { id: string | number; code: string; discount: number; discount_type?: string; active: boolean; valid_until?: string }[] }).data)
    : [];
  const coupons = rawCouponList.map(mapCoupon);

  const stats = {
    total: coupons.length > 0
      ? coupons.length
      : ((dashboard?.coupons?.active ?? 0) + (dashboard?.coupons?.inactive ?? 0)),
    active: coupons.length > 0
      ? coupons.filter((c: Coupon) => c.status === "active").length
      : (dashboard?.coupons?.active ?? 0),
    inactive: coupons.length > 0
      ? coupons.filter((c: Coupon) => c.status === "expired").length
      : (dashboard?.coupons?.inactive ?? 0),
  };

  const handleOpenModal = () => {
    setCode("");
    setDiscountType("percentage");
    setDiscountValue("");
    setMinimumOrder("0");
    setValidFrom(new Date().toISOString().substring(0, 16));
    setValidTo(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().substring(0, 16));
    setActive(true);
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleCreateCouponSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!code.trim()) errors.code = "Coupon code is required";
    if (!discountValue || Number(discountValue) <= 0) {
      errors.discountValue = "Discount value must be greater than 0";
    } else if (discountType === "percentage" && Number(discountValue) > 100) {
      errors.discountValue = "Percentage discount cannot exceed 100%";
    }
    if (Number(minimumOrder) < 0) errors.minimumOrder = "Minimum order cannot be negative";
    if (!validFrom) errors.validFrom = "Start date is required";
    if (!validTo) errors.validTo = "Expiry date is required";
    if (validFrom && validTo && new Date(validTo) <= new Date(validFrom)) {
      errors.validTo = "Expiry date must be after start date";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    createMutation.mutate(
      {
        code: code.toUpperCase().trim(),
        discount_type: discountType,
        discount_value: Number(discountValue),
        minimum_order: Number(minimumOrder),
        valid_from: new Date(validFrom).toISOString(),
        valid_to: new Date(validTo).toISOString(),
        active,
      },
      {
        onSuccess: () => {
          setIsModalOpen(false);
        },
      }
    );
  };

  return (
    <div className="space-y-8 py-4">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-bon_foyage text-5xl text-[#01454A]">Coupons</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[hsl(var(--muted-foreground))]">
            Manage your boutique's exclusive discount coupons to reward loyal shoppers and drive sales.
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpenModal}
          className="inline-flex items-center gap-2 rounded-full bg-[#FDA600] px-6 py-3 text-sm font-extrabold text-black transition hover:bg-[#E89500] active:scale-95 shadow-md shadow-[#FDA600]/20"
        >
          <Plus className="h-4 w-4" /> Create Coupon
        </button>
      </div>

      {/* Stats Panel */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { label: "Total coupons", value: stats.total, color: "text-[#01454A]" },
          { label: "Active coupons", value: stats.active, color: "text-emerald-600" },
          { label: "Inactive coupons", value: stats.inactive, color: "text-rose-500" },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-[1.5rem] border border-[hsl(var(--brand-cream-dark))] bg-[hsl(var(--card))] p-5 shadow-sm text-center transition hover:shadow-md"
          >
            <p className={`font-bon_foyage text-4xl font-black ${s.color}`}>{s.value}</p>
            <p className="mt-1.5 text-xs font-black uppercase tracking-widest text-[#7A6B44]">{s.label}</p>
          </div>
        ))}
      </div>

      {isError && (
        <div className="rounded-[1.5rem] border border-rose-200 bg-rose-50 p-5 text-sm text-rose-800 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 shrink-0 text-rose-500 mt-0.5" />
          <p>
            We encountered a connection issue while fetching the coupons endpoint. Dashboard backup stats are shown.
          </p>
        </div>
      )}

      {/* Coupon Grid */}
      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2">
          {[1, 2].map((i) => (
            <div key={i} className="animate-pulse rounded-[2rem] border border-[hsl(var(--brand-cream-dark))] bg-[hsl(var(--card))] p-6 h-48" />
          ))}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {coupons.map((coupon: Coupon) => (
            <CouponCard key={coupon.id} coupon={coupon} />
          ))}
        </div>
      )}

      {coupons.length === 0 && !isLoading && (
        <div className="rounded-[2.5rem] border border-dashed border-[#7A6B44]/20 bg-[hsl(var(--card))] p-16 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#01454A]/5 text-[#01454A]">
            <Tag className="h-8 w-8" />
          </div>
          <p className="mt-6 font-bon_foyage text-2xl text-[#01454A]">No coupons active</p>
          <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))] max-w-sm mx-auto">
            Design custom discount campaign codes to incentivize buyer checkouts. Click "Create Coupon" to begin.
          </p>
        </div>
      )}

      {/* Creation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative w-full max-w-lg overflow-hidden rounded-[2.5rem] border border-[hsl(var(--brand-cream-dark))] bg-[hsl(var(--card))] shadow-2xl transition-all animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[hsl(var(--brand-cream-dark))] bg-[#01454A] px-8 py-5 text-white">
              <h2 className="font-bon_foyage text-3xl">New Coupon</h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-full p-1.5 text-white/80 hover:bg-white/10 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateCouponSubmit} className="space-y-5 p-8 max-h-[80vh] overflow-y-auto">
              {/* Code */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-[#7A6B44] mb-2">
                  Coupon Code
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="E.G. SUMMER26"
                    className="w-full rounded-2xl border border-[hsl(var(--brand-cream-dark))] bg-[#F8F5ED] px-4 py-3.5 font-mono text-lg font-bold tracking-wider text-[#01454A] focus:outline-none focus:ring-2 focus:ring-[#FDA600] focus:border-transparent uppercase"
                  />
                </div>
                {formErrors.code && (
                  <p className="mt-1.5 text-xs font-semibold text-rose-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> {formErrors.code}
                  </p>
                )}
              </div>

              {/* Discount Type & Value Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-[#7A6B44] mb-2">
                    Discount Type
                  </label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as "percentage" | "fixed")}
                    className="w-full rounded-2xl border border-[hsl(var(--brand-cream-dark))] bg-white px-4 py-3 text-sm font-bold text-[#01454A] focus:outline-none focus:ring-2 focus:ring-[#FDA600]"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed (₦)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-[#7A6B44] mb-2">
                    Value
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[hsl(var(--muted-foreground))]">
                      {discountType === "percentage" ? <Percent className="h-4 w-4" /> : <Coins className="h-4 w-4" />}
                    </div>
                    <input
                      type="number"
                      value={discountValue}
                      onChange={(e) => setDiscountValue(e.target.value)}
                      placeholder={discountType === "percentage" ? "15" : "5000"}
                      className="w-full rounded-2xl border border-[hsl(var(--brand-cream-dark))] bg-white py-3 pl-10 pr-4 text-sm font-bold text-[#01454A] focus:outline-none focus:ring-2 focus:ring-[#FDA600]"
                    />
                  </div>
                  {formErrors.discountValue && (
                    <p className="mt-1.5 text-xs font-semibold text-rose-600 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" /> {formErrors.discountValue}
                    </p>
                  )}
                </div>
              </div>

              {/* Min Order & Active checkbox */}
              <div className="grid grid-cols-2 gap-4 items-center">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-[#7A6B44] mb-2">
                    Min. Order Subtotal (₦)
                  </label>
                  <input
                    type="number"
                    value={minimumOrder}
                    onChange={(e) => setMinimumOrder(e.target.value)}
                    className="w-full rounded-2xl border border-[hsl(var(--brand-cream-dark))] bg-white px-4 py-3 text-sm font-bold text-[#01454A] focus:outline-none focus:ring-2 focus:ring-[#FDA600]"
                  />
                  {formErrors.minimumOrder && (
                    <p className="mt-1.5 text-xs font-semibold text-rose-600 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" /> {formErrors.minimumOrder}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-3 pt-6 pl-2">
                  <input
                    type="checkbox"
                    id="coupon-active"
                    checked={active}
                    onChange={(e) => setActive(e.target.checked)}
                    className="h-5 w-5 rounded border-[hsl(var(--brand-cream-dark))] text-[#01454A] focus:ring-[#FDA600]"
                  />
                  <label htmlFor="coupon-active" className="text-sm font-bold text-[#01454A] select-none cursor-pointer">
                    Publish Active
                  </label>
                </div>
              </div>

              {/* Date Validity Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-[#7A6B44] mb-2">
                    Valid From
                  </label>
                  <div className="relative">
                    <input
                      type="datetime-local"
                      value={validFrom}
                      onChange={(e) => setValidFrom(e.target.value)}
                      className="w-full rounded-2xl border border-[hsl(var(--brand-cream-dark))] bg-white px-4 py-3 text-sm font-semibold text-[#01454A] focus:outline-none focus:ring-2 focus:ring-[#FDA600]"
                    />
                  </div>
                  {formErrors.validFrom && (
                    <p className="mt-1.5 text-xs font-semibold text-rose-600 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" /> {formErrors.validFrom}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-[#7A6B44] mb-2">
                    Valid To (Expiry)
                  </label>
                  <div className="relative">
                    <input
                      type="datetime-local"
                      value={validTo}
                      onChange={(e) => setValidTo(e.target.value)}
                      className="w-full rounded-2xl border border-[hsl(var(--brand-cream-dark))] bg-white px-4 py-3 text-sm font-semibold text-[#01454A] focus:outline-none focus:ring-2 focus:ring-[#FDA600]"
                    />
                  </div>
                  {formErrors.validTo && (
                    <p className="mt-1.5 text-xs font-semibold text-rose-600 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" /> {formErrors.validTo}
                    </p>
                  )}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-4 border-t border-[hsl(var(--brand-cream-dark))]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 rounded-full border border-[hsl(var(--brand-cream-dark))] py-3.5 text-sm font-black text-[#7A6B44] transition hover:bg-[#F8F5ED] active:scale-95"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="flex-1 rounded-full bg-[#01454A] py-3.5 text-sm font-black text-white transition hover:bg-[#1a2e14] disabled:opacity-50 active:scale-95"
                >
                  {createMutation.isPending ? "Creating..." : "Save Coupon"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

