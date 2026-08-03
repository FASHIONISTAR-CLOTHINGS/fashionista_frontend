"use client";

/**
 * @file page.tsx — Create Measurement Profile Page
 * @description Page wrapper for MeasurementProfileForm in "create" mode.
 *
 * Route: /client/dashboard/measurements/new
 * API:   POST /api/v1/measurements/ (DRF sync)
 */

import { Suspense } from "react";
import { MeasurementProfileForm } from "@/features/measurements/components/MeasurementProfileForm";

export default function CreateMeasurementProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-[#111111] via-[#012226] to-[#111111] flex items-center justify-center">
          <div className="w-12 h-12 rounded-full border-4 border-[#01454A]/20 border-t-[#01454A] animate-spin" />
        </div>
      }
    >
      <MeasurementProfileForm mode="create" />
    </Suspense>
  );
}
