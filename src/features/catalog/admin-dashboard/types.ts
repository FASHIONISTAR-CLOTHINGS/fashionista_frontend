/**
 * features/catalog/admin-dashboard/types.ts
 */

export interface AdminCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  active: boolean;
  created_at: string;
}

export interface AdminBrand {
  id: string;
  name: string;
  slug: string;
  description: string;
  active: boolean;
  created_at: string;
}

export interface AdminCollection {
  id: string;
  name: string;
  slug: string;
  description: string;
  active: boolean;
  created_at: string;
}

export interface AdminBlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  status: "draft" | "review" | "published" | "archived";
  tags: string[];
  is_featured: boolean;
  published_at: string | null;
  view_count: number;
  created_at: string;
}

export interface AdminDashboardKPI {
  total_users: number;
  new_users_today: number;
  active_vendors: number;
  total_products: number;
  products_pending_review: number;
  low_stock_products: number;
  total_orders: number;
  orders_today: number;
  orders_pending: number;
  pending_kyc_submissions: number;
  total_wallets: number;
  open_support_tickets: number;
  generated_at: string;
}

