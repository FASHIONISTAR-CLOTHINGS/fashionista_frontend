/**
 * features/admin/kyc/api/index.ts
 */

import { apiAdminSync, apiAdminAsync } from "@/core/api/client.admin";
import type { AdminKycSubmission, AdminKycStats } from "../model/types";

import { PaginatedEnvelope } from "../../auth/api";

export async function fetchAdminKycSubmissions(params?: {
  status?: string;
  user_id?: string;
  search?: string;
  ordering?: string;
  page?: number;
  page_size?: number;
}): Promise<PaginatedEnvelope<AdminKycSubmission>> {
  const searchParams: Record<string, any> = {};
  if (params?.status && params.status !== "all") searchParams.status = params.status;
  if (params?.user_id) searchParams.user_id = params.user_id;
  if (params?.search) searchParams.search = params.search;
  if (params?.ordering) searchParams.ordering = params.ordering;
  if (params?.page) searchParams.page = params.page;
  if (params?.page_size) searchParams.page_size = params.page_size;

  return apiAdminAsync
    .get("kyc/", { searchParams })
    .json<PaginatedEnvelope<AdminKycSubmission>>();
}

export async function fetchAdminKycDetail(submissionId: string): Promise<AdminKycSubmission> {
  return apiAdminAsync.get(`kyc/${submissionId}/`).json<AdminKycSubmission>();
}

export async function fetchAdminKycStats(): Promise<AdminKycStats> {
  return apiAdminAsync.get("kyc/stats/").json<AdminKycStats>();
}

// ── Async PATCH exceptions (permitted per rules) ─────────────────────────────

export async function quickApproveKyc(
  submissionId: string,
  legalName?: string
): Promise<any> {
  return apiAdminAsync
    .patch(`kyc/${submissionId}/approve/`, { json: { legal_name: legalName } })
    .json<any>();
}

export async function quickRejectKyc(
  submissionId: string,
  notes: string,
  allowResubmit = true
): Promise<any> {
  return apiAdminAsync
    .patch(`kyc/${submissionId}/reject/`, {
      json: { notes, allow_resubmit: allowResubmit },
    })
    .json<any>();
}

// ── Sync DRF views (standard writes) ─────────────────────────────────────────

export async function approveKycSync(
  submissionId: string,
  legalName?: string
): Promise<any> {
  const response = await apiAdminSync.post(`kyc/${submissionId}/approve/`, {
    legal_name: legalName,
  });
  return response.data;
}

export async function rejectKycSync(
  submissionId: string,
  notes: string,
  allowResubmit = true
): Promise<any> {
  const response = await apiAdminSync.post(`kyc/${submissionId}/reject/`, {
    notes,
    allow_resubmit: allowResubmit,
  });
  return response.data;
}

export async function markKycInReviewSync(submissionId: string): Promise<any> {
  const response = await apiAdminSync.post(`kyc/${submissionId}/in-review/`);
  return response.data;
}
