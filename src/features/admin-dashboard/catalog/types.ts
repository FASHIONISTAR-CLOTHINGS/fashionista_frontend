/**
 * features/catalog/admin-dashboard/types.ts
 */

// Category model: name, active, slug, image — NO description field
export interface AdminCategory {
  id: string;
  name: string;
  slug: string;
  description?: string; // display only — not a model field, kept for UI compatibility
  active: boolean;
  created_at: string;
}

// Brand model: title, description, active, slug, image
export interface AdminBrand {
  id: string;
  title: string; // Brand model uses 'title' not 'name'
  name?: string; // alias for display compatibility
  slug: string;
  description: string;
  active: boolean;
  created_at: string;
}

// Collections model: title, sub_title, description, slug — NO active field
export interface AdminCollection {
  id: string;
  title: string; // Collections model uses 'title' not 'name'
  name?: string; // alias for display compatibility
  sub_title: string;
  slug: string;
  description: string;
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

