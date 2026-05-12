/**
 * features/admin/api/audit-log.api.ts
 *
 * API client for the compliance audit log viewer.
 *
 * Endpoint: GET /api/v1/ninja/audit/logs/
 * Auth: Superadmin only (IsAdminUser — enforced backend-side)
 * Client: apiAsync (Ky) — Ninja async, non-blocking paginated reads
 */

import { apiAsync } from "@/core/api/client.async";
import type { AuditLogEnvelope, AuditLogFilters } from "../types/audit-log.types";

/**
 * Fetch audit log entries with optional filters.
 *
 * Used by the admin audit trail viewer for compliance reporting.
 * Supports filtering by category (financial, support, kyc, auth),
 * actor email, action name, and resource type.
 *
 * @param filters Optional pagination and filter params
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

  return apiAsync
    .get("audit/logs/", {
      searchParams: params as Record<string, string>,
    })
    .json<AuditLogEnvelope>();
}
