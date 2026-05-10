export interface CatalogCategory {
  id: string;
  name: string;
  title: string;
  slug: string;
  image: string | null;
  image_url: string;
  cloudinary_url: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CatalogBrand {
  id: string;
  name: string;
  title: string;
  slug: string;
  description: string;
  image: string | null;
  image_url: string;
  cloudinary_url: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CatalogCollection {
  id: string;
  name: string;
  title: string;
  slug: string;
  sub_title: string;
  description: string;
  image: string | null;
  image_url: string;
  cloudinary_url: string | null;
  background_image: string | null;
  background_image_url: string;
  background_cloudinary_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface CatalogBlogPost {
  id: string;
  author: string | null;
  author_name: string;
  category: string | null;
  category_name: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image: string | null;
  featured_image_cloudinary_url: string | null;
  image_url: string;
  status: "draft" | "review" | "published" | "archived";
  tags: string[];
  seo_title: string;
  seo_description: string;
  is_featured: boolean;
  published_at: string | null;
  view_count: number;
  created_at: string;
  updated_at: string;
}
