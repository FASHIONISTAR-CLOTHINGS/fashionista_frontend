/**
 * @file measurements.api.ts
 * @description Measurements domain API client.
 *
 * Endpoint Routing (Dual-Engine):
 *  - Ninja async → GET /api/v1/ninja/measurements/ (canonical reads)
 *  - DRF sync    → /api/v1/measurements/           (writes + provider calls)
 */
import { apiSync } from "@/core/api/client.sync";
import { apiAsync } from "@/core/api/client.async";
import { unwrapApiData } from "@/core/api/response";
import {
  MeasurementListEnvelopeSchema,
  MeasurementDetailEnvelopeSchema,
  MirrorSizeSessionEnvelopeSchema,
  parseMeasurementResponse,
} from "../schemas/measurements.schemas";
import type {
  MeasurementProfile,
  CreateMeasurementProfileInput,
  MirrorSizeImportInput,
  MirrorSizeSession,
  MirrorSizeSessionInput,
  UpdateMeasurementProfileInput,
} from "../types/measurements.types";

// ─── Type helpers ─────────────────────────────────────────────────────────────

type Envelope<T> = { status: string; data: T };

// ─── READ — Ninja Async ───────────────────────────────────────────────────────

/**
 * GET /api/v1/ninja/measurements/
 * Returns all measurement profiles for the authenticated user.
 */
export async function fetchMeasurementProfiles(): Promise<MeasurementProfile[]> {
  const raw = await apiAsync.get("measurements/").json<Envelope<unknown[]>>();
  const parsed = parseMeasurementResponse(
    MeasurementListEnvelopeSchema,
    raw,
    "fetchMeasurementProfiles",
  );
  return parsed.data as MeasurementProfile[];
}

/**
 * GET /api/v1/ninja/measurements/default/
 * Returns the user's default measurement profile.
 */
export async function fetchDefaultMeasurementProfile(): Promise<MeasurementProfile | null> {
  try {
    const raw = await apiAsync.get("measurements/default/").json<Envelope<unknown>>();
    const parsed = parseMeasurementResponse(
      MeasurementDetailEnvelopeSchema,
      raw,
      "fetchDefaultMeasurementProfile",
    );
    return parsed.data as MeasurementProfile;
  } catch (err: unknown) {
    // 404 = no default set yet — expected state
    if (err && typeof err === "object" && "response" in err) {
      const resp = (err as { response: { status?: number } }).response;
      if (resp?.status === 404) return null;
    }
    throw err;
  }
}

/**
 * GET /api/v1/ninja/measurements/{id}/
 * Returns a single measurement profile by ID.
 */
export async function fetchMeasurementProfileById(
  profileId: string | number,
): Promise<MeasurementProfile> {
  const raw = await apiAsync
    .get(`measurements/${profileId}/`)
    .json<Envelope<unknown>>();
  const parsed = parseMeasurementResponse(
    MeasurementDetailEnvelopeSchema,
    raw,
    `fetchMeasurementProfileById(${profileId})`,
  );
  return parsed.data as MeasurementProfile;
}

// ─── WRITE — Ninja Async ──────────────────────────────────────────────────────

/**
 * POST /api/v1/ninja/measurements/
 * Create a new measurement profile.
 */
export async function createMeasurementProfile(
  input: CreateMeasurementProfileInput,
): Promise<MeasurementProfile> {
  const { data } = await apiSync.post<unknown>("v1/measurements/", input);
  const raw = { data: unwrapApiData(data) };
  const parsed = parseMeasurementResponse(
    MeasurementDetailEnvelopeSchema,
    raw,
    "createMeasurementProfile",
  );
  return parsed.data as MeasurementProfile;
}

/**
 * PATCH /api/v1/ninja/measurements/{id}/
 * Partial update of a measurement profile.
 */
export async function updateMeasurementProfile(
  profileId: string | number,
  input: UpdateMeasurementProfileInput,
): Promise<MeasurementProfile> {
  const { data } = await apiSync.patch<unknown>(`v1/measurements/${profileId}/`, input);
  const raw = { data: unwrapApiData(data) };
  const parsed = parseMeasurementResponse(
    MeasurementDetailEnvelopeSchema,
    raw,
    `updateMeasurementProfile(${profileId})`,
  );
  return parsed.data as MeasurementProfile;
}

/**
 * POST /api/v1/ninja/measurements/{id}/set-default/
 * Mark a profile as the user's default (atomic backend operation).
 */
export async function setDefaultMeasurementProfile(
  profileId: string | number,
): Promise<MeasurementProfile> {
  const { data } = await apiSync.post<unknown>(`v1/measurements/${profileId}/set-default/`);
  const raw = { data: unwrapApiData(data) };
  const parsed = parseMeasurementResponse(
    MeasurementDetailEnvelopeSchema,
    raw,
    `setDefaultMeasurementProfile(${profileId})`,
  );
  return parsed.data as MeasurementProfile;
}

/**
 * DELETE /api/v1/ninja/measurements/{id}/
 * Hard-delete a measurement profile (GDPR right-to-erasure compliant).
 */
export async function deleteMeasurementProfile(
  profileId: string | number,
): Promise<void> {
  await apiSync.delete(`v1/measurements/${profileId}/`);
}

export async function createMirrorSizeSession(
  input: MirrorSizeSessionInput,
): Promise<MirrorSizeSession> {
  const { data } = await apiSync.post<unknown>("v1/measurements/mirrorsize/session/", input);
  const parsed = parseMeasurementResponse(
    MirrorSizeSessionEnvelopeSchema,
    { data: unwrapApiData(data) },
    "createMirrorSizeSession",
  );
  return parsed.data as MirrorSizeSession;
}

export async function importMirrorSizeMeasurement(
  input: MirrorSizeImportInput,
): Promise<MeasurementProfile> {
  const { data } = await apiSync.post<unknown>("v1/measurements/mirrorsize/import/", input);
  const raw = { data: unwrapApiData(data) };
  const parsed = parseMeasurementResponse(
    MeasurementDetailEnvelopeSchema,
    raw,
    "importMirrorSizeMeasurement",
  );
  return parsed.data as MeasurementProfile;
}
