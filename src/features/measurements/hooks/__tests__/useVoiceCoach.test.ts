/**
 * @file useVoiceCoach.test.ts
 * @description Phase 14 / TASK-046: Unit tests for useVoiceCoach hook.
 *
 * Tests:
 *   - speak() calls speechSynthesis.speak
 *   - Priority messages bypass debounce
 *   - Debounce prevents duplicate messages within window
 *   - SpeechSynthesis unavailable degrades gracefully (no crash)
 *   - stop() calls speechSynthesis.cancel
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useVoiceCoach } from "@/features/measurements/hooks/useVoiceCoach";

// ─── Mocks ────────────────────────────────────────────────────────────────────

const mockSpeak     = vi.fn();
const mockCancel    = vi.fn();
const mockGetVoices = vi.fn(() => [
  { name: "Samantha", lang: "en-US", default: true } as SpeechSynthesisVoice,
]);

function mockSpeechSynthesis(available = true) {
  class MockSpeechSynthesisUtterance {
    rate = 1;
    pitch = 1;
    volume = 1;
    voice: SpeechSynthesisVoice | null = null;
    onstart: (() => void) | null = null;
    onend: (() => void) | null = null;
    onerror: (() => void) | null = null;

    constructor(public text: string) {}
  }
  vi.stubGlobal("SpeechSynthesisUtterance", MockSpeechSynthesisUtterance);

  if (!available) {
    Object.defineProperty(window, "speechSynthesis", {
      value: undefined,
      writable: true,
      configurable: true,
    });
    return;
  }
  Object.defineProperty(window, "speechSynthesis", {
    value: {
      speak:          mockSpeak,
      cancel:         mockCancel,
      getVoices:      mockGetVoices,
      speaking:       false,
      pending:        false,
      paused:         false,
      onvoiceschanged: null,
    } as unknown as SpeechSynthesis,
    writable: true,
    configurable: true,
  });
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("useVoiceCoach", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockSpeechSynthesis(true);
    mockSpeak.mockClear();
    mockCancel.mockClear();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("should call speechSynthesis.speak when speak() is called", () => {
    const { result } = renderHook(() => useVoiceCoach());
    act(() => {
      result.current.speak("welcome");
    });
    // Flush timers to allow any debounce or queue processing
    act(() => { vi.advanceTimersByTime(600); });
    expect(mockSpeak).toHaveBeenCalled();
  });

  it("should not crash when SpeechSynthesis is unavailable", () => {
    mockSpeechSynthesis(false);
    const { result } = renderHook(() => useVoiceCoach());
    expect(result.current.isSupported).toBe(false);
    expect(() => {
      act(() => { result.current.speak("welcome"); });
    }).not.toThrow();
  });

  it("should not speak the same message within debounce window (default 4000ms)", () => {
    const { result } = renderHook(() => useVoiceCoach());
    act(() => {
      result.current.speak("tooClose");
    });
    act(() => { vi.advanceTimersByTime(100); });
    const callsAfterFirst = mockSpeak.mock.calls.length;
    act(() => {
      result.current.speak("tooClose"); // same key within debounce window
    });
    act(() => { vi.advanceTimersByTime(100); });
    // Second call should not increase speak count
    expect(mockSpeak.mock.calls.length).toBe(callsAfterFirst);
  });

  it("stop() should call speechSynthesis.cancel", () => {
    const { result } = renderHook(() => useVoiceCoach());
    act(() => { result.current.stop(); });
    expect(mockCancel).toHaveBeenCalledTimes(1);
  });

  it("priority speak should fire immediately without waiting for debounce", () => {
    const { result } = renderHook(() => useVoiceCoach());
    act(() => {
      result.current.speak("complete", { priority: true });
    });
    // Priority should call speak immediately (or at least within a microtask)
    act(() => { vi.advanceTimersByTime(50); });
    expect(mockSpeak).toHaveBeenCalled();
  });
});
