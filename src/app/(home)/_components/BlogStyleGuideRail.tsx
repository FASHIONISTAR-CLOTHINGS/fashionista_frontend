"use client";

/**
 * BlogStyleGuideRail.tsx — R19
 *
 * "Style Guide" blog rail — 3 latest blog posts from CatalogBlogPost.
 * Appears at the bottom of the homepage above the newsletter.
 *
 * Data: GET /api/catalog/blog/ via catalogApi.getBlogPosts()
 *       TanStack Query, staleTime 10min
 *
 * Design:
 *  - Section header: "Style Guide" with "Read All" link
 *  - 3-col grid (1-col mobile → 3-col desktop)
 *  - Each card: cover image, category tag, title, excerpt, read time, CTA
 *  - Cream background section
 *  - Skeleton loading state
 *  - Renders null when no posts available
 */

import Link from "next/link";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { catalogApi } from "@/features/catalog/api/catalog.api";
import type { CatalogBlogPost } from "@/features/catalog/types/catalog.types";
import { BookOpen, Clock } from "lucide-react";

// ─── Blog card ────────────────────────────────────────────────────────────────

function BlogCard({ post, index }: { post: CatalogBlogPost; index: number }) {
  const imageUrl =
    (post as unknown as Record<string, string | null>).cover_image_url ||
    (post as unknown as Record<string, string | null>).thumbnail_url ||
    null;
  const slug =
    (post as unknown as Record<string, string>).slug || String(post.id);
  const excerpt =
    (post as unknown as Record<string, string>).excerpt ||
    (post as unknown as Record<string, string>).summary ||
    "";
  const category =
    (post as unknown as Record<string, string>).category || "Style";
  const readTime =
    (post as unknown as Record<string, number>).read_time_minutes || 3;

  return (
    <article
      className="group flex flex-col rounded-2xl overflow-hidden border border-border bg-card shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
      data-testid={`blog-card-${index}`}
      style={{ animationDelay: `${index * 80}ms` }}
    >
      {/* Cover image */}
      <Link href={`/blog/${slug}`} className="block relative h-44 w-full bg-muted overflow-hidden">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={post.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-gradient-to-br from-[#01454A] to-[#016B73] text-white">
            <BookOpen size={40} aria-hidden="true" />
          </div>
        )}
        {/* Category tag */}
        <span className="absolute top-3 left-3 rounded-full bg-[#FDA600] text-black text-[10px] font-bold px-2.5 py-0.5 font-raleway uppercase tracking-wide">
          {category}
        </span>
      </Link>

      {/* Content */}
      <div className="p-4 flex flex-col gap-2 flex-1">
        <Link href={`/blog/${slug}`}>
          <h3 className="font-raleway font-bold text-sm text-foreground line-clamp-2 leading-snug hover:text-[#01454A] transition-colors">
            {post.title}
          </h3>
        </Link>
        {excerpt && (
          <p className="font-raleway text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {excerpt}
          </p>
        )}
        <div className="mt-auto pt-2 flex items-center justify-between">
          <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <Clock size={9} aria-hidden="true" />
            {readTime} min read
          </span>
          <Link
            href={`/blog/${slug}`}
            className="text-[10px] font-bold font-raleway text-[#01454A] hover:text-[#FDA600] transition-colors"
          >
            Read →
          </Link>
        </div>
      </div>
    </article>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function BlogRailSkeleton() {
  return (
    <div className="grid gap-5 grid-cols-1 sm:grid-cols-3 px-5 md:px-10 lg:px-20" aria-hidden="true">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="rounded-2xl overflow-hidden border border-border bg-card">
          <div className="h-44 bg-muted animate-pulse" />
          <div className="p-4 space-y-2">
            <div className="h-2 w-1/4 bg-muted animate-pulse rounded" />
            <div className="h-3 w-full bg-muted animate-pulse rounded" />
            <div className="h-3 w-3/4 bg-muted animate-pulse rounded" />
            <div className="h-2 w-1/3 bg-muted animate-pulse rounded mt-2" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Main rail ────────────────────────────────────────────────────────────────

export function BlogStyleGuideRail() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["homepage-blog-posts"],
    queryFn: () => catalogApi.getBlogPosts(),
    staleTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const posts: CatalogBlogPost[] = Array.isArray(data) ? data.slice(0, 3) : [];

  if (!isLoading && (isError || posts.length === 0)) return null;

  return (
    <section
      className="py-10 bg-[#F4F3EC]/30"
      data-testid="blog-style-guide-rail"
      aria-label="Style guide blog posts"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 mb-6 md:px-10 lg:px-20">
        <div>
          <p className="font-raleway text-xs font-bold uppercase tracking-[0.2em] text-[#FDA600] mb-1">
            Style Guide
          </p>
          <h2 className="font-bon_foyage text-2xl text-foreground md:text-3xl leading-tight">
            Fashion Inspiration
          </h2>
        </div>
        <Link
          href="/blog"
          data-testid="blog-rail-read-all"
          className="font-raleway text-xs font-bold text-[#01454A] border border-[#01454A]/30 px-4 py-2 rounded-full hover:bg-[#01454A] hover:text-white transition-all duration-150 flex-shrink-0"
        >
          Read All →
        </Link>
      </div>

      {/* Grid */}
      {isLoading ? (
        <BlogRailSkeleton />
      ) : (
        <div
          className="grid gap-5 grid-cols-1 sm:grid-cols-3 px-5 md:px-10 lg:px-20"
          role="list"
          aria-label="Style guide articles"
        >
          {posts.map((post, i) => (
            <div key={post.id} role="listitem">
              <BlogCard post={post} index={i} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
