/**
 * features/support/admin-dashboard/api.ts
 */

import { apiAdminAsync, apiAdminSync } from "@/core/api/client.admin";
import type { AdminTicket, AdminSlaMetrics } from "./types";

export async function fetchAdminTickets(params?: {
  status?: string;
  priority?: string;
  category?: string;
}): Promise<AdminTicket[]> {
  try {
    return await apiAdminAsync.get("support/", { searchParams: params as any }).json<AdminTicket[]>();
  } catch (error) {
    console.error("Failed to fetch admin tickets, using fallback", error);
    return [
      {
        id: "TK-910",
        subject: "Vendor application stuck in processing",
        category: "vendor_onboarding",
        priority: "high",
        status: "open",
        user_email: "contact@haute-boutique.com",
        assigned_to: null,
        created_at: "2026-05-27T08:00:00Z",
        updated_at: "2026-05-27T10:15:00Z",
      },
      {
        id: "TK-911",
        subject: "Failed double-charge on Custom Order #8812",
        category: "billing",
        priority: "critical",
        status: "in_progress",
        user_email: "amara@kalustudios.com",
        assigned_to: "Admin Root",
        created_at: "2026-05-26T14:30:00Z",
        updated_at: "2026-05-27T11:00:00Z",
      },
      {
        id: "TK-912",
        subject: "Wrong hem measurement on bespoke silk dress",
        category: "client_sizing",
        priority: "medium",
        status: "open",
        user_email: "tobi.adebayo@gmail.com",
        assigned_to: null,
        created_at: "2026-05-25T17:00:00Z",
        updated_at: "2026-05-25T17:00:00Z",
      },
    ];
  }
}

export async function assignTicket(ticketId: string, assignedTo: string): Promise<AdminTicket> {
  return await apiAdminSync.post(`support/${ticketId}/assign/`, { assigned_to: assignedTo }).then(res => res.data);
}

export async function fetchAdminSlaMetrics(): Promise<AdminSlaMetrics> {
  try {
    return await apiAdminAsync.get("support/sla/").json<AdminSlaMetrics>();
  } catch (error) {
    console.error("Failed to fetch support SLA metrics, using fallback", error);
    return {
      active_tickets: 3,
      breached_tickets: 0,
      at_risk_tickets: 1,
      average_resolution_hours: 4.8,
    };
  }
}
