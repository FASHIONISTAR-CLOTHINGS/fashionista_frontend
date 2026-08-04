/**
 * app/(home)/blog/[slug]/page.tsx  — Phase C4 (Modernized)
 *
 * Rich blog post detail page.
 *
 * Architecture:
 *   - RSC: server-fetches post + related posts in parallel
 *   - ISR: revalidate 3600s (1 hour), tagged "blog"
 *   - JSON-LD: Article structured data for Google rich results
 *   - SEO: dynamic metadata from seo_title / seo_description / og_image
 *   - Never crashes: falls back to notFound() on missing post
 *   - data-testid on key regions for Playwright E2E coverage
 *   - Marketing triggers: social proof, inline products, sticky CTA, exit intent, trust badges, urgency
 */

import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  getCatalogBlogPostBySlug,
} from "@/features/catalog";
import { getBlogPostsSync } from "@/features/catalog/api/blog-sync";
import type { CatalogBlogPost } from "@/features/catalog/types/catalog.types";
import { SocialProofBar } from "./_components/SocialProofBar";
import { InlineProductRecommendations } from "./_components/InlineProductRecommendations";
import { StickyCTABar } from "./_components/StickyCTABar";
import { ExitIntentPopup } from "./_components/ExitIntentPopup";
import { TrustBadges } from "./_components/TrustBadges";
import { UrgencyTimer } from "./_components/UrgencyTimer";

export const revalidate = 3600;

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
    const posts = await getBlogPostsSync();
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
    <article
      className="group flex flex-col gap-3 rounded-2xl overflow-hidden bg-card border border-border hover:shadow-md transition-shadow duration-200"
      data-testid={`related-post-${post.slug}`}
    >
      <Link href={`/blog/${post.slug}`} className="flex flex-col gap-3 h-full">
        <div className="relative h-44 bg-[hsl(var(--brand-cream))] overflow-hidden">
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
              <svg className="h-12 w-12 text-[hsl(var(--brand-green))]/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14" />
              </svg>
            </div>
          )}
        </div>
        <div className="px-4 pb-4 space-y-1.5">
          {post.category_name && (
            <span className="text-[10px] font-bold uppercase tracking-widest text-[hsl(var(--brand-green))]">
              {post.category_name}
            </span>
          )}
          <h3 className="font-bon_foyage text-base leading-snug text-foreground group-hover:text-[hsl(var(--brand-green))] transition-colors line-clamp-2">
            {post.title}
          </h3>
          <p className="text-xs text-muted-foreground">{formatDate(post.published_at)}</p>
        </div>
      </Link>
    </article>
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
    getBlogPostsSync(),
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

  // Split content for inline product recommendations
  const contentParts = renderContent(post.content);
  const midPoint = Math.ceil(contentParts.length / 2);

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
          aria-label="Blog post hero"
          className="relative min-h-[340px] md:min-h-[520px] bg-[hsl(var(--brand-green))] flex items-end overflow-hidden"
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
          <div className="absolute inset-0 bg-gradient-to-t from-[hsl(var(--brand-green))] via-[hsl(var(--brand-green))]/60 to-transparent" />

          {/* Hero content */}
          <div className="relative z-10 px-5 py-10 md:px-10 lg:px-20 w-full max-w-5xl space-y-5">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-white/60 font-raleway" aria-label="Breadcrumb">
              <Link href="/" className="hover:text-[hsl(var(--accent))] transition-colors">Home</Link>
              <span aria-hidden="true">/</span>
              <Link href="/blog" className="hover:text-[hsl(var(--accent))] transition-colors">Blog</Link>
              <span aria-hidden="true">/</span>
              <span className="text-white/90 truncate max-w-[200px]">{post.title}</span>
            </nav>

            {/* Category + featured badges */}
            <div className="flex flex-wrap items-center gap-2">
              {post.category_name && (
                <span className="rounded-full bg-[hsl(var(--accent))]/20 border border-[hsl(var(--accent))]/40 px-3 py-1 text-xs font-bold uppercase tracking-wide text-[hsl(var(--accent))]">
                  {post.category_name}
                </span>
              )}
              {post.is_featured && (
                <span className="rounded-full bg-white/15 border border-white/30 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
                  Featured
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
        <section
          aria-label="Blog article body"
          className="px-5 py-12 md:px-10 lg:px-20"
          data-testid="blog-article-body"
        >
          <div className="mx-auto max-w-3xl space-y-8">

            {/* Social proof bar */}
            <SocialProofBar
              viewCount={post.view_count}
              readTime={readTime}
              publishedDate={post.published_at}
            />

            {/* Excerpt pull-quote */}
            {post.excerpt && (
              <blockquote
                className="border-l-4 border-[hsl(var(--accent))] pl-6 py-2 text-xl leading-relaxed text-foreground/80 italic font-raleway"
                data-testid="blog-excerpt"
              >
                {post.excerpt}
              </blockquote>
            )}

            {/* Content with inline product recommendations */}
            <article className="space-y-6" data-testid="blog-content">
              {contentParts.slice(0, midPoint)}
              <InlineProductRecommendations tags={post.tags} />
              {contentParts.slice(midPoint)}
            </article>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-8 border-t border-border" data-testid="blog-tags">
                <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground self-center">
                  Tags:
                </span>
                {post.tags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/blog?tag=${encodeURIComponent(tag)}`}
                    className="rounded-full border border-border bg-card px-4 py-1.5 text-xs font-semibold text-foreground hover:bg-[hsl(var(--brand-green))] hover:text-white hover:border-[hsl(var(--brand-green))] transition-all duration-200"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            )}

            {/* Author card */}
            <div className="flex items-start gap-4 rounded-2xl border border-border bg-card p-6" data-testid="blog-author">
              <div className="h-14 w-14 rounded-full bg-[hsl(var(--brand-green))]/10 flex items-center justify-center flex-shrink-0">
                <span className="text-xl font-bold text-[hsl(var(--brand-green))]">
                  {(post.author_name || "F")[0].toUpperCase()}
                </span>
              </div>
              <div>
                <p className="font-semibold text-foreground">{post.author_name || "Fashionistar Editorial"}</p>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Fashion & Style Writer at Fashionistar — Nigeria&apos;s premier AI-powered fashion platform.
                </p>
              </div>
            </div>

            {/* Urgency timer */}
            <UrgencyTimer />

            {/* CTA Row */}
            <div className="flex flex-wrap items-center gap-4" data-testid="blog-cta-row">
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-semibold text-foreground hover:bg-[hsl(var(--brand-green))] hover:text-white hover:border-[hsl(var(--brand-green))] transition-all duration-200"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                All Articles
              </Link>
              <Link
                href="/products"
                className="inline-flex items-center gap-2 rounded-full bg-[hsl(var(--accent))] px-6 py-3 text-sm font-bold text-black hover:bg-[hsl(var(--brand-gold-hover))] transition-all duration-200 hover:scale-105 active:scale-95"
                data-testid="blog-cta-shop"
              >
                Shop the Collection
              </Link>
              <Link
                href="/get-measured"
                className="inline-flex items-center gap-2 rounded-full bg-[hsl(var(--brand-green))] px-6 py-3 text-sm font-bold text-white hover:bg-[hsl(var(--brand-green-hover))] transition-all duration-200 hover:scale-105 active:scale-95"
                data-testid="blog-cta-measured"
              >
                Get Your Perfect Fit — Start Free
              </Link>
            </div>
          </div>
        </section>

        {/* ── Trust Badges ───────────────────────────────────────────────────── */}
        <TrustBadges />

        {/* ── Related Posts ──────────────────────────────────────────────────── */}
        {relatedPosts.length > 0 && (
          <section
            aria-label="Related articles"
            className="px-5 py-14 md:px-10 lg:px-20 bg-[hsl(var(--brand-cream))]"
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
        <section
          aria-label="Newsletter CTA"
          className="mx-5 md:mx-10 lg:mx-20 my-14 rounded-3xl bg-gradient-to-r from-[hsl(var(--brand-green))] to-[hsl(var(--brand-green-hover))] p-10 md:p-14 flex flex-col md:flex-row items-center justify-between gap-8"
          data-testid="blog-newsletter-cta"
        >
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
            className="inline-flex items-center gap-2 rounded-full bg-[hsl(var(--accent))] px-8 py-4 font-bold text-black hover:bg-[hsl(var(--brand-gold-hover))] transition-all duration-200 hover:scale-105 active:scale-95 min-h-[48px] whitespace-nowrap"
            data-testid="blog-newsletter-button"
          >
            Join 10,000+ Style Insiders
          </Link>
        </section>

        {/* ── Sticky CTA Bar (client component, scroll-triggered) ─────────────── */}
        <StickyCTABar />

        {/* ── Exit Intent Popup (client component, mouseleave triggered) ─────── */}
        <ExitIntentPopup />
      </main>
    </>
  );
}
