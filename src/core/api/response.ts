/**
 * @file response.ts
 * @description Shared response helpers for Fashionistar API clients.
 *
 * The backend can return raw Ninja payloads or the Fashionistar envelope
 * (`{ success, message, data }`). These helpers keep feature slices small and
 * make Zod parsing consistent across canonical `/api/v1/ninja/*` reads.
 */

export type PaginatedEnvelope<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

/** Return the inner `data` payload when the custom renderer envelope is used. */
export function unwrapApiData<T = unknown>(payload: unknown): T {
  if (payload && typeof payload === "object" && "data" in payload) {
    return (payload as { data: T }).data;
  }
  return payload as T;
}

/** Return the `results` list from either raw or enveloped paginated payloads. */
export function unwrapResults<T = unknown>(payload: unknown): T[] {
  const data = unwrapApiData(payload);
  if (Array.isArray(data)) {
    return data as T[];
  }
  if (data && typeof data === "object" && "results" in data) {
    const results = (data as { results: unknown }).results;
    return Array.isArray(results) ? (results as T[]) : [];
  }
  return [];
}

/** Build stable query params without leaking empty values into cache keys. */
export function buildSearchParams(
  params: Record<string, string | number | boolean | null | undefined>,
): string {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    searchParams.set(key, String(value));
  });
  return searchParams.toString();
}
