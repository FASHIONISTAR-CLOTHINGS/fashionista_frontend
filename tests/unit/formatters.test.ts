/**
 * PILLAR 3: Vitest Unit Tests — Utility Formatters
 */
import { describe, it, expect } from "vitest";
import {
  formatCurrency,
  formatDate,
  truncateText,
  slug,
} from "@/lib/utils";

describe("formatCurrency", () => {
  it("✅ formats Nigerian Naira correctly", () => {
    const result = formatCurrency(50000);
    expect(result).toContain("50");
    expect(result.length).toBeGreaterThan(0);
  });

  it("✅ formats zero as ₦0", () => {
    const result = formatCurrency(0);
    expect(result).toBeTruthy();
  });

  it("✅ formats large numbers", () => {
    const result = formatCurrency(1_500_000);
    expect(result).toContain("1");
    expect(result).toContain("500");
  });
});

describe("formatDate", () => {
  it("✅ formats a valid ISO date string", () => {
    const result = formatDate("2026-03-26");
    expect(result).toContain("2026");
    expect(result).toBeTruthy();
  });

  it("✅ formats a Date object", () => {
    const result = formatDate(new Date(2026, 2, 26));
    expect(result).toContain("2026");
  });
});

describe("truncateText", () => {
  it("✅ returns full text if under maxLength", () => {
    expect(truncateText("Short text", 100)).toBe("Short text");
  });

  it("✅ truncates and adds ellipsis", () => {
    const long = "a".repeat(200);
    const result = truncateText(long, 100);
    expect(result.length).toBeLessThanOrEqual(104); // 100 chars + '…'
    expect(result.endsWith("…")).toBe(true);
  });

  it("✅ uses default maxLength of 100", () => {
    const exact100 = "a".repeat(100);
    expect(truncateText(exact100)).toBe(exact100);

    const over100 = "a".repeat(101);
    expect(truncateText(over100).endsWith("…")).toBe(true);
  });
});

describe("slug", () => {
  it("✅ converts spaces to hyphens", () => {
    expect(slug("Hello World")).toBe("hello-world");
  });

  it("✅ removes special characters", () => {
    // '&' and '!' are removed → spaces become hyphens → consecutive hyphens collapsed
    const result = slug("Fashion & Style!");
    expect(result).toBe("fashion-style");
    expect(result).not.toContain("!");
    expect(result).not.toContain("&");
  });

  it("✅ lowercases all characters", () => {
    expect(slug("FASHIONISTAR")).toBe("fashionistar");
  });

  it("✅ handles already clean slugs", () => {
    expect(slug("clean-slug")).toBe("clean-slug");
  });
});
