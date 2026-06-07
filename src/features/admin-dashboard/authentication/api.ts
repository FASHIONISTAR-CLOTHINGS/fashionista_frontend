/**
 * features/admin-dashboard/authentication/api.ts
 *
 * Admin authentication API layer.
 * - READ / LIST / DETAIL  → apiAdminAsync (Ky → Django Ninja async endpoint)
 * - WRITE / MUTATIONS     → apiAdminSync  (Axios → DRF sync endpoint)
 */

import { apiAdminSync, apiAdminAsync } from "@/core/api/client.admin";
import type {
  AdminUser,
  AdminUserSession,
  AdminLoginEvent,
  AdminUserMetrics,
  PaginatedEnvelope,
} from "./types";

// ── Read: List Users ──────────────────────────────────────────────────────────

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

// ── Read: User Detail ─────────────────────────────────────────────────────────

export async function fetchAdminUserDetail(userId: string): Promise<AdminUser> {
  if (!userId) return Promise.reject(new Error("userId is required"));
  return apiAdminAsync.get(`auth/users/${userId}/`).json<AdminUser>();
}

// ── Read: User Sessions ───────────────────────────────────────────────────────

export async function fetchAdminUserSessions(
  userId: string,
  page = 1,
  pageSize = 25
): Promise<PaginatedEnvelope<AdminUserSession>> {
  if (!userId) return Promise.reject(new Error("userId is required"));
  return apiAdminAsync
    .get(`auth/users/${userId}/sessions/`, {
      searchParams: { page, page_size: pageSize },
    })
    .json<PaginatedEnvelope<AdminUserSession>>();
}

// ── Read: User Login Events ───────────────────────────────────────────────────

export async function fetchAdminUserLoginEvents(
  userId: string,
  page = 1,
  pageSize = 25
): Promise<PaginatedEnvelope<AdminLoginEvent>> {
  if (!userId) return Promise.reject(new Error("userId is required"));
  return apiAdminAsync
    .get(`auth/users/${userId}/events/`, {
      searchParams: { page, page_size: pageSize },
    })
    .json<PaginatedEnvelope<AdminLoginEvent>>();
}

// ── Read: KPI Stats ───────────────────────────────────────────────────────────

export async function fetchAdminUserStats(): Promise<AdminUserMetrics> {
  return apiAdminAsync.get("auth/users/stats/").json<AdminUserMetrics>();
}

// ── Write: Suspend User ───────────────────────────────────────────────────────

export async function suspendUser(userId: string, reason: string): Promise<any> {
  if (!userId) return Promise.reject(new Error("userId is required"));
  const response = await apiAdminSync.post(`auth/users/${userId}/suspend/`, { reason });
  return response.data;
}

// ── Write: Reactivate User ────────────────────────────────────────────────────

export async function reactivateUser(userId: string): Promise<any> {
  if (!userId) return Promise.reject(new Error("userId is required"));
  const response = await apiAdminSync.post(`auth/users/${userId}/reactivate/`);
  return response.data;
}

// ── Write: Verify User ────────────────────────────────────────────────────────

export async function verifyUser(userId: string): Promise<any> {
  if (!userId) return Promise.reject(new Error("userId is required"));
  const response = await apiAdminSync.post(`auth/users/${userId}/verify/`);
  return response.data;
}

// ── Write: Force Password Reset ───────────────────────────────────────────────

export async function forcePasswordReset(userId: string): Promise<any> {
  if (!userId) return Promise.reject(new Error("userId is required"));
  const response = await apiAdminSync.post(`auth/users/${userId}/force-password-reset/`);
  return response.data;
}

// ── Write: Update User Role ───────────────────────────────────────────────────
// NOTE: Backend AdminUserRoleUpdateSerializer expects { new_role } not { role }

export async function updateUserRole(userId: string, role: string): Promise<any> {
  if (!userId) return Promise.reject(new Error("userId is required"));
  const response = await apiAdminSync.post(`auth/users/${userId}/update-role/`, {
    new_role: role,
  });
  return response.data;
}

// ── Write: Partial Update User Profile ───────────────────────────────────────

export async function updateAdminUser(
  userId: string,
  data: Partial<AdminUser>
): Promise<any> {
  if (!userId) return Promise.reject(new Error("userId is required"));
  const response = await apiAdminSync.put(`auth/users/${userId}/`, data);
  return response.data;
}
