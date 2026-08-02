"use client";
/**
 * @file usePhoneOrientation.ts
 * @description TASK-006: Phone orientation detection using DeviceOrientationEvent.
 *
 * 90-Degree Detection System:
 * - Monitors device tilt (gamma = left/right rotation, beta = front/back tilt)
 * - For measurement scanning: phone should be held VERTICALLY at ~90° beta
 * - Provides GREEN/YELLOW/RED status for real-time user guidance
 *
 * Status Thresholds (gamma from vertical):
 *   |gamma| < 5°     → 'good'     — Phone level ✅ (GREEN)
 *   5° ≤ |gamma| < 12°  → 'tilted' — Adjust slightly 🟡 (GOLDEN YELLOW)
 *   |gamma| ≥ 12°   → 'bad'     — Phone tilted 🔴 (RED)
 *
 * iOS 13+ Permission:
 * - Safari requires explicit DeviceOrientationEvent.requestPermission()
 * - Call requestPermission() from a user gesture (button tap)
 *
 * Desktop Fallback:
 * - DeviceOrientationEvent fires but alpha/beta/gamma are all null
 * - Returns status = 'unsupported' — component shows static instruction
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { ORIENTATION_CONFIG } from "@/lib/brand";

// ─── Types ────────────────────────────────────────────────────────────────────

export type OrientationPermissionState =
  | "unknown"
  | "prompt"
  | "requesting"
  | "granted"
  | "denied"
  | "unsupported";

export type OrientationStatus =
  | "unknown"
  | "good"
  | "tilted"
  | "bad"
  | "unsupported"
  | "requesting";

export interface PhoneOrientationData {
  /** Current orientation status */
  status: OrientationStatus;
  /** Browser/device permission and feature-detection state. */
  permissionState: OrientationPermissionState;
  /** Raw gamma value (left-right tilt, degrees). Null if unavailable. */
  gamma: number | null;
  /** Raw beta value (front-back tilt, degrees). Null if unavailable. */
  beta: number | null;
  /** True when status === 'good' */
  isLevel: boolean;
  /** True when status has been 'good' continuously for ≥ 1500ms — triggers auto-advance */
  isSustainedGood: boolean;
  /** Degrees off-vertical (absolute gamma value) */
  tiltDegrees: number;
  /** Direction of tilt for user correction: 'left' | 'right' | null */
  tiltDirection: "left" | "right" | null;
  /** Request iOS 13+ permission — call from a button tap event handler */
  requestPermission: () => Promise<void>;
  /** Whether the device supports orientation events */
  isSupported: boolean;
}

// ─── iOS permission check ─────────────────────────────────────────────────────

type DeviceOrientationEventWithPermission = typeof DeviceOrientationEvent & {
  requestPermission?: () => Promise<"granted" | "denied">;
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function usePhoneOrientation(): PhoneOrientationData {
  const supportsOrientationApi = typeof window !== "undefined" &&
    typeof window.DeviceOrientationEvent !== "undefined";
  const requiresOrientationPermission = supportsOrientationApi &&
    typeof (window.DeviceOrientationEvent as DeviceOrientationEventWithPermission).requestPermission === "function";
  const [status, setStatus] = useState<OrientationStatus>(
    supportsOrientationApi ? "unknown" : "unsupported",
  );
  const [permissionState, setPermissionState] = useState<OrientationPermissionState>(
    !supportsOrientationApi
      ? "unsupported"
      : requiresOrientationPermission
      ? "prompt"
      : "granted",
  );
  const [gamma, setGamma] = useState<number | null>(null);
  const [beta, setBeta] = useState<number | null>(null);
  const [isSustainedGood, setIsSustainedGood] = useState(false);
  const handlerRef = useRef<((e: DeviceOrientationEvent) => void) | null>(null);
  const lastGoodTimestampRef = useRef<number | null>(null);
  const receivedEventRef = useRef(false);
  const supportProbeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /** Duration of continuous 'good' state required to trigger auto-advance (ms) */
  const SUSTAINED_GOOD_MS = 1500;
  const SUPPORT_PROBE_MS = 2000;

  // ── Compute status from raw values ─────────────────────────────────────────
  const computeStatus = useCallback(
    (rawGamma: number | null, rawBeta: number | null): OrientationStatus => {
      if (rawGamma === null || rawBeta === null) return "unsupported";

      const rollError = Math.abs(rawGamma);
      // A phone held upright may report either +90° or -90° depending on
      // browser/device coordinate conventions, so accept the nearest target.
      const uprightError = Math.min(
        Math.abs(rawBeta - ORIENTATION_CONFIG.betaTarget),
        Math.abs(rawBeta + ORIENTATION_CONFIG.betaTarget),
      );
      const uprightTolerance = ORIENTATION_CONFIG.betaTolerance;

      if (
        rollError <= ORIENTATION_CONFIG.greenThreshold &&
        uprightError <= uprightTolerance
      ) {
        return "good";
      }
      if (
        rollError <= ORIENTATION_CONFIG.yellowThreshold &&
        uprightError <= uprightTolerance + 15
      ) {
        return "tilted";
      }
      return "bad";
    },
    []
  );

  // ── Subscribe to device orientation events ─────────────────────────────────
  const subscribe = useCallback(() => {
    if (typeof window === "undefined") return;

    if (handlerRef.current) {
      window.removeEventListener("deviceorientation", handlerRef.current, true);
    }

    const handler = (event: DeviceOrientationEvent) => {
      receivedEventRef.current = true;
      const rawGamma = event.gamma;
      const rawBeta = event.beta;

      // Null values after subscription mean this browser/device cannot expose
      // usable orientation data. This is different from the pre-permission state.
      if (rawGamma === null || rawBeta === null) {
        setPermissionState((current) => current === "granted" ? "unsupported" : current);
        setStatus("unsupported");
        setIsSustainedGood(false);
        lastGoodTimestampRef.current = null;
        return;
      }

      setPermissionState("granted");
      setGamma(rawGamma);
      setBeta(rawBeta);

      const newStatus = computeStatus(rawGamma, rawBeta);
      setStatus(newStatus);

      // ── Sustained green tracking ──────────────────────────────────────────
      if (newStatus === "good") {
        if (lastGoodTimestampRef.current === null) {
          lastGoodTimestampRef.current = Date.now();
        }
        const elapsed = Date.now() - lastGoodTimestampRef.current;
        if (elapsed >= SUSTAINED_GOOD_MS) {
          setIsSustainedGood(true);
        }
      } else {
        lastGoodTimestampRef.current = null;
        setIsSustainedGood(false);
      }
    };

    handlerRef.current = handler;
    window.addEventListener("deviceorientation", handler, true);
  }, [computeStatus, SUSTAINED_GOOD_MS]);

  // ── iOS 13+ permission request ─────────────────────────────────────────────
  const requestPermission = useCallback(async () => {
    if (typeof window === "undefined" || typeof window.DeviceOrientationEvent === "undefined") {
      setPermissionState("unsupported");
      setStatus("unsupported");
      return;
    }

    const DOE = window.DeviceOrientationEvent as DeviceOrientationEventWithPermission;

    if (typeof DOE.requestPermission === "function") {
      setPermissionState("requesting");
      setStatus("requesting");
      receivedEventRef.current = false;
      try {
        const result = await DOE.requestPermission();
        if (result === "granted") {
          setPermissionState("granted");
          subscribe();
          if (supportProbeTimerRef.current) clearTimeout(supportProbeTimerRef.current);
          supportProbeTimerRef.current = setTimeout(() => {
            if (!receivedEventRef.current) {
              setPermissionState("unsupported");
              setStatus("unsupported");
            }
          }, SUPPORT_PROBE_MS);
        } else {
          setPermissionState("denied");
          setStatus("unsupported");
        }
      } catch {
        setPermissionState("denied");
        setStatus("unsupported");
      }
    } else {
      // Android or non-iOS — subscription does not require an explicit prompt.
      setPermissionState("granted");
      subscribe();
    }
  }, [SUPPORT_PROBE_MS, subscribe]);

  // ── Auto-subscribe on platforms without an explicit permission method ──────
  useEffect(() => {
    if (!supportsOrientationApi) return;

    const DOE = window.DeviceOrientationEvent as DeviceOrientationEventWithPermission;
    if (typeof DOE.requestPermission !== "function") {
      subscribe();
      supportProbeTimerRef.current = setTimeout(() => {
        if (!receivedEventRef.current) {
          setPermissionState("unsupported");
          setStatus("unsupported");
        }
      }, SUPPORT_PROBE_MS);
    }

    return () => {
      if (supportProbeTimerRef.current) {
        clearTimeout(supportProbeTimerRef.current);
        supportProbeTimerRef.current = null;
      }
      if (handlerRef.current) {
        window.removeEventListener("deviceorientation", handlerRef.current, true);
        handlerRef.current = null;
      }
    };
  }, [SUPPORT_PROBE_MS, subscribe, supportsOrientationApi]);

  // ── Derived values ─────────────────────────────────────────────────────────
  const betaError = beta === null
    ? 0
    : Math.min(
        Math.abs(beta - ORIENTATION_CONFIG.betaTarget),
        Math.abs(beta + ORIENTATION_CONFIG.betaTarget),
      );
  const tiltDegrees = gamma === null ? betaError : Math.max(Math.abs(gamma), betaError);
  const tiltDirection: "left" | "right" | null =
    gamma === null || status === "good"
      ? null
      : gamma > 0
      ? "right"   // gamma positive = leaning right
      : "left";   // gamma negative = leaning left

  return {
    status,
    permissionState,
    gamma,
    beta,
    isLevel:          status === "good",
    isSustainedGood,
    tiltDegrees,
    tiltDirection,
    requestPermission,
    isSupported: permissionState !== "unsupported" && permissionState !== "denied",
  };
}
