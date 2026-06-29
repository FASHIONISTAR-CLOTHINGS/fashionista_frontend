/**
 * @file page.tsx
 * @route /client/dashboard/measurements
 * @description Measurement profiles list page — shows all profiles for the logged-in client.
 */

import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "My Measurements — FASHIONISTAR",
  description: "Manage your body measurement profiles for perfect AI-powered fit recommendations.",
};

export default function MeasurementsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0d0d1a] via-[#120f2a] to-[#0a0a18] px-4 py-8 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">My Measurements</h1>
            <p className="text-sm text-white/50 mt-1">
              Your AI body measurement profiles for perfect fit
            </p>
          </div>
          <Link
            href="/client/dashboard/measurements/scan"
            className="inline-flex items-center gap-2 rounded-xl bg-violet-600 hover:bg-violet-500
                       text-white font-semibold text-sm px-5 py-2.5 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Scan
          </Link>
        </div>

        {/* Profile list — rendered client side via MeasurementProfilePanel */}
        <MeasurementProfilesClient />
      </div>
    </div>
  );
}

/**
 * Client-rendered measurement profiles panel.
 * Imported lazily to keep the page shell as a Server Component.
 */
function MeasurementProfilesClient() {
  // Lazy import prevents SSR issues with TanStack Query hooks
  const { MeasurementProfilePanel } =
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require("@/features/measurements/components/MeasurementProfilePanel");

  return <MeasurementProfilePanel />;
}
