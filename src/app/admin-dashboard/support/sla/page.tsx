/**
 * app/admin-dashboard/support/sla/page.tsx
 *
 * Admin SLA Monitoring Page.
 *
 * Server Component shell — renders the SlaDashboard client island.
 * Protected by the admin layout's <RoleGuard requiredRole="admin">.
 */

import type { Metadata } from "next";
import { SlaDashboard } from "@/features/support";

export const metadata: Metadata = {
  title: "SLA Monitoring — Fashionistar Admin",
  description:
    "Real-time SLA breach monitoring dashboard for all active support tickets. " +
    "Tracks first-response and resolution deadlines per CBN SLA commitments.",
};

export default function SlaMonitoringPage() {
  return (
    <section className="min-h-screen space-y-2 px-1 py-2">
      <SlaDashboard />
    </section>
  );
}
