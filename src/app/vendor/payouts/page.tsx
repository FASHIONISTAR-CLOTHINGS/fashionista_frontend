/**
 * app/vendor/payouts/page.tsx
 *
 * Vendor Payout Management Page.
 *
 * Server Component shell — renders the PayoutDashboard client island.
 * Protected by the vendor layout (role="vendor" guard).
 */

import type { Metadata } from "next";
import { VendorPayoutsView } from "@/features/vendor";

export const metadata: Metadata = {
  title: "Payouts — Fashionistar Vendor",
  description:
    "Manage saved bank accounts, wallet PIN, and secure vendor withdrawals.",
};

export default function VendorPayoutsPage() {
  return (
    <section className="min-h-screen space-y-2 px-1 py-2">
      <VendorPayoutsView />
    </section>
  );
}
