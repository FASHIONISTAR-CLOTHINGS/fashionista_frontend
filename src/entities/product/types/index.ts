/**
 * entities/product/types/index.ts
 * Product catalog type definitions — mirrors Django Product + Catalog models.
 * Includes 2026+ AI fields: ai_description, embedding_vector, style_tags, occasion_tags.
 */

export type ProductStatus = "draft" | "active" | "inactive" | "archived";
export type StockStatus = "in_stock" | "low_stock" | "out_of_stock" | "made_to_order";
export type ConditionStatus = "new" | "refurbished";

export interface ProductMedia {
  id: string;
  url: string;
  thumbnailUrl: string;
  mediaType: "image" | "video";
  altText: string;
  isPrimary: boolean;
  sortOrder: number;
}

export interface ProductVariant {
  id: string;
  sku: string;
  color: string | null;
  size: string | null;
  material: string | null;
  priceNgn: string;
  compareAtPriceNgn: string | null;
  stockQuantity: number;
  stockStatus: StockStatus;
  additionalImages: string[];
}

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  depth: number;
  fullPath: string;
}

export interface Product {
  id: string;
  slug: string;
  title: string;
  description: string;
  // 2026+ AI fields
  aiDescription: string | null;
  styleTags: string[];
  occasionTags: string[];
  bodyTypeFit: string[];
  sustainabilityScore: number | null;
  carbonFootprintKg: number | null;
  // Pricing
  basePriceNgn: string;
  compareAtPriceNgn: string | null;
  currency: string;
  // Meta
  status: ProductStatus;
  stockStatus: StockStatus;
  condition: ConditionStatus;
  isFeatured: boolean;
  isCustomizable: boolean;
  requiresMeasurement: boolean;
  deliveryDays: number;
  // Relations
  vendor: ProductVendorRef;
  category: ProductCategory;
  media: ProductMedia[];
  variants: ProductVariant[];
  // Analytics
  averageRating: string;
  reviewCount: number;
  totalSales: number;
  viewCount: number;
  wishlistCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductVendorRef {
  id: string;
  storeName: string;
  storeSlug: string;
  logoUrl: string | null;
  isVerified: boolean;
  averageRating: string;
  city: string;
  country: string;
}

export interface ProductListItem {
  id: string;
  slug: string;
  title: string;
  basePriceNgn: string;
  compareAtPriceNgn: string | null;
  primaryImageUrl: string | null;
  stockStatus: StockStatus;
  isFeatured: boolean;
  requiresMeasurement: boolean;
  averageRating: string;
  reviewCount: number;
  styleTags: string[];
  vendor: Pick<ProductVendorRef, "storeName" | "isVerified">;
  category: Pick<ProductCategory, "name" | "slug">;
}

export interface ProductFilters {
  search?: string;
  category?: string;
  vendor?: string;
  minPrice?: number;
  maxPrice?: number;
  status?: ProductStatus;
  stockStatus?: StockStatus;
  isFeatured?: boolean;
  requiresMeasurement?: boolean;
  styleTags?: string[];
  occasionTags?: string[];
  bodyTypeFit?: string[];
  ordering?: string;
  page?: number;
  pageSize?: number;
}

export interface PaginatedProducts {
  count: number;
  next: string | null;
  previous: string | null;
  results: ProductListItem[];
}
