/**
 * @file notification.types.ts
 * @description Canonical types for the Notification domain.
 * Source: `apps/notification/serializers/`
 */

export type NotificationChannel = "in_app" | "email" | "push" | "sms";
export type NotificationType = string;

export interface Notification {
  id: string;
  notification_type: NotificationType;
  channel: NotificationChannel;
  title: string;
  body: string;
  metadata: Record<string, unknown>;
  is_read: boolean;
  is_sent: boolean;
  read_at?: string | null;
  sent_at?: string | null;
  created_at: string;
}

export type PaginatedNotifications = Notification[];

export interface MarkReadResponse {
  marked_read: number;
}
