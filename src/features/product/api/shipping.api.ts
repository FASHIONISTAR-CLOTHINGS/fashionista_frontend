/**
 * @file shipping.api.ts
 * @description API client for ProductShippingProfile.
 */

import { apiSync } from "@/core/api/client.sync";
import { apiAsync } from "@/core/api/client.async";
import type { ShippingProfile, ShippingProfileCreatePayload } from "../types/shipping.types";

const NINJA_BASE = "products/shipping-profiles";
const DRF_BASE = "products/shipping-profiles";

export async function listShippingProfiles(vendorId?: string): Promise<ShippingProfile[]> {
  const url = vendorId ? `${NINJA_BASE}/?vendor_id=${vendorId}` : `${NINJA_BASE}/`;
  return apiAsync.get(url).json<ShippingProfile[]>();
}

export async function getShippingProfile(id: string): Promise<ShippingProfile> {
  return apiAsync.get(`${NINJA_BASE}/${id}/`).json<ShippingProfile>();
}

export async function createShippingProfile(payload: ShippingProfileCreatePayload): Promise<{ id: string }> {
  const res = await apiSync.post(`${DRF_BASE}/`, payload);
  return res.data?.data;
}

export async function updateShippingProfile(id: string, payload: Partial<ShippingProfileCreatePayload>): Promise<void> {
  await apiSync.patch(`${DRF_BASE}/${id}/`, payload);
}