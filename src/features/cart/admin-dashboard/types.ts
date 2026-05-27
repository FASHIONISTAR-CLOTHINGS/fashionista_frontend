/**
 * @file types.ts
 * @description Type definitions for the cart admin dashboard.
 */

export interface AdminCartItem {
  id: string;
  product_title: string;
  product_price: string;
  variant_name: string | null;
  quantity: number;
  unit_price: string;
  line_total: string;
}

export interface AdminCart {
  id: string;
  owner_email: string | null;
  session_key: string | null;
  coupon_code: string | null;
  coupon_discount: string;
  subtotal: string;
  total: string;
  last_activity: string;
  items: AdminCartItem[];
}
