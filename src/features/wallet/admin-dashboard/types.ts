/**
 * features/wallet/admin-dashboard/types.ts
 */

export interface AdminWallet {
  id: string;
  storeName: string;
  availableBalance: number;
  escrowBalance: number;
  totalPayouts: number;
  lastPayoutDate: string;
  status: "active" | "frozen";
}

export interface AdminWalletKPI {
  globalEscrowHold: number;
  availableSellerFunds: number;
  platformGrossPayouts: number;
}
