"use client";

/**
 * @file useAutoCapture.ts
 * @description Auto-capture state machine — triggers capture when pose quality is stable.
 *
 * Tracks a rolling buffer of quality scores. When stability ≥ threshold for N consecutive
 * frames, starts a 3-2-1 countdown then calls onCapture.
 */

import { useRef, useState, useCallback } from "react";

export interface UseAutoCaptureOptions {
  /** Quality threshold (0-1) above which frames are considered "stable". */
  threshold: number;
  /** Number of consecutive stable frames before countdown starts. */
  minStableFrames?: number;
  /** Called when countdown finishes — should trigger the actual capture. */
  onCapture: () => void;
  /** Master enable/disable. */
  enabled: boolean;
}

export interface UseAutoCaptureReturn {
  /** 0-1 — fraction of buffer that is above threshold. */
  bufferProgress: number;
  /** True when countdown is active. */
  isCountingDown: boolean;
  /** 3, 2, 1, or null. */
  countdownSeconds: number | null;
  /** Cancel an in-progress countdown. */
  cancelCapture: () => void;
  /** Push a new quality sample into the buffer. */
  pushFrame: (quality: number) => void;
  /** Reset the buffer and any countdown. */
  reset: () => void;
}

const BUFFER_SIZE = 30;

export function useAutoCapture({
  threshold,
  minStableFrames = 20,
  onCapture,
  enabled,
}: UseAutoCaptureOptions): UseAutoCaptureReturn {
  const bufferRef = useRef<number[]>([]);
  const stableCountRef = useRef(0);
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownStepRef = useRef(0);

  const [bufferProgress, setBufferProgress] = useState(0);
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [countdownSeconds, setCountdownSeconds] = useState<number | null>(null);

  const clearCountdown = useCallback(() => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    setIsCountingDown(false);
    setCountdownSeconds(null);
    countdownStepRef.current = 0;
  }, []);

  const startCountdown = useCallback(() => {
    setIsCountingDown(true);
    countdownStepRef.current = 3;
    setCountdownSeconds(3);

    countdownIntervalRef.current = setInterval(() => {
      countdownStepRef.current -= 1;
      if (countdownStepRef.current <= 0) {
        clearCountdown();
        onCapture();
      } else {
        setCountdownSeconds(countdownStepRef.current);
      }
    }, 1000);
  }, [clearCountdown, onCapture]);

  const pushFrame = useCallback(
    (quality: number) => {
      if (!enabled || isCountingDown) return;

      const buffer = bufferRef.current;
      buffer.push(quality);
      if (buffer.length > BUFFER_SIZE) buffer.shift();

      const aboveThreshold = buffer.filter((q) => q >= threshold).length;
      const progress = buffer.length / BUFFER_SIZE;
      setBufferProgress(progress);

      if (quality >= threshold) {
        stableCountRef.current += 1;
      } else {
        stableCountRef.current = 0;
      }

      if (stableCountRef.current >= minStableFrames && buffer.length >= BUFFER_SIZE) {
        const stableFraction = aboveThreshold / buffer.length;
        if (stableFraction >= 0.8) {
          startCountdown();
        }
      }
    },
    [enabled, isCountingDown, threshold, minStableFrames, startCountdown],
  );

  const cancelCapture = useCallback(() => {
    clearCountdown();
    stableCountRef.current = 0;
  }, [clearCountdown]);

  const reset = useCallback(() => {
    bufferRef.current = [];
    stableCountRef.current = 0;
    clearCountdown();
    setBufferProgress(0);
  }, [clearCountdown]);

  return {
    bufferProgress,
    isCountingDown,
    countdownSeconds,
    cancelCapture,
    pushFrame,
    reset,
  };
}
