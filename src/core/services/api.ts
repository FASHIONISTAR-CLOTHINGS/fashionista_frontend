
const VENDOR_DIRECTORY_PATH = "/api/v1/ninja/vendor/directory/";
const REQUEST_TIMEOUT_MS = 3_000;

function apiBaseUrl() {
  return process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://127.0.0.1:8000";
}

function unwrapResults(payload: unknown): unknown[] {
  if (payload && typeof payload === "object" && "data" in payload) {
    return unwrapResults((payload as { data: unknown }).data);
  }

  if (payload && typeof payload === "object" && "results" in payload) {
    const results = (payload as { results: unknown }).results;
    return Array.isArray(results) ? results : [];
  }

  return Array.isArray(payload) ? payload : [];
}

function toVendorCard(row: unknown): VendorProp | null {
  if (!row || typeof row !== "object") {
    return null;
  }

  const source = row as Record<string, unknown>;
  const id = String(source.id ?? source.pk ?? source.uuid ?? "");
  const name = String(source.store_name ?? source.name ?? source.title ?? "");

  if (!id || !name) {
    return null;
  }

  const logo = String(source.logo_url ?? source.avatar_url ?? source.image_url ?? "");
  const slug = String(source.store_slug ?? source.slug ?? id);

  return {
    id,
    image: logo || "/logo.svg",
    name,
    rating: Number(source.average_rating ?? source.rating ?? 0),
    address: String(source.address ?? source.city ?? "Fashionistar marketplace"),
    mobile: String(source.mobile ?? source.phone_number ?? source.phone ?? ""),
    slug,
  };
}

/**
 * Return public marketplace vendors for the legacy `/vendors` page.
 *
 * This is a compatibility bridge for the old `@/core/services/api` import.
 * The target read surface remains `/api/v1/ninja/*`; failed or unavailable
 * backend reads return an empty list so static rendering stays resilient.
 */
export async function getAllVendors(): Promise<VendorProp[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${apiBaseUrl()}${VENDOR_DIRECTORY_PATH}`, {
      headers: {
        Accept: "application/json",
        "ngrok-skip-browser-warning": "true",
      },
      next: { revalidate: 300 },
      signal: controller.signal,
    });

    if (!response.ok) {
      return [];
    }

    return unwrapResults(await response.json())
      .map(toVendorCard)
      .filter((vendor): vendor is VendorProp => Boolean(vendor));
  } catch {
    return [];
  } finally {
    clearTimeout(timeout);
  }
}
