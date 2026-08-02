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

export type OrientationStatus = "good" | "tilted" | "bad" | "unsupported" | "requesting";

export interface PhoneOrientationData {
  /** Current orientation status */
  status: OrientationStatus;
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
  const [status, setStatus]           = useState<OrientationStatus>("unsupported");
  const [gamma, setGamma]             = useState<number | null>(null);
  const [beta, setBeta]               = useState<number | null>(null);
  const [isSustainedGood, setIsSustainedGood] = useState(false);
  const handlerRef                    = useRef<((e: DeviceOrientationEvent) => void) | null>(null);
  const lastGoodTimestampRef          = useRef<number | null>(null);

  /** Duration of continuous 'good' state required to trigger auto-advance (ms) */
  const SUSTAINED_GOOD_MS = 1500;

  // ── Compute status from raw values ─────────────────────────────────────────
  const computeStatus = useCallback(
    (rawGamma: number | null, rawBeta: number | null): OrientationStatus => {
      if (rawGamma === null || rawBeta === null) return "unsupported";

      const absGamma = Math.abs(rawGamma);

      if (absGamma < ORIENTATION_CONFIG.greenThreshold) return "good";
      if (absGamma < ORIENTATION_CONFIG.yellowThreshold) return "tilted";
      return "bad";
    },
    []
  );

  // ── Subscribe to device orientation events ─────────────────────────────────
  const subscribe = useCallback(() => {
    if (typeof window === "undefined") return;

    const handler = (event: DeviceOrientationEvent) => {
      const rawGamma = event.gamma;
      const rawBeta  = event.beta;

      // Null values = desktop or permission denied
      if (rawGamma === null && rawBeta === null) {
        setStatus("unsupported");
        setIsSustainedGood(false);
        lastGoodTimestampRef.current = null;
        return;
      }

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
        // Reset sustained tracking when orientation drifts
        lastGoodTimestampRef.current = null;
        setIsSustainedGood(false);
      }
    };

    handlerRef.current = handler;
    window.addEventListener("deviceorientation", handler, true);
  }, [computeStatus, SUSTAINED_GOOD_MS]);

  // ── iOS 13+ permission request ─────────────────────────────────────────────
  const requestPermission = useCallback(async () => {
    if (typeof window === "undefined") return;

    const DOE = DeviceOrientationEvent as DeviceOrientationEventWithPermission;

    if (typeof DOE.requestPermission === "function") {
      setStatus("requesting");
      try {
        const result = await DOE.requestPermission();
        if (result === "granted") {
          subscribe();
        } else {
          setStatus("unsupported");
        }
      } catch {
        setStatus("unsupported");
      }
    } else {
      // Android or non-iOS — no permission needed
      subscribe();
    }
  }, [subscribe]);

  // ── Auto-subscribe on non-iOS (no permission needed) ──────────────────────
  useEffect(() => {
    if (typeof window === "undefined") return;

    const DOE = DeviceOrientationEvent as DeviceOrientationEventWithPermission;

    // Auto-subscribe on platforms that don't need permission
    if (typeof DOE.requestPermission !== "function") {
      subscribe();
    }
    // iOS: wait for explicit requestPermission() call from user gesture

    return () => {
      if (handlerRef.current) {
        window.removeEventListener("deviceorientation", handlerRef.current, true);
        handlerRef.current = null;
      }
    };
  }, [subscribe]);

  // ── Derived values ─────────────────────────────────────────────────────────
  const tiltDegrees  = gamma !== null ? Math.abs(gamma) : 0;
  const tiltDirection: "left" | "right" | null =
    gamma === null || status === "good"
      ? null
      : gamma > 0
      ? "right"   // gamma positive = leaning right
      : "left";   // gamma negative = leaning left

  return {
    status,
    gamma,
    beta,
    isLevel:          status === "good",
    isSustainedGood,
    tiltDegrees,
    tiltDirection,
    requestPermission,
    isSupported: status !== "unsupported",
  };
}
