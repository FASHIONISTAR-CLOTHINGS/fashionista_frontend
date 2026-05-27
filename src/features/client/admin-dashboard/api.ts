/**
 * features/client/admin-dashboard/api.ts
 */

import { apiAdminSync, apiAdminAsync } from "@/core/api/client.admin";

export interface AdminClient {
  id: string;
  user_email?: string;
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  is_active: boolean;
  created_at: string;
}

export async function fetchAdminClients(): Promise<AdminClient[]> {
  return apiAdminAsync.get("client/").json<AdminClient[]>();
}

export async function updateAdminClient(clientId: string, data: Partial<AdminClient>): Promise<any> {
  const response = await apiAdminSync.patch(`client/${clientId}/`, data);
  return response.data;
}
