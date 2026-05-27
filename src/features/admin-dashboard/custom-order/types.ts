/**
 * features/custom-order/admin-dashboard/types.ts
 *
 * Types for Custom Order Admin Domain.
 */

export interface AdminMilestone {
  id: string;
  milestone_pct: number;
  amount_ngn: string | number;
  payment_status: string;
  paid_at: string | null;
  transaction_ref: string;
  payment_reference: string;
}

export interface AdminCustomOrder {
  id: string;
  reference: string;
  client_email: string;
  vendor_store_name: string;
  budget_ngn: string | number;
  agreed_amount_ngn: string | number;
  status: string;
  created_at: string;
}

export interface AdminCustomOrderDetail extends AdminCustomOrder {
  design_brief: string;
  reference_images: string[];
  product_snapshot_id: string;
  order_snapshot_id: string;
  currency: string;
  vendor_approval_note: string;
  approved_at: string | null;
  completed_at: string | null;
  milestones: AdminMilestone[];
}

export interface AdminCustomOrderFilters {
  search?: string;
  status?: string;
}
