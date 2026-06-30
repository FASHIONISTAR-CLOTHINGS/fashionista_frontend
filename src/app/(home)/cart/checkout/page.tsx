import type { Metadata } from "next";
import { Suspense } from "react";
import { CommerceRouteGuard } from "@/features/auth/components/CommerceRouteGuard";
import { CheckoutPage } from "@/features/cart/components/CheckoutPage";
import { CheckoutPageSkeleton } from "@/features/cart/components/CheckoutPageSkeleton";

export const metadata: Metadata = {
  title: "Checkout — FASHIONISTAR",
  description:
    "Review your order summary, enter your delivery details, and complete your secure purchase on FASHIONISTAR.",
  robots: { index: false, follow: false },
};

/**
 * Checkout route — App Router page.
 *
 * PPR strategy:
 *  - Static shell (header + skeleton) rendered at build time.
 *  - CheckoutPage client component reads cart from TanStack Query cache
 *    (already warm from the cart page visit).
 *  - Suspense shows the skeleton until hydration completes.
 */
export default function CheckoutRoutePage() {
  return (
    <CommerceRouteGuard fallback={<CheckoutPageSkeleton />}>
      <Suspense fallback={<CheckoutPageSkeleton />}>
        <CheckoutPage />
      </Suspense>
    </CommerceRouteGuard>
  );
}
