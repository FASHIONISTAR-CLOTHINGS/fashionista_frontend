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

