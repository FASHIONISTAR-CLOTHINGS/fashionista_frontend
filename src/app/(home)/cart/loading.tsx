import { CartPageSkeleton } from "@/features/cart";

/** Instant PPR skeleton while CartPage client component hydrates. */
export default function CartLoading() {
  return <CartPageSkeleton />;
}
