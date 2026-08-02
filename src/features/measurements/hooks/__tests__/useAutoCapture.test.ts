/**
 * @file useAutoCapture.test.ts
 * @description Phase 14 / TASK-046: Unit tests for useAutoCapture hook.
 *
 * Tests:
 *   - onCapture fires after stabilityFramesRequired good frames (via tick)
 *   - onCapture does NOT fire below qualityThreshold
 *   - enabled=false prevents any capture
 *   - Buffer resets when quality drops below threshold mid-sequence
 *   - onCapture fires exactly once per enabled cycle
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useAutoCapture } from "@/features/measurements/hooks/useAutoCapture";

describe("useAutoCapture", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should fire onCapture after enough good-quality frames", () => {
    const onCapture = vi.fn();
    const { result } = renderHook(() =>
      useAutoCapture({
        onCapture,
        qualityThreshold:        0.80,
        stabilityFramesRequired: 5,
        enabled:                 true,
      }),
    );

    // Feed 5 high-quality frames using tick()
    act(() => {
      for (let i = 0; i < 5; i++) {
        result.current.tick({ quality: 0.90, isStable: true, overallReady: true, orientationReady: true });
      }
    });

    // Allow any internal setTimeout (countdown) to run
    act(() => { vi.advanceTimersByTime(5000); });

    expect(onCapture).toHaveBeenCalledTimes(1);
  });

  it("should NOT fire if quality is below threshold", () => {
    const onCapture = vi.fn();
    const { result } = renderHook(() =>
      useAutoCapture({
        onCapture,
        qualityThreshold:        0.80,
        stabilityFramesRequired: 5,
        enabled:                 true,
      }),
    );

    act(() => {
      for (let i = 0; i < 10; i++) {
        result.current.tick({ quality: 0.60, isStable: true, overallReady: true, orientationReady: true }); // below threshold
      }
    });

    act(() => { vi.advanceTimersByTime(5000); });

    expect(onCapture).not.toHaveBeenCalled();
  });

  it("should NOT fire when enabled is false", () => {
    const onCapture = vi.fn();
    const { result } = renderHook(() =>
      useAutoCapture({
        onCapture,
        qualityThreshold:        0.80,
        stabilityFramesRequired: 3,
        enabled:                 false,
      }),
    );

    act(() => {
      for (let i = 0; i < 5; i++) {
        result.current.tick({ quality: 0.95, isStable: true, overallReady: true, orientationReady: true });
      }
    });

    act(() => { vi.advanceTimersByTime(5000); });

    expect(onCapture).not.toHaveBeenCalled();
  });

  it("should reset buffer when quality drops below threshold mid-sequence", () => {
    const onCapture = vi.fn();
    const { result } = renderHook(() =>
      useAutoCapture({
        onCapture,
        qualityThreshold:        0.80,
        stabilityFramesRequired: 5,
        enabled:                 true,
      }),
    );

    act(() => {
      // 3 good frames
      result.current.tick({ quality: 0.90, isStable: true, overallReady: true, orientationReady: true });
      result.current.tick({ quality: 0.90, isStable: true, overallReady: true, orientationReady: true });
      result.current.tick({ quality: 0.90, isStable: true, overallReady: true, orientationReady: true });
      // Quality drops — should reset
      result.current.tick({ quality: 0.50, isStable: false, overallReady: true, orientationReady: true });
      // Only 2 more good frames — not enough
      result.current.tick({ quality: 0.90, isStable: true, overallReady: true, orientationReady: true });
      result.current.tick({ quality: 0.90, isStable: true, overallReady: true, orientationReady: true });
    });

    act(() => { vi.advanceTimersByTime(5000); });

    expect(onCapture).not.toHaveBeenCalled();
  });

  it("should fire exactly once even with many frames above threshold", () => {
    const onCapture = vi.fn();
    const { result } = renderHook(() =>
      useAutoCapture({
        onCapture,
        qualityThreshold:        0.80,
        stabilityFramesRequired: 3,
        enabled:                 true,
      }),
    );

    act(() => {
      for (let i = 0; i < 20; i++) {
        result.current.tick({ quality: 0.95, isStable: true, overallReady: true, orientationReady: true });
      }
    });

    act(() => { vi.advanceTimersByTime(5000); });

    expect(onCapture).toHaveBeenCalledTimes(1);
  });
});
