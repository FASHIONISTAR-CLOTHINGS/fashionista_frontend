import { afterEach, describe, expect, it, vi } from "vitest";
import { apiSync } from "@/core/api/client.sync";
import { normalizeScanMeasurements, submitLandmarks } from "@/features/measurements/api/scan.api";
import { parseScanStatus } from "@/features/measurements/schemas/scan.schema";

describe("measurement scan API contract", () => {
  afterEach(() => vi.restoreAllMocks());

  it("normalizes backend measurement keys to the frontend field names", () => {
    expect(normalizeScanMeasurements({
      shoulder_width_cm: 42,
      hip_cm: 96,
      height_cm: 175,
    })).toEqual({
      shoulder_width: 42,
      hips: 96,
      height: 175,
    });
  });

  it("parses the canonical polling response shape", () => {
    const result = parseScanStatus({
      session_id: "scan-1",
      status: "completed",
      scan_confidence: 0.91,
      extracted_measurements: { waist: 82.4 },
      measurements_cm: { waist: 82.4 },
      measurements_inches: { waist: 32.4 },
      plausibility_warnings: [],
      bmi: 22.1,
      correction_applied: null,
      error_message: null,
      measurement_profile_id: 12,
      processing_started_at: null,
      completed_at: "2026-08-02T20:00:00Z",
    });

    expect(result?.status).toBe("completed");
    expect(result?.error_message).toBeNull();
    expect(result?.measurements_cm?.waist).toBe(82.4);
  });

  it("rejects a malformed status payload", () => {
    expect(parseScanStatus({
      session_id: "scan-1",
      status: "done",
    })).toBeNull();
  });

  it("sends one canonical idempotency key to the submit endpoint", async () => {
    const post = vi.spyOn(apiSync, "post").mockResolvedValue({
      data: { data: { session_id: "scan-1", status: "processing" } },
    } as never);

    await submitLandmarks("scan-1", {
      user_height_cm: 175,
      front_landmarks: [{ x: 0, y: 0, z: 0, visibility: 1 }],
    });

    const requestConfig = post.mock.calls[0]?.[2] as { headers?: Record<string, string> };
    expect(requestConfig.headers?.["Idempotency-Key"]).toBeTruthy();
    expect(requestConfig.headers?.["Idempotency-Key"])
      .toBe(requestConfig.headers?.["X-Idempotency-Key"]);
    expect(post.mock.calls[0]?.[1]).not.toHaveProperty("idempotency_key");
  });
});
