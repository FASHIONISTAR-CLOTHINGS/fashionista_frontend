/**
 * features/admin/vendor/model/types.ts
 */

export interface AdminVendor {
  id: string;
  store_name: string;
  store_slug: string;
  tagline: string;
  description: string;
  country: string;
  city: string;
  state: string;
  address: string;
  is_verified: boolean;
  is_active: boolean;
  is_featured: boolean;
  is_deleted: boolean;
  total_products: number;
  total_sales: number;
  total_revenue: number;
  average_rating: number;
  review_count: number;
  wallet_balance: number;
  cash_payment_mode: boolean;
  instagram_url: string;
  tiktok_url: string;
  twitter_url: string;
  website_url: string;
  whatsapp: string;
  user_email: string | null;
  user_member_id: string | null;
  setup_complete: boolean;
  payout_verified: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface AdminVendorMetrics {
  total_vendors: number;
  active_vendors: number;
  suspended_vendors: number;
  pending_approval: number;
  new_vendors_today: number;
}
