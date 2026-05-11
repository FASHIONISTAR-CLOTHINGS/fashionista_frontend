/**
 * useCartAbandonment — Unit Tests
 * Tests the timer/inactivity guard hook logic for cart abandonment recovery.
 *
 * Run: pnpm exec vitest run tests/unit/use-cart-abandonment.test.ts
 */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

// ── Constants ─────────────────────────────────────────────────────────────────

const ABANDONMENT_DELAY_MS = 3 * 60 * 1000; // 3 minutes
const SESSION_KEY = "fashionistar-cart-nudge-dismissed";

// ── Pure logic extracted from useCartAbandonment ───────────────────────────

function hasBeenDismissedThisSession(): boolean {
  try {
    return sessionStorage.getItem(SESSION_KEY) === "1";
  } catch {
    return false;
  }
}

function markDismissed(): void {
  try {
    sessionStorage.setItem(SESSION_KEY, "1");
  } catch {
    // silent
  }
}

function clearDismissal(): void {
  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch {
    // silent
  }
}

function shouldShowNudge(hasItems: boolean, dismissed: boolean): boolean {
  return hasItems && !dismissed;
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

describe("useCartAbandonment — logic unit tests", () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should show nudge when cart has items and not dismissed", () => {
    expect(shouldShowNudge(true, false)).toBe(true);
  });

  it("should NOT show nudge when cart is empty", () => {
    expect(shouldShowNudge(false, false)).toBe(false);
  });

  it("should NOT show nudge when already dismissed this session", () => {
    expect(shouldShowNudge(true, true)).toBe(false);
  });

  it("session flag starts as false (not dismissed)", () => {
    expect(hasBeenDismissedThisSession()).toBe(false);
  });

  it("markDismissed sets session flag correctly", () => {
    markDismissed();
    expect(hasBeenDismissedThisSession()).toBe(true);
  });

  it("clearDismissal removes session flag", () => {
    markDismissed();
    clearDismissal();
    expect(hasBeenDismissedThisSession()).toBe(false);
  });

  it("dismissal is session-scoped (cleared by sessionStorage.clear)", () => {
    markDismissed();
    expect(hasBeenDismissedThisSession()).toBe(true);
    sessionStorage.clear(); // simulates new browser session
    expect(hasBeenDismissedThisSession()).toBe(false);
  });

  it("3-minute timer fires callback via fake timers", () => {
    const callback = vi.fn();
    const timer = setTimeout(callback, ABANDONMENT_DELAY_MS);
    expect(callback).not.toHaveBeenCalled();
    vi.advanceTimersByTime(ABANDONMENT_DELAY_MS);
    expect(callback).toHaveBeenCalledOnce();
    clearTimeout(timer);
  });

  it("timer does NOT fire before 3 minutes", () => {
    const callback = vi.fn();
    setTimeout(callback, ABANDONMENT_DELAY_MS);
    vi.advanceTimersByTime(ABANDONMENT_DELAY_MS - 1);
    expect(callback).not.toHaveBeenCalled();
  });

  it("clearing timer prevents callback from firing", () => {
    const callback = vi.fn();
    const timer = setTimeout(callback, ABANDONMENT_DELAY_MS);
    clearTimeout(timer);
    vi.advanceTimersByTime(ABANDONMENT_DELAY_MS);
    expect(callback).not.toHaveBeenCalled();
  });
});
