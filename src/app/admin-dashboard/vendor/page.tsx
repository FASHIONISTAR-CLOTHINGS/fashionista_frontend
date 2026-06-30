import { SellersDashboard } from "@/features/admin-dashboard/vendor";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sellers — Fashionistar Admin",
  description: "Supervise the luxury tailor boutiques, monitor review metrics, and spotlight prominent designers.",
};

export default function AdminSellersPage() {
  return <SellersDashboard />;
}
