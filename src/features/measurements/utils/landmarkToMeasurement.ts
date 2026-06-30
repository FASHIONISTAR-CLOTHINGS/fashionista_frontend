/**
 * @file landmarkToMeasurement.ts
 * @description Pure TypeScript utilities for converting MediaPipe world
 * landmarks (in metres) to body measurements (in centimetres).
 *
 * All math is client-side — no server roundtrip needed for linear measurements.
 * Circumferences are estimated server-side (higher accuracy with more context).
 *
 * Landmark index reference (MediaPipe BlazePose 33-point topology):
 * https://ai.google.dev/edge/mediapipe/solutions/vision/pose_landmarker
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export interface WorldLandmark {
  x: number;          // metres, centred at hip midpoint
  y: number;          // metres, positive = downward
  z: number;          // metres, positive = towards camera
  visibility?: number; // 0-1 confidence
}

export interface ExtractedMeasurements {
  /** Shoulder width (left shoulder → right shoulder), cm */
  shoulder_width: number | null;
  /** Hip width (left hip → right hip), cm — used for circumference estimation */
  hip_width: number | null;
  /** Inseam estimate (knee → ankle), cm */
  inseam: number | null;
  /** Full arm length (shoulder → elbow + elbow → wrist), cm */
  arm_length: number | null;
  /** Torso height (shoulder midpoint → hip midpoint), cm */
  torso_length: number | null;
  /** Thigh length (hip → knee), cm */
  thigh_length: number | null;
  /** Total leg length (hip → ankle), cm */
  leg_length: number | null;
  /** Auto-estimated height from nose → ankle distance, cm */
  estimated_height_cm: number | null;
  /** Per-key quality scores (0-1) */
  _visibility_scores: Record<string, number>;
  /** Scale factor used (user height / detected height) */
  _scale_factor: number;
  /** Overall pose quality score (0-1) */
  _quality_score: number;
}

// ─── Landmark Indices ─────────────────────────────────────────────────────────

const LM = {
  NOSE:           0,
  LEFT_EYE:       2,
  RIGHT_EYE:      5,
  LEFT_SHOULDER:  11,
  RIGHT_SHOULDER: 12,
  LEFT_ELBOW:     13,
  RIGHT_ELBOW:    14,
  LEFT_WRIST:     15,
  RIGHT_WRIST:    16,
  LEFT_HIP:       23,
  RIGHT_HIP:      24,
  LEFT_KNEE:      25,
  RIGHT_KNEE:     26,
  LEFT_ANKLE:     27,
  RIGHT_ANKLE:    28,
} as const;

const KEY_LANDMARKS_FOR_QUALITY = [
  LM.LEFT_SHOULDER, LM.RIGHT_SHOULDER,
  LM.LEFT_HIP, LM.RIGHT_HIP,
  LM.LEFT_KNEE, LM.RIGHT_KNEE,
  LM.LEFT_ANKLE, LM.RIGHT_ANKLE,
] as const;

// ─── Core utilities ───────────────────────────────────────────────────────────

/**
 * 3D Euclidean distance between two world landmarks, converted to cm.
 */
export function dist3dCm(a: WorldLandmark, b: WorldLandmark): number {
  return Math.sqrt(
    (a.x - b.x) ** 2 + (a.y - b.y) ** 2 + (a.z - b.z) ** 2
  ) * 100;
}

/**
 * Midpoint of two landmarks.
 */
function midpoint(a: WorldLandmark, b: WorldLandmark): WorldLandmark {
  return {
    x: (a.x + b.x) / 2,
    y: (a.y + b.y) / 2,
    z: (a.z + b.z) / 2,
    visibility: Math.min(a.visibility ?? 0, b.visibility ?? 0),
  };
}

/**
 * Compute scale factor from detected height vs. user-provided height.
 *
 * MediaPipe world landmarks are already in metres, but their scale depends
 * on the model's internal normalisation. We calibrate using the user's known
 * (or estimated) height as the ground truth.
 */
export function computeScaleFactor(
  landmarks: WorldLandmark[],
  userHeightCm: number
): number {
  const nose       = landmarks[LM.NOSE];
  const leftAnkle  = landmarks[LM.LEFT_ANKLE];
  const rightAnkle = landmarks[LM.RIGHT_ANKLE];

  if (!nose || !leftAnkle || !rightAnkle) return 1.0;

  const avgAnkleY       = (leftAnkle.y + rightAnkle.y) / 2;
  const detectedHeightM = Math.abs(nose.y - avgAnkleY);

  if (detectedHeightM < 0.1) return 1.0;

  // Convert detected height (in model units) to cm
  const detectedHeightCm = detectedHeightM * 100;
  // Correction: nose is ~7% below top of head, so real height ≈ detected × 1.07
  const correctedDetectedCm = detectedHeightCm * 1.07;

  return userHeightCm / correctedDetectedCm;
}

/**
 * Estimate height from landmarks alone (no user input required).
 * Falls back to this if user does not provide height.
 */
export function estimateHeightFromLandmarks(
  landmarks: WorldLandmark[]
): number | null {
  const nose       = landmarks[LM.NOSE];
  const leftAnkle  = landmarks[LM.LEFT_ANKLE];
  const rightAnkle = landmarks[LM.RIGHT_ANKLE];

  if (!nose || !leftAnkle || !rightAnkle) return null;

  const avgAnkleY  = (leftAnkle.y + rightAnkle.y) / 2;
  const heightM    = Math.abs(nose.y - avgAnkleY);
  const heightCm   = heightM * 100 * 1.07;

  if (heightCm < 120 || heightCm > 250) return null;
  return Math.round(heightCm * 10) / 10;
}

/**
 * Compute overall quality score from key landmark visibilities.
 * Returns 0-1. Values below 0.60 should be rejected.
 */
export function computeQualityScore(landmarks: WorldLandmark[]): number {
  const visibilities = KEY_LANDMARKS_FOR_QUALITY.map((idx) => {
    const lm = landmarks[idx];
    return lm?.visibility ?? 0;
  });
  const avg = visibilities.reduce((a, b) => a + b, 0) / visibilities.length;
  return Math.round(avg * 100) / 100;
}

// ─── Main extraction function ─────────────────────────────────────────────────

/**
 * Extract all linear body measurements from MediaPipe world landmarks.
 *
 * This is the MAIN function called by useMeasurementCapture after the
 * user is in a good pose (quality ≥ 0.72).
 *
 * @param landmarks     33 world landmarks from PoseLandmarkerResult.worldLandmarks[0]
 * @param userHeightCm  Known height from user input, OR estimated by estimateHeightFromLandmarks()
 *
 * @returns ExtractedMeasurements — all values in cm, null if landmark not visible enough
 */
export function extractMeasurements(
  landmarks: WorldLandmark[],
  userHeightCm: number
): ExtractedMeasurements {
  if (!landmarks || landmarks.length < 29) {
    throw new Error("Insufficient landmarks (need 33 points)");
  }

  const scale = computeScaleFactor(landmarks, userHeightCm);

  const scaledDist = (i: number, j: number): number | null => {
    const a = landmarks[i];
    const b = landmarks[j];
    if (!a || !b) return null;
    const visA = a.visibility ?? 0;
    const visB = b.visibility ?? 0;
    if (visA < 0.45 || visB < 0.45) return null;
    return Math.round(dist3dCm(a, b) * scale * 10) / 10;
  };

  // Shoulder width
  const shoulderWidth = scaledDist(LM.LEFT_SHOULDER, LM.RIGHT_SHOULDER);

  // Hip width
  const hipWidth = scaledDist(LM.LEFT_HIP, LM.RIGHT_HIP);

  // Inseam: knee → ankle (left side, more reliable)
  const inseam = scaledDist(LM.LEFT_KNEE, LM.LEFT_ANKLE);

  // Arm length: shoulder → elbow + elbow → wrist (average L+R)
  const leftArm  = scaledDist(LM.LEFT_SHOULDER, LM.LEFT_ELBOW);
  const leftFore = scaledDist(LM.LEFT_ELBOW, LM.LEFT_WRIST);
  const rightArm  = scaledDist(LM.RIGHT_SHOULDER, LM.RIGHT_ELBOW);
  const rightFore = scaledDist(LM.RIGHT_ELBOW, LM.RIGHT_WRIST);

  let armLength: number | null = null;
  const leftTotal  = leftArm  && leftFore  ? leftArm  + leftFore  : null;
  const rightTotal = rightArm && rightFore ? rightArm + rightFore : null;
  if (leftTotal && rightTotal)        armLength = Math.round((leftTotal + rightTotal) / 2 * 10) / 10;
  else if (leftTotal || rightTotal)   armLength = leftTotal ?? rightTotal;

  // Torso: shoulder midpoint → hip midpoint (vertical)
  let torsoLength: number | null = null;
  const lShoulder = landmarks[LM.LEFT_SHOULDER];
  const rShoulder = landmarks[LM.RIGHT_SHOULDER];
  const lHip      = landmarks[LM.LEFT_HIP];
  const rHip      = landmarks[LM.RIGHT_HIP];
  if (lShoulder && rShoulder && lHip && rHip) {
    const shoulderMid = midpoint(lShoulder, rShoulder);
    const hipMid      = midpoint(lHip, rHip);
    torsoLength = Math.round(dist3dCm(shoulderMid, hipMid) * scale * 10) / 10;
  }

  // Thigh: hip → knee
  const thighLength = scaledDist(LM.LEFT_HIP, LM.LEFT_KNEE);

  // Leg: hip → ankle
  const legLength = scaledDist(LM.LEFT_HIP, LM.LEFT_ANKLE);

  // Estimated height
  const estimatedHeightCm = estimateHeightFromLandmarks(landmarks);

  // Visibility scores for key landmarks
  const visibilityScores: Record<string, number> = {
    left_shoulder:  landmarks[LM.LEFT_SHOULDER]?.visibility ?? 0,
    right_shoulder: landmarks[LM.RIGHT_SHOULDER]?.visibility ?? 0,
    left_hip:       landmarks[LM.LEFT_HIP]?.visibility ?? 0,
    right_hip:      landmarks[LM.RIGHT_HIP]?.visibility ?? 0,
    left_knee:      landmarks[LM.LEFT_KNEE]?.visibility ?? 0,
    right_knee:     landmarks[LM.RIGHT_KNEE]?.visibility ?? 0,
    left_ankle:     landmarks[LM.LEFT_ANKLE]?.visibility ?? 0,
    right_ankle:    landmarks[LM.RIGHT_ANKLE]?.visibility ?? 0,
  };

  const qualityScore = computeQualityScore(landmarks);

  return {
    shoulder_width:       shoulderWidth,
    hip_width:            hipWidth,
    inseam,
    arm_length:           armLength,
    torso_length:         torsoLength,
    thigh_length:         thighLength,
    leg_length:           legLength,
    estimated_height_cm:  estimatedHeightCm,
    _visibility_scores:   visibilityScores,
    _scale_factor:        scale,
    _quality_score:       qualityScore,
  };
}

// ─── Unit conversion utilities ────────────────────────────────────────────────

/** Convert cm → inches, rounded to 1 decimal. */
export const cmToInch  = (cm: number): number => Math.round(cm / 2.54 * 10) / 10;

/** Convert inches → cm, rounded to 1 decimal. */
export const inchToCm  = (inch: number): number => Math.round(inch * 2.54 * 10) / 10;

/**
 * Format a measurement value for display.
 * @param valueCm  The stored value in centimetres.
 * @param unit     Display unit — 'cm' or 'inch'.
 * @param decimals Number of decimal places (default: 1).
 */
export function formatMeasurement(
  valueCm: number | null | undefined,
  unit: "cm" | "inch" = "cm",
  decimals = 1
): string {
  if (valueCm === null || valueCm === undefined) return "—";
  const value = unit === "inch" ? cmToInch(valueCm) : valueCm;
  return `${value.toFixed(decimals)} ${unit === "inch" ? "in" : "cm"}`;
}

/**
 * Convert all measurements in an ExtractedMeasurements object to the given unit.
 * Used for display purposes only — storage is always in cm.
 */
export function convertMeasurementsToUnit(
  measurements: Record<string, number | null>,
  unit: "cm" | "inch"
): Record<string, number | null> {
  if (unit === "cm") return measurements;
  const result: Record<string, number | null> = {};
  for (const [key, value] of Object.entries(measurements)) {
    if (key.startsWith("_")) {
      result[key] = value;
    } else {
      result[key] = value !== null ? cmToInch(value) : null;
    }
  }
  return result;
}
