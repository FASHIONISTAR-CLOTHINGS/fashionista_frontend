/**
 * features/vendor/hooks/use-vendor-audit-logs.ts
 *
 * TanStack Query v5 hook for the Vendor Audit Logs endpoint.
 * Calls: GET /api/v1/ninja/vendor/audit-logs/
 */
import { useQuery } from "@tanstack/react-query";
import {
  fetchVendorAuditLogs,
  type AuditLogPage,
  type AuditLogEvent,
} from "@/features/vendor/api/vendor.api";

export type { AuditLogEvent, AuditLogPage };

const auditLogKeys = {
  all:  () => ["vendor", "audit-logs"] as const,
  list: (page: number, category: string, severity: string) =>
    [...auditLogKeys.all(), page, category, severity] as const,
};

export function useVendorAuditLogs(
  page = 1,
  category = "",
  severity = ""
) {
  return useQuery<AuditLogPage, Error>({
    queryKey: auditLogKeys.list(page, category, severity),
    queryFn:  () => fetchVendorAuditLogs(page, category, severity),
    staleTime: 30_000,
    placeholderData: (prev) => prev,
  });
}
