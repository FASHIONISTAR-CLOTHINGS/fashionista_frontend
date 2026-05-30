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

// ─────────────────────────────────────────────────────────────────────────────
// Phase 11 — Homepage Bundle Types
// Returned by GET /api/v1/ninja/catalog/homepage/
// ─────────────────────────────────────────────────────────────────────────────

/** Lean product card for homepage sections (featured + hot deals). */
export interface HomepageProductCard {
  id: string;
  title: string;
  slug: string;
  sku: string;
  price: string;
  old_price: string | null;
  discount_percentage: number;
  currency: string;
  image_url: string | null;
  in_stock: boolean;
  stock_qty: number;
  featured: boolean;
  hot_deal: boolean;
  digital: boolean;
  rating: number;
  review_count: number;
  computed_review_count: number;
  computed_avg_rating: number;
  category_name: string | null;
  category_slug: string | null;
  vendor_name: string;
  vendor_slug: string | null;
  requires_measurement: boolean;
  is_customisable: boolean;
  sizes: { id: string; name: string }[];
  colors: { id: string; name: string; hex_code: string }[];
  created_at: string | null;
}

/** Public review card for homepage social proof section. */
export interface HomepageReviewCard {
  id: string;
  reviewer_name: string;
  reviewer_avatar_url: string | null;
  product_title: string | null;
  product_slug: string | null;
  rating: number;
  review_text: string;
  helpful_votes: number;
  created_at: string | null;
}

/** Lean collection card for homepage carousel (from .values() dict). */
export interface HomepageCollectionCard {
  id: string;
  name: string;
  title: string;
  slug: string;
  sub_title: string;
  description: string;
  image: string | null;
  image_url: string;
  background_image: string | null;
  background_image_url: string;
  created_at: string | null;
}

/** Lean category card for homepage grid (from .values() dict). */
export interface HomepageCategoryCard {
  id: string;
  name: string;
  title: string;
  slug: string;
  image: string | null;
  image_url: string;
  active: boolean;
  created_at: string | null;
}

/** Metadata counts embedded in the bundle response. */
export interface HomepageBundleMeta {
  collections_count: number;
  categories_count: number;
  products_count: number;
  hot_deals_count: number;
  reviews_count: number;
}

/**
 * Full homepage data bundle — returned by GET /api/v1/ninja/catalog/homepage/
 * Replaces the previous approach of 5 separate client-side fetches.
 */
export interface HomepageBundle {
  collections: HomepageCollectionCard[];
  categories: HomepageCategoryCard[];
  featured_products: HomepageProductCard[];
  hot_deals: HomepageProductCard[];
  reviews: HomepageReviewCard[];
  meta: HomepageBundleMeta;
}
