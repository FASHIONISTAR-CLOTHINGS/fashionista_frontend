/**
 * @file page.tsx
 * @route /client/dashboard/measurements
 * @description TASK-023: Full-featured measurements dashboard — history, profiles,
 * retake CTA, and measurement overview with delta comparisons.
 *
 * Architecture:
 *   - Server Component shell (metadata, force-dynamic)
 *   - Client panel lazy-imported to isolate TanStack Query hooks
 */

import type { Metadata } from "next";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "My Measurements — FASHIONISTAR",
  description:
    "Manage your AI body measurement profiles. View your 14 measurements, " +
    "track changes over time, and get perfect fit recommendations.",
  openGraph: {
    title: "My Measurements — FASHIONISTAR",
    description: "AI-powered body measurements for perfect fashion fit.",
  },
};

export default function MeasurementsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-[#111111] via-[#012226] to-[#111111] flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full border-4 border-[#01454A]/20 border-t-[#01454A] animate-spin mx-auto mb-4" />
            <p className="text-white/40 text-sm">Loading your measurements…</p>
          </div>
        </div>
      }
    >
      <MeasurementsDashboardClient />
    </Suspense>
  );
}

/**
 * Lazy-imported client boundary.
 * The actual component lives in _client.tsx to keep this file as a pure
 * Server Component (no "use client" directive here).
 */
function MeasurementsDashboardClient() {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { MeasurementsDashboard } = require("./_client");
  return <MeasurementsDashboard />;
}
