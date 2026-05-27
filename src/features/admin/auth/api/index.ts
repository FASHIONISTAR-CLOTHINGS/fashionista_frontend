/**
 * features/admin/auth/api/index.ts
 *
 * API adapters for auth admin domain.
 */

import { apiAdminSync, apiAdminAsync } from "@/core/api/client.admin";
import type { AdminUser, AdminUserSession, AdminLoginEvent, AdminUserMetrics } from "../model/types";

export interface PaginatedEnvelope<T> {
  success: boolean;
  count: number;
  results: T[];
  pages?: number;
  page?: number;
  page_size?: number;
  next?: string | null;
  previous?: string | null;
}

export async function fetchAdminUsers(params?: {
  role?: string;
  is_active?: boolean;
  is_verified?: boolean;
  search?: string;
  ordering?: string;
  page?: number;
  page_size?: number;
}): Promise<PaginatedEnvelope<AdminUser>> {
  const searchParams: Record<string, any> = {};
  if (params?.role && params.role !== "all") searchParams.role = params.role;
  if (params?.is_active !== undefined) searchParams.is_active = params.is_active;
  if (params?.is_verified !== undefined) searchParams.is_verified = params.is_verified;
  if (params?.search) searchParams.search = params.search;
  if (params?.ordering) searchParams.ordering = params.ordering;
  if (params?.page) searchParams.page = params.page;
  if (params?.page_size) searchParams.page_size = params.page_size;

  return apiAdminAsync
    .get("auth/users/", { searchParams })
    .json<PaginatedEnvelope<AdminUser>>();
}

export async function fetchAdminUserDetail(userId: string): Promise<AdminUser> {
  return apiAdminAsync.get(`auth/users/${userId}/`).json<AdminUser>();
}

export async function fetchAdminUserSessions(
  userId: string,
  page = 1,
  pageSize = 25
): Promise<PaginatedEnvelope<AdminUserSession>> {
  return apiAdminAsync
    .get(`auth/users/${userId}/sessions/`, {
      searchParams: { page, page_size: pageSize },
    })
    .json<PaginatedEnvelope<AdminUserSession>>();
}

export async function fetchAdminUserLoginEvents(
  userId: string,
  page = 1,
  pageSize = 25
): Promise<PaginatedEnvelope<AdminLoginEvent>> {
  return apiAdminAsync
    .get(`auth/users/${userId}/events/`, {
      searchParams: { page, page_size: pageSize },
    })
    .json<PaginatedEnvelope<AdminLoginEvent>>();
}

export async function fetchAdminUserStats(): Promise<AdminUserMetrics> {
  return apiAdminAsync.get("auth/users/stats/").json<AdminUserMetrics>();
}

// ── Sync DRF Mutations (writes) ──────────────────────────────────────────────

export async function suspendUser(userId: string, reason: string): Promise<any> {
  const response = await apiAdminSync.post(`auth/users/${userId}/suspend/`, { reason });
  return response.data;
}

export async function reactivateUser(userId: string): Promise<any> {
  const response = await apiAdminSync.post(`auth/users/${userId}/reactivate/`);
  return response.data;
}

export async function verifyUser(userId: string): Promise<any> {
  const response = await apiAdminSync.post(`auth/users/${userId}/verify/`);
  return response.data;
}

export async function forcePasswordReset(userId: string): Promise<any> {
  const response = await apiAdminSync.post(`auth/users/${userId}/force-password-reset/`);
  return response.data;
}

export async function updateUserRole(userId: string, role: string): Promise<any> {
  const response = await apiAdminSync.post(`auth/users/${userId}/update-role/`, { role });
  return response.data;
}

export async function updateAdminUser(userId: string, data: Partial<AdminUser>): Promise<any> {
  const response = await apiAdminSync.put(`auth/users/${userId}/`, data);
  return response.data;
}
