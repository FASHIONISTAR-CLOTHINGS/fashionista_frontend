/**
 * @file ReviewScroll.tsx
 * @description Horizontally scrollable review carousel.
 * Uses live `useProductReviews()` hook + canonical ProductReview type.
 */
"use client";
import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ReviewCard from "./ReviewCard";
import type { ProductReview } from "../types/product.types";

interface ReviewScrollProps {
  /** Pass live reviews from useProductReviews() or mock data for Storybook */
  reviews: ProductReview[];
  /** Total review count for display label */
  totalCount?: number;
}

const ReviewScroll = ({ reviews, totalCount }: ReviewScrollProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const SCROLL_AMOUNT = 600;

  const scroll = (direction: "left" | "right") => {
    scrollRef.current?.scrollBy({
      left: direction === "left" ? -SCROLL_AMOUNT : SCROLL_AMOUNT,
      behavior: "smooth",
    });
  };

  if (!reviews.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-400">
        <p className="text-sm md:text-base">No reviews yet. Be the first to review!</p>
      </div>
    );
  }

  return (
    <section aria-label="Customer reviews" className="flex flex-col gap-8">
      {/* Section header */}
      <div className="px-5 md:px-8 lg:px-28 flex items-center justify-between">
        <h2 className="font-satoshi font-semibold text-base md:text-xl text-black">
          Customer Reviews
          {totalCount !== undefined && (
            <span className="ml-2 text-gray-400 font-normal text-sm md:text-base">
              ({totalCount.toLocaleString()})
            </span>
          )}
        </h2>
      </div>

      {/* Scroll container */}
      <div
        ref={scrollRef}
        role="list"
        className="px-5 md:px-8 lg:pl-28 hide_scrollbar gap-6 grid grid-flow-col
                   auto-cols-[85%] sm:auto-cols-[70%] md:auto-cols-[45%] lg:auto-cols-[35%]
                   overflow-x-auto overscroll-contain"
      >
        {reviews.map((review) => (
          <div key={review.id} role="listitem" className="h-full">
            <ReviewCard review={review} showReply />
          </div>
        ))}
      </div>

      {/* Navigation controls */}
      <div className="px-5 md:px-8 lg:px-28 flex gap-3 items-center">
        <button
          onClick={() => scroll("left")}
          aria-label="Scroll reviews left"
          className="w-10 h-10 outline-none flex justify-center items-center
                     border border-black rounded-full transition-colors
                     hover:border-[#FDA600] hover:bg-[#FDA600]/5
                     focus-visible:ring-2 focus-visible:ring-[#FDA600]"
        >
          <ChevronLeft size={20} strokeWidth={1.5} />
        </button>
        <button
          onClick={() => scroll("right")}
          aria-label="Scroll reviews right"
          className="w-10 h-10 outline-none flex justify-center items-center
                     border border-black rounded-full transition-colors
                     hover:border-[#FDA600] hover:bg-[#FDA600]/5
                     focus-visible:ring-2 focus-visible:ring-[#FDA600]"
        >
          <ChevronRight size={20} strokeWidth={1.5} />
        </button>
      </div>
    </section>
  );
};

export default ReviewScroll;
