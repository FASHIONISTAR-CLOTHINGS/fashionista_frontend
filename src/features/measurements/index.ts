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
  MirrorSizeImportInput,
  MirrorSizeSession,
  MirrorSizeSessionInput,
  UpdateMeasurementProfileInput,
} from "./types/measurements.types";

// ── Zod Schemas ────────────────────────────────────────────────────────────────
export {
  MeasurementProfileSchema,
  MeasurementListEnvelopeSchema,
  MeasurementDetailEnvelopeSchema,
  MirrorSizeSessionEnvelopeSchema,
  MirrorSizeSessionSchema,
  parseMeasurementResponse,
} from "./schemas/measurements.schemas";

// ── API Client ─────────────────────────────────────────────────────────────────
export {
  fetchMeasurementProfiles,
  fetchDefaultMeasurementProfile,
  fetchMeasurementProfileById,
  createMeasurementProfile,
  createMirrorSizeSession,
  updateMeasurementProfile,
  setDefaultMeasurementProfile,
  deleteMeasurementProfile,
  importMirrorSizeMeasurement,
} from "./api/measurements.api";

// ── TanStack Query Hooks ───────────────────────────────────────────────────────
export {
  measurementKeys,
  useMeasurementProfiles,
  useDefaultMeasurementProfile,
  useCreateMeasurementProfile,
  useCreateMirrorSizeSession,
  useUpdateMeasurementProfile,
  useSetDefaultProfile,
  useDeleteMeasurementProfile,
  useImportMirrorSizeMeasurement,
} from "./hooks/use-measurements";

// ── Components ─────────────────────────────────────────────────────────────────
export { MeasurementProfilePanel } from "./components/MeasurementProfilePanel";
export { MirrorSizeMeasurementFlow } from "./components/MirrorSizeMeasurementFlow";










export { MeasurementCard } from "@/features/measurement/components/MeasurementCard";
export { BodyDiagram } from "@/features/measurement/components/BodyDiagram";
export { useMeasurements, useMeasurement } from "@/features/measurement/hooks/use-measurements";




// ── Admin Dashboard ────────────────────────────────────────────────────────────

