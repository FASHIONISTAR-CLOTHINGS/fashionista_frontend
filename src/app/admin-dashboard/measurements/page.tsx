import { MeasurementsDashboard } from "@/features/admin-dashboard";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Measurements — Fashionistar Admin",
  description: "Review luxury client body dimensions and moderate sizing profiles for customized design fulfillment.",
};

export default function AdminMeasurementsPage() {
  return <MeasurementsDashboard />;
}
