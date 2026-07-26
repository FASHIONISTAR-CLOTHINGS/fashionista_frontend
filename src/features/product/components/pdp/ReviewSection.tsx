"use client";

/**
 * @file ReviewSection.tsx
 * @description Extracted PDP reviews section component (Phase 5.1).
 *   - Overall score + star rating breakdown chart
 *   - Star rating filter chips (All, 5★, 4★, etc.)
 *   - Review cards list with verified buyer badges
 */

import { useState } from "react";
import { Star } from "lucide-react";
import type { ProductReview } from "@/features/product";

interface ReviewSectionProps {
  reviews: ProductReview[];
  avgRating: number;
  reviewCount: number;
}

export function ReviewSection({ reviews, avgRating, reviewCount }: ReviewSectionProps) {
  const [reviewStarFilter, setReviewStarFilter] = useState<number | null>(null);

  if (!reviews || reviews.length === 0) return null;

  const filteredReviews =
    reviewStarFilter !== null
      ? reviews.filter((r) => r.rating === reviewStarFilter)
      : reviews;

  return (
    <section className="mt-16">
      <h2 className="mb-6 font-bon_foyage text-3xl text-foreground">Customer Reviews</h2>

      {/* Star rating breakdown */}
      <div className="mb-8 rounded-2xl border border-border bg-card p-5 flex flex-col sm:flex-row gap-6">
        {/* Overall score */}
        <div className="flex flex-col items-center justify-center sm:border-r sm:border-border sm:pr-6 sm:w-36 shrink-0">
          <span className="text-5xl font-bold text-foreground">
            {avgRating.toFixed(1)}
          </span>
          <div className="flex items-center gap-0.5 mt-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                size={14}
                fill={i < Math.round(avgRating) ? "hsl(var(--accent))" : "none"}
                stroke="hsl(var(--accent))"
                strokeWidth={1.5}
              />
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {reviewCount} review{reviewCount !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Breakdown bars */}
        <div className="flex-1 space-y-2">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = reviews.filter((r) => r.rating === star).length;
            const pct = reviews.length > 0 ? Math.round((count / reviews.length) * 100) : 0;
            return (
              <div key={star} className="flex items-center gap-3">
                <span className="text-xs font-semibold text-muted-foreground w-3 text-right">{star}</span>
                <Star size={10} fill="hsl(var(--accent))" stroke="hsl(var(--accent))" className="shrink-0" />
                <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#FDA600] transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground w-8 text-right">{pct}%</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Star filter chips */}
      <div className="flex flex-wrap items-center gap-2 pb-2 mb-4">
        <span className="text-xs font-medium text-muted-foreground">Filter:</span>
        <button
          type="button"
          onClick={() => setReviewStarFilter(null)}
          className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
            reviewStarFilter === null
              ? "bg-[#01454A] text-white"
              : "bg-muted text-muted-foreground hover:bg-[#01454A]/10"
          }`}
        >
          All ({reviews.length})
        </button>
        {[5, 4, 3, 2, 1].map((star) => {
          const cnt = reviews.filter((r) => r.rating === star).length;
          if (cnt === 0) return null;
          return (
            <button
              key={star}
              type="button"
              onClick={() => setReviewStarFilter(reviewStarFilter === star ? null : star)}
              className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                reviewStarFilter === star
                  ? "bg-[#FDA600] text-black"
                  : "bg-muted text-muted-foreground hover:bg-[#FDA600]/20"
              }`}
            >
              {star}★ ({cnt})
            </button>
          );
        })}
      </div>

      {/* Reviews grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {filteredReviews.length === 0 && reviewStarFilter !== null ? (
          <div className="col-span-2 py-10 text-center text-sm text-muted-foreground">
            No {reviewStarFilter}★ reviews yet.
            <button
              type="button"
              onClick={() => setReviewStarFilter(null)}
              className="ml-2 underline text-[#01454A] hover:opacity-80"
            >
              Show all reviews
            </button>
          </div>
        ) : (
          filteredReviews.map((r) => (
            <div
              key={r.id}
              className="flex flex-col justify-between rounded-xl border border-border bg-card p-4 space-y-3"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-foreground">
                    {r.reviewer_display || "Fashionistar Customer"}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {r.created_at ? new Date(r.created_at).toLocaleDateString("en-GB") : ""}
                  </span>
                </div>
                <div className="flex items-center gap-0.5 mt-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={12}
                      fill={i < r.rating ? "hsl(var(--accent))" : "none"}
                      stroke="hsl(var(--accent))"
                      strokeWidth={1.5}
                    />
                  ))}
                </div>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{r.review}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
