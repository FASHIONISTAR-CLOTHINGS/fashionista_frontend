/**
 * @file page.tsx
 * @route /client/dashboard/measurements/scan
 * @description Full AI body measurement scan page.
 *
 * Routes to here from:
 *   - Measurement profile dashboard (Add/Retake scan button)
 *   - Checkout gate (when measurement required)
 *   - Navigation sidebar / account settings
 *
 * On scan completion: redirects to /client/dashboard/measurements/{profileId}
 */

import type { Metadata } from "next";
import { MeasurementScanPageClient } from "./MeasurementScanPageClient";

export const metadata: Metadata = {
  title: "AI Body Scan — FASHIONISTAR",
  description:
    "Measure your body in 30 seconds using your device camera. " +
    "Our in-house AI accurately captures 14 body measurements for perfect fit.",
};

export default function MeasurementScanPage() {
  return <MeasurementScanPageClient />;
}
