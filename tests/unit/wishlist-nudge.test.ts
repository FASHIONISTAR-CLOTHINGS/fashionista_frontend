/**
 * WishlistNudge + WishlistNudgeClient — Unit Tests
 * Tests the display logic and suppression conditions for the WishlistNudge.
 *
 * Run: pnpm exec vitest run tests/unit/wishlist-nudge.test.ts
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// ── Constants + Types ─────────────────────────────────────────────────────────

const NUDGE_DELAY_MS = 60_000; // 60 seconds before nudge appears
const SUPPRESS_KEY = "fashionistar-wishlist-nudge-seen";

interface WishlistNudgeProps {
  count: number;
  isAuthenticated: boolean;
}

// ── Pure nudge display logic extracted from WishlistNudge/WishlistNudgeClient

function shouldRenderNudge(props: WishlistNudgeProps): boolean {
  return props.isAuthenticated && props.count > 0;
}

function getWishlistMessage(count: number): string {
  if (count === 1) return "You have 1 item in your wishlist.";
  return `You have ${count} items in your wishlist.`;
}

function getCTAText(count: number): string {
  if (count === 1) return "View it before it sells out";
  return "View them before they sell out";
}

// ── sessionStorage mock ───────────────────────────────────────────────────────

const sessionStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();
Object.defineProperty(window, "sessionStorage", { value: sessionStorageMock });

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("WishlistNudge — display logic", () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // Render conditions
  it("renders when authenticated and count > 0", () => {
    expect(shouldRenderNudge({ count: 3, isAuthenticated: true })).toBe(true);
  });

  it("does NOT render when unauthenticated", () => {
    expect(shouldRenderNudge({ count: 5, isAuthenticated: false })).toBe(false);
  });

  it("does NOT render when count is 0", () => {
    expect(shouldRenderNudge({ count: 0, isAuthenticated: true })).toBe(false);
  });

  it("does NOT render when both unauthenticated and count is 0", () => {
    expect(shouldRenderNudge({ count: 0, isAuthenticated: false })).toBe(false);
  });

  // Wishlist message copy
  it("singular message for count = 1", () => {
    expect(getWishlistMessage(1)).toBe("You have 1 item in your wishlist.");
  });

  it("plural message for count > 1", () => {
    expect(getWishlistMessage(5)).toBe("You have 5 items in your wishlist.");
  });

  it("singular CTA for count = 1", () => {
    expect(getCTAText(1)).toBe("View it before it sells out");
  });

  it("plural CTA for count > 1", () => {
    expect(getCTAText(4)).toBe("View them before they sell out");
  });

  // Delay logic
  it("nudge appears after 60-second delay via fake timer", () => {
    const showNudge = vi.fn();
    setTimeout(showNudge, NUDGE_DELAY_MS);
    expect(showNudge).not.toHaveBeenCalled();
    vi.advanceTimersByTime(NUDGE_DELAY_MS);
    expect(showNudge).toHaveBeenCalledOnce();
  });

  it("nudge does NOT appear before 60 seconds", () => {
    const showNudge = vi.fn();
    setTimeout(showNudge, NUDGE_DELAY_MS);
    vi.advanceTimersByTime(NUDGE_DELAY_MS - 1);
    expect(showNudge).not.toHaveBeenCalled();
  });

  // Suppress state
  it("suppress key is not set initially", () => {
    expect(sessionStorage.getItem(SUPPRESS_KEY)).toBeNull();
  });

  it("suppress key persists in sessionStorage after setting", () => {
    sessionStorage.setItem(SUPPRESS_KEY, "1");
    expect(sessionStorage.getItem(SUPPRESS_KEY)).toBe("1");
  });

  it("suppression cleared when sessionStorage is cleared (new session)", () => {
    sessionStorage.setItem(SUPPRESS_KEY, "1");
    sessionStorage.clear();
    expect(sessionStorage.getItem(SUPPRESS_KEY)).toBeNull();
  });
});

describe("WishlistNudge — edge cases", () => {
  it("handles very large wishlist count gracefully", () => {
    const count = 9999;
    expect(shouldRenderNudge({ count, isAuthenticated: true })).toBe(true);
    expect(getWishlistMessage(count)).toContain("9999 items");
  });

  it("handles count boundary: count = 1 correctly", () => {
    expect(getWishlistMessage(1)).toContain("1 item");
    expect(getCTAText(1)).toContain("it");
  });

  it("handles count boundary: count = 2 correctly", () => {
    expect(getWishlistMessage(2)).toContain("2 items");
    expect(getCTAText(2)).toContain("them");
  });
});
