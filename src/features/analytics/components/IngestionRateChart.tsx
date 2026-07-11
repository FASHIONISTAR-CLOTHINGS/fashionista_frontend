/**
 * features/analytics/components/IngestionRateChart.tsx
 *
 * Line chart showing analytics ingestion rate over time.
 */

"use client";

import { useIngestionRate } from "../hooks";
import { LineChart } from "@/components/ui/composites/Charts";
import { LoadingSpinner } from "@/components/ui/common";

export function IngestionRateChart({ hours = 24 }: { hours?: number }) {
  const { data, isLoading } = useIngestionRate(hours);

  if (isLoading && !data) {
    return (
      <div className="flex items-center justify-center h-[350px] bg-white rounded-[10px] shadow">
        <LoadingSpinner />
      </div>
    );
  }

  const chartData = (data?.data_points ?? []).map((point) => ({
    name: new Date(point.hour).toLocaleTimeString("en-NG", {
      hour: "2-digit",
      minute: "2-digit",
    }),
    value: point.count,
  }));

  return (
    <div className="bg-white p-5 rounded-[10px] shadow">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-medium font-satoshi text-black">
            Ingestion Rate
          </h3>
          <p className="text-sm text-[#858585]">
            {hours}h window · Total: {data?.total ?? 0} metrics
          </p>
        </div>
      </div>
      <div className="h-[300px]">
        {chartData.length > 0 ? (
          <LineChart
            data={chartData}
            dataKey="value"
            xAxisKey="name"
            title="Metrics Ingested"
            description="Hourly ingestion count"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400 text-sm">
            No ingestion data available
          </div>
        )}
      </div>
    </div>
  );
}
