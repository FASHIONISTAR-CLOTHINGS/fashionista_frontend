import { VendorAuditLogsView } from "@/features/vendor/components/vendor-audit-logs-view";

export const metadata = {
  title: "Activity Audit Log | Fashionistar Vendor Portal",
  description:
    "Your complete platform activity audit trail — authentication, orders, payments, KYC, and all account events.",
};

export default function VendorAuditLogsPage() {
  return <VendorAuditLogsView />;
}
