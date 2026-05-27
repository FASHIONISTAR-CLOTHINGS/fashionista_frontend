/**
 * features/support/admin-dashboard/types.ts
 */

export interface AdminTicket {
  id: string;
  subject: string;
  category: "billing" | "vendor_onboarding" | "client_sizing" | "delivery" | "technical";
  priority: "low" | "medium" | "high" | "critical";
  status: "open" | "in_progress" | "resolved" | "closed";
  user_email: string;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
}

export interface AdminSlaMetrics {
  active_tickets: number;
  breached_tickets: number;
  at_risk_tickets: number;
  average_resolution_hours: number;
}
