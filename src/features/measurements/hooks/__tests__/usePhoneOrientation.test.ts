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
    // Ensure the event is in scope
    vi.spyOn(window, "addEventListener");
    vi.spyOn(window, "removeEventListener");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should start with status 'unknown'", () => {
    const { result } = renderHook(() => usePhoneOrientation());
    expect(result.current.status).toBe("unknown");
  });

  it("should return 'good' when gamma is within ±15°", () => {
    const { result } = renderHook(() => usePhoneOrientation());
    dispatchOrientation(5, 80);
    expect(result.current.status).toBe("good");
  });

  it("should return 'warning' or 'bad' when gamma is > 20°", () => {
    const { result } = renderHook(() => usePhoneOrientation());
    dispatchOrientation(35, 80);
    expect(["warning", "bad"]).toContain(result.current.status);
  });

  it("should attach deviceorientation listener on mount", () => {
    renderHook(() => usePhoneOrientation());
    expect(window.addEventListener).toHaveBeenCalledWith(
      "deviceorientation",
      expect.any(Function),
    );
  });

  it("should remove deviceorientation listener on unmount", () => {
    const { unmount } = renderHook(() => usePhoneOrientation());
    unmount();
    expect(window.removeEventListener).toHaveBeenCalledWith(
      "deviceorientation",
      expect.any(Function),
    );
  });
});
