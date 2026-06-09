/**
 * features/notification/admin-dashboard/hooks.ts
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchAdminAnnouncements, sendAdminAnnouncement } from "./api";
import { useToast } from "@/components";
import type { SendAnnouncementInput } from "./types";

export const adminNotificationKeys = {
  all: ["admin-announcements"] as const,
};

export function useAdminAnnouncements() {
  return useQuery({
    queryKey: adminNotificationKeys.all,
    queryFn: fetchAdminAnnouncements,
  });
}

export function useSendAnnouncement() {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  return useMutation({
    mutationFn: (input: SendAnnouncementInput) => sendAdminAnnouncement(input),
    onSuccess: () => {
      success("Broadcast announcement dispatched successfully.");
      queryClient.invalidateQueries({ queryKey: ["admin-announcements"] });
    },
    onError: (err: any) => {
      error(err?.message || "Failed to dispatch announcement.");
    },
  });
}
