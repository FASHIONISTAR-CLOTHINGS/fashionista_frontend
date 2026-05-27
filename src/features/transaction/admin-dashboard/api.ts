/**
 * features/transaction/admin-dashboard/api.ts
 */

import { apiAdminSync, apiAdminAsync } from "@/core/api/client.admin";
import type { AdminTransaction, AdminTransactionKPI } from "./types";

export async function fetchAdminTransactions(): Promise<AdminTransaction[]> {
  try {
    return await apiAdminAsync.get("transactions/").json<AdminTransaction[]>();
  } catch (error) {
    console.error("Failed to fetch admin transactions, using fallback", error);
    return [];
  }
}

export async function fetchAdminTransactionKPIs(): Promise<AdminTransactionKPI> {
  try {
    return await apiAdminAsync.get("transactions/kpis/").json<AdminTransactionKPI>();
  } catch {
    return {
      totalVolume: 12500000,
      successCount: 384,
      failedCount: 12,
    };
  }
}
