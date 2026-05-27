/**
 * features/custom-order/admin-dashboard/api.ts
 */

import { apiAdminAsync, apiAdminSync } from "@/core/api/client.admin";
import { unwrapApiData } from "@/core/api/response";
import type { AdminCustomOrder, AdminCustomOrderDetail, AdminCustomOrderFilters } from "./types";

export async function fetchAdminCustomOrders(params?: AdminCustomOrderFilters): Promise<AdminCustomOrder[]> {
  const searchParams: Record<string, any> = {};
  if (params?.search) searchParams.search = params.search;
  if (params?.status) searchParams.status = params.status;

  const data = await apiAdminAsync.get("custom-order/", { searchParams }).json();
  return unwrapApiData<AdminCustomOrder[]>(data);
}

export async function fetchAdminCustomOrderDetail(id: string): Promise<AdminCustomOrderDetail> {
  const data = await apiAdminAsync.get(`custom-order/${id}/`).json();
  return unwrapApiData<AdminCustomOrderDetail>(data);
}

export async function updateAdminCustomOrderStatus(
  id: string,
  status: string,
  reason = ""
): Promise<{ success: boolean; id: string; status: string }> {
  return await apiAdminSync
    .post(`custom-order/${id}/status/`, { status, reason })
    .then(res => res.data);
}
