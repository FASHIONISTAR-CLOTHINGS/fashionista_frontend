/**
 * features/vendor/admin-dashboard/types.ts
 */

export interface AdminVendor {
  id: string;
  business_name: string;
  slug: string;
  is_approved: boolean;
  commission_rate: string | number;
  is_featured: boolean;
  user: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    is_active: boolean;
  };
  created_at: string;
}

export interface AdminVendorMetrics {
  total_vendors: number;
  active_vendors: number;
  pending_vendors: number;
  total_commission_collected: string | number;
}
