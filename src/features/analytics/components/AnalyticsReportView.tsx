/**
 * features/analytics/components/AnalyticsReportView.tsx
 *
 * Report view with date range picker, report type selector,
 * sortable table, and CSV export.
 */

"use client";

import { useQueryState, parseAsString } from "nuqs";
import { usePlatformReport, useOrderReport, useProductReport, useUserReport } from "../hooks";
import { DateRangePicker } from "./DateRangePicker";
import { ReportTable } from "./ReportTable";
import { ExportButton } from "./ExportButton";
import { Button } from "@/components/ui/button";

const REPORT_TYPES = [
  { key: "platform", label: "Platform" },
  { key: "orders", label: "Orders" },
  { key: "products", label: "Products" },
  { key: "users", label: "Users" },
];

export function AnalyticsReportView() {
  const [reportType, setReportType] = useQueryState(
    "type",
    parseAsString.withDefault("platform"),
  );
  const [days] = useQueryState("days");
  const daysNum = days ? parseInt(days, 10) : 7;

  const platformQuery = usePlatformReport(daysNum);
  const orderQuery = useOrderReport(daysNum);
  const productQuery = useProductReport(daysNum);
  const userQuery = useUserReport(daysNum);

  const activeQuery = {
    platform: platformQuery,
    orders: orderQuery,
    products: productQuery,
    users: userQuery,
  }[reportType ?? "platform"];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="font-satoshi font-medium text-3xl text-black">
            Analytics Reports
          </h2>
          <p className="font-satoshi text-xl text-[#666]">
            Detailed analytics reports with export capability.
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white rounded-[10px] shadow p-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-[#858585] font-medium">Report:</span>
          <div className="flex items-center gap-1.5">
            {REPORT_TYPES.map((type) => (
              <Button
                key={type.key}
                size="sm"
                variant={reportType === type.key ? "default" : "outline"}
                className="text-xs font-medium"
                onClick={() => setReportType(type.key)}
              >
                {type.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <DateRangePicker />
          <ExportButton report={activeQuery.data} filename={`analytics-${reportType}`} />
        </div>
      </div>

      {/* Report Table */}
      <ReportTable report={activeQuery.data} isLoading={activeQuery.isLoading} />
    </div>
  );
}
