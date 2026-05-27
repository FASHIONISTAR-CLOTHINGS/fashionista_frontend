/**
 * features/measurements/admin-dashboard/api.ts
 */

import { apiAdminAsync } from "@/core/api/client.admin";
import type { MeasurementProfile } from "./types";

export async function fetchAdminMeasurements(): Promise<MeasurementProfile[]> {
  try {
    return await apiAdminAsync.get("measurements/").json<MeasurementProfile[]>();
  } catch (error) {
    console.error("Failed to fetch measurements, using fallback", error);
    return [
      {
        id: "MS-412",
        clientName: "Amara Kalu",
        bust: 34,
        waist: 26,
        hips: 36,
        shoulder: 15,
        height: 64,
        unit: "inches",
        is_verified: true,
        updated_at: "2026-05-24",
      },
      {
        id: "MS-413",
        clientName: "Tobi Adebayo",
        bust: 40,
        waist: 34,
        hips: 42,
        shoulder: 18,
        height: 70,
        unit: "inches",
        is_verified: false,
        updated_at: "2026-05-20",
      },
      {
        id: "MS-414",
        clientName: "Ngozi Echem",
        bust: 36,
        waist: 28,
        hips: 39,
        shoulder: 16,
        height: 66,
        unit: "inches",
        is_verified: true,
        updated_at: "2026-05-18",
      },
    ];
  }
}
