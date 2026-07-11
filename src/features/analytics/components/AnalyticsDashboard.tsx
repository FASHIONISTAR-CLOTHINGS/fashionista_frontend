/**
 * features/analytics/components/AnalyticsDashboard.tsx
 *
 * Main analytics dashboard view — combines KPI cards, ingestion chart,
 * real-time feed, and alert panel.
 */

"use client";

import { AnalyticsKpiCards } from "./AnalyticsKpiCards";
import { IngestionRateChart } from "./IngestionRateChart";
import { RealtimeFeed } from "./RealtimeFeed";
import { AlertPanel } from "./AlertPanel";
import { useAnalyticsDashboard } from "../hooks";

export function AnalyticsDashboard() {
  const { data: dashData, isLoading } = useAnalyticsDashboard();

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="font-satoshi font-medium text-3xl text-black">
            Analytics
          </h2>
          <p className="font-satoshi text-xl text-[#666]">
            Platform analytics, real-time metrics, and system health.
          </p>
        </div>
        {isLoading && (
          <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
            <span className="animate-spin h-4 w-4 border-2 border-[#fda600] border-t-transparent rounded-full" />
            Loading dashboard...
          </div>
        )}
      </div>

      {/* Quick Stats Summary */}
      {dashData && (
        <div className="flex flex-wrap gap-3 text-sm">
          <div className="px-4 py-2 bg-white rounded-lg shadow-sm">
            <span className="text-[#858585]">Performance Records: </span>
            <span className="font-bold text-black">{dashData.performance_count}</span>
          </div>
          <div className="px-4 py-2 bg-white rounded-lg shadow-sm">
            <span className="text-[#858585]">Business Metrics: </span>
            <span className="font-bold text-black">{dashData.business_count}</span>
          </div>
          <div className="px-4 py-2 bg-white rounded-lg shadow-sm">
            <span className="text-[#858585]">Alerts: </span>
            <span className="font-bold text-black">{dashData.alert_count}</span>
          </div>
          <div className="px-4 py-2 bg-white rounded-lg shadow-sm">
            <span className="text-[#858585]">Activities: </span>
            <span className="font-bold text-black">{dashData.activity_count}</span>
          </div>
          <div className="px-4 py-2 bg-white rounded-lg shadow-sm">
            <span className="text-[#858585]">Avg Response: </span>
            <span className="font-bold text-black">{dashData.avg_response_time_ms}ms</span>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <AnalyticsKpiCards />

      {/* Ingestion Chart */}
      <IngestionRateChart hours={24} />

      {/* Real-time + Alerts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RealtimeFeed />
        <AlertPanel />
      </div>
    </div>
  );
}
