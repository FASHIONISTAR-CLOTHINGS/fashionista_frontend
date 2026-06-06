/**
 * entities/measurement/types/index.ts
 * Measurement entity types — mirrors Django MeasurementProfile + BodyScanSession.
 */

export type MeasurementUnit = "cm" | "inch";
export type BodyType = "slim" | "regular" | "athletic" | "plus" | "curvy";
export type ScanConfidenceLevel = "high" | "medium" | "low";

export interface MeasurementProfile {
  id: string;
  userId: string;
  unit: MeasurementUnit;
  // Core measurements (all in cm when unit="cm")
  height: number | null;
  weight: number | null;
  chest: number | null;
  waist: number | null;
  hips: number | null;
  shoulderWidth: number | null;
  armLength: number | null;
  inseam: number | null;
  neck: number | null;
  thigh: number | null;
  ankle: number | null;
  wrist: number | null;
  // Derived
  bodyType: BodyType | null;
  customNotes: string;
  isComplete: boolean;
  completionPercent: number;
  updatedAt: string;
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
