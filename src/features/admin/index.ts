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

// ── Admin Auth/Users ───────────────────────────────────────────────────────
export * from "./auth/model/types";
export * from "./auth/api";
export * from "./auth/hooks/useAdminAuth";

// ── Admin Vendor ───────────────────────────────────────────────────────────
export * from "./vendor/model/types";
export * from "./vendor/api";
export * from "./vendor/hooks/useAdminVendor";

// ── Admin KYC ──────────────────────────────────────────────────────────────
export * from "./kyc/model/types";
export * from "./kyc/api";
export * from "./kyc/hooks/useAdminKyc";

// ── Admin Settings ──────────────────────────────────────────────────────────
export * from "./settings/api";
export * from "./settings/hooks/useAdminSettings";

