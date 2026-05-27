/**
 * features/admin/catalog/api/index.ts
 */

import { apiAdminSync, apiAdminAsync } from "@/core/api/client.admin";

export interface AdminCategory {
  id: string;
  title: string;
  slug: string;
  description: string;
  is_active: boolean;
}

export interface AdminBrand {
  id: string;
  name: string;
  slug: string;
  description: string;
  is_active: boolean;
}

export interface AdminCollection {
  id: string;
  title: string;
  slug: string;
  description: string;
  is_active: boolean;
}

export async function fetchAdminCategories(): Promise<AdminCategory[]> {
  return apiAdminAsync.get("catalog/categories/").json<AdminCategory[]>();
}

export async function fetchAdminBrands(): Promise<AdminBrand[]> {
  return apiAdminAsync.get("catalog/brands/").json<AdminBrand[]>();
}

export async function fetchAdminCollections(): Promise<AdminCollection[]> {
  return apiAdminAsync.get("catalog/collections/").json<AdminCollection[]>();
}

// ── Mutations ────────────────────────────────────────────────────────────────

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
