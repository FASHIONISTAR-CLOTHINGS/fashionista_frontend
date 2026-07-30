"use client";

import { useState, useCallback, useEffect, useRef } from "react";

export type TiltStatus = "level" | "tilted" | "unavailable";

export interface UseDeviceOrientationReturn {
  tiltStatus:     TiltStatus;
  beta:           number | null;  // front-to-back tilt in degrees (-180 to 180)
  gamma:          number | null;  // left-to-right tilt in degrees (-90 to 90)
  isSupported:    boolean;
  hasPermission:  boolean;
  requestPermission: () => Promise<void>;
  /** Tilt angle in degrees from vertical (0 = perfectly upright). */
  angle:          number;
  /** True when phone is upright (|angle| < 15°). */
  isVertical:     boolean;
  /** True when phone is sideways (|angle| > 75°). */
  isHorizontal:   boolean;
}

export function useDeviceOrientation(): UseDeviceOrientationReturn {
  const [beta, setBeta]           = useState<number | null>(null);
  const [gamma, setGamma]         = useState<number | null>(null);
  const [hasPermission, setPerm]  = useState(false);
  const handlerRef                = useRef<((e: DeviceOrientationEvent) => void) | null>(null);

  const isSupported = typeof window !== "undefined" && "DeviceOrientationEvent" in window;

  // Compute tilt status from gamma (left-right tilt is most relevant for phone propped upright)
  const computeTiltStatus = (g: number | null, b: number | null): TiltStatus => {
    if (g === null && b === null) return "unavailable";
    // Use the larger of |gamma| and |beta| deviation from vertical
    const gammaDeviation = Math.abs(g ?? 0);
    const betaDeviation  = Math.abs((b ?? 0) - 90); // ideal beta ~90 when phone is upright
    const maxDeviation   = Math.max(gammaDeviation, betaDeviation);

    if (maxDeviation <= 8)  return "level";
    if (maxDeviation <= 20) return "tilted";
    return "tilted";
  };

  const tiltStatus = computeTiltStatus(gamma, beta);

  // Compute angle from vertical (0 = perfectly upright)
  // beta ~90 when phone is upright, gamma ~0 when phone is upright
  const betaDeviation = beta !== null ? Math.abs(beta - 90) : 0;
  const gammaDeviation = gamma !== null ? Math.abs(gamma) : 0;
  const angle = Math.round(Math.sqrt(betaDeviation ** 2 + gammaDeviation ** 2));

  const handleOrientation = useCallback((e: DeviceOrientationEvent) => {
    if (e.beta !== null && e.beta !== undefined) setBeta(e.beta);
    if (e.gamma !== null && e.gamma !== undefined) setGamma(e.gamma);
  }, []);

  const attachListener = useCallback(() => {
    if (handlerRef.current) return; // already attached
    handlerRef.current = handleOrientation;
    window.addEventListener("deviceorientation", handleOrientation);
    setPerm(true);
  }, [handleOrientation]);

  const requestPermission = useCallback(async () => {
    if (!isSupported) return;

    // iOS 13+ requires explicit permission request via user gesture
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
        // Permission denied or error — gracefully skip
      }
    } else {
      // Non-iOS: just attach the listener directly
      attachListener();
    }
  }, [isSupported, attachListener]);

  // Auto-attach on non-iOS browsers (no permission needed)
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
    tiltStatus,
    beta,
    gamma,
    isSupported,
    hasPermission,
    requestPermission,
    angle,
    isVertical: angle < 15,
    isHorizontal: angle > 75,
  };
}
