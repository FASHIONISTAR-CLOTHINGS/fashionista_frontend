"use client";

/**
 * @file Step4SizesColors.tsx
 * @description Step 4 — Sizes & Colors multi-select.
 *
 * Fetches available sizes and colors from the backend catalog.
 * Selections drive Step 5's variant matrix.
 * Color swatches rendered with hex_code previews.
 */

import { useQuery } from "@tanstack/react-query";
import { useFormContext } from "react-hook-form";
import { apiAsync } from "@/core/api/client.async";
import type { ProductBuilderFormValues } from "../schemas/builder.schemas";
import {
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Loader2, Check } from "lucide-react";

interface SizeOption { id: string; name: string; }
interface ColorOption { id: string; name: string; hex_code: string; }
interface PaginatedEnvelope<T> { results?: T[]; }

export function Step4SizesColors() {
  const form = useFormContext<ProductBuilderFormValues>();
  const selectedSizes = form.watch("size_ids") ?? [];
  const selectedColors = form.watch("color_ids") ?? [];
  const { data, isLoading: loading } = useQuery({
    queryKey: ["product-builder", "sizes-colors"],
    queryFn: async () => {
      const [sizesData, colorsData] = await Promise.all([
        apiAsync.get("product/sizes/?page_size=100").json<PaginatedEnvelope<SizeOption>>(),
        apiAsync.get("product/colors/?page_size=100").json<PaginatedEnvelope<ColorOption>>(),
      ]);

      return {
        sizes: sizesData.results ?? [],
        colors: colorsData.results ?? [],
      };
    },
    staleTime: 5 * 60_000,
    gcTime: 10 * 60_000,
  });
  const sizes = data?.sizes ?? [];
  const colors = data?.colors ?? [];

  const toggleSize = (id: string) => {
    const current = form.getValues("size_ids") ?? [];
    const updated = current.includes(id)
      ? current.filter((s) => s !== id)
      : [...current, id];
    form.setValue("size_ids", updated, { shouldValidate: true });
  };

  const toggleColor = (id: string) => {
    const current = form.getValues("color_ids") ?? [];
    const updated = current.includes(id)
      ? current.filter((c) => c !== id)
      : [...current, id];
    form.setValue("color_ids", updated, { shouldValidate: true });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 animate-spin text-violet-500" />
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* ── Sizes ── */}
      <FormField
        control={form.control}
        name="size_ids"
        render={() => (
          <FormItem>
            <FormLabel className="text-[#1A1208] font-semibold text-base">
              Sizes
            </FormLabel>
            <FormDescription className="text-zinc-500 text-xs mb-4">
              Select all sizes you stock. These define the size axis of your variants.
            </FormDescription>

            {/* Summary badges */}
            {selectedSizes.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {selectedSizes.map((id) => {
                  const s = sizes.find((x) => x.id === id);
                  return (
                    <Badge
                      key={id}
                      className="bg-violet-50 text-violet-600 border border-violet-200 cursor-pointer hover:bg-red-50 hover:text-red-600 pl-3 pr-2 py-1 gap-1 rounded-full font-medium"
                      onClick={() => toggleSize(id)}
                    >
                      {s?.name} ×
                    </Badge>
                  );
                })}
              </div>
            )}

            {/* Chip grid */}
            <div className="flex flex-wrap gap-2">
              {sizes.map((size) => {
                const selected = selectedSizes.includes(size.id);
                return (
                  <button
                    key={size.id}
                    type="button"
                    onClick={() => toggleSize(size.id)}
                    className={cn(
                      "relative px-4 py-2.5 rounded-xl text-sm font-medium border transition-all duration-150",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500",
                      selected
                        ? "bg-violet-50 border-violet-500 text-violet-700 font-semibold"
                        : "bg-white border-zinc-200 text-zinc-600 hover:border-zinc-300 hover:text-zinc-800",
                    )}
                  >
                    {selected && (
                      <Check className="absolute top-1 right-1 w-3 h-3 text-violet-500" />
                    )}
                    {size.name}
                  </button>
                );
              })}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* ── Colors ── */}
      <FormField
        control={form.control}
        name="color_ids"
        render={() => (
          <FormItem>
            <FormLabel className="text-[#1A1208] font-semibold text-base">
              Colours
            </FormLabel>
            <FormDescription className="text-zinc-500 text-xs mb-4">
              Select all colour options you offer. These define the colour axis of your variants.
            </FormDescription>

            {/* Summary badges */}
            {selectedColors.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {selectedColors.map((id) => {
                  const c = colors.find((x) => x.id === id);
                  return (
                    <Badge
                      key={id}
                      className="flex items-center gap-1.5 bg-white border border-zinc-200 text-zinc-700 cursor-pointer hover:bg-red-50 hover:text-red-600 pl-3 pr-2 py-1 rounded-full font-medium"
                      onClick={() => toggleColor(id)}
                    >
                      <span
                        className="w-3 h-3 rounded-full border border-zinc-200 flex-shrink-0"
                        style={{ backgroundColor: c?.hex_code ?? "#888" }}
                      />
                      {c?.name} ×
                    </Badge>
                  );
                })}
              </div>
            )}

            {/* Color swatch grid */}
            <div className="flex flex-wrap gap-3">
              {colors.map((color) => {
                const selected = selectedColors.includes(color.id);
                return (
                  <button
                    key={color.id}
                    type="button"
                    title={color.name}
                    onClick={() => toggleColor(color.id)}
                    className={cn(
                      "flex flex-col items-center gap-2 p-2 rounded-xl border transition-all duration-150 w-[72px] bg-white",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500",
                      selected
                        ? "border-[#FDA600] bg-[#FFF6E3] shadow-sm"
                        : "border-zinc-200 hover:border-zinc-300",
                    )}
                  >
                    <span
                      className={cn(
                        "w-9 h-9 rounded-full border flex items-center justify-center",
                        selected ? "border-[#FDA600]" : "border-zinc-200",
                      )}
                      style={{ backgroundColor: color.hex_code }}
                    >
                      {selected && <Check className="w-4 h-4 text-black font-extrabold" />}
                    </span>
                    <span className="text-[10px] text-zinc-600 font-semibold text-center leading-tight line-clamp-2">
                      {color.name}
                    </span>
                  </button>
                );
              })}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* ── Helper note ── */}
      {(selectedSizes.length > 0 || selectedColors.length > 0) && (
        <div className="bg-violet-50 border border-violet-100 rounded-xl p-4 text-sm text-violet-700">
          <strong>Next:</strong> Step 5 will generate a variant table with{" "}
          <strong>{Math.max(selectedSizes.length, 1) * Math.max(selectedColors.length, 1)}</strong>{" "}
          combination{selectedSizes.length * selectedColors.length !== 1 ? "s" : ""}.
          You can set individual prices and stock per variant.
        </div>
      )}
    </div>
  );
}
