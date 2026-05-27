/**
 * features/admin/vendor/api/index.ts
 */

import { apiAdminSync, apiAdminAsync } from "@/core/api/client.admin";
import type { AdminVendor, AdminVendorMetrics } from "../model/types";

import { PaginatedEnvelope } from "../../auth/api";

export async function fetchAdminVendors(params?: {
  is_verified?: boolean;
  is_active?: boolean;
  is_featured?: boolean;
  country?: string;
  search?: string;
  ordering?: string;
  page?: number;
  page_size?: number;
}): Promise<PaginatedEnvelope<AdminVendor>> {
  const searchParams: Record<string, any> = {};
  if (params?.is_verified !== undefined) searchParams.is_verified = params.is_verified;
  if (params?.is_active !== undefined) searchParams.is_active = params.is_active;
  if (params?.is_featured !== undefined) searchParams.is_featured = params.is_featured;
  if (params?.country) searchParams.country = params.country;
  if (params?.search) searchParams.search = params.search;
  if (params?.ordering) searchParams.ordering = params.ordering;
  if (params?.page) searchParams.page = params.page;
  if (params?.page_size) searchParams.page_size = params.page_size;

  return apiAdminAsync
    .get("vendor/", { searchParams })
    .json<PaginatedEnvelope<AdminVendor>>();
}

export async function fetchAdminVendorDetail(vendorId: string): Promise<AdminVendor> {
  return apiAdminAsync.get(`vendor/${vendorId}/`).json<AdminVendor>();
}

export async function fetchAdminVendorProducts(
  vendorId: string,
  page = 1,
  pageSize = 25
): Promise<any> {
  return apiAdminAsync
    .get(`vendor/${vendorId}/products/`, {
      searchParams: { page, page_size: pageSize },
    })
    .json<any>();
}

export async function fetchAdminVendorStats(): Promise<AdminVendorMetrics> {
  return apiAdminAsync.get("vendor/stats/").json<AdminVendorMetrics>();
}

// ── Sync DRF Mutations (writes) ──────────────────────────────────────────────

export async function approveVendor(vendorId: string): Promise<any> {
  const response = await apiAdminSync.post(`vendor/${vendorId}/approve/`);
  return response.data;
}

export async function suspendVendor(vendorId: string, reason: string): Promise<any> {
  const response = await apiAdminSync.post(`vendor/${vendorId}/suspend/`, { reason });
  return response.data;
}

export async function reactivateVendor(vendorId: string): Promise<any> {
  const response = await apiAdminSync.post(`vendor/${vendorId}/reactivate/`);
  return response.data;
}

export async function rejectVendor(vendorId: string, reason: string): Promise<any> {
  const response = await apiAdminSync.post(`vendor/${vendorId}/reject/`, { reason });
  return response.data;
}

export async function updateVendorCommission(
  vendorId: string,
  commissionRate: number
): Promise<any> {
  const response = await apiAdminSync.patch(`vendor/${vendorId}/commission/`, {
    commission_rate: commissionRate,
  });
  return response.data;
}

export async function toggleVendorFeatured(
  vendorId: string,
  featured: boolean
): Promise<any> {
  const response = await apiAdminSync.patch(`vendor/${vendorId}/featured/`, {
    featured,
  });
  return response.data;
}
