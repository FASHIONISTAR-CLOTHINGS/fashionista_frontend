/**
 * @file scan.schema.ts
 * @description T-019: Zod schemas for scan status API responses.
 *
 * Validates the enriched scan status response from the consolidated
 * Ninja async endpoint: GET /api/v1/ninja/ai/scan/{id}/status/
 *
 * Schema parity with:
 *   apps/ai/apis/async_api/ai_router.py (ScanStatusView)
 *   apps/measurements/apis/sync/scan_views.py (SubmitLandmarksView)
 */
import { z } from "zod";

// ── Landmark point ─────────────────────────────────────────────────────────────

export const LandmarkPointSchema = z.object({
  x: z.number(),
  y: z.number(),
  z: z.number().optional().default(0),
  visibility: z.number().optional().default(1),
});

export type LandmarkPoint = z.infer<typeof LandmarkPointSchema>;

// ── Scan status response ───────────────────────────────────────────────────────

const MeasurementRecordSchema = z.record(
  z.string(),
  z.union([z.number(), z.null()]),
);

/** Canonical shape returned by the Ninja polling endpoint. */
export const ScanStatusSchema = z.object({
  session_id: z.string(),
  status: z.enum(["pending", "processing", "completed", "failed"]),
  scan_phase: z.string().nullable().optional(),
  scan_confidence: z.number().min(0).max(1).nullable().optional(),
  extracted_measurements: MeasurementRecordSchema.nullable().optional(),
  measurements_cm: MeasurementRecordSchema.nullable().optional(),
  measurements_inches: MeasurementRecordSchema.nullable().optional(),
  plausibility_warnings: z.array(z.string()).optional().default([]),
  bmi: z.number().nullable().optional(),
  correction_applied: z.string().nullable().optional(),
  error_message: z.string().nullable().optional(),
  measurement_profile_id: z.union([z.string(), z.number()]).nullable().optional(),
  processing_started_at: z.string().nullable().optional(),
  completed_at: z.string().nullable().optional(),
});

export type ScanStatusResponse = z.infer<typeof ScanStatusSchema>;

// ── Scan WebSocket event ───────────────────────────────────────────────────────

export const ScanEventSchema = z.object({
  type: z.literal("scan.update"),
  event: z.string(),
  session_id: z.string(),
  status: z.string(),
  scan_phase: z.string().optional().default(""),
  data: z.record(z.string(), z.unknown()).optional().default({}),
});

export type ScanEvent = z.infer<typeof ScanEventSchema>;

// ── Initiate scan response ─────────────────────────────────────────────────────

export const InitiateScanSchema = z.object({
  session_id: z.string(),
  measurement_url: z.string(),
  qr_code_b64: z.string().nullable().optional().default(null),
  qr_code_url: z.string().nullable().optional().default(null),
  expires_in_seconds: z.number().optional().default(300),
});

export type InitiateScanResponse = z.infer<typeof InitiateScanSchema>;

// ── Submit landmarks request ───────────────────────────────────────────────────

export const SubmitLandmarksSchema = z.object({
  session_id: z.string(),
  pose: z.enum(["front", "side"]),
  landmarks: z.array(LandmarkPointSchema),
  landmarks_world: z.array(LandmarkPointSchema).optional(),
  user_height_cm: z.number().positive().optional(),
  user_age: z.number().int().min(10).max(100).optional(),
  user_sex: z.enum(["male", "female", "neutral"]).optional(),
  user_weight_kg: z.number().positive().optional(),
  image_width: z.number().int().positive().optional(),
  image_height: z.number().int().positive().optional(),
  orientation_confidence: z.number().min(0).max(1).optional(),
  idempotency_key: z.string().max(128).optional(),
});

export type SubmitLandmarksRequest = z.infer<typeof SubmitLandmarksSchema>;

// ── Safe parse helper ──────────────────────────────────────────────────────────

export function parseScanStatus(data: unknown): ScanStatusResponse | null {
  const result = ScanStatusSchema.safeParse(data);
  if (!result.success) {
    console.error("[Zod/Scan] Schema mismatch:", result.error.flatten());
    return null;
  }
  return result.data;
}
