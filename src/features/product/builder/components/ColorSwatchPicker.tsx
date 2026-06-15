"use client";

/**
 * @file ColorSwatchPicker.tsx
 * @description Enterprise-grade searchable color swatch picker for the FASHIONISTAR
 * product builder. Uses Shadcn Popover + Command (Combobox) pattern.
 *
 * Features:
 *  - 150+ fashion colors (2026 Pantone + Heritage + Textile standards)
 *  - Real-time search by color name
 *  - Each row shows: [Left] Color name | [Right] Color swatch circle
 *  - Multiple-selection mode (for Step 2 color catalog)
 *  - Single-selection mode (for Step 3 gallery media mapping)
 *  - Returns { color_name, color_hex } — no FK, no API call
 *  - Beautiful swatch chips for selected colors
 *  - Zero runtime API dependency — all data is pre-compiled static
 */

import { useState, useMemo } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Check, ChevronDown, X, Palette } from "lucide-react";
import { FASHION_COLORS, type FashionColor, COLOR_FAMILIES } from "../data/fashionColors";

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface SelectedColor {
  color_name: string;
  color_hex: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// MULTI-SELECT: Step 2 — Color Catalog picker (vendor picks all product colors)
// ─────────────────────────────────────────────────────────────────────────────

interface MultiColorSwatchPickerProps {
  /** Currently selected colors. */
  selectedColors: SelectedColor[];
  /** Called when selection changes. */
  onChange: (colors: SelectedColor[]) => void;
  /** Max selectable colors (default: 20). */
  maxColors?: number;
  /** Placeholder for trigger button. */
  placeholder?: string;
  className?: string;
}

export function MultiColorSwatchPicker({
  selectedColors,
  onChange,
  maxColors = 20,
  placeholder = "Add colour variants…",
  className,
}: MultiColorSwatchPickerProps) {
  const [open, setOpen] = useState(false);

  const isSelected = (color: FashionColor) =>
    selectedColors.some((s) => s.color_name === color.name);

  const toggleColor = (color: FashionColor) => {
    if (isSelected(color)) {
      onChange(selectedColors.filter((s) => s.color_name !== color.name));
    } else {
      if (selectedColors.length >= maxColors) return;
      onChange([...selectedColors, { color_name: color.name, color_hex: color.hex }]);
    }
  };

  const removeColor = (colorName: string) => {
    onChange(selectedColors.filter((s) => s.color_name !== colorName));
  };

  // Group colors by family for the command list
  const groupedColors = useMemo(() => {
    return COLOR_FAMILIES.map((family) => ({
      family,
      colors: FASHION_COLORS.filter((c) => c.family === family),
    }));
  }, []);

  return (
    <div className={cn("space-y-3", className)}>
      {/* Trigger */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "flex items-center justify-between w-full px-4 py-3 rounded-xl border text-sm font-medium transition-all",
              "bg-white border-[#D9D9D9] text-[#5A6465]",
              "hover:border-[#FDA600]/50 hover:bg-[#FFF6E3]/20",
              "focus:outline-none focus:ring-2 focus:ring-[#01454A]/20 focus:border-[#01454A]",
              open && "border-[#01454A] ring-2 ring-[#01454A]/20"
            )}
          >
            <span className="flex items-center gap-2">
              <Palette className="w-4 h-4 text-[#01454A]" />
              {selectedColors.length > 0 ? (
                <span className="text-[#1A1208] font-semibold">
                  {selectedColors.length} colour{selectedColors.length !== 1 ? "s" : ""} selected
                </span>
              ) : (
                <span className="text-zinc-400">{placeholder}</span>
              )}
            </span>
            <ChevronDown
              className={cn(
                "w-4 h-4 text-zinc-400 transition-transform duration-200",
                open && "rotate-180"
              )}
            />
          </button>
        </PopoverTrigger>

        <PopoverContent
          className="w-[340px] p-0 border border-[#D9D9D9] shadow-xl rounded-2xl bg-white overflow-hidden"
          align="start"
          side="bottom"
          sideOffset={6}
        >
          <Command className="bg-white">
            <div className="border-b border-[#ECE6D6] px-3 py-2">
              <CommandInput
                placeholder="Search colours (e.g. Midnight Blue, Sage…)"
                className="h-9 text-sm placeholder:text-zinc-400 border-0 focus:ring-0 bg-transparent"
              />
            </div>
            <CommandList className="max-h-[320px] overflow-y-auto overscroll-contain">
              <CommandEmpty className="py-8 text-center text-sm text-zinc-400">
                No colour found. Try a different name.
              </CommandEmpty>

              {groupedColors.map(({ family, colors }) => (
                <CommandGroup
                  key={family}
                  heading={
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider px-1">
                      {family}
                    </span>
                  }
                  className="py-1"
                >
                  {colors.map((color) => {
                    const selected = isSelected(color);
                    const isLight = isLightColor(color.hex);
                    return (
                      <CommandItem
                        key={color.name}
                        value={color.name}
                        onSelect={() => toggleColor(color)}
                        className={cn(
                          "flex items-center justify-between px-3 py-2 mx-1 rounded-lg cursor-pointer transition-all",
                          "data-[selected=true]:bg-[#F5F5F5]",
                          selected && "bg-[#F0F9F9]"
                        )}
                      >
                        {/* Left: Check + Name */}
                        <span className="flex items-center gap-2.5">
                          <span
                            className={cn(
                              "w-4 h-4 rounded-sm flex items-center justify-center flex-shrink-0 border border-[#01454A]/30 transition-all",
                              selected ? "bg-[#01454A]" : "bg-transparent"
                            )}
                          >
                            {selected && <Check className="w-2.5 h-2.5 text-white" />}
                          </span>
                          <span className="text-sm font-medium text-[#1A1208]">{color.name}</span>
                        </span>

                        {/* Right: Color Swatch Circle */}
                        <span
                          className={cn(
                            "w-7 h-7 rounded-full border-2 flex-shrink-0 shadow-sm transition-transform",
                            selected ? "border-[#01454A] scale-110" : "border-zinc-200",
                            // Add pattern for very light/white colors
                            isLight && "ring-1 ring-zinc-200"
                          )}
                          style={{ backgroundColor: color.hex }}
                          title={`${color.name} — ${color.hex}`}
                        />
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              ))}
            </CommandList>

            {selectedColors.length > 0 && (
              <div className="border-t border-[#ECE6D6] px-3 py-2 flex items-center justify-between bg-[#FAFAF8]">
                <span className="text-xs text-zinc-500 font-medium">
                  {selectedColors.length}/{maxColors} selected
                </span>
                <button
                  type="button"
                  onClick={() => onChange([])}
                  className="text-xs text-red-500 font-semibold hover:underline"
                >
                  Clear all
                </button>
              </div>
            )}
          </Command>
        </PopoverContent>
      </Popover>

      {/* Selected Color Chips */}
      {selectedColors.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedColors.map((color) => {
            const isLight = isLightColor(color.color_hex);
            return (
              <Badge
                key={color.color_name}
                className={cn(
                  "flex items-center gap-1.5 pl-1.5 pr-2 py-1 rounded-full border",
                  "bg-white border-[#D9D9D9] text-[#1A1208] hover:border-[#01454A]/50",
                  "transition-all cursor-default"
                )}
              >
                <span
                  className={cn(
                    "w-4 h-4 rounded-full border flex-shrink-0",
                    isLight ? "border-zinc-300" : "border-transparent"
                  )}
                  style={{ backgroundColor: color.color_hex }}
                />
                <span className="text-xs font-semibold">{color.color_name}</span>
                <span className="text-xs text-zinc-400 font-mono">{color.color_hex}</span>
                <button
                  type="button"
                  onClick={() => removeColor(color.color_name)}
                  className="ml-0.5 text-zinc-400 hover:text-red-500 transition-colors"
                  aria-label={`Remove ${color.color_name}`}
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SINGLE-SELECT: Step 3 Gallery — Inline color association per media item
// ─────────────────────────────────────────────────────────────────────────────

interface SingleColorSwatchPickerProps {
  /** Currently selected color (null = no link). */
  value: SelectedColor | null;
  /** Available colors to restrict choice to (from Step 2 selection). */
  availableColors?: SelectedColor[];
  /** Called when color changes. */
  onChange: (color: SelectedColor | null) => void;
  placeholder?: string;
  className?: string;
}

export function SingleColorSwatchPicker({
  value,
  availableColors,
  onChange,
  placeholder = "Associate a colour…",
  className,
}: SingleColorSwatchPickerProps) {
  const [open, setOpen] = useState(false);

  // If availableColors provided, filter to those; else show all 150+
  const colorList = availableColors ?? FASHION_COLORS.map((c) => ({
    color_name: c.name,
    color_hex: c.hex,
  }));

  const handleSelect = (colorName: string) => {
    if (colorName === "__none__") {
      onChange(null);
      setOpen(false);
      return;
    }
    const found = colorList.find((c) => c.color_name === colorName);
    if (found) {
      onChange(found);
      setOpen(false);
    }
  };

  const isLight = value ? isLightColor(value.color_hex) : false;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "flex items-center justify-between w-full h-8 px-3 rounded-lg border text-xs font-medium transition-all",
            "bg-white border-[#D9D9D9] text-[#5A6465]",
            "hover:border-[#FDA600]/50",
            "focus:outline-none focus:ring-1 focus:ring-[#01454A]/30",
            open && "border-[#01454A]",
            className
          )}
        >
          {value ? (
            <span className="flex items-center gap-2">
              <span
                className={cn(
                  "w-4 h-4 rounded-full flex-shrink-0 border",
                  isLight ? "border-zinc-300" : "border-transparent"
                )}
                style={{ backgroundColor: value.color_hex }}
              />
              <span className="font-semibold text-[#1A1208] truncate">{value.color_name}</span>
            </span>
          ) : (
            <span className="text-zinc-400">{placeholder}</span>
          )}
          <ChevronDown className={cn("w-3 h-3 text-zinc-400 flex-shrink-0 transition-transform", open && "rotate-180")} />
        </button>
      </PopoverTrigger>

      <PopoverContent
        className="w-[280px] p-0 border border-[#D9D9D9] shadow-xl rounded-xl bg-white overflow-hidden"
        align="start"
        sideOffset={4}
      >
        <Command className="bg-white">
          <div className="border-b border-[#ECE6D6] px-2 py-1.5">
            <CommandInput
              placeholder="Search colour…"
              className="h-8 text-xs border-0 focus:ring-0 bg-transparent placeholder:text-zinc-400"
            />
          </div>
          <CommandList className="max-h-[240px] overflow-y-auto">
            <CommandEmpty className="py-5 text-center text-xs text-zinc-400">
              No colour found.
            </CommandEmpty>
            <CommandGroup>
              <CommandItem
                value="__none__"
                onSelect={() => handleSelect("__none__")}
                className="flex items-center justify-between px-3 py-2 mx-1 rounded-lg cursor-pointer text-xs text-zinc-500"
              >
                <span>General / No Colour Link</span>
                {!value && <Check className="w-3 h-3 text-[#01454A]" />}
              </CommandItem>
              {colorList.map((color) => {
                const selected = value?.color_name === color.color_name;
                const light = isLightColor(color.color_hex);
                return (
                  <CommandItem
                    key={color.color_name}
                    value={color.color_name}
                    onSelect={() => handleSelect(color.color_name)}
                    className={cn(
                      "flex items-center justify-between px-3 py-2 mx-1 rounded-lg cursor-pointer transition-all",
                      selected && "bg-[#F0F9F9]"
                    )}
                  >
                    <span className="flex items-center gap-2">
                      <span
                        className={cn(
                          "w-5 h-5 rounded-full border-2 flex-shrink-0",
                          selected ? "border-[#01454A]" : "border-zinc-200",
                          light && "ring-1 ring-zinc-200"
                        )}
                        style={{ backgroundColor: color.color_hex }}
                      />
                      <span className="text-xs font-medium text-[#1A1208]">{color.color_name}</span>
                    </span>
                    {selected && <Check className="w-3 h-3 text-[#01454A]" />}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// UTILITY: detect light colors for border/ring contrast
// ─────────────────────────────────────────────────────────────────────────────

function isLightColor(hex: string): boolean {
  try {
    const h = hex.replace("#", "");
    const r = parseInt(h.substring(0, 2), 16);
    const g = parseInt(h.substring(2, 4), 16);
    const b = parseInt(h.substring(4, 6), 16);
    // Perceived luminance formula
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.75;
  } catch {
    return false;
  }
}
