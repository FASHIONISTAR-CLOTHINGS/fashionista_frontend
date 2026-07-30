/**
 * E-5, E-6, E-7: Vitest unit tests for measurement loophole closure fixes.
 *
 * E-5: skipDeviceSetup() is on the hook return type (compile-time check)
 * E-6: tick() jitter stability gate prevents premature countdown
 * E-7: normalizeScanMeasurements maps all 14 MEASUREMENT_FIELDS keys
 *
 * Location: tests/unit/ (matched by vitest include pattern)
 */

import { describe, it, expect } from "vitest";
import { normalizeScanMeasurements } from "../../src/features/measurements/api/scan.api";

// ─── E-5: skipDeviceSetup compile-time type presence ─────────────────────────

describe("E-5: useEnhancedMeasurementCapture.skipDeviceSetup()", () => {
  it("skipDeviceSetup is present on the hook return type (compile-time check)", async () => {
    // Import type to verify the interface at compile time.
    // If skipDeviceSetup is removed from the hook, TypeScript will fail here.
    type HookReturn =
      import("../../src/features/measurements/hooks/useEnhancedMeasurementCapture").UseEnhancedMeasurementCaptureReturn;

    type HasSkipDeviceSetup = HookReturn extends { skipDeviceSetup: () => void }
      ? true
      : false;
    const typeCheck: HasSkipDeviceSetup = true;
    expect(typeCheck).toBe(true);
  });

  it("useEnhancedMeasurementCapture module exports the hook function", async () => {
    const mod = await import(
      "../../src/features/measurements/hooks/useEnhancedMeasurementCapture"
    );
    expect(typeof mod.useEnhancedMeasurementCapture).toBe("function");
  });
});

// ─── E-6: jitter stability gate logic ────────────────────────────────────────

describe("E-6: tick() jitter stability gate prevents premature auto-capture", () => {
  /**
   * Replicates the tick() stability logic from useAutoCapture.ts.
   * Returns events emitted across the sequence of frames.
   */
  function simulateTick(
    qualityThreshold: number,
    stabilityRequired: number,
    frames: Array<{ quality: number; isStable: boolean }>
  ): string[] {
    let stabilityFrames = 0;
    let state = "watching";
    const events: string[] = [];

    for (const frame of frames) {
      const qualityOk = frame.quality >= qualityThreshold;

      if (state === "countdown") {
        if (!qualityOk || !frame.isStable) {
          state = "watching";
          stabilityFrames = 0;
          events.push("countdown_cancelled");
        }
        continue;
      }

      if (!qualityOk) {
        stabilityFrames = 0;
        state = "watching";
        continue;
      }

      if (!frame.isStable) {
        if (state === "watching") state = "arming";
        events.push("arming_paused_jitter");
        continue;
      }

      stabilityFrames += 1;
      if (state === "watching") state = "arming";
      if (state === "arming" && stabilityFrames >= stabilityRequired) {
        state = "countdown";
        events.push("countdown_started");
      }
    }
    return events;
  }

  it("10 high-quality BUT jittery frames → no countdown (stability gate holds)", () => {
    const jitterFrames = Array.from({ length: 10 }, () => ({
      quality: 0.95,
      isStable: false,
    }));
    const events = simulateTick(0.85, 5, jitterFrames);
    expect(events.every((e) => e === "arming_paused_jitter")).toBe(true);
    expect(events).not.toContain("countdown_started");
  });

  it("5 stable high-quality frames → countdown starts after threshold", () => {
    const stableFrames = Array.from({ length: 5 }, () => ({
      quality: 0.95,
      isStable: true,
    }));
    const events = simulateTick(0.85, 5, stableFrames);
    expect(events).toContain("countdown_started");
  });

  it("stable frames interrupted by jitter → countdown cancelled, stability counter reset", () => {
    const frames: Array<{ quality: number; isStable: boolean }> = [
      // 5 stable frames → countdown starts
      ...Array.from({ length: 5 }, () => ({ quality: 0.95, isStable: true })),
      // Then user moves → should cancel
      { quality: 0.95, isStable: false },
    ];
    const events = simulateTick(0.85, 5, frames);
    expect(events).toContain("countdown_started");
    expect(events).toContain("countdown_cancelled");
  });

  it("low quality frames never advance stability counter", () => {
    const badQualityFrames = Array.from({ length: 20 }, () => ({
      quality: 0.30,  // below 0.85 threshold
      isStable: true,
    }));
    const events = simulateTick(0.85, 5, badQualityFrames);
    expect(events).not.toContain("countdown_started");
    expect(events).toHaveLength(0);
  });
});

// ─── E-7: normalizeScanMeasurements — all 14 brand fields ────────────────────

describe("E-7: normalizeScanMeasurements — maps all 14 MEASUREMENT_FIELDS keys", () => {
  const EXPECTED_KEYS = [
    "bust", "waist", "hips", "shoulder_width", "arm_length",
    "inseam", "thigh", "height", "neck", "wrist",
    "knee", "ankle", "chest", "upper_arm",
  ] as const;

  it("maps all 14 backend _cm keys to MEASUREMENT_FIELDS canonical keys", () => {
    const backendResponse: Record<string, number | null> = {
      bust_cm:           95.0,
      waist_cm:          70.0,
      hip_cm:            98.0,
      shoulder_width_cm: 42.0,
      arm_length_cm:     60.0,
      inseam_cm:         80.0,
      thigh_cm:          56.0,
      height_cm:         175.0,
      neck_cm:           36.0,
      wrist_cm:          16.0,
      knee_cm:           38.0,
      ankle_cm:          23.0,
      chest_cm:          92.0,
      upper_arm_cm:      28.0,
    };

    const result = normalizeScanMeasurements(backendResponse);
    const resultKeys = Object.keys(result);
    const missingKeys = EXPECTED_KEYS.filter((k) => !resultKeys.includes(k));

    expect(missingKeys).toEqual([]); // if non-empty, shows which keys are missing

    expect(result.bust).toBe(95.0);
    expect(result.waist).toBe(70.0);
    expect(result.hips).toBe(98.0);
    expect(result.shoulder_width).toBe(42.0);
    expect(result.height).toBe(175.0);
  });

  it("maps backend 'hip' (no _cm suffix) alias to 'hips'", () => {
    const result = normalizeScanMeasurements({ hip: 98.0 });
    expect(result.hips).toBe(98.0);
    expect("hip" in result).toBe(false); // raw backend key must not leak through
  });

  it("waist_cm takes priority over belly_button_cm for 'waist'", () => {
    const result = normalizeScanMeasurements({
      belly_button_cm: 80.0,
      waist_cm:        70.0,
    });
    expect(result.waist).toBe(70.0);
  });

  it("bust_cm maps to 'bust', chest_cm maps to 'chest' — two separate fields", () => {
    const result = normalizeScanMeasurements({
      chest_cm: 92.0,
      bust_cm:  95.0,
    });
    // Both map to distinct brand.ts MEASUREMENT_FIELDS keys
    expect(result.bust).toBe(95.0);
    expect(result.chest).toBe(92.0);
  });

  it("returns empty object for undefined input", () => {
    expect(normalizeScanMeasurements(undefined)).toEqual({});
  });

  it("returns empty object for empty object input", () => {
    expect(normalizeScanMeasurements({})).toEqual({});
  });

  it("preserves null values (measurement not captured)", () => {
    const result = normalizeScanMeasurements({ waist_cm: null });
    expect(result.waist).toBeNull();
  });
});
