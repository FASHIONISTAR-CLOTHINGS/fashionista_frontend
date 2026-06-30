/**
 * @file size-guide.api.ts
 * @description API client for ProductSizeAndMeasurementGuide.
 *
 * Read routes  -> Ky -> Ninja /api/v1/ninja/products/size-guides/
 * Write routes -> Axios -> DRF /api/v1/products/size-guides/
 */

import { apiSync } from "@/core/api/client.sync";
import { apiAsync } from "@/core/api/client.async";
import type {
  SizeGuide,
  SizeGuideCreatePayload,
  ClientMeasurementOverlay,
} from "../types/size-guide.types";

const NINJA_BASE = "products/size-guides";
const DRF_BASE = "products/size-guides";

export async function listSizeGuides(vendorId?: string): Promise<SizeGuide[]> {
  const url = vendorId ? `${NINJA_BASE}/?vendor_id=${vendorId}` : `${NINJA_BASE}/`;
  return apiAsync.get(url).json<SizeGuide[]>();
}

export async function getSizeGuide(id: string): Promise<SizeGuide> {
  return apiAsync.get(`${NINJA_BASE}/${id}/`).json<SizeGuide>();
}

export async function getClientSizeGuideOverlay(
  vendorId: string,
  measurementProfileId?: string
): Promise<ClientMeasurementOverlay[]> {
  const params = new URLSearchParams({ vendor_id: vendorId });
  if (measurementProfileId) params.set("measurement_profile_id", measurementProfileId);
  return apiAsync.get(`${NINJA_BASE}/client-overlay/?${params.toString()}`).json<ClientMeasurementOverlay[]>();
}

export async function createSizeGuide(payload: SizeGuideCreatePayload): Promise<{ id: string; name: string }> {
  const res = await apiSync.post(`${DRF_BASE}/`, payload);
  return res.data?.data;
}

export async function updateSizeGuide(id: string, payload: Partial<SizeGuideCreatePayload>): Promise<void> {
  await apiSync.patch(`${DRF_BASE}/${id}/`, payload);
}

export async function deleteSizeGuide(id: string): Promise<void> {
  await apiSync.delete(`${DRF_BASE}/${id}/`);
}