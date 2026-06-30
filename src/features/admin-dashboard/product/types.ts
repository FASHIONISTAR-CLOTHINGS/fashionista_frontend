/**
 * features/product/admin-dashboard/types.ts
 */

export interface AdminProduct {
  id: string;
  title: string;
  sku: string;
  category_name: string;
  price: string | number;
  old_price?: string | number;
  vendor_name: string;
  image_url?: string;
  in_stock: boolean;
  computed_avg_rating: number;
  requires_measurement: boolean;
  slug: string;
}
