/**
 * @file scan.api.ts
 * @description AI Body Scan API client — wraps the FASHIONISTAR dual-engine scan endpoints.
 *
 * UPDATED (TASK-020 Steps 20-21):
 *   - Added user_age to LandmarkSubmitPayload (anthropometric ratio adjustment)
 *   - Renamed landmarks → front_landmarks (back-compat alias kept)
 *   - Added side_landmarks (optional — 90° side pose for depth estimation)
 *   - ScanStatusResponse now includes measurements_inches field
 *
 * Endpoint Routing:
 *  - DRF (sync/write):   POST /api/v1/measurements/scan/initiate/
 *  - DRF (sync/write):   POST /api/v1/measurements/scan/{id}/submit-landmarks/
 *  - Ninja (async/read): GET  /api/v1/ninja/ai/scan/{id}/status/
 *  - Ninja (async/read): GET  /api/v1/ninja/ai/height-predict/ (public)
 */

import { apiSync } from "@/core/api/client.sync";
import { apiAsync } from "@/core/api/client.async";
import { v4 as uuidv4 } from "uuid";
import type { Options } from "ky";

// ─── Landmark Point ───────────────────────────────────────────────────────────

/** A single MediaPipe world-coordinate landmark (metres, normalised 0-1 for x/y). */
export interface LandmarkPoint {
  x:          number;
  y:          number;
  z:          number;
  visibility: number;
}

// ─── Initiate Payload ─────────────────────────────────────────────────────────

/** Payload for POST /scan/initiate/ */
export interface ScanInitPayload {
  device_type?: "web" | "ios" | "android";
}

// ─── Submit Payload (V1 — dual pose) ─────────────────────────────────────────

/**
 * Payload for POST /scan/{id}/submit-landmarks/
 *
 * V1 changes:
 *   - front_landmarks: primary pose (replaces the old 'landmarks' field)
 *   - side_landmarks:  optional 90° right-side pose (enables depth estimation → ±2.5cm)
 *   - user_age:        improves anthropometric ratio selection for <25 and >50 age groups
 *   - user_weight_kg:  enables BMI-correction (NHANES 2017-2020 table)
 *   - user_sex:        improves BMI correction for circumference estimates
 *
 * Back-compat: 'landmarks' still accepted server-side for legacy clients.
 */
export interface LandmarkSubmitPayload {
  /** User-provided height in cm. Required — used for scale calibration. */
  user_height_cm: number;

  /** Optional weight in kg — enables BMI correction layer (reduces error ±5cm → ±2.5cm). */
  user_weight_kg?: number;

  /** Optional user age — improves anthropometric ratio selection. */
  user_age?: number;

  /** Optional biological sex — improves BMI correction for circumference estimates. */
  user_sex?: "male" | "female" | "neutral";

  device_type?: "web" | "ios" | "android";

  /** 33 MediaPipe world landmarks from front-facing pose (canonical V1 key). */
  front_landmarks?: LandmarkPoint[];

  /** Optional 33 MediaPipe world landmarks from 90° side pose for depth estimation. */
  side_landmarks?: LandmarkPoint[];

  /** 33 MediaPipe world landmarks from front-facing pose (legacy alias). */
  landmarks?: LandmarkPoint[];

  /** Orientation confidence 0-1 from device orientation sensor (observational). */
  orientation_confidence?: number;

  /** Stable client key reused when the same submit is retried. */
  idempotency_key?: string;
}

// ─── Response Types ───────────────────────────────────────────────────────────

/** Response from POST /scan/initiate/ */
export interface ScanSessionResponse {
  session_id:       string;
  status:           "pending" | "processing" | "completed" | "failed";
  message?:         string;
  /** Full frontend URL for this scan session — used to build the QR code link. */
  measurement_url?: string;
  /** Base64-encoded PNG QR code for immediate display. */
  qr_code_b64?:     string;
  /** Cloudinary URL of the persisted QR code PNG. */
  qr_code_url?:     string;
}

/** Full scan session status from Ninja polling endpoint. */
export interface ScanStatusResponse {
  session_id:             string;
  status:                 "pending" | "processing" | "completed" | "failed";
  /** Persisted workflow phase when available through polling or WebSocket. */
  scan_phase?:            string;
  scan_confidence?:       number;
  /** Primary measurement output — all values in centimetres. */
  extracted_measurements?: Record<string, number | null>;
  /** Measurements pre-converted to cm / inches by backend. */
  measurements_cm?:        Record<string, number | null>;
  measurements_inches?:    Record<string, number | null>;
  /** Plausibility warnings from anthropometric filter. */
  plausibility_warnings?:  string[];
  /** Whether BMI correction was applied. */
  correction_applied?:     string;
  /** Computed BMI (if weight was provided). */
  bmi?:                    number | null;
  error_message?:          string;
  measurement_profile_id?: string | number;
  processing_started_at?:  string;
  completed_at?:           string;
}

// ─── C-2 FIX: Measurement key normalizer ─────────────────────────────────────

/**
 * Maps backend extracted_measurements keys → brand.ts MEASUREMENT_FIELDS keys.
 */
const BACKEND_TO_FRONTEND_KEY_MAP: Record<string, string> = {
  shoulder_width_cm: "shoulder_width",
  chest_cm:          "chest",
  bust_cm:           "bust",
  waist_cm:          "waist",
  hip_cm:            "hips",
  hips_cm:           "hips",
  arm_length_cm:     "arm_length",
  inseam_cm:         "inseam",
  thigh_cm:          "thigh",
  height_cm:         "height",
  neck_cm:           "neck",
  wrist_cm:          "wrist",
  knee_cm:           "knee",
  ankle_cm:          "ankle",
  upper_arm_cm:      "upper_arm",
  belly_button_cm:   "waist",
  shoulder_width:    "shoulder_width",
  chest:             "chest",
  bust:              "bust",
  waist:             "waist",
  hip:               "hips",
  hips:              "hips",
  arm_length:        "arm_length",
  inseam:            "inseam",
  thigh:             "thigh",
  height:            "height",
  neck:              "neck",
  wrist:             "wrist",
  knee:              "knee",
  ankle:             "ankle",
  upper_arm:         "upper_arm",
};

/**
 * Normalizes backend measurement keys to the canonical MEASUREMENT_FIELDS keys.
 */
export function normalizeScanMeasurements(
  raw: Record<string, number | null> | undefined
): Record<string, number | null> {
  if (!raw) return {};

  const out: Record<string, number | null> = {};

  const lowPriority  = ["belly_button_cm", "belly_button", "hip", "hip_cm"];
  const highPriority = Object.keys(BACKEND_TO_FRONTEND_KEY_MAP).filter(
    (k) => !lowPriority.includes(k)
  );

  for (const key of [...lowPriority, ...highPriority]) {
    if (!(key in raw)) continue;
    const frontendKey = BACKEND_TO_FRONTEND_KEY_MAP[key];
    if (!frontendKey) continue;
    const val = raw[key];
    if (!(frontendKey in out) || val != null) {
      out[frontendKey] = val;
    }
  }

  return out;
}

/** Response from GET /api/v1/ninja/ai/height-predict/ */
export interface HeightPredictResponse {
  predicted_cm:   number;
  predicted_inch: string;
  range_low_cm:   number;
  range_high_cm:  number;
  confidence:     "high" | "moderate" | "low" | string;
  note?:          string;
}

// ─── API Functions ─────────────────────────────────────────────────────────────

/**
 * POST /api/v1/measurements/scan/initiate/
 */
export async function initiateBodyScan(
  payload: ScanInitPayload = {}
): Promise<ScanSessionResponse> {
  const { data } = await apiSync.post<{ status: string; data: ScanSessionResponse }>(
    "v1/measurements/scan/initiate/",
    payload
  );
  const response = data as unknown as { data?: ScanSessionResponse } & ScanSessionResponse;
  const session = response.data ?? response;
  return {
    ...session,
    measurement_url: session.measurement_url ?? "",
    qr_code_b64:     session.qr_code_b64 ?? "",
    qr_code_url:     session.qr_code_url ?? "",
  };
}

/**
 * POST /api/v1/measurements/scan/{sessionId}/submit-landmarks/
 */
export async function submitLandmarks(
  sessionId: string,
  payload:   LandmarkSubmitPayload
): Promise<ScanSessionResponse> {
  const { idempotency_key: suppliedIdempotencyKey, ...payloadBody } = payload;
  const idempotencyKey = suppliedIdempotencyKey ?? uuidv4();
  const normalised = {
    ...payloadBody,
    front_landmarks: payload.front_landmarks ?? payload.landmarks,
    landmarks:       payload.front_landmarks ?? payload.landmarks,
  };

  const { data } = await apiSync.post<{ status: string; data: ScanSessionResponse }>(
    `v1/measurements/scan/${sessionId}/submit-landmarks/`,
    normalised,
    {
      headers: {
        // The backend canonical contract is the standard header. Keep the
        // legacy X-prefixed header for shared client middleware compatibility.
        "Idempotency-Key": idempotencyKey,
        "X-Idempotency-Key": idempotencyKey,
      },
    },
  );
  const response = data as unknown as { data?: ScanSessionResponse } & ScanSessionResponse;
  return response.data ?? response;
}

/**
 * GET /api/v1/ninja/measurements/scan/{sessionId}/status/
 */
export async function pollScanStatus(
  sessionId: string
): Promise<ScanStatusResponse> {
  const raw = await apiAsync
    .get(`measurements/scan/${sessionId}/status/`, {
      _suppressAuthRedirect: true,
    } as Options & { _suppressAuthRedirect?: boolean })
    .json<ScanStatusResponse>();

  const rawMeasurements = raw.extracted_measurements ?? raw.measurements_cm;
  if (rawMeasurements) {
    const normalised = normalizeScanMeasurements(rawMeasurements);
    return {
      ...raw,
      measurements_cm:        normalised,
      extracted_measurements: normalised,
    };
  }

  return raw;
}

/**
 * GET /api/v1/ninja/ai/height-predict/
 *
 * Public endpoint — predicts height range from age and sex using WHO/NHANES tables.
 * Used on the marketing get-measured page to pre-fill the height field.
 * 24-hour Redis cache on the backend.
 *
 * @example
 * const { predicted_cm } = await predictHeight(28, "female");
 */
export async function predictHeight(
  age: number,
  sex: "male" | "female" | "neutral" = "neutral"
): Promise<HeightPredictResponse> {
  return apiAsync
    .get(`ai/height-predict/`, { searchParams: { age: String(age), sex } })
    .json<HeightPredictResponse>();
}
