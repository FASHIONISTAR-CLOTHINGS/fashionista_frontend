/**
 * @file payment.types.ts
 * @description Payment provider contracts for Fashionistar.
 */

export type PaymentPurpose =
  | "wallet_topup"
  | "order_payment"
  | "measurement_fee"
  | "vendor_service"
  | "advertisement_fee";

export type PaymentIntentStatus =
  | "pending"
  | "initialized"
  | "succeeded"
  | "failed"
  | "cancelled";

export type PaymentProvider = "wallet" | "paystack" | "flutterwave" | "olive_pay";
export type CashPaymentMode = "disabled" | "cod" | "pay_at_shop" | "both";
export type OrderPaymentPath = "wallet" | "gateway" | "cod" | "pay_at_shop";

export interface PaymentIntent {
  id: string;
  provider: PaymentProvider;
  purpose: PaymentPurpose;
  amount: string;
  currency: string;
  status: PaymentIntentStatus;
  reference: string;
  authorization_url: string;
  access_code: string;
  order_id: string;
  created_at?: string;
}

export interface InitializePaymentInput {
  amount: string;
  purpose: PaymentPurpose;
  email?: string;
  order_id?: string;
  metadata?: Record<string, unknown>;
}

export interface WalletFundPaymentInput {
  order_id?: string;
  amount?: string;
  purpose: PaymentPurpose;
  provider: PaymentProvider;
  currency?: string;
  selected_percent?: number;
  cash_payment_mode?: CashPaymentMode;
  payment_path?: OrderPaymentPath;
  metadata?: Record<string, unknown>;
}

export interface WalletFundPaymentResponse {
  intent: PaymentIntent;
  order_id?: string;
  payment_record_id?: string;
  authorization_url: string;
}

export interface BankOption {
  name: string;
  code: string;
  country?: string;
}

export interface TransferRecipientInput {
  account_number: string;
  bank_code: string;
  account_name: string;
  bank_name: string;
}

// ── Ninja Async Dashboard Types ───────────────────────────────────────────────

/**
 * Aggregate stats from GET /api/v1/ninja/payments/summary/
 * Delegates to PaymentIntent.aget_summary_for_user()
 */
export interface PaymentSummary {
  total_count: number;
  pending_count: number;
  succeeded_total: string;
}

/**
 * Full dashboard from GET /api/v1/ninja/payments/dashboard/
 * Combines summary stats + 5 most recent payment intents.
 */
export interface PaymentDashboard extends PaymentSummary {
  recent_intents: PaymentIntent[];
}

/**
 * Payment history list from GET /api/v1/ninja/payments/history/?limit=N
 */
export interface NinjaPaymentHistory {
  data: PaymentIntent[];
  count: number;
}
