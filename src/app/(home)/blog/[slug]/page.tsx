/**
 * app/(home)/blog/[slug]/page.tsx  — Phase C4
 *
 * Rich blog post detail page.
 *
 * Architecture:
 *   - RSC: server-fetches post + related posts in parallel
 *   - ISR: revalidate 300s, tagged "blog-{slug}"
 *   - JSON-LD: Article structured data for Google rich results
 *   - SEO: dynamic metadata from seo_title / seo_description / og_image
 *   - Never crashes: falls back to notFound() on missing post
 *   - data-testid on key regions for Playwright E2E coverage
 */

import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  getCatalogBlogPostBySlug,
  getCatalogBlogPosts,
} from "@/features/catalog";
import type { CatalogBlogPost } from "@/features/catalog/types/catalog.types";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface BlogDetailPageProps {
  params: Promise<{ slug: string }>;
}

const VALIDATION_SLUG = "__blog_validation__";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function estimateReadTime(content: string): number {
  const wordCount = content.trim().split(/\s+/).length;
  return Math.max(1, Math.round(wordCount / 200));
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "";
  try {
    return new Date(dateStr).toLocaleDateString("en-NG", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function renderContent(content: string) {
  // Basic paragraph splitter — preserves double-newline sections
  const sections = content
    .split(/\n{2,}/)
    .map((s) => s.trim())
    .filter(Boolean);

  return sections.map((section, i) => {
    // Detect heading: lines starting with # or ALL CAPS short line
    if (section.startsWith("## ")) {
      return (
        <h2
          key={i}
          className="font-bon_foyage text-3xl text-foreground mt-10 mb-4 leading-tight"
        >
          {section.slice(3)}
        </h2>
      );
    }
    if (section.startsWith("# ")) {
      return (
        <h2
          key={i}
          className="font-bon_foyage text-4xl text-foreground mt-12 mb-5 leading-tight"
        >
          {section.slice(2)}
        </h2>
      );
    }
    // Normal paragraph
    return (
      <p
        key={i}
        className="text-base leading-8 text-foreground/85 font-raleway"
      >
        {section}
      </p>
    );
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Static params — pre-generate top 50 posts at build time
// ─────────────────────────────────────────────────────────────────────────────

export async function generateStaticParams() {
  try {
    const posts = await getCatalogBlogPosts();
    const params = posts
      .slice(0, 50)
      .filter((p) => Boolean(p.slug))
      .map((p) => ({ slug: p.slug }));
    return params.length > 0 ? params : [{ slug: VALIDATION_SLUG }];
  } catch {
    return [{ slug: VALIDATION_SLUG }];
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Metadata — per-post SEO (OpenGraph + Twitter cards)
// ─────────────────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: BlogDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  if (slug === VALIDATION_SLUG) return { title: "Fashionistar Blog" };

  const post = await getCatalogBlogPostBySlug(slug);
  if (!post) return { title: "Fashionistar Blog" };

  const coverImage = post.image_url || post.featured_image;

  return {
    title: post.seo_title || `${post.title} | Fashionistar Blog`,
    description: post.seo_description || post.excerpt,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.seo_description || post.excerpt,
      url: `https://fashionistar.net/blog/${post.slug}`,
      type: "article",
      publishedTime: post.published_at ?? undefined,
      authors: [post.author_name],
      images: coverImage
        ? [{ url: coverImage, alt: post.title, width: 1200, height: 630 }]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: post.seo_title || post.title,
      description: post.seo_description || post.excerpt,
      images: coverImage ? [coverImage] : undefined,
    },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Related Posts Card
// ─────────────────────────────────────────────────────────────────────────────

function RelatedPostCard({ post }: { post: CatalogBlogPost }) {
  const coverImage = post.image_url || post.featured_image;
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex flex-col gap-3 rounded-2xl overflow-hidden bg-card border border-border hover:shadow-md transition-shadow duration-200"
    >
      <div className="relative h-44 bg-[#F4F3EC] overflow-hidden">
        {coverImage ? (
          <Image
            src={coverImage}
            alt={post.title}
            fill
            sizes="(max-width: 768px) 100vw, 320px"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <svg className="h-12 w-12 text-[#01454A]/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14" />
            </svg>
          </div>
        )}
      </div>
      <div className="px-4 pb-4 space-y-1.5">
        {post.category_name && (
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#01454A]">
            {post.category_name}
          </span>
        )}
        <h3 className="font-bon_foyage text-base leading-snug text-foreground group-hover:text-[#01454A] transition-colors line-clamp-2">
          {post.title}
        </h3>
        <p className="text-xs text-muted-foreground">{formatDate(post.published_at)}</p>
      </div>
    </Link>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
  const { slug } = await params;

  // Validation slug guard
  if (slug === VALIDATION_SLUG) notFound();

  // Parallel fetch: post + all posts (for related section)
  const [post, allPosts] = await Promise.all([
    getCatalogBlogPostBySlug(slug),
    getCatalogBlogPosts(),
  ]);

  if (!post) notFound();

  // Related: same category, exclude current, max 3
  const relatedPosts = allPosts
    .filter(
      (p) =>
        p.slug !== slug &&
        (p.category_name === post.category_name || p.is_featured)
    )
    .slice(0, 3);

  const readTime = estimateReadTime(post.content);
  const coverImage = post.image_url || post.featured_image;
  const publishDate = formatDate(post.published_at);

  // ── JSON-LD Article ────────────────────────────────────────────────────────
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt || post.seo_description,
    image: coverImage ? [coverImage] : undefined,
    author: {
      "@type": "Person",
      name: post.author_name || "Fashionistar Editorial",
    },
    publisher: {
      "@type": "Organization",
      name: "Fashionistar",
      logo: {
        "@type": "ImageObject",
        url: "https://fashionistar.net/logo.png",
      },
    },
    datePublished: post.published_at ?? undefined,
    dateModified: post.updated_at ?? post.published_at ?? undefined,
    url: `https://fashionistar.net/blog/${post.slug}`,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://fashionistar.net/blog/${post.slug}`,
    },
    keywords: post.tags?.join(", ") || undefined,
  };

  return (
    <>
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main
        className="bg-background text-foreground"
        data-testid="blog-detail-page"
      >
        {/* ── Hero ───────────────────────────────────────────────────────────── */}
        <section
          className="relative min-h-[340px] md:min-h-[520px] bg-[#01454A] flex items-end overflow-hidden"
          data-testid="blog-hero"
        >
          {/* Background cover image */}
          {coverImage && (
            <Image
              src={coverImage}
              alt={post.title}
              fill
              sizes="100vw"
              className="object-cover opacity-25"
              priority
            />
          )}
          {/* Dark gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#01454A] via-[#01454A]/60 to-transparent" />

          {/* Hero content */}
          <div className="relative z-10 px-5 py-10 md:px-10 lg:px-20 w-full max-w-5xl space-y-5">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-white/60 font-raleway" aria-label="Breadcrumb">
              <Link href="/" className="hover:text-[#FDA600] transition-colors">Home</Link>
              <span aria-hidden="true">/</span>
              <Link href="/blog" className="hover:text-[#FDA600] transition-colors">Blog</Link>
              <span aria-hidden="true">/</span>
              <span className="text-white/90 truncate max-w-[200px]">{post.title}</span>
            </nav>

            {/* Category + featured badges */}
            <div className="flex flex-wrap items-center gap-2">
              {post.category_name && (
                <span className="rounded-full bg-[#FDA600]/20 border border-[#FDA600]/40 px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#FDA600]">
                  {post.category_name}
                </span>
              )}
              {post.is_featured && (
                <span className="rounded-full bg-white/15 border border-white/30 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
                  ⭐ Featured
                </span>
              )}
            </div>

            <h1 className="font-bon_foyage text-3xl text-white leading-tight md:text-5xl lg:text-6xl max-w-3xl">
              {post.title}
            </h1>

            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-white/70 font-raleway">
              {post.author_name && (
                <span className="font-semibold text-white/90">
                  By {post.author_name}
                </span>
              )}
              {publishDate && (
                <>
                  <span aria-hidden="true">·</span>
                  <time dateTime={post.published_at ?? ""} className="text-white/70">
                    {publishDate}
                  </time>
                </>
              )}
              <span aria-hidden="true">·</span>
              <span className="text-white/70">{readTime} min read</span>
              {post.view_count > 0 && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="text-white/60">{post.view_count.toLocaleString()} views</span>
                </>
              )}
            </div>
          </div>
        </section>

        {/* ── Article body ───────────────────────────────────────────────────── */}
        <div className="px-5 py-12 md:px-10 lg:px-20">
          <div className="mx-auto max-w-3xl">

            {/* Excerpt pull-quote */}
            {post.excerpt && (
              <blockquote
                className="
                  border-l-4 border-[#FDA600] pl-6 py-2 mb-10
                  text-xl leading-relaxed text-foreground/80 italic font-raleway
                "
                data-testid="blog-excerpt"
              >
                {post.excerpt}
              </blockquote>
            )}

            {/* Content */}
            <article
              className="space-y-6"
              data-testid="blog-content"
            >
              {renderContent(post.content)}
            </article>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-12 pt-8 border-t border-border" data-testid="blog-tags">
                <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground self-center">
                  Tags:
                </span>
                {post.tags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/blog?tag=${encodeURIComponent(tag)}`}
                    className="rounded-full border border-border bg-card px-4 py-1.5 text-xs font-semibold text-foreground hover:bg-[#01454A] hover:text-white hover:border-[#01454A] transition-all duration-200"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            )}

            {/* Author card */}
            <div className="mt-12 flex items-start gap-4 rounded-2xl border border-border bg-card p-6" data-testid="blog-author">
              <div className="h-14 w-14 rounded-full bg-[#01454A]/10 flex items-center justify-center flex-shrink-0">
                <span className="text-xl font-bold text-[#01454A]">
                  {(post.author_name || "F")[0].toUpperCase()}
                </span>
              </div>
              <div>
                <p className="font-semibold text-foreground">{post.author_name || "Fashionistar Editorial"}</p>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Fashion & Style Writer at Fashionistar — Nigeria's premier AI-powered fashion platform.
                </p>
              </div>
            </div>

            {/* Back CTA */}
            <div className="mt-10 flex items-center gap-4">
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-semibold text-foreground hover:bg-[#01454A] hover:text-white hover:border-[#01454A] transition-all duration-200"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                All Articles
              </Link>
              <Link
                href="/products"
                className="inline-flex items-center gap-2 rounded-full bg-[#FDA600] px-6 py-3 text-sm font-bold text-black hover:bg-[#FDA600]/90 transition-all duration-200 hover:scale-105 active:scale-95"
              >
                Shop Now
              </Link>
            </div>
          </div>
        </div>

        {/* ── Related Posts ──────────────────────────────────────────────────── */}
        {relatedPosts.length > 0 && (
          <section
            className="px-5 py-14 md:px-10 lg:px-20 bg-[#F8F9FC]"
            data-testid="blog-related"
          >
            <div className="mx-auto max-w-5xl space-y-8">
              <h2 className="font-bon_foyage text-3xl text-foreground md:text-4xl">
                Related Articles
              </h2>
              <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
                {relatedPosts.map((related) => (
                  <RelatedPostCard key={related.id} post={related} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── Newsletter CTA ────────────────────────────────────────────────── */}
        <section className="mx-5 md:mx-10 lg:mx-20 my-14 rounded-3xl bg-gradient-to-r from-[#01454A] to-[#016B73] p-10 md:p-14 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="text-center md:text-left">
            <h2 className="font-bon_foyage text-3xl text-white mb-2">
              Stay Fashion-Forward
            </h2>
            <p className="text-white/75 font-raleway text-base">
              Get style tips, new arrivals, and exclusive deals in your inbox.
            </p>
          </div>
          <Link
            href="/#newsletter-section"
            className="inline-flex items-center gap-2 rounded-full bg-[#FDA600] px-8 py-4 font-bold text-black hover:bg-[#FDA600]/90 transition-all duration-200 hover:scale-105 active:scale-95 min-h-[48px] whitespace-nowrap"
          >
            Subscribe Free
          </Link>
        </section>
      </main>
    </>
  );
}
