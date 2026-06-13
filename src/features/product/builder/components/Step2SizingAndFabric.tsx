"use client";

/**
 * @file Step2SizingAndFabric.tsx
 * @description Step 2 — Sizes, Colours, Sizing Guides (Measurement Profiles/Templates), and Fabric Details
 */

import * as React from "react";
import { useFormContext, useFieldArray } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { apiAsync } from "@/core/api/client.async";
import { fetchVendorMeasurementTemplates } from "../api/product.api";
import type { ProductBuilderFormValues, MeasurementGuideRow } from "../schemas/builder.schemas";

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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  Loader2,
  Check,
  Palette,
  Ruler,
  InfoIcon,
  Shirt,
  Plus,
  Trash2,
  ListFilter,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// TYPES & CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

interface SizeOption { id: string; name: string; }
interface ColorOption { id: string; name: string; hex_code: string; }
interface PaginatedEnvelope<T> { results?: T[]; }

const CARE_INSTRUCTIONS = [
  { value: "machine_wash", label: "Machine Wash" },
  { value: "hand_wash", label: "Hand Wash Only" },
  { value: "dry_clean", label: "Dry Clean Only" },
  { value: "do_not_wash", label: "Do Not Wash" },
  { value: "cold_wash", label: "Cold Wash Only" },
  { value: "tumble_dry", label: "Tumble Dry" },
  { value: "air_dry", label: "Air Dry" },
];

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export function Step2SizingAndFabric() {
  const form = useFormContext<ProductBuilderFormValues>();

  const selectedSizes = form.watch("size_ids") ?? [];
  const selectedColors = form.watch("color_ids") ?? [];
  const requiresMeasurement = form.watch("requires_measurement") ?? false;
  const isCustomisable = form.watch("is_customisable") ?? false;
  const measurementTemplate = form.watch("measurement_template");
  const measurementGuide = form.watch("measurement_guide") ?? [];

  // Fabric Watchers
  const fabricType = form.watch("fabric_type");
  const fabricComposition = form.watch("fabric_composition") ?? [];

  // Master Data Query
  const { data: masterData, isLoading: masterLoading } = useQuery({
    queryKey: ["product-builder", "sizes-colors-templates"],
    queryFn: async () => {
      const [sizesData, colorsData, templatesData] = await Promise.all([
        apiAsync.get("product/sizes/?page_size=100").json<PaginatedEnvelope<SizeOption>>(),
        apiAsync.get("product/colors/?page_size=100").json<PaginatedEnvelope<ColorOption>>(),
        fetchVendorMeasurementTemplates().catch(() => []), // Silently fallback to empty array if fails
      ]);

      return {
        sizes: sizesData.results ?? [],
        colors: colorsData.results ?? [],
        templates: templatesData ?? [],
      };
    },
    staleTime: 5 * 60_000,
    gcTime: 10 * 60_000,
  });

  const sizes = masterData?.sizes ?? [];
  const colors = masterData?.colors ?? [];
  const templates = masterData?.templates ?? [];

  // Fabric Composition field array
  const { fields: compositionFields, append: appendComposition, remove: removeComposition } = useFieldArray({
    control: form.control,
    name: "fabric_composition",
  });

  // Toggle selection helpers
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

  // Sync measurement guide rows with selected sizes
  React.useEffect(() => {
    if (sizes.length === 0) return;

    const currentRows = [...measurementGuide];
    let updatedRows = currentRows.filter((row) => !row.size_id || selectedSizes.includes(row.size_id));

    selectedSizes.forEach((sizeId) => {
      const exists = updatedRows.some((row) => row.size_id === sizeId);
      if (!exists) {
        const sizeObj = sizes.find((s) => s.id === sizeId);
        updatedRows.push({
          size_id: sizeId,
          size_label: sizeObj?.name || "Unknown",
          chest_cm: "",
          waist_cm: "",
          hip_cm: "",
          shoulder_cm: "",
          sleeve_cm: "",
          length_cm: "",
          inseam_cm: "",
          foot_length_cm: "",
          sort_order: 0,
        });
      }
    });

    if (JSON.stringify(updatedRows) !== JSON.stringify(measurementGuide)) {
      form.setValue("measurement_guide", updatedRows, { shouldValidate: true });
    }
  }, [selectedSizes, sizes, form]);

  // Sync templates selection
  const handleTemplateChange = (templateId: string) => {
    if (templateId === "custom") {
      form.setValue("measurement_template", null);
      return;
    }

    form.setValue("measurement_template", templateId);
    const selectedTemplate = templates.find((t) => t.id === templateId);
    if (selectedTemplate) {
      const rows = selectedTemplate.template_rows.map((row) => ({
        size_id: row.size_id || null,
        size_label: row.size_label,
        chest_cm: row.chest_cm || "",
        waist_cm: row.waist_cm || "",
        hip_cm: row.hip_cm || "",
        shoulder_cm: row.shoulder_cm || "",
        sleeve_cm: row.sleeve_cm || "",
        length_cm: row.length_cm || "",
        inseam_cm: row.inseam_cm || "",
        foot_length_cm: row.foot_length_cm || "",
        sort_order: row.sort_order || 0,
      }));

      // Update selected sizes based on the template sizes
      const templateSizeIds = selectedTemplate.template_rows
        .map((row) => row.size_id)
        .filter((id): id is string => !!id);
      
      form.setValue("size_ids", templateSizeIds);
      form.setValue("measurement_guide", rows, { shouldValidate: true });
    }
  };

  const compositionSum = React.useMemo(() => {
    return fabricComposition.reduce((sum, item) => sum + (Number(item?.percentage) || 0), 0);
  }, [fabricComposition]);

  if (masterLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-[#01454A]" />
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* ── SECTION 1: Sizes & Colours ── */}
      <div className="rounded-2xl border border-[#ECE6D6] bg-[#FAFAF8] p-6 space-y-6">
        <h3 className="text-md font-bold text-[#1A1208] border-b border-[#ECE6D6] pb-2 flex items-center gap-2">
          <Palette className="w-5 h-5 text-[#01454A]" />
          1. Sizes &amp; Colours options
        </h3>

        {/* Sizes */}
        <FormField
          control={form.control}
          name="size_ids"
          render={() => (
            <FormItem className="space-y-3">
              <FormLabel className="text-[#1A1208] font-semibold text-sm">Sizes</FormLabel>
              <FormDescription className="text-zinc-500 text-xs">
                Select all standard sizes you stock.
              </FormDescription>

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
                        selected
                          ? "bg-[#E6F4F5] border-[#01454A] text-[#01454A] font-semibold"
                          : "bg-white border-[#D9D9D9] text-[#5A6465] hover:border-[#FDA600]/50 hover:text-[#1A1208]",
                      )}
                    >
                      {selected && (
                        <Check className="absolute top-1 right-1 w-3 h-3 text-[#01454A]" />
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

        {/* Colours */}
        <FormField
          control={form.control}
          name="color_ids"
          render={() => (
            <FormItem className="space-y-3">
              <FormLabel className="text-[#1A1208] font-semibold text-sm">Colours</FormLabel>
              <FormDescription className="text-zinc-500 text-xs">
                Select all colour options you offer.
              </FormDescription>

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
                        selected
                          ? "border-[#FDA600] bg-[#FFF6E3] shadow-sm"
                          : "border-[#D9D9D9] hover:border-zinc-300",
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
      </div>

      {/* ── SECTION 2: Fabric & Care ── */}
      <div className="rounded-2xl border border-[#ECE6D6] bg-[#FAFAF8] p-6 space-y-6">
        <h3 className="text-md font-bold text-[#1A1208] border-b border-[#ECE6D6] pb-2 flex items-center gap-2">
          <Shirt className="w-5 h-5 text-[#01454A]" />
          2. Fabric &amp; Care Details
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="fabric_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[#1A1208] font-semibold text-sm">Fabric Type</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="e.g. Brocade, Cashmere, Senegalese Cotton, Silk Satin"
                    className="bg-white border border-[#D9D9D9] text-[#1A1208] placeholder:text-[#7A6B44]/50 focus:ring-[#01454A] focus:border-[#01454A] rounded-xl px-4 py-3"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="fabric_country_of_origin"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[#1A1208] font-semibold text-sm">Country of Origin</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="e.g. Nigeria, Senegal, Italy"
                    className="bg-white border border-[#D9D9D9] text-[#1A1208] placeholder:text-[#7A6B44]/50 focus:ring-[#01454A] focus:border-[#01454A] rounded-xl px-4 py-3"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Fabric Composition Array */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <FormLabel className="text-[#1A1208] font-semibold text-sm">Material Composition (%)</FormLabel>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => appendComposition({ material: "", percentage: 0 })}
              className="text-[#01454A] border-[#01454A]/30 hover:bg-[#F0F5F5] rounded-lg text-xs"
            >
              <Plus className="w-3.5 h-3.5 mr-1" /> Add Material
            </Button>
          </div>

          <div className="space-y-3 bg-white p-4 border border-[#ECE6D6] rounded-xl shadow-sm">
            {compositionFields.length === 0 && (
              <p className="text-xs text-[#7A6B44] text-center py-2">No material composition added yet.</p>
            )}
            {compositionFields.map((field, index) => (
              <div key={field.id} className="flex gap-4 items-center">
                <FormField
                  control={form.control}
                  name={`fabric_composition.${index}.material`}
                  render={({ field: matField }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input
                          {...matField}
                          placeholder="e.g. Cotton, Wool, Silk"
                          className="bg-white border border-[#D9D9D9] text-[#1A1208] rounded-xl"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`fabric_composition.${index}.percentage`}
                  render={({ field: pctField }) => (
                    <FormItem className="w-32">
                      <FormControl>
                        <div className="relative">
                          <Input
                            {...pctField}
                            type="number"
                            min="0"
                            max="100"
                            placeholder="100"
                            onChange={(e) => pctField.onChange(parseInt(e.target.value, 10) || 0)}
                            className="bg-white border border-[#D9D9D9] text-[#1A1208] rounded-xl pr-8"
                          />
                          <span className="absolute right-3 top-3 text-xs text-zinc-400">%</span>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeComposition(index)}
                  className="text-red-500 hover:bg-red-50 hover:text-red-600 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}

            {compositionFields.length > 0 && (
              <div className="flex justify-between items-center text-xs mt-2 border-t pt-2 border-dashed">
                <span className="text-[#7A6B44]">Sum: {compositionSum}%</span>
                {compositionSum !== 100 && (
                  <span className="text-amber-600 font-semibold">Percentages must sum up to 100%</span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Care instructions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="fabric_care_instructions"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[#1A1208] font-semibold text-sm">Care Instructions</FormLabel>
                <Select onValueChange={field.onChange} value={field.value ?? "machine_wash"}>
                  <FormControl>
                    <SelectTrigger className="bg-white border border-[#D9D9D9] text-[#1A1208] focus:ring-[#01454A] focus:border-[#01454A] rounded-xl px-4 py-3">
                      <SelectValue placeholder="Care instructions" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-white border border-[#D9D9D9] text-[#1A1208] shadow-lg">
                    {CARE_INSTRUCTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4 items-end">
            <FormField
              control={form.control}
              name="fabric_is_organic"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-xl bg-white border border-[#D9D9D9] px-4 py-3 h-[50px]">
                  <FormLabel className="text-[#1A1208] font-semibold text-xs cursor-pointer">Organic</FormLabel>
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
              name="fabric_is_vegan"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-xl bg-white border border-[#D9D9D9] px-4 py-3 h-[50px]">
                  <FormLabel className="text-[#1A1208] font-semibold text-xs cursor-pointer">Vegan Friendly</FormLabel>
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

        {/* Care Notes */}
        <FormField
          control={form.control}
          name="fabric_care_notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[#1A1208] font-semibold text-sm">Special Care Notes</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="e.g. Iron inside out, avoid direct sunlight when drying, or steam iron only..."
                  className="bg-white border border-[#D9D9D9] text-[#1A1208] placeholder:text-[#7A6B44]/50 focus:ring-[#01454A] focus:border-[#01454A] rounded-xl px-4 py-3"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* ── SECTION 3: Sizing & Measurement Guides ── */}
      <div className="rounded-2xl border border-[#ECE6D6] bg-[#FAFAF8] p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-[#ECE6D6] pb-3">
          <div>
            <h3 className="text-md font-bold text-[#1A1208] flex items-center gap-2">
              <Ruler className="w-5 h-5 text-[#01454A]" />
              3. Sizing &amp; Measurement Guide
            </h3>
            <p className="text-xs text-[#7A6B44] mt-0.5">
              Enable this to specify body measurements for selected sizes, or use a pre-saved sizing template.
            </p>
          </div>
          <FormField
            control={form.control}
            name="requires_measurement"
            render={({ field }) => (
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  className="data-[state=checked]:bg-[#01454A]"
                />
              </FormControl>
            )}
          />
        </div>

        {requiresMeasurement && (
          <div className="space-y-6 animate-step-enter">
            {/* Customisable flag */}
            <FormField
              control={form.control}
              name="is_customisable"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-xl bg-white border border-[#D9D9D9] p-4">
                  <div className="space-y-0.5 pr-2">
                    <FormLabel className="text-[#1A1208] font-semibold text-sm cursor-pointer">
                      Allow Custom Sizing Request
                    </FormLabel>
                    <FormDescription className="text-zinc-500 text-xs">
                      If checked, customers can submit their custom measurements during checkout.
                    </FormDescription>
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

            {/* Template Selection */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="measurement_template"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#1A1208] font-semibold text-sm">
                      Sizing Template Profile
                    </FormLabel>
                    <FormDescription className="text-zinc-500 text-xs">
                      Choose a pre-saved measurement template profile to automatically fill the sizing chart.
                    </FormDescription>
                    <Select
                      onValueChange={handleTemplateChange}
                      value={field.value || "custom"}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-white border border-[#D9D9D9] text-[#1A1208] focus:ring-[#01454A] focus:border-[#01454A] rounded-xl px-4 py-3">
                          <SelectValue placeholder="Custom / Manual Sizing Chart" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-white border border-[#D9D9D9] text-[#1A1208] shadow-lg">
                        <SelectItem value="custom">Manual / Custom Guide Chart</SelectItem>
                        {templates.map((t) => (
                          <SelectItem key={t.id} value={t.id}>
                            {t.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Measurement Input Chart Table */}
            {selectedSizes.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[#D9D9D9] py-8 text-center bg-white">
                <p className="text-[#7A6B44] text-sm font-semibold">
                  Please select one or more Sizes above to build the measurement guide chart.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <FormLabel className="text-[#1A1208] font-semibold text-sm">
                  Sizing Guide Matrix (Dimensions in cm)
                </FormLabel>
                
                <div className="overflow-x-auto rounded-xl border border-[#D9D9D9] bg-white shadow-sm">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-zinc-50 border-b border-[#ECE6D6] text-zinc-600 font-bold uppercase tracking-wider">
                        <th className="p-3 border-r border-[#ECE6D6] w-24">Size</th>
                        <th className="p-3 border-r border-[#ECE6D6]">Chest (cm)</th>
                        <th className="p-3 border-r border-[#ECE6D6]">Waist (cm)</th>
                        <th className="p-3 border-r border-[#ECE6D6]">Hips (cm)</th>
                        <th className="p-3 border-r border-[#ECE6D6]">Shoulders (cm)</th>
                        <th className="p-3 border-r border-[#ECE6D6]">Sleeves (cm)</th>
                        <th className="p-3">Length (cm)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {measurementGuide.map((row, idx) => (
                        <tr key={row.size_id || idx} className="border-b border-[#ECE6D6] hover:bg-zinc-50/50">
                          <td className="p-3 border-r border-[#ECE6D6] bg-zinc-50/55 font-bold text-[#1A1208]">
                            {row.size_label}
                          </td>
                          <td className="p-2 border-r border-[#ECE6D6]">
                            <Input
                              type="text"
                              value={form.watch(`measurement_guide.${idx}.chest_cm`) || ""}
                              onChange={(e) => form.setValue(`measurement_guide.${idx}.chest_cm`, e.target.value)}
                              placeholder="e.g. 92-96"
                              className="h-8 text-xs border-[#D9D9D9] rounded-lg px-2"
                            />
                          </td>
                          <td className="p-2 border-r border-[#ECE6D6]">
                            <Input
                              type="text"
                              value={form.watch(`measurement_guide.${idx}.waist_cm`) || ""}
                              onChange={(e) => form.setValue(`measurement_guide.${idx}.waist_cm`, e.target.value)}
                              placeholder="e.g. 76-80"
                              className="h-8 text-xs border-[#D9D9D9] rounded-lg px-2"
                            />
                          </td>
                          <td className="p-2 border-r border-[#ECE6D6]">
                            <Input
                              type="text"
                              value={form.watch(`measurement_guide.${idx}.hip_cm`) || ""}
                              onChange={(e) => form.setValue(`measurement_guide.${idx}.hip_cm`, e.target.value)}
                              placeholder="e.g. 98-102"
                              className="h-8 text-xs border-[#D9D9D9] rounded-lg px-2"
                            />
                          </td>
                          <td className="p-2 border-r border-[#ECE6D6]">
                            <Input
                              type="text"
                              value={form.watch(`measurement_guide.${idx}.shoulder_cm`) || ""}
                              onChange={(e) => form.setValue(`measurement_guide.${idx}.shoulder_cm`, e.target.value)}
                              placeholder="e.g. 42"
                              className="h-8 text-xs border-[#D9D9D9] rounded-lg px-2"
                            />
                          </td>
                          <td className="p-2 border-r border-[#ECE6D6]">
                            <Input
                              type="text"
                              value={form.watch(`measurement_guide.${idx}.sleeve_cm`) || ""}
                              onChange={(e) => form.setValue(`measurement_guide.${idx}.sleeve_cm`, e.target.value)}
                              placeholder="e.g. 62"
                              className="h-8 text-xs border-[#D9D9D9] rounded-lg px-2"
                            />
                          </td>
                          <td className="p-2">
                            <Input
                              type="text"
                              value={form.watch(`measurement_guide.${idx}.length_cm`) || ""}
                              onChange={(e) => form.setValue(`measurement_guide.${idx}.length_cm`, e.target.value)}
                              placeholder="e.g. 75"
                              className="h-8 text-xs border-[#D9D9D9] rounded-lg px-2"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
