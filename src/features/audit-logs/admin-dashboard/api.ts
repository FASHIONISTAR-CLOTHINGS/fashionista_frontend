/**
 * features/audit-logs/admin-dashboard/api.ts
 */

import { apiAsync } from "@/core/api/client.async";
import type { AuditLogEnvelope, AuditLogFilters } from "./types";

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
