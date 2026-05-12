"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, ShoppingCart, Trash2, ArrowRight, Star } from "lucide-react";

interface WishlistItem {
  id: string;
  name: string;
  vendor: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  rating: number;
  inStock: boolean;
}

const MOCK_WISHLIST: WishlistItem[] = [
  {
    id: "1",
    name: "Adire Silk Kaftan",
    vendor: "Ankara Luxe",
    price: 28000,
    originalPrice: 35000,
    image: "/placeholder-product.jpg",
    category: "Traditional",
    rating: 4.8,
    inStock: true,
  },
  {
    id: "2",
    name: "Men's Agbada Set",
    vendor: "Heritage Fabrics",
    price: 55000,
    image: "/placeholder-product.jpg",
    category: "Traditional",
    rating: 4.6,
    inStock: true,
  },
  {
    id: "3",
    name: "Ankara Blazer Dress",
    vendor: "Nonso Couture",
    price: 19500,
    originalPrice: 22000,
    image: "/placeholder-product.jpg",
    category: "Contemporary",
    rating: 4.9,
    inStock: false,
  },
  {
    id: "4",
    name: "Aso-oke Gele Set",
    vendor: "Lagos Weave Co.",
    price: 12000,
    image: "/placeholder-product.jpg",
    category: "Accessories",
    rating: 4.7,
    inStock: true,
  },
];

function WishlistCard({
  item,
  onRemove,
}: {
  item: WishlistItem;
  onRemove: (id: string) => void;
}) {
  const discount = item.originalPrice
    ? Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)
    : null;

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-[1.5rem] border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-[var(--card-shadow)] transition hover:shadow-[var(--card-hover-shadow)]">
      {/* Image area */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[hsl(var(--muted))]">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[hsl(var(--accent)/0.15)]">
            <Heart className="h-8 w-8 text-[hsl(var(--accent))]" />
          </div>
        </div>

        {/* Badges */}
        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {discount && (
            <span className="inline-flex items-center rounded-full bg-[hsl(var(--destructive))] px-2.5 py-1 text-xs font-bold text-white">
              -{discount}%
            </span>
          )}
          {!item.inStock && (
            <span className="inline-flex items-center rounded-full bg-[hsl(var(--muted))] px-2.5 py-1 text-xs font-semibold text-[hsl(var(--muted-foreground))]">
              Out of stock
            </span>
          )}
        </div>

        {/* Remove button */}
        <button
          type="button"
          onClick={() => onRemove(item.id)}
          aria-label={`Remove ${item.name} from wishlist`}
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-[hsl(var(--card))] text-[hsl(var(--muted-foreground))] opacity-0 shadow-sm transition group-hover:opacity-100 hover:text-[hsl(var(--destructive))]"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[hsl(var(--accent))]">
            {item.category}
          </p>
          <h3 className="mt-1 font-semibold leading-snug text-[hsl(var(--foreground))]">
            {item.name}
          </h3>
          <p className="mt-0.5 text-sm text-[hsl(var(--muted-foreground))]">
            by {item.vendor}
          </p>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-1.5">
          <Star className="h-3.5 w-3.5 fill-[hsl(var(--accent))] text-[hsl(var(--accent))]" />
          <span className="text-xs font-semibold text-[hsl(var(--foreground))]">
            {item.rating}
          </span>
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-2">
          <span className="text-xl font-bold text-[hsl(var(--foreground))]">
            ₦{item.price.toLocaleString()}
          </span>
          {item.originalPrice && (
            <span className="text-sm text-[hsl(var(--muted-foreground))] line-through">
              ₦{item.originalPrice.toLocaleString()}
            </span>
          )}
        </div>

        {/* CTA */}
        <button
          type="button"
          disabled={!item.inStock}
          className="mt-auto flex items-center justify-center gap-2 rounded-full bg-[#FDA600] py-2.5 text-sm font-semibold text-black transition hover:bg-[#f28705] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ShoppingCart className="h-4 w-4" />
          {item.inStock ? "Add to cart" : "Notify me"}
        </button>
      </div>
    </div>
  );
}

export function ClientWishlistView() {
  const [wishlist, setWishlist] = useState<WishlistItem[]>(MOCK_WISHLIST);
  const [filter, setFilter] = useState<"all" | "in_stock" | "on_sale">("all");

  const remove = (id: string) => setWishlist((all) => all.filter((w) => w.id !== id));

  const filtered = wishlist.filter((item) => {
    if (filter === "in_stock") return item.inStock;
    if (filter === "on_sale") return !!item.originalPrice;
    return true;
  });

  return (
    <div className="space-y-8 py-4">
      {/* Header */}
      <div>
        <h1 className="font-bon_foyage text-5xl text-[hsl(var(--foreground))]">
          Wishlist
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-[hsl(var(--muted-foreground))]">
          Items you&apos;ve saved for later. We&apos;ll let you know when prices drop.
        </p>
      </div>

      {wishlist.length > 0 && (
        <>
          {/* Filter bar */}
          <div className="flex items-center gap-2">
            {(["all", "in_stock", "on_sale"] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  filter === f
                    ? "bg-[#FDA600] text-black"
                    : "border border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
                }`}
              >
                {f === "all" ? `All (${wishlist.length})` : f === "in_stock" ? "In stock" : "On sale"}
              </button>
            ))}
          </div>

          {/* Grid */}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((item) => (
              <WishlistCard key={item.id} item={item} onRemove={remove} />
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="rounded-[2rem] bg-[hsl(var(--card))] p-10 text-center shadow-[var(--card-shadow)]">
              <p className="text-base font-semibold text-[hsl(var(--foreground))]">No items match this filter.</p>
            </div>
          )}

          {/* CTA */}
          <div className="flex justify-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full border border-[hsl(var(--border))] px-6 py-3 text-sm font-semibold text-[hsl(var(--foreground))] transition hover:bg-[hsl(var(--muted))]"
            >
              Keep shopping <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </>
      )}

      {wishlist.length === 0 && (
        <div className="flex flex-col items-center gap-4 rounded-[2rem] bg-[hsl(var(--card))] p-16 text-center shadow-[var(--card-shadow)]">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[hsl(var(--accent)/0.12)]">
            <Heart className="h-8 w-8 text-[hsl(var(--accent))]" />
          </div>
          <div>
            <p className="text-xl font-bold text-[hsl(var(--foreground))]">Your wishlist is empty</p>
            <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">
              Tap the heart icon on any product to save it here.
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full bg-[#FDA600] px-6 py-3 text-sm font-semibold text-black transition hover:bg-[#f28705]"
          >
            Browse products <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}
    </div>
  );
}
