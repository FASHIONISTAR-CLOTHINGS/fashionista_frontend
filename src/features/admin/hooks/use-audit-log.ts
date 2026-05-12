/**
 * features/admin/hooks/use-audit-log.ts
 *
 * TanStack Query v5 hook for the compliance audit log viewer.
 *
 * Hooks:
 *   - useAuditLogs: Paginated audit trail with category/action/actor filters
 */

"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchAuditLogs } from "../api/audit-log.api";
import { auditLogKeys } from "../types/audit-log.types";
import type { AuditLogEnvelope, AuditLogFilters } from "../types/audit-log.types";

/**
 * Paginated audit log query.
 *
 * Never auto-refetches — audit logs are append-only and compliance-sensitive.
 * Admins trigger manual refresh to avoid stale query overhead on large datasets.
 *
 * @param filters Optional category/action/actor/pagination filters
 */
export function useAuditLogs(filters?: AuditLogFilters) {
  return useQuery<AuditLogEnvelope, Error>({
    queryKey:           auditLogKeys.list(filters),
    queryFn:            () => fetchAuditLogs(filters),
    staleTime:          5 * 60_000, // 5 min — audit logs are immutable
    refetchOnWindowFocus: false,    // No auto-refetch (manual control only)
    retry:              1,
  });
}
