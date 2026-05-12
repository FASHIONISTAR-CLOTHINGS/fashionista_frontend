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

import { useClientWishlist } from "@/features/client/hooks/use-client-wishlist";
import { WishlistNudge } from "@/features/catalog/components/WishlistNudge";

/**
 * Reads the authenticated user's wishlist count and conditionally
 * mounts the WishlistNudge sticky bar.
 *
 * If the user is unauthenticated or the query fails, returns null silently
 * (useClientWishlist will return { data: undefined }).
 */
export function WishlistNudgeClient() {
  const { data: wishlist } = useClientWishlist();

  // getWishlist() returns WishlistItem[] — a plain array, not a paginated response.
  const count = wishlist?.length ?? 0;

  return <WishlistNudge wishlistCount={count} />;
}
