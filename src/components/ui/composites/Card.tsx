/**
 * @file Card.tsx
 * @description Production-grade Card composite component system.
 *
 * Exports:
 *  - `Card`           – root container (design-system tokens, rounded-2xl, shadow)
 *  - `CardHeader`     – flex column header slot
 *  - `CardTitle`      – polymorphic heading (default: <p>, override with `as`)
 *  - `CardDescription`– muted sub-title
 *  - `CardContent`    – padded body slot
 *  - `CardFooter`     – padded footer slot with separator line
 *  - `CardAction`     – inline button CTA
 *  - `CardLink`       – Next.js Link styled as a CTA button (solid/outline variant)
 *  - `CardLinkOutline`– border-only Link variant
 *  - `ProductCard`    – legacy product card (image, title, vendor, rating, price,
 *                       wishlist heart, add-to-cart)
 *
 * All components are fully accessible (focus-ring, ARIA-ready) and use
 * `hsl(var(--*))` CSS tokens from the design system so they respond to
 * dark-mode automatically.
 *
 * @version 2027-enterprise
 */

"use client";

import * as React from "react";
import NextLink from "next/link";
import Image from "next/image";

import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────
// DESIGN-SYSTEM CARD PRIMITIVES
// ─────────────────────────────────────────────────────────────────────────────

/** Root card container. Forwards ref and all div props. */
const Card = React.forwardRef<
  React.ComponentRef<"div">,
  React.ComponentPropsWithoutRef<"div"> & { glass?: boolean }
>((({ className, glass, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-2xl border overflow-hidden transition-all duration-300",
      glass
        ? "bg-white/5 backdrop-blur-sm border-white/10 text-white shadow-lg shadow-black/10"
        : "bg-[hsl(var(--background))] border-[hsl(var(--border))] shadow-sm hover:shadow-md",
      className,
    )}
    {...props}
  />
)));
Card.displayName = "Card";

/** Header slot — vertically stacked with comfortable padding. */
const CardHeader = React.forwardRef<
  React.ComponentRef<"div">,
  React.ComponentPropsWithoutRef<"div">
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 px-6 py-5", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

/** Polymorphic card title. Use `as="h2"` to control heading semantics. */
const CardTitle = React.forwardRef<
  React.ComponentRef<"p">,
  React.ComponentPropsWithoutRef<"p"> & { as?: React.ElementType }
>(({ className, as: Component = "p", ...props }, ref) => (
  <Component
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight text-[hsl(var(--foreground))]",
      className,
    )}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

/** Muted sub-title beneath the card title. */
const CardDescription = React.forwardRef<
  React.ComponentRef<"p">,
  React.ComponentPropsWithoutRef<"p">
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-[hsl(var(--muted-foreground))]", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

/** Main body content slot with consistent padding. */
const CardContent = React.forwardRef<
  React.ComponentRef<"div">,
  React.ComponentPropsWithoutRef<"div">
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("px-6 py-5", className)} {...props} />
));
CardContent.displayName = "CardContent";

/** Footer slot — top border separator + padding. */
const CardFooter = React.forwardRef<
  React.ComponentRef<"div">,
  React.ComponentPropsWithoutRef<"div">
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex items-center px-6 py-4 border-t border-[hsl(var(--border))]",
      className,
    )}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

/** Inline button CTA anchored inside a card. */
const CardAction = React.forwardRef<
  React.ComponentRef<"button">,
  React.ComponentPropsWithoutRef<"button">
>(({ className, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center text-sm font-medium transition-colors",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] focus-visible:ring-offset-2",
      "disabled:opacity-50 disabled:pointer-events-none",
      "h-9 px-4 rounded-xl bg-[hsl(var(--background))] hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--accent-foreground))]",
      className,
    )}
    {...props}
  />
));
CardAction.displayName = "CardAction";

/** Solid-fill Next.js Link styled as a CTA button. Pass `isActive` for green variant. */
const CardLink = React.forwardRef<
  React.ComponentRef<typeof NextLink>,
  React.ComponentPropsWithoutRef<typeof NextLink> & { isActive?: boolean }
>(({ className, isActive, ...props }, ref) => (
  <NextLink
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center text-sm font-medium transition-colors",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] focus-visible:ring-offset-2",
      "disabled:opacity-50 disabled:pointer-events-none",
      "h-10 px-5 rounded-xl text-white shadow-md",
      isActive
        ? "bg-emerald-600 hover:bg-emerald-700"
        : "bg-black hover:bg-slate-800 dark:bg-white dark:text-black dark:hover:bg-slate-200",
      className,
    )}
    {...props}
  />
));
CardLink.displayName = "CardLink";

/** Border-only Next.js Link variant. */
const CardLinkOutline = React.forwardRef<
  React.ComponentRef<typeof NextLink>,
  React.ComponentPropsWithoutRef<typeof NextLink>
>(({ className, ...props }, ref) => (
  <NextLink
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center text-sm font-medium transition-colors",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] focus-visible:ring-offset-2",
      "disabled:opacity-50 disabled:pointer-events-none",
      "h-10 px-5 rounded-xl bg-transparent border border-[hsl(var(--border))] text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--accent-foreground))]",
      className,
    )}
    {...props}
  />
));
CardLinkOutline.displayName = "CardLinkOutline";

// ─────────────────────────────────────────────────────────────────────────────
// PRODUCT CARD — legacy catalog card from the original compounds folder
// ─────────────────────────────────────────────────────────────────────────────

interface ProductCardData {
  image: string;
  title: string;
  vendor: string;
  rating: number | string;
  price: number | string;
}

interface ProductCardProps {
  data: ProductCardData;
  onAddToCart?: () => void;
  onWishlist?: () => void;
}

/**
 * Legacy product card used in the public catalog grid.
 * Shows image with hover zoom, wishlist heart, rating star, price, and add-to-cart button.
 */
const ProductCard = ({ data, onAddToCart, onWishlist }: ProductCardProps) => {
  return (
    <div className="w-[45%] md:w-[30%] lg:w-[290px] flex flex-col group">
      {/* Image container */}
      <div className="relative overflow-hidden w-full" style={{ paddingBottom: "120%" }}>
        <Image
          src={data.image}
          alt={data.title}
          fill
          sizes="(max-width: 768px) 45vw, (max-width: 1024px) 30vw, 290px"
          className="object-cover group-hover:scale-105 transition-transform duration-300 ease-in-out"
        />

        {/* Wishlist heart */}
        <button
          aria-label="Add to wishlist"
          onClick={onWishlist}
          className="absolute right-3 top-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FDA600]"
        >
          <svg width="19" height="19" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="9.78951" cy="9.62252" r="8.95724" fill="#FDA600" fillOpacity="0.15" />
            <path
              d="M12.9589 6.63454C11.8913 5.9797 10.9596 6.24359 10.3999 6.66394C10.1703 6.8363 10.0556 6.92248 9.98807 6.92248C9.92056 6.92248 9.80582 6.8363 9.57628 6.66394C9.01656 6.24359 8.0848 5.9797 7.01723 6.63454C5.61617 7.49395 5.29915 10.3292 8.53084 12.7212C9.14638 13.1768 9.45414 13.4046 9.98807 13.4046C10.522 13.4046 10.8298 13.1768 11.4453 12.7212C14.677 10.3292 14.36 7.49395 12.9589 6.63454Z"
              stroke="#FDA600"
              strokeWidth="0.767763"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      {/* Info section */}
      <div className="flex flex-col justify-between mt-2 gap-1">
        <p className="font-bon-foyage md:text-[28px] text-lg py-1 leading-[17.82px] md:leading-7 text-black">
          {data.title}
        </p>

        <div className="flex justify-between items-center">
          <p className="font-satoshi text-[10.26px] leading-[13.86px] md:text-base md:leading-[22px] text-black">
            {data.vendor}
          </p>
          <div className="flex items-center gap-1">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M13.7276 3.44418L15.4874 6.99288C15.7274 7.48687 16.3673 7.9607 16.9073 8.05143L20.0969 8.58575C22.1367 8.92853 22.6167 10.4206 21.1468 11.8925L18.6671 14.3927C18.2471 14.8161 18.0172 15.6327 18.1471 16.2175L18.8571 19.3125C19.417 21.7623 18.1271 22.71 15.9774 21.4296L12.9877 19.6452C12.4478 19.3226 11.5579 19.3226 11.0079 19.6452L8.01827 21.4296C5.8785 22.71 4.57865 21.7522 5.13859 19.3125L5.84851 16.2175C5.97849 15.6327 5.74852 14.8161 5.32856 14.3927L2.84884 11.8925C1.389 10.4206 1.85895 8.92853 3.89872 8.58575L7.08837 8.05143C7.61831 7.9607 8.25824 7.48687 8.49821 6.99288L10.258 3.44418C11.2179 1.51861 12.7777 1.51861 13.7276 3.44418Z"
                fill="#FDA600"
              />
            </svg>
            <span className="font-satoshi text-[9px] leading-3 md:text-sm md:leading-5 text-[#4e4e4e]">
              {data.rating}
            </span>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <span className="font-satoshi font-bold md:text-xl text-[13px] leading-[18px] text-[#fda600]">
            ₦{data.price}.00
          </span>

          <button
            aria-label={`Add ${data.title} to cart`}
            onClick={onAddToCart}
            className="py-2 px-2.5 rounded-[40px] bg-[#fda600]/20 flex gap-[5px] hover:bg-[#fda600]/30 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FDA600]"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5.66667 12.3334H11.7193C15.459 12.3334 16.0278 9.98408 16.7175 6.55765C16.9165 5.56934 17.016 5.07519 16.7768 4.74597C16.5375 4.41675 16.0789 4.41675 15.1618 4.41675H4" stroke="#FDA600" strokeWidth="0.8" strokeLinecap="round" />
              <path d="M5.66683 12.3334L3.48244 1.92919C3.29695 1.18724 2.63031 0.666748 1.86554 0.666748H1.0835" stroke="#FDA600" strokeWidth="0.8" strokeLinecap="round" />
              <path d="M6.4 12.3333H6.05714C4.92102 12.3333 4 13.2927 4 14.4761C4 14.6733 4.1535 14.8333 4.34286 14.8333H13.5833" stroke="#FDA600" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M7.75 17.3333C8.44036 17.3333 9 16.7736 9 16.0833C9 15.3929 8.44036 14.8333 7.75 14.8333C7.05964 14.8333 6.5 15.3929 6.5 16.0833C6.5 16.7736 7.05964 17.3333 7.75 17.3333Z" stroke="#FDA600" strokeWidth="0.8" />
              <path d="M13.5835 17.3333C14.2739 17.3333 14.8335 16.7736 14.8335 16.0833C14.8335 15.3929 14.2739 14.8333 13.5835 14.8333C12.8931 14.8333 12.3335 15.3929 12.3335 16.0833C12.3335 16.7736 12.8931 17.3333 13.5835 17.3333Z" stroke="#FDA600" strokeWidth="0.8" />
            </svg>
            <span className="font-satoshi text-sm text-[#fda600]">Add</span>
          </button>
        </div>
      </div>
    </div>
  );
};
ProductCard.displayName = "ProductCard";

// ─────────────────────────────────────────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────────────────────────────────────────

export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  CardAction,
  CardLink,
  CardLinkOutline,
  ProductCard,
};

export default Card;
