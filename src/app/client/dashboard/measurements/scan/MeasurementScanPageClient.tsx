"use client";
/**
 * @file MeasurementScanPageClient.tsx
 * @description TASK-020: Client Component — orchestrates the full AI body scan flow.
 *
 * UPGRADED: Now uses EnhancedMeasurementFlow (10-phase state machine with:
 *   - Voice AI coaching via Web Speech API
 *   - Phone orientation indicator (DeviceOrientationEvent)
 *   - Auto-capture 3-2-1 countdown (useAutoCapture hook)
 *   - Front + side pose two-phase capture
 *   - 30-frame landmark buffer for accuracy
 *   - BMI correction via backend (weight_kg optional)
 *
 * Page states:
 *   intro    → Shows EnhancedMeasurementFlow (multi-phase scan UI)
 *   complete → Redirects to /client/dashboard/measurements/{profileId}
 */

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, Suspense } from "react";
import { EnhancedMeasurementFlow } from "@/features/measurements/components/EnhancedMeasurementFlow";
import { registerMediaPipeSW } from "@/features/measurements/lib/registerMediaPipeSW";

// ─── Inner client component (reads search params) ─────────────────────────────

function ScanPageInner() {
  const router     = useRouter();
  const params     = useSearchParams();

  // Phase 13 / TASK-041: Register MediaPipe SW & warm model cache on page load.
  // This runs asynchronously — the user sees the intro UI while the 30MB model
  // downloads into the SW cache in the background.
  useEffect(() => registerMediaPipeSW(), []);

  // Pre-fill from /get-measured modal (passed via query string)
  const heightCmStr = params.get("height_cm");
  const initialHeightCm = heightCmStr ? parseFloat(heightCmStr) : undefined;

  /** Called by EnhancedMeasurementFlow when scan + save is complete. */
  const handleScanComplete = useCallback(
    (profileId: string | number | null) => {
      if (profileId) {
        router.push(`/client/dashboard/measurements/${profileId}`);
      } else {
        router.push("/client/dashboard/measurements");
      }
    },
    [router]
  );

  const handleCancel = useCallback(() => {
    router.back();
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0A0A] via-[#0D1810] to-[#0A0A0A] px-4 py-8 sm:px-6">
      <div className="max-w-2xl mx-auto">

        {/* Page header — brand compliant */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#2D6A4F]/15 border border-[#2D6A4F]/30 px-4 py-1.5 mb-4">
            <span className="w-2 h-2 rounded-full bg-[#52B788] animate-pulse" />
            <span className="text-xs font-semibold text-[#52B788] tracking-wider uppercase">
              AI Body Measurement
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            30-Second Body Scan
          </h1>
          <p className="mt-2 text-sm text-white/50 max-w-sm mx-auto">
            Stand in front of your camera in fitted clothing. Our in-house AI
            captures your 14 key measurements automatically.
          </p>
        </div>

        {/* Enhanced measurement flow — full 10-phase state machine */}
        <EnhancedMeasurementFlow
          onComplete={handleScanComplete}
          onCancel={handleCancel}
          initialHeightCm={initialHeightCm}
        />

        {/* Privacy footer */}
        <p className="mt-6 text-center text-xs text-white/30">
          All measurements are processed on our secure servers. No video is stored
          or transmitted — only pose landmark coordinates.
        </p>
      </div>
    </div>
  );
}

// ─── Exported component (wraps in Suspense for useSearchParams) ───────────────

export function MeasurementScanPageClient() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-[#2D6A4F]/20 border-t-[#2D6A4F] animate-spin mx-auto mb-4" />
          <p className="text-white/40 text-sm">Loading scanner…</p>
        </div>
      </div>
    }>
      <ScanPageInner />
    </Suspense>
  );
}
