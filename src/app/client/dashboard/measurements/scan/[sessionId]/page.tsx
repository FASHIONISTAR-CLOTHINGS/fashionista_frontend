/**
 * @file page.tsx
 * @route /client/dashboard/measurements/scan/[sessionId]
 * @description Active scan session page — camera capture + landmark submission.
 *
 * Reads sessionId from route params and renders ActiveScanClient.
 */

import type { Metadata } from "next";
import { ActiveScanClient } from "./ActiveScanClient";

export const metadata: Metadata = {
  title: "AI Body Scan — Active Session — FASHIONISTAR",
  description:
    "Your AI body scan is in progress. Follow the on-screen guidance for accurate measurements.",
};

export const dynamic = "force-dynamic";

export default function ActiveScanPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  return <ActiveScanClient params={params} />;
}
