/**
 * features/admin/types/audit-log.types.ts
 *
 * Canonical TypeScript types for the compliance audit log viewer.
 *
 * Mirrors: apps/common/models/audit_log.py → AuditLog model
 *          apps/common/audit.py → AuditCategory
 *
 * Retention Policy (GDPR/CBN):
 *   financial  → permanent
 *   audit      → 7 years
 *   kyc        → 7 years
 *   auth       → 1 year
 *   support    → 3 years
 *   general    → 90 days
 *
 * Backend endpoint: GET /ninja/audit/logs/  (superadmin only)
 */

// ─────────────────────────────────────────────────────────────────────────────
// CATEGORY
// ─────────────────────────────────────────────────────────────────────────────

export type AuditCategory =
  | "financial"
  | "audit"
  | "kyc"
  | "auth"
  | "support"
  | "general";

export const AUDIT_CATEGORY_LABELS: Record<AuditCategory, string> = {
  financial: "Financial",
  audit:     "Admin Audit",
  kyc:       "KYC",
  auth:      "Authentication",
  support:   "Support",
  general:   "General",
};

export const AUDIT_CATEGORY_COLORS: Record<AuditCategory, string> = {
  financial: "bg-amber-100  text-amber-900  border-amber-200",
  audit:     "bg-purple-100 text-purple-900 border-purple-200",
  kyc:       "bg-blue-100   text-blue-900   border-blue-200",
  auth:      "bg-slate-100  text-slate-800  border-slate-200",
  support:   "bg-teal-100   text-teal-900   border-teal-200",
  general:   "bg-gray-100   text-gray-700   border-gray-200",
};

export const AUDIT_CATEGORY_RETENTION: Record<AuditCategory, string> = {
  financial: "Permanent",
  audit:     "7 years",
  kyc:       "7 years",
  auth:      "1 year",
  support:   "3 years",
  general:   "90 days",
};

// ─────────────────────────────────────────────────────────────────────────────
// AUDIT LOG ENTRY
// ─────────────────────────────────────────────────────────────────────────────

export interface AuditLogEntry {
  id:            string;     // UUID
  action:        string;     // e.g. "payment.payout.succeeded"
  category:      AuditCategory;
  actor_id:      string | null;
  actor_email:   string | null;
  actor_role:    string;
  resource_type: string;     // e.g. "Wallet"
  resource_id:   string;
  old_value:     Record<string, unknown>;
  new_value:     Record<string, unknown>;
  metadata:      Record<string, unknown>;
  ip_address:    string;
  user_agent:    string;
  created_at:    string;     // ISO 8601
}

// ─────────────────────────────────────────────────────────────────────────────
// FILTERS + PAGINATION
// ─────────────────────────────────────────────────────────────────────────────

export interface AuditLogFilters {
  category?:      AuditCategory;
  action?:        string;
  actor_email?:   string;
  resource_type?: string;
  page?:          number;
  page_size?:     number;
}

export interface AuditLogEnvelope {
  total:   number;
  page:    number;
  results: AuditLogEntry[];
}

// ─────────────────────────────────────────────────────────────────────────────
// QUERY KEY FACTORY
// ─────────────────────────────────────────────────────────────────────────────

export const auditLogKeys = {
  all:    () => ["audit-log"] as const,
  list:   (filters?: AuditLogFilters) =>
    [...auditLogKeys.all(), "list", filters ?? {}] as const,
} as const;
