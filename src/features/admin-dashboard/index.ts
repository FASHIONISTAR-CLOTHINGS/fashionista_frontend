/**
 * features/admin-dashboard/index.ts
 *
 * Public barrel for the `features/admin-dashboard` canonical FSD slice.
 *
 * Import ONLY from 'features/admin-dashboard' — never from deep internal paths.
 */

// ── Auth & Users ───────────────────────────────────────────────────────────
export * from "./authentication/model/types";
export * from "./authentication/api";
export * from "./authentication/hooks/useAdminAuth";

// ── KYC ────────────────────────────────────────────────────────────────────
export * from "./kyc/model/types";
export * from "./kyc/api";
export * from "./kyc/hooks/useAdminKyc";

// ── Vendor ─────────────────────────────────────────────────────────────────
export * from "./vendor/model/types";
export * from "./vendor/api";
export * from "./vendor/hooks/useAdminVendor";

// ── Global Platform Settings ───────────────────────────────────────────────
export * from "./global-platform-settings/api";
export * from "./global-platform-settings/hooks/useAdminSettings";

// ── Audit Logs ─────────────────────────────────────────────────────────────
export * from "./audit-logs/types/audit-log.types";
export * from "./audit-logs/api/audit-log.api";
export * from "./audit-logs/hooks/use-audit-log";
export { AuditLogViewer } from "./audit-logs/components/AuditLogViewer";

// ── Catalog ────────────────────────────────────────────────────────────────
export * from "./catalog/types";
export * from "./catalog/api";
export * from "./catalog/hooks/useAdminCatalog";
