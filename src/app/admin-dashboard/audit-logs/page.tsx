/**
 * app/admin-dashboard/audit/page.tsx
 *
 * Superadmin Compliance Audit Trail Page.
 *
 * Server Component shell — renders the AuditLogViewer client island.
 * Protected by the admin layout's <RoleGuard requiredRole="admin">.
 */

import type { Metadata } from "next";
import { AuditLogViewer } from "@/features/audit-logs";

export const metadata: Metadata = {
  title: "Audit Trail — Fashionistar Admin",
  description:
    "Immutable compliance audit trail for all platform events. " +
    "GDPR and CBN compliant, with category-based retention policies.",
};

export default function AuditLogPage() {
  return (
    <section className="min-h-screen space-y-2 px-1 py-2">
      <AuditLogViewer />
    </section>
  );
}
