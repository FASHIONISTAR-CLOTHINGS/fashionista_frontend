/**
 * features/transaction/admin-dashboard/types.ts
 */

export interface AdminTransaction {
  id: string;
  reference: string;
  sender: string;
  recipient: string;
  amount: number;
  type: string;
  status: "success" | "pending" | "failed";
  timestamp: string;
}

export interface AdminTransactionKPI {
  totalVolume: number;
  successCount: number;
  failedCount: number;
}
