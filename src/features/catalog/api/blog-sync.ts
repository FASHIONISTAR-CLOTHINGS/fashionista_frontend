/**
 * blog-sync.ts — Server-only blog synchronization algorithm.
 *
 * Flow:
 *   1. Fetch backend blog posts (ISR 3600s, tag "blog")
 *   2. If backend unreachable → return static JSON posts
 *   3. If backend returns posts → compare slugs with static JSON
 *   4. If missing posts detected → fire-and-forget bulk POST
 *   5. Return backend posts (stale-while-revalidate semantics)
 *
 * This module MUST NOT be imported into client components.
 */

import "server-only";

import { getServerBackendRootUrl } from "@/core/config/api-roots";

import staticBlogPosts from "../lib/static-blog-posts.json";
import type { CatalogBlogPost } from "../types/catalog.types";

const ISR_REVALIDATE_SECONDS = 3600;
const BACKEND_TIMEOUT_MS = 5_000;

const STATIC_POSTS = staticBlogPosts as CatalogBlogPost[];

export async function getBlogPostsSync(): Promise<CatalogBlogPost[]> {
  const backendPosts = await fetchBackendBlogPosts();

  if (backendPosts.length === 0) {
    return STATIC_POSTS;
  }

  const backendSlugs = new Set(backendPosts.map((p) => p.slug));
  const missingPosts = STATIC_POSTS.filter((p) => !backendSlugs.has(p.slug));

  if (missingPosts.length > 0) {
    triggerBulkCreate(missingPosts).catch((err) => {
      console.warn("[blog-sync] Bulk create failed:", err);
    });
  }

  return backendPosts;
}

async function fetchBackendBlogPosts(): Promise<CatalogBlogPost[]> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), BACKEND_TIMEOUT_MS);

    const res = await fetch(
      `${getServerBackendRootUrl()}/api/v1/ninja/catalog/blog/`,
      {
        headers: {
          Accept: "application/json",
          "ngrok-skip-browser-warning": "true",
        },
        next: {
          revalidate: ISR_REVALIDATE_SECONDS,
          tags: ["blog"],
        },
        signal: controller.signal,
      },
    );

    clearTimeout(timeout);
    if (!res.ok) return [];

    const raw = await res.json();
    const data = raw?.data ?? raw;
    return Array.isArray(data) ? (data as CatalogBlogPost[]) : [];
  } catch {
    return [];
  }
}

async function triggerBulkCreate(posts: CatalogBlogPost[]): Promise<void> {
  const payload = {
    posts: posts.map((p) => ({
      title: p.title,
      slug: p.slug,
      excerpt: p.excerpt,
      content: p.content,
      tags: p.tags,
      seo_title: p.seo_title,
      seo_description: p.seo_description,
      is_featured: p.is_featured,
    })),
  };

  const res = await fetch(
    `${getServerBackendRootUrl()}/api/v1/catalog/blog/bulk-create/`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
      },
      body: JSON.stringify(payload),
    },
  );

  if (res.ok) {
    try {
      const { revalidateTag } = await import("next/cache");
      revalidateTag("blog", "default");
    } catch {
      // revalidateTag may not be available in all contexts
    }
  }
}
