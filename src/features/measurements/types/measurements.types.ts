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

/**
 * Measurement entity types — mirrors Django MeasurementProfile + BodyScanSession.
 */
export type MeasurementUnit = "cm" | "inch";
export type BodyType = "slim" | "regular" | "athletic" | "plus" | "curvy";
export type ScanConfidenceLevel = "high" | "medium" | "low";

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

  // Core measurements (all in cm when unit="cm")
  weight: number | null;
  chest: number | null;
  shoulderWidth: number | null;
  armLength: number | null;

  // Derived
  bodyType: BodyType | null;
  customNotes: string;
  isComplete: boolean;
  completionPercent: number;
  updatedAt: string;
  createdAt: string;
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

export interface BodyScanSession {
  id: string;
  userId: string;
  status: "pending" | "processing" | "completed" | "failed";
  scanMethod: "manual" | "ai_camera" | "ml_model" | "tape_measure";
  confidenceScore: number | null;
  confidenceLevel: ScanConfidenceLevel | null;
  extractedMeasurements: Partial<MeasurementProfile> | null;
  scanDurationSeconds: number | null;
  deviceModel: string | null;
  createdAt: string;
  completedAt: string | null;
}

export interface MeasurementShareToken {
  id: string;
  token: string;
  grantedByUserId: string;
  vendorId: string | null;
  orderId: string | null;
  shareScope: string[];
  isRevoked: boolean;
  expiresAt: string | null;
  lastAccessedAt: string | null;
  accessCount: number;
  createdAt: string;
}

export interface SizeRecommendation {
  productId: string;
  vendorSizing: string;
  recommendedSize: string;
  fitNotes: string;
  confidenceScore: number;
  alternativeSizes: string[];
}

export interface MeasurementCompletionStatus {
  label: string;
  field: keyof MeasurementProfile;
  value: number | null;
  isRequired: boolean;
}

export const MEASUREMENT_FIELDS: MeasurementCompletionStatus[] = [
  { label: "Height", field: "height", value: null, isRequired: true },
  { label: "Weight", field: "weight", value: null, isRequired: false },
  { label: "Chest", field: "chest", value: null, isRequired: true },
  { label: "Waist", field: "waist", value: null, isRequired: true },
  { label: "Hips", field: "hips", value: null, isRequired: true },
  { label: "Shoulder Width", field: "shoulderWidth", value: null, isRequired: true },
  { label: "Arm Length", field: "armLength", value: null, isRequired: false },
  { label: "Inseam", field: "inseam", value: null, isRequired: false },
  { label: "Neck", field: "neck", value: null, isRequired: false },
  { label: "Thigh", field: "thigh", value: null, isRequired: false },
  { label: "Ankle", field: "ankle", value: null, isRequired: false },
  { label: "Wrist", field: "wrist", value: null, isRequired: false },
];
