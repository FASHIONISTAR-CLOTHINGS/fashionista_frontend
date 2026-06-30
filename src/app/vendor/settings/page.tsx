import type { Metadata } from "next";
import { RoleGuard } from "@/features/auth/components/RoleGuard";
import { VendorSettingsView } from "@/features/vendor/components/vendor-settings-view";

export const metadata: Metadata = {
  title: "Settings — Vendor Dashboard | Fashionistar",
  description: "Manage your store profile, security, notifications, wallet PIN, and appearance settings.",
};

export default function VendorSettingsPage() {
  return (
    <RoleGuard requiredRole="vendor">
      <VendorSettingsView />
    </RoleGuard>
  );
}
