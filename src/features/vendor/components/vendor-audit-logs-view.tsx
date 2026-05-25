"use client";

/**
 * VendorAuditLogsView — 2026 Enterprise Edition
 *
 * Displays the vendor's own audit event trail with filtering by category,
 * severity, and pagination.
 *
 * Route: /vendor/audit-logs
 * API:   GET /api/v1/ninja/vendor/audit-logs/
 */

import { useState } from "react";
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Filter,
  Globe,
  Info,
  Loader2,
  Lock,
  Package,
  RefreshCw,
  Shield,
  ShoppingCart,
  Wallet,
  Zap,
} from "lucide-react";
import { useVendorAuditLogs } from "@/features/vendor/hooks/use-vendor-audit-logs";
import type { AuditLogEvent } from "@/features/vendor/hooks/use-vendor-audit-logs";

// ── Brand palette ──────────────────────────────────────────────────────────────
const C = {
  green:  "#1a2e14",
  greenM: "#2d5016",
  gold:   "#FDA600",
  goldD:  "#E8960A",
  cream:  "#F8F5ED",
  creamB: "#ECE6D6",
  muted:  "#7A6B44",
  ink:    "#1A1208",
} as const;

// ── Severity config ────────────────────────────────────────────────────────────
const SEVERITY_CFG = {
  debug:    { label: "Debug",    icon: Info,          color: "#6b7280", bg: "#F3F4F6" },
  info:     { label: "Info",     icon: CheckCircle2,  color: "#1d4ed8", bg: "#EFF6FF" },
  warning:  { label: "Warning",  icon: AlertTriangle, color: "#92400e", bg: "#FEF3C7" },
  error:    { label: "Error",    icon: AlertCircle,   color: "#c0392b", bg: "#FDECEA" },
  critical: { label: "Critical", icon: Zap,           color: "#7c2d12", bg: "#FFF1F2" },
} as const;

// ── Category config ────────────────────────────────────────────────────────────
const CATEGORY_ICON_MAP: Record<string, React.ElementType> = {
  authentication: Lock,
  security:       Shield,
  vendor:         Activity,
  order:          ShoppingCart,
  payment:        Wallet,
  wallet:         Wallet,
  kyc:            Shield,
  catalog:        Package,
  support:        Globe,
};

function getCategoryIcon(category: string): React.ElementType {
  return CATEGORY_ICON_MAP[category?.toLowerCase()] ?? Activity;
}

// ── Event Row ─────────────────────────────────────────────────────────────────
function AuditEventRow({ event }: { event: AuditLogEvent }) {
  const [expanded, setExpanded] = useState(false);
  const sev = SEVERITY_CFG[event.severity] ?? SEVERITY_CFG.info;
  const SevIcon = sev.icon;
  const CategoryIcon = getCategoryIcon(event.event_category);
  const timeStr = new Date(event.created_at).toLocaleString("en-NG", {
    dateStyle: "short",
    timeStyle: "medium",
  });

  return (
    <div
      className={[
        "rounded-2xl border transition-all duration-200",
        expanded ? "border-[#FDA600]/30 bg-[#FFFBF0] shadow-sm" : "border-[#ECE6D6] bg-white hover:bg-[#FAFAF8]",
      ].join(" ")}
    >
      {/* Row header */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-start gap-4 p-4 text-left"
      >
        {/* Category icon */}
        <div
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl"
          style={{ background: sev.bg }}
        >
          <CategoryIcon className="h-4 w-4" style={{ color: sev.color }} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-semibold text-[#1A1208] truncate">{event.action}</p>
            {/* Severity badge */}
            <span
              className="inline-flex flex-shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
              style={{ background: sev.bg, color: sev.color }}
            >
              <SevIcon className="h-2.5 w-2.5" />
              {sev.label}
            </span>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-[#7A6B44]">
            <span className="capitalize">{event.event_category.replace(/_/g, " ")}</span>
            <span>·</span>
            <span className="font-mono text-[10px]">{event.event_type}</span>
            {event.is_compliance && (
              <>
                <span>·</span>
                <span className="flex items-center gap-0.5 text-[#c0392b]">
                  <Shield className="h-3 w-3" /> Compliance
                </span>
              </>
            )}
            <span className="flex-1 text-right">
              <span className="flex items-center gap-0.5 justify-end">
                <Clock className="h-3 w-3" />{timeStr}
              </span>
            </span>
          </div>
        </div>
      </button>

      {/* Expanded details */}
      {expanded && (
        <div className="border-t border-[#ECE6D6] bg-[#FAFAF8] px-5 py-4">
          <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs sm:grid-cols-3 lg:grid-cols-4">
            {[
              { label: "Event Type",    value: event.event_type },
              { label: "Category",      value: event.event_category },
              { label: "IP Address",    value: event.ip_address },
              { label: "Device",        value: event.device_type },
              { label: "Browser",       value: event.browser_family },
              { label: "OS",            value: event.os_family },
              { label: "Country",       value: event.country },
              { label: "HTTP Method",   value: event.request_method },
              { label: "Request Path",  value: event.request_path, mono: true },
              { label: "Status Code",   value: event.response_status != null ? String(event.response_status) : null },
              { label: "Duration",      value: event.duration_ms != null ? `${event.duration_ms.toFixed(0)}ms` : null },
              { label: "Resource Type", value: event.resource_type },
              { label: "Resource ID",   value: event.resource_id, mono: true },
            ]
              .filter((d) => d.value)
              .map(({ label, value, mono }) => (
                <div key={label}>
                  <p className="text-[10px] font-bold uppercase tracking-wide text-[#7A6B44]/70">{label}</p>
                  <p className={`mt-0.5 text-[#1A1208] ${mono ? "font-mono text-[10px]" : ""}`}>{value}</p>
                </div>
              ))}
          </div>
          {event.error_message && (
            <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2">
              <p className="text-[10px] font-bold uppercase tracking-wide text-red-700">Error</p>
              <p className="mt-0.5 text-xs text-red-800 font-mono">{event.error_message}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Category filter options ────────────────────────────────────────────────────
const CATEGORIES = [
  { value: "",               label: "All Categories"    },
  { value: "authentication", label: "Authentication"    },
  { value: "security",       label: "Security"          },
  { value: "vendor",         label: "Vendor Actions"    },
  { value: "order",          label: "Orders"            },
  { value: "payment",        label: "Payments"          },
  { value: "wallet",         label: "Wallet"            },
  { value: "kyc",            label: "KYC"               },
  { value: "catalog",        label: "Catalog"           },
  { value: "support",        label: "Support"           },
  { value: "chat",           label: "Chat"              },
  { value: "transactions",   label: "Transactions"      },
];

const SEVERITIES = [
  { value: "",         label: "All Severities" },
  { value: "info",     label: "Info"           },
  { value: "warning",  label: "Warning"        },
  { value: "error",    label: "Error"          },
  { value: "critical", label: "Critical"       },
];

// ── Main View ──────────────────────────────────────────────────────────────────
export function VendorAuditLogsView() {
  const [page,     setPage]     = useState(1);
  const [category, setCategory] = useState("");
  const [severity, setSeverity] = useState("");

  const { data, isLoading, isError, isFetching, refetch } =
    useVendorAuditLogs(page, category, severity);

  const events = data?.events ?? [];
  const total  = data?.total ?? 0;
  const hasMore = data?.has_more ?? false;

  const resetFilters = () => {
    setPage(1);
    setCategory("");
    setSeverity("");
  };

  return (
    <div className="space-y-6 py-2">
      {/* Hero */}
      <div className="flex items-start gap-4 mb-8">
        <div
          className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl shadow-lg"
          style={{ background: `linear-gradient(135deg, ${C.green} 0%, ${C.greenM} 100%)` }}
        >
          <Activity className="h-6 w-6 text-[#FDA600]" />
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em]" style={{ color: C.gold }}>
            Compliance &amp; Transparency
          </p>
          <h1 className="mt-0.5 text-2xl font-bold" style={{ color: C.ink }}>
            Activity Audit Log
          </h1>
          <p className="mt-1 text-sm" style={{ color: C.muted }}>
            Your complete platform activity trail — authentication, orders, payments, KYC, and all account events.
          </p>
        </div>
      </div>

      {/* Stats strip */}
      <div className="flex items-center justify-between rounded-2xl border border-[#ECE6D6] bg-white px-5 py-3">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-2xl font-bold text-[#1A1208]">{total.toLocaleString()}</span>
          <span className="text-[#7A6B44]">total events recorded</span>
        </div>
        <div className="flex items-center gap-2">
          {isFetching && <Loader2 className="h-4 w-4 animate-spin text-[#FDA600]" />}
          <button
            type="button"
            onClick={() => void refetch()}
            className="flex items-center gap-1.5 rounded-xl border border-[#ECE6D6] bg-[#F8F5ED] px-3 py-1.5 text-xs font-semibold text-[#7A6B44] transition hover:bg-[#ECE6D6]"
          >
            <RefreshCw className="h-3 w-3" /> Refresh
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:flex-wrap">
        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#7A6B44]">
          <Filter className="h-3.5 w-3.5" />
          Filters:
        </div>

        <select
          id="audit-category-filter"
          value={category}
          onChange={(e) => { setCategory(e.target.value); setPage(1); }}
          className="rounded-xl border border-[#ECE6D6] bg-white px-3 py-2 text-sm text-[#1A1208] outline-none focus:border-[#FDA600] transition"
        >
          {CATEGORIES.map(({ value, label }) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>

        <select
          id="audit-severity-filter"
          value={severity}
          onChange={(e) => { setSeverity(e.target.value); setPage(1); }}
          className="rounded-xl border border-[#ECE6D6] bg-white px-3 py-2 text-sm text-[#1A1208] outline-none focus:border-[#FDA600] transition"
        >
          {SEVERITIES.map(({ value, label }) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>

        {(category || severity) && (
          <button
            type="button"
            onClick={resetFilters}
            className="text-xs font-semibold text-[#FDA600] underline underline-offset-2 transition hover:text-[#E8960A]"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-2xl bg-[#ECE6D6]" />
          ))}
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-red-200 bg-red-50 py-12 text-center">
          <AlertCircle className="h-8 w-8 text-red-400" />
          <p className="text-sm font-semibold text-red-700">Could not load audit logs.</p>
          <button
            type="button"
            onClick={() => void refetch()}
            className="text-xs text-red-600 underline"
          >
            Retry
          </button>
        </div>
      ) : events.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-3xl border border-[#ECE6D6] bg-white py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F8F5ED]">
            <Activity className="h-7 w-7 text-[#ECE6D6]" />
          </div>
          <div>
            <p className="text-sm font-bold text-[#1A1208]">No audit events found</p>
            <p className="mt-1 text-xs text-[#7A6B44]">
              {category || severity ? "Try adjusting your filters." : "Events are recorded as you interact with the platform."}
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {events.map((ev) => (
            <AuditEventRow key={ev.id} event={ev} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {(page > 1 || hasMore) && (
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1 || isFetching}
            className="flex items-center gap-1.5 rounded-xl border border-[#ECE6D6] bg-white px-4 py-2 text-sm font-semibold text-[#7A6B44] transition hover:bg-[#F8F5ED] disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" /> Previous
          </button>
          <span className="text-sm text-[#7A6B44]">Page {page}</span>
          <button
            type="button"
            onClick={() => setPage((p) => p + 1)}
            disabled={!hasMore || isFetching}
            className="flex items-center gap-1.5 rounded-xl border border-[#ECE6D6] bg-white px-4 py-2 text-sm font-semibold text-[#7A6B44] transition hover:bg-[#F8F5ED] disabled:opacity-40"
          >
            Next <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
