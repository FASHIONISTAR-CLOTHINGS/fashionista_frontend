import { AdminHomeDashboard } from "@/features/admin-dashboard";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard — Fashionistar Admin",
  description: "Platform overall activity and metrics summary.",
};

export default function AdminPage() {
  return <AdminHomeDashboard />;
}
