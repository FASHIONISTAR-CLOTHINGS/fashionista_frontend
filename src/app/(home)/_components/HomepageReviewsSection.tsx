/**
 * HomepageReviewsSection.tsx — React Server Component
 *
 * Renders live customer reviews from the database (via the homepage bundle).
 * Replaces the static MOCK_REVIEWS array that was hardcoded in page.tsx.
 *
 * Architecture:
 *   - Pure RSC — no "use client" directive.
 *   - Receives HomepageReviewCard[] as a prop from page.tsx.
 *   - Falls back to curated static reviews if the API returns 0 results
 *     (ensures homepage always has the reviews section — never blank).
 *   - Avatar: uses reviewer_avatar_url from API when available, falls back to
 *     gender-neutral SVG placeholders from /public.
 *   - Stars: rating field (1–5 integer from backend moderation).
 *   - Dot pagination indicators show count up to 4 dots.
 */

import Image from "next/image";
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

// Avatar placeholder cycling — alternates between the two public assets
const AVATAR_PLACEHOLDERS = ["/man2_asset.svg", "/woman.svg", "/man2_asset.svg", "/woman.svg"];

interface Props {
  reviews: HomepageReviewCard[];
}

function StarRow({ rating }: { rating: number }) {
  const stars = Math.min(5, Math.max(1, Math.round(rating)));
  return (
    <span className="text-[#fda600] text-xl" aria-label={`${stars} out of 5 stars`}>
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
      style={{ boxShadow: "0px 4px 25px 0px #0000001A" }}
      className="flex flex-col md:flex-row items-center gap-6 py-8 px-8 border border-[#D9D9D9] rounded-2xl hover:border-[#FDA600] transition-colors duration-300 group"
    >
      {/* Avatar */}
      <div className="relative w-[80px] h-[80px] rounded-full overflow-hidden shrink-0 ring-2 ring-[#FDA600]/30 group-hover:ring-[#FDA600] transition-all">
        <Image
          src={avatarSrc}
          alt={review.reviewer_name}
          fill
          className="object-cover"
          sizes="80px"
          onError={() => {
            // Next.js Image falls back gracefully — no JS error surfaced
          }}
        />
      </div>

      {/* Content */}
      <div className="flex flex-col items-center md:items-start gap-2">
        <StarRow rating={review.rating} />
        <p className="font-raleway text-center md:text-left text-lg text-[#333] leading-relaxed">
          &ldquo;{review.review_text}&rdquo;
        </p>
        {review.product_title && (
          <p className="font-raleway text-xs text-[#01454A] uppercase tracking-wide">
            {review.product_title}
          </p>
        )}
        <p className="font-raleway font-semibold text-xl text-black">
          {review.reviewer_name}
        </p>
      </div>
    </div>
  );
}

export function HomepageReviewsSection({ reviews }: Props) {
  // Use live API reviews; fall back to static if API returned nothing
  const displayReviews = reviews && reviews.length > 0 ? reviews : FALLBACK_REVIEWS;
  const dotCount = Math.min(4, displayReviews.length);

  return (
    <div className="px-5 py-10 md:p-10 lg:p-20 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
        <h2 className="font-bon_foyage text-5xl text-[#333]">Our Reviews</h2>
        {reviews.length > 0 && (
          <p className="font-raleway text-sm text-[#848484]">
            Based on {reviews.length}+ verified purchase{reviews.length !== 1 ? "s" : ""}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {displayReviews.map((review, i) => (
          <ReviewCard key={review.id} review={review} index={i} />
        ))}
      </div>

      {/* Dot pagination indicators */}
      <div className="flex items-center gap-3 justify-center pt-4">
        {Array.from({ length: dotCount }).map((_, i) => (
          <span
            key={i}
            className={
              i === 0
                ? "w-6 h-6 rounded-full bg-[#01454A] border-2 border-[#01454A]"
                : "w-4 h-4 rounded-full bg-transparent border-2 border-[#01454A]/40"
            }
          />
        ))}
      </div>
    </div>
  );
}

export default HomepageReviewsSection;
