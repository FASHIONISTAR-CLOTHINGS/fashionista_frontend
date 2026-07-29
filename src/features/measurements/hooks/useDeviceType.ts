"use client";

/**
 * @file useDeviceType.ts
 * @description Device detection hook for routing fork (mobile → camera, desktop → QR).
 *
 * SSR-safe: returns desktop defaults during SSR, updates on client mount.
 * Uses navigator.userAgent + window.innerWidth for detection.
 */

import { useState, useEffect, useMemo } from "react";

export type DeviceKind = "mobile" | "tablet" | "desktop";
export type ApiDeviceType = "web" | "ios" | "android";

export interface UseDeviceTypeReturn {
  isMobile:  boolean;
  isTablet:  boolean;
  isDesktop: boolean;
  /** Device type for backend API payloads (device_type field). */
  apiDeviceType: ApiDeviceType;
  /** Raw device kind string. */
  deviceKind: DeviceKind;
}

function detectDevice(): { kind: DeviceKind; apiType: ApiDeviceType } {
  if (typeof window === "undefined") {
    return { kind: "desktop", apiType: "web" };
  }

  const ua = navigator.userAgent || "";
  const width = window.innerWidth;

  const isMobileUA = /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
  const isTabletUA = /iPad|Tablet|PlayBook|Silk/i.test(ua) || (isMobileUA && width >= 768);
  const isIOS = /iPhone|iPad|iPod/i.test(ua);
  const isAndroid = /Android/i.test(ua);

  if (isTabletUA) return { kind: "tablet", apiType: isIOS ? "ios" : isAndroid ? "android" : "web" };
  if (isMobileUA) return { kind: "mobile", apiType: isIOS ? "ios" : isAndroid ? "android" : "web" };
  return { kind: "desktop", apiType: "web" };
}

export function useDeviceType(): UseDeviceTypeReturn {
  const [device, setDevice] = useState<{ kind: DeviceKind; apiType: ApiDeviceType }>({
    kind: "desktop",
    apiType: "web",
  });

  useEffect(() => {
    setDevice(detectDevice());
  }, []);

  return useMemo(
    () => ({
      isMobile:  device.kind === "mobile",
      isTablet:  device.kind === "tablet",
      isDesktop: device.kind === "desktop",
      apiDeviceType: device.apiType,
      deviceKind: device.kind,
    }),
    [device],
  );
}
