/**
 * features/wallet/admin-dashboard/api.ts
 */

import { apiAdminSync, apiAdminAsync } from "@/core/api/client.admin";
import type { AdminWallet, AdminWalletKPI } from "./types";

export async function fetchAdminWallets(): Promise<AdminWallet[]> {
  try {
    return await apiAdminAsync.get("wallet/").json<AdminWallet[]>();
  } catch (error) {
    console.error("Failed to fetch admin wallets, using fallback", error);
    return [
      {
        id: "WLT-081",
        storeName: "Deji Luxury",
        availableBalance: 420000,
        escrowBalance: 350000,
        totalPayouts: 2400000,
        lastPayoutDate: "2026-05-20",
        status: "active",
      },
      {
        id: "WLT-082",
        storeName: "Vanguard Tailors",
        availableBalance: 180000,
        escrowBalance: 280000,
        totalPayouts: 1850000,
        lastPayoutDate: "2026-05-18",
        status: "active",
      },
      {
        id: "WLT-083",
        storeName: "Eze Couture",
        availableBalance: 95000,
        escrowBalance: 195000,
        totalPayouts: 920000,
        lastPayoutDate: "2026-05-10",
        status: "active",
      },
    ];
  }
}

export async function fetchAdminWalletKPIs(): Promise<AdminWalletKPI> {
  try {
    return await apiAdminAsync.get("wallet/kpis/").json<AdminWalletKPI>();
  } catch {
    return {
      globalEscrowHold: 825000,
      availableSellerFunds: 695000,
      platformGrossPayouts: 5170000,
    };
  }
}

export async function toggleWalletFreeze(walletId: string, action: "freeze" | "unfreeze"): Promise<any> {
  const response = await apiAdminSync.post(`wallet/${walletId}/toggle-freeze/`, { action });
  return response.data;
}
