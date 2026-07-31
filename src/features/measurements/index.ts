/**
 * @file index.ts
 * @description Public API for the `features/measurements` canonical FSD slice.
 *
 * Dual-Engine Strategy:
 *  - Ninja async → canonical reads via /api/v1/ninja/measurements/
 *  - DRF sync    → mutations and scan session writes
 */

// ── Domain Types ───────────────────────────────────────────────────────────────
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

// T-019: Scan flow Zod schemas
export {
  LandmarkPointSchema,
  SubmitLandmarksSchema,
  ScanStatusSchema,
  ScanEventSchema,
  InitiateScanSchema,
} from "./schemas/scan.schema";
export type {
  LandmarkPoint as ScanLandmarkPoint,
  SubmitLandmarksRequest,
  ScanStatusResponse as ScanStatusZod,
  ScanEvent,
  InitiateScanResponse,
} from "./schemas/scan.schema";

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
  useMeasurements,
  useMeasurement,
} from "./hooks/use-measurements";

// ── UI Components ──────────────────────────────────────────────────────────────
export { MeasurementProfilePanel }  from "./components/MeasurementProfilePanel";
export { EnhancedMeasurementFlow }  from "./components/EnhancedMeasurementFlow";
export { MeasurementCard }          from "./components/MeasurementCard";
export { BodyDiagram }              from "./components/BodyDiagram";
// T-015: Unified entry modal
export { MeasurementEntryModal }    from "./components/MeasurementEntryModal";
export type { MeasurementEntryData } from "./components/MeasurementEntryModal";

// ── AI Camera Scan Components ──────────────────────────────────────────────────
export { AICameraCapture }           from "./components/AICameraCapture";
export { PoseOverlay }               from "./components/PoseOverlay";
export { CalibrationGuide }          from "./components/CalibrationGuide";
export { MeasurementProgress, MeasurementProgressPill }
                                     from "./components/MeasurementProgress";
export { MeasurementProfileCard }    from "./components/MeasurementProfileCard";
export { ScanResultCard }            from "./components/ScanResultCard";
export { MeasurementGate }           from "./components/MeasurementGate";
export { ShareModal }                from "./components/ShareModal";
export { SizeRecommendation }        from "./components/SizeRecommendation";

// ── Voice Guidance + Device Orientation ────────────────────────────────────────
export { useVoiceGuidance }          from "./hooks/useVoiceGuidance";
export { useDeviceOrientation }      from "./hooks/useDeviceOrientation";

// ── Height Prediction Utility ──────────────────────────────────────────────────
export { predictHeightCm }           from "./utils/predictHeight";

// ── AI Scan Hooks ──────────────────────────────────────────────────────────────
export { usePoseLandmarker }         from "./hooks/usePoseLandmarker";
export { useMeasurementCapture }     from "./hooks/useMeasurementCapture";
export { useScanSession }            from "./hooks/useScanSession";
export type { UseScanSessionReturn, ScanPhase as ScanSessionPhase } from "./hooks/useScanSession";
// T-016: Height prediction hook
export { useHeightPrediction }       from "./hooks/useHeightPrediction";
export type { HeightPredictionInput, UseHeightPredictionOptions, UseHeightPredictionReturn } from "./hooks/useHeightPrediction";
export { useEnhancedMeasurementCapture }     from "./hooks/useEnhancedMeasurementCapture";
export type { UseEnhancedMeasurementCaptureReturn, UseEnhancedMeasurementCaptureOptions, EnhancedCapturePhase, EnhancedCaptureFrame } from "./hooks/useEnhancedMeasurementCapture";
export { useScanWebSocket }          from "./hooks/useScanWebSocket";
export type { WSConnectionStatus, ScanWSEvent } from "./hooks/useScanWebSocket";

// ── AI Scan API ────────────────────────────────────────────────────────────────
export * as scanApi                  from "./api/scan.api";

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
export type { ScanProgressPhase }   from "./components/MeasurementProgress";
export type { ExtractedMeasurements, WorldLandmark }
                                    from "./utils/landmarkToMeasurement";

// ── Q5: Full AICameraCapture flow types ────────────────────────────────────────
// All types needed to consume or extend the AI camera scan flow externally.
export type {
  CapturePhase,
  CaptureFrame,
  UseMeasurementCaptureReturn,
  UseMeasurementCaptureOptions,
} from "./hooks/useMeasurementCapture";

export type {
  ScanStatusResponse,
  ScanSessionResponse,
  ScanInitPayload,
  LandmarkSubmitPayload,
  LandmarkPoint,
} from "./api/scan.api";

// ── Component prop types (for external wrappers / mobile adapters) ──────────────
export type { AICameraCaptureProps }       from "./components/AICameraCapture";
export type { EnhancedMeasurementFlowProps } from "./components/EnhancedMeasurementFlow";

// T-018: Zustand scan store
export { useScanStore }                    from "./store/scanStore";
export type { ScanPhase, UserSex, ScanState } from "./store/scanStore";

// ── New Hooks (Measurement Workflow Refactor) ─────────────────────────────────
export { useAutoCapture }                  from "./hooks/useAutoCapture";
export type { UseAutoCaptureReturn, UseAutoCaptureOptions } from "./hooks/useAutoCapture";
export { useVoiceCoach }                   from "./hooks/useVoiceCoach";
export type { UseVoiceCoachReturn }        from "./hooks/useVoiceCoach";
export { usePhoneOrientation }             from "./hooks/usePhoneOrientation";
export type { UsePhoneOrientationReturn }  from "./hooks/usePhoneOrientation";
export { useHapticFeedback }               from "./hooks/useHapticFeedback";
export type { UseHapticFeedbackReturn, HapticPattern } from "./hooks/useHapticFeedback";
export { useDeviceType }                   from "./hooks/useDeviceType";
export type { UseDeviceTypeReturn, DeviceKind, ApiDeviceType } from "./hooks/useDeviceType";

// ── New UI Components (Measurement Workflow Refactor) ──────────────────────────
export { ScanTutorialOverlay }             from "./components/ScanTutorialOverlay";
export type { ScanTutorialOverlayProps }   from "./components/ScanTutorialOverlay";
export { ScanProgressStepper }             from "./components/ScanProgressStepper";
export type { ScanProgressStepperProps }   from "./components/ScanProgressStepper";
export { CountdownOverlay }                from "./components/CountdownOverlay";
export type { CountdownOverlayProps }      from "./components/CountdownOverlay";
export { PhoneOrientationIndicator }       from "./components/PhoneOrientationIndicator";
export type { PhoneOrientationIndicatorProps } from "./components/PhoneOrientationIndicator";
export { VoiceCoachDisplay }               from "./components/VoiceCoachDisplay";
export type { VoiceCoachDisplayProps }     from "./components/VoiceCoachDisplay";
export { MeasurementReveal }               from "./components/MeasurementReveal";
export type { MeasurementRevealProps }     from "./components/MeasurementReveal";
export { ScanFallbackManual }              from "./components/ScanFallbackManual";
export type { ScanFallbackManualProps }    from "./components/ScanFallbackManual";

// ── MediaPipe Service Worker Registration ──────────────────────────────────────
export { registerMediaPipeSW }             from "./lib/registerMediaPipeSW";

// ── Desktop QR Gateway ─────────────────────────────────────────────────────────
export { DesktopQRGateway }                from "./components/DesktopQRGateway";
