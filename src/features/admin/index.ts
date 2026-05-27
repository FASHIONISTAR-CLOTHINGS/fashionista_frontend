/**
 * features/admin/index.ts
 *
 * Public barrel for the `features/admin` canonical FSD slice.
 *
 * Import ONLY from 'features/admin' — never from deep internal paths.
 */

// ── Audit Log Types ────────────────────────────────────────────────────────
export type {
  AuditCategory,
  AuditLogEntry,
  AuditLogFilters,
  AuditLogEnvelope,
} from "./types/audit-log.types";

export {
  auditLogKeys,
  AUDIT_CATEGORY_LABELS,
  AUDIT_CATEGORY_COLORS,
  AUDIT_CATEGORY_RETENTION,
} from "./types/audit-log.types";

// ── Audit Log API ──────────────────────────────────────────────────────────
export { fetchAuditLogs } from "./api/audit-log.api";

// ── Audit Log Hooks ────────────────────────────────────────────────────────
export { useAuditLogs } from "./hooks/use-audit-log";

// ── Admin Components ───────────────────────────────────────────────────────
export { AuditLogViewer } from "./components/AuditLogViewer";

// ── Dashboard KPI API & Hooks ──────────────────────────────────────────────
export { fetchAdminDashboardKPI } from "./api/dashboard.api";
export type { AdminDashboardKPI } from "./api/dashboard.api";
export { useAdminDashboardKPI } from "./hooks/use-dashboard-kpi";

