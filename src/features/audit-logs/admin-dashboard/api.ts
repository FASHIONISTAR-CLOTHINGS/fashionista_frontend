/**
 * features/audit-logs/admin-dashboard/api.ts
 *
 * API client for the compliance audit log viewer.
 *
 * Endpoint: GET /api/v1/admin_backend/audit/logs/
 * Auth: Superadmin only
 * Client: apiAdminAsync (Ky) — Ninja async
 */

import { apiAdminAsync } from "@/core/api/client.admin";
import type { AuditLogEnvelope, AuditLogFilters } from "./types";

/**
 * Fetch audit log entries with optional filters.
 */
export async function fetchAuditLogs(
  filters?: AuditLogFilters
): Promise<AuditLogEnvelope> {
  const params: Record<string, string | number> = {};
  if (filters?.category)      params.category      = filters.category;
  if (filters?.action)        params.action        = filters.action;
  if (filters?.actor_email)   params.actor_email   = filters.actor_email;
  if (filters?.resource_type) params.resource_type = filters.resource_type;
  if (filters?.page)          params.page          = filters.page;
  if (filters?.page_size)     params.page_size     = filters.page_size ?? 50;

  return apiAdminAsync
    .get("audit/logs/", {
      searchParams: params as Record<string, string>,
    })
    .json<AuditLogEnvelope>();
}
