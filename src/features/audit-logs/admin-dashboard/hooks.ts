/**
 * features/audit-logs/admin-dashboard/hooks.ts
 */

"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchAuditLogs } from "./api";
import { auditLogKeys } from "./types";
import type { AuditLogEnvelope, AuditLogFilters } from "./types";

export function useAuditLogs(filters?: AuditLogFilters) {
  return useQuery<AuditLogEnvelope, Error>({
    queryKey:           auditLogKeys.list(filters),
    queryFn:            () => fetchAuditLogs(filters),
    staleTime:          5 * 60_000,
    refetchOnWindowFocus: false,
    retry:              1,
  });
}
