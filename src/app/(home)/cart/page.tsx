import type { Metadata } from "next";
import { Suspense } from "react";
import { CartPage } from "@/features/cart";
import { CartPageSkeleton } from "@/features/cart";

export const metadata: Metadata = {
  title: "Your Cart",
  description:
    "Review your selected items, apply coupon codes, and proceed to secure checkout on FASHIONISTAR AI.",
  robots: { index: false, follow: false },
};

/**
 * Cart route — App Router page.
 *
 * PPR strategy:
 *  - Static shell (header + skeleton) rendered at build time.
 *  - CartPage client component fetches live data via TanStack Query.
 *  - Suspense boundary shows shimmer skeleton until hydration completes.
 */
export default function CartRoutePage() {
  return (
    <Suspense fallback={<CartPageSkeleton />}>
      <CartPage />
    </Suspense>
  );
}
