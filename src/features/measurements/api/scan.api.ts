/**
 * @file scan.api.ts
 * @description AI Body Scan API client — wraps the FASHIONISTAR dual-engine scan endpoints.
 *
 * Endpoint Routing:
 *  - DRF (sync/write):  POST /api/v1/measurements/scan/initiate/
 *  - DRF (sync/write):  POST /api/v1/measurements/scan/{id}/submit-landmarks/
 *  - Ninja (async/read): GET /api/v1/ninja/measurements/scan/{id}/status/
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
  device_type?: "web" | "ios" | "android";
  /** Exactly 33 MediaPipe world landmarks from PoseLandmarker. */
  landmarks: LandmarkPoint[];
}

/** Response from initiate / submit-landmarks endpoints. */
export interface ScanSessionResponse {
  session_id: string;
  status: "pending" | "processing" | "completed" | "failed";
  message?: string;
}

/** Full scan session status from Ninja polling endpoint. */
export interface ScanStatusResponse {
  session_id: string;
  status: "pending" | "processing" | "completed" | "failed";
  scan_confidence?: number;
  extracted_measurements?: Record<string, number | null>;
  error_message?: string;
  processing_started_at?: string;
  completed_at?: string;
  measurement_profile_id?: string | number;
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
 * GET /api/v1/ninja/measurements/scan/{sessionId}/status/
 *
 * Polls the scan session processing status.
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
  const raw = await apiAsync
    .get(`measurements/scan/${sessionId}/status/`)
    .json<ScanStatusResponse>();
  return raw;
}
