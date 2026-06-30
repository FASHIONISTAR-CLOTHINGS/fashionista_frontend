/**
 * features/catalog/components/CatalogSearchModal.tsx  — Phase C6
 *
 * Global Cmd+K search modal for instant catalog discovery.
 *
 * Architecture:
 *   - Triggered by Cmd+K / Ctrl+K keyboard shortcut
 *   - Debounced 300ms input → useCatalogSearch(q) → TanStack Query
 *   - Results grouped: Categories · Brands · Collections
 *   - Keyboard navigation: ↑↓ arrows + Enter to follow link
 *   - Dialog managed via HeadlessUI-compatible focus trap (CSS + ref)
 *   - Accessible: role="dialog", aria-modal, aria-label on all controls
 *   - 30s staleTime matches backend 30s TTL cache
 */
"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  KeyboardEvent,
} from "react";
import Link from "next/link";
import { useCatalogSearch } from "@/features/catalog";
import { FashionistarImage } from "@/components/media";
import { Button } from "@/components/ui/button";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface SearchHit {
  id: string;
  name: string;
  slug: string;
  image_url?: string | null;
  href: string;
  type: "category" | "brand" | "collection";
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

function SearchHitRow({
  hit,
  isActive,
  onClick,
}: {
  hit: SearchHit;
  isActive: boolean;
  onClick: () => void;
}) {
  const typeLabel =
    hit.type === "category"
      ? "Category"
      : hit.type === "brand"
      ? "Brand"
      : "Collection";

  const typeColor =
    hit.type === "category"
      ? "bg-[#01454A]/10 text-[#01454A]"
      : hit.type === "brand"
      ? "bg-[#FDA600]/15 text-[#B87500]"
      : "bg-purple-50 text-purple-700";

  return (
    <Link
      href={hit.href}
      onClick={onClick}
      className={`
        group flex items-center gap-3 px-4 py-3 rounded-xl
        transition-all duration-150 cursor-pointer
        focus-visible:outline-none
        ${isActive
          ? "bg-[#01454A] text-white shadow-md"
          : "hover:bg-[#F4F3EC] text-foreground"
        }
      `}
      aria-selected={isActive}
      role="option"
    >
      {/* Thumbnail */}
      <div
        className={`
          relative flex-shrink-0 h-10 w-10 rounded-lg overflow-hidden
          ${isActive ? "bg-white/20" : "bg-[#F4F3EC]"}
        `}
      >
        {hit.image_url ? (
          <FashionistarImage
            src={hit.image_url}
            alt={hit.name}
            fill
            sizes="40px"
            className="object-cover"
          />
        ) : (
          <span
            className={`
              flex h-full w-full items-center justify-center text-xs font-bold
              ${isActive ? "text-white/70" : "text-[#01454A]/40"}
            `}
          >
            {hit.name[0]?.toUpperCase()}
          </span>
        )}
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold truncate ${isActive ? "text-white" : ""}`}>
          {hit.name}
        </p>
      </div>

      {/* Type badge */}
      <span
        className={`
          flex-shrink-0 text-[10px] font-bold uppercase tracking-wider
          px-2 py-0.5 rounded-full
          ${isActive ? "bg-white/20 text-white" : typeColor}
        `}
      >
        {typeLabel}
      </span>

      {/* Arrow */}
      <svg
        className={`flex-shrink-0 h-4 w-4 transition-transform duration-150 ${isActive ? "text-white translate-x-0.5" : "text-muted-foreground group-hover:translate-x-0.5"}`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
        aria-hidden="true"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </Link>
  );
}

function EmptyState({ query }: { query: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
      <div className="h-16 w-16 rounded-2xl bg-[#F4F3EC] flex items-center justify-center">
        <svg className="h-7 w-7 text-[#01454A]/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803 7.5 7.5 0 0016.803 15.803z" />
        </svg>
      </div>
      <p className="text-sm font-semibold text-foreground">No results for &ldquo;{query}&rdquo;</p>
      <p className="text-xs text-muted-foreground max-w-xs">
        Try searching for a category, brand, or collection name
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Modal
// ─────────────────────────────────────────────────────────────────────────────

export function CatalogSearchModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // TanStack Query — 30s staleTime, enabled when query ≥ 2 chars
  const { data, isFetching } = useCatalogSearch(query);

  // ── Build flat hit list ────────────────────────────────────────────────────
  const hits: SearchHit[] = [];
  if (data) {
    (data.categories ?? []).slice(0, 4).forEach((c) =>
      hits.push({ id: c.id, name: c.name, slug: c.slug, image_url: c.image_url, href: `/categories/${c.slug}`, type: "category" })
    );
    (data.brands ?? []).slice(0, 4).forEach((b) =>
      hits.push({ id: b.id, name: b.name || b.title, slug: b.slug, image_url: b.image_url, href: `/brands/${b.slug}`, type: "brand" })
    );
    (data.collections ?? []).slice(0, 4).forEach((col) =>
      hits.push({ id: col.id, name: col.name || col.title, slug: col.slug, image_url: col.image_url, href: `/collections/${col.slug}`, type: "collection" })
    );
  }

  // ── Keyboard shortcut — Cmd+K / Ctrl+K ────────────────────────────────────
  useEffect(() => {
    const handler = (e: globalThis.KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // ── Auto-focus input when modal opens ─────────────────────────────────────
  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setActiveIndex(-1);
      // Defer until after CSS transition
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [isOpen]);

  // ── Close on backdrop click ────────────────────────────────────────────────
  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) setIsOpen(false);
  }, []);

  // ── Arrow key navigation ───────────────────────────────────────────────────
  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (!hits.length) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, hits.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter" && activeIndex >= 0) {
        e.preventDefault();
        const hit = hits[activeIndex];
        if (hit) {
          window.location.href = hit.href;
          setIsOpen(false);
        }
      }
    },
    [hits, activeIndex]
  );

  const closeModal = useCallback(() => {
    setIsOpen(false);
    setQuery("");
    setActiveIndex(-1);
  }, []);

  // ── Trigger button (renders persistently in header) ───────────────────────
  return (
    <>
      {/* Search trigger button */}
      {/* Search trigger button */}
      <Button
        type="button"
        id="catalog-search-trigger"
        aria-label="Search catalog (Cmd+K)"
        onClick={() => setIsOpen(true)}
        variant="outline"
        className="
          inline-flex items-center gap-2
          h-9 px-3 md:px-4 rounded-xl
          border border-border bg-card
          text-muted-foreground text-sm
          hover:border-[#01454A]/50 hover:text-foreground
          transition-all duration-200
          focus-visible:outline-2 focus-visible:outline-[#01454A] focus-visible:outline-offset-2
          h-auto
        "
      >
        <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803 7.5 7.5 0 0016.803 15.803z" />
        </svg>
        <span className="hidden md:inline">Search...</span>
        <kbd className="hidden md:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-mono bg-muted text-muted-foreground border border-border">
          <span>⌘</span>K
        </kbd>
      </Button>

      {/* Modal overlay */}
      {isOpen && (
        <div
          className="
            fixed inset-0 z-[9999]
            flex items-start justify-center
            pt-[10vh] px-4
            bg-black/50 backdrop-blur-sm
          "
          role="dialog"
          aria-modal="true"
          aria-label="Catalog search"
          onClick={handleBackdropClick}
        >
          {/* Modal panel */}
          <div
            className="
              w-full max-w-xl
              bg-card rounded-2xl shadow-2xl
              border border-border
              overflow-hidden
              animate-[scaleIn_0.15s_ease]
            "
            role="combobox"
            aria-expanded={hits.length > 0}
            aria-haspopup="listbox"
            aria-controls="search-results"
          >
            {/* Input row */}
            <div className="flex items-center gap-3 px-4 py-4 border-b border-border">
              <svg className="h-5 w-5 text-[#01454A] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803 7.5 7.5 0 0016.803 15.803z" />
              </svg>
              <input
                ref={inputRef}
                type="search"
                id="catalog-search-input"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActiveIndex(-1);
                }}
                onKeyDown={handleKeyDown}
                placeholder="Search categories, brands, collections..."
                className="
                  flex-1 bg-transparent text-sm text-foreground
                  placeholder:text-muted-foreground
                  outline-none border-none
                  font-raleway
                "
                autoComplete="off"
                autoCorrect="off"
                spellCheck="false"
                aria-autocomplete="list"
                aria-controls="search-results"
                aria-activedescendant={activeIndex >= 0 ? `hit-${activeIndex}` : undefined}
              />
              {isFetching && (
                <div className="h-4 w-4 rounded-full border-2 border-[#01454A] border-t-transparent animate-spin shrink-0" aria-label="Searching..." />
              )}
              {query && !isFetching && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => { setQuery(""); setActiveIndex(-1); inputRef.current?.focus(); }}
                  className="h-auto w-auto p-1 text-muted-foreground hover:text-foreground transition-colors shrink-0"
                  aria-label="Clear search"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </Button>
              )}
              <kbd className="text-[10px] font-mono text-muted-foreground px-1.5 py-0.5 rounded border border-border bg-muted shrink-0">
                ESC
              </kbd>
            </div>

            {/* Results */}
            <div
              ref={listRef}
              id="search-results"
              role="listbox"
              aria-label="Search results"
              className="max-h-[55vh] overflow-y-auto scroll-hide px-3 py-3 space-y-0.5"
            >
              {query.trim().length < 2 ? (
                /* Idle state — quick-access chips */
                <div className="py-4 space-y-3">
                  <p className="px-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    Quick Access
                  </p>
                  <div className="flex flex-wrap gap-2 px-2">
                    {[
                      { label: "All Categories", href: "/categories" },
                      { label: "All Brands", href: "/brands" },
                      { label: "Collections", href: "/collections" },
                      { label: "Blog", href: "/blog" },
                      { label: "Hot Deals", href: "/products?deals=1" },
                    ].map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={closeModal}
                        className="
                          inline-flex items-center gap-1.5
                          px-4 py-2 rounded-full text-xs font-semibold
                          bg-[#F4F3EC] text-[#01454A]
                          hover:bg-[#01454A] hover:text-white
                          transition-all duration-200
                        "
                      >
                        {item.label}
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    ))}
                  </div>
                </div>
              ) : hits.length === 0 && !isFetching ? (
                <EmptyState query={query} />
              ) : (
                hits.map((hit, idx) => (
                  <div key={`${hit.type}-${hit.id}`} id={`hit-${idx}`}>
                    <SearchHitRow
                      hit={hit}
                      isActive={activeIndex === idx}
                      onClick={closeModal}
                    />
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {hits.length > 0 && (
              <div className="border-t border-border px-4 py-2.5 flex items-center justify-between">
                <p className="text-[11px] text-muted-foreground">
                  {hits.length} result{hits.length !== 1 ? "s" : ""}
                </p>
                <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <kbd className="px-1 rounded border border-border bg-muted font-mono">↑↓</kbd>
                    navigate
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1 rounded border border-border bg-muted font-mono">↵</kbd>
                    open
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default CatalogSearchModal;
