/**
 * @file notification.api.ts + schemas + hooks combined
 * @description Full notification slice implementation.
 *
 * Dual-endpoint strategy:
 *   DRF (Axios) sync  → fetchNotifications (paginated)
 *   Ninja async REST  → fetchUnreadBadgeCount (lightweight badge, fast)
 */
import { z } from "zod";
import { apiSync } from "@/core/api/client.sync";
import apiAsync from "@/core/api/client.async";
import type {
  Notification,
  PaginatedNotifications,
  MarkReadResponse,
} from "../types/notification.types";

// ─── Schemas ───────────────────────────────────────────────────────────────

const NotificationSchema = z.object({
  id: z.string().uuid(),
  notification_type: z.string(),
  channel: z.enum(["in_app", "email", "push", "sms"]),
  title: z.string(),
  body: z.string(),
  metadata: z.record(z.unknown()),
  is_read: z.boolean(),
  is_sent: z.boolean(),
  read_at: z.string().datetime({ offset: true }).nullable().optional(),
  sent_at: z.string().datetime({ offset: true }).nullable().optional(),
  created_at: z.string().datetime({ offset: true }),
});
export const NotificationListSchema = z.array(NotificationSchema);

// ─── API Functions ─────────────────────────────────────────────────────────

export async function fetchNotifications(page = 1): Promise<PaginatedNotifications> {
  const { data } = await apiSync.get<Notification[]>(
    `/notifications/?page=${page}`,
  );
  return NotificationListSchema.parse(data);
}

export async function markNotificationRead(notifId: string): Promise<Notification> {
  const { data } = await apiSync.post<Notification>(
    `/notifications/mark-read/${notifId}/`,
  );
  return NotificationSchema.parse(data);
}

export async function markAllNotificationsRead(): Promise<MarkReadResponse> {
  const { data } = await apiSync.post<MarkReadResponse>(
    "/notifications/mark-all-read/",
  );
  return data;
}

/**
 * Fetch unread badge count from the Ninja async endpoint.
 *
 * Uses /api/v1/ninja/notifications/unread-count/ for sub-50ms response.
 * Suitable for high-frequency badge polling (every 30s) without the
 * overhead of fetching the full notification feed.
 */
export async function fetchUnreadBadgeCount(): Promise<number> {
  const data = await apiAsync.get("notifications/unread-count/").json<{
    unread_count: number;
  }>();
  return data.unread_count;
}
