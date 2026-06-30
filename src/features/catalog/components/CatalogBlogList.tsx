/**
 * features/catalog/components/CatalogBlogList.tsx — v2 (Phase 4)
 *
 * RSC — Blog listing with featured + secondary grid.
 * Added: page prop for URL-driven pagination, FashionistarPagination below grid.
 * FashionistarImage already in use — no migration needed.
 */
import Link from "next/link";

import { FashionistarImage } from "@/components/media";
import { FashionistarPagination } from "@/components/ui/FashionistarPagination";
import { getCatalogBlogPosts } from "../api/catalog.server";

const BLOG_PAGE_SIZE = 7; // 1 featured + 6 secondary

interface CatalogBlogListProps {
  limit?: number;
  showHeading?: boolean;
  /** Current page for pagination (1-indexed). */
  page?: number;
}

export default async function CatalogBlogList({
  limit,
  showHeading = true,
  page = 1,
}: CatalogBlogListProps) {
  const allPosts = await getCatalogBlogPosts();

  // If a hard limit is passed (homepage use-case), use that — no pagination
  const usePagination = !limit;
  const totalCount = allPosts.length;

  const paginatedPosts = usePagination
    ? allPosts.slice((page - 1) * BLOG_PAGE_SIZE, page * BLOG_PAGE_SIZE)
    : allPosts.slice(0, limit);

  const featuredPost = paginatedPosts.find((item) => item.is_featured) ?? paginatedPosts[0];
  const secondaryPosts = paginatedPosts.filter((item) => item.id !== featuredPost?.id);

  return (
    <section className="bg-background px-5 py-10 text-foreground md:px-10 lg:px-20">
      {showHeading ? (
        <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <h1 className="font-bon_foyage text-[clamp(2rem,6vw,4.75rem)] leading-none text-foreground">
              Fashionistar Blog
            </h1>
            <p className="max-w-2xl text-sm leading-6 text-muted-foreground md:text-base">
              Style intelligence, measurement education, vendor growth notes, and commerce guides
              from the catalog team.
            </p>
          </div>
          <Link
            href="/categories"
            className="touch-target inline-flex w-fit rounded-full bg-[hsl(var(--accent))] px-6 py-3 text-sm font-bold text-[hsl(var(--accent-foreground))] transition hover:bg-[hsl(var(--brand-gold-hover))] focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]"
          >
            Explore Catalog
          </Link>
        </div>
      ) : null}

      {/* ── Featured post ────────────────────────────────────────────────── */}
      {featuredPost ? (
        <Link
          href={`/blog/${featuredPost.slug}`}
          className="card-shadow card-shadow-hover group mb-8 grid overflow-hidden rounded-xl border border-border bg-card text-card-foreground md:grid-cols-[1.1fr_0.9fr] transition-all duration-300 hover:-translate-y-1"
        >
          <div className="relative min-h-[200px] bg-[hsl(var(--brand-cream))] md:min-h-[420px]">
            <FashionistarImage
              src={featuredPost.image_url || featuredPost.featured_image || "/gown.svg"}
              alt={featuredPost.title}
              fill
              sizes="(max-width: 768px) 100vw, 55vw"
              imgClassName="object-contain p-8 group-hover:scale-105 transition-transform duration-500"
              priority
            />
          </div>
          <div className="flex flex-col justify-center gap-4 p-6 md:p-10">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-[hsl(var(--accent))] px-3 py-1 text-xs font-bold uppercase tracking-wide text-[hsl(var(--accent-foreground))]">
                Featured
              </span>
              {featuredPost.category_name ? (
                <span className="rounded-full bg-[hsl(var(--primary)/0.12)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[hsl(var(--primary))]">
                  {featuredPost.category_name}
                </span>
              ) : null}
            </div>
            <h2 className="text-2xl font-semibold leading-8 md:text-4xl md:leading-[1.1]">
              {featuredPost.title}
            </h2>
            <p className="line-clamp-3 text-sm leading-6 text-muted-foreground md:text-base">
              {featuredPost.excerpt || featuredPost.seo_description}
            </p>
            <p className="text-sm font-semibold text-[hsl(var(--primary))]">
              {featuredPost.author_name}
            </p>
          </div>
        </Link>
      ) : (
        <div className="rounded-3xl border border-dashed border-border bg-card px-6 py-14 text-center">
          <p className="font-bon_foyage text-3xl text-foreground">
            Editorial Stories Are Coming Soon
          </p>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted-foreground md:text-base">
            We do not render demo articles here. New blog stories will appear once the editorial
            team publishes them.
          </p>
        </div>
      )}

      {/* ── Secondary posts grid ─────────────────────────────────────────── */}
      {secondaryPosts.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {secondaryPosts.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="card-shadow card-shadow-hover group overflow-hidden rounded-xl border border-border bg-card text-card-foreground transition-all duration-300 hover:-translate-y-1"
            >
              <div className="relative h-48 bg-[hsl(var(--brand-cream))]">
                <FashionistarImage
                  src={post.image_url || post.featured_image || "/minimalist.svg"}
                  alt={post.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  imgClassName="object-contain p-6 group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="space-y-2.5 p-5">
                <span className="inline-flex rounded-full bg-[hsl(var(--accent)/0.14)] px-3 py-1 text-xs font-bold uppercase tracking-wide text-[hsl(var(--accent))]">
                  {post.category_name || "Fashion guide"}
                </span>
                <h2 className="text-lg font-semibold leading-6">{post.title}</h2>
                <p className="line-clamp-2 text-sm leading-5 text-muted-foreground">
                  {post.excerpt || post.seo_description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      ) : null}

      {/* ── Pagination (only when not in limit/homepage mode) ────────────── */}
      {usePagination && totalCount > BLOG_PAGE_SIZE && (
        <FashionistarPagination
          currentPage={page}
          totalCount={totalCount}
          pageSize={BLOG_PAGE_SIZE}
          baseHref="/blog"
          className="mt-10"
        />
      )}
    </section>
  );
}
