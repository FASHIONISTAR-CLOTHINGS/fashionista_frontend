/**
 * @file page.tsx
 * @route /client/dashboard/measurements/scan
 * @description Scan entry point — tutorial + entry modal + session initiation.
 *
 * Renders ScanEntryClient which orchestrates:
 *   1. Tutorial overlay (if not seen before)
 *   2. MeasurementEntryModal (age, sex, height, weight)
 *   3. initiateBodyScan API call
 *   4. Redirect to /scan/[sessionId] (mobile) or /scan/qr (desktop)
 *
 * On scan completion: ActiveScanClient redirects to /client/dashboard/measurements/{profileId}
 */

import type { Metadata } from "next";
import { ScanEntryClient } from "./ScanEntryClient";

export const metadata: Metadata = {
  title: "AI Body Scan — FASHIONISTAR",
  description:
    "Measure your body in 30 seconds using your device camera. " +
    "Our in-house AI accurately captures 14 body measurements for perfect fit.",
};

export const dynamic = "force-dynamic";

export default function MeasurementScanPage() {
  return <ScanEntryClient />;
}
