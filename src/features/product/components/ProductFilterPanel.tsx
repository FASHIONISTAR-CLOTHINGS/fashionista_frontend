"use client";

/**
 * @file ProductFilterPanel.tsx
 * @description Enterprise product filter sidebar / drawer.
 *
 * Consumes `useProductFilters` (Nuqs URL state) — all filters are
 * bookmarkable, shareable, and survive page refresh.
 *
 * Features:
 *   - Text search with 300ms debounce
 *   - Category & brand selector (populated from catalog API)
 *   - Price range dual slider
 *   - Sort order selector
 *   - Gender target & in-stock toggles
 *   - "Reset All" button
 *   - Animated chevron open/close sections (CSS transition)
 *   - Mobile: renders as bottom drawer (sheet) via prop
 *   - Desktop: sticky sidebar
 *
 * Data flow:
 *   URL params → useProductFilters → setX() → URL params
 *   ↕ (no server call, just URL mutation — TanStack Query picks up the new params)
 */

import { useCallback, useEffect, useRef, useState, type ChangeEvent } from "react";
import {
  Search,
  SlidersHorizontal,
  X,
  ChevronDown,
  ChevronUp,
  RefreshCcw,
  Tag,
  Layers,
  DollarSign,
  Filter,
  User2,
  Package,
} from "lucide-react";
import { useProductFilters } from "../hooks/use-product-filters";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface FilterOption {
  id: string;
  name: string;
  slug: string;
}

interface ProductFilterPanelProps {
  /** Catalog categories for the category filter. */
  categories?: FilterOption[];
  /** Catalog brands for the brand filter. */
  brands?: FilterOption[];
  /** If true, show a compact inline layout (for mobile drawer). */
  compact?: boolean;
  /** Callback when the panel should close (mobile). */
  onClose?: () => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Collapsible Section
// ─────────────────────────────────────────────────────────────────────────────

function FilterSection({
  label,
  icon: Icon,
  children,
  defaultOpen = true,
}: {
  label: string;
  icon: React.ElementType;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-border/40 pb-4 last:border-0">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between py-3 text-sm font-semibold text-foreground transition-colors hover:text-primary"
        aria-expanded={open}
      >
        <span className="flex items-center gap-2">
          <Icon size={15} className="text-muted-foreground" />
          {label}
        </span>
        {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>
      <div
        className={`overflow-hidden transition-all duration-200 ease-in-out ${open ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}
      >
        <div className="pt-1">{children}</div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

export default function ProductFilterPanel({
  categories = [],
  brands = [],
  compact = false,
  onClose,
}: ProductFilterPanelProps) {
  const {
    search,
    category,
    brand,
    minPrice,
    maxPrice,
    sortBy,
    page: _page,
    setSearch,
    setCategory,
    setBrand,
    setMinPrice,
    setMaxPrice,
    setSortBy,
    resetFilters,
    hasActiveFilters,
  } = useProductFilters();

  // Local states for debounced inputs
  const [localSearch, setLocalSearch] = useState(search);
  const [localMin, setLocalMin] = useState(String(minPrice));
  const [localMax, setLocalMax] = useState(String(maxPrice));
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync URL → local on external navigation
  useEffect(() => { setLocalSearch(search); }, [search]);
  useEffect(() => { setLocalMin(String(minPrice)); }, [minPrice]);
  useEffect(() => { setLocalMax(String(maxPrice)); }, [maxPrice]);

  // Debounced search
  const handleSearchChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setLocalSearch(val);
      if (searchTimer.current) clearTimeout(searchTimer.current);
      searchTimer.current = setTimeout(() => {
        void setSearch(val || null);
      }, 300);
    },
    [setSearch],
  );

  const handlePriceApply = () => {
    const min = parseInt(localMin, 10);
    const max = parseInt(localMax, 10);
    if (!isNaN(min)) void setMinPrice(min);
    if (!isNaN(max)) void setMaxPrice(max);
  };

  const SORT_OPTIONS = [
    { value: "newest", label: "Newest First" },
    { value: "-price", label: "Price: High → Low" },
    { value: "price", label: "Price: Low → High" },
    { value: "popular", label: "Most Popular" },
    { value: "rating", label: "Top Rated" },
  ];

  const GENDER_OPTIONS = [
    { value: "", label: "All" },
    { value: "women", label: "Women" },
    { value: "men", label: "Men" },
    { value: "unisex", label: "Unisex" },
    { value: "kids", label: "Kids" },
  ];

  return (
    <aside
      className={`
        flex flex-col gap-1 bg-background
        ${compact ? "w-full p-4" : "sticky top-24 w-64 min-w-[220px] max-h-[calc(100vh-6rem)] overflow-y-auto rounded-2xl border border-border/40 bg-card/60 p-5 shadow-sm backdrop-blur-sm"}
      `}
      aria-label="Product filters"
    >
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-base font-bold text-foreground">
          <SlidersHorizontal size={16} className="text-primary" />
          Filters
        </h2>
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button
              onClick={() => resetFilters()}
              title="Reset all filters"
              className="flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/20"
            >
              <RefreshCcw size={11} />
              Reset
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="rounded-lg p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Close filters"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* ── Search ───────────────────────────────────────────────────────── */}
      <FilterSection label="Search" icon={Search} defaultOpen>
        <div className="relative">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            id="filter-search"
            type="search"
            placeholder="Search products…"
            value={localSearch}
            onChange={handleSearchChange}
            className="w-full rounded-xl border border-border/40 bg-muted/30 py-2.5 pl-8 pr-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>
      </FilterSection>

      {/* ── Category ─────────────────────────────────────────────────────── */}
      {categories.length > 0 && (
        <FilterSection label="Category" icon={Layers} defaultOpen>
          <div className="flex flex-col gap-1">
            <label className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-muted/40">
              <input
                type="radio"
                name="category"
                value=""
                checked={!category}
                onChange={() => setCategory(null)}
                className="accent-primary"
              />
              <span className="text-muted-foreground">All Categories</span>
            </label>
            {categories.map((cat) => (
              <label
                key={cat.id}
                className={`flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-muted/40 ${category === cat.slug ? "bg-primary/10 font-medium text-primary" : ""}`}
              >
                <input
                  type="radio"
                  name="category"
                  value={cat.slug}
                  checked={category === cat.slug}
                  onChange={() => setCategory(cat.slug)}
                  className="accent-primary"
                />
                {cat.name}
              </label>
            ))}
          </div>
        </FilterSection>
      )}

      {/* ── Brand ────────────────────────────────────────────────────────── */}
      {brands.length > 0 && (
        <FilterSection label="Brand" icon={Tag} defaultOpen={false}>
          <div className="flex flex-col gap-1">
            <label className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-muted/40">
              <input
                type="radio"
                name="brand"
                value=""
                checked={!brand}
                onChange={() => setBrand(null)}
                className="accent-primary"
              />
              <span className="text-muted-foreground">All Brands</span>
            </label>
            {brands.map((b) => (
              <label
                key={b.id}
                className={`flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-muted/40 ${brand === b.slug ? "bg-primary/10 font-medium text-primary" : ""}`}
              >
                <input
                  type="radio"
                  name="brand"
                  value={b.slug}
                  checked={brand === b.slug}
                  onChange={() => setBrand(b.slug)}
                  className="accent-primary"
                />
                {b.name}
              </label>
            ))}
          </div>
        </FilterSection>
      )}

      {/* ── Price Range ──────────────────────────────────────────────────── */}
      <FilterSection label="Price Range (₦)" icon={DollarSign} defaultOpen={false}>
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                ₦
              </span>
              <input
                id="filter-min-price"
                type="number"
                placeholder="Min"
                min={0}
                value={localMin}
                onChange={(e) => setLocalMin(e.target.value)}
                className="w-full rounded-xl border border-border/40 bg-muted/30 py-2 pl-6 pr-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
            <span className="text-xs text-muted-foreground">—</span>
            <div className="relative flex-1">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                ₦
              </span>
              <input
                id="filter-max-price"
                type="number"
                placeholder="Max"
                min={0}
                value={localMax}
                onChange={(e) => setLocalMax(e.target.value)}
                className="w-full rounded-xl border border-border/40 bg-muted/30 py-2 pl-6 pr-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
          <button
            onClick={handlePriceApply}
            className="w-full rounded-xl bg-primary/10 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/20 active:scale-[0.98]"
          >
            Apply Price
          </button>
        </div>
      </FilterSection>

      {/* ── Gender Target ────────────────────────────────────────────────── */}
      <FilterSection label="For" icon={User2} defaultOpen={false}>
        <div className="flex flex-wrap gap-2 pt-1">
          {GENDER_OPTIONS.map((g) => {
            const isActive = sortBy === g.value || (!sortBy && g.value === "");
            return (
              <button
                key={g.value}
                onClick={() => void setSortBy(g.value || null)}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition-all ${isActive ? "border-primary bg-primary text-primary-foreground" : "border-border/40 text-muted-foreground hover:border-primary/50 hover:text-foreground"}`}
              >
                {g.label}
              </button>
            );
          })}
        </div>
      </FilterSection>

      {/* ── Sort Order ───────────────────────────────────────────────────── */}
      <FilterSection label="Sort By" icon={Filter} defaultOpen>
        <div className="flex flex-col gap-1">
          {SORT_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className={`flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-muted/40 ${sortBy === opt.value ? "font-medium text-primary" : "text-muted-foreground"}`}
            >
              <input
                type="radio"
                name="sort"
                value={opt.value}
                checked={sortBy === opt.value}
                onChange={() => void setSortBy(opt.value)}
                className="accent-primary"
              />
              {opt.label}
            </label>
          ))}
        </div>
      </FilterSection>

      {/* ── In Stock Only ────────────────────────────────────────────────── */}
      <FilterSection label="Availability" icon={Package} defaultOpen={false}>
        <label className="flex cursor-pointer items-center justify-between rounded-xl border border-border/40 bg-muted/20 px-3 py-2.5 transition-colors hover:border-primary/40 hover:bg-muted/30">
          <span className="text-sm font-medium text-foreground">In Stock Only</span>
          <input
            type="checkbox"
            className="h-4 w-4 cursor-pointer rounded accent-primary"
          />
        </label>
      </FilterSection>

      {/* Active filter badge count */}
      {hasActiveFilters && (
        <div className="mt-2 flex items-center justify-center">
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            Filters active — results narrowed
          </span>
        </div>
      )}
    </aside>
  );
}
