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

import React, { useEffect } from "react";
import { useFormContext, useFieldArray } from "react-hook-form";
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

  // Fetch catalog labels for display
  const [sizeMap, setSizeMap] = React.useState<Record<string, CatalogItem>>({});
  const [colorMap, setColorMap] = React.useState<Record<string, CatalogItem>>({});

  React.useEffect(() => {
    fetch("/api/product/sizes/?page_size=100")
      .then((r) => r.json())
      .then((d) => setSizeMap(Object.fromEntries((d.results ?? []).map((s: CatalogItem) => [s.id, s]))));
    fetch("/api/product/colors/?page_size=100")
      .then((r) => r.json())
      .then((d) => setColorMap(Object.fromEntries((d.results ?? []).map((c: CatalogItem) => [c.id, c]))));
  }, []);

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
        <div className="p-4 rounded-full bg-white/5">
          <span className="text-3xl">📦</span>
        </div>
        <p className="text-white/60 text-sm">
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
        <p className="text-sm text-white/60">
          {fields.length} variant{fields.length !== 1 ? "s" : ""} generated
        </p>
        <Badge className="bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/30 text-xs">
          Set stock &amp; price per variant
        </Badge>
      </div>

      {/* ── Responsive table ── */}
      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-white/5">
              <th className="text-left text-white/50 font-medium px-4 py-3 whitespace-nowrap">Size</th>
              <th className="text-left text-white/50 font-medium px-4 py-3 whitespace-nowrap">Colour</th>
              <th className="text-left text-white/50 font-medium px-4 py-3 whitespace-nowrap">SKU</th>
              <th className="text-left text-white/50 font-medium px-4 py-3 whitespace-nowrap">Price Override</th>
              <th className="text-left text-white/50 font-medium px-4 py-3 whitespace-nowrap">Stock</th>
              <th className="text-center text-white/50 font-medium px-4 py-3 whitespace-nowrap">Active</th>
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
                    "border-b border-white/5 last:border-0",
                    idx % 2 === 0 ? "bg-transparent" : "bg-white/2",
                  )}
                >
                  {/* Size */}
                  <td className="px-4 py-3">
                    {size ? (
                      <Badge className="bg-violet-500/20 text-violet-300 border-violet-500/30">
                        {size.name}
                      </Badge>
                    ) : (
                      <span className="text-white/30 text-xs">—</span>
                    )}
                  </td>

                  {/* Color */}
                  <td className="px-4 py-3">
                    {color ? (
                      <div className="flex items-center gap-2">
                        <span
                          className="w-4 h-4 rounded-full border border-white/20 flex-shrink-0"
                          style={{ backgroundColor: color.hex_code }}
                        />
                        <span className="text-white/70 text-xs">{color.name}</span>
                      </div>
                    ) : (
                      <span className="text-white/30 text-xs">—</span>
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
                              className="bg-white/5 border-white/10 text-white text-xs h-8 w-36 focus:border-violet-500"
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
                              className="bg-white/5 border-white/10 text-white text-xs h-8 w-28 focus:border-violet-500"
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
                              className="bg-white/5 border-white/10 text-white text-xs h-8 w-20 focus:border-violet-500"
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
