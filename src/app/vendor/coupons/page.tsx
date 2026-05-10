import type { Metadata } from "next";
import { RoleGuard } from "@/features/auth/components/RoleGuard";
import { VendorCouponsView } from "@/features/vendor/components/vendor-coupons-view";

export const metadata: Metadata = {
  title: "Coupons — Vendor Dashboard | Fashionistar",
  description: "Create and manage discount coupon codes for your Fashionistar store.",
};

export default function VendorCouponsPage() {
  return (
    <RoleGuard requiredRole="vendor">
      <VendorCouponsView />
    </RoleGuard>
  );
}
