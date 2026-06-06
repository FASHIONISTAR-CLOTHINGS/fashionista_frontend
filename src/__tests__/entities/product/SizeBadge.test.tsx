/**
 * src/__tests__/entities/product/SizeBadge.test.tsx
 * Vitest + RTL unit tests for SizeBadge and SizePicker.
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SizeBadge, SizePicker } from "@/entities/product/components/SizeBadge";

describe("SizeBadge", () => {
  it("renders the size label", () => {
    render(<SizeBadge size="M" />);
    expect(screen.getByText("M")).toBeInTheDocument();
  });

  it("calls onClick when clicked (in_stock)", () => {
    const mockClick = vi.fn();
    render(<SizeBadge size="L" availability="in_stock" onClick={mockClick} />);
    fireEvent.click(screen.getByRole("button"));
    expect(mockClick).toHaveBeenCalledWith("L");
  });

  it("does NOT call onClick when out_of_stock", () => {
    const mockClick = vi.fn();
    render(<SizeBadge size="XL" availability="out_of_stock" onClick={mockClick} />);
    fireEvent.click(screen.getByRole("button"));
    expect(mockClick).not.toHaveBeenCalled();
  });

  it("shows Low badge for low_stock", () => {
    render(<SizeBadge size="S" availability="low_stock" />);
    expect(screen.getByText("Low")).toBeInTheDocument();
  });

  it("shows MTO badge for made_to_order", () => {
    render(<SizeBadge size="XXL" availability="made_to_order" />);
    expect(screen.getByText("MTO")).toBeInTheDocument();
  });

  it("sets aria-pressed=true when selected", () => {
    render(<SizeBadge size="M" isSelected />);
    expect(screen.getByRole("button")).toHaveAttribute("aria-pressed", "true");
  });

  it("is disabled when out_of_stock", () => {
    render(<SizeBadge size="S" availability="out_of_stock" />);
    expect(screen.getByRole("button")).toBeDisabled();
  });
});

describe("SizePicker", () => {
  const sizes = [
    { size: "S", availability: "in_stock" as const },
    { size: "M", availability: "low_stock" as const },
    { size: "L", availability: "out_of_stock" as const },
  ];

  it("renders all size options", () => {
    render(<SizePicker sizes={sizes} onSelect={vi.fn()} />);
    expect(screen.getByText("S")).toBeInTheDocument();
    expect(screen.getByText("M")).toBeInTheDocument();
    expect(screen.getByText("L")).toBeInTheDocument();
  });

  it("calls onSelect with correct size", () => {
    const mockSelect = vi.fn();
    render(<SizePicker sizes={sizes} onSelect={mockSelect} />);
    fireEvent.click(screen.getByText("S"));
    expect(mockSelect).toHaveBeenCalledWith("S");
  });

  it("shows selected size in header when selectedSize is set", () => {
    render(<SizePicker sizes={sizes} selectedSize="M" onSelect={vi.fn()} />);
    expect(screen.getByText("Size: M")).toBeInTheDocument();
  });

  it("does not call onSelect for out_of_stock", () => {
    const mockSelect = vi.fn();
    render(<SizePicker sizes={sizes} onSelect={mockSelect} />);
    // L is out_of_stock — button is disabled
    const lButton = screen.getByRole("button", { name: /Size L/i });
    fireEvent.click(lButton);
    expect(mockSelect).not.toHaveBeenCalledWith("L");
  });
});
