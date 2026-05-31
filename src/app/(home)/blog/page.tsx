import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { CatalogBlogList } from "@/features/catalog";
import { NewsletterForm } from "../_components/NewsletterForm";

export const metadata: Metadata = {
  title: "Fashionistar Blog | Digital Measurements, Tailoring, Fashion Commerce",
  description:
    "Read Fashionistar guides on digital body measurements, tailor marketplaces, custom clothing orders, vendor growth, and secure fashion commerce.",
  alternates: { canonical: "/blog" },
  openGraph: {
    title: "Fashionistar Blog — Style Intelligence & Fashion Commerce",
    description:
      "Style intelligence, measurement education, vendor notes, and commerce guides from Fashionistar.",
    url: "/blog",
    type: "website",
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Blog List Skeleton
// ─────────────────────────────────────────────────────────────────────────────

function BlogSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="rounded-2xl overflow-hidden border border-border/30 animate-pulse">
          <div className="aspect-video w-full bg-muted/50" />
          <div className="p-5 space-y-3">
            <div className="h-2.5 w-20 rounded bg-muted/40" />
            <div className="h-5 w-full rounded bg-muted/50" />
            <div className="h-5 w-4/5 rounded bg-muted/40" />
            <div className="space-y-1.5">
              <div className="h-3 w-full rounded bg-muted/30" />
              <div className="h-3 w-4/5 rounded bg-muted/30" />
            </div>
            <div className="flex items-center justify-between pt-2">
              <div className="h-3 w-20 rounded bg-muted/30" />
              <div className="h-3 w-16 rounded bg-muted/30" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

export default function BlogPage() {
  return (
    <main className="bg-background text-foreground">
      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[#0D0D0D] px-4 py-20 md:px-8 lg:px-20">
        {/* Decorative blobs */}
        <div
          aria-hidden="true"
          className="absolute -top-20 right-0 h-72 w-72 rounded-full bg-[#fda600]/10 blur-3xl pointer-events-none"
        />
        <div
          aria-hidden="true"
          className="absolute bottom-0 left-1/3 h-40 w-40 rounded-full bg-[#01454A]/20 blur-3xl pointer-events-none"
        />

        <div className="relative max-w-3xl">
          <p className="font-raleway text-xs font-bold uppercase tracking-[0.25em] text-[#fda600] mb-4">
            Style Intelligence
          </p>
          <h1 className="font-bon_foyage text-5xl leading-none text-white md:text-7xl">
            The Fashionistar Blog
          </h1>
          <p className="mt-5 max-w-2xl font-raleway text-base leading-7 text-white/70">
            Guides on digital body measurements, AI-powered tailoring, vendor
            growth strategies, and the business of African fashion commerce —
            written for clients, artisans, and style enthusiasts alike.
          </p>

          {/* Category quick-links */}
          <div className="mt-8 flex flex-wrap gap-2">
            {["All", "Measurements", "Vendor Tips", "Style Guides", "Commerce", "Culture"].map(
              (tag) => (
                <span
                  key={tag}
                  className={`rounded-full px-4 py-1.5 font-raleway text-xs font-semibold transition-all duration-200 cursor-pointer ${
                    tag === "All"
                      ? "bg-[#fda600] text-black"
                      : "border border-white/20 bg-white/5 text-white/80 hover:bg-white/10"
                  }`}
                >
                  {tag}
                </span>
              )
            )}
          </div>
        </div>
      </section>

      {/* ── Featured CTA strip ────────────────────────────────────────── */}
      <section className="border-b border-border/40 bg-card/60 px-4 py-5 md:px-8 lg:px-20">
        <div className="mx-auto flex max-w-screen-xl flex-wrap items-center justify-between gap-4">
          <p className="font-raleway text-sm text-muted-foreground">
            AI measurement guidance · verified storefronts · practical commerce insights
          </p>
          <Link
            href="/get-measured"
            className="inline-flex items-center gap-2 rounded-full bg-[#fda600] px-6 py-2 font-raleway text-xs font-bold text-black shadow hover:bg-[#e09500] transition-all duration-200"
          >
            Get Measured Free →
          </Link>
        </div>
      </section>

      {/* ── Blog Grid ─────────────────────────────────────────────────── */}
      <section className="px-4 py-12 md:px-8 lg:px-20">
        <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-raleway text-xs font-semibold uppercase tracking-widest text-[#fda600] mb-1">
              Latest Articles
            </p>
            <h2 className="font-bon_foyage text-3xl text-foreground md:text-4xl">
              All Posts
            </h2>
          </div>
        </div>

        <Suspense fallback={<BlogSkeleton />}>
          <CatalogBlogList />
        </Suspense>
      </section>

      {/* ── Newsletter Footer CTA ─────────────────────────────────────── */}
      <section className="bg-[#01454A] px-4 py-16 md:px-8 lg:px-20">
        <div className="max-w-2xl mx-auto text-center space-y-5">
          <p className="font-raleway text-sm font-semibold uppercase tracking-widest text-[#fda600]">
            Never Miss a Drop
          </p>
          <h2 className="font-bon_foyage text-3xl text-white md:text-4xl">
            Subscribe to the Fashionistar Blog
          </h2>
          <p className="font-raleway text-base text-white/70 leading-7">
            Weekly style guides, artisan spotlights, measurement tips, and
            platform updates delivered straight to your inbox.
          </p>
          <div className="max-w-md mx-auto">
            <NewsletterForm />
          </div>
        </div>
      </section>
    </main>
  );
}
