/**
 * features/audit-logs/admin-dashboard/hooks.ts
 */

import { useQuery } from "@tanstack/react-query";
import { fetchAuditLogs } from "./api";
import { auditLogKeys } from "./types";
import type { AuditLogFilters } from "./types";

export function useAuditLogs(filters?: AuditLogFilters) {
  return useQuery({
    queryKey: auditLogKeys.list(filters),
    queryFn: () => fetchAuditLogs(filters),
    placeholderData: (prev) => prev,
    staleTime: 10_000,
  });
}
