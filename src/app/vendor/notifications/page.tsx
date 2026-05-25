/**
 * app/vendor/notifications/page.tsx
 *
 * Vendor Notifications Landing Page.
 * Server Component shell — renders the VendorNotificationsView client island.
 * Protected by the vendor layout (role="vendor" guard).
 */

import type { Metadata } from "next";
import { VendorNotificationsView } from "@/features/vendor";

export const metadata: Metadata = {
  title: "Notifications — Fashionistar Vendor",
  description:
    "Stay on top of your store activity. View order alerts, payout confirmations, " +
    "product reviews, and low-stock warnings in real time.",
};

export default function VendorNotificationsPage() {
  return (
    <section className="min-h-screen px-0 py-0">
      <VendorNotificationsView />
    </section>
  );
}
