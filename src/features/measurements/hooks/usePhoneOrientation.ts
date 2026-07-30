"use client";

/**
 * @file usePhoneOrientation.ts
 * @description Thin compatibility wrapper around useDeviceOrientation.
 *
 * Provides the higher-level API: angle, isVertical, isHorizontal, permissionGranted.
 * All DeviceOrientationEvent logic lives in useDeviceOrientation (canonical implementation).
 *
 * Consumers can use either hook — they share the same underlying state.
 */

import { useDeviceOrientation } from "./useDeviceOrientation";

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
  const orientation = useDeviceOrientation();

  return {
    angle: orientation.angle,
    isVertical: orientation.isVertical,
    isHorizontal: orientation.isHorizontal,
    isSupported: orientation.isSupported,
    permissionGranted: orientation.hasPermission,
    requestPermission: orientation.requestPermission,
  };
}
