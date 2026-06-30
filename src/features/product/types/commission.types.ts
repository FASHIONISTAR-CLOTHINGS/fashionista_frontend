// features/product/types/commission.types.ts
// TypeScript types for ProductCommissionSnapshot (admin only)

export interface CommissionSnapshot {
  id: string;
  product_id: string;
  commission_rate: string;
  effective_from: string;
  effective_to?: string | null;
  note: string;
  set_by_id?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface CommissionSnapshotCreatePayload {
  product_id: string;
  commission_rate: string | number;
  effective_from: string;
  effective_to?: string | null;
  note?: string;
}
