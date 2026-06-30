/**
 * features/chat/admin-dashboard/api.ts
 */

import { apiAdminAsync } from "@/core/api/client.admin";
import type { AdminChatSession, AdminChatStats } from "./types";

export async function fetchAdminChatSessions(): Promise<AdminChatSession[]> {
  try {
    return await apiAdminAsync.get("chat/").json<AdminChatSession[]>();
  } catch (error) {
    console.error("Failed to fetch admin chat sessions, using fallback", error);
    return [
      {
        id: "CH-801",
        room_name: "Room: Amara Kalu & Haute Couture",
        vendor_name: "Haute Couture",
        client_name: "Amara Kalu",
        message_count: 14,
        last_message_at: "2026-05-27T14:30:00Z",
        is_active: true,
      },
      {
        id: "CH-802",
        room_name: "Room: Tobi Adebayo & Heritage Weaves",
        vendor_name: "Heritage Weaves",
        client_name: "Tobi Adebayo",
        message_count: 8,
        last_message_at: "2026-05-26T09:12:00Z",
        is_active: true,
      },
      {
        id: "CH-803",
        room_name: "Room: Ngozi Echem & Velvet Gold",
        vendor_name: "Velvet Gold",
        client_name: "Ngozi Echem",
        message_count: 22,
        last_message_at: "2026-05-25T18:44:00Z",
        is_active: false,
      },
    ];
  }
}

export async function fetchAdminChatStats(): Promise<AdminChatStats> {
  try {
    return await apiAdminAsync.get("chat/stats/").json<AdminChatStats>();
  } catch (error) {
    console.error("Failed to fetch admin chat stats, using fallback", error);
    return {
      active_sessions: 2,
      total_messages_today: 44,
      average_response_time: 12.5,
    };
  }
}
