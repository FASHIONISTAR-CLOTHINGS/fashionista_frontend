/**
 * features/audit-logs/admin-dashboard/components/AuditLogViewer.tsx
 *
 * Superadmin Compliance Audit Trail Viewer.
 */

"use client";

import { useState } from "react";
import { Shield, Search, RefreshCw, ChevronLeft, ChevronRight, Info } from "lucide-react";
import { useAuditLogs } from "../hooks";
import {
  AUDIT_CATEGORY_LABELS,
  AUDIT_CATEGORY_COLORS,
  AUDIT_CATEGORY_RETENTION,
} from "../types";
import type { AuditCategory, AuditLogEntry, AuditLogFilters } from "../types";

const CATEGORIES: Array<AuditCategory | "all"> = [
  "all",
  "financial",
  "kyc",
  "support",
  "auth",
  "audit",
  "general",
];

function CategoryBadge({ category }: { category: AuditCategory }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${AUDIT_CATEGORY_COLORS[category]}`}
    >
      {AUDIT_CATEGORY_LABELS[category]}
    </span>
  );
}

function DiffCell({
  label,
  value,
}: {
  label: string;
  value: Record<string, unknown>;
}) {
  const isEmpty = Object.keys(value).length === 0;
  if (isEmpty) return <span className="text-slate-300">—</span>;

  return (
    <details className="cursor-pointer">
      <summary className="text-xs text-indigo-600 underline-offset-2 hover:underline">
        {label}
      </summary>
      <pre className="mt-1 max-h-32 overflow-auto rounded bg-slate-50 p-2 text-xs text-slate-700">
        {JSON.stringify(value, null, 2)}
      </pre>
    </details>
  );
}

function AuditLogRow({ entry }: { entry: AuditLogEntry }) {
  const date = new Date(entry.created_at).toLocaleString("en-NG", {
    day:    "2-digit",
    month:  "short",
    year:   "numeric",
    hour:   "2-digit",
    minute: "2-digit",
  });

  return (
    <tr className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors align-top">
      <td className="px-4 py-3 text-xs text-slate-400 font-mono whitespace-nowrap">
        {date}
      </td>
      <td className="px-4 py-3">
        <CategoryBadge category={entry.category} />
      </td>
      <td className="px-4 py-3">
        <span className="font-mono text-xs text-slate-700">{entry.action}</span>
      </td>
      <td className="px-4 py-3 text-sm text-slate-600">
        <div>{entry.actor_email ?? <span className="text-slate-300">system</span>}</div>
        <div className="text-xs text-slate-400">{entry.actor_role}</div>
      </td>
      <td className="px-4 py-3 text-sm text-slate-600">
        <div className="font-mono text-xs">{entry.resource_type}</div>
        <div className="font-mono text-xs text-slate-400">
          {entry.resource_id.slice(0, 8)}…
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="flex flex-col gap-1">
          <DiffCell label="Before" value={entry.old_value} />
          <DiffCell label="After"  value={entry.new_value} />
        </div>
      </td>
      <td className="px-4 py-3 text-xs text-slate-400 font-mono">
        {entry.ip_address}
      </td>
    </tr>
  );
}

const PAGE_SIZE = 50;

export function AuditLogViewer() {
  const [category, setCategory]     = useState<AuditCategory | "all">("all");
  const [actorEmail, setActorEmail] = useState("");
  const [resourceType, setResourceType] = useState("");
  const [page, setPage]             = useState(1);

  const filters: AuditLogFilters = {
    ...(category !== "all" && { category }),
    ...(actorEmail    && { actor_email: actorEmail }),
    ...(resourceType  && { resource_type: resourceType }),
    page,
    page_size: PAGE_SIZE,
  };

  const { data, isLoading, isError, isFetching, refetch } = useAuditLogs(filters);

  const entries    = data?.results ?? [];
  const total      = data?.total   ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const handleCategoryChange = (cat: AuditCategory | "all") => {
    setCategory(cat);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-600 shadow-sm">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              Compliance Audit Trail
            </h2>
            <p className="text-sm text-slate-500">
              Immutable, append-only event log — GDPR &amp; CBN compliant
            </p>
          </div>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50 transition-colors"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {category !== "all" && (
        <div className="flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5">
          <Info className="h-4 w-4 shrink-0 text-blue-600" />
          <p className="text-sm text-blue-800">
            <span className="font-semibold">{AUDIT_CATEGORY_LABELS[category]}</span> logs
            are retained for{" "}
            <span className="font-semibold">{AUDIT_CATEGORY_RETENTION[category]}</span> per
            GDPR/CBN data governance policy.
          </p>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => handleCategoryChange(cat)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              category === cat
                ? "bg-indigo-600 text-white shadow-sm"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {cat === "all" ? "All" : AUDIT_CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Filter by actor email"
            value={actorEmail}
            onChange={(e) => {
              setActorEmail(e.target.value);
              setPage(1);
            }}
            className="w-64 rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
          />
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Filter by resource type"
            value={resourceType}
            onChange={(e) => {
              setResourceType(e.target.value);
              setPage(1);
            }}
            className="w-56 rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {isError ? (
          <div className="flex flex-col items-center gap-2 py-16 text-center text-red-500">
            <Shield className="h-10 w-10 text-red-300" />
            <p className="text-sm font-medium">Could not load audit logs</p>
            <p className="text-xs text-slate-400">
              Check superadmin permissions and backend connectivity.
            </p>
          </div>
        ) : isLoading ? (
          <div className="space-y-3 p-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-10 animate-pulse rounded-lg bg-slate-100" />
            ))}
          </div>
        ) : entries.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-16 text-center text-slate-400">
            <Shield className="h-10 w-10 text-slate-200" />
            <p className="text-sm font-medium">No audit events match these filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60">
                  {["Timestamp", "Category", "Action", "Actor", "Resource", "Changes", "IP"].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500"
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => (
                  <AuditLogRow key={entry.id} entry={entry} />
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3">
            <p className="text-xs text-slate-400">
              Showing {(page - 1) * PAGE_SIZE + 1}–
              {Math.min(page * PAGE_SIZE, total)} of {total} entries
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-xs font-medium text-slate-600">
                Page {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
