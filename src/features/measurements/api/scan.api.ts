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
 *
 * Back-compat: 'landmarks' still accepted server-side for legacy clients.
 */
export interface LandmarkSubmitPayload {
  /** User-provided height in cm. Required — used for scale calibration. */
  user_height_cm: number;

  /** Optional weight in kg — enables BMI correction layer (reduces error ±5cm → ±2.5cm). */
  user_weight_kg?: number;

  /**
   * Optional age — improves anthropometric ratio adjustment.
   * Particularly effective for ages <25 (higher shoulder-to-hip ratio)
   * and >50 (larger abdominal proportions).
   */
  user_age?: number;

  device_type?: "web" | "ios" | "android";

  /**
   * Front-facing pose landmarks (33 MediaPipe BlazePose points).
   * Named 'front_landmarks' in V1. The server still accepts 'landmarks' for back-compat.
   */
  front_landmarks?: LandmarkPoint[];

  /**
   * Side profile landmarks (33 MediaPipe BlazePose points).
   * Captured after front pose — user turns 90° to right side.
   * Used for body depth estimation (the 'b' in Ramanujan's ellipse: C = π(3(a+b) - √((3a+b)(a+3b)))).
   * Optional — scan proceeds with front-only if not provided.
   */
  side_landmarks?: LandmarkPoint[];

  /**
   * @deprecated Use front_landmarks instead.
   * Kept for backward compatibility with existing clients.
   */
  landmarks?: LandmarkPoint[];
}

// ─── Response Types ───────────────────────────────────────────────────────────

/** Response from POST /scan/initiate/ */
export interface ScanSessionResponse {
  session_id:       string;
  status:           "pending" | "processing" | "completed" | "failed";
  message?:         string;
  /** Full frontend URL for this scan session — used to build the QR code link. */
  measurement_url:  string;
  /** Base64-encoded PNG QR code for immediate display (no data: prefix). */
  qr_code_b64:      string;
  /**
   * Cloudinary URL of the persisted QR code PNG.
   * Empty string on first response (Cloudinary upload is async).
   * Use qr_code_b64 for immediate display; qr_code_url for long-term retrieval.
   */
  qr_code_url:      string;
}

/** Full scan session status from Ninja polling endpoint. */
export interface ScanStatusResponse {
  session_id:             string;
  status:                 "pending" | "processing" | "completed" | "failed";
  scan_confidence?:       number;
  /** Primary measurement output — all values in centimetres. */
  extracted_measurements?: Record<string, number | null>;
  /** NEW (Step 25): Measurements also pre-converted to inches by the backend. */
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
 *
 * The backend geometry engine returns keys with `_cm` suffix and some alias
 * names (e.g. `hip` instead of `hips`). MEASUREMENT_FIELDS in brand.ts uses
 * plain names without suffix. This normalizer runs once at the API layer so
 * every component that consumes ScanStatusResponse gets clean, consistent keys.
 *
 * Backend key          → Frontend MEASUREMENT_FIELDS key
 * ────────────────────────────────────────────────────
 * shoulder_width_cm    → shoulder_width
 * shoulder_width       → shoulder_width
 * chest_cm             → chest
 * waist_cm             → waist
 * hip_cm / hips_cm     → hips
 * hip                  → hips
 * arm_length_cm        → arm_length
 * inseam_cm            → inseam
 * thigh_cm             → thigh
 * height_cm            → height
 * neck_cm              → neck
 * wrist_cm             → wrist
 * knee_cm              → knee
 * ankle_cm             → ankle
 * upper_arm_cm         → upper_arm
 * bust_cm              → bust  (front bust circumference)
 * chest_cm             → chest (chest/pectoral — separate field from bust)
 * belly_button_cm      → waist (equator proxy — only if waist_cm absent)
 */
const BACKEND_TO_FRONTEND_KEY_MAP: Record<string, string> = {
  // With _cm suffix
  shoulder_width_cm: "shoulder_width",
  chest_cm:          "chest",          // chest/pectoral — distinct from bust
  bust_cm:           "bust",           // front bust circumference
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
  belly_button_cm:   "waist",          // equator proxy — overrides waist only if waist_cm absent
  // Without _cm suffix (back-compat)
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
 * Normalizes backend measurement keys to the canonical MEASUREMENT_FIELDS keys
 * used by MeasurementReveal, MeasurementTimeline, and all frontend card components.
 *
 * Priority: if both `chest_cm` and `bust_cm` exist, `bust_cm` wins for "bust".
 * If both `belly_button_cm` and `waist_cm` exist, `waist_cm` wins for "waist".
 */
export function normalizeScanMeasurements(
  raw: Record<string, number | null> | undefined
): Record<string, number | null> {
  if (!raw) return {};

  const out: Record<string, number | null> = {};

  // Two-pass: low-priority aliases first, then canonical fields override
  // Low-priority: belly_button (waist proxy) and hip aliases
  const lowPriority  = ["belly_button_cm", "belly_button", "hip", "hip_cm"];
  const highPriority = Object.keys(BACKEND_TO_FRONTEND_KEY_MAP).filter(
    (k) => !lowPriority.includes(k)
  );

  for (const key of [...lowPriority, ...highPriority]) {
    if (!(key in raw)) continue;
    const frontendKey = BACKEND_TO_FRONTEND_KEY_MAP[key];
    if (!frontendKey) continue;
    const val = raw[key];
    // Only override if not already set by a higher-priority key
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
  confidence:     "high" | "moderate" | "low";
  note:           string;
}

// ─── API Functions ─────────────────────────────────────────────────────────────

/**
 * POST /api/v1/measurements/scan/initiate/
 *
 * Creates a BodyScanSession with status=PENDING.
 * Returns session_id, measurement_url, qr_code_b64 (for QR display) and qr_code_url.
 *
 * IMPORTANT: Always pass device_type so the backend correctly records the requesting device.
 * This is used for analytics and for the QR gateway decision logic.
 */
export async function initiateBodyScan(
  payload: ScanInitPayload = {}
): Promise<ScanSessionResponse> {
  const { data } = await apiSync.post<{ status: string; data: ScanSessionResponse }>(
    "v1/measurements/scan/initiate/",
    payload
  );
  const session = (data as any)?.data ?? data;
  // Ensure QR fields always exist (graceful if backend is on older version)
  return {
    measurement_url: "",
    qr_code_b64:     "",
    qr_code_url:     "",
    ...session,
  };
}

/**
 * POST /api/v1/measurements/scan/{sessionId}/submit-landmarks/
 *
 * V1: Sends front landmarks (+ optional side landmarks, weight, age) to the backend.
 * Triggers the Celery MeasurementWorkflow (returns immediately — poll for status).
 *
 * The payload is normalised here so both legacy `landmarks` and new `front_landmarks`
 * are sent, ensuring server-side back-compat.
 *
 * @example
 * await submitLandmarks(sessionId, {
 *   user_height_cm: 175.5,
 *   user_weight_kg: 72,
 *   user_age: 28,
 *   front_landmarks: frontWorldLandmarks,
 *   side_landmarks: sideWorldLandmarks,
 * });
 */
export async function submitLandmarks(
  sessionId: string,
  payload:   LandmarkSubmitPayload
): Promise<ScanSessionResponse> {
  // Normalise: send both field names for server back-compat
  const normalised = {
    ...payload,
    // New field name
    front_landmarks: payload.front_landmarks ?? payload.landmarks,
    // Legacy field — keep for Django serializer back-compat
    landmarks:       payload.front_landmarks ?? payload.landmarks,
  };

  const { data } = await apiSync.post<{ status: string; data: ScanSessionResponse }>(
    `v1/measurements/scan/${sessionId}/submit-landmarks/`,
    normalised
  );
  return (data as any)?.data ?? data;
}

/**
 * GET /api/v1/ninja/ai/scan/{sessionId}/status/
 *
 * Polls the scan session processing status.
 * Call every 1-2 seconds until status = 'completed' | 'failed'.
 * Uses adaptive polling: fast for first 3 polls, then 2-second intervals.
 */
export async function pollScanStatus(
  sessionId: string
): Promise<ScanStatusResponse> {
  const raw = await apiAsync
    .get(`ai/scan/${sessionId}/status/`)
    .json<ScanStatusResponse>();

  // C-2 FIX: Normalize measurement keys once at API layer
  // After normalisation, measurements_cm contains brand.ts-compatible keys
  const rawMeasurements = raw.extracted_measurements ?? raw.measurements_cm;
  if (rawMeasurements) {
    const normalised = normalizeScanMeasurements(rawMeasurements);
    return {
      ...raw,
      measurements_cm:        normalised,  // canonical key for all frontend components
      extracted_measurements: normalised,  // keep back-compat alias pointing to same object
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
