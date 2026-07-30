/**
 * @file useDeviceType.ts
 * @description TASK-058: Robust device detection for measurement routing.
 *
 * Uses dual-signal detection (User-Agent + maxTouchPoints) to correctly
 * classify the current device as mobile, tablet, or desktop.
 *
 * Signal priority:
 *   1. navigator.maxTouchPoints > 1 → touch device (catches iPad with desktop UA)
 *   2. navigator.userAgent patterns → explicit mobile/tablet UA strings
 *
 * Why dual-signal?
 *   - iPad on iOS 13+ sends a desktop Safari UA by default.
 *   - Chrome on tablets may omit "Tablet" from UA.
 *   - maxTouchPoints correctly detects touch-capable screens.
 *
 * SSR Safety:
 *   - Returns a safe desktop fallback when `navigator` is undefined (SSR / Node).
 *   - Use only in Client Components (`"use client"`).
 *
 * Usage:
 *   const device = useDeviceType();
 *   if (device.isMobile) { ... }
 *   // Send device.apiDeviceType to initiateBodyScan({ device_type: ... })
 */
"use client";

import { useMemo } from "react";

// ─── Types ─────────────────────────────────────────────────────────────────────

export type DeviceCategory = "mobile" | "tablet" | "desktop";

export interface DeviceType {
  /** High-level category. */
  category:       DeviceCategory;
  /** True for phones (Android/iPhone/iPod). Excludes tablets. */
  isMobile:       boolean;
  /** True for tablets (iPad, Android tablets). */
  isTablet:       boolean;
  /** True for desktops and laptops. */
  isDesktop:      boolean;
  /** True for Apple iOS phones. */
  isIOS:          boolean;
  /** True for Android phones (not tablets). */
  isAndroid:      boolean;
  /**
   * True if the device is likely to have camera access suitable for scanning.
   * Mobile + tablet return true; desktop returns false.
   */
  canCamera:      boolean;
  /**
   * The device type string expected by the backend scan/initiate/ endpoint.
   * Maps to BodyScanSession.DeviceType choices: "ios" | "android" | "web"
   */
  apiDeviceType:  "ios" | "android" | "web";
}

// ─── SSR Fallback ─────────────────────────────────────────────────────────────

const DESKTOP_FALLBACK: DeviceType = {
  category:      "desktop",
  isMobile:      false,
  isTablet:      false,
  isDesktop:     true,
  isIOS:         false,
  isAndroid:     false,
  canCamera:     false,
  apiDeviceType: "web",
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Detects the current device type using UA + maxTouchPoints.
 * Returns a stable, memoized result (never changes within a page load).
 */
export function useDeviceType(): DeviceType {
  return useMemo((): DeviceType => {
    // SSR guard: navigator does not exist in Node.js
    if (typeof navigator === "undefined") {
      return DESKTOP_FALLBACK;
    }

    const ua          = navigator.userAgent;
    const touchPoints = navigator.maxTouchPoints ?? 0;

    // ── UA pattern matching ──────────────────────────────────────────────────
    const isIOS     = /iPhone|iPod/i.test(ua);
    // iPad: explicit "iPad" OR Mac UA with multitouch (iOS 13+ tablet UA spoof)
    const isIPad    = /iPad/i.test(ua) || (/Macintosh/i.test(ua) && touchPoints > 1);
    const isAndroid = /Android/i.test(ua);
    // "Mobile" in UA = phone; Android tablet usually lacks it
    const isAndroidPhone = isAndroid && /Mobile/i.test(ua);
    const isAndroidTablet= isAndroid && !/Mobile/i.test(ua);

    // ── Category resolution ───────────────────────────────────────────────────
    const isMobile  = isIOS || isAndroidPhone;
    const isTablet  = isIPad || isAndroidTablet;
    const isDesktop = !isMobile && !isTablet;

    // ── API device type (for backend BodyScanSession.DeviceType) ─────────────
    const apiDeviceType: "ios" | "android" | "web" =
      isIOS     ? "ios"
      : isAndroid ? "android"
      : "web";

    return {
      category:      isDesktop ? "desktop" : isTablet ? "tablet" : "mobile",
      isMobile,
      isTablet,
      isDesktop,
      isIOS,
      isAndroid:     isAndroidPhone,
      canCamera:     isMobile || isTablet,
      apiDeviceType,
    };
  }, []); // Stable: UA + touchPoints never change within a page load
}
