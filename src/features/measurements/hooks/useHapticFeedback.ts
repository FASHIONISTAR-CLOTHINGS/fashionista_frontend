"use client";

/**
 * @file useHapticFeedback.ts
 * @description Haptic feedback hook wrapping navigator.vibrate.
 *
 * Patterns:
 *   light   = 10ms
 *   medium  = 20ms
 *   heavy   = 50ms
 *   success = [10, 50, 10]
 *   error   = [50, 50, 50]
 *
 * No-op on desktop browsers without vibration API.
 */

import { useCallback, useState } from "react";

export type HapticPattern = "light" | "medium" | "heavy" | "success" | "error";

const PATTERNS: Record<HapticPattern, number | number[]> = {
  light: 10,
  medium: 20,
  heavy: 50,
  success: [10, 50, 10],
  error: [50, 50, 50],
};

export interface UseHapticFeedbackReturn {
  trigger: (pattern: HapticPattern | number | number[]) => void;
  isEnabled: boolean;
  setEnabled: (enabled: boolean) => void;
  isSupported: boolean;
}

export function useHapticFeedback(): UseHapticFeedbackReturn {
  const [isEnabled, setIsEnabled] = useState(true);

  const isSupported =
    typeof navigator !== "undefined" && typeof navigator.vibrate === "function";

  const trigger = useCallback(
    (pattern: HapticPattern | number | number[]) => {
      if (!isEnabled || !isSupported) return;
      const resolved =
        typeof pattern === "string" ? PATTERNS[pattern] : pattern;
      navigator.vibrate(resolved);
    },
    [isEnabled, isSupported],
  );

  const setEnabled = useCallback((enabled: boolean) => {
    setIsEnabled(enabled);
  }, []);

  return {
    trigger,
    isEnabled,
    setEnabled,
    isSupported,
  };
}
