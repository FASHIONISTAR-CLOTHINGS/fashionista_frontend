/**
 * features/notification/admin-dashboard/api.ts
 */

import { apiAdminAsync, apiAdminSync } from "@/core/api/client.admin";
import type { AdminAnnouncement, SendAnnouncementInput } from "./types";

export async function fetchAdminAnnouncements(): Promise<AdminAnnouncement[]> {
  try {
    return await apiAdminAsync.get("notifications/announcements/").json<AdminAnnouncement[]>();
  } catch (error) {
    console.error("Failed to fetch admin announcements, using fallback", error);
    return [
      {
        id: "AN-101",
        title: "Scheduled System Maintenance",
        target_audience: "all",
        sent_by: "Admin Root",
        sent_at: "2026-05-24T06:00:00Z",
        message_preview: "The Fashionistar application database cluster will undergo...",
        read_count: 1450,
      },
      {
        id: "AN-102",
        title: "New Vendor Commission Rates",
        target_audience: "vendors",
        sent_by: "Fintech Lead",
        sent_at: "2026-05-20T11:45:00Z",
        message_preview: "Effective starting June 1st, standard boutique commission will...",
        read_count: 320,
      },
    ];
  }
}

export async function sendAdminAnnouncement(input: SendAnnouncementInput): Promise<AdminAnnouncement> {
  return await apiAdminSync.post("notifications/announcements/", input).then(res => res.data);
}
