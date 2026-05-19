/**
 * @file WishlistNudgeClient.tsx
 * @description "use client" boundary that reads the live wishlist count from
 * TanStack Query and mounts the WishlistNudge sticky bar.
 *
 * Why a separate file? The (home)/layout.tsx is a Server Component.
 * Revenue components that need client hooks must live in a dedicated
 * "use client" subtree, imported by the server layout.
 *
 * Placement: rendered inside (home)/layout.tsx, outside <main>.
 * z-index: 40 — above sticky nav (z-30), below modals (z-50).
 */
"use client";

import { usePathname } from "next/navigation";
import { useWishlist } from "@/features/product";
import { WishlistNudge } from "@/features/catalog/components/WishlistNudge";

const COMMERCE_ROUTE_PREFIXES = [
  "/",
  "/products",
  "/wishlist",
] as const;

/**
 * Reads the canonical wishlist count and conditionally
 * mounts the WishlistNudge sticky bar.
 *
 * Because the underlying product wishlist query supports guest session keys
 * and authenticated users, the nudge stays in sync across login merges.
 */
export function WishlistNudgeClient() {
  const pathname = usePathname();
  const isCommerceRoute = COMMERCE_ROUTE_PREFIXES.some((prefix) =>
    prefix === "/" ? pathname === "/" : pathname.startsWith(prefix),
  );

  const { data: wishlist } = useWishlist();
  const count = wishlist?.results?.length ?? 0;

  if (!isCommerceRoute) {
    return null;
  }

  return <WishlistNudge wishlistCount={count} />;
}
