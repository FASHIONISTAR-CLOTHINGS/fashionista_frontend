// features/client/hooks/use-client-notifications.ts
/**
 * TanStack Query hooks for client notifications.
 *
 * Polling every 30 seconds for real-time-like notification updates.
 * Architecture: /api/v1/ninja/client/notifications/
 *
 * Usage:
 *   const { data: notifications, unreadCount } = useClientNotifications();
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { clientApi } from "@/features/client/api/client.api";
import type { ClientNotification } from "@/features/client/types/client.types";

export const clientNotificationKeys = {
  all:    ["client", "notifications"] as const,
  unread: ["client", "notifications", "unread"] as const,
};

export function useClientNotifications(unreadOnly = false) {
  const result = useQuery<ClientNotification[]>({
    queryKey:        unreadOnly ? clientNotificationKeys.unread : clientNotificationKeys.all,
    queryFn:         () => clientApi.getNotifications(unreadOnly),
    staleTime:       30_000,
    refetchInterval: 30_000,  // Poll every 30 seconds
    retry:           false,   // Don't retry on 401 (handles unauthenticated gracefully)
  });

  const unreadCount = (result.data ?? []).filter((n) => !n.is_read).length;

  return { ...result, unreadCount };
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => clientApi.markNotificationRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clientNotificationKeys.all });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => clientApi.markAllNotificationsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clientNotificationKeys.all });
    },
  });
}
