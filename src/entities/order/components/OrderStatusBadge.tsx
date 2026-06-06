"use client";

/**
 * entities/order/components/OrderStatusBadge.tsx
 * Color-coded status badge for orders.
 * entities/order/components/OrderTimelineComponent.tsx
 * Vertical stepper timeline for order lifecycle.
 */

import React from "react";
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from "../types";
import type { OrderStatus, OrderTimelineEntry } from "../types";

// ── OrderStatusBadge ─────────────────────────────────────────────────────────

interface OrderStatusBadgeProps {
  status: OrderStatus;
  size?: "sm" | "md";
  className?: string;
}

export function OrderStatusBadge({ status, size = "md", className = "" }: OrderStatusBadgeProps) {
  const colorClasses = ORDER_STATUS_COLORS[status] ?? "bg-slate-500/20 text-slate-300 border-slate-500/30";
  const sizeClasses = size === "sm" ? "text-[10px] px-2 py-0.5" : "text-xs px-2.5 py-1";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-medium ${sizeClasses} ${colorClasses} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70 flex-shrink-0" />
      {ORDER_STATUS_LABELS[status]}
    </span>
  );
}

// ── OrderTimeline ─────────────────────────────────────────────────────────────

interface OrderTimelineProps {
  entries: OrderTimelineEntry[];
  className?: string;
}

const TIMELINE_ICON: Record<string, string> = {
  pending: "⏳",
  confirmed: "✅",
  processing: "⚙️",
  ready_for_pickup: "📦",
  shipped: "🚚",
  delivered: "🎉",
  cancelled: "❌",
  refunded: "↩️",
  disputed: "⚠️",
};

export function OrderTimeline({ entries, className = "" }: OrderTimelineProps) {
  if (!entries.length) return null;

  return (
    <ol className={`relative border-l border-white/10 space-y-6 pl-6 ${className}`}>
      {entries.map((entry, i) => {
        const isLatest = i === entries.length - 1;
        const icon = TIMELINE_ICON[entry.status] ?? "📌";
        const colorClass = ORDER_STATUS_COLORS[entry.status as OrderStatus] ?? "bg-slate-800";

        return (
          <li key={entry.id} className="relative">
            {/* Timeline dot */}
            <span
              className={`absolute -left-[calc(1.5rem+0.5rem)] w-4 h-4 rounded-full border flex items-center justify-center text-[8px] ${colorClass} ${isLatest ? "ring-2 ring-offset-1 ring-offset-transparent ring-current" : ""}`}
            >
              {icon}
            </span>

            <div className={`rounded-xl p-3 border ${isLatest ? "bg-white/8 border-white/20" : "bg-white/3 border-white/8"}`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <OrderStatusBadge status={entry.status as OrderStatus} size="sm" />
                  {entry.note && (
                    <p className="text-sm text-slate-300 mt-1.5 leading-relaxed">{entry.note}</p>
                  )}
                  {entry.actorName && (
                    <p className="text-xs text-slate-500 mt-1">by {entry.actorName}</p>
                  )}
                </div>
                <time className="text-[10px] text-slate-500 whitespace-nowrap flex-shrink-0">
                  {new Date(entry.createdAt).toLocaleDateString("en-NG", {
                    month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
                  })}
                </time>
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
