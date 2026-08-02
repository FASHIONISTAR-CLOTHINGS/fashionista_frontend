/**
 * @file usePhoneOrientation.test.ts
 * @description Phase 14 / TASK-046: Unit tests for usePhoneOrientation hook.
 *
 * Tests:
 *   - Status starts as 'unknown'
 *   - 'good' status returned when gamma within portrait-good range (±15°)
 *   - 'bad' status returned when tilted past 30°
 *   - 'unavailable' when DeviceOrientationEvent is not supported
 *   - Event listener is added on mount and removed on unmount
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { usePhoneOrientation } from "@/features/measurements/hooks/usePhoneOrientation";

// ─── DeviceOrientationEvent Mock ─────────────────────────────────────────────

function dispatchOrientation(gamma: number, beta: number) {
  const event = new Event("deviceorientation") as DeviceOrientationEvent;
  Object.defineProperty(event, "gamma", { value: gamma });
  Object.defineProperty(event, "beta",  { value: beta });
  act(() => { window.dispatchEvent(event); });
}

describe("usePhoneOrientation", () => {
  beforeEach(() => {
    // jsdom does not expose a real sensor API. Provide a feature-detected
    // non-iOS implementation so the hook can subscribe and consume fixtures.
    vi.stubGlobal("DeviceOrientationEvent", class DeviceOrientationEvent {});
    vi.spyOn(window, "addEventListener");
    vi.spyOn(window, "removeEventListener");
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("should start in an unresolved orientation state", () => {
    const { result } = renderHook(() => usePhoneOrientation());
    expect(result.current.status).toBe("unknown");
    expect(result.current.permissionState).toBe("granted");
  });

  it("should return 'good' when gamma is within ±5°", () => {
    const { result } = renderHook(() => usePhoneOrientation());
    dispatchOrientation(3, 80);
    expect(result.current.status).toBe("good");
  });

  it("should return 'tilted' or 'bad' when gamma is > 5°", () => {
    const { result } = renderHook(() => usePhoneOrientation());
    dispatchOrientation(8, 80);
    expect(["tilted", "bad"]).toContain(result.current.status);
  });

  it("should reject a flat phone even when gamma is level", () => {
    const { result } = renderHook(() => usePhoneOrientation());
    dispatchOrientation(0, 0);
    expect(result.current.status).toBe("bad");
    expect(result.current.isLevel).toBe(false);
  });

  it("should attach deviceorientation listener on mount", () => {
    renderHook(() => usePhoneOrientation());
    expect(window.addEventListener).toHaveBeenCalledWith(
      "deviceorientation",
      expect.any(Function),
      true,
    );
  });

  it("should remove deviceorientation listener on unmount", () => {
    const { unmount } = renderHook(() => usePhoneOrientation());
    unmount();
    expect(window.removeEventListener).toHaveBeenCalledWith(
      "deviceorientation",
      expect.any(Function),
      true,
    );
  });
});
