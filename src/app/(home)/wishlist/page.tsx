"use client";
import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingCart, Trash2, AlertCircle } from "lucide-react";
import { useWishlist, useToggleWishlist } from "@/features/product";
import type { WishlistItem } from "@/features/product";
import { ProductGridSkeleton } from "@/features/product";
import { useAddCartItem } from "@/features/cart";

// ── Wishlist Item Card ───────────────────────────────────────────────────────
function WishlistCard({ item }: { item: WishlistItem }) {
  const toggleWishlist = useToggleWishlist();
  const addToCart = useAddCartItem();

  // WishlistItem wraps a nested ProductListItem
  const product = item.product;
  const imageSrc = product.image_url || "/gown.svg";
  const price = parseFloat(String(product.price ?? 0));

  return (
    <div
      style={{ boxShadow: "0px 2px 16px 0px #0000001A" }}
      className="group relative bg-white rounded-2xl overflow-hidden border border-[#F0F2F5] flex flex-col"
    >
      {/* Image */}
      <Link
        href={`/products/${product.slug}`}
        className="relative h-52 block bg-[#F8F9FC]"
      >
        <Image
          src={imageSrc}
          alt={product.title}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
        />
      </Link>

      {/* Body */}
      <div className="p-4 flex flex-col gap-3 flex-1">
        <Link
          href={`/products/${product.slug}`}
          className="font-raleway font-semibold text-base text-[#141414] line-clamp-2 hover:text-[#fda600] transition-colors"
        >
          {product.title}
        </Link>
        <p className="font-raleway font-bold text-lg text-[#01454A]">
          ₦{price.toLocaleString("en-NG")}
        </p>

        {/* Actions */}
        <div className="flex gap-2 mt-auto">
          <button
            type="button"
            onClick={() =>
              addToCart.mutate({ product_id: product.id, quantity: 1 })
            }
            disabled={addToCart.isPending}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-[#01454A] text-white text-sm font-semibold font-raleway rounded-full hover:bg-[#01454A]/90 transition-colors disabled:opacity-60"
          >
            <ShoppingCart size={16} />
            {addToCart.isPending ? "Adding…" : "Add to Cart"}
          </button>
          <button
            type="button"
            onClick={() => toggleWishlist.mutate(product.slug)}
            disabled={toggleWishlist.isPending}
            aria-label="Remove from wishlist"
            className="p-2.5 rounded-full border border-[#F56630] text-[#F56630] hover:bg-[#F56630] hover:text-white transition-colors disabled:opacity-60"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Wishlist Client ─────────────────────────────────────────────────────
function WishlistClient() {
  const { data, isLoading, isError } = useWishlist();
  const items: WishlistItem[] = data?.results ?? [];

  if (isLoading) return <ProductGridSkeleton count={4} />;

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
        <AlertCircle size={48} className="text-red-400" />
        <p className="font-raleway text-lg text-[#475367]">
          Could not load your wishlist. Please try again later.
        </p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-6">
        <Heart size={64} className="text-[#D9D9D9]" />
        <p className="font-raleway text-xl text-[#475367] text-center max-w-md">
          Nothing here yet! Find something you love and add it to your wishlist.
        </p>
        <Link
          href="/categories"
          className="px-8 py-3 rounded-full bg-[#01454A] text-white font-semibold font-raleway hover:bg-[#012e32] transition-colors"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      {items.map((item) => (
        <WishlistCard key={item.id} item={item} />
      ))}
    </div>
  );
}

// ── Page Export ──────────────────────────────────────────────────────────────
export default function WishlistPage() {
  return (
    <div className="py-10 px-5 md:px-10 lg:px-24 space-y-8">
      {/* Breadcrumb */}
      <div className="flex items-center justify-between">
        <div className="font-raleway font-medium text-[#475367] text-sm">
          <Link href="/" className="hover:text-[#fda600] transition-colors">
            Home
          </Link>{" "}
          &gt;{" "}
          <span className="text-[#fda600]">Wishlist</span>
        </div>
        <Link
          href="/get-measured"
          className="px-6 py-2.5 rounded-full bg-[#01454A] text-white text-sm font-semibold font-raleway hover:bg-[#012e32] transition-colors"
        >
          Get Measured
        </Link>
      </div>

      {/* Header */}
      <div>
        <h1 className="font-bon_foyage text-4xl md:text-5xl text-[#141414] flex items-center gap-3">
          Your Wishlist
          <Heart size={36} className="text-[#fda600]" />
        </h1>
        <p className="font-raleway text-base text-[#475367] mt-2">
          Save items you love and come back for them anytime.
        </p>
      </div>

      {/* Live wishlist grid via TanStack Query */}
      <Suspense fallback={<ProductGridSkeleton count={4} />}>
        <WishlistClient />
      </Suspense>
    </div>
  );
}
