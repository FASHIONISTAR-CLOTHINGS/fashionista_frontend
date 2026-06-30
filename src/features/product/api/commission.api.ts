/**
 * @file commission.api.ts
 * @description API client for ProductCommissionSnapshot (admin only).
 */

import { apiSync } from "@/core/api/client.sync";
import { apiAsync } from "@/core/api/client.async";
import type { CommissionSnapshot, CommissionSnapshotCreatePayload } from "../types/commission.types";

const NINJA_BASE = "products/commission-snapshots";
const DRF_BASE = "products/commission-snapshots";

export async function listCommissionSnapshots(productId?: string, vendorId?: string, limit = 100): Promise<CommissionSnapshot[]> {
  const params = new URLSearchParams({ limit: String(limit) });
  if (productId) params.set("product_id", productId);
  if (vendorId) params.set("vendor_id", vendorId);
  return apiAsync.get(`${NINJA_BASE}/?${params.toString()}`).json<CommissionSnapshot[]>();
}

export async function getCommissionSnapshot(id: string): Promise<CommissionSnapshot> {
  return apiAsync.get(`${NINJA_BASE}/${id}/`).json<CommissionSnapshot>();
}

export async function createCommissionSnapshot(payload: CommissionSnapshotCreatePayload): Promise<{ id: string; commission_rate: string }> {
  const res = await apiSync.post(`${DRF_BASE}/`, payload);
  return res.data?.data;
}

export async function updateCommissionSnapshot(id: string, payload: { note?: string; effective_to?: string | null }): Promise<void> {
  await apiSync.patch(`${DRF_BASE}/${id}/`, payload);
}