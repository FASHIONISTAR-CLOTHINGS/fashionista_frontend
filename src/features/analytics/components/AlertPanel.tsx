/**
 * features/analytics/components/AlertPanel.tsx
 *
 * Panel showing triggered analytics alerts with severity badges.
 */

"use client";

import { useAlerts } from "../hooks";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/common";
import type { AnalyticsAlert } from "../types";

const severityColors: Record<string, string> = {
  critical: "bg-red-100 text-red-700 border-red-200",
  high: "bg-orange-100 text-orange-700 border-orange-200",
  medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
  low: "bg-blue-100 text-blue-700 border-blue-200",
};

const statusColors: Record<string, string> = {
  firing: "bg-red-50 text-red-600",
  resolved: "bg-green-50 text-green-600",
  acknowledged: "bg-blue-50 text-blue-600",
};

function AlertRow({ alert }: { alert: AnalyticsAlert }) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-md hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0">
      <div className="flex-shrink-0 mt-0.5">
        <span
          className={`inline-block w-2.5 h-2.5 rounded-full ${
            alert.status === "firing" ? "bg-red-500 animate-pulse" : "bg-green-500"
          }`}
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium text-[#282828] truncate">
            {alert.rule_name}
          </span>
          <Badge
            variant="secondary"
            className={`text-[10px] px-2 py-0.5 ${severityColors[alert.severity] ?? severityColors.low}`}
          >
            {alert.severity}
          </Badge>
        </div>
        <p className="text-xs text-[#858585] truncate">{alert.message}</p>
        <div className="flex items-center gap-3 mt-1">
          <span
            className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
              statusColors[alert.status] ?? statusColors.firing
            }`}
          >
            {alert.status}
          </span>
          <span className="text-[10px] text-[#858585]">
            Value: {alert.metric_value}
          </span>
          <span className="text-[10px] text-[#858585]">
            {new Date(alert.fired_at).toLocaleString("en-NG", {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
      </div>
    </div>
  );
}

export function AlertPanel() {
  const { data, isLoading } = useAlerts({ page: 1, page_size: 10 });

  const alerts = data?.results ?? [];
  const firingCount = alerts.filter((a) => a.status === "firing").length;

  return (
    <div className="flex flex-col px-5 py-4 bg-white rounded-[10px] shadow h-[383px]">
      <div className="flex items-center justify-between border-b pb-2 mb-2">
        <h3 className="text-xl font-medium font-satoshi text-black">
          Active Alerts
        </h3>
        {firingCount > 0 && (
          <Badge variant="default" className="bg-red-500 text-white text-[10px]">
            {firingCount} firing
          </Badge>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading && !data ? (
          <div className="flex items-center justify-center h-full">
            <LoadingSpinner />
          </div>
        ) : alerts.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400 text-sm">
            No alerts — all systems healthy
          </div>
        ) : (
          alerts.map((alert) => (
            <AlertRow key={alert.id} alert={alert} />
          ))
        )}
      </div>
    </div>
  );
}
