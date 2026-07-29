"use client";
/**
 * @file MeasurementScanPageClient.tsx
 * @description Client Component: orchestrates the full AI body scan flow.
 *
 * Page states:
 *   intro    → Shows EnhancedMeasurementFlow (the multi-step scan UI)
 *   complete → Shows success summary + redirect to profile
 */

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { EnhancedMeasurementFlow } from "@/features/measurements/components/EnhancedMeasurementFlow";

export function MeasurementScanPageClient() {
  const router = useRouter();

  /** Called by EnhancedMeasurementFlow when scan + save is complete. */
  const handleScanComplete = useCallback(
    (profileId: string | number | null) => {
      if (profileId) {
        router.push(`/client/dashboard/measurements/${profileId}`);
      } else {
        // Profile saved but no ID returned — go to measurements list
        router.push("/client/dashboard/measurements");
      }
    },
    [router]
  );

  const handleCancel = useCallback(() => {
    router.back();
  }, [router]);

  return (
    <div className="min-h-screen bg-[#F4F3EC] px-4 py-8 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">

        {/* Page header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#01454A]/8 border border-[#01454A]/15 px-4 py-1.5 mb-4">
            <span className="w-2 h-2 rounded-full bg-[#FDA600] animate-pulse" />
            <span className="text-xs font-medium text-[#01454A] tracking-wider uppercase">
              AI Body Measurement
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#01454A] tracking-tight">
            30-Second Body Scan
          </h1>
          <p className="mt-2 text-sm text-[#7A6B44] max-w-sm mx-auto">
            Stand in front of your camera in fitted clothing. Our in-house AI
            captures your 14 key measurements automatically.
          </p>
        </div>

        {/* Measurement flow */}
        <EnhancedMeasurementFlow
          onComplete={handleScanComplete}
          onCancel={handleCancel}
        />

        {/* Footer note */}
        <p className="mt-6 text-center text-xs text-[#7A6B44]/60">
          All measurements are processed on our servers. No video is stored or
          transmitted — only pose landmark coordinates.
        </p>
      </div>
    </div>
  );
}
