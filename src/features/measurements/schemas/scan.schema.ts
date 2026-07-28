/**
 * @file scan.schema.ts
 * @description Zod schemas for the AI body scan flow (T-019).
 *
 * Schema parity with:
 *   apps/measurements/apis/sync/scan_views.py (LandmarkSubmitSerializer)
 *   apps/ai/apis/async_api/ai_router.py (ScanStatusSchema)
 */

import { z } from "zod";

// ── Landmark point (MediaPipe world coordinate) ──────────────────────────────

export const LandmarkPointSchema = z.object({
  x:          z.number(),
  y:          z.number(),
  z:          z.number(),
  visibility: z.number().min(0).max(1),
});

export type LandmarkPoint = z.infer<typeof LandmarkPointSchema>;

// ── Submit landmarks request ──────────────────────────────────────────────────

export const SubmitLandmarksSchema = z.object({
  user_height_cm: z.number().min(50).max(300),
  user_weight_kg: z.number().min(10).max(500).optional().nullable(),
  user_age:       z.number().int().min(5).max(120).optional().nullable(),
  user_sex:       z.enum(["male", "female", "neutral"]).optional().nullable(),
  device_type:    z.enum(["web", "ios", "android"]).default("web"),
  landmarks:     z.array(LandmarkPointSchema).length(33).optional(),
  front_landmarks: z.array(LandmarkPointSchema).length(33).optional(),
  side_landmarks:  z.array(LandmarkPointSchema).length(33).optional().nullable(),
  orientation_confidence: z.number().min(0).max(1).optional().nullable(),
  idempotency_key: z.string().max(128).optional().nullable(),
}).refine(
  (data) => data.landmarks || data.front_landmarks,
  { message: "Either 'front_landmarks' or 'landmarks' must be provided." },
);

export type SubmitLandmarksRequest = z.infer<typeof SubmitLandmarksSchema>;

// ── Scan status response ──────────────────────────────────────────────────────

export const ScanStatusSchema = z.object({
  session_id:              z.string(),
  status:                  z.enum(["pending", "processing", "completed", "failed"]),
  scan_confidence:         z.number().nullable().optional(),
  extracted_measurements:  z.record(z.string(), z.any()).nullable().optional(),
  measurements_cm:          z.record(z.string(), z.any()).nullable().optional(),
  measurements_inches:      z.record(z.string(), z.any()).nullable().optional(),
  plausibility_warnings:   z.array(z.string()).default([]),
  bmi:                     z.number().nullable().optional(),
  correction_applied:      z.string().nullable().optional(),
  error_message:           z.string().nullable().optional(),
  measurement_profile_id:  z.number().nullable().optional(),
  processing_started_at:   z.string().nullable().optional(),
  completed_at:            z.string().nullable().optional(),
});

export type ScanStatusResponse = z.infer<typeof ScanStatusSchema>;

// ── WebSocket scan event ──────────────────────────────────────────────────────

export const ScanEventSchema = z.object({
  event:      z.string(),
  session_id: z.string(),
  status:     z.string(),
  scan_phase: z.string().nullable().optional(),
  data:       z.record(z.string(), z.any()).default({}),
});

export type ScanEvent = z.infer<typeof ScanEventSchema>;

// ── Initiate scan response ───────────────────────────────────────────────────

export const InitiateScanSchema = z.object({
  session_id: z.string(),
  status:     z.literal("pending"),
  message:    z.string().optional(),
  qr_code_b64: z.string().nullable().optional(),
});

export type InitiateScanResponse = z.infer<typeof InitiateScanSchema>;
