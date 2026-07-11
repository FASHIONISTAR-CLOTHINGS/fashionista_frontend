import { AnalyticsReportView } from "@/features/analytics";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Analytics Reports — Fashionistar Admin",
  description: "Detailed analytics reports with date filtering and CSV export.",
};

export default function AnalyticsReportPage() {
  return <AnalyticsReportView />;
}
