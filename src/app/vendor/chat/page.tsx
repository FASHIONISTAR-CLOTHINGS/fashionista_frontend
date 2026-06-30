/**
 * app/vendor/chat/page.tsx
 *
 * Vendor Real-Time Chat Page.
 * Server Component shell — renders the VendorChatView client island.
 */

import type { Metadata } from "next";
import { VendorChatView } from "@/features/vendor";

export const metadata: Metadata = {
  title: "Messages — Fashionistar Vendor",
  description:
    "Chat with your buyers in real time. Coordinate bespoke measurements, " +
    "custom garment requests, and delivery schedules directly in Fashionistar.",
};

export default function VendorChatPage() {
  return (
    <section className="min-h-screen px-0 py-0">
      <VendorChatView />
    </section>
  );
}
