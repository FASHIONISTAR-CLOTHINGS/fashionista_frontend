/**
 * features/admin-dashboard/catalog/types/index.ts
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
  status: "draft" | "published" | "archived";
  tags: string[];
  is_featured: boolean;
  published_at: string | null;
  view_count: number;
  created_at: string;
}
