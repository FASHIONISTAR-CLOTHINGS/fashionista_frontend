/**
 * EmptyState.tsx — R17: Empty State Design System
 *
 * Consistent, branded empty state components for all commerce surfaces:
 *
 *   variant="cart"         → Empty cart → "Start Shopping" CTA
 *   variant="wishlist"     → Empty wishlist → product suggestions
 *   variant="products"     → No products in category → "Browse all" CTA
 *   variant="search"       → 0 search results → suggestions + categories
 *   variant="vendors"      → No vendor found → "Be our vendor" CTA
 *   variant="orders"       → No order history → "Start Shopping" CTA
 *   variant="generic"      → Fallback — generic error/empty state
 *
 * Design standards:
 *   - Forest green (#01454A) icon container
 *   - Gold (#FDA600) accent text & primary CTA
 *   - Soft cream (#F4F3EC) card background
 *   - Bon Foyage heading, Raleway body
 *   - Reduced motion aware (no animation when prefers-reduced-motion)
 *   - data-testid on all interactive elements
 */

import Link from "next/link";
import {
  ShoppingBag,
  Heart,
  Package,
  Search,
  Store,
  ClipboardList,
  Inbox,
  ArrowRight,
  RefreshCw,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type EmptyStateVariant =
  | "cart"
  | "wishlist"
  | "products"
  | "search"
  | "vendors"
  | "orders"
  | "generic";

export interface EmptyStateAction {
  label: string;
  href?: string;
  onClick?: () => void;
  variant?: "primary" | "secondary";
}

export interface EmptyStateProps {
  variant?: EmptyStateVariant;
  /** Override the heading text */
  title?: string;
  /** Override the description text */
  description?: string;
  /** Custom search query for search empty state (displays in message) */
  query?: string;
  /** Override the primary CTA */
  primaryAction?: EmptyStateAction;
  /** Optional secondary action */
  secondaryAction?: EmptyStateAction;
  /** Additional CSS class for the wrapper */
  className?: string;
  /** data-testid prefix */
  testId?: string;
}

// ─── Variant config ───────────────────────────────────────────────────────────

const VARIANT_CONFIG: Record<
  EmptyStateVariant,
  {
    icon: React.ElementType;
    title: string;
    description: string;
    primaryAction: EmptyStateAction;
    secondaryAction?: EmptyStateAction;
  }
> = {
  cart: {
    icon: ShoppingBag,
    title: "Your cart is empty",
    description:
      "Looks like you haven't added anything yet. Browse our collection of AI-measured fashion pieces.",
    primaryAction: { label: "Start Shopping", href: "/products", variant: "primary" },
    secondaryAction: { label: "View Deals", href: "/products?filter=hot_deals", variant: "secondary" },
  },
  wishlist: {
    icon: Heart,
    title: "Nothing saved yet",
    description:
      "Save pieces you love and come back to them later. Tap the heart icon on any product.",
    primaryAction: { label: "Browse Products", href: "/products", variant: "primary" },
    secondaryAction: { label: "View Collections", href: "/collections", variant: "secondary" },
  },
  products: {
    icon: Package,
    title: "No products found",
    description:
      "We couldn't find any products matching your filters. Try broadening your search or browse all categories.",
    primaryAction: { label: "Browse All Products", href: "/products", variant: "primary" },
    secondaryAction: { label: "View Categories", href: "/categories", variant: "secondary" },
  },
  search: {
    icon: Search,
    title: "No results found",
    description:
      "Your search didn't match any products. Try different keywords or browse our categories below.",
    primaryAction: { label: "Browse Categories", href: "/categories", variant: "primary" },
    secondaryAction: { label: "View Trending", href: "/products?ordering=-ai_trend_score", variant: "secondary" },
  },
  vendors: {
    icon: Store,
    title: "No vendors found",
    description:
      "We couldn't find any vendors matching your criteria. Become one of our trusted vendors and grow your fashion business.",
    primaryAction: { label: "View All Vendors", href: "/vendors", variant: "primary" },
    secondaryAction: { label: "Become a Vendor", href: "/vendor/register", variant: "secondary" },
  },
  orders: {
    icon: ClipboardList,
    title: "No orders yet",
    description:
      "Your order history will appear here once you make your first purchase. Find your perfect fit today.",
    primaryAction: { label: "Start Shopping", href: "/products", variant: "primary" },
    secondaryAction: { label: "Get Measured First", href: "/get-measured", variant: "secondary" },
  },
  generic: {
    icon: Inbox,
    title: "Nothing here yet",
    description:
      "There's nothing to show here right now. Check back later or try a different section.",
    primaryAction: { label: "Go to Homepage", href: "/", variant: "primary" },
  },
};

// ─── Action button ────────────────────────────────────────────────────────────

function ActionButton({ action, testId }: { action: EmptyStateAction; testId: string }) {
  const isPrimary = action.variant !== "secondary";

  const baseClasses = `inline-flex items-center gap-2 rounded-full font-raleway text-sm font-bold transition-all duration-150 px-6 py-3 min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FDA600]`;
  const primaryClasses = `${baseClasses} bg-[#FDA600] text-black hover:bg-[#e69500]`;
  const secondaryClasses = `${baseClasses} border border-[#01454A]/30 text-[#01454A] hover:bg-[#01454A] hover:text-white`;

  const className = isPrimary ? primaryClasses : secondaryClasses;

  if (action.href) {
    return (
      <Link href={action.href} className={className} data-testid={testId}>
        {action.label}
        {isPrimary && <ArrowRight size={14} aria-hidden="true" />}
      </Link>
    );
  }

  return (
    <button type="button" onClick={action.onClick} className={className} data-testid={testId}>
      {action.label}
      {isPrimary && <ArrowRight size={14} aria-hidden="true" />}
    </button>
  );
}

// ─── EmptyState (main export) ─────────────────────────────────────────────────

export function EmptyState({
  variant = "generic",
  title,
  description,
  query,
  primaryAction,
  secondaryAction,
  className = "",
  testId,
}: EmptyStateProps) {
  const config = VARIANT_CONFIG[variant];
  const Icon = config.icon;

  const resolvedTitle = title ?? config.title;
  const resolvedDescription =
    description ??
    (query && variant === "search"
      ? `Your search for "${query}" didn't match any products. Try different keywords or browse our categories below.`
      : config.description);
  const resolvedPrimary = primaryAction ?? config.primaryAction;
  const resolvedSecondary = secondaryAction ?? config.secondaryAction;

  const prefixTestId = testId ?? `empty-state-${variant}`;

  return (
    <div
      className={`flex flex-col items-center justify-center gap-6 py-16 px-6 text-center ${className}`}
      data-testid={prefixTestId}
      role="status"
      aria-label={resolvedTitle}
    >
      {/* Icon container */}
      <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-[#01454A]/10 text-[#01454A]">
        <Icon size={36} aria-hidden="true" />
      </div>

      {/* Copy */}
      <div className="max-w-sm space-y-2">
        <h3 className="font-bon_foyage text-2xl text-foreground">{resolvedTitle}</h3>
        <p className="font-raleway text-sm text-muted-foreground leading-relaxed">
          {resolvedDescription}
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <ActionButton action={resolvedPrimary} testId={`${prefixTestId}-primary-cta`} />
        {resolvedSecondary && (
          <ActionButton action={resolvedSecondary} testId={`${prefixTestId}-secondary-cta`} />
        )}
      </div>
    </div>
  );
}

// ─── Inline compact variant for filter/search "no results" inside grids ───────

export function InlineEmptyState({
  message,
  ctaLabel,
  ctaHref,
  onRetry,
}: {
  message: string;
  ctaLabel?: string;
  ctaHref?: string;
  onRetry?: () => void;
}) {
  return (
    <div
      className="col-span-full flex flex-col items-center gap-4 py-12 text-center"
      data-testid="inline-empty-state"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#01454A]/10 text-[#01454A]">
        <Inbox size={24} aria-hidden="true" />
      </div>
      <p className="font-raleway text-sm text-muted-foreground max-w-xs">{message}</p>
      <div className="flex items-center gap-3">
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="flex items-center gap-1.5 font-raleway text-xs font-bold text-[#01454A] border border-[#01454A]/30 px-4 py-2 rounded-full hover:bg-[#01454A] hover:text-white transition-all"
            data-testid="inline-empty-retry"
          >
            <RefreshCw size={12} aria-hidden="true" />
            Retry
          </button>
        )}
        {ctaLabel && ctaHref && (
          <Link
            href={ctaHref}
            className="flex items-center gap-1.5 font-raleway text-xs font-bold bg-[#FDA600] text-black px-4 py-2 rounded-full hover:bg-[#e69500] transition-all"
            data-testid="inline-empty-cta"
          >
            {ctaLabel}
          </Link>
        )}
      </div>
    </div>
  );
}

// ─── Network error state ──────────────────────────────────────────────────────

export function ErrorState({
  message = "Something went wrong loading this content.",
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-5 py-16 px-6 text-center"
      data-testid="error-state"
      role="alert"
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-500">
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
          <line x1="12" y1="9" x2="12" y2="13"/>
          <line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
      </div>
      <div className="max-w-sm space-y-1">
        <h3 className="font-bon_foyage text-xl text-foreground">Something went wrong</h3>
        <p className="font-raleway text-sm text-muted-foreground">{message}</p>
      </div>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="flex items-center gap-2 font-raleway text-sm font-bold bg-[#01454A] text-white px-6 py-3 rounded-full hover:bg-[#016B73] transition-all"
          data-testid="error-state-retry"
        >
          <RefreshCw size={14} aria-hidden="true" />
          Try again
        </button>
      )}
    </div>
  );
}
