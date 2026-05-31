// ─────────────────────────────────────────────────────────────────────────────
// Catalog Entity Types  (read-side, from Django-Ninja async API)
// ─────────────────────────────────────────────────────────────────────────────

export interface CatalogCategoryChild {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  sort_order: number;
  icon_class: string;
  color_hex: string;
}

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
  // v2 expanded
  meta_title?: string;
  meta_description?: string;
  sort_order?: number;
  icon_class?: string;
  color_hex?: string;
  banner_image?: string | null;
  cached_product_count?: number;
  children?: CatalogCategoryChild[];
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
  // v2 expanded
  country?: string;
  website_url?: string;
  established_year?: number | null;
  verified?: boolean;
  premium?: boolean;
  logo_banner?: string | null;
  meta_title?: string;
  meta_description?: string;
  cached_product_count?: number;
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
  // v2 expanded
  is_featured?: boolean;
  sort_order?: number;
  start_date?: string | null;
  end_date?: string | null;
  banner_cta_text?: string;
  banner_cta_url?: string;
  meta_title?: string;
  meta_description?: string;
  cached_product_count?: number;
  is_active_now?: boolean;
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
  // v2 expanded
  read_time_minutes?: number;
  author_avatar?: string | null;
  og_image?: string | null;
  canonical_url?: string;
  comment_count?: number;
  likes_count?: number;
}

export interface CatalogTag {
  id: string;
  name: string;
  slug: string;
  color_hex: string;
  is_trending: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Homepage Bundle Types
// v1: GET /api/v1/ninja/catalog/homepage/        (5 sections)
// v2: GET /api/v1/ninja/catalog/homepage/bundle/ (6 sections + banners)
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

/** Lean collection card for homepage carousel. */
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

/** Lean category card for homepage grid. */
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

/**
 * CMS-managed homepage banner card (Phase B3).
 * Included in bundle v2 and returned standalone from /homepage/banners/.
 */
export interface HomepageBannerCard {
  id: string;
  slot: "hero" | "mid" | "footer_cta";
  title: string;
  subtitle: string;
  cta_text: string;
  cta_url: string;
  image_url: string | null;
  mobile_image_url: string | null;
  sort_order: number;
}

/** Metadata counts embedded in the bundle response. */
export interface HomepageBundleMeta {
  collections_count: number;
  categories_count: number;
  products_count: number;
  hot_deals_count: number;
  reviews_count: number;
  banners_count?: number;
}

/**
 * Full homepage data bundle.
 * banners defaults to [] for v1 compatibility.
 */
export interface HomepageBundle {
  collections: HomepageCollectionCard[];
  categories: HomepageCategoryCard[];
  featured_products: HomepageProductCard[];
  hot_deals: HomepageProductCard[];
  reviews: HomepageReviewCard[];
  banners: HomepageBannerCard[];
  meta: HomepageBundleMeta;
}

// ─────────────────────────────────────────────────────────────────────────────
// Paginated list wrappers (from async_ninja_paginate)
// ─────────────────────────────────────────────────────────────────────────────

export interface PaginatedProducts {
  results: HomepageProductCard[];
  count: number;
  page: number;
  page_size: number;
}

export interface PaginatedCategories {
  results: CatalogCategory[];
  count: number;
  page: number;
  page_size: number;
}

export interface PaginatedBrands {
  results: CatalogBrand[];
  count: number;
  page: number;
  page_size: number;
}

export interface PaginatedCollections {
  results: CatalogCollection[];
  count: number;
  page: number;
  page_size: number;
}

/**
 * Lean vendor card for collection-vendor pages.
 * Returned by GET /api/v1/ninja/catalog/collections/{slug}/vendors/
 */
export interface CatalogVendorCard {
  id: string;
  store_name: string;
  store_slug: string;
  tagline: string;
  description: string;
  city: string;
  state: string;
  country: string;
  logo_url: string | null;
  is_verified: boolean;
  is_featured: boolean;
  total_products: number;
  average_rating: number;
  review_count: number;
}

export interface PaginatedVendors {
  results: CatalogVendorCard[];
  count: number;
  page: number;
  page_size: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Search result
// ─────────────────────────────────────────────────────────────────────────────

export interface CatalogSearchResult {
  categories: HomepageCategoryCard[];
  brands: CatalogBrand[];
  collections: HomepageCollectionCard[];
  query: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Filter state (mirrors Zustand catalog store)
// ─────────────────────────────────────────────────────────────────────────────

export type CatalogSortOption =
  | "newest"
  | "price_asc"
  | "price_desc"
  | "rating"
  | "popular";

export interface CatalogFilterParams {
  priceMin: number | null;
  priceMax: number | null;
  selectedSizes: string[];
  selectedColors: string[];
  selectedBrands: string[];
  sortBy: CatalogSortOption;
}
