/**
 * @file poseIntelligence.ts
 * @description Industry-grade AI pose intelligence for body measurement scanning.
 *
 * Analyzes MediaPipe BlazePose normalized landmarks (0-1) and world landmarks (metres)
 * to produce real-time coaching guidance competing with MirrSize, Bodygram, Nettelo.
 *
 * Intelligence checks:
 * - Full body visibility (head, shoulders, hips, knees, ankles must all be visible)
 * - Distance from camera (too_close / optimal / too_far)
 * - Centering in frame (too_left / centered / too_right)
 * - Arms at A-pose 45 degrees (shoulder to elbow angle)
 * - Feet stance width (relative to shoulder width)
 * - Overall readiness score (0-100)
 *
 * Usage:
 *   const intelligence = analyzePose(normalLandmarks, worldLandmarks);
 *   if (intelligence.overallReady) triggerCountdown();
 */

import type { Landmark } from "../hooks/usePoseLandmarker";

// ─── Result Type ──────────────────────────────────────────────────────────────

export interface PoseIntelligenceResult {
  /** Is the complete body visible (head to ankles)? */
  isFullBodyVisible: boolean;
  /** Which body parts are not visible */
  missingParts: ("head" | "shoulders" | "hips" | "knees" | "ankles")[];

  /** Distance status from camera */
  distanceStatus: "too_close" | "optimal" | "too_far" | "unknown";
  /** Normalized body span (0-1), larger = closer */
  distancePercent: number;

  /** Horizontal centering */
  centeringStatus: "too_left" | "centered" | "too_right" | "unknown";
  /** Normalized offset from center (-ve left, +ve right) */
  centerOffset: number;

  /** Arms pose for A-pose measurement */
  armsStatus: "unknown" | "at_sides" | "approaching_45" | "at_45" | "too_high";
  leftArmAngleDeg: number;
  rightArmAngleDeg: number;

  /** Feet stance relative to shoulder width */
  feetStatus: "unknown" | "too_close" | "shoulder_width" | "too_wide";
  feetWidthRatio: number;

  /** Overall readiness: true when all conditions met for capture */
  overallReady: boolean;
  /** 0-100 composite readiness score */
  readinessScore: number;

  /** Approximate feet the user should move based on distance ratio */
  distanceFeet: number;

  /** Calibrated coaching message for distance */
  distanceMessage: string;
  /** Calibrated coaching message for centering */
  centeringMessage: string;
  /** Calibrated coaching message for arms */
  armsMessage: string;

  /** Primary actionable message for the user */
  primaryMessage: string;
  /** Secondary supporting message */
  secondaryMessage: string;
}

// ─── MediaPipe BlazePose Landmark Indices ─────────────────────────────────────

const LM = {
  NOSE: 0,
  L_SHOULDER: 11,
  R_SHOULDER: 12,
  L_ELBOW: 13,
  R_ELBOW: 14,
  L_WRIST: 15,
  R_WRIST: 16,
  L_HIP: 23,
  R_HIP: 24,
  L_KNEE: 25,
  R_KNEE: 26,
  L_ANKLE: 27,
  R_ANKLE: 28,
} as const;

// ─── Analyzer ────────────────────────────────────────────────────────────────

/**
 * Analyzes pose landmarks to produce intelligent coaching guidance.
 * @param normalLandmarks - Normalized landmarks (0-1), from MediaPipe result.landmarks[0]
 * @param worldLandmarks  - World landmarks (metres), from MediaPipe result.worldLandmarks[0]
 */
export function analyzePose(
  normalLandmarks: Landmark[],
  worldLandmarks: Landmark[],
  userHeightCm?: number,
): PoseIntelligenceResult {
  const result: PoseIntelligenceResult = {
    isFullBodyVisible: false,
    missingParts: [],
    distanceStatus: "unknown",
    distancePercent: 0,
    centeringStatus: "unknown",
    centerOffset: 0,
    armsStatus: "unknown",
    leftArmAngleDeg: 0,
    rightArmAngleDeg: 0,
    feetStatus: "unknown",
    feetWidthRatio: 0,
    overallReady: false,
    readinessScore: 0,
    distanceFeet: 0,
    distanceMessage: "",
    centeringMessage: "",
    armsMessage: "",
    primaryMessage: "Step in front of the camera",
    secondaryMessage: "",
  };

  if (!normalLandmarks || normalLandmarks.length < 29) return result;

  const VIS = 0.5; // Visibility threshold

  // Landmark shortcuts
  const nose = normalLandmarks[LM.NOSE];
  const lShoulder = normalLandmarks[LM.L_SHOULDER];
  const rShoulder = normalLandmarks[LM.R_SHOULDER];
  const lHip = normalLandmarks[LM.L_HIP];
  const rHip = normalLandmarks[LM.R_HIP];
  const lKnee = normalLandmarks[LM.L_KNEE];
  const rKnee = normalLandmarks[LM.R_KNEE];
  const lAnkle = normalLandmarks[LM.L_ANKLE];
  const rAnkle = normalLandmarks[LM.R_ANKLE];

  // ── Full Body Visibility Check ────────────────────────────────────────────
  const headVis = (nose?.visibility ?? 0) > VIS;
  const shoulderVis = (lShoulder?.visibility ?? 0) > VIS && (rShoulder?.visibility ?? 0) > VIS;
  const hipVis = (lHip?.visibility ?? 0) > VIS && (rHip?.visibility ?? 0) > VIS;
  const kneeVis = (lKnee?.visibility ?? 0) > VIS || (rKnee?.visibility ?? 0) > VIS;
  const ankleVis = (lAnkle?.visibility ?? 0) > VIS || (rAnkle?.visibility ?? 0) > VIS;

  if (!headVis) result.missingParts.push("head");
  if (!shoulderVis) result.missingParts.push("shoulders");
  if (!hipVis) result.missingParts.push("hips");
  if (!kneeVis) result.missingParts.push("knees");
  if (!ankleVis) result.missingParts.push("ankles");
  result.isFullBodyVisible = result.missingParts.length === 0;

  // ── Distance (body span as fraction of frame height) ──────────────────────
  const OPTIMAL_SPAN = 0.72;
  if (nose && ankleVis) {
    const avgAnkleY = lAnkle && rAnkle
      ? (lAnkle.y + rAnkle.y) / 2
      : (lAnkle?.y ?? rAnkle?.y ?? 0);
    const span = Math.abs(avgAnkleY - nose.y);
    result.distancePercent = span;

    if (span > 0.85) result.distanceStatus = "too_close";
    else if (span >= 0.60) result.distanceStatus = "optimal";
    else if (span < 0.45) result.distanceStatus = "too_far";
    else result.distanceStatus = "optimal";

    // Calibrated "step back / closer by N feet" guidance.
    // Using the user-supplied height gives a rough distance estimate.
    const height = userHeightCm && userHeightCm > 50 ? userHeightCm : 170;
    const distanceCm = (height / 100) * (OPTIMAL_SPAN / Math.max(span, 0.15));
    const optimalDistanceCm = (height / 100) * 1.15; // ~2m for 170cm
    const diffCm = distanceCm - optimalDistanceCm;
    result.distanceFeet = Math.max(0.5, Math.abs(diffCm) / 30.48); // cm → feet

    if (result.distanceStatus === "too_close") {
      if (result.distanceFeet > 2.5) result.distanceMessage = `Step back ${Math.round(result.distanceFeet)} feet`;
      else if (result.distanceFeet > 1.3) result.distanceMessage = `Step back 1 foot`;
      else result.distanceMessage = `Step back a little`;
    } else if (result.distanceStatus === "too_far") {
      if (result.distanceFeet > 2.5) result.distanceMessage = `Step closer ${Math.round(result.distanceFeet)} feet`;
      else if (result.distanceFeet > 1.3) result.distanceMessage = `Step closer 1 foot`;
      else result.distanceMessage = `Step closer a little`;
    } else {
      result.distanceMessage = "Distance looks good";
      result.distanceFeet = 0;
    }
  }

  // ── Horizontal Centering ──────────────────────────────────────────────────
  // Video is mirrored (scale-x[-1]) so we flip X
  if (nose && (nose.visibility ?? 0) > VIS) {
    const mirroredX = 1 - nose.x;
    result.centerOffset = mirroredX - 0.5;
    if (mirroredX < 0.35) result.centeringStatus = "too_right";
    else if (mirroredX > 0.65) result.centeringStatus = "too_left";
    else result.centeringStatus = "centered";

    const absOffset = Math.abs(result.centerOffset);
    if (result.centeringStatus === "centered") {
      result.centeringMessage = "Centered";
    } else if (result.centeringStatus === "too_left") {
      if (absOffset > 0.25) result.centeringMessage = "Move a little to your left";
      else if (absOffset > 0.12) result.centeringMessage = "Move slightly to your left";
      else result.centeringMessage = "Move tiny bit to your left";
    } else {
      if (absOffset > 0.25) result.centeringMessage = "Move a little to your right";
      else if (absOffset > 0.12) result.centeringMessage = "Move slightly to your right";
      else result.centeringMessage = "Move tiny bit to your right";
    }
  }

  // ── Arms Angle (A-pose: ~45° from vertical) ────────────────────────────────
  if (worldLandmarks && worldLandmarks.length >= 17) {
    const wLShoulder = worldLandmarks[LM.L_SHOULDER];
    const wLElbow = worldLandmarks[LM.L_ELBOW];
    const wRShoulder = worldLandmarks[LM.R_SHOULDER];
    const wRElbow = worldLandmarks[LM.R_ELBOW];

    if (wLShoulder && wLElbow) {
      const dx = Math.abs(wLElbow.x - wLShoulder.x);
      const dy = Math.abs(wLElbow.y - wLShoulder.y);
      result.leftArmAngleDeg = Math.atan2(dx, dy) * (180 / Math.PI);
    }
    if (wRShoulder && wRElbow) {
      const dx = Math.abs(wRElbow.x - wRShoulder.x);
      const dy = Math.abs(wRElbow.y - wRShoulder.y);
      result.rightArmAngleDeg = Math.atan2(dx, dy) * (180 / Math.PI);
    }

    const avgAngle = (result.leftArmAngleDeg + result.rightArmAngleDeg) / 2;
    if (avgAngle < 12) result.armsStatus = "at_sides";
    else if (avgAngle < 30) result.armsStatus = "approaching_45";
    else if (avgAngle <= 65) result.armsStatus = "at_45";
    else result.armsStatus = "too_high";

    if (result.armsStatus === "at_45") result.armsMessage = "Arms at perfect 45°";
    else if (result.armsStatus === "approaching_45") result.armsMessage = "Almost — open arms a bit more";
    else if (result.armsStatus === "at_sides") result.armsMessage = "Open arms to 45°";
    else if (result.armsStatus === "too_high") result.armsMessage = "Lower arms slightly";
  } else if (lShoulder && lAnkle && rShoulder) {
    // Fallback using normalized landmarks: check wrist Y position relative to body
    const lWrist = normalLandmarks[LM.L_WRIST];
    const rWrist = normalLandmarks[LM.R_WRIST];
    const hipY = lHip ? (lHip.y + (rHip?.y ?? lHip.y)) / 2 : 0.5;
    const shoulderY = (lShoulder.y + rShoulder.y) / 2;

    if (lWrist && rWrist) {
      const avgWristY = (lWrist.y + rWrist.y) / 2;
      if (avgWristY > hipY) {
        result.armsStatus = "at_sides";
        result.armsMessage = "Open arms to 45°";
      } else if (avgWristY > shoulderY) {
        result.armsStatus = "at_45";
        result.armsMessage = "Arms at perfect 45°";
      } else {
        result.armsStatus = "too_high";
        result.armsMessage = "Lower arms slightly";
      }
    }
  }

  // ── Feet Stance ────────────────────────────────────────────────────────────
  if (lAnkle && rAnkle && lShoulder && rShoulder &&
      (lAnkle.visibility ?? 0) > 0.3 && (rAnkle.visibility ?? 0) > 0.3) {
    const feetWidth = Math.abs(lAnkle.x - rAnkle.x);
    const shoulderWidth = Math.abs(lShoulder.x - rShoulder.x);
    if (shoulderWidth > 0) {
      result.feetWidthRatio = feetWidth / shoulderWidth;
      if (result.feetWidthRatio < 0.4) result.feetStatus = "too_close";
      else if (result.feetWidthRatio <= 1.8) result.feetStatus = "shoulder_width";
      else result.feetStatus = "too_wide";
    }
  }

  // ── Overall Readiness Score (0-100) ───────────────────────────────────────
  let score = 0;
  if (result.isFullBodyVisible) score += 30;
  if (result.distanceStatus === "optimal") score += 25;
  if (result.centeringStatus === "centered") score += 20;
  if (result.armsStatus === "at_45" || result.armsStatus === "approaching_45") score += 15;
  if (result.feetStatus === "shoulder_width") score += 10;
  result.readinessScore = score;
  result.overallReady = score >= 70;

  // ── Primary Coaching Message (priority: full body → distance → centering → arms) ─
  if (!result.isFullBodyVisible) {
    if (result.missingParts.includes("head")) {
      result.primaryMessage = "Step back so your head is visible";
    } else if (result.missingParts.includes("ankles")) {
      result.primaryMessage = "Step back so your feet are visible";
    } else {
      result.primaryMessage = "Show your full body in the frame";
      result.secondaryMessage = `Not visible: ${result.missingParts.join(", ")}`;
    }
  } else if (result.distanceStatus !== "optimal") {
    result.primaryMessage = result.distanceMessage;
    result.secondaryMessage = result.centeringMessage;
  } else if (result.centeringStatus !== "centered") {
    result.primaryMessage = result.centeringMessage;
    result.secondaryMessage = result.distanceMessage;
  } else if (result.armsStatus !== "at_45") {
    result.primaryMessage = result.armsMessage;
    result.secondaryMessage = "Stand straight, arms relaxed at 45°";
  } else if (result.overallReady) {
    result.primaryMessage = "Perfect! Hold still...";
    result.secondaryMessage = "Capturing in 3 seconds";
  } else {
    result.primaryMessage = "Stand straight, arms at 45°";
    result.secondaryMessage = "Face the camera";
  }

  return result;
}
