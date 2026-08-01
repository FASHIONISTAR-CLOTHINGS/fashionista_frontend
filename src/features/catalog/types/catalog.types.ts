/// ───────────────────────────────────────────────────────────────────────────────
// Catalog Entity Types  (read-side, from Django-Ninja async API)
//
// Single source of truth: these interfaces mirror the backend Django models
// and Ninja schemas in apps/catalog/schemas/catalog_schemas.py.
//
// Taxonomy rule:
//   CATEGORIES → for products  (a product belongs to 1–15 categories)
//   COLLECTIONS → for vendors  (a vendor joins collections it specialises in)
//
// APEX v4 enrichment (2026-Q3):
//   HomepageProductCard: +cloudinary_url, +gender_target, +age_group,
//     +condition, +is_pre_order, +orders_count, +views
//   HomepageCategoryCard: +cloudinary_url, +active (replaces is_deleted)
//   HomepageCollectionCard: +cloudinary_url
//   HomepageBundleMeta: +banners_count, +trending_count, +vendors_count
//   HomepageBundleOut: +banners, +trending_products, +vendors
//   HomepageVendorCard: NEW — vendor spotlight card for bundle v4
// ───────────────────────────────────────────────────────────────────────────────

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
  /** Number of distinct vendors with products in this collection */
  vendor_count?: number;
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
// v2: GET /api/v1/ninja/catalog/homepage/bundle/ (6 sections + banners)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Lean product card for homepage sections (featured + hot deals).
 *
 * Image priority:
 *   1. cloudinary_url — CDN-optimised WebP/AVIF at card dimensions (w_480)
 *   2. image_url — raw backend URL (fallback)
 *
 * Demographic signals (for badge display):
 *   gender_target: '' | 'men' | 'women' | 'unisex' | 'boys' | 'girls' | 'kids'
 *   age_group:     '' | 'adult' | 'teen' | 'child' | 'toddler' | 'infant'
 *   condition:     'new' | 'used' | 'refurbished'
 *
 * Social proof signals:
 *   orders_count: total fulfilled orders (shown as "X sold")
 *   views:        product page views (trending signal)
 */
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
  /** Cloudinary card-optimised URL (w_480,h_480,c_fill). Primary image src. */
  cloudinary_url: string | null;
  in_stock: boolean;
  stock_qty: number;
  featured: boolean;
  hot_deal: boolean;
  rating: number;
  review_count: number;
  computed_review_count: number;
  computed_avg_rating: number;
  category_name: string | null;
  category_slug: string | null;
  /** vendor_name — alias: store_name (Zod transform adds store_name too) */
  vendor_name: string;
  vendor_slug: string | null;
  /** Zod transform alias for vendor_name */
  store_name: string;
  /** Zod transform alias for vendor_slug */
  store_slug: string | null;
  requires_measurement: boolean;
  is_customisable: boolean;
  // Demographic & discovery signals
  gender_target: string;
  age_group: string;
  condition: string;
  is_pre_order: boolean;
  // Social proof signals
  orders_count: number;
  views: number;
  /** AI trend score from backend (0–1 float). Used by TabbedFeaturedProducts trending tab. */
  ai_trend_score?: number;
  discount_countdown?: string | null;
  sizes?: { id: string; name: string }[];
  colors?: { id: string; name: string; hex_code: string }[];
  created_at?: string | null;
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

/**
 * Lean collection card for homepage carousel.
 * Collections are for VENDORS — vendors join collections they specialise in.
 */
export interface HomepageCollectionCard {
  id: string;
  name: string;
  title: string;
  slug: string;
  sub_title: string;
  description: string;
  image: string | null;
  image_url: string;
  /** Cloudinary-optimised collection hero image. */
  cloudinary_url: string | null;
  background_image: string | null;
  background_image_url: string;
  created_at: string | null;
}

/**
 * Lean category card for homepage grid.
 * Categories are for PRODUCTS — a product belongs to 1–15 categories.
 */
export interface HomepageCategoryCard {
  id: string;
  name: string;
  title: string;
  slug: string;
  image: string | null;
  image_url: string;
  /** Cloudinary-optimised category tile image. */
  cloudinary_url: string | null;
  /** Whether the category is publicly visible. Always true for homepage cards. */
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

/**
 * Vendor spotlight card for homepage featured vendors section.
 *
 * Returned as "vendors" array in the consolidated homepage bundle.
 */
export interface HomepageVendorCard {
  id: string;
  store_name: string;
  store_slug: string;
  tagline: string;
  /** Cloudinary circular-crop URL w_200,h_200,c_fill,f_auto,q_auto */
  logo_url: string | null;
  city: string;
  is_verified: boolean;
  average_rating: number;
  review_count: number;
  total_products: number;
}

/** Lean blog post card for homepage blog section (consolidated bundle). */
export interface HomepageBlogPostCard {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  image: string | null;
  image_url: string | null;
  cloudinary_url: string | null;
  is_featured: boolean;
  published_at: string | null;
  view_count: number;
  author_name: string;
  category_name: string;
  created_at: string | null;
}

/** Platform aggregate counts for homepage campaign banner. */
export interface HomepagePlatformStats {
  products_count: number;
  categories_count: number;
  collections_count: number;
  vendors_count: number;
  reviews_count: number;
}

/** Trending tag for homepage tags rail. */
export interface HomepageTrendingTag {
  id: string;
  name: string;
  slug: string;
  color_hex: string;
  is_trending: boolean;
}

/** Metadata counts embedded in the bundle response (consolidated 12-section). */
export interface HomepageBundleMeta {
  collections_count: number;
  categories_count: number;
  products_count: number;
  hot_deals_count: number;
  reviews_count: number;
  banners_count: number;
  trending_count: number;
  vendors_count: number;
  blog_count: number;
  tags_count: number;
  deals_of_week_count: number;
  new_arrivals_count: number;
  gather_ms: number;
}

/**
 * Full homepage data bundle (consolidated — 12 sections via single asyncio.gather).
 * Single RSC fetch from /api/v1/ninja/catalog/homepage/
 * ISR: revalidate 300s, tagged "homepage-bundle".
 *
 * 12 concurrent DB queries via asyncio.gather(return_exceptions=True):
 *   - collections: vendor collections carousel
 *   - categories: shop-by-category grid
 *   - featured_products: admin-featured products grid
 *   - hot_deals: discounted products
 *   - reviews: customer review cards
 *   - banners: hero slot CMS banners
 *   - trending_products: AI trend-scored products rail
 *   - vendors: verified vendor spotlight
 *   - blog_posts: featured editorial posts
 *   - trending_tags: trending taxonomy tags
 *   - deals_of_the_week: steep-discount deals with countdown
 *   - new_arrivals: newest products rail
 */
export interface HomepageBundle {
  collections: HomepageCollectionCard[];
  categories: HomepageCategoryCard[];
  featured_products: HomepageProductCard[];
  hot_deals: HomepageProductCard[];
  reviews: HomepageReviewCard[];
  banners: HomepageBannerCard[];
  trending_products: HomepageProductCard[];
  vendors: HomepageVendorCard[];
  blog_posts: HomepageBlogPostCard[];
  trending_tags: HomepageTrendingTag[];
  deals_of_the_week: HomepageProductCard[];
  new_arrivals: HomepageProductCard[];
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
