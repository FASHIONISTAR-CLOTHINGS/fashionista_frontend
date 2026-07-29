/**
 * @file page.tsx
 * @route /client/dashboard/measurements/scan/qr
 * @description Desktop QR code page — shows QR for mobile handoff.
 *
 * Reads session_id from search params and displays the QR code returned by
 * the backend initiate endpoint. User scans with phone to continue scan.
 */

import type { Metadata } from "next";
import { QrHandoffClient } from "./QrHandoffClient";

export const metadata: Metadata = {
  title: "Scan QR Code — FASHIONISTAR",
  description: "Scan the QR code with your phone to continue your AI body scan.",
};

export const dynamic = "force-dynamic";

export default function QrPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  return <QrHandoffClient searchParams={searchParams} />;
}
