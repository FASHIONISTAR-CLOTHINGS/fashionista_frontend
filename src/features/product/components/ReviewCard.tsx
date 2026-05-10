/**
 * @file ReviewCard.tsx
 * @description Product review card component.
 * Updated to use canonical ProductReview type from product.types.ts.
 *
 * Canonical field mapping:
 *  reviewer_name  → reviewer_display
 *  reviewer_avatar → reviewer_avatar_url
 *  comment        → review
 *  helpful_count  → helpful_votes
 *  vendor_reply   → reply
 *  is_verified_purchase → removed (not in backend schema)
 */
import Image from "next/image";
import type { ProductReview } from "../types/product.types";

interface ReviewCardProps {
  review: ProductReview;
  /** @default false - show vendor's reply if present */
  showReply?: boolean;
}

const StarRating = ({ rating }: { rating: number }) => (
  <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
    {Array.from({ length: 5 }).map((_, i) => (
      <span
        key={i}
        className={`text-sm ${i < rating ? "text-[#FDA600]" : "text-gray-300"}`}
        aria-hidden="true"
      >
        ★
      </span>
    ))}
  </div>
);

const ReviewCard = ({ review, showReply = false }: ReviewCardProps) => {
  return (
    <article className="flex flex-col gap-3">
      {/* Reviewer info + rating */}
      <div className="flex items-center gap-3 md:gap-4">
        {review.reviewer_avatar_url ? (
          <Image
            src={review.reviewer_avatar_url}
            alt={`${review.reviewer_display}'s avatar`}
            width={49}
            height={49}
            className="w-9 h-9 md:w-[49px] md:h-[49px] rounded-full object-cover flex-shrink-0"
          />
        ) : (
          <div className="w-9 h-9 md:w-[49px] md:h-[49px] rounded-full bg-[#01454A]/10 flex items-center justify-center flex-shrink-0">
            <span className="text-[#01454A] font-semibold text-sm">
              {review.reviewer_display.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        <div className="flex flex-col gap-0.5">
          <p className="font-satoshi font-medium text-sm md:text-base text-black leading-tight">
            {review.reviewer_display}
          </p>
          <div className="flex items-center gap-2">
            <StarRating rating={review.rating} />
          </div>
        </div>
        <time
          className="ml-auto text-xs text-gray-400 hidden md:block"
          dateTime={review.created_at}
        >
          {new Date(review.created_at).toLocaleDateString("en-NG", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </time>
      </div>

      {/* Review comment */}
      <p className="font-satoshi text-[11px] leading-relaxed md:text-base text-[#282828]">
        {review.review}
      </p>

      {/* Helpful votes */}
      {review.helpful_votes > 0 && (
        <p className="text-xs text-gray-400">
          {review.helpful_votes} {review.helpful_votes === 1 ? "person" : "people"} found this helpful
        </p>
      )}

      {/* Vendor reply */}
      {showReply && review.reply && (
        <div className="ml-4 pl-4 border-l-2 border-[#FDA600]/40 mt-1">
          <p className="text-xs font-semibold text-[#01454A] mb-1">Vendor Reply</p>
          <p className="font-satoshi text-[11px] md:text-sm text-[#282828]">
            {review.reply}
          </p>
        </div>
      )}
    </article>
  );
};

export default ReviewCard;
