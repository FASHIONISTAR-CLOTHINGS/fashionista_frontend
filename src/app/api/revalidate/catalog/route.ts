/**
 * app/api/revalidate/catalog/route.ts — Phase H3
 *
 * Next.js On-Demand Revalidation Route
 *
 * Called by the Django backend after a catalog admin action or cache invalidation
 * to purge the Next.js ISR edge cache for homepage bundle and related tags.
 *
 * Security:
 *   - Requires `x-revalidate-secret` header matching REVALIDATE_SECRET env var.
 *   - Returns 401 on invalid secret.
 *
 * Usage from Django backend (via ProviderAsyncHTTPClient):
 *   POST /api/revalidate/catalog/
 *   Headers: { "x-revalidate-secret": "<REVALIDATE_SECRET>" }
 *   Body: { "tag": "homepage-bundle" }
 *      or { "path": "/" }
 *      or { "tag": "categories", "path": "/categories" }
 *
 * Environment:
 *   REVALIDATE_SECRET — shared secret (set in Vercel env + Django REVALIDATE_SECRET)
 */

import { revalidateTag, revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

interface RevalidateBody {
  tag?: string;
  path?: string;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  // ── Auth ────────────────────────────────────────────────────────────────
  const secret = request.headers.get("x-revalidate-secret");
  const expected = process.env.REVALIDATE_SECRET;

  if (!expected) {
    console.error("[revalidate/catalog] REVALIDATE_SECRET env var not set!");
    return NextResponse.json(
      { error: "Server misconfiguration: missing REVALIDATE_SECRET" },
      { status: 500 }
    );
  }

  if (!secret || secret !== expected) {
    return NextResponse.json({ error: "Invalid revalidation secret." }, { status: 401 });
  }

  // ── Parse body ───────────────────────────────────────────────────────────
  let body: RevalidateBody = {};
  try {
    body = (await request.json()) as RevalidateBody;
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body. Expected { tag?, path? }" },
      { status: 400 }
    );
  }

  const { tag, path } = body;

  if (!tag && !path) {
    return NextResponse.json(
      { error: "At least one of 'tag' or 'path' is required." },
      { status: 400 }
    );
  }

  // ── Revalidate ───────────────────────────────────────────────────────────
  const revalidated: { tags: string[]; paths: string[] } = { tags: [], paths: [] };

  if (tag) {
    revalidateTag(tag, "max");
    revalidated.tags.push(tag);
    console.log(`[revalidate/catalog] Tag revalidated: ${tag}`);
  }

  if (path) {
    revalidatePath(path, "page");
    revalidated.paths.push(path);
    console.log(`[revalidate/catalog] Path revalidated: ${path}`);
  }

  return NextResponse.json({
    revalidated: true,
    ...revalidated,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Convenience GET handler for monitoring systems.
 * Returns 200 with service info (no auth required — reveals no secrets).
 */
export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    service: "fashionistar-catalog-revalidation",
    version: "1.0.0",
    endpoints: ["POST /api/revalidate/catalog/"],
    tags: [
      "homepage-bundle",
      "categories",
      "brands",
      "collections",
      "banners",
      "tags",
      "blog",
    ],
  });
}
