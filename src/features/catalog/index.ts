// ─────────────────────────────────────────────────────────────────────────────
// features/catalog/index.ts  — Barrel exports (C7 — Phase C5/C6/D4 additions)
// ─────────────────────────────────────────────────────────────────────────────

// ── Client API ───────────────────────────────────────────────────────────────
export { catalogApi } from "./api/catalog.api";
export { productCatalogApi } from "./api/product-catalog.api";
export type {
  CatalogProductCard,
  PaginatedProductsResponse,
  ViewLogPayload,
} from "./api/product-catalog.api";

// ── Server functions (RSC only) ───────────────────────────────────────────────
export {
  getCatalogBlogPostBySlug,
  getCatalogBlogPosts,
  getCatalogBrands,
  getCatalogCategories,
  getCatalogCollections,
  // Phase 11 — homepage bundle v1 (5 parallel DB reads)
  getHomepageBundle,
  // Phase B3 — homepage bundle v2 (6 parallel DB reads + banners)
  getHomepageBundleV2,
  // Phase C4 — detail + paginated server functions
  getCategoryDetail,
  getCategoryProducts,
  getBrandDetail,
  getBrandProducts,
  getCollectionDetail,
  getCollectionProducts,
  getCatalogBanners,
  getCatalogTags,
  getCatalogSearch,
} from "./api/catalog.server";

// ── Components ────────────────────────────────────────────────────────────────
export { default as CatalogBlogList } from "./components/CatalogBlogList";
export { default as CatalogCategoryGrid } from "./components/CatalogCategoryGrid";
export { default as CatalogCollectionGrid } from "./components/CatalogCollectionGrid";
// Phase C2 — extracted FeaturedProducts RSC
export { HomepageFeaturedProducts } from "./components/HomepageFeaturedProducts";
// Phase D4 — CMS-driven banner hero carousel
export { CatalogBannerHero } from "./components/CatalogBannerHero";
// Phase C5 — Trending tags horizontal scroll rail
export { CatalogTagsRail, default as CatalogTagsRailDefault } from "./components/CatalogTagsRail";
// Phase C6 — Cmd+K global search modal
export { CatalogSearchModal, default as CatalogSearchModalDefault } from "./components/CatalogSearchModal";

// ── TanStack Query Hooks (C5) ─────────────────────────────────────────────────
export {
  useCatalogBlogPosts,
  useCatalogBrands,
  useCatalogCategories,
  useCatalogCollections,
  // Phase C5 — new paginated + detail + search hooks
  useCategoryProducts,
  useBrandProducts,
  useCollectionVendors,
  useCatalogSearch,
  useCatalogTags,
  useCategoryDetail,
  useBrandDetail,
  useCollectionDetail,
} from "./hooks/use-catalog";
export {
  useCatalogProducts,
  useFeaturedProducts,
  useProductSearchSuggest,
} from "./hooks/use-catalog-products";

// ── Zustand Store (C6) ────────────────────────────────────────────────────────
export { useCatalogFilterStore } from "./store/catalog.store";

// ── Schemas + Types ───────────────────────────────────────────────────────────
export * from "./schemas/catalog.schemas";
export * from "./types/catalog.types";

// ── Admin Dashboard ───────────────────────────────────────────────────────────
