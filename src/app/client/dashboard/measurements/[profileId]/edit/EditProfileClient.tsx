"use client";

/**
 * @file EditProfileClient.tsx
 * @description Client component that fetches the profile via Ninja GET
 * and renders MeasurementProfileForm in "edit" mode with pre-filled data.
 *
 * Reads:  GET /api/v1/ninja/measurements/{profileId}/  (Ninja async)
 * Writes: PATCH /api/v1/measurements/{profileId}/       (DRF sync)
 */

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import ky from "ky";
import { MeasurementProfileForm } from "@/features/measurements/components/MeasurementProfileForm";
import { measurementKeys } from "@/features/measurements/hooks/use-measurements";
import type { MeasurementProfile } from "@/features/measurements/types/measurements.types";

const MEAS_BASE = "/api/v1/ninja/measurements/";

export function EditProfileClient() {
  const params = useParams<{ profileId: string }>();
  const profileId = params?.profileId ?? "";

  const { data, isLoading, isError } = useQuery({
    queryKey: measurementKeys.detail(profileId),
    queryFn: async () => {
      const res = await ky
        .get(`${MEAS_BASE}${profileId}/`)
        .json<{ status: string; data: MeasurementProfile }>();
      return res.data;
    },
    enabled: Boolean(profileId),
    staleTime: 60_000,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#111111] via-[#012226] to-[#111111] flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-[#01454A]/20 border-t-[#01454A] animate-spin" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#111111] via-[#012226] to-[#111111] flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-lg font-semibold text-white mb-2">Profile not found</p>
          <p className="text-sm text-white/40">
            This measurement profile may have been deleted.
          </p>
        </div>
      </div>
    );
  }

  return <MeasurementProfileForm mode="edit" profileId={profileId} initialData={data} />;
}
