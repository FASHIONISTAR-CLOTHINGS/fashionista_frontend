/**
 * features/payment/admin-dashboard/types.ts
 */

export interface AdminPaymentTransaction {
  id: string;
  clientName: string;
  amount: number;
  gateway: "stripe" | "paystack" | "wallet";
  status: "success" | "pending" | "failed";
  orderId: string;
  created_at: string;
}

export interface AdminPaymentKPI {
  volumeToday: number;
  stripeStatus: string;
  failedCheckouts: number;
}
