/**
 * @file FashionistarPagination.tsx
 * @description Enterprise production-grade URL-driven pagination component.
 *
 * Features:
 *   - Works with Next.js App Router searchParams (SSR-compatible, no client state)
 *   - Mobile: prev/next buttons only + page N of total
 *   - Desktop: numbered page buttons with ellipsis for large page counts
 *   - Preserves all existing searchParams (page + filter params coexist)
 *   - Accessible: aria-label, aria-current, keyboard navigation
 *   - Tailwind CSS v4 + Fashionistar brand tokens
 *   - min 44×44px touch targets on all buttons
 *
 * Usage:
 *   <FashionistarPagination
 *     currentPage={3}
 *     totalCount={148}
 *     pageSize={20}
 *     baseHref="/brands"
 *   />
 */
"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface FashionistarPaginationProps {
  /** Current active page (1-indexed). */
  currentPage: number;
  /** Total number of items across all pages. */
  totalCount: number;
  /** Number of items per page. */
  pageSize: number;
  /** Base href without query params (e.g. "/brands"). */
  baseHref: string;
  /** Additional class names on the wrapper. */
  className?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function buildPageHref(
  baseHref: string,
  page: number,
  currentParams: URLSearchParams,
): string {
  const params = new URLSearchParams(currentParams.toString());
  if (page === 1) {
    params.delete("page");
  } else {
    params.set("page", String(page));
  }
  const qs = params.toString();
  return qs ? `${baseHref}?${qs}` : baseHref;
}

/** Generate visible page numbers with ellipsis strategy. */
function getPageNumbers(current: number, total: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages: (number | "...")[] = [1];

  if (current > 3) pages.push("...");

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  for (let i = start; i <= end; i++) pages.push(i);

  if (current < total - 2) pages.push("...");

  pages.push(total);
  return pages;
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export function FashionistarPagination({
  currentPage,
  totalCount,
  pageSize,
  baseHref,
  className,
}: FashionistarPaginationProps) {
  const searchParams = useSearchParams();
  const totalPages = Math.ceil(totalCount / pageSize);

  // Nothing to paginate
  if (totalPages <= 1) return null;

  const pages = getPageNumbers(currentPage, totalPages);
  const hasPrev = currentPage > 1;
  const hasNext = currentPage < totalPages;

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalCount);

  return (
    <nav
      aria-label="Pagination"
      className={cn("flex flex-col items-center gap-4", className)}
    >
      {/* ── Count label ─────────────────────────────────────────────── */}
      <p className="font-raleway text-sm text-muted-foreground">
        Showing{" "}
        <span className="font-semibold text-foreground">
          {startItem}–{endItem}
        </span>{" "}
        of{" "}
        <span className="font-semibold text-foreground">{totalCount}</span> results
      </p>

      {/* ── Pagination controls ─────────────────────────────────────── */}
      <div className="flex items-center gap-1.5">
        {/* Prev */}
        {hasPrev ? (
          <Link
            href={buildPageHref(baseHref, currentPage - 1, searchParams)}
            aria-label="Previous page"
            className="touch-target flex h-10 min-w-[44px] items-center justify-center rounded-full border border-border bg-card px-3 font-raleway text-sm font-medium text-foreground shadow-sm transition hover:bg-[#01454A] hover:text-white hover:border-[#01454A]"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            <span className="ml-1 hidden sm:inline">Prev</span>
          </Link>
        ) : (
          <span className="touch-target flex h-10 min-w-[44px] items-center justify-center rounded-full border border-border/40 bg-muted/30 px-3 font-raleway text-sm text-muted-foreground cursor-not-allowed opacity-50">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            <span className="ml-1 hidden sm:inline">Prev</span>
          </span>
        )}

        {/* ── Page numbers (desktop) ──────────────────────────────────── */}
        <div className="hidden sm:flex items-center gap-1">
          {pages.map((page, idx) =>
            page === "..." ? (
              <span
                key={`ellipsis-${idx}`}
                className="flex h-10 w-10 items-center justify-center font-raleway text-sm text-muted-foreground"
              >
                …
              </span>
            ) : (
              <Link
                key={page}
                href={buildPageHref(baseHref, page, searchParams)}
                aria-label={`Page ${page}`}
                aria-current={page === currentPage ? "page" : undefined}
                className={cn(
                  "touch-target flex h-10 w-10 items-center justify-center rounded-full font-raleway text-sm font-semibold transition",
                  page === currentPage
                    ? "bg-[#01454A] text-white shadow-md"
                    : "border border-border bg-card text-foreground hover:bg-[#01454A]/10 hover:border-[#01454A]/40",
                )}
              >
                {page}
              </Link>
            ),
          )}
        </div>

        {/* ── Mobile page indicator ───────────────────────────────────── */}
        <span className="sm:hidden flex h-10 items-center px-3 font-raleway text-sm font-medium text-foreground">
          {currentPage} / {totalPages}
        </span>

        {/* Next */}
        {hasNext ? (
          <Link
            href={buildPageHref(baseHref, currentPage + 1, searchParams)}
            aria-label="Next page"
            className="touch-target flex h-10 min-w-[44px] items-center justify-center rounded-full border border-border bg-card px-3 font-raleway text-sm font-medium text-foreground shadow-sm transition hover:bg-[#01454A] hover:text-white hover:border-[#01454A]"
          >
            <span className="mr-1 hidden sm:inline">Next</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </Link>
        ) : (
          <span className="touch-target flex h-10 min-w-[44px] items-center justify-center rounded-full border border-border/40 bg-muted/30 px-3 font-raleway text-sm text-muted-foreground cursor-not-allowed opacity-50">
            <span className="mr-1 hidden sm:inline">Next</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </span>
        )}
      </div>
    </nav>
  );
}
