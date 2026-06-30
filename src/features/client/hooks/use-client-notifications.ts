import {
  useMarkAllNotificationsRead as useGlobalMarkAllNotificationsRead,
  useMarkNotificationRead as useGlobalMarkNotificationRead,
  useNotifications as useGlobalNotifications,
} from "@/features/notification/hooks/use-notification";
import type { ClientNotification } from "@/features/client/types/client.types";

export function useClientNotifications(unreadOnly = false) {
  const result = useGlobalNotifications(1);
  const notifications: ClientNotification[] = (result.data ?? []).map((notification) => ({
    id: notification.id,
    type: notification.notification_type,
    title: notification.title,
    message: notification.body,
    is_read: notification.is_read,
    created_at: notification.created_at,
  }));
  const filtered = unreadOnly
    ? notifications.filter((notification) => !notification.is_read)
    : notifications;

  return {
    ...result,
    data: filtered,
    unreadCount: notifications.filter((notification) => !notification.is_read).length,
  };
}

export function useMarkNotificationRead() {
  return useGlobalMarkNotificationRead();
}

export function useMarkAllNotificationsRead() {
  return useGlobalMarkAllNotificationsRead();
}
