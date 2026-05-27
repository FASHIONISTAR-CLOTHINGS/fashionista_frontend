/**
 * features/notification/admin-dashboard/types.ts
 */

export interface AdminAnnouncement {
  id: string;
  title: string;
  target_audience: "all" | "vendors" | "clients";
  sent_by: string;
  sent_at: string;
  message_preview: string;
  read_count: number;
}

export interface SendAnnouncementInput {
  title: string;
  message: string;
  target_audience: "all" | "vendors" | "clients";
}
