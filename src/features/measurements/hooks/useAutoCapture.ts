"use client";
/**
 * @file useAutoCapture.ts
 * @description TASK-008: Auto-capture state machine for AI body measurement.
 *
 * State Machine:
 *   WATCHING → (quality >= threshold AND stable for N frames) → ARMING
 *   ARMING   → (all conditions met) → COUNTDOWN(3)
 *   COUNTDOWN(3) → COUNTDOWN(2) → COUNTDOWN(1) → CAPTURING
 *   CAPTURING → onCapture() → DONE
 *   Any state → (quality drops) → WATCHING (reset)
 *
 * Design Decisions:
 * - Uses refs for countdown interval to avoid stale closure issues
 * - stabilityFrames counted in processFrame call (per-frame, not per-ms)
 * - Countdown uses setInterval + performance.now() for accuracy
 * - qualityDropReset: countdown cancels if quality drops during countdown
 *
 * Usage:
 *   const autoCapture = useAutoCapture({ onCapture: () => submitScan() });
 *   // In frame loop:
 *   autoCapture.tick(frameQuality, frameStabilityScore);
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { CAPTURE_CONFIG, POSE_THRESHOLDS } from "@/lib/brand";

// ─── Types ────────────────────────────────────────────────────────────────────

export type AutoCaptureState =
  | "watching"    // Waiting for stable good pose
  | "arming"      // Quality good, counting stability frames
  | "countdown"   // All conditions met — countdown started
  | "capturing"   // Snap! Flash overlay shown
  | "done";       // Capture complete — waiting for manual reset

export interface UseAutoCaptureConfig {
  /** Called when countdown reaches zero and capture triggers */
  onCapture: () => void;
  /** Minimum pose quality to arm auto-capture */
  qualityThreshold?: number;
  /** Number of consecutive good frames required before countdown starts */
  stabilityFramesRequired?: number;
  /** Countdown duration in seconds (3-2-1) */
  countdownSeconds?: number;
  /** Set false to disable auto-capture (manual-only mode) */
  enabled?: boolean;
}

export interface UseAutoCaptureReturn {
  /** Current state of the capture state machine */
  captureState: AutoCaptureState;
  /** Current countdown number (3, 2, 1) or null */
  countdown: number | null;
  /** Number of stable frames accumulated */
  stabilityFrames: number;
  /** True when in 'arming' state */
  isArming: boolean;
  /** True when in 'countdown' or 'capturing' state */
  isCountingDown: boolean;
  /** True during capture flash */
  isCapturing: boolean;
  /**
   * Call this every frame from processFrame loop.
   * @param quality       Pose quality score 0-1
   * @param isStable      True if current pose is stable (compare to prev frame)
   * @param overallReady  Optional pose-intelligence gate (arms/distance/centering).
   *                      When false, arming is blocked even if quality is high.
   *                      Defaults to true for backward compatibility.
   */
  tick: (quality: number, isStable?: boolean, overallReady?: boolean) => void;
  /** Manually reset to 'watching' state */
  reset: () => void;
  /** Trigger capture immediately regardless of quality */
  forceCapture: () => void;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAutoCapture({
  onCapture,
  qualityThreshold      = POSE_THRESHOLDS.frontGood,
  stabilityFramesRequired = CAPTURE_CONFIG.landmarkBufferSize,
  countdownSeconds      = CAPTURE_CONFIG.countdownSeconds,
  enabled               = true,
}: UseAutoCaptureConfig): UseAutoCaptureReturn {

  const [captureState, setCaptureState] = useState<AutoCaptureState>("watching");
  const [countdown, setCountdown]       = useState<number | null>(null);
  const [stabilityFrames, setStabilityFrames] = useState(0);

  // Refs for stable access inside intervals/callbacks
  const captureStateRef       = useRef<AutoCaptureState>("watching");
  const stabilityFramesRef    = useRef(0);
  const countdownIntervalRef  = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownValueRef     = useRef<number>(countdownSeconds);
  const onCaptureRef          = useRef(onCapture);
  const enabledRef            = useRef(enabled);

  // Keep refs in sync
  useEffect(() => { onCaptureRef.current = onCapture; }, [onCapture]);
  useEffect(() => { enabledRef.current = enabled; },     [enabled]);

  // ── Internal state transition ──────────────────────────────────────────────
  const setState = useCallback((next: AutoCaptureState) => {
    captureStateRef.current = next;
    setCaptureState(next);
  }, []);

  // ── Stop countdown interval ────────────────────────────────────────────────
  const stopCountdown = useCallback(() => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
  }, []);

  // ── Start countdown from N → 0 → trigger ──────────────────────────────────
  const startCountdown = useCallback(() => {
    stopCountdown();
    countdownValueRef.current = countdownSeconds;
    setCountdown(countdownSeconds);
    setState("countdown");

    // Haptic feedback on countdown start
    if (typeof navigator !== "undefined") {
      navigator.vibrate?.([50]);
    }

    countdownIntervalRef.current = setInterval(() => {
      countdownValueRef.current -= 1;

      if (countdownValueRef.current <= 0) {
        stopCountdown();
        setCountdown(null);
        setState("capturing");

        // Capture haptic pattern
        navigator.vibrate?.([100, 50, 100]);

        // Call the capture callback
        onCaptureRef.current();

        // Brief "done" state before component resets
        setTimeout(() => setState("done"), CAPTURE_CONFIG.flashDuration);
      } else {
        setCountdown(countdownValueRef.current);

        // Per-tick haptic
        navigator.vibrate?.([30]);
      }
    }, 1000);
  }, [countdownSeconds, setState, stopCountdown]);

  // ── Reset ──────────────────────────────────────────────────────────────────
  const reset = useCallback(() => {
    stopCountdown();
    stabilityFramesRef.current = 0;
    setStabilityFrames(0);
    setCountdown(null);
    setState("watching");
  }, [setState, stopCountdown]);

  // ── Force capture ──────────────────────────────────────────────────────────
  const forceCapture = useCallback(() => {
    if (
      captureStateRef.current === "capturing" ||
      captureStateRef.current === "done"
    ) return;

    stopCountdown();
    setCountdown(null);
    setState("capturing");

    navigator.vibrate?.([100, 50, 100]);
    onCaptureRef.current();
    setTimeout(() => setState("done"), CAPTURE_CONFIG.flashDuration);
  }, [setState, stopCountdown]);

  // ── Tick — called each frame ───────────────────────────────────────────────
  const tick = useCallback(
    /**
     * A-2 FIX: isStable gates stability frame accumulation.
     * WRONG-3 FIX: overallReady gates arming on full pose intelligence
     * (arms at 45°, full body, centered, optimal distance).
     * Quality + stability + overallReady are ALL required to arm countdown.
     */
    (quality: number, isStable: boolean = false, overallReady: boolean = true) => {
      if (!enabledRef.current) return;

      const state = captureStateRef.current;

      // If already capturing or done — ignore frames
      if (state === "capturing" || state === "done") return;

      const qualityOk = quality >= qualityThreshold && overallReady;

      // During countdown — check if quality OR stability OR readiness dropped
      if (state === "countdown") {
        if (!qualityOk || !isStable) {
          stopCountdown();
          stabilityFramesRef.current = 0;
          setStabilityFrames(0);
          setCountdown(null);
          setState("watching");
        }
        return;
      }

      if (!qualityOk) {
        // Reset stability if quality / overallReady drops
        if (stabilityFramesRef.current > 0) {
          stabilityFramesRef.current = 0;
          setStabilityFrames(0);
        }
        if (state !== "watching") setState("watching");
        return;
      }

      // Quality is good but user is physically moving — hold state, don't count frames
      if (!isStable) {
        // Don't reset stability counter (avoids punishing momentary micro-movements)
        // but don't increment either. Keep "arming" visual but pause stability bar.
        if (state === "watching") setState("arming");
        return;
      }

      // Quality good AND stable AND overallReady — increment stability counter
      stabilityFramesRef.current += 1;
      setStabilityFrames(stabilityFramesRef.current);

      if (state === "watching") {
        setState("arming");
      }

      // Enough stability — start countdown
      if (
        state === "arming" &&
        stabilityFramesRef.current >= stabilityFramesRequired
      ) {
        startCountdown();
      }
    },
    [qualityThreshold, stabilityFramesRequired, setState, startCountdown, stopCountdown]
  );

  // ── Cleanup on unmount ─────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      stopCountdown();
    };
  }, [stopCountdown]);

  return {
    captureState,
    countdown,
    stabilityFrames,
    isArming:       captureState === "arming",
    isCountingDown: captureState === "countdown",
    isCapturing:    captureState === "capturing",
    tick,
    reset,
    forceCapture,
  };
}
