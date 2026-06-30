/**
 * app/client/support/page.tsx
 *
 * Client Support Centre — delegates all state and rendering to SupportWorkspace.
 * Keeps this file thin by design (Next.js page convention).
 */

import type { Metadata } from "next";
import { SupportWorkspace } from "@/features/support";

export const metadata: Metadata = {
  title: "Support — Fashionistar",
  description:
    "Open and track support tickets for orders, payments, delivery issues, and general help.",
};

export default function ClientSupportPage() {
  return <SupportWorkspace />;
}
