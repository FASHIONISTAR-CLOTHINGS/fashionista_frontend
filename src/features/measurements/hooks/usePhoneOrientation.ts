"use client";

/**
 * @file usePhoneOrientation.ts
 * @description Phone orientation detection hook for vertical alignment during scan.
 *
 * Wraps DeviceOrientationEvent API. On iOS 13+ requires explicit requestPermission().
 * Returns angle (degrees from vertical), isVertical, isHorizontal, and permission state.
 *
 * Note: useDeviceOrientation already exists and handles the raw beta/gamma values.
 * This hook provides a higher-level API focused on vertical/horizontal detection
 * for the scan flow (phone should be vertical on a stand/prop).
 */

import { useState, useCallback, useEffect, useRef } from "react";

export interface UsePhoneOrientationReturn {
  /** Tilt angle in degrees from vertical (0 = perfectly upright). */
  angle: number;
  /** True when phone is upright (|angle| < 15°). */
  isVertical: boolean;
  /** True when phone is sideways (|angle| > 75°). */
  isHorizontal: boolean;
  /** Whether the DeviceOrientationEvent API is available. */
  isSupported: boolean;
  /** Whether permission has been granted (iOS 13+). */
  permissionGranted: boolean;
  /** Request permission (call on user gesture on iOS). */
  requestPermission: () => Promise<void>;
}

export function usePhoneOrientation(): UsePhoneOrientationReturn {
  const [angle, setAngle] = useState(0);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const handlerRef = useRef<((e: DeviceOrientationEvent) => void) | null>(null);

  const isSupported =
    typeof window !== "undefined" && "DeviceOrientationEvent" in window;

  const handleOrientation = useCallback((e: DeviceOrientationEvent) => {
    if (e.beta === null || e.gamma === null) return;
    // beta: front-to-back tilt (-180 to 180). ~90 when phone is upright.
    // gamma: left-to-right tilt (-90 to 90). ~0 when phone is upright.
    const betaDeviation = Math.abs((e.beta ?? 0) - 90);
    const gammaDeviation = Math.abs(e.gamma ?? 0);
    const totalAngle = Math.sqrt(betaDeviation ** 2 + gammaDeviation ** 2);
    setAngle(Math.round(totalAngle));
  }, []);

  const attachListener = useCallback(() => {
    if (handlerRef.current) return;
    handlerRef.current = handleOrientation;
    window.addEventListener("deviceorientation", handleOrientation);
    setPermissionGranted(true);
  }, [handleOrientation]);

  const requestPermission = useCallback(async () => {
    if (!isSupported) return;

    const DOE = window.DeviceOrientationEvent as unknown as {
      requestPermission?: () => Promise<"granted" | "denied">;
    };

    if (typeof DOE.requestPermission === "function") {
      try {
        const result = await DOE.requestPermission();
        if (result === "granted") {
          attachListener();
        }
      } catch {
        // Permission denied
      }
    } else {
      attachListener();
    }
  }, [isSupported, attachListener]);

  // Auto-attach on non-iOS
  useEffect(() => {
    if (!isSupported) return;
    const DOE = window.DeviceOrientationEvent as unknown as {
      requestPermission?: () => Promise<string>;
    };
    if (typeof DOE.requestPermission !== "function") {
      attachListener();
    }
    return () => {
      if (handlerRef.current) {
        window.removeEventListener("deviceorientation", handlerRef.current);
        handlerRef.current = null;
      }
    };
  }, [isSupported, attachListener]);

  return {
    angle,
    isVertical: angle < 15,
    isHorizontal: angle > 75,
    isSupported,
    permissionGranted,
    requestPermission,
  };
}
