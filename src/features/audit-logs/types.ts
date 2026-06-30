/**
 * src/features/audit-logs/types.ts
 *
 * TypeScript type schemas synced with the Fashionistar backend audit domain.
 * These types mirror:
 *   - apps/audit_logs/models.py  (EventType, EventCategory, SeverityLevel)
 *   - apps/audit_logs/models.py  (AuditEventLog fields)
 *
 * IMPORTANT: Keep in sync with backend EventType and EventCategory choices.
 * Last synced: 2026-05-10 (Wave G finalization)
 */

// ─── Severity ─────────────────────────────────────────────────────────────────

export type AuditSeverityLevel =
  | "debug"
  | "info"
  | "warning"
  | "error"
  | "critical";

// ─── Event Categories ─────────────────────────────────────────────────────────

export type AuditEventCategory =
  | "authentication"
  | "authorization"
  | "account"
  | "profile"
  | "security"
  | "admin"
  | "data_access"
  | "data_modification"
  | "system"
  | "notification"
  | "compliance"
  | "order"
  | "payment"
  | "cart"
  | "measurement"
  | "wallet"
  | "kyc"
  | "vendor"
  | "catalog"
  | "support"
  | "chat"
  | "transactions"
  | "provider"
  | "client"
  | "settings";

// ─── Event Types ──────────────────────────────────────────────────────────────

export type AuditEventType =
  // Authentication
  | "login_success"
  | "login_failed"
  | "login_blocked"
  | "logout"
  | "token_refreshed"
  | "google_login"
  | "register_success"
  | "register_failed"
  | "user_registered"
  | "registration_failed"
  // Account/Profile
  | "account_created"
  | "account_updated"
  | "account_soft_deleted"
  | "account_restored"
  | "account_hard_deleted"
  | "email_verified"
  | "phone_verified"
  | "avatar_uploaded"
  | "avatar_cloudinary"
  // Security
  | "password_changed"
  | "password_reset_request"
  | "password_reset_done"
  | "mfa_enabled"
  | "mfa_disabled"
  | "suspicious_activity"
  | "ip_blocked"
  | "failed_logins_exceeded"
  // Admin
  | "admin_action"
  | "admin_bulk_export"
  | "admin_bulk_import"
  | "admin_bulk_delete"
  | "settings_changed"
  // Data Access
  | "data_viewed"
  | "data_exported"
  | "sensitive_data_access"
  // Orders
  | "order_created"
  | "order_updated"
  | "order_cancelled"
  | "order_fulfilled"
  | "order_returned"
  // Payments
  | "payment_initiated"
  | "payment_success"
  | "payment_failed"
  | "refund_initiated"
  | "refund_completed"
  | "dispute_opened"
  | "dispute_resolved"
  // Cart
  | "cart_updated"
  | "cart_item_added"
  | "cart_item_removed"
  | "checkout_initiated"
  | "checkout_started"
  | "checkout_completed"
  | "checkout_abandoned"
  | "coupon_applied"
  // Measurements
  | "measurement_created"
  | "measurement_updated"
  | "measurement_deleted"
  | "ai_analysis_started"
  | "ai_analysis_completed"
  | "ai_analysis_failed"
  // Wallet
  | "wallet_topup"
  | "wallet_withdrawal"
  | "wallet_withdrawal_requested"
  | "wallet_escrow_hold"
  | "wallet_escrow_release"
  | "wallet_escrow_refunded"
  | "wallet_created"
  | "wallet_pin_set"
  | "wallet_pin_changed"
  | "wallet_transfer"
  // KYC
  | "kyc_submitted"
  | "kyc_verified"
  | "kyc_approved"
  | "kyc_rejected"
  | "kyc_document_uploaded"
  | "kyc_webhook"
  | "kyc_retry"
  | "bvn_verified"
  | "nin_verified"
  // Vendor
  | "vendor_registered"
  | "vendor_provisioned"
  | "vendor_profile_updated"
  | "vendor_kyc_gate_passed"
  | "vendor_commission_changed"
  | "vendor_suspended"
  | "vendor_restored"
  // Catalog/Products
  | "product_created"
  | "product_updated"
  | "product_deleted"
  | "product_published"
  | "product_unpublished"
  | "review_created"
  | "review_posted"
  | "review_flagged"
  | "cloudinary_webhook"
  // Support
  | "ticket_created"
  | "ticket_escalated"
  | "ticket_resolved"
  | "ticket_closed"
  | "sla_breach"
  // Chat
  | "chat_started"
  | "chat_message_flagged"
  | "conversation_started"
  | "message_sent"
  | "message_deleted"
  | "websocket_connected"
  | "websocket_disconnected"
  // Transactions
  | "ledger_entry_created"
  | "commission_calculated"
  | "payout_initiated"
  | "payout_success"
  | "payout_failed"
  | "transaction_created"
  // Provider
  | "provider_config_changed"
  | "provider_webhook_received"
  | "provider_webhook_failed"
  | "provider_health_check"
  | "provider_switched"
  | "circuit_breaker_opened"
  | "circuit_breaker_closed"
  // Client
  | "client_registered"
  | "client_address_added"
  | "client_measurement_linked"
  // Notifications
  | "notification_sent"
  | "notification_failed"
  // Settings
  | "settings_updated"
  | "feature_flag_changed"
  // System
  | "system_error"
  | "api_call"
  | "webhook_received"
  | "celery_task_failed";

// ─── Audit Event Log ──────────────────────────────────────────────────────────

/**
 * Read-only shape of a single AuditEventLog record as returned by the
 * `/api/v1/audit/events/` endpoint.
 *
 * Fields marked `null | undefined` can be omitted from the server response.
 */
export interface AuditEventLog {
  id: string; // UUIDv7
  event_type: AuditEventType;
  event_category: AuditEventCategory;
  severity: AuditSeverityLevel;
  action: string;

  // Actor
  actor: string | null; // UnifiedUser PK (UUID)
  actor_email: string | null;
  actor_role: string | null;
  session_id: string | null; // JWT jti

  // Request context
  ip_address: string | null;
  user_agent: string | null;
  device_type: "desktop" | "mobile" | "tablet" | "api" | "unknown" | null;
  browser_family: string | null;
  os_family: string | null;
  country: string | null;
  country_code: string | null;
  city: string | null;

  // Correlation
  correlation_id: string | null;

  // Resource
  resource_type: string | null;
  resource_id: string | null;

  // HTTP context
  request_method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | null;
  request_path: string | null;
  response_status: number | null;
  duration_ms: number | null;

  // Diff
  old_values: Record<string, unknown> | null;
  new_values: Record<string, unknown> | null;
  metadata: Record<string, unknown> | null;

  // Error
  error_message: string | null;

  // Compliance
  is_compliance: boolean;
  retention_days: number;

  // Timestamp (ISO 8601)
  created_at: string;
}

// ─── Pagination wrapper ───────────────────────────────────────────────────────

export interface PaginatedAuditEvents {
  count: number;
  next: string | null;
  previous: string | null;
  results: AuditEventLog[];
}

// ─── Filters ──────────────────────────────────────────────────────────────────

export interface AuditEventFilters {
  event_type?: AuditEventType;
  event_category?: AuditEventCategory;
  severity?: AuditSeverityLevel;
  actor?: string; // UUID
  actor_email?: string;
  is_compliance?: boolean;
  from_date?: string; // ISO 8601
  to_date?: string;   // ISO 8601
  page?: number;
  page_size?: number;
}
