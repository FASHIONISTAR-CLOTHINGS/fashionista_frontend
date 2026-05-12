import Image from "next/image";
import Link from "next/link";

import { getCatalogBlogPosts } from "../api/catalog.server";
import { fallbackCatalogBlogPosts } from "../lib/catalog-fallbacks";

interface CatalogBlogListProps {
  limit?: number;
  showHeading?: boolean;
}

export default async function CatalogBlogList({
  limit,
  showHeading = true,
}: CatalogBlogListProps) {
  const posts = await getCatalogBlogPosts();
  const items = (posts.length ? posts : fallbackCatalogBlogPosts).slice(0, limit);
  const featuredPost = items.find((item) => item.is_featured) ?? items[0];
  const secondaryPosts = items.filter((item) => item.id !== featuredPost?.id);

  return (
    <section className="bg-background px-5 py-10 text-foreground md:px-10 lg:px-20">
      {showHeading ? (
        <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <h1 className="font-bon_foyage text-[42px] leading-none text-foreground md:text-[76px]">
              Fashionistar Blog
            </h1>
            <p className="max-w-2xl text-sm leading-6 text-muted-foreground md:text-base">
              Style intelligence, measurement education, vendor growth notes, and commerce guides from the catalog team.
            </p>
          </div>
          <Link
            href="/categories"
            className="inline-flex w-fit rounded-full bg-[hsl(var(--accent))] px-6 py-3 text-sm font-bold text-[hsl(var(--accent-foreground))] transition hover:bg-[hsl(var(--brand-gold-hover))] focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]"
          >
            Explore Catalog
          </Link>
        </div>
      ) : null}

      {featuredPost ? (
        <Link
          href={`/blog/${featuredPost.slug}`}
          className="card-shadow card-shadow-hover group mb-8 grid overflow-hidden rounded-lg border border-border bg-card text-card-foreground md:grid-cols-[1.1fr_0.9fr]"
        >
          <div className="relative min-h-[280px] bg-[hsl(var(--brand-cream))] md:min-h-[420px]">
            <Image
              src={featuredPost.image_url || featuredPost.featured_image || "/gown.svg"}
              alt={featuredPost.title}
              fill
              sizes="(max-width: 768px) 100vw, 55vw"
              className="h-full w-full object-contain p-8"
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
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {secondaryPosts.map((post) => (
          <Link
            key={post.id}
            href={`/blog/${post.slug}`}
            className="card-shadow card-shadow-hover group overflow-hidden rounded-lg border border-border bg-card text-card-foreground"
          >
            <div className="relative h-52 bg-[hsl(var(--brand-cream))]">
              <Image
                src={post.image_url || post.featured_image || "/minimalist.svg"}
                alt={post.title}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="h-full w-full object-contain p-6"
              />
            </div>
            <div className="space-y-3 p-5">
              <span className="inline-flex rounded-full bg-[hsl(var(--accent)/0.14)] px-3 py-1 text-xs font-bold uppercase tracking-wide text-[hsl(var(--accent))]">
                {post.category_name || "Fashion guide"}
              </span>
              <h2 className="text-xl font-semibold leading-7">{post.title}</h2>
              <p className="line-clamp-2 text-sm leading-6 text-muted-foreground">
                {post.excerpt || post.seo_description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
