/**
 * app/vendor/support/page.tsx
 *
 * Vendor Support Tickets Page.
 * Server Component shell — renders the VendorSupportView client island.
 */

import type { Metadata } from "next";
import { VendorSupportView } from "@/features/vendor";

export const metadata: Metadata = {
  title: "Support Tickets — Fashionistar Vendor",
  description:
    "Manage your support tickets. Communicate with Fashionistar support staff " +
    "about orders, disputes, account issues, and platform questions.",
};

export default function VendorSupportPage() {
  return (
    <section className="min-h-screen px-0 py-0">
      <VendorSupportView />
    </section>
  );
}
