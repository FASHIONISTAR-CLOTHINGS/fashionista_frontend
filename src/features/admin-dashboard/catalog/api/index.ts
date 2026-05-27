/**
 * features/admin-dashboard/catalog/api/index.ts
 */

import { apiAdminSync, apiAdminAsync } from "@/core/api/client.admin";
import type { AdminCategory, AdminBrand, AdminCollection, AdminBlogPost } from "../types";

// ── Categories ─────────────────────────────────────────────────────────────

export async function fetchAdminCategories(): Promise<AdminCategory[]> {
  return apiAdminAsync.get("catalog/categories/").json<AdminCategory[]>();
}

export async function createAdminCategory(data: Partial<AdminCategory>): Promise<any> {
  const response = await apiAdminSync.post("catalog/categories/create/", data);
  return response.data;
}

export async function updateAdminCategory(categoryId: string, data: Partial<AdminCategory>): Promise<any> {
  const response = await apiAdminSync.put(`catalog/categories/${categoryId}/update/`, data);
  return response.data;
}

export async function archiveAdminCategory(categoryId: string): Promise<any> {
  const response = await apiAdminSync.post(`catalog/categories/${categoryId}/archive/`);
  return response.data;
}

// ── Brands ─────────────────────────────────────────────────────────────────

export async function fetchAdminBrands(): Promise<AdminBrand[]> {
  return apiAdminAsync.get("catalog/brands/").json<AdminBrand[]>();
}

export async function createAdminBrand(data: Partial<AdminBrand>): Promise<any> {
  const response = await apiAdminSync.post("catalog/brands/create/", data);
  return response.data;
}

export async function updateAdminBrand(brandId: string, data: Partial<AdminBrand>): Promise<any> {
  const response = await apiAdminSync.put(`catalog/brands/${brandId}/update/`, data);
  return response.data;
}

export async function archiveAdminBrand(brandId: string): Promise<any> {
  const response = await apiAdminSync.post(`catalog/brands/${brandId}/archive/`);
  return response.data;
}

// ── Collections ────────────────────────────────────────────────────────────

export async function fetchAdminCollections(): Promise<AdminCollection[]> {
  return apiAdminAsync.get("catalog/collections/").json<AdminCollection[]>();
}

export async function createAdminCollection(data: Partial<AdminCollection>): Promise<any> {
  const response = await apiAdminSync.post("catalog/collections/create/", data);
  return response.data;
}

export async function updateAdminCollection(collectionId: string, data: Partial<AdminCollection>): Promise<any> {
  const response = await apiAdminSync.put(`catalog/collections/${collectionId}/update/`, data);
  return response.data;
}

export async function archiveAdminCollection(collectionId: string): Promise<any> {
  const response = await apiAdminSync.post(`catalog/collections/${collectionId}/archive/`);
  return response.data;
}

// ── Blog Posts ─────────────────────────────────────────────────────────────

export async function fetchAdminBlogPosts(): Promise<AdminBlogPost[]> {
  return apiAdminAsync.get("catalog/blog/").json<AdminBlogPost[]>();
}

export async function createAdminBlogPost(data: Partial<AdminBlogPost>): Promise<any> {
  const response = await apiAdminSync.post("catalog/blog/create/", data);
  return response.data;
}

export async function updateAdminBlogPost(postId: string, data: Partial<AdminBlogPost>): Promise<any> {
  const response = await apiAdminSync.put(`catalog/blog/${postId}/update/`, data);
  return response.data;
}

export async function archiveAdminBlogPost(postId: string): Promise<any> {
  const response = await apiAdminSync.post(`catalog/blog/${postId}/archive/`);
  return response.data;
}
