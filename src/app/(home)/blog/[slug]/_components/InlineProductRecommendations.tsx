"use client";

import Link from "next/link";

interface InlineProductRecommendationsProps {
  tags?: string[];
}

interface RecommendedProduct {
  id: string;
  name: string;
  price: string;
  image: string;
  href: string;
}

const PRODUCTS_BY_TAG: Record<string, RecommendedProduct[]> = {
  measurements: [
    { id: "p1", name: "Premium Tailoring Service", price: "From ₦25,000", image: "/gown.svg", href: "/products?category=tailoring" },
    { id: "p2", name: "Custom Fit Agbada", price: "From ₦45,000", image: "/minimalist.svg", href: "/products?category=agbada" },
    { id: "p3", name: "Bespoke Senator Style", price: "From ₦30,000", image: "/vintage.svg", href: "/products?category=senator" },
  ],
  tailoring: [
    { id: "p1", name: "Premium Tailoring Service", price: "From ₦25,000", image: "/gown.svg", href: "/products?category=tailoring" },
    { id: "p2", name: "Custom Fit Agbada", price: "From ₦45,000", image: "/minimalist.svg", href: "/products?category=agbada" },
    { id: "p3", name: "Bespoke Senator Style", price: "From ₦30,000", image: "/vintage.svg", href: "/products?category=senator" },
  ],
  wedding: [
    { id: "p1", name: "Bridal Lace Gown", price: "From ₦150,000", image: "/gown.svg", href: "/products?category=bridal" },
    { id: "p2", name: "Groom's Agbada Set", price: "From ₦80,000", image: "/minimalist.svg", href: "/products?category=groom" },
    { id: "p3", name: "Aso-Ebi Collection", price: "From ₦20,000", image: "/vintage.svg", href: "/products?category=aso-ebi" },
  ],
  default: [
    { id: "p1", name: "Custom Tailored Outfit", price: "From ₦25,000", image: "/gown.svg", href: "/products" },
    { id: "p2", name: "Premium Fabric Collection", price: "From ₦5,000", image: "/minimalist.svg", href: "/products?category=fabric" },
    { id: "p3", name: "Accessorize Your Look", price: "From ₦3,000", image: "/vintage.svg", href: "/products?category=accessories" },
  ],
};

export function InlineProductRecommendations({ tags = [] }: InlineProductRecommendationsProps) {
  const products =
    tags.flatMap((tag) => PRODUCTS_BY_TAG[tag.toLowerCase()] ?? []).slice(0, 3) ||
    PRODUCTS_BY_TAG.default;

  const displayProducts = products.length > 0 ? products : PRODUCTS_BY_TAG.default;

  return (
    <div
      className="my-10 rounded-2xl border border-border bg-[hsl(var(--brand-cream))] p-6"
      data-testid="inline-product-recommendations"
    >
      <div className="mb-4 flex items-center gap-2">
        <svg className="h-5 w-5 text-[hsl(var(--accent))]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <h3 className="font-bon_foyage text-xl text-foreground">Complete the Look</h3>
        <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Recommended for You</span>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {displayProducts.map((product) => (
          <Link
            key={product.id}
            href={product.href}
            className="group flex flex-col gap-2 rounded-xl border border-border bg-card p-3 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
            data-testid={`inline-product-${product.id}`}
          >
            <div className="relative h-32 overflow-hidden rounded-lg bg-[hsl(var(--brand-cream))]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={product.image}
                alt={product.name}
                className="h-full w-full object-contain p-2 group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-foreground line-clamp-1">{product.name}</p>
              <p className="text-xs font-bold text-[hsl(var(--accent))]">{product.price}</p>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-[hsl(var(--brand-green))] group-hover:underline">
                Shop Now
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
