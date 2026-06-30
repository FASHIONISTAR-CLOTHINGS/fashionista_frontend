/**
 * features/product/admin-dashboard/api.ts
 */

import { apiAdminSync, apiAdminAsync } from "@/core/api/client.admin";
import type { AdminProduct } from "./types";

export async function fetchAdminProducts(params: {
  page?: number;
  page_size?: number;
  q?: string;
  category?: string;
}): Promise<{ count: number; results: AdminProduct[] }> {
  try {
    return await apiAdminAsync
      .get("product/", { searchParams: params as any })
      .json<{ count: number; results: AdminProduct[] }>();
  } catch (error) {
    console.error("Failed to fetch admin products, using fallback", error);
    return { count: 0, results: [] };
  }
}

export async function deleteAdminProduct(id: string): Promise<any> {
  const response = await apiAdminSync.delete(`product/${id}/delete/`);
  return response.data;
}
