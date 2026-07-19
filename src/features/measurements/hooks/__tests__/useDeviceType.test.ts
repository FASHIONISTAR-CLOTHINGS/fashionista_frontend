/**
 * @file useDeviceType.test.ts
 * @description TASK-066 (Part 1): Vitest unit tests for useDeviceType hook.
 *
 * Tests device classification from navigator.userAgent + maxTouchPoints.
 * Uses renderHook from @testing-library/react.
 *
 * Run:
 *   npx vitest run src/features/measurements/hooks/__tests__/useDeviceType.test.ts
 */

import { renderHook } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { useDeviceType } from "../useDeviceType";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function mockNavigator(overrides: Partial<typeof navigator>) {
  Object.defineProperty(global, "navigator", {
    value: { ...navigator, ...overrides },
    configurable: true,
    writable: true,
  });
}

const UA = {
  chrome:  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0 Safari/537.36",
  iphone:  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148",
  android: "Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 Mobile Safari/537.36",
  ipad:    "Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Safari/604.1",
  // iPad with desktop UA (iOS 13+ default)
  ipadDesktop: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Safari/604.1",
  androidTablet: "Mozilla/5.0 (Linux; Android 13; SM-T500) AppleWebKit/537.36 Safari/537.36",
};

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("useDeviceType", () => {

  describe("Desktop UA", () => {
    it("returns isDesktop=true for standard Chrome UA", () => {
      mockNavigator({ userAgent: UA.chrome, maxTouchPoints: 0 });
      const { result } = renderHook(() => useDeviceType());
      expect(result.current.isDesktop).toBe(true);
      expect(result.current.isMobile).toBe(false);
      expect(result.current.isTablet).toBe(false);
    });

    it("returns apiDeviceType=web for desktop", () => {
      mockNavigator({ userAgent: UA.chrome, maxTouchPoints: 0 });
      const { result } = renderHook(() => useDeviceType());
      expect(result.current.apiDeviceType).toBe("web");
    });

    it("returns canCamera=false for desktop", () => {
      mockNavigator({ userAgent: UA.chrome, maxTouchPoints: 0 });
      const { result } = renderHook(() => useDeviceType());
      expect(result.current.canCamera).toBe(false);
    });
  });

  describe("iPhone UA", () => {
    it("returns isMobile=true for iPhone UA", () => {
      mockNavigator({ userAgent: UA.iphone, maxTouchPoints: 5 });
      const { result } = renderHook(() => useDeviceType());
      expect(result.current.isMobile).toBe(true);
      expect(result.current.isIOS).toBe(true);
      expect(result.current.isDesktop).toBe(false);
    });

    it("returns apiDeviceType=ios for iPhone", () => {
      mockNavigator({ userAgent: UA.iphone, maxTouchPoints: 5 });
      const { result } = renderHook(() => useDeviceType());
      expect(result.current.apiDeviceType).toBe("ios");
    });

    it("returns canCamera=true for iPhone", () => {
      mockNavigator({ userAgent: UA.iphone, maxTouchPoints: 5 });
      const { result } = renderHook(() => useDeviceType());
      expect(result.current.canCamera).toBe(true);
    });
  });

  describe("Android phone UA", () => {
    it("returns isMobile=true for Android phone UA", () => {
      mockNavigator({ userAgent: UA.android, maxTouchPoints: 5 });
      const { result } = renderHook(() => useDeviceType());
      expect(result.current.isMobile).toBe(true);
      expect(result.current.isAndroid).toBe(true);
    });

    it("returns apiDeviceType=android for Android phone", () => {
      mockNavigator({ userAgent: UA.android, maxTouchPoints: 5 });
      const { result } = renderHook(() => useDeviceType());
      expect(result.current.apiDeviceType).toBe("android");
    });
  });

  describe("iPad UA (explicit)", () => {
    it("returns isTablet=true for explicit iPad UA", () => {
      mockNavigator({ userAgent: UA.ipad, maxTouchPoints: 5 });
      const { result } = renderHook(() => useDeviceType());
      expect(result.current.isTablet).toBe(true);
      expect(result.current.isMobile).toBe(false);
    });
  });

  describe("iPad with desktop UA (iOS 13+)", () => {
    it("detects iPad via maxTouchPoints when UA is Mac", () => {
      // iPad on iOS 13+ reports Mac UA but has maxTouchPoints > 1
      mockNavigator({ userAgent: UA.ipadDesktop, maxTouchPoints: 5 });
      const { result } = renderHook(() => useDeviceType());
      expect(result.current.isTablet).toBe(true);
      expect(result.current.isDesktop).toBe(false);
    });
  });

  describe("Android tablet UA", () => {
    it("returns isTablet=true for Android tablet (no Mobile in UA)", () => {
      mockNavigator({ userAgent: UA.androidTablet, maxTouchPoints: 5 });
      const { result } = renderHook(() => useDeviceType());
      expect(result.current.isTablet).toBe(true);
      expect(result.current.isMobile).toBe(false);
    });
  });

  describe("SSR fallback", () => {
    it("returns desktop fallback when navigator is undefined", () => {
      // Temporarily remove navigator
      const originalNavigator = global.navigator;
      // @ts-expect-error — testing SSR condition
      delete global.navigator;

      const { result } = renderHook(() => useDeviceType());
      expect(result.current.isDesktop).toBe(true);
      expect(result.current.isMobile).toBe(false);
      expect(result.current.apiDeviceType).toBe("web");

      // Restore
      Object.defineProperty(global, "navigator", {
        value: originalNavigator,
        configurable: true,
        writable: true,
      });
    });
  });

});
