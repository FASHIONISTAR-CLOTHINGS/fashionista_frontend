"use client";

/**
 * @file Step4PricingAndSKUs.tsx
 * @description Step 4 — Base Pricing, Stock, Shipping profiles, and Multi-Variant Matrix Table
 */

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { useFormContext, useFieldArray } from "react-hook-form";
import { apiAsync } from "@/core/api/client.async";
import type { ProductBuilderFormValues, VariantRow } from "../schemas/builder.schemas";

// ── Shadcn/ui primitives ──────────────────────────────────────────────────────
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  TrendingDown,
  DollarSign,
  Truck,
  Box,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// TYPES & CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

interface Courier {
  id: string;
  name: string;
  base_fee: string;
  estimated_days_min: number;
  estimated_days_max: number;
}

interface CourierEnvelope {
  results?: Courier[];
}

interface CatalogItem { id: string; name: string; hex_code?: string; }
interface PaginatedEnvelope<T> { results?: T[]; }

const CURRENCIES = [
  { code: "NGN", label: "₦ Nigerian Naira" },
  { code: "USD", label: "$ US Dollar" },
  { code: "GBP", label: "£ British Pound" },
  { code: "EUR", label: "€ Euro" },
  { code: "GHS", label: "₵ Ghanaian Cedi" },
];

/** Generates a default SKU from size and color names. */
function autoSku(sizeName: string, colorName: string, index: number): string {
  const s = sizeName.replace(/\s+/g, "-").toUpperCase().slice(0, 8);
  const c = colorName.replace(/\s+/g, "-").toUpperCase().slice(0, 8);
  return `VAR-${s}-${c}-${String(index).padStart(3, "0")}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export function Step4PricingAndSKUs() {
  const form = useFormContext<ProductBuilderFormValues>();

  const sizeIds = form.watch("size_ids") ?? [];
  const colorIds = form.watch("color_ids") ?? [];
  const price = form.watch("price");
  const oldPrice = form.watch("old_price");

  const { fields: variantFields, replace: replaceVariants } = useFieldArray({
    control: form.control,
    name: "variants",
  });

  // Queries: Couriers and Variant Catalog metadata
  const { data: catalogData, isLoading: catalogLoading } = useQuery({
    queryKey: ["product-builder", "variant-matrix-metadata"],
    queryFn: async () => {
      const [sizesData, colorsData, couriersData] = await Promise.all([
        apiAsync.get("product/sizes/?page_size=100").json<PaginatedEnvelope<CatalogItem>>(),
        apiAsync.get("product/colors/?page_size=100").json<PaginatedEnvelope<CatalogItem>>(),
        apiAsync.get("product/couriers/?page_size=50&active=true").json<CourierEnvelope>().catch(() => ({ results: [] })),
      ]);

      return {
        sizeMap: Object.fromEntries((sizesData.results ?? []).map((s) => [s.id, s])),
        colorMap: Object.fromEntries((colorsData.results ?? []).map((c) => [c.id, c])),
        couriers: couriersData.results ?? [],
      };
    },
    staleTime: 5 * 60_000,
    gcTime: 10 * 60_000,
  });

  const sizeMap = catalogData?.sizeMap ?? {};
  const colorMap = catalogData?.colorMap ?? {};
  const couriers = catalogData?.couriers ?? [];

  // Compute discount pct
  const discountPct = React.useMemo(() => {
    const p = parseFloat(price ?? "0");
    const o = parseFloat(oldPrice ?? "0");
    if (!isNaN(p) && !isNaN(o) && o > p && o > 0) {
      return Math.round(((o - p) / o) * 100);
    }
    return null;
  }, [price, oldPrice]);

  // Matrix generation
  React.useEffect(() => {
    if (sizeIds.length === 0 && colorIds.length === 0) return;

    let index = 0;
    const newRows: VariantRow[] = [];

    const sizeLoop = sizeIds.length > 0 ? sizeIds : [null];
    const colorLoop = colorIds.length > 0 ? colorIds : [null];

    for (const sId of sizeLoop) {
      for (const cId of colorLoop) {
        const existing = variantFields.find(
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
          is_default: existing?.is_default ?? false,
          notes: existing?.notes ?? "",
        });
        index++;
      }
    }
    replaceVariants(newRows);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sizeIds.join(","), colorIds.join(","), replaceVariants, sizeMap, colorMap]);

  if (catalogLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-[#01454A]" />
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* ── SECTION A: Base Pricing & Currency ── */}
      <div className="rounded-2xl border border-[#ECE6D6] bg-[#FAFAF8] p-6 space-y-6">
        <h3 className="text-md font-bold text-[#1A1208] border-b border-[#ECE6D6] pb-2 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-[#01454A]" />
          1. Base Pricing
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <FormField
            control={form.control}
            name="currency"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[#1A1208] font-semibold text-sm">Currency</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="bg-white border border-[#D9D9D9] text-[#1A1208] focus:ring-[#01454A] focus:border-[#01454A] rounded-xl px-4 py-3">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-white border border-[#D9D9D9] text-[#1A1208] shadow-lg">
                    {CURRENCIES.map((c) => (
                      <SelectItem key={c.code} value={c.code}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem className="sm:col-span-2">
                <FormLabel className="text-[#1A1208] font-semibold text-sm">
                  Base Price <span className="text-[#FDA600]">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    step="0.01"
                    min="5000"
                    placeholder="e.g. 35000.00 (Must be at least ₦5,000.00)"
                    className="bg-white border border-[#D9D9D9] text-[#1A1208] placeholder:text-[#7A6B44]/50 focus:ring-[#01454A] focus:border-[#01454A] rounded-xl px-4 py-3"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Original Price */}
        <FormField
          control={form.control}
          name="old_price"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center gap-3">
                <FormLabel className="text-[#1A1208] font-semibold text-sm">
                  Original Price (before discount)
                </FormLabel>
                {discountPct !== null && (
                  <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 gap-1 font-semibold">
                    <TrendingDown className="w-3 h-3" />
                    {discountPct}% OFF
                  </Badge>
                )}
              </div>
              <FormControl>
                <Input
                  {...field}
                  type="number"
                  step="0.01"
                  min="5000"
                  placeholder="e.g. 45000.00 (Leave blank if no discount)"
                  className="bg-white border border-[#D9D9D9] text-[#1A1208] placeholder:text-[#7A6B44]/50 focus:ring-[#01454A] focus:border-[#01454A] rounded-xl px-4 py-3"
                />
              </FormControl>
              <FormDescription className="text-zinc-500 text-xs">
                Must be higher than the selling price if provided.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* ── SECTION B: Stock & Logistics ── */}
      <div className="rounded-2xl border border-[#ECE6D6] bg-[#FAFAF8] p-6 space-y-6">
        <h3 className="text-md font-bold text-[#1A1208] border-b border-[#ECE6D6] pb-2 flex items-center gap-2">
          <Truck className="w-5 h-5 text-[#01454A]" />
          2. Inventory &amp; Shipping Profiles
        </h3>

        {/* Stock & Max Stock */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="stock_qty"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[#1A1208] font-semibold text-sm">
                  Global Stock Quantity <span className="text-[#FDA600]">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    min="1"
                    step="1"
                    placeholder="e.g. 50"
                    onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 0)}
                    className="bg-white border border-[#D9D9D9] text-[#1A1208] placeholder:text-[#7A6B44]/50 focus:ring-[#01454A] focus:border-[#01454A] rounded-xl px-4 py-3"
                  />
                </FormControl>
                <FormDescription className="text-zinc-500 text-xs">
                  Initial total quantities available across all variations.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="max_stock"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[#1A1208] font-semibold text-sm">
                  Maximum Purchase Limit
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    min="1"
                    step="1"
                    value={field.value ?? ""}
                    placeholder="Unlimited"
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      field.onChange(isNaN(val) ? null : val);
                    }}
                    className="bg-white border border-[#D9D9D9] text-[#1A1208] placeholder:text-[#7A6B44]/50 focus:ring-[#01454A] focus:border-[#01454A] rounded-xl px-4 py-3"
                  />
                </FormControl>
                <FormDescription className="text-zinc-500 text-xs">
                  Max purchase quantity allowed per buyer order.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Shipping configurations */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormField
            control={form.control}
            name="weight_kg"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[#1A1208] font-semibold text-sm">Weight (kg)</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="e.g. 1.25"
                    className="bg-white border border-[#D9D9D9] text-[#1A1208] placeholder:text-[#7A6B44]/50 focus:ring-[#01454A] focus:border-[#01454A] rounded-xl px-4 py-3"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="shipping_amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[#1A1208] font-semibold text-sm">
                  Flat Shipping Fee (₦)
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="e.g. 2500.00"
                    className="bg-white border border-[#D9D9D9] text-[#1A1208] placeholder:text-[#7A6B44]/50 focus:ring-[#01454A] focus:border-[#01454A] rounded-xl px-4 py-3"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="courier_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[#1A1208] font-semibold text-sm">Courier Preference</FormLabel>
                <Select onValueChange={field.onChange} value={field.value ?? ""}>
                  <FormControl>
                    <SelectTrigger className="bg-white border border-[#D9D9D9] text-[#1A1208] focus:ring-[#01454A] focus:border-[#01454A] rounded-xl px-4 py-3">
                      <SelectValue placeholder="Platform Default" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-white border border-[#D9D9D9] text-[#1A1208] shadow-lg">
                    <SelectItem value="">Platform Default courier</SelectItem>
                    {couriers.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name} — ₦{parseFloat(c.base_fee).toLocaleString()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      {/* ── SECTION C: Variations SKU Matrix Table ── */}
      {(sizeIds.length > 0 || colorIds.length > 0) && (
        <div className="rounded-2xl border border-[#ECE6D6] bg-[#FAFAF8] p-6 space-y-6">
          <h3 className="text-md font-bold text-[#1A1208] border-b border-[#ECE6D6] pb-2 flex items-center gap-2">
            <Box className="w-5 h-5 text-[#01454A]" />
            3. Variations Matrix SKU Table
          </h3>

          <div className="overflow-x-auto rounded-xl border border-[#D9D9D9] bg-white shadow-sm">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-zinc-50 border-b border-[#ECE6D6] text-zinc-600 font-bold uppercase tracking-wider">
                  <th className="p-3 border-r border-[#ECE6D6]">Size</th>
                  <th className="p-3 border-r border-[#ECE6D6]">Colour</th>
                  <th className="p-3 border-r border-[#ECE6D6]">SKU Code</th>
                  <th className="p-3 border-r border-[#ECE6D6]">Price Override (₦)</th>
                  <th className="p-3 border-r border-[#ECE6D6]">Stock Qty</th>
                  <th className="p-3">Active</th>
                </tr>
              </thead>
              <tbody>
                {variantFields.map((field, idx) => {
                  const size = field.size_id ? sizeMap[field.size_id] : null;
                  const color = field.color_id ? colorMap[field.color_id] : null;

                  return (
                    <tr key={field.id} className="border-b border-[#ECE6D6] hover:bg-zinc-50/50">
                      <td className="p-3 border-r border-[#ECE6D6]">
                        {size ? (
                          <Badge className="bg-[#E6F4F5] text-[#01454A] border-0 rounded-full font-bold">
                            {size.name}
                          </Badge>
                        ) : (
                          <span className="text-zinc-400">—</span>
                        )}
                      </td>
                      <td className="p-3 border-r border-[#ECE6D6]">
                        {color ? (
                          <div className="flex items-center gap-1.5">
                            <span
                              className="w-3.5 h-3.5 rounded-full border border-zinc-200 flex-shrink-0"
                              style={{ backgroundColor: color.hex_code }}
                            />
                            <span className="font-semibold text-zinc-700">{color.name}</span>
                          </div>
                        ) : (
                          <span className="text-zinc-400">—</span>
                        )}
                      </td>
                      <td className="p-2 border-r border-[#ECE6D6]">
                        <FormField
                          control={form.control}
                          name={`variants.${idx}.sku`}
                          render={({ field: f }) => (
                            <FormControl>
                              <Input
                                {...f}
                                placeholder="Auto"
                                className="h-8 text-xs border-[#D9D9D9] rounded-lg px-2 w-32 bg-white"
                              />
                            </FormControl>
                          )}
                        />
                      </td>
                      <td className="p-2 border-r border-[#ECE6D6]">
                        <FormField
                          control={form.control}
                          name={`variants.${idx}.price_override`}
                          render={({ field: f }) => (
                            <FormControl>
                              <Input
                                {...f}
                                placeholder="Base Price fallback"
                                className="h-8 text-xs border-[#D9D9D9] rounded-lg px-2 w-28 bg-white"
                              />
                            </FormControl>
                          )}
                        />
                      </td>
                      <td className="p-2 border-r border-[#ECE6D6]">
                        <FormField
                          control={form.control}
                          name={`variants.${idx}.stock_qty`}
                          render={({ field: f }) => (
                            <FormControl>
                              <Input
                                {...f}
                                type="number"
                                min="0"
                                onChange={(e) => f.onChange(parseInt(e.target.value, 10) || 0)}
                                className="h-8 text-xs border-[#D9D9D9] rounded-lg px-2 w-20 bg-white"
                              />
                            </FormControl>
                          )}
                        />
                      </td>
                      <td className="p-3">
                        <FormField
                          control={form.control}
                          name={`variants.${idx}.is_active`}
                          render={({ field: f }) => (
                            <FormControl>
                              <Switch
                                checked={f.value}
                                onCheckedChange={f.onChange}
                                className="data-[state=checked]:bg-[#01454A]"
                              />
                            </FormControl>
                          )}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <FormField
            control={form.control}
            name="variants"
            render={() => <FormItem><FormMessage /></FormItem>}
          />
        </div>
      )}
    </div>
  );
}
