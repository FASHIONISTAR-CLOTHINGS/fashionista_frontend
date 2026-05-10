/**
 * app/vendor/payouts/page.tsx
 *
 * Vendor Payout Management Page.
 *
 * Server Component shell — renders the PayoutDashboard client island.
 * Protected by the vendor layout (role="vendor" guard).
 */

import type { Metadata } from "next";
import { PayoutDashboard } from "@/features/payment";

export const metadata: Metadata = {
  title: "Payouts — Fashionistar Vendor",
  description:
    "Manage your vendor earnings payouts. View payout history and " +
    "initiate bank transfers to your registered account.",
};

export default function VendorPayoutsPage() {
  return (
    <section className="min-h-screen space-y-2 px-1 py-2">
      <PayoutDashboard />
    </section>
  );
}
