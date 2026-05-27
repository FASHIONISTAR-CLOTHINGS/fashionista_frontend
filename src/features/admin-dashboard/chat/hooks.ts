/**
 * features/chat/admin-dashboard/hooks.ts
 */

import { useQuery } from "@tanstack/react-query";
import { fetchAdminChatSessions, fetchAdminChatStats } from "./api";

export const adminChatKeys = {
  all: ["admin-chat-sessions"] as const,
  stats: ["admin-chat-stats"] as const,
};

export function useAdminChatSessions() {
  return useQuery({
    queryKey: adminChatKeys.all,
    queryFn: fetchAdminChatSessions,
  });
}

export function useAdminChatStats() {
  return useQuery({
    queryKey: adminChatKeys.stats,
    queryFn: fetchAdminChatStats,
  });
}
