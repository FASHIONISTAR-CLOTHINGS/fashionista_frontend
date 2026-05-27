/**
 * features/admin-dashboard/audit-logs/hooks/use-audit-log.ts
 */

"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchAuditLogs } from "../api/audit-log.api";
import { auditLogKeys } from "../types/audit-log.types";
import type { AuditLogEnvelope, AuditLogFilters } from "../types/audit-log.types";

export function useAuditLogs(filters?: AuditLogFilters) {
  return useQuery<AuditLogEnvelope, Error>({
    queryKey:           auditLogKeys.list(filters),
    queryFn:            () => fetchAuditLogs(filters),
    staleTime:          5 * 60_000,
    refetchOnWindowFocus: false,
    retry:              1,
  });
}
