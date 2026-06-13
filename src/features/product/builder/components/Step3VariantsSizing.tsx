"use client";

/**
 * @file Step3VariantsSizing.tsx
 * @description Step 3 — Sizes, Colors, SKU Variants, and Measurement Guides
 */

import { useEffect, useMemo, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useFormContext, useFieldArray } from "react-hook-form";
import { apiAsync } from "@/core/api/client.async";
import type { ProductBuilderFormValues, VariantRow, MeasurementGuideRowValues } from "../schemas/builder.schemas";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Check, Loader2, Layers, CheckCircle2, Ruler, Trash2, Plus, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface CatalogItem { id: string; name: string; hex_code?: string; }
interface PaginatedEnvelope<T> { results?: T[]; }

function autoSku(sizeName: string, colorName: string, index: number): string {
  const s = sizeName.replace(/\s+/g, "-").toUpperCase().slice(0, 8);
  const c = colorName.replace(/\s+/g, "-").toUpperCase().slice(0, 8);
  return `VAR-${s}-${c}-${String(index).padStart(3, "0")}`;
}

export function Step3VariantsSizing() {
  const form = useFormContext<ProductBuilderFormValues>();
  const selectedSizes = form.watch("size_ids") ?? [];
  const selectedColors = form.watch("color_ids") ?? [];
  const requiresMeasurement = form.watch("requires_measurement");

  // Field arrays for variants & measurement guides
  const { fields: variantFields, replace: replaceVariants } = useFieldArray({
    control: form.control,
    name: "variants",
  });

  const { fields: guideFields, append: appendGuideRow, remove: removeGuideRow, replace: replaceGuideRows } = useFieldArray({
    control: form.control,
    name: "measurement_guide",
  });

  const { data: catalogData, isLoading: catalogLoading } = useQuery({
    queryKey: ["product-builder", "variant-catalog-full"],
    queryFn: async () => {
      const [sizesData, colorsData] = await Promise.all([
        apiAsync.get("product/sizes/?page_size=100").json<PaginatedEnvelope<CatalogItem>>(),
        apiAsync.get("product/colors/?page_size=100").json<PaginatedEnvelope<CatalogItem>>(),
      ]);

      return {
        sizes: sizesData.results ?? [],
        colors: colorsData.results ?? [],
        sizeMap: Object.fromEntries((sizesData.results ?? []).map((s) => [s.id, s])),
        colorMap: Object.fromEntries((colorsData.results ?? []).map((c) => [c.id, c])),
      };
    },
    staleTime: 5 * 60_000,
    gcTime: 10 * 60_000,
  });

  const sizes = catalogData?.sizes ?? [];
  const colors = catalogData?.colors ?? [];
  const sizeMap = catalogData?.sizeMap ?? {};
  const colorMap = catalogData?.colorMap ?? {};

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

  // ── Variant table Cartesian sync ───────────────────────────────────────────
  useEffect(() => {
    if (selectedSizes.length === 0 && selectedColors.length === 0) {
      replaceVariants([]);
      return;
    }

    let index = 0;
    const newRows: VariantRow[] = [];
    const sizeLoop = selectedSizes.length > 0 ? selectedSizes : [null];
    const colorLoop = selectedColors.length > 0 ? selectedColors : [null];

    for (const sId of sizeLoop) {
      for (const cId of colorLoop) {
        const existing = variantFields.find(
          (f) => f.size_id === sId && f.color_id === cId
        );
        newRows.push({
          size_id: sId,
          color_id: cId,
          price_override: existing?.price_override ?? "",
          stock_qty: existing?.stock_qty ?? 0,
          sku: existing?.sku ?? autoSku(
            sId ? (sizeMap[sId]?.name ?? sId) : "ONE",
            cId ? (colorMap[cId]?.name ?? cId) : "ONE",
            index
          ),
          is_active: existing?.is_active ?? true,
        });
        index++;
      }
    }
    replaceVariants(newRows);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSizes.join(","), selectedColors.join(","), sizeMap, colorMap]);

  // ── Measurement guide rows auto-population sync ─────────────────────────────
  useEffect(() => {
    if (!requiresMeasurement) return;
    const current = form.getValues("measurement_guide") ?? [];
    const newRows: MeasurementGuideRowValues[] = [];

    // Pre-populate rows matching checked sizes
    selectedSizes.forEach((sId, index) => {
      const sizeObj = sizeMap[sId];
      if (!sizeObj) return;

      const existing = current.find((r) => r.size_id === sId || r.size_label === sizeObj.name);
      newRows.push({
        size_id: sId,
        size_label: sizeObj.name,
        chest_cm: existing?.chest_cm ?? "",
        waist_cm: existing?.waist_cm ?? "",
        hip_cm: existing?.hip_cm ?? "",
        shoulder_cm: existing?.shoulder_cm ?? "",
        sleeve_cm: existing?.sleeve_cm ?? "",
        length_cm: existing?.length_cm ?? "",
        inseam_cm: existing?.inseam_cm ?? "",
        foot_length_cm: existing?.foot_length_cm ?? "",
        sort_order: index,
      });
    });

    // Keep custom guide rows that aren't bound to a specific catalog size
    current.forEach((r) => {
      if (!r.size_id) {
        newRows.push(r);
      }
    });

    replaceGuideRows(newRows);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSizes.join(","), requiresMeasurement, sizeMap]);

  if (catalogLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 animate-spin text-[#01454A]" />
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* SECTION A: Options select */}
      <div className="space-y-6">
        <h3 className="text-md font-bold text-[#1A1208] border-b border-[#ECE6D6] pb-2">
          1. Color &amp; Size Catalog
        </h3>

        {/* Sizes */}
        <div className="space-y-2">
          <FormLabel className="text-[#1A1208] font-semibold text-sm">Select Sizes</FormLabel>
          <FormDescription className="text-xs text-zinc-500">
            Select the sizes in which this product is available. Defines sizes axis for SKU creation.
          </FormDescription>
          <div className="flex flex-wrap gap-2 pt-2">
            {sizes.map((size) => {
              const selected = selectedSizes.includes(size.id);
              return (
                <button
                  key={size.id}
                  type="button"
                  onClick={() => toggleSize(size.id)}
                  className={cn(
                    "relative px-4 py-2.5 rounded-xl text-sm font-medium border transition-all",
                    selected
                      ? "bg-[#E6F4F5] border-[#01454A] text-[#01454A] font-semibold"
                      : "bg-white border-[#D9D9D9] text-[#5A6465] hover:border-[#FDA600]/50"
                  )}
                >
                  {selected && <Check className="absolute top-1 right-1 w-3 h-3 text-[#01454A]" />}
                  {size.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Colors */}
        <div className="space-y-2">
          <FormLabel className="text-[#1A1208] font-semibold text-sm font-outfit">Select Colours</FormLabel>
          <FormDescription className="text-xs text-zinc-500">
            Select color options available for this product.
          </FormDescription>
          <div className="flex flex-wrap gap-3 pt-2">
            {colors.map((color) => {
              const selected = selectedColors.includes(color.id);
              return (
                <button
                  key={color.id}
                  type="button"
                  title={color.name}
                  onClick={() => toggleColor(color.id)}
                  className={cn(
                    "flex flex-col items-center gap-1.5 p-2 rounded-xl border w-[72px] bg-white transition-all",
                    selected ? "border-[#FDA600] bg-[#FFF6E3]" : "border-zinc-200 hover:border-zinc-300"
                  )}
                >
                  <span
                    className={cn(
                      "w-8 h-8 rounded-full border flex items-center justify-center",
                      selected ? "border-[#FDA600]" : "border-zinc-200"
                    )}
                    style={{ backgroundColor: color.hex_code }}
                  >
                    {selected && <Check className="w-4 h-4 text-black" />}
                  </span>
                  <span className="text-[10px] text-zinc-600 font-semibold text-center leading-none truncate w-full">
                    {color.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* SECTION B: Variants matrix table */}
      {variantFields.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-[#ECE6D6] pb-2">
            <h3 className="text-md font-bold text-[#1A1208] flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#01454A]" /> 2. SKU Variants List
            </h3>
            <span className="text-xs text-[#01454A] font-semibold bg-[#E6F4F5] px-2 py-0.5 rounded-full border border-[#01454A]/20">
              {variantFields.length} SKU{variantFields.length !== 1 ? "s" : ""} generated
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50">
                  <th className="text-left text-zinc-500 font-semibold px-4 py-3 whitespace-nowrap">Size</th>
                  <th className="text-left text-zinc-500 font-semibold px-4 py-3 whitespace-nowrap">Colour</th>
                  <th className="text-left text-zinc-500 font-semibold px-4 py-3 whitespace-nowrap">SKU Code</th>
                  <th className="text-left text-zinc-500 font-semibold px-4 py-3 whitespace-nowrap">Price Override</th>
                  <th className="text-left text-zinc-500 font-semibold px-4 py-3 whitespace-nowrap">Stock Qty</th>
                  <th className="text-center text-zinc-500 font-semibold px-4 py-3 whitespace-nowrap">Active</th>
                </tr>
              </thead>
              <tbody>
                {variantFields.map((field, idx) => {
                  const size = field.size_id ? sizeMap[field.size_id] : null;
                  const color = field.color_id ? colorMap[field.color_id] : null;

                  return (
                    <tr key={field.id} className="border-b border-zinc-100 last:border-0 hover:bg-zinc-50/30">
                      {/* Size */}
                      <td className="px-4 py-2">
                        {size ? (
                          <Badge className="bg-[#E6F4F5] text-[#01454A] border border-[#01454A]/10 rounded-full font-semibold">
                            {size.name}
                          </Badge>
                        ) : (
                          <span className="text-zinc-400 text-xs">—</span>
                        )}
                      </td>

                      {/* Color */}
                      <td className="px-4 py-2">
                        {color ? (
                          <div className="flex items-center gap-2">
                            <span
                              className="w-3.5 h-3.5 rounded-full border border-zinc-200 flex-shrink-0"
                              style={{ backgroundColor: color.hex_code }}
                            />
                            <span className="text-zinc-700 text-xs font-semibold">{color.name}</span>
                          </div>
                        ) : (
                          <span className="text-zinc-400 text-xs">—</span>
                        )}
                      </td>

                      {/* SKU */}
                      <td className="px-4 py-2">
                        <FormField
                          control={form.control}
                          name={`variants.${idx}.sku`}
                          render={({ field: f }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  {...f}
                                  className="bg-white border border-[#D9D9D9] text-[#1A1208] text-xs h-8 w-36 px-2"
                                  placeholder="Auto"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </td>

                      {/* Price Override */}
                      <td className="px-4 py-2">
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
                                  className="bg-white border border-[#D9D9D9] text-[#1A1208] text-xs h-8 w-28 px-2"
                                  placeholder="Base Price"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </td>

                      {/* Stock */}
                      <td className="px-4 py-2">
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
                                  onChange={(e) => f.onChange(parseInt(e.target.value, 10) || 0)}
                                  className="bg-white border border-[#D9D9D9] text-[#1A1208] text-xs h-8 w-20 px-2"
                                  placeholder="0"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </td>

                      {/* Active toggle */}
                      <td className="px-4 py-2 text-center">
                        <FormField
                          control={form.control}
                          name={`variants.${idx}.is_active`}
                          render={({ field: f }) => (
                            <FormItem>
                              <FormControl>
                                <Switch
                                  checked={f.value}
                                  onCheckedChange={f.onChange}
                                  className="data-[state=checked]:bg-[#01454A]"
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
        </div>
      )}

      {/* SECTION C: Sizing guides and tailored measurements */}
      <div className="rounded-2xl border border-[#ECE6D6] bg-[#FAFAF8] p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-[#ECE6D6] pb-3">
          <div>
            <h3 className="text-md font-bold text-[#1A1208] flex items-center gap-2">
              <Ruler className="w-4 h-4 text-[#01454A]" /> 3. Sizing &amp; Measurement Matrix
            </h3>
            <p className="text-xs text-[#7A6B44] mt-0.5">
              Specify body sizes charts. Made-to-measure orders prompt customers for measurements at checkout.
            </p>
          </div>
          <div className="flex items-center gap-6">
            <FormField
              control={form.control}
              name="requires_measurement"
              render={({ field }) => (
                <FormItem className="flex items-center gap-2 space-y-0 bg-white border border-[#D9D9D9] px-3 py-1.5 rounded-xl">
                  <div className="flex items-center gap-1">
                    <FormLabel className="text-xs font-bold text-[#1A1208] cursor-pointer">Bespoke Fit</FormLabel>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="w-3.5 h-3.5 text-zinc-400 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="bg-black text-white text-xs max-w-xs p-2 rounded-lg">
                        Ensures customers fill in custom body sizes (chest, waist, etc.) before purchasing.
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="data-[state=checked]:bg-[#01454A]"
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="is_customisable"
              render={({ field }) => (
                <FormItem className="flex items-center gap-2 space-y-0 bg-white border border-[#D9D9D9] px-3 py-1.5 rounded-xl">
                  <FormLabel className="text-xs font-bold text-[#1A1208] cursor-pointer">Allow Customisation</FormLabel>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="data-[state=checked]:bg-[#01454A]"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </div>

        {requiresMeasurement && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#7A6B44]">Centimeter Guide Table Override</span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => appendGuideRow({
                  size_label: "",
                  chest_cm: "",
                  waist_cm: "",
                  hip_cm: "",
                  shoulder_cm: "",
                  sleeve_cm: "",
                  length_cm: "",
                  inseam_cm: "",
                  foot_length_cm: "",
                  sort_order: guideFields.length,
                })}
                className="text-[#01454A] border-[#01454A]/30 hover:bg-[#F0F5F5] rounded-lg text-xs"
              >
                <Plus className="w-3.5 h-3.5 mr-1" /> Add Custom Size Row
              </Button>
            </div>

            <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-zinc-200 bg-zinc-50">
                    <th className="text-left text-zinc-500 font-semibold px-3 py-2 whitespace-nowrap">Size Label *</th>
                    <th className="text-left text-zinc-500 font-semibold px-3 py-2 whitespace-nowrap">Chest (cm)</th>
                    <th className="text-left text-zinc-500 font-semibold px-3 py-2 whitespace-nowrap">Waist (cm)</th>
                    <th className="text-left text-zinc-500 font-semibold px-3 py-2 whitespace-nowrap">Hips (cm)</th>
                    <th className="text-left text-zinc-500 font-semibold px-3 py-2 whitespace-nowrap">Shoulder (cm)</th>
                    <th className="text-left text-zinc-500 font-semibold px-3 py-2 whitespace-nowrap">Sleeve (cm)</th>
                    <th className="text-left text-zinc-500 font-semibold px-3 py-2 whitespace-nowrap">Length (cm)</th>
                    <th className="text-center text-zinc-500 font-semibold px-3 py-2 whitespace-nowrap">Remove</th>
                  </tr>
                </thead>
                <tbody>
                  {guideFields.map((field, index) => (
                    <tr key={field.id} className="border-b border-zinc-100 last:border-0 hover:bg-zinc-50/20">
                      {/* Label */}
                      <td className="px-3 py-2">
                        <FormField
                          control={form.control}
                          name={`measurement_guide.${index}.size_label`}
                          render={({ field: f }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  {...f}
                                  className="h-8 w-24 bg-white border border-[#D9D9D9] text-[#1A1208] text-xs px-2"
                                  placeholder="e.g. S, XL"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </td>

                      {/* Chest */}
                      <td className="px-3 py-2">
                        <FormField
                          control={form.control}
                          name={`measurement_guide.${index}.chest_cm`}
                          render={({ field: f }) => (
                            <FormItem>
                              <FormControl>
                                <Input {...f} className="h-8 w-16 bg-white border border-[#D9D9D9] text-xs px-2" placeholder="e.g. 90-95" />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </td>

                      {/* Waist */}
                      <td className="px-3 py-2">
                        <FormField
                          control={form.control}
                          name={`measurement_guide.${index}.waist_cm`}
                          render={({ field: f }) => (
                            <FormItem>
                              <FormControl>
                                <Input {...f} className="h-8 w-16 bg-white border border-[#D9D9D9] text-xs px-2" placeholder="e.g. 75-80" />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </td>

                      {/* Hips */}
                      <td className="px-3 py-2">
                        <FormField
                          control={form.control}
                          name={`measurement_guide.${index}.hip_cm`}
                          render={({ field: f }) => (
                            <FormItem>
                              <FormControl>
                                <Input {...f} className="h-8 w-16 bg-white border border-[#D9D9D9] text-xs px-2" placeholder="e.g. 95-100" />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </td>

                      {/* Shoulder */}
                      <td className="px-3 py-2">
                        <FormField
                          control={form.control}
                          name={`measurement_guide.${index}.shoulder_cm`}
                          render={({ field: f }) => (
                            <FormItem>
                              <FormControl>
                                <Input {...f} className="h-8 w-16 bg-white border border-[#D9D9D9] text-xs px-2" placeholder="e.g. 45" />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </td>

                      {/* Sleeve */}
                      <td className="px-3 py-2">
                        <FormField
                          control={form.control}
                          name={`measurement_guide.${index}.sleeve_cm`}
                          render={({ field: f }) => (
                            <FormItem>
                              <FormControl>
                                <Input {...f} className="h-8 w-16 bg-white border border-[#D9D9D9] text-xs px-2" placeholder="e.g. 60" />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </td>

                      {/* Length */}
                      <td className="px-3 py-2">
                        <FormField
                          control={form.control}
                          name={`measurement_guide.${index}.length_cm`}
                          render={({ field: f }) => (
                            <FormItem>
                              <FormControl>
                                <Input {...f} className="h-8 w-16 bg-white border border-[#D9D9D9] text-xs px-2" placeholder="e.g. 110" />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </td>

                      {/* Remove */}
                      <td className="px-3 py-2 text-center">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeGuideRow(index)}
                          className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
