/**
 * features/analytics/components/ReportTable.tsx
 *
 * Sortable table for analytics report data.
 */

"use client";

import { useState, useMemo } from "react";
import type { AnalyticsReport } from "../types";

interface ReportTableProps {
  report: AnalyticsReport | undefined;
  isLoading: boolean;
}

type SortKey = "metric" | "value";

export function ReportTable({ report, isLoading }: ReportTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("value");
  const [sortDesc, setSortDesc] = useState(true);

  const rows = useMemo(() => {
    if (!report) return [];
    const all: Array<{ category: string; metric: string; value: number | string }> = [];
    const categories: Array<keyof AnalyticsReport> = [
      "order_metrics",
      "product_metrics",
      "user_metrics",
      "vendor_metrics",
    ];
    for (const cat of categories) {
      const metrics = report[cat] as Record<string, number | string>;
      if (metrics && typeof metrics === "object") {
        for (const [key, value] of Object.entries(metrics)) {
          all.push({ category: cat.replace("_metrics", ""), metric: key, value });
        }
      }
    }
    all.sort((a, b) => {
      const av = typeof a.value === "number" ? a.value : 0;
      const bv = typeof b.value === "number" ? b.value : 0;
      return sortDesc ? bv - av : av - bv;
    });
    return all;
  }, [report, sortKey, sortDesc]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDesc(!sortDesc);
    } else {
      setSortKey(key);
      setSortDesc(true);
    }
  };

  if (isLoading && !report) {
    return (
      <div className="bg-white rounded-[10px] shadow p-8 text-center text-gray-400">
        Loading report data...
      </div>
    );
  }

  if (!report || rows.length === 0) {
    return (
      <div className="bg-white rounded-[10px] shadow p-8 text-center text-gray-400">
        <p className="text-sm">No report data available for this period.</p>
        <p className="text-xs mt-1">
          Report may still be generating. Try again in a few moments.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[10px] shadow overflow-hidden">
      <div className="px-5 py-4 border-b">
        <h3 className="text-xl font-medium font-satoshi text-black">
          Report Metrics
        </h3>
        <p className="text-sm text-[#858585]">
          Scope: {report.scope} · {report.days} days · Generated:{" "}
          {new Date(report.generated_at).toLocaleString("en-NG")}
        </p>
      </div>
      <table className="w-full">
        <thead>
          <tr className="border-b bg-gray-50">
            <th className="text-left px-5 py-3 text-xs font-bold text-gray-600 uppercase tracking-wider">
              Category
            </th>
            <th
              className="text-left px-5 py-3 text-xs font-bold text-gray-600 uppercase tracking-wider cursor-pointer hover:text-black transition-colors"
              onClick={() => toggleSort("metric")}
            >
              Metric {sortKey === "metric" && (sortDesc ? "↓" : "↑")}
            </th>
            <th
              className="text-right px-5 py-3 text-xs font-bold text-gray-600 uppercase tracking-wider cursor-pointer hover:text-black transition-colors"
              onClick={() => toggleSort("value")}
            >
              Value {sortKey === "value" && (sortDesc ? "↓" : "↑")}
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr
              key={`${row.category}-${row.metric}-${index}`}
              className="border-b last:border-b-0 hover:bg-gray-50 transition-colors"
            >
              <td className="px-5 py-3 text-sm text-[#858585] capitalize">
                {row.category}
              </td>
              <td className="px-5 py-3 text-sm font-medium text-[#282828]">
                {row.metric.replace(/_/g, " ")}
              </td>
              <td className="px-5 py-3 text-sm font-bold text-black text-right">
                {typeof row.value === "number"
                  ? row.value.toLocaleString()
                  : row.value}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {report.llm_insights && (
        <div className="px-5 py-4 border-t bg-amber-50">
          <h4 className="text-sm font-bold text-amber-800 mb-1">AI Insights</h4>
          <p className="text-sm text-amber-700">{report.llm_insights}</p>
        </div>
      )}

      {report.anomalies.length > 0 && (
        <div className="px-5 py-4 border-t bg-red-50">
          <h4 className="text-sm font-bold text-red-800 mb-1">
            Anomalies Detected ({report.anomalies.length})
          </h4>
          <ul className="space-y-1">
            {report.anomalies.map((anomaly, index) => (
              <li key={index} className="text-xs text-red-700">
                {JSON.stringify(anomaly)}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
