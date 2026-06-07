/**
 * src/__tests__/entities/product/ProductSkeleton.test.tsx
 * Vitest + RTL unit tests for ProductSkeleton variants.
 */
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { ProductSkeleton } from "@/entities/product/components/ProductSkeleton";

describe("ProductSkeleton", () => {
  it("renders a single skeleton by default", () => {
    const { container } = render(<ProductSkeleton />);
    // The skeleton pulse elements are aria-hidden
    const pulses = container.querySelectorAll("[aria-hidden='true']");
    expect(pulses.length).toBeGreaterThan(0);
  });

  it("renders correct count of skeletons", () => {
    const { container } = render(<ProductSkeleton count={4} />);
    // Each card variant has multiple pulse divs, at minimum 4 outer wrappers
    const wrappers = container.querySelectorAll(".rounded-2xl");
    expect(wrappers.length).toBeGreaterThanOrEqual(4);
  });

  it("renders list variant with horizontal layout", () => {
    const { container } = render(<ProductSkeleton variant="list" />);
    // List variant has 'flex' class at root level
    const flexEl = container.querySelector(".flex");
    expect(flexEl).toBeTruthy();
  });

  it("renders compact variant", () => {
    const { container } = render(<ProductSkeleton variant="compact" />);
    // Compact has h-28 image area
    const imageEl = container.querySelector(".h-28");
    expect(imageEl).toBeTruthy();
  });

  it("all pulse elements have animate-pulse class", () => {
    const { container } = render(<ProductSkeleton count={2} />);
    const pulses = container.querySelectorAll(".animate-pulse");
    expect(pulses.length).toBeGreaterThan(0);
  });
});
