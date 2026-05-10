/**
 * @file measurements.types.ts
 * @description Canonical types for the Measurements domain.
 * Source of truth: `apps/measurements/serializers/measurement_serializers.py`
 *
 * Backend model fields (all in `unit` — default "cm"):
 *   Torso:       bust, waist, hips, shoulder_width, neck
 *   Lower body:  inseam, thigh, knee, ankle
 *   Arms:        arm_length, bicep, wrist
 *   Full body:   height, weight_kg
 */

export type MeasurementUnit = "cm" | "inch";

export interface MeasurementProfile {
  id: string;
  name: string;
  is_default: boolean;
  unit: MeasurementUnit;
  is_verified: boolean;
  has_core_measurements: boolean;

  // ── Torso ─────────────────────────────────────
  bust: string | null;
  waist: string | null;
  hips: string | null;
  shoulder_width: string | null;
  neck: string | null;

  // ── Lower Body ────────────────────────────────
  inseam: string | null;
  thigh: string | null;
  knee: string | null;
  ankle: string | null;

  // ── Arms ──────────────────────────────────────
  arm_length: string | null;
  bicep: string | null;
  wrist: string | null;

  // ── Full Body ─────────────────────────────────
  height: string | null;
  weight_kg: string | null;

  // ── Media & Notes ─────────────────────────────
  reference_photo_url: string | null;
  notes: string;

  // ── Timestamps ────────────────────────────────
  created_at: string;
  updated_at: string;
}

/** Input type for POST /api/v1/ninja/measurements/ */
export interface CreateMeasurementProfileInput {
  name?: string;
  unit?: MeasurementUnit;
  notes?: string;
  set_as_default?: boolean;

  // measurement fields — all optional decimals (as strings for API transport)
  bust?: string | null;
  waist?: string | null;
  hips?: string | null;
  shoulder_width?: string | null;
  neck?: string | null;
  inseam?: string | null;
  thigh?: string | null;
  knee?: string | null;
  ankle?: string | null;
  arm_length?: string | null;
  bicep?: string | null;
  wrist?: string | null;
  height?: string | null;
  weight_kg?: string | null;
}

/** Used internally for patch payloads — all fields optional */
export type UpdateMeasurementProfileInput = Partial<CreateMeasurementProfileInput>;

export interface MirrorSizeSessionInput {
  name?: string;
  email?: string;
  mobile_no?: string;
}

export interface MirrorSizeSession {
  provider: "mirrorsize";
  access_code: string;
  qr_code: string;
  measurement_url: string;
}

export interface MirrorSizeImportInput {
  access_code: string;
  set_as_default?: boolean;
}
