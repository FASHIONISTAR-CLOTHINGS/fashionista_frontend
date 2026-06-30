/**
 * features/admin-dashboard/authentication/types.ts
 *
 * TypeScript types mirroring the UnifiedUser backend model (source of truth).
 * Includes all Phase 12 / 2026+ scale fields.
 */

// ── Core User Entity ─────────────────────────────────────────────────────────

export interface AdminUser {
  // Identity
  id: string;
  member_id: string | null;
  email: string | null;
  phone: string | null;
  first_name: string | null;
  last_name: string | null;
  avatar: string | null;
  bio: string;

  // Auth
  role: AdminUserRole;
  auth_provider: AdminAuthProvider;
  is_active: boolean;
  is_verified: boolean;
  is_deleted: boolean;
  is_superuser: boolean;
  is_staff: boolean;

  // Location
  country: string;
  state: string;
  city: string;
  address: string;

  // Phase 12 — Locale & Preferences
  preferred_language: string;
  timezone: string;

  // Phase 12 — 2FA
  two_factor_enabled: boolean;

  // Phase 12 — Login Analytics
  login_count: number;
  last_login: string | null;
  last_login_ip: string | null;
  last_login_device: string;

  // Phase 12 — Risk & Compliance (GDPR)
  risk_score: number;
  is_processing_restricted: boolean;
  processing_restriction_reason: string;
  objected_processing_purposes: string[];
  marketing_consent: boolean;
  marketing_consent_at: string | null;
  data_retention_policy: string;

  // Phase 12 — Referral
  referral_code: string | null;
  referred_by: string | null;

  // Timestamps
  date_joined: string;
  updated_at: string;
  deleted_at: string | null;
}

export type AdminUserRole =
  | "client"
  | "vendor"
  | "staff"
  | "admin"
  | "editor"
  | "support"
  | "assistant"
  | "moderator"
  | "super_admin"
  | "super_vendor"
  | "super_client"
  | "super_staff"
  | "super_editor"
  | "super_support"
  | "super_assistant"
  | "super_moderator";

export type AdminAuthProvider = "email" | "phone" | "google";

export const ADMIN_ROLE_OPTIONS: { value: AdminUserRole; label: string }[] = [
  { value: "client", label: "Client" },
  { value: "vendor", label: "Vendor" },
  { value: "staff", label: "Staff" },
  { value: "admin", label: "Admin" },
  { value: "editor", label: "Editor" },
  { value: "support", label: "Support" },
  { value: "assistant", label: "Assistant" },
  { value: "moderator", label: "Moderator" },
  { value: "super_admin", label: "Super Admin" },
  { value: "super_vendor", label: "Super Vendor" },
  { value: "super_client", label: "Super Client" },
  { value: "super_staff", label: "Super Staff" },
  { value: "super_editor", label: "Super Editor" },
  { value: "super_support", label: "Super Support" },
  { value: "super_assistant", label: "Super Assistant" },
  { value: "super_moderator", label: "Super Moderator" },
];

// ── Session Entity (expanded) ────────────────────────────────────────────────

export interface AdminUserSession {
  id: string;
  ip_address: string | null;
  user_agent: string | null;
  device_name: string | null;
  browser_family: string | null;
  os_family: string | null;
  last_used_at: string | null;
  expires_at: string | null;
  revoked_at: string | null;
  revoked_reason: string | null;
  // legacy compat
  is_active?: boolean;
  created_at?: string;
  last_activity?: string;
}

// ── Login Event Entity (expanded) ───────────────────────────────────────────

export interface AdminLoginEvent {
  id: string;
  ip_address: string | null;
  user_agent: string | null;
  client_type: string | null;
  browser_family: string | null;
  os_family: string | null;
  device_type: string | null;
  country: string | null;
  country_code: string | null;
  region: string | null;
  city: string | null;
  auth_method: string | null;
  outcome: string | null;
  failure_reason: string | null;
  is_successful: boolean;
  risk_score: number;
  created_at: string;
  // legacy compat
  status?: string;
}

// ── Metrics ──────────────────────────────────────────────────────────────────

export interface AdminUserMetrics {
  total_users: number;
  active_users: number;
  unverified_users: number;
  vendors_count: number;
  clients_count: number;
  staff_count: number;
  admins_count: number;
  editors_count: number;
  supports_count: number;
  // Derived (may not come from API — computed on frontend)
  suspended_users?: number;
  verified_users?: number;
  new_users_today?: number;
}

// ── Pagination Envelope ───────────────────────────────────────────────────────

export interface PaginatedEnvelope<T> {
  success: boolean;
  count: number;
  results: T[];
  pages?: number;
  page?: number;
  page_size?: number;
  next?: string | null;
  previous?: string | null;
}
