import { AnalyticsDashboard } from "@/features/analytics";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Analytics — Fashionistar Admin",
  description: "Platform analytics dashboard with real-time metrics and alerts.",
};

export default function AnalyticsPage() {
  return <AnalyticsDashboard />;
}
