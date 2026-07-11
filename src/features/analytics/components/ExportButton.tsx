/**
 * features/analytics/components/ExportButton.tsx
 *
 * CSV export button for analytics report data.
 */

"use client";

import { Button } from "@/components/ui/button";
import type { AnalyticsReport } from "../types";

interface ExportButtonProps {
  report: AnalyticsReport | undefined;
  filename?: string;
}

export function ExportButton({ report, filename = "analytics-report" }: ExportButtonProps) {
  const handleExport = () => {
    if (!report) return;

    const rows: string[] = [];
    rows.push("Category,Metric,Value");

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
          rows.push(`${cat.replace("_metrics", "")},${key},${value}`);
        }
      }
    }

    if (report.llm_insights) {
      rows.push("");
      rows.push(`AI Insights,,"${report.llm_insights.replace(/"/g, "'")}"`);
    }

    const csv = rows.join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${filename}-${report.scope}-${report.days}d-${Date.now()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Button
      size="sm"
      variant="outline"
      onClick={handleExport}
      disabled={!report}
      className="text-xs font-medium gap-1.5"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
      Export CSV
    </Button>
  );
}
