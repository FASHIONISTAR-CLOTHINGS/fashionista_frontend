"use client";

import {
  Tag, Copy, Clock, CheckCircle2, XCircle,
} from "lucide-react";
import { useVendorCoupons } from "@/features/vendor/hooks/use-vendor-analytics";
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
  active: { label: "Active", Icon: CheckCircle2, cls: "badge-success" },
  expired: { label: "Expired", Icon: XCircle, cls: "badge-error" },
  scheduled: { label: "Scheduled", Icon: Clock, cls: "badge-warning" },
};

function CouponCard({ coupon }: { coupon: Coupon }) {
  const { label, Icon, cls } = statusConfig[coupon.status];

  const handleCopy = () => {
    navigator.clipboard.writeText(coupon.code);
  };

  return (
    <div className="flex flex-col gap-4 rounded-[1.5rem] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 shadow-[var(--card-shadow)] transition hover:shadow-[var(--card-hover-shadow)]">
      {/* Code row */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[hsl(var(--accent)/0.12)] text-[hsl(var(--accent))]">
            <Tag className="h-5 w-5" />
          </div>
          <div>
            <p className="font-mono text-lg font-bold tracking-widest text-[hsl(var(--foreground))]">
              {coupon.code}
            </p>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">
              {coupon.type === "percentage" ? `${coupon.value}% off` : `₦${coupon.value.toLocaleString()} off`}
              {" · "}min order ₦{coupon.minOrder.toLocaleString()}
            </p>
          </div>
        </div>
        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${cls}`}>
          <Icon className="h-3.5 w-3.5" /> {label}
        </span>
      </div>

      {/* Usage bar */}
      <div>
        <div className="mb-1.5 flex items-center justify-between text-xs text-[hsl(var(--muted-foreground))]">
          <span>{coupon.uses} / {coupon.maxUses} uses</span>
          <span>Expires {coupon.expiresAt}</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-[hsl(var(--muted))]">
          <div
            className="h-full rounded-full bg-[hsl(var(--accent))] transition-all"
            style={{ width: `${Math.min((coupon.uses / coupon.maxUses) * 100, 100)}%` }}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button type="button" onClick={handleCopy}
          className="flex items-center gap-1.5 rounded-full border border-[hsl(var(--border))] px-3 py-1.5 text-xs font-semibold text-[hsl(var(--foreground))] transition hover:bg-[hsl(var(--muted))]">
          <Copy className="h-3.5 w-3.5" /> Copy code
        </button>
      </div>
    </div>
  );
}

function mapCoupon(coupon: {
  id: number;
  code: string;
  discount: number;
  active: boolean;
  valid_until?: string;
}): Coupon {
  return {
    id: String(coupon.id),
    code: coupon.code,
    type: "percentage",
    value: coupon.discount,
    minOrder: 0,
    uses: 0,
    maxUses: 0,
    expiresAt: coupon.valid_until ?? "No expiry set",
    status: coupon.active ? "active" : "expired",
  };
}

export function VendorCouponsView() {
  const { data, isLoading, isError } = useVendorCoupons();
  const { data: dashboard } = useVendorDashboard();
  const sourceCoupons = data?.data ?? [];
  const coupons = sourceCoupons.map(mapCoupon);

  const stats = {
    total: data?.data ? coupons.length : ((dashboard?.coupons?.active ?? 0) + (dashboard?.coupons?.inactive ?? 0)),
    active: data?.data ? coupons.filter((c: Coupon) => c.status === "active").length : (dashboard?.coupons?.active ?? 0),
    totalUses: coupons.reduce((sum: number, c: Coupon) => sum + c.uses, 0),
  };

  return (
    <div className="space-y-8 py-4">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-bon_foyage text-5xl text-[hsl(var(--foreground))]">Coupons</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[hsl(var(--muted-foreground))]">
            Review live discount codes for your store. Coupon mutations stay disabled until the backend write contract is wired.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total coupons", value: stats.total },
          { label: "Active", value: stats.active },
          { label: "Total redemptions", value: stats.totalUses },
        ].map((s) => (
          <div key={s.label} className="rounded-[1.25rem] bg-[hsl(var(--card))] p-4 shadow-[var(--card-shadow)] text-center">
            <p className="font-bon_foyage text-3xl text-[hsl(var(--foreground))]">{s.value}</p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">{s.label}</p>
          </div>
        ))}
      </div>

      {isError ? (
        <div className="rounded-[1.5rem] border border-[#F2C9C9] bg-[#FFF7F7] p-5 text-sm text-[#8A3B3B] shadow-[var(--card-shadow)]">
          We could not load the coupon endpoint, so dashboard snapshot coupons are shown where available.
        </div>
      ) : null}

      {/* Coupon list */}
      <div className="grid gap-4 md:grid-cols-2">
        {isLoading ? (
          <div className="rounded-[1.5rem] bg-[hsl(var(--card))] p-5 text-sm text-[hsl(var(--muted-foreground))] shadow-[var(--card-shadow)]">
            Loading live coupons...
          </div>
        ) : null}
        {coupons.map((coupon: Coupon) => (
          <CouponCard key={coupon.id} coupon={coupon} />
        ))}
      </div>

      {coupons.length === 0 && (
        <div className="rounded-[2rem] bg-[hsl(var(--card))] p-12 text-center shadow-[var(--card-shadow)]">
          <Tag className="mx-auto h-10 w-10 text-[hsl(var(--muted-foreground))]" />
          <p className="mt-4 text-base font-semibold text-[hsl(var(--foreground))]">No coupons yet</p>
          <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">Live coupons will appear here after they are created by the backend workflow.</p>
        </div>
      )}
    </div>
  );
}
