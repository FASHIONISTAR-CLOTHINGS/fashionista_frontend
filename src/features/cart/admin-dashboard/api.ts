/**
 * @file api.ts
 * @description Isolated administrative API client for the Cart domain.
 *
 * Symmetrical to django admin cart endpoints.
 */
import { apiAdminAsync, apiAdminSync } from "@/core/api/client.admin";
import { unwrapApiData } from "@/core/api/response";
import type { AdminCart } from "./types";

interface PaginatedAdminCarts {
  count: number;
  next: string | null;
  previous: string | null;
  results: AdminCart[];
}

interface NinjaListEnvelope {
  count?: number;
  data?: unknown[];
  results?: unknown[];
  next?: string | null;
  previous?: string | null;
}

function normalizeCartList(payload: unknown): PaginatedAdminCarts {
  const unwrapped = unwrapApiData<NinjaListEnvelope | unknown[]>(payload);
  if (Array.isArray(unwrapped)) {
    return {
      count: unwrapped.length,
      next: null,
      previous: null,
      results: unwrapped as AdminCart[],
    };
  }
  const rows = Array.isArray(unwrapped?.data)
    ? unwrapped.data
    : Array.isArray(unwrapped?.results)
      ? unwrapped.results
      : [];
  return {
    count: unwrapped?.count ?? rows.length,
    next: unwrapped?.next ?? null,
    previous: unwrapped?.previous ?? null,
    results: rows as AdminCart[],
  };
}

/** Fetch all active shopping carts for administrative review. */
export async function fetchAdminCarts(
  page = 1,
  search?: string
): Promise<PaginatedAdminCarts> {
  const searchParams: Record<string, any> = { page, limit: 100 };
  if (search) searchParams.search = search;

  const data = await apiAdminAsync.get("cart/", {
    searchParams,
  }).json();

  return normalizeCartList(data);
}

/** Fetch detailed items and metrics of a single cart. */
export async function fetchAdminCartDetail(cartId: string): Promise<AdminCart> {
  const data = await apiAdminAsync.get(`cart/${cartId}/`).json();
  return unwrapApiData(data) as AdminCart;
}

/** Force clear an active cart (admin mutation). */
export async function clearAdminCart(cartId: string): Promise<void> {
  await apiAdminSync.post(`cart/${cartId}/clear/`, {});
}
