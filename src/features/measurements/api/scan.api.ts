/**
 * @file scan.api.ts
 * @description AI Body Scan API client — wraps the FASHIONISTAR dual-engine scan endpoints.
 *
 * Endpoint Routing:
 *  - DRF (sync/write):   POST /api/v1/measurements/scan/initiate/
 *  - DRF (sync/write):   POST /api/v1/measurements/scan/{id}/submit-landmarks/
 *  - Ninja (async/read): GET  /api/v1/ninja/ai/scan/{id}/status/
 *
 * NOTE: The status polling endpoint is under /api/v1/ninja/ai/ (NOT /ninja/measurements/).
 * The AI Ninja router is mounted at /api/v1/ninja/ai/ in the main Ninja app config.
 */

import { apiSync } from "@/core/api/client.sync";
import { apiAsync } from "@/core/api/client.async";

// ─── Types ────────────────────────────────────────────────────────────────────

/** A single MediaPipe world-coordinate landmark (in metres). */
export interface LandmarkPoint {
  x: number;
  y: number;
  z: number;
  visibility: number;
}

/** Payload for POST /scan/initiate/ */
export interface ScanInitPayload {
  device_type?: "web" | "ios" | "android";
}

/** Payload for POST /scan/{id}/submit-landmarks/ */
export interface LandmarkSubmitPayload {
  /** User-provided height in cm. Auto-estimated if not provided (see height estimation). */
  user_height_cm: number;
  /** Optional user-provided weight in kg — improves circumference estimates. */
  user_weight_kg?: number;
  /** Optional user age — improves anthropometric ratio selection. */
  user_age?: number;
  /** Optional biological sex — improves BMI correction for circumference estimates. */
  user_sex?: "male" | "female" | "neutral";
  device_type?: "web" | "ios" | "android";
  /** 33 MediaPipe world landmarks from front-facing pose. (legacy alias for landmarks_front) */
  landmarks?: LandmarkPoint[];
  /** 33 MediaPipe world landmarks from front-facing pose (preferred key). */
  landmarks_front?: LandmarkPoint[];
  /** Optional 33 MediaPipe world landmarks from 90° side pose for depth estimation. */
  landmarks_side?: LandmarkPoint[];
  /** Orientation confidence 0-1 from device orientation sensor (observational). */
  orientation_confidence?: number;
}

/** Response from initiate / submit-landmarks endpoints. */
export interface ScanSessionResponse {
  session_id: string;
  status: "pending" | "processing" | "completed" | "failed";
  message?: string;
  /** QR code URL for mobile handoff (desktop flow). */
  measurement_url?: string;
  /** Base64-encoded QR code image (PNG). */
  qr_code_b64?: string;
  /** Cloudinary URL for the uploaded QR code (if Cloudinary is configured). */
  qr_code_url?: string;
}

/** Full scan session status from Ninja polling endpoint. */
export interface ScanStatusResponse {
  session_id: string;
  status: "pending" | "processing" | "completed" | "failed";
  scan_confidence?: number;
  extracted_measurements?: Record<string, number | null>;
  error_message?: string;
  measurement_profile_id?: string | number;
  processing_started_at?: string;
  completed_at?: string;
  /** T-042: BMI value if weight was provided */
  bmi?: number | null;
  /** T-041: Plausibility warnings from anthropometric checks */
  plausibility_warnings?: string[];
  /** T-041: Correction tier applied (e.g. "normal", "overweight") */
  correction_applied?: string;
}

// ─── API Functions ─────────────────────────────────────────────────────────────

/**
 * POST /api/v1/measurements/scan/initiate/
 *
 * Creates a BodyScanSession with status=PENDING.
 * The returned session_id is used to submit landmarks and poll status.
 *
 * @example
 * const session = await initiateBodyScan({ device_type: "web" });
 * console.log(session.session_id); // "3f5a1c9e-..."
 */
export async function initiateBodyScan(
  payload: ScanInitPayload = {}
): Promise<ScanSessionResponse> {
  const { data } = await apiSync.post<{ status: string; data: ScanSessionResponse }>(
    "v1/measurements/scan/initiate/",
    payload
  );
  return (data as any)?.data ?? data;
}

/**
 * POST /api/v1/measurements/scan/{sessionId}/submit-landmarks/
 *
 * Sends 33 MediaPipe world landmarks + user height to the backend.
 * Triggers the Celery MeasurementWorkflow (returns immediately — poll for status).
 *
 * @example
 * await submitLandmarks(sessionId, {
 *   user_height_cm: 175.5,
 *   landmarks: poseLandmarkerResult.worldLandmarks[0],
 * });
 */
export async function submitLandmarks(
  sessionId: string,
  payload: LandmarkSubmitPayload
): Promise<ScanSessionResponse> {
  const { data } = await apiSync.post<{ status: string; data: ScanSessionResponse }>(
    `v1/measurements/scan/${sessionId}/submit-landmarks/`,
    payload
  );
  return (data as any)?.data ?? data;
}

/**
 * GET /api/v1/ninja/ai/scan/{sessionId}/status/
 *
 * Polls the scan session processing status.
 * Mounted under the AI Ninja router at /api/v1/ninja/ai/ — NOT /ninja/measurements/.
 * Call every 2 seconds until status = 'completed' | 'failed'.
 *
 * @example
 * const status = await pollScanStatus(sessionId);
 * if (status.status === "completed") {
 *   console.log(status.extracted_measurements);
 * }
 */
export async function pollScanStatus(
  sessionId: string
): Promise<ScanStatusResponse> {
  // The AI scan status endpoint lives under ai_router at /api/v1/ninja/ai/
  // apiAsync base URL should be set to /api/v1/ninja/ so the path is ai/scan/...
  const raw = await apiAsync
    .get(`ai/scan/${sessionId}/status/`)
    .json<ScanStatusResponse>();
  return raw;
}

// ─── Height Prediction ─────────────────────────────────────────────────────────

/** Response from GET /api/v1/ninja/ai/height-predict/ */
export interface HeightPredictResponse {
  predicted_cm:   number;
  predicted_inch:  string;
  range_low_cm:    number;
  range_high_cm:   number;
  confidence:      string;
  note?:           string;
}

/**
 * GET /api/v1/ninja/ai/height-predict/?age={age}&sex={sex}
 *
 * Predicts user height from age and biological sex using the backend AI model.
 * Falls back to client-side prediction if the backend is unreachable.
 *
 * @example
 * const result = await predictHeight(28, "male");
 * console.log(result.predicted_cm); // 177
 */
export async function predictHeight(
  age: number,
  sex?: "male" | "female" | "neutral",
): Promise<HeightPredictResponse> {
  const searchParams = new URLSearchParams({ age: String(age) });
  if (sex) searchParams.set("sex", sex);
  const raw = await apiAsync
    .get(`ai/height-predict/?${searchParams.toString()}`)
    .json<HeightPredictResponse>();
  return raw;
}
