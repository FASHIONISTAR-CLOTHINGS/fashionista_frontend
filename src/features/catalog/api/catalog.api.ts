import { apiAsync } from "@/core/api/client.async";
import { unwrapResults } from "@/core/api/response";
import {
  CatalogBrandListSchema,
  CatalogBlogPostListSchema,
  CatalogCategoryListSchema,
  CatalogCollectionListSchema,
} from "../schemas/catalog.schemas";
import type {
  CatalogBlogPost,
  CatalogBrand,
  CatalogCategory,
  CatalogCollection,
} from "../types/catalog.types";

export const catalogApi = {
  async getCategories(): Promise<CatalogCategory[]> {
    const data = await apiAsync.get("catalog/categories/").json();
    return CatalogCategoryListSchema.parse(unwrapResults<CatalogCategory>(data));
  },

  async getBrands(): Promise<CatalogBrand[]> {
    const data = await apiAsync.get("catalog/brands/").json();
    return CatalogBrandListSchema.parse(unwrapResults<CatalogBrand>(data));
  },

  async getCollections(): Promise<CatalogCollection[]> {
    const data = await apiAsync.get("catalog/collections/").json();
    return CatalogCollectionListSchema.parse(unwrapResults<CatalogCollection>(data));
  },

  async getBlogPosts(): Promise<CatalogBlogPost[]> {
    const data = await apiAsync.get("catalog/blog/").json();
    return CatalogBlogPostListSchema.parse(unwrapResults<CatalogBlogPost>(data));
  },
};
