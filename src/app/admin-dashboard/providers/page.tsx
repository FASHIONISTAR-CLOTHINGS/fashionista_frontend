import { ProvidersDashboard } from "@/features/admin-dashboard";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "API Providers — Fashionistar Admin",
  description: "Audit third-party cloud connection status, monitor payload latency, and review service uptime.",
};

export default function AdminProvidersPage() {
  return <ProvidersDashboard />;
}
