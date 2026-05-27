/**
 * features/settings/admin-dashboard/api.ts
 */

import { apiAdminSync, apiAdminAsync } from "@/core/api/client.admin";

export interface GlobalSettings {
  id?: string;
  maintenance_mode?: boolean;
  allow_vendor_registration?: boolean;
  min_payout_amount?: string | number;
  platform_commission_rate?: string | number;
  kyc_required_for_vendors?: boolean;
  kyc_required_for_clients?: boolean;
}

export async function fetchGlobalSettings(): Promise<GlobalSettings> {
  return apiAdminAsync.get("settings/").json<GlobalSettings>();
}

export async function updateGlobalSettings(data: GlobalSettings): Promise<any> {
  const response = await apiAdminSync.post("settings/update/", data);
  return response.data;
}
