export interface AdminNotification {
  id: string;
  title: string;
  body: string;
  message_preview: string;
  target_audience: "all" | "vendors" | "clients";
  notification_type: string;
  channel: string;
  sent_at: string | null;
  created_at: string;
  failed: boolean;
  external_id: string;
  recipient_email: string | null;
}

export interface SendAnnouncementInput {
  title: string;
  message: string;
  target_audience: "all" | "vendors" | "clients";
}
