import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  getCatalogBlogPostBySlug,
  getCatalogBlogPosts,
} from "@/features/catalog";

interface BlogDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: BlogDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getCatalogBlogPostBySlug(slug);

  if (!post) {
    return {
      title: "Fashionistar Blog",
    };
  }

  return {
    title: post.seo_title || `${post.title} | Fashionistar Blog`,
    description: post.seo_description || post.excerpt,
    alternates: {
      canonical: `/blog/${post.slug}`,
    },
    openGraph: {
      title: post.title,
      description: post.seo_description || post.excerpt,
      url: `/blog/${post.slug}`,
      type: "article",
      images: post.image_url ? [{ url: post.image_url, alt: post.title }] : undefined,
    },
  };
}

// Allow slugs not pre-generated to render at request time (never 404)
export const dynamicParams = true;

export async function generateStaticParams() {
  try {
    const posts = await getCatalogBlogPosts();
    return posts.slice(0, 50).map((post) => ({ slug: post.slug }));
  } catch {
    return [];
  }
}

export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
  const { slug } = await params;
  const post = await getCatalogBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <main className="bg-background px-5 py-10 text-foreground md:px-10 lg:px-20">
      <article className="mx-auto max-w-4xl space-y-8">
        <Link
          href="/blog"
          className="inline-flex rounded-full border border-[hsl(var(--accent))] px-5 py-2 text-sm font-semibold text-[hsl(var(--accent))] transition hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--accent-foreground))]"
        >
          Back to Blog
        </Link>

        <header className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            {post.category_name ? (
              <span className="rounded-full bg-[hsl(var(--primary)/0.12)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[hsl(var(--primary))]">
                {post.category_name}
              </span>
            ) : null}
            <span className="rounded-full bg-[hsl(var(--accent)/0.14)] px-3 py-1 text-xs font-bold uppercase tracking-wide text-[hsl(var(--accent))]">
              Fashionistar editorial
            </span>
          </div>
          <h1 className="font-bon_foyage text-[42px] leading-none md:text-[82px]">
            {post.title}
          </h1>
          <p className="text-base leading-7 text-muted-foreground md:text-lg">
            {post.excerpt || post.seo_description}
          </p>
          <p className="text-sm font-semibold text-[hsl(var(--primary))]">
            {post.author_name}
          </p>
        </header>

        <div className="overflow-hidden rounded-lg border border-border bg-[hsl(var(--brand-cream))]">
          <Image
            src={post.image_url || post.featured_image || "/gown.svg"}
            alt={post.title}
            width={1200}
            height={700}
            sizes="(max-width: 768px) 100vw, 896px"
            className="h-[320px] w-full object-contain p-8 md:h-[520px]"
            priority
          />
        </div>

        <div className="prose prose-neutral max-w-none dark:prose-invert">
          {post.content.split("\n").map((paragraph, index) => (
            <p key={`${post.id}-${index}`} className="text-base leading-8 text-foreground">
              {paragraph}
            </p>
          ))}
        </div>
      </article>
    </main>
  );
}
