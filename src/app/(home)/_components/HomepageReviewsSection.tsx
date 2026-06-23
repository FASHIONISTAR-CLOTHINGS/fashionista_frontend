/**
 * HomepageReviewsSection.tsx — React Server Component
 *
 * Renders live customer reviews from the database (via the homepage bundle).
 * Compact 2026 edition — uses section-wrapper pattern matching CatalogCategoryGrid.
 * Cards are significantly smaller: no py-8 px-8 padding, smaller avatar, smaller text.
 *
 * Architecture:
 *   - Pure RSC — no "use client" directive.
 *   - Receives HomepageReviewCard[] as a prop from page.tsx.
 *   - Falls back to curated static reviews if the API returns 0 results.
 */

import { AvatarImage } from "@/components/media";
import type { HomepageReviewCard } from "@/features/catalog/types/catalog.types";

// ─────────────────────────────────────────────────────────────────────────────
// Static fallback reviews — shown when the DB has no moderated reviews yet.
// ─────────────────────────────────────────────────────────────────────────────

const FALLBACK_REVIEWS: HomepageReviewCard[] = [
  {
    id: "static-1",
    reviewer_name: "Emeka Okafor",
    reviewer_avatar_url: null,
    product_title: "Classic Senator Outfit",
    product_slug: null,
    rating: 5,
    review_text:
      "Amazing quality and perfect fit! The AI measurement system is a game-changer. My senator outfit fit perfectly from day one.",
    helpful_votes: 0,
    created_at: null,
  },
  {
    id: "static-2",
    reviewer_name: "Adunni Bello",
    reviewer_avatar_url: null,
    product_title: "Exquisite Evening Gown",
    product_slug: null,
    rating: 5,
    review_text:
      "Exceeded all my expectations! Fashionistar delivered an exquisite gown that made me the star of my event. Will order again!",
    helpful_votes: 0,
    created_at: null,
  },
  {
    id: "static-3",
    reviewer_name: "Chukwuemeka Eze",
    reviewer_avatar_url: null,
    product_title: "Custom Tailored Suit",
    product_slug: null,
    rating: 5,
    review_text:
      "The custom order feature is outstanding. I uploaded my measurements and the vendor delivered exactly what I envisioned.",
    helpful_votes: 0,
    created_at: null,
  },
  {
    id: "static-4",
    reviewer_name: "Fatima Aliyu",
    reviewer_avatar_url: null,
    product_title: "Ankara Fabric Collection",
    product_slug: null,
    rating: 5,
    review_text:
      "Fashionistar has redefined online fashion for me. The quality, service, and attention to detail are unmatched in Nigeria.",
    helpful_votes: 0,
    created_at: null,
  },
];

// Avatar placeholder cycling
const AVATAR_PLACEHOLDERS = ["/man2_asset.svg", "/woman.svg", "/man2_asset.svg", "/woman.svg"];

interface Props {
  reviews: HomepageReviewCard[];
}

function StarRow({ rating }: { rating: number }) {
  const stars = Math.min(5, Math.max(1, Math.round(rating)));
  return (
    <span className="text-[#fda600] text-sm" aria-label={`${stars} out of 5 stars`}>
      {"★".repeat(stars)}{"☆".repeat(5 - stars)}
    </span>
  );
}

function ReviewCard({
  review,
  index,
}: {
  review: HomepageReviewCard;
  index: number;
}) {
  const avatarSrc = review.reviewer_avatar_url ?? AVATAR_PLACEHOLDERS[index % AVATAR_PLACEHOLDERS.length];

  return (
    <div
      className="flex items-start gap-3 py-4 px-4 border border-[#E8E3DA] rounded-2xl hover:border-[#FDA600]/60 transition-colors duration-300 group bg-white"
    >
      {/* Avatar — compact 48×48 */}
      <div className="relative w-12 h-12 rounded-full overflow-hidden shrink-0 ring-2 ring-[#FDA600]/20 group-hover:ring-[#FDA600]/50 transition-all">
        <AvatarImage
          src={avatarSrc}
          alt={review.reviewer_name}
          fill
          imgClassName="object-cover"
          sizes="48px"
        />
      </div>

      {/* Content */}
      <div className="flex flex-col gap-1 min-w-0">
        <StarRow rating={review.rating} />
        <p className="font-raleway text-xs leading-5 text-[#475367] line-clamp-3">
          &ldquo;{review.review_text}&rdquo;
        </p>
        {review.product_title && (
          <p className="font-raleway text-[10px] text-[#01454A] uppercase tracking-wide truncate">
            {review.product_title}
          </p>
        )}
        <p className="font-raleway font-semibold text-sm text-[#1A1208]">
          {review.reviewer_name}
        </p>
      </div>
    </div>
  );
}

export function HomepageReviewsSection({ reviews }: Props) {
  // Use live API reviews; fall back to static if API returned nothing
  const displayReviews = reviews && reviews.length > 0 ? reviews : FALLBACK_REVIEWS;

  return (
    <section
      className="section-wrapper bg-[var(--BV-cream)]/30"
      aria-labelledby="reviews-heading"
      id="customer-reviews"
    >
      {/* ── Section Header ─────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-6 gap-2">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-[var(--BV-gold)] mb-1">
            Verified Buyers
          </p>
          <h2
            id="reviews-heading"
            className="section-title"
          >
            Our Reviews
          </h2>
          {reviews.length > 0 && (
            <p className="mt-1 text-sm text-[var(--BV-muted)]">
              Based on {reviews.length}+ verified purchase{reviews.length !== 1 ? "s" : ""}
            </p>
          )}
        </div>
      </div>

      {/* ── Review Grid ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {displayReviews.map((review, i) => (
          <ReviewCard key={review.id} review={review} index={i} />
        ))}
      </div>

      {/* Dot pagination indicators */}
      <div className="flex items-center gap-2 justify-center pt-5">
        {Array.from({ length: Math.min(4, displayReviews.length) }).map((_, i) => (
          <span
            key={i}
            className={
              i === 0
                ? "w-5 h-5 rounded-full bg-[#01454A]"
                : "w-3 h-3 rounded-full bg-transparent border-2 border-[#01454A]/40"
            }
          />
        ))}
      </div>
    </section>
  );
}

export default HomepageReviewsSection;
