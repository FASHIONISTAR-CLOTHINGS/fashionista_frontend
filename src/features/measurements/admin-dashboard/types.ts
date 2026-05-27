/**
 * features/measurements/admin-dashboard/types.ts
 */

export interface MeasurementProfile {
  id: string;
  clientName: string;
  bust: number;
  waist: number;
  hips: number;
  shoulder: number;
  height: number;
  unit: "inches" | "cm";
  is_verified: boolean;
  updated_at: string;
}
