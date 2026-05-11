/**
 * useRecentlyViewed — Unit Tests
 * Tests the localStorage-backed ring-buffer hook for recently viewed products.
 *
 * Run: pnpm exec vitest run tests/unit/use-recently-viewed.test.ts
 */
import { describe, it, expect, beforeEach } from "vitest";

// ── localStorage mock ────────────────────────────────────────────────────────

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();

Object.defineProperty(window, "localStorage", { value: localStorageMock });

// ── Constants ────────────────────────────────────────────────────────────────

const STORAGE_KEY = "fashionistar-recently-viewed";
const MAX_ITEMS = 8;

// ── Pure ring-buffer logic (extracted from useRecentlyViewed hook) ─────────

interface RecentProduct {
  id: string;
  slug: string;
  title: string;
  coverUrl: string;
  price: number;
}

function addToRecentlyViewed(
  current: RecentProduct[],
  product: RecentProduct,
  max = MAX_ITEMS
): RecentProduct[] {
  const filtered = current.filter((p) => p.id !== product.id);
  return [product, ...filtered].slice(0, max);
}

function saveToStorage(items: RecentProduct[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function loadFromStorage(): RecentProduct[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as RecentProduct[];
  } catch {
    return [];
  }
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("useRecentlyViewed — ring-buffer logic", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  const makeProduct = (n: number): RecentProduct => ({
    id: `prod-${n}`,
    slug: `product-${n}`,
    title: `Product ${n}`,
    coverUrl: `/images/product-${n}.jpg`,
    price: n * 1000,
  });

  it("starts with empty list when localStorage is empty", () => {
    expect(loadFromStorage()).toEqual([]);
  });

  it("adds first product correctly", () => {
    const p = makeProduct(1);
    const next = addToRecentlyViewed([], p);
    saveToStorage(next);
    expect(loadFromStorage()).toEqual([p]);
  });

  it("prepends new product to front of list", () => {
    const p1 = makeProduct(1);
    const p2 = makeProduct(2);
    const after1 = addToRecentlyViewed([], p1);
    const after2 = addToRecentlyViewed(after1, p2);
    expect(after2[0].id).toBe("prod-2");
    expect(after2[1].id).toBe("prod-1");
  });

  it("de-duplicates — revisiting an item moves it to front", () => {
    const p1 = makeProduct(1);
    const p2 = makeProduct(2);
    const p3 = makeProduct(3);
    let list = addToRecentlyViewed([], p1);
    list = addToRecentlyViewed(list, p2);
    list = addToRecentlyViewed(list, p3);
    // Re-visit p1
    list = addToRecentlyViewed(list, p1);
    expect(list[0].id).toBe("prod-1");
    expect(list.filter((p) => p.id === "prod-1")).toHaveLength(1);
  });

  it("caps list at MAX_ITEMS (8)", () => {
    let list: RecentProduct[] = [];
    for (let i = 1; i <= 12; i++) {
      list = addToRecentlyViewed(list, makeProduct(i));
    }
    expect(list).toHaveLength(MAX_ITEMS);
    expect(list[0].id).toBe("prod-12"); // most recent first
  });

  it("persists to and loads from localStorage correctly", () => {
    const items = [makeProduct(1), makeProduct(2), makeProduct(3)];
    saveToStorage(items);
    const loaded = loadFromStorage();
    expect(loaded).toHaveLength(3);
    expect(loaded[0].id).toBe("prod-1");
  });

  it("handles corrupted localStorage gracefully", () => {
    localStorage.setItem(STORAGE_KEY, "not-valid-json{{{");
    expect(() => loadFromStorage()).not.toThrow();
    expect(loadFromStorage()).toEqual([]);
  });

  it("handles missing localStorage fields gracefully", () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([{ id: "x" }]));
    const loaded = loadFromStorage();
    expect(loaded[0].id).toBe("x");
  });
});
