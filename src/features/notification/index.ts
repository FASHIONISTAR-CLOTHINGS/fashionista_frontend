/**
 * @file index.ts
 * @description Public API for the `features/notification` canonical FSD slice.
 */
export type {
  Notification,
  PaginatedNotifications,
  MarkReadResponse,
  NotificationType,
  NotificationChannel,
} from "./types/notification.types";

export {
  fetchNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  fetchUnreadBadgeCount,
} from "./api/notification.api";

export {
  notificationKeys,
  useNotifications,
  useUnreadNotificationCount,
  useUnreadBadgeCount,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
} from "./hooks/use-notification";

export {
  useNotificationWebSocket,
} from "./hooks/use-notification-websocket";
