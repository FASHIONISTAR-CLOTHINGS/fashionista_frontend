/**
 * @file useHapticFeedback.ts
 * @description Step 36 / TASK-026: Navigator.vibrate wrapper for mobile haptics.
 *
 * Provides a safe, SSR-compatible haptic feedback API over navigator.vibrate.
 * Falls back silently on desktop browsers or where the API is unavailable.
 *
 * Patterns:
 *   - alignAchieved:   Single 100ms pulse  — pose locked in
 *   - autoCapture:     tap-tap-long pattern — scan captured
 *   - countdownTick:   20ms   — soft tick each countdown number
 *   - phaseFail:       long-short — error / retry needed
 *   - success:         long pulse — scan complete
 */

"use client";

import { useCallback } from "react";

type HapticPattern =
  | "alignAchieved"
  | "autoCapture"
  | "countdownTick"
  | "phaseFail"
  | "success";

const PATTERNS: Record<HapticPattern, number | number[]> = {
  alignAchieved:  100,
  autoCapture:    [100, 50, 100, 50, 200],
  countdownTick:  20,
  phaseFail:      [300, 100, 100],
  success:        [200, 50, 200],
};

function safeVibrate(pattern: number | number[]): void {
  if (typeof navigator === "undefined") return;
  if (!("vibrate" in navigator))        return;
  try {
    navigator.vibrate(pattern);
  } catch {
    // Some browsers throw if vibration is not allowed
  }
}

export function useHapticFeedback() {
  const trigger = useCallback((pattern: HapticPattern) => {
    safeVibrate(PATTERNS[pattern]);
  }, []);

  const cancel = useCallback(() => {
    safeVibrate(0);
  }, []);

  return { trigger, cancel };
}
