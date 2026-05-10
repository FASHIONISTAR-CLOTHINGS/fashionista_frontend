"use client";

import { useState } from "react";
import {
  Plus, Tag, Copy, Trash2, Clock, CheckCircle2, XCircle,
} from "lucide-react";
import { DashInput, DashSelect, SaveBar } from "@/components/settings/settings-ui";

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

const MOCK_COUPONS: Coupon[] = [
  { id: "1", code: "FASH20", type: "percentage", value: 20, minOrder: 5000, uses: 34, maxUses: 100, expiresAt: "2026-06-30", status: "active" },
  { id: "2", code: "NEWCLIENT", type: "fixed", value: 2000, minOrder: 8000, uses: 12, maxUses: 50, expiresAt: "2026-05-15", status: "active" },
  { id: "3", code: "SUMMER10", type: "percentage", value: 10, minOrder: 3000, uses: 50, maxUses: 50, expiresAt: "2026-03-31", status: "expired" },
];

const statusConfig: Record<CouponStatus, { label: string; Icon: typeof CheckCircle2; cls: string }> = {
  active: { label: "Active", Icon: CheckCircle2, cls: "badge-success" },
  expired: { label: "Expired", Icon: XCircle, cls: "badge-error" },
  scheduled: { label: "Scheduled", Icon: Clock, cls: "badge-warning" },
};

function CouponCard({ coupon, onDelete }: { coupon: Coupon; onDelete: (id: string) => void }) {
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
        <button type="button" onClick={() => onDelete(coupon.id)}
          className="ml-auto flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-[hsl(var(--destructive))] transition hover:bg-[hsl(var(--destructive)/0.08)]">
          <Trash2 className="h-3.5 w-3.5" /> Delete
        </button>
      </div>
    </div>
  );
}

function CreateCouponForm({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({
    code: "", type: "percentage", value: "", minOrder: "",
    maxUses: "", expiresAt: "",
  });
  const [saving, setSaving] = useState(false);

  const generateCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const code = Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
    setForm((f) => ({ ...f, code }));
  };

  const save = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    setSaving(false);
    onClose();
  };

  return (
    <div className="rounded-[2rem] border border-[hsl(var(--accent)/0.3)] bg-[hsl(var(--card))] p-6 shadow-[var(--card-shadow)]">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-xl font-bold text-[hsl(var(--foreground))]">Create coupon</h2>
        <button type="button" onClick={onClose}
          className="rounded-full border border-[hsl(var(--border))] px-3 py-1.5 text-xs font-semibold text-[hsl(var(--muted-foreground))] transition hover:text-[hsl(var(--foreground))]">
          Cancel
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <DashInput label="Coupon code" id="coupon_code" value={form.code}
            onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
            placeholder="e.g. SAVE15"
            suffix={
              <button type="button" onClick={generateCode}
                className="text-xs font-semibold text-[hsl(var(--accent))] hover:underline">
                Generate
              </button>
            } />
        </div>
        <DashSelect label="Discount type" value={form.type}
          onChange={(v) => setForm((f) => ({ ...f, type: v }))}
          options={[
            { value: "percentage", label: "Percentage (%) off" },
            { value: "fixed", label: "Fixed (₦) amount off" },
          ]} />
        <DashInput label={form.type === "percentage" ? "Discount (%)" : "Discount (₦)"}
          id="coupon_value" type="number" value={form.value}
          onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))}
          placeholder={form.type === "percentage" ? "20" : "2000"} />
        <DashInput label="Minimum order (₦)" id="coupon_min" type="number" value={form.minOrder}
          onChange={(e) => setForm((f) => ({ ...f, minOrder: e.target.value }))} placeholder="5000" />
        <DashInput label="Max uses" id="coupon_max" type="number" value={form.maxUses}
          onChange={(e) => setForm((f) => ({ ...f, maxUses: e.target.value }))} placeholder="100" />
        <div className="sm:col-span-2">
          <DashInput label="Expiry date" id="coupon_exp" type="date" value={form.expiresAt}
            onChange={(e) => setForm((f) => ({ ...f, expiresAt: e.target.value }))} />
        </div>
      </div>

      <div className="mt-5">
        <SaveBar onSave={save} loading={saving} label="Create coupon" />
      </div>
    </div>
  );
}

export function VendorCouponsView() {
  const [coupons, setCoupons] = useState<Coupon[]>(MOCK_COUPONS);
  const [creating, setCreating] = useState(false);

  const deleteCoupon = (id: string) => setCoupons((all) => all.filter((c) => c.id !== id));

  const stats = {
    total: coupons.length,
    active: coupons.filter((c) => c.status === "active").length,
    totalUses: coupons.reduce((sum, c) => sum + c.uses, 0),
  };

  return (
    <div className="space-y-8 py-4">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-bon_foyage text-5xl text-[hsl(var(--foreground))]">Coupons</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[hsl(var(--muted-foreground))]">
            Create and manage discount codes for your store.
          </p>
        </div>
        {!creating && (
          <button type="button" onClick={() => setCreating(true)}
            className="inline-flex items-center gap-2 self-start rounded-full bg-[#FDA600] px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-[#f28705]">
            <Plus className="h-4 w-4" /> Create coupon
          </button>
        )}
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

      {/* Create form */}
      {creating && <CreateCouponForm onClose={() => setCreating(false)} />}

      {/* Coupon list */}
      <div className="grid gap-4 md:grid-cols-2">
        {coupons.map((coupon) => (
          <CouponCard key={coupon.id} coupon={coupon} onDelete={deleteCoupon} />
        ))}
      </div>

      {coupons.length === 0 && (
        <div className="rounded-[2rem] bg-[hsl(var(--card))] p-12 text-center shadow-[var(--card-shadow)]">
          <Tag className="mx-auto h-10 w-10 text-[hsl(var(--muted-foreground))]" />
          <p className="mt-4 text-base font-semibold text-[hsl(var(--foreground))]">No coupons yet</p>
          <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">Create your first coupon to attract more customers.</p>
        </div>
      )}
    </div>
  );
}
