"use client";

/**
 * @file page.tsx — Edit Measurement Profile Page
 * @description Page wrapper for MeasurementProfileForm in "edit" mode.
 *
 * Route: /client/dashboard/measurements/[profileId]/edit
 * API:   GET  /api/v1/ninja/measurements/{id}/ (Ninja async — read)
 *        PATCH /api/v1/measurements/{id}/       (DRF sync — update)
 *        DELETE /api/v1/measurements/{id}/      (DRF sync — delete)
 */

import { Suspense } from "react";
import { EditProfileClient } from "./EditProfileClient";

export default function EditMeasurementProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-[#111111] via-[#012226] to-[#111111] flex items-center justify-center">
          <div className="w-12 h-12 rounded-full border-4 border-[#01454A]/20 border-t-[#01454A] animate-spin" />
        </div>
      }
    >
      <EditProfileClient />
    </Suspense>
  );
}
