/**
 * @file use-notification.ts
 * @description TanStack Query hooks for the Notification domain.
 *
 * Dual-endpoint strategy:
 *   DRF (Axios) sync REST → useNotifications (paginated feed)
 *   Ninja async REST  → useUnreadBadgeCount (lightweight badge, 30s poll)
 *
 * Future: replace badge polling with WebSocket push via Django Channels.
 */
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  fetchNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  fetchUnreadBadgeCount,
} from "../api/notification.api";
import { useNotificationWebSocket } from "./use-notification-websocket";

export const notificationKeys = {
  all:        ["notification"] as const,
  list:       (page: number) => [...notificationKeys.all, "list", page] as const,
  badgeCount: () => [...notificationKeys.all, "badge-count"] as const,
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// READ QUERIES
// ─────────────────────────────────────────────────────────────────────────────

/** Hook: paginated notification list (DRF sync endpoint). */
export function useNotifications(page = 1) {
  return useQuery({
    queryKey: notificationKeys.list(page),
    queryFn:  () => fetchNotifications(page),
    staleTime: 15_000,
    refetchInterval: 30_000,
  });
}

/**
 * Hook: lightweight unread badge count.
 *
 * Polls the Ninja async endpoint every 30s — significantly faster than
 * a full notification feed fetch. Suitable for badge in top navigation.
 *
 * When WebSocket push is added, this poll can be disabled via
 * `refetchInterval: false` and the badge updated via queryClient.setQueryData().
 */
export function useUnreadBadgeCount() {
  const { isConnected } = useNotificationWebSocket();

  return useQuery<number, Error>({
    queryKey: notificationKeys.badgeCount(),
    queryFn:  fetchUnreadBadgeCount,
    staleTime:       20_000,
    refetchInterval: isConnected ? false : 30_000,
    select: (data) => data,
  });
}

/** Hook: derived unread count (from paginated feed query, fallback). */
export function useUnreadNotificationCount() {
  const { data } = useNotifications(1);
  return (
    data?.filter((notification: { is_read: boolean }) => !notification.is_read)
      .length ?? 0
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MUTATIONS
// ─────────────────────────────────────────────────────────────────────────────

/** Mutation: mark a single notification as read. */
export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => markNotificationRead(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: notificationKeys.all });
      // Also invalidate badge count
      void qc.invalidateQueries({ queryKey: notificationKeys.badgeCount() });
    },
  });
}

/** Mutation: mark ALL notifications as read. */
export function useMarkAllNotificationsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: (res) => {
      void qc.invalidateQueries({ queryKey: notificationKeys.all });
      void qc.invalidateQueries({ queryKey: notificationKeys.badgeCount() });
      if (res.marked_read > 0) {
        toast.success(`${res.marked_read} notifications marked as read.`);
      }
    },
  });
}
