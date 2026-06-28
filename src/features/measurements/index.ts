/**
 * @file index.ts
 * @description Public API for the `features/measurements` canonical FSD slice.
 *
 * Dual-Engine Strategy:
 *  - Ninja async → canonical reads via /api/v1/ninja/measurements/
 *  - DRF sync    → mutations and MirrorSize provider sessions
 */

// ── Types ──────────────────────────────────────────────────────────────────────
export type {
  MeasurementProfile,
  MeasurementUnit,
  CreateMeasurementProfileInput,
  UpdateMeasurementProfileInput,
} from "./types/measurements.types";

// ── Zod Schemas ────────────────────────────────────────────────────────────────
export {
  MeasurementProfileSchema,
  MeasurementListEnvelopeSchema,
  MeasurementDetailEnvelopeSchema,
  parseMeasurementResponse,
} from "./schemas/measurements.schemas";

// ── API Client ─────────────────────────────────────────────────────────────────
export {
  fetchMeasurementProfiles,
  fetchDefaultMeasurementProfile,
  fetchMeasurementProfileById,
  createMeasurementProfile,
  updateMeasurementProfile,
  setDefaultMeasurementProfile,
  deleteMeasurementProfile,
} from "./api/measurements.api";

// ── TanStack Query Hooks ───────────────────────────────────────────────────────
export {
  measurementKeys,
  useMeasurementProfiles,
  useDefaultMeasurementProfile,
  useCreateMeasurementProfile,
  useUpdateMeasurementProfile,
  useSetDefaultProfile,
} from "./hooks/use-measurements";

// ── Components ─────────────────────────────────────────────────────────────────
export { MeasurementProfilePanel } from "./components/MeasurementProfilePanel";
export { InHouseMeasurementFlow } from "./components/InHouseMeasurementFlow";

export { MeasurementCard } from "@/features/measurements/components/MeasurementCard";
export { BodyDiagram } from "@/features/measurements/components/BodyDiagram";
export { useMeasurements, useMeasurement } from "@/features/measurements/hooks/use-measurements";




// ── Admin Dashboard ────────────────────────────────────────────────────────────


// ── AI Camera Scan (In-House Measurement Engine) ───────────────────────────────
export { AICameraCapture }        from "./components/AICameraCapture";
export { PoseOverlay }            from "./components/PoseOverlay";
export { CalibrationGuide }       from "./components/CalibrationGuide";
export { MeasurementProgress, MeasurementProgressPill }
                                  from "./components/MeasurementProgress";
export { MeasurementProfileCard } from "./components/MeasurementProfileCard";
export { ScanResultCard }         from "./components/ScanResultCard";

// ── AI Scan Hooks ──────────────────────────────────────────────────────────────
export { usePoseLandmarker }      from "./hooks/usePoseLandmarker";
export { useMeasurementCapture }  from "./hooks/useMeasurementCapture";
export { useScanSession }         from "./hooks/useScanSession";

// ── AI Scan API ────────────────────────────────────────────────────────────────
export * as scanApi               from "./api/scan.api";

// ── Landmark math & unit conversion utils ──────────────────────────────────────
export {
  extractMeasurements,
  estimateHeightFromLandmarks,
  computeQualityScore,
  computeScaleFactor,
  dist3dCm,
  formatMeasurement,
  cmToInch,
  inchToCm,
  convertMeasurementsToUnit,
} from "./utils/landmarkToMeasurement";

// ── AI-specific types ──────────────────────────────────────────────────────────
export type { ScanProgressPhase } from "./components/MeasurementProgress";
export type { ExtractedMeasurements, WorldLandmark }
                                  from "./utils/landmarkToMeasurement";
