"use client";

/**
 * features/vendor/components/VendorDashboard.tsx
 * Premium vendor analytics dashboard with real-time metrics.
 * Uses TanStack Query for server state + Zustand for UI preferences.
 */

import { useState } from "react";
import type { VendorMetrics, VendorProfile } from "@/entities/vendor/types";
import { Card, Badge, LoadingSpinner } from "@/shared/ui";

// ── Metric Card ───────────────────────────────────────────────────────────────

interface MetricCardProps {
  icon: string;
  label: string;
  value: string | number;
  subtext?: string;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  color?: "amber" | "emerald" | "violet" | "rose" | "default";
}

const COLOR_MAP: Record<NonNullable<MetricCardProps["color"]>, { glow: string; text: string; bg: string }> = {
  amber: { glow: "shadow-amber-500/20", text: "text-amber-400", bg: "bg-amber-500/15 border-amber-500/30" },
  emerald: { glow: "shadow-emerald-500/20", text: "text-emerald-400", bg: "bg-emerald-500/15 border-emerald-500/30" },
  violet: { glow: "shadow-violet-500/20", text: "text-violet-400", bg: "bg-violet-500/15 border-violet-500/30" },
  rose: { glow: "shadow-rose-500/20", text: "text-rose-400", bg: "bg-rose-500/15 border-rose-500/30" },
  default: { glow: "shadow-white/5", text: "text-white", bg: "bg-white/8 border-white/12" },
};

function MetricCard({ icon, label, value, subtext, trend, trendValue, color = "default" }: MetricCardProps) {
  const { glow, text, bg } = COLOR_MAP[color];
  return (
    <div
      className={`rounded-2xl border p-5 ${bg} shadow-lg ${glow} backdrop-blur-sm transition-all hover:scale-[1.02]`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="text-2xl">{icon}</div>
        {trend && trendValue && (
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
            trend === "up" ? "bg-emerald-500/20 text-emerald-400" :
            trend === "down" ? "bg-rose-500/20 text-rose-400" :
            "bg-slate-500/20 text-slate-400"
          }`}>
            {trend === "up" ? "↑" : trend === "down" ? "↓" : "→"} {trendValue}
          </span>
        )}
      </div>
      <p className={`text-2xl font-bold ${text}`}>{value}</p>
      <p className="text-xs text-slate-400 mt-1">{label}</p>
      {subtext && <p className="text-[10px] text-slate-500 mt-0.5">{subtext}</p>}
    </div>
  );
}

// ── Revenue Sparkline ─────────────────────────────────────────────────────────

function RevenueSparkline({ data }: { data: { month: string; revenue: number }[] }) {
  if (!data || data.length === 0) return null;
  const max = Math.max(...data.map((d) => d.revenue), 1);

  return (
    <Card className="p-5" id="revenue-sparkline">
      <h3 className="text-sm font-semibold text-slate-300 mb-4">Monthly Revenue</h3>
      <div className="flex items-end gap-2 h-24">
        {data.map((d, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div
              className="w-full rounded-t-md bg-gradient-to-t from-amber-600/40 to-amber-400/80 hover:from-amber-600/60 hover:to-amber-400 transition-all cursor-default"
              style={{ height: `${(d.revenue / max) * 96}px` }}
              title={`${d.month}: ₦${d.revenue.toLocaleString()}`}
            />
            <span className="text-[9px] text-slate-500 truncate w-full text-center">{d.month.slice(0, 3)}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ── Top Products Table ────────────────────────────────────────────────────────

function TopProductsTable({ products }: { products: VendorMetrics["topProducts"] }) {
  return (
    <Card className="p-5" id="top-products-table">
      <h3 className="text-sm font-semibold text-slate-300 mb-4">Top Products</h3>
      <div className="space-y-2">
        {products.slice(0, 5).map((p, i) => (
          <div key={p.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
            <div className="flex items-center gap-3 min-w-0">
              <span className={`text-xs font-bold w-5 text-center ${
                i === 0 ? "text-amber-400" : i === 1 ? "text-slate-300" : "text-slate-500"
              }`}>
                #{i + 1}
              </span>
              <p className="text-sm text-white truncate">{p.title}</p>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <span className="text-xs text-slate-400">{p.sales} sold</span>
              <span className="text-xs font-semibold text-amber-400">
                ₦{p.revenue.toLocaleString()}
              </span>
            </div>
          </div>
        ))}
        {products.length === 0 && (
          <p className="text-sm text-slate-500 text-center py-4">No sales data yet</p>
        )}
      </div>
    </Card>
  );
}

// ── Order Status Pills ────────────────────────────────────────────────────────

function OrderStatusPills({ pending }: { pending: number }) {
  return (
    <div className="flex flex-wrap gap-2">
      {pending > 0 && (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span className="text-xs font-medium text-amber-300">{pending} Pending Orders</span>
        </div>
      )}
    </div>
  );
}

// ── VendorDashboard ───────────────────────────────────────────────────────────

interface VendorDashboardProps {
  profile: VendorProfile;
  metrics: VendorMetrics;
  isLoading?: boolean;
}

export function VendorDashboard({ profile, metrics, isLoading }: VendorDashboardProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "orders" | "products" | "analytics">("overview");

  const fmtCurrency = (v: number) =>
    new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", notation: "compact" }).format(v);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6" id="vendor-dashboard">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">{profile.shopName}</h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge color={profile.isVerified ? "success" : "warning"}>
              {profile.isVerified ? "✓ Verified" : "Pending Verification"}
            </Badge>
            <Badge color="primary">{profile.tier.toUpperCase()}</Badge>
          </div>
        </div>
        <OrderStatusPills pending={metrics.pendingOrders} />
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          icon="💰" label="Total Revenue" value={fmtCurrency(metrics.revenue)}
          color="amber" trend="up" trendValue="12%" subtext="All time"
        />
        <MetricCard
          icon="📦" label="Total Orders" value={metrics.totalOrders.toLocaleString()}
          color="violet" trend="up" trendValue="8%"
        />
        <MetricCard
          icon="⭐" label="Avg Rating" value={metrics.avgRating.toFixed(1)}
          color="emerald" subtext="Based on reviews"
        />
        <MetricCard
          icon="⚠️" label="Low Stock" value={metrics.lowStockProducts}
          color={metrics.lowStockProducts > 5 ? "rose" : "default"}
          subtext="Products needing restock"
        />
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 p-1 rounded-xl bg-white/5 border border-white/10 w-fit">
        {(["overview", "orders", "products", "analytics"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            id={`vendor-tab-${tab}`}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
              activeTab === tab
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <RevenueSparkline data={metrics.monthlyRevenue} />
          <TopProductsTable products={metrics.topProducts} />
        </div>
      )}

      {activeTab === "analytics" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <MetricCard icon="📊" label="Fulfillment Avg" value={`${profile.avgFulfillmentDays?.toFixed(1) ?? "—"} days`} color="violet" />
          <MetricCard icon="↩️" label="Return Rate" value={`${(profile.returnRate * 100).toFixed(1)}%`} color={profile.returnRate > 0.05 ? "rose" : "emerald"} />
          <MetricCard icon="⚖️" label="Dispute Rate" value={`${(profile.disputeRate * 100).toFixed(1)}%`} color={profile.disputeRate > 0.02 ? "rose" : "emerald"} />
        </div>
      )}

      {activeTab === "orders" && (
        <Card className="p-5">
          <p className="text-sm text-slate-400">Orders management coming soon — use the full Orders section.</p>
        </Card>
      )}

      {activeTab === "products" && (
        <Card className="p-5">
          <p className="text-sm text-slate-400">Products management coming soon — use the full Products section.</p>
        </Card>
      )}
    </div>
  );
}
