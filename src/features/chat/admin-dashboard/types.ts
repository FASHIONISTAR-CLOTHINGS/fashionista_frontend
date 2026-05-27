/**
 * features/chat/admin-dashboard/types.ts
 */

export interface AdminChatSession {
  id: string;
  room_name: string;
  vendor_name: string;
  client_name: string;
  message_count: number;
  last_message_at: string;
  is_active: boolean;
}

export interface AdminChatStats {
  active_sessions: number;
  total_messages_today: number;
  average_response_time: number;
}
