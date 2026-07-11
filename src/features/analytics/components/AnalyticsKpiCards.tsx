/**
 * features/analytics/components/AnalyticsKpiCards.tsx
 *
 * KPI cards for the analytics dashboard overview.
 * Uses the system overview endpoint data.
 */

"use client";

import { useSystemOverview } from "../hooks";
import { LoadingSpinner } from "@/components/ui/common";

function KpiCard({
  label,
  value,
  sublabel,
  iconColor,
  iconBg,
  icon,
}: {
  label: string;
  value: string | number;
  sublabel?: string;
  iconColor: string;
  iconBg: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-[10px] shadow p-5 flex flex-col justify-between h-[150px]">
      <div className="flex justify-between items-center">
        <span className="font-satoshi text-lg text-gray-500">{label}</span>
        <div
          className="flex justify-center items-center w-9 h-9 rounded-full"
          style={{ backgroundColor: iconBg }}
        >
          <span style={{ color: iconColor }}>{icon}</span>
        </div>
      </div>
      <div>
        <span className="font-bold text-3xl text-black">{value}</span>
        {sublabel && <p className="text-xs text-[#858585] mt-1">{sublabel}</p>}
      </div>
    </div>
  );
}

export function AnalyticsKpiCards() {
  const { data, isLoading } = useSystemOverview();

  if (isLoading && !data) {
    return (
      <div className="flex items-center justify-center h-[150px]">
        <LoadingSpinner />
      </div>
    );
  }

  const ingestion = data?.ingestion;
  const performance = data?.performance;
  const alerts = data?.alerts;
  const activity = data?.activity;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <KpiCard
        label="Metrics (24h)"
        value={ingestion?.metrics_24h ?? 0}
        sublabel={`${ingestion?.metrics_1h ?? 0} in last hour · ${ingestion?.rate_per_minute ?? 0}/min`}
        iconColor="#20AB2C"
        iconBg="#C5FECB"
        icon={
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 3v18h18" />
            <path d="M7 14l4-4 4 4 6-6" />
          </svg>
        }
      />
      <KpiCard
        label="Error Rate"
        value={`${performance?.error_rate ?? 0}%`}
        sublabel={`${performance?.errors_24h ?? 0} errors / ${performance?.records_24h ?? 0} records`}
        iconColor="#ECB219"
        iconBg="#FEF3D3"
        icon={
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        }
      />
      <KpiCard
        label="Active Alerts"
        value={alerts?.firing ?? 0}
        sublabel="Firing alerts"
        iconColor="#FF6B6B"
        iconBg="#FFE0E0"
        icon={
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
        }
      />
      <KpiCard
        label="Activity (24h)"
        value={activity?.events_24h ?? 0}
        sublabel="User activity events"
        iconColor="#4A90D9"
        iconBg="#E0EDFF"
        icon={
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
          </svg>
        }
      />
    </div>
  );
}
