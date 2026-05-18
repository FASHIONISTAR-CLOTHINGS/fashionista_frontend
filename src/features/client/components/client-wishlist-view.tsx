"use client";

/**
 * @file client-wishlist-view.tsx
 * @description Live authenticated wishlist view — 2027 Edition.
 *
 * Data flow:
 *  - Read:   useClientWishlist() → apiSync DRF /api/v1/client/wishlist/
 *  - Toggle: useToggleWishlist() → optimistic remove with instant UI feedback
 *  - Add:    useAddCartItem()    → optimistic add-to-cart from wishlist card
 *
 * UX patterns:
 *  - Heart icon flips instantly on remove (optimistic).
 *  - Add-to-cart shows a spinner on the pressed card only.
 *  - Skeleton grid shown during first load.
 *  - Empty states for "nothing saved" and "filter yields zero results".
 */

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Heart,
  Loader2,
  ShoppingCart,
  Star,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import {
  useClientWishlist,
  useToggleWishlist,
} from "@/features/client/hooks/use-client-wishlist";
import { useAddCartItem } from "@/features/cart/hooks/use-cart";
import type { WishlistItem } from "@/features/client/types/client.types";
import { FashionistarImage } from "@/components/media";
import { formatCurrency } from "@/lib/formatting";

// ── Types ─────────────────────────────────────────────────────────────────────

/**
 * Normalised wishlist row used internally by this view.
 * The backend's /v1/client/wishlist/ may return the canonical WishlistItem
 * shape OR a newer shape with product_id at root — we coerce to this.
 */
interface WishlistRow {
  id: string;
  /** The product UUID (coerced from WishlistItem.product.id) */
  productId: string;
  slug: string;
  title: string;
  vendorName?: string;
  categoryName?: string;
  price: number;
  oldPrice: number | null;
  imageUrl: string | null;
  inStock: boolean;
  rating: number;
}

/** Coerce any WishlistItem to our flat WishlistRow. */
function toRow(item: WishlistItem): WishlistRow {
  const p = item.product;
  const price = typeof p.price === "number" ? p.price : parseFloat(String(p.price ?? 0));
  const oldPrice =
    p.old_price != null
      ? typeof p.old_price === "number"
        ? p.old_price
        : parseFloat(String(p.old_price))
      : null;
  return {
    id: String(item.id),
    productId: p.id,
    slug: p.slug ?? p.id,
    title: p.title,
    vendorName: p.vendor_name,
    categoryName: undefined,
    price,
    oldPrice,
    imageUrl: p.image ?? null,
    inStock: true, // WishlistItem doesn't include in_stock; default to true
    rating: 0,
  };
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function WishlistSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse overflow-hidden rounded-[1.5rem] border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-[var(--card-shadow)]"
        >
          <div className="aspect-[4/3] w-full bg-[hsl(var(--muted))]" />
          <div className="space-y-3 p-4">
            <div className="h-3 w-1/3 rounded bg-[hsl(var(--muted))]" />
            <div className="h-4 w-2/3 rounded bg-[hsl(var(--muted))]" />
            <div className="h-3 w-1/2 rounded bg-[hsl(var(--muted))]" />
            <div className="h-10 w-full rounded-full bg-[hsl(var(--muted))]" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Wishlist Card ─────────────────────────────────────────────────────────────

function WishlistCard({ row }: { row: WishlistRow }) {
  const { mutate: toggleWishlist } = useToggleWishlist();
  const { mutate: addToCart, isPending: addingToCart } = useAddCartItem();

  const { productId, slug, title, vendorName, categoryName, price, oldPrice, imageUrl, inStock, rating } = row;
  const discount =
    oldPrice && oldPrice > price
      ? Math.round(((oldPrice - price) / oldPrice) * 100)
      : null;

  const handleRemove = () => {
    toggleWishlist(productId, {
      onSuccess: () => toast.success("Removed from wishlist."),
      onError: () => toast.error("Could not remove from wishlist."),
    });
  };

  const handleAddToCart = () => {
    addToCart(
      { product_id: productId, product_slug: slug, quantity: 1 },
      {
        onSuccess: () => toast.success(`${title} added to cart! 🛍️`),
        onError: () => toast.error("Could not add to cart — please try again."),
      },
    );
  };

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-[1.5rem] border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-[var(--card-shadow)] transition hover:shadow-[var(--card-hover-shadow)]">
      {/* Image */}
      <Link
        href={`/products/${slug}`}
        className="relative aspect-[4/3] w-full overflow-hidden bg-[hsl(var(--muted))]"
      >
        {imageUrl ? (
          <FashionistarImage
            src={imageUrl}
            alt={title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
            className="h-full w-full"
            imgClassName="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Heart className="h-10 w-10 text-[hsl(var(--accent)/0.4)]" />
          </div>
        )}

        {/* Badges */}
        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {discount && (
            <span className="inline-flex items-center rounded-full bg-[hsl(var(--destructive))] px-2.5 py-1 text-xs font-bold text-white">
              -{discount}%
            </span>
          )}
          {!inStock && (
            <span className="inline-flex items-center rounded-full bg-[hsl(var(--muted))] px-2.5 py-1 text-xs font-semibold text-[hsl(var(--muted-foreground))]">
              Out of stock
            </span>
          )}
        </div>

        {/* Remove button */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            handleRemove();
          }}
          aria-label={`Remove ${title} from wishlist`}
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-[hsl(var(--card))] text-[hsl(var(--muted-foreground))] opacity-0 shadow-sm transition group-hover:opacity-100 hover:text-[hsl(var(--destructive))]"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </Link>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          {categoryName && (
            <p className="text-xs font-semibold uppercase tracking-wider text-[hsl(var(--accent))]">
              {categoryName}
            </p>
          )}
          <Link
            href={`/products/${slug}`}
            className="mt-0.5 block font-semibold leading-snug text-[hsl(var(--foreground))] transition hover:text-[hsl(var(--primary))]"
          >
            {title}
          </Link>
          <p className="mt-0.5 text-sm text-[hsl(var(--muted-foreground))]">
            by {vendorName}
          </p>
        </div>

        {/* Rating */}
        {rating > 0 && (
          <div className="flex items-center gap-1.5">
            <Star className="h-3.5 w-3.5 fill-[hsl(var(--accent))] text-[hsl(var(--accent))]" />
            <span className="text-xs font-semibold text-[hsl(var(--foreground))]">
              {rating.toFixed(1)}
            </span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-baseline gap-2">
          <span className="text-xl font-bold text-[hsl(var(--foreground))]">
            {formatCurrency(price, "NGN")}
          </span>
          {oldPrice && (
            <span className="text-sm text-[hsl(var(--muted-foreground))] line-through">
              {formatCurrency(oldPrice, "NGN")}
            </span>
          )}
        </div>

        {/* CTA */}
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={!inStock || addingToCart}
          className="mt-auto flex items-center justify-center gap-2 rounded-full bg-[hsl(var(--accent))] py-2.5 text-sm font-semibold text-[hsl(var(--accent-foreground))] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {addingToCart ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ShoppingCart className="h-4 w-4" />
          )}
          {inStock ? "Add to cart" : "Out of stock"}
        </button>
      </div>
    </div>
  );
}

// ── Main View ─────────────────────────────────────────────────────────────────

type FilterTab = "all" | "in_stock" | "on_sale";

export function ClientWishlistView() {
  const [filter, setFilter] = useState<FilterTab>("all");
  const { data: rawData, isLoading, isError } = useClientWishlist();

  // Normalize: coerce WishlistItem[] → flat WishlistRow[]
  const rawItems = Array.isArray(rawData)
    ? (rawData as WishlistItem[])
    : ((rawData as unknown as { data?: WishlistItem[] })?.data ?? []);
  const wishlist: WishlistRow[] = rawItems.map(toRow);

  const filtered = wishlist.filter((row) => {
    if (filter === "in_stock") return row.inStock;
    if (filter === "on_sale") return row.oldPrice !== null && row.oldPrice > row.price;
    return true;
  });

  // ── Loading ────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="space-y-8 py-4">
        <div>
          <h1 className="font-bon_foyage text-5xl text-[hsl(var(--foreground))]">
            Wishlist
          </h1>
          <div className="mt-3 h-4 w-72 animate-pulse rounded bg-[hsl(var(--muted))]" />
        </div>
        <WishlistSkeleton />
      </div>
    );
  }

  // ── Error ──────────────────────────────────────────────────────────────────
  if (isError) {
    return (
      <div className="space-y-8 py-4">
        <h1 className="font-bon_foyage text-5xl text-[hsl(var(--foreground))]">
          Wishlist
        </h1>
        <div className="flex flex-col items-center gap-4 rounded-[2rem] bg-[hsl(var(--card))] p-12 text-center shadow-[var(--card-shadow)]">
          <Heart className="h-12 w-12 text-[hsl(var(--destructive)/0.4)]" />
          <p className="text-lg font-semibold text-[hsl(var(--foreground))]">
            Could not load your wishlist
          </p>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            Please check your connection and sign in again.
          </p>
          <Link
            href="/auth/sign-in"
            className="inline-flex items-center gap-2 rounded-full bg-[hsl(var(--accent))] px-6 py-3 text-sm font-semibold text-[hsl(var(--accent-foreground))] transition hover:brightness-110"
          >
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  // ── Empty state ────────────────────────────────────────────────────────────
  if (wishlist.length === 0) {
    return (
      <div className="space-y-8 py-4">
        <div>
          <h1 className="font-bon_foyage text-5xl text-[hsl(var(--foreground))]">
            Wishlist
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[hsl(var(--muted-foreground))]">
            Items you&apos;ve saved for later.
          </p>
        </div>
        <div className="flex flex-col items-center gap-4 rounded-[2rem] bg-[hsl(var(--card))] p-16 text-center shadow-[var(--card-shadow)]">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[hsl(var(--accent)/0.12)]">
            <Heart className="h-8 w-8 text-[hsl(var(--accent))]" />
          </div>
          <div>
            <p className="text-xl font-bold text-[hsl(var(--foreground))]">
              Your wishlist is empty
            </p>
            <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">
              Tap the heart icon on any product to save it here.
            </p>
          </div>
          <Link
            href="/collections"
            className="inline-flex items-center gap-2 rounded-full bg-[hsl(var(--accent))] px-6 py-3 text-sm font-semibold text-[hsl(var(--accent-foreground))] transition hover:brightness-110"
          >
            Browse products <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  // ── Loaded + items ─────────────────────────────────────────────────────────
  return (
    <div className="space-y-8 py-4">
      {/* Header */}
      <div>
        <h1 className="font-bon_foyage text-5xl text-[hsl(var(--foreground))]">
          Wishlist
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-[hsl(var(--muted-foreground))]">
          {wishlist.length} saved item{wishlist.length !== 1 ? "s" : ""} — we&apos;ll
          notify you when prices drop.
        </p>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-2">
        {(["all", "in_stock", "on_sale"] as FilterTab[]).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              filter === f
                ? "bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))]"
                : "border border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
            }`}
          >
            {f === "all"
              ? `All (${wishlist.length})`
              : f === "in_stock"
                ? "In stock"
                : "On sale"}
          </button>
        ))}
      </div>

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((row) => (
            <WishlistCard key={row.id} row={row} />
          ))}
        </div>
      ) : (
        <div className="rounded-[2rem] bg-[hsl(var(--card))] p-10 text-center shadow-[var(--card-shadow)]">
          <p className="text-base font-semibold text-[hsl(var(--foreground))]">
            No items match this filter.
          </p>
        </div>
      )}

      {/* CTA */}
      <div className="flex justify-center">
        <Link
          href="/collections"
          className="inline-flex items-center gap-2 rounded-full border border-[hsl(var(--border))] px-6 py-3 text-sm font-semibold text-[hsl(var(--foreground))] transition hover:bg-[hsl(var(--muted))]"
        >
          Keep shopping <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
