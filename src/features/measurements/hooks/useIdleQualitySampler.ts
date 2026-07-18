/**
 * @file useIdleQualitySampler.ts
 * @description Phase 13 / TASK-042: Throttled, idle-aware pose quality sampler.
 *
 * Problem:
 *   - processFrame() is called every animation frame (~60fps = 16ms)
 *   - MediaPipe inference takes ~25-60ms on mobile
 *   - Running both simultaneously blocks the main thread, causing UI jank
 *
 * Solution:
 *   - Use requestIdleCallback (with setTimeout fallback) to schedule inference
 *     ONLY when the main thread has spare capacity
 *   - Cap inference at MAX_FPS_INFERENCE (default 20fps) regardless of idle time
 *   - This preserves smooth 60fps UI animations while keeping quality signal fresh
 *   - Returns a ref-based trigger — no re-renders from the sampling loop itself
 *
 * Architecture:
 *   - Caller (EnhancedMeasurementFlow) calls scheduleFrame() each rAF tick
 *   - scheduleFrame() checks if enough time has passed since last inference
 *   - If yes, schedules inference via requestIdleCallback (or setTimeout(0))
 *   - Inference result written to a ref: no setState → no re-render
 *   - Caller reads latestFrameRef.current for the latest quality reading
 *
 * Browser support:
 *   - requestIdleCallback: Chrome, Edge, Firefox 55+
 *   - Fallback: setTimeout(fn, 1) for Safari and older browsers
 */

"use client";

import { useRef, useCallback, useEffect } from "react";
import type { EnhancedCaptureFrame } from "./useEnhancedMeasurementCapture";

// ─── Config ───────────────────────────────────────────────────────────────────

const MAX_FPS_INFERENCE = 20;          // Max pose inference calls/sec
const MIN_FRAME_GAP_MS  = 1000 / MAX_FPS_INFERENCE; // 50ms between inferences
const IDLE_TIMEOUT_MS   = 100;         // requestIdleCallback timeout before forced run

// ─── Types ────────────────────────────────────────────────────────────────────

type ProcessFrameFn = () => EnhancedCaptureFrame | null;

interface UseIdleQualitySamplerReturn {
  /** Call this on every requestAnimationFrame tick */
  scheduleFrame:   () => void;
  /** Latest pose quality reading (ref — no re-render cost) */
  latestFrameRef:  React.MutableRefObject<EnhancedCaptureFrame | null>;
  /** True if an inference is currently scheduled (for debugging) */
  isPendingRef:    React.MutableRefObject<boolean>;
  /** Reset the sampler (e.g. between front/side pose phases) */
  reset:           () => void;
}

// ─── Polyfill type declarations ───────────────────────────────────────────────

type RequestIdleCallbackHandle = number;
interface RequestIdleCallbackDeadline {
  didTimeout:             boolean;
  timeRemaining:          () => number;
}
type RequestIdleCallbackFn = (deadline: RequestIdleCallbackDeadline) => void;

declare global {
  interface Window {
    requestIdleCallback: (fn: RequestIdleCallbackFn, opts?: { timeout: number }) => RequestIdleCallbackHandle;
    cancelIdleCallback:  (handle: RequestIdleCallbackHandle) => void;
  }
}

// ─── Idle scheduler (with polyfill) ──────────────────────────────────────────

function scheduleIdle(fn: RequestIdleCallbackFn, timeout: number): () => void {
  if (typeof window !== "undefined" && "requestIdleCallback" in window) {
    const handle = window.requestIdleCallback(fn, { timeout });
    return () => window.cancelIdleCallback(handle);
  }
  // Safari / fallback: just use setTimeout(0)
  const id = setTimeout(() => fn({ didTimeout: true, timeRemaining: () => 0 }), 0);
  return () => clearTimeout(id);
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useIdleQualitySampler(
  processFrame: ProcessFrameFn,
): UseIdleQualitySamplerReturn {
  const latestFrameRef   = useRef<EnhancedCaptureFrame | null>(null);
  const isPendingRef     = useRef<boolean>(false);
  const lastInferenceRef = useRef<number>(0);
  const cancelIdleRef    = useRef<(() => void) | null>(null);

  const reset = useCallback(() => {
    latestFrameRef.current   = null;
    isPendingRef.current     = false;
    lastInferenceRef.current = 0;
    cancelIdleRef.current?.();
    cancelIdleRef.current = null;
  }, []);

  const scheduleFrame = useCallback(() => {
    const now = performance.now();
    const elapsed = now - lastInferenceRef.current;

    // Already have a pending inference OR not enough time has passed
    if (isPendingRef.current || elapsed < MIN_FRAME_GAP_MS) return;

    isPendingRef.current = true;

    cancelIdleRef.current = scheduleIdle((_deadline) => {
      isPendingRef.current = false;
      lastInferenceRef.current = performance.now();

      try {
        const frame = processFrame();
        if (frame) latestFrameRef.current = frame;
      } catch (err) {
        // Never let inference errors crash the UI loop
        console.warn("[IdleSampler] Inference error:", err);
      }
    }, IDLE_TIMEOUT_MS);
  }, [processFrame]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancelIdleRef.current?.();
    };
  }, []);

  return { scheduleFrame, latestFrameRef, isPendingRef, reset };
}
