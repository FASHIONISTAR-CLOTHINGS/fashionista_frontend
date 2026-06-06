"use client";

/**
 * entities/product/components/SizeBadge.tsx
 * Displays product size with stock-aware color coding.
 * Used in ProductCard, cart drawer, and order confirmation.
 */

import React from "react";

type SizeAvailability = "in_stock" | "low_stock" | "out_of_stock" | "made_to_order";

interface SizeBadgeProps {
  size: string;
  availability?: SizeAvailability;
  isSelected?: boolean;
  isDisabled?: boolean;
  onClick?: (size: string) => void;
  className?: string;
}

const AVAILABILITY_STYLES: Record<SizeAvailability, string> = {
  in_stock:      "border-white/20 text-slate-300 hover:border-amber-500/60 hover:text-white cursor-pointer",
  low_stock:     "border-amber-500/40 text-amber-400 hover:border-amber-500 cursor-pointer",
  out_of_stock:  "border-white/8 text-slate-600 cursor-not-allowed opacity-50 line-through",
  made_to_order: "border-violet-500/40 text-violet-400 hover:border-violet-500 cursor-pointer",
};

const SELECTED_STYLES: Record<SizeAvailability, string> = {
  in_stock:      "border-amber-500 bg-amber-500/15 text-amber-300",
  low_stock:     "border-amber-500 bg-amber-500/15 text-amber-300",
  out_of_stock:  "border-white/8 text-slate-600",
  made_to_order: "border-violet-500 bg-violet-500/15 text-violet-300",
};

const AVAILABILITY_LABEL: Record<SizeAvailability, string> = {
  in_stock:      "",
  low_stock:     "Low",
  out_of_stock:  "Sold out",
  made_to_order: "MTO",
};

export function SizeBadge({
  size,
  availability = "in_stock",
  isSelected = false,
  isDisabled,
  onClick,
  className = "",
}: SizeBadgeProps) {
  const disabled = isDisabled ?? availability === "out_of_stock";
  const baseStyle = "relative inline-flex flex-col items-center justify-center w-10 h-10 rounded-lg border text-xs font-bold transition-all duration-150 select-none";
  const stateStyle = isSelected
    ? SELECTED_STYLES[availability]
    : AVAILABILITY_STYLES[availability];
  const label = AVAILABILITY_LABEL[availability];

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => !disabled && onClick?.(size)}
      aria-label={`Size ${size}${label ? ` - ${label}` : ""}`}
      aria-pressed={isSelected}
      className={`${baseStyle} ${stateStyle} ${className}`}
    >
      {size}
      {label && (
        <span className="absolute -top-1.5 -right-1.5 text-[8px] bg-amber-500 text-black rounded-full px-1 leading-4 font-bold">
          {label}
        </span>
      )}
      {isSelected && (
        <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-amber-400" />
      )}
    </button>
  );
}

// ── SizePicker — renders a full row of SizeBadges ─────────────────────────────

interface SizeOption {
  size: string;
  availability?: SizeAvailability;
}

interface SizePickerProps {
  sizes: SizeOption[];
  selectedSize?: string | null;
  onSelect: (size: string) => void;
  label?: string;
  className?: string;
}

export function SizePicker({ sizes, selectedSize, onSelect, label = "Select Size", className = "" }: SizePickerProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">{label}</span>
        {selectedSize && (
          <span className="text-xs text-amber-400 font-semibold">Size: {selectedSize}</span>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {sizes.map(({ size, availability }) => (
          <SizeBadge
            key={size}
            size={size}
            availability={availability}
            isSelected={selectedSize === size}
            onClick={onSelect}
          />
        ))}
      </div>
    </div>
  );
}
