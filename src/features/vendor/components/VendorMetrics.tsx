"use client";

/**
 * features/vendor/components/VendorMetrics.tsx
 * Vendor analytics dashboard header — KPI metric cards with
 * trend indicators, sparklines, and period selector.
 * API: GET /api/v1/ninja/vendor/metrics/?period=7d|30d|90d
 */

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import ky from "ky";
import { Card, LoadingSpinner } from "@/shared/ui";

type Period = "7d" | "30d" | "90d";

interface VendorMetric {
  key: string;
  label: string;
  value: number;
  formatted: string;
  change_pct: number;
  change_direction: "up" | "down" | "flat";
  sparkline: number[]; // Last 7 data points for mini-chart
  icon: string;
  prefix?: string;
  suffix?: string;
  is_positive_up: boolean; // For some metrics, down is good (e.g. return rate)
}

interface VendorMetricsData {
  period: Period;
  metrics: VendorMetric[];
  generated_at: string;
}

const PERIOD_LABELS: Record<Period, string> = {
  "7d": "Last 7 days",
  "30d": "Last 30 days",
  "90d": "Last 90 days",
};

function MiniSparkline({ data }: { data: number[] }) {
  if (!data || data.length < 2) return null;

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const width = 64;
  const height = 24;

  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * height;
    return `${x},${y}`;
  }).join(" ");

  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-amber-400"
      />
    </svg>
  );
}

function MetricCard({ metric }: { metric: VendorMetric }) {
  const isPositive = metric.change_direction === "up" ? metric.is_positive_up : !metric.is_positive_up;
  const isFlat = metric.change_direction === "flat";

  const trendColor = isFlat ? "text-slate-400" : isPositive ? "text-emerald-400" : "text-red-400";
  const trendArrow = isFlat ? "→" : metric.change_direction === "up" ? "↑" : "↓";

  return (
    <Card glass className="p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">{metric.icon}</span>
          <p className="text-xs font-medium text-slate-400">{metric.label}</p>
        </div>
        <div className={`flex items-center gap-0.5 text-xs font-semibold ${trendColor}`}>
          <span>{trendArrow}</span>
          <span>{Math.abs(metric.change_pct).toFixed(1)}%</span>
        </div>
      </div>

      <div>
        <p className="text-2xl font-extrabold text-white tabular-nums">
          {metric.prefix}{metric.formatted}{metric.suffix}
        </p>
      </div>

      {/* Sparkline */}
      <div className="flex items-end justify-between">
        <div className="opacity-70">
          <MiniSparkline data={metric.sparkline} />
        </div>
        <p className={`text-[10px] font-medium ${trendColor}`}>
          {metric.change_direction !== "flat" && (
            `${metric.change_direction === "up" ? "+" : ""}${metric.change_pct.toFixed(1)}%`
          )}
          {isFlat && "No change"}
        </p>
      </div>
    </Card>
  );
}

// ── Fallback skeleton data while loading ────────────────────────────────────
const SKELETON_METRICS: Pick<VendorMetric, "key" | "label" | "icon">[] = [
  { key: "revenue", label: "Revenue", icon: "💰" },
  { key: "orders", label: "Orders", icon: "📦" },
  { key: "conversion", label: "Conversion", icon: "🎯" },
  { key: "avg_order", label: "Avg. Order", icon: "🧾" },
  { key: "return_rate", label: "Return Rate", icon: "🔄" },
  { key: "rating", label: "Rating", icon: "⭐" },
];

export function VendorMetrics({ vendorId }: { vendorId?: string }) {
  const [period, setPeriod] = useState<Period>("30d");

  const { data, isLoading } = useQuery<VendorMetricsData>({
    queryKey: ["vendor", "metrics", period, vendorId],
    queryFn: () =>
      ky.get("/api/v1/ninja/vendor/metrics/", {
        searchParams: { period, ...(vendorId ? { vendor_id: vendorId } : {}) },
      }).json<VendorMetricsData>(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return (
    <div className="space-y-4">
      {/* Period selector */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-white">Performance Metrics</h3>
        <div className="flex gap-1 bg-white/6 rounded-xl p-1">
          {(Object.keys(PERIOD_LABELS) as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                period === p
                  ? "bg-amber-500 text-black"
                  : "text-slate-400 hover:text-white"
              }`}
              id={`vendor-metrics-period-${p}`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Metrics grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {SKELETON_METRICS.map(({ key, label, icon }) => (
            <Card key={key} glass className="p-4 space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">{icon}</span>
                <p className="text-xs text-slate-400">{label}</p>
              </div>
              <div className="h-6 w-3/4 bg-white/8 rounded animate-pulse" />
              <div className="h-4 w-full bg-white/6 rounded animate-pulse" />
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {(data?.metrics ?? []).map((metric) => (
            <MetricCard key={metric.key} metric={metric} />
          ))}
        </div>
      )}

      {data?.generated_at && (
        <p className="text-[10px] text-slate-600 text-right">
          Updated {new Date(data.generated_at).toLocaleTimeString("en-NG", { timeStyle: "short" })}
        </p>
      )}
    </div>
  );
}
