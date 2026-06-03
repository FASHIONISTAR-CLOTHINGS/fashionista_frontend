"use client";

/**
 * @file Step5Variants.tsx
 * @description Step 5 — SKU-level Variants Table
 *
 * Auto-generates a variant matrix from Step 4's size_ids × color_ids.
 * Each row represents one unique SKU. Vendor can:
 *   - Override price per variant
 *   - Set individual stock quantities
 *   - Set custom SKU code (auto-generated if blank)
 *   - Toggle active/inactive
 *
 * The table recalculates when size_ids or color_ids change, preserving
 * existing data for unchanged combinations.
 */

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useFormContext, useFieldArray } from "react-hook-form";
import { apiAsync } from "@/core/api/client.async";
import type { ProductBuilderFormValues, VariantRow } from "../schemas/builder.schemas";
import {
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

interface CatalogItem { id: string; name: string; hex_code?: string; }
interface PaginatedEnvelope<T> { results?: T[]; }

/** Generates a default SKU from size and color names. */
function autoSku(sizeName: string, colorName: string, index: number): string {
  const s = sizeName.replace(/\s+/g, "-").toUpperCase().slice(0, 8);
  const c = colorName.replace(/\s+/g, "-").toUpperCase().slice(0, 8);
  return `VAR-${s}-${c}-${String(index).padStart(3, "0")}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export function Step5Variants() {
  const form = useFormContext<ProductBuilderFormValues>();
  const sizeIds = form.watch("size_ids") ?? [];
  const colorIds = form.watch("color_ids") ?? [];

  const { fields, replace } = useFieldArray({
    control: form.control,
    name: "variants",
  });

  const { data: catalogData } = useQuery({
    queryKey: ["product-builder", "variant-catalog"],
    queryFn: async () => {
      const [sizesData, colorsData] = await Promise.all([
        apiAsync.get("product/sizes/?page_size=100").json<PaginatedEnvelope<CatalogItem>>(),
        apiAsync.get("product/colors/?page_size=100").json<PaginatedEnvelope<CatalogItem>>(),
      ]);

      return {
        sizeMap: Object.fromEntries((sizesData.results ?? []).map((s) => [s.id, s])),
        colorMap: Object.fromEntries((colorsData.results ?? []).map((c) => [c.id, c])),
      };
    },
    staleTime: 5 * 60_000,
    gcTime: 10 * 60_000,
  });
  const sizeMap = catalogData?.sizeMap ?? {};
  const colorMap = catalogData?.colorMap ?? {};

  // ── Auto-generate matrix when selections change ────────────────────────────
  useEffect(() => {
    if (sizeIds.length === 0 && colorIds.length === 0) return;

    // Build new matrix
    let index = 0;
    const newRows: VariantRow[] = [];

    const sizeLoop = sizeIds.length > 0 ? sizeIds : [null];
    const colorLoop = colorIds.length > 0 ? colorIds : [null];

    for (const sId of sizeLoop) {
      for (const cId of colorLoop) {
        const existing = fields.find(
          (f) => f.size_id === sId && f.color_id === cId,
        );
        newRows.push({
          size_id: sId,
          color_id: cId,
          price_override: existing?.price_override ?? "",
          stock_qty: existing?.stock_qty ?? 0,
          sku: existing?.sku ?? autoSku(
            sId ? (sizeMap[sId]?.name ?? sId) : "ONE",
            cId ? (colorMap[cId]?.name ?? cId) : "ONE",
            index,
          ),
          is_active: existing?.is_active ?? true,
        });
        index++;
      }
    }
    replace(newRows);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sizeIds.join(","), colorIds.join(",")]);

  if (fields.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
        <div className="p-4 rounded-full bg-zinc-100">
          <span className="text-3xl">📦</span>
        </div>
        <p className="text-zinc-500 text-sm">
          Go back to Step 4 to select sizes and/or colours.
          <br />
          Variant rows will appear here automatically.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm text-zinc-500">
          {fields.length} variant{fields.length !== 1 ? "s" : ""} generated
        </p>
        <Badge className="bg-fuchsia-50 text-fuchsia-600 border border-fuchsia-200 text-xs py-1 px-3 rounded-full font-medium">
          Set stock &amp; price per variant
        </Badge>
      </div>

      {/* ── Responsive table ── */}
      <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-200 bg-zinc-50">
              <th className="text-left text-zinc-500 font-semibold px-4 py-3.5 whitespace-nowrap">Size</th>
              <th className="text-left text-zinc-500 font-semibold px-4 py-3.5 whitespace-nowrap">Colour</th>
              <th className="text-left text-zinc-500 font-semibold px-4 py-3.5 whitespace-nowrap">SKU</th>
              <th className="text-left text-zinc-500 font-semibold px-4 py-3.5 whitespace-nowrap">Price Override</th>
              <th className="text-left text-zinc-500 font-semibold px-4 py-3.5 whitespace-nowrap">Stock</th>
              <th className="text-center text-zinc-500 font-semibold px-4 py-3.5 whitespace-nowrap">Active</th>
            </tr>
          </thead>
          <tbody>
            {fields.map((field, idx) => {
              const size = field.size_id ? sizeMap[field.size_id] : null;
              const color = field.color_id ? colorMap[field.color_id] : null;

              return (
                <tr
                  key={field.id}
                  className={cn(
                    "border-b border-zinc-100 last:border-0 hover:bg-zinc-50/50 transition-colors",
                    idx % 2 === 0 ? "bg-transparent" : "bg-zinc-50/30",
                  )}
                >
                  {/* Size */}
                  <td className="px-4 py-3">
                    {size ? (
                      <Badge className="bg-violet-50 text-violet-600 border border-violet-100 rounded-full font-semibold">
                        {size.name}
                      </Badge>
                    ) : (
                      <span className="text-zinc-400 text-xs">—</span>
                    )}
                  </td>

                  {/* Color */}
                  <td className="px-4 py-3">
                    {color ? (
                      <div className="flex items-center gap-2">
                        <span
                          className="w-4 h-4 rounded-full border border-zinc-200 flex-shrink-0"
                          style={{ backgroundColor: color.hex_code }}
                        />
                        <span className="text-zinc-700 text-xs font-semibold">{color.name}</span>
                      </div>
                    ) : (
                      <span className="text-zinc-400 text-xs">—</span>
                    )}
                  </td>

                  {/* SKU */}
                  <td className="px-4 py-3">
                    <FormField
                      control={form.control}
                      name={`variants.${idx}.sku`}
                      render={({ field: f }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              {...f}
                              className="bg-white border border-[#D9D9D9] text-[#1A1208] placeholder:text-[#7A6B44]/50 focus:ring-violet-500 focus:border-violet-500 rounded-lg text-xs h-9 w-36 px-2.5"
                              placeholder="Auto"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </td>

                  {/* Price Override */}
                  <td className="px-4 py-3">
                    <FormField
                      control={form.control}
                      name={`variants.${idx}.price_override`}
                      render={({ field: f }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              {...f}
                              type="number"
                              step="0.01"
                              min="0"
                              className="bg-white border border-[#D9D9D9] text-[#1A1208] placeholder:text-[#7A6B44]/50 focus:ring-violet-500 focus:border-violet-500 rounded-lg text-xs h-9 w-28 px-2.5"
                              placeholder="Base price"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </td>

                  {/* Stock */}
                  <td className="px-4 py-3">
                    <FormField
                      control={form.control}
                      name={`variants.${idx}.stock_qty`}
                      render={({ field: f }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              {...f}
                              type="number"
                              min="0"
                              step="1"
                              onChange={(e) => f.onChange(parseInt(e.target.value, 10) || 0)}
                              className="bg-white border border-[#D9D9D9] text-[#1A1208] placeholder:text-[#7A6B44]/50 focus:ring-violet-500 focus:border-violet-500 rounded-lg text-xs h-9 w-20 px-2.5"
                              placeholder="0"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </td>

                  {/* Active toggle */}
                  <td className="px-4 py-3 text-center">
                    <FormField
                      control={form.control}
                      name={`variants.${idx}.is_active`}
                      render={({ field: f }) => (
                        <FormItem>
                          <FormControl>
                            <Switch
                              checked={f.value}
                              onCheckedChange={f.onChange}
                              className="data-[state=checked]:bg-violet-500"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ── Global validation message ── */}
      <FormField
        control={form.control}
        name="variants"
        render={() => <FormItem><FormMessage /></FormItem>}
      />
    </div>
  );
}
