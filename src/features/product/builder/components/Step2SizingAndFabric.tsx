"use client";

/**
 * @file Step2SizingAndFabric.tsx
 * @description Step 2 — Sizes, Colors, Sizing Templates, Measurements Matrix & Fabric Details
 */

import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useFormContext, useFieldArray } from "react-hook-form";
import { apiAsync } from "@/core/api/client.async";
import { fetchVendorMeasurementTemplates, createVendorMeasurementTemplate } from "../../api/product.api";
import { toast } from "sonner";
import type { ProductBuilderFormValues } from "../schemas/builder.schemas";
import { MultiColorSwatchPicker, type SelectedColor } from "./ColorSwatchPicker";

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
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Check, Loader2, Ruler, Trash2, Plus, Info, Palette, Scissors, Sparkles } from "lucide-react";

interface CatalogItem { id: string; name: string; }
interface PaginatedEnvelope<T> { results?: T[]; }

const CARE_INSTRUCTIONS = [
  { value: "machine_wash", label: "Machine Wash" },
  { value: "hand_wash", label: "Hand Wash Only" },
  { value: "dry_clean", label: "Dry Clean Only" },
  { value: "do_not_wash", label: "Do Not Wash" },
  { value: "cold_wash", label: "Cold Wash" },
  { value: "tumble_dry", label: "Tumble Dry" },
  { value: "air_dry", label: "Air Dry" },
];

export function Step2SizingAndFabric() {
  const form = useFormContext<ProductBuilderFormValues>();
  const queryClient = useQueryClient();
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);

  const selectedSizes = form.watch("size_ids") ?? [];
  // Colors are now stored as direct objects, not UUIDs
  const selectedColors: SelectedColor[] = (form.watch("selected_colors") as any) ?? [];
  const requiresMeasurement = form.watch("requires_measurement");
  const selectedTemplateId = form.watch("measurement_template");

  // Fabric watch
  const fabricType = form.watch("fabric_type");
  const fabricComposition = form.watch("fabric_composition") ?? [];

  // Field arrays for fabric composition & measurement guides
  const { fields: compositionFields, append: appendComposition, remove: removeComposition } = useFieldArray({
    control: form.control,
    name: "fabric_composition",
  });

  const { fields: guideFields, append: appendGuideRow, remove: removeGuideRow, replace: replaceGuideRows } = useFieldArray({
    control: form.control,
    name: "measurement_guide",
  });

  // Fetch catalog metadata for sizes ONLY (colors are now pre-built client-side)
  const { data: catalogData, isLoading: catalogLoading } = useQuery({
    queryKey: ["product-builder", "sizes-catalog"],
    queryFn: async () => {
      const sizesData = await apiAsync.get("product/sizes/?page_size=100").json<PaginatedEnvelope<CatalogItem>>();
      return {
        sizes: sizesData.results ?? [],
        sizeMap: Object.fromEntries((sizesData.results ?? []).map((s) => [s.id, s])),
      };
    },
    staleTime: 5 * 60_000,
    gcTime: 10 * 60_000,
  });

  const sizes = catalogData?.sizes ?? [];
  const sizeMap = catalogData?.sizeMap ?? {};

  // Fetch measurement templates for dropdown
  const { data: templates = [], isLoading: templatesLoading } = useQuery({
    queryKey: ["product-builder", "vendor-measurement-templates"],
    queryFn: fetchVendorMeasurementTemplates,
    staleTime: 5 * 60_000,
  });

  const toggleSize = (id: string) => {
    const current = form.getValues("size_ids") ?? [];
    const updated = current.includes(id)
      ? current.filter((s) => s !== id)
      : [...current, id];
    form.setValue("size_ids", updated, { shouldValidate: true });
  };

  const handleColorsChange = (colors: SelectedColor[]) => {
    form.setValue("selected_colors" as any, colors, { shouldValidate: true });
  };

  // ── Sizing guide rows auto-population sync ─────────────────────────────────
  useEffect(() => {
    if (!requiresMeasurement) return;
    
    // If a template is currently selected, let it govern the table.
    if (selectedTemplateId) return;

    const current = form.getValues("measurement_guide") ?? [];
    const newRows: any[] = [];

    // Pre-populate rows matching checked sizes
    selectedSizes.forEach((sId, index) => {
      const sizeObj = sizeMap[sId];
      if (!sizeObj) return;

      const existing = current.find((r) => r.size_id === sId || r.size_label === sizeObj.name);
      newRows.push({
        size_id: sId,
        size_label: sizeObj.name as any,
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
  }, [selectedSizes.join(","), requiresMeasurement, sizeMap, selectedTemplateId]);

  const handleSaveTemplate = async () => {
    const templateName = window.prompt("Enter template name (e.g. Kaftan Senator Slim):");
    if (!templateName || !templateName.trim()) {
      return;
    }
    setIsSavingTemplate(true);
    try {
      const guideRows = form.getValues("measurement_guide") ?? [];
      const payload = {
        name: templateName.trim(),
        description: "clothing",
        template_rows: guideRows.map((row) => ({
          size_label: row.size_label,
          chest_cm: row.chest_cm || "",
          waist_cm: row.waist_cm || "",
          hip_cm: row.hip_cm || "",
          length_cm: row.length_cm || "",
          shoulder_cm: row.shoulder_cm || "",
          sleeve_cm: row.sleeve_cm || "",
          inseam_cm: row.inseam_cm || "",
          foot_length_cm: row.foot_length_cm || "",
          sort_order: row.sort_order || 0,
        })),
      };

      const newTemplate = await createVendorMeasurementTemplate(payload);
      toast.success("Sizing template saved successfully!");

      await queryClient.invalidateQueries({
        queryKey: ["product-builder", "vendor-measurement-templates"],
      });

      form.setValue("measurement_template", newTemplate.id, { shouldValidate: true });
    } catch (err: any) {
      toast.error(err?.message || "Failed to save template");
    } finally {
      setIsSavingTemplate(false);
    }
  };

  const handleTemplateChange = (templateId: string) => {
    if (templateId === "none") {
      form.setValue("measurement_template", null, { shouldValidate: true });
      return;
    }
    const template = templates.find((t) => t.id === templateId);
    if (template) {
      form.setValue("measurement_template", templateId, { shouldValidate: true });
      
      // Copy rows from template to form guide rows
      const guideRows = template.template_rows.map((row) => ({
        size_id: row.size_id ?? null,
        size_label: row.size_label as any,
        chest_cm: row.chest_cm || "",
        waist_cm: row.waist_cm || "",
        hip_cm: row.hip_cm || "",
        length_cm: row.length_cm || "",
        shoulder_cm: row.shoulder_cm || "",
        sleeve_cm: row.sleeve_cm || "",
        inseam_cm: row.inseam_cm || "",
        foot_length_cm: row.foot_length_cm || "",
        sort_order: row.sort_order || 0,
      }));
      
      replaceGuideRows(guideRows);
    }
  };

  const compositionSum = useMemo(() => {
    return fabricComposition.reduce((sum, item) => sum + (Number(item?.percentage) || 0), 0);
  }, [fabricComposition]);

  const [hasFabric, setHasFabric] = useState(!!fabricType || fabricComposition.length > 0);

  const toggleFabricForm = (checked: boolean) => {
    setHasFabric(checked);
    if (checked) {
      form.setValue("fabric_type", "");
      form.setValue("fabric_composition", [{ material: "", percentage: 100 }], { shouldValidate: true });
      form.setValue("fabric_care_instructions", "machine_wash");
      form.setValue("fabric_care_notes", "");
      form.setValue("fabric_is_organic", false);
      form.setValue("fabric_is_vegan", false);
      form.setValue("fabric_country_of_origin", "");
    } else {
      form.setValue("fabric_type", "");
      form.setValue("fabric_composition", []);
      form.setValue("fabric_care_instructions", "machine_wash");
      form.setValue("fabric_care_notes", "");
      form.setValue("fabric_is_organic", false);
      form.setValue("fabric_is_vegan", false);
      form.setValue("fabric_country_of_origin", "");
    }
  };

  if (catalogLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-[#01454A]" />
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* SECTION A: Sizes & Colors Catalog */}
      <div className="rounded-2xl border border-[#ECE6D6] bg-[#FAFAF8] p-6 space-y-6">
        <h3 className="text-md font-bold text-[#1A1208] border-b border-[#ECE6D6] pb-2 flex items-center gap-2">
          <Palette className="w-5 h-5 text-[#01454A]" />
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

        {/* Colors — MultiColorSwatchPicker */}
        <div className="space-y-2">
          <FormLabel className="text-[#1A1208] font-semibold text-sm">Select Colours</FormLabel>
          <FormDescription className="text-xs text-zinc-500">
            Choose the colour options available for this product. Colours are pre-built — no external API needed.
          </FormDescription>
          <div className="pt-2">
            <MultiColorSwatchPicker
              selectedColors={selectedColors}
              onChange={handleColorsChange}
              maxColors={20}
              placeholder="Search and add colour variants…"
            />
          </div>
        </div>
      </div>

      {/* SECTION B: Sizing Guides & Sizing template overrides */}
      <div className="rounded-2xl border border-[#ECE6D6] bg-[#FAFAF8] p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-[#ECE6D6] pb-3">
          <div>
            <h3 className="text-md font-bold text-[#1A1208] flex items-center gap-2">
              <Ruler className="w-5 h-5 text-[#01454A]" />
              2. Sizing &amp; Measurement Guide
            </h3>
            <p className="text-xs text-[#7A6B44] mt-0.5">
              Input body size specifications in centimeters to guide buyers.
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
                        Enforces customer measurements checkout form.
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
          <div className="space-y-6">
            {/* Reusable template selector */}
            <div className="bg-white p-4 border border-[#ECE6D6] rounded-xl space-y-3">
              <FormLabel className="text-[#1A1208] font-semibold text-xs flex items-center gap-1.5">
                <Scissors className="w-3.5 h-3.5 text-[#01454A]" /> Reuse Sizing Template (Avoid fatigue)
              </FormLabel>
              {templatesLoading ? (
                <Loader2 className="w-4 h-4 animate-spin text-[#01454A]" />
              ) : (
                <Select
                  onValueChange={handleTemplateChange}
                  value={selectedTemplateId || "none"}
                >
                  <SelectTrigger className="bg-white border border-[#D9D9D9] text-[#1A1208] text-xs max-w-sm rounded-xl">
                    <SelectValue placeholder="Select a saved template…" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-[#D9D9D9] text-[#1A1208] shadow-lg rounded-xl">
                    <SelectItem value="none">No template (Manual Sizes)</SelectItem>
                    {templates.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name} ({t.template_rows.length} sizes)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {!selectedTemplateId || selectedTemplateId === "none" ? (
                <div className="pt-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={guideFields.length === 0 || isSavingTemplate}
                    onClick={handleSaveTemplate}
                    className="w-full sm:w-auto bg-[#01454A] text-white hover:bg-[#01454A]/90 border-0 rounded-lg text-xs"
                  >
                    {isSavingTemplate ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                        Saving Sizing Template...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                        Save Current Sizing Guide as Reusable Template
                      </>
                    )}
                  </Button>
                </div>
              ) : null}
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#7A6B44]">Centimeter Guide Table Override</span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => appendGuideRow({
                    size_label: "Custom",
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
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-200 bg-zinc-50 font-bold uppercase tracking-wider text-zinc-500">
                      <th className="px-3 py-3 whitespace-nowrap">Size Label *</th>
                      <th className="px-3 py-3 whitespace-nowrap">Chest (cm)</th>
                      <th className="px-3 py-3 whitespace-nowrap">Waist (cm)</th>
                      <th className="px-3 py-3 whitespace-nowrap">Hips (cm)</th>
                      <th className="px-3 py-3 whitespace-nowrap">Shoulder (cm)</th>
                      <th className="px-3 py-3 whitespace-nowrap">Sleeve (cm)</th>
                      <th className="px-3 py-3 whitespace-nowrap">Length (cm)</th>
                      <th className="px-3 py-3 text-center whitespace-nowrap">Remove</th>
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
                                  <select
                                    value={f.value}
                                    onChange={f.onChange}
                                    className="h-8 w-24 bg-white border border-[#D9D9D9] rounded-md text-[#1A1208] text-xs px-2 focus:outline-none focus:ring-1 focus:ring-[#01454A]"
                                  >
                                    {["XS", "S", "M", "L", "XL", "XXL", "Custom"].map((opt) => (
                                      <option key={opt} value={opt}>
                                        {opt}
                                      </option>
                                    ))}
                                  </select>
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
          </div>
        )}
      </div>

      {/* SECTION C: Fabric details */}
      <div className="rounded-2xl border border-[#ECE6D6] bg-[#FAFAF8] p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-[#ECE6D6] pb-3">
          <div>
            <h3 className="text-md font-bold text-[#1A1208] flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#01454A]" />
              3. Fabric &amp; Material Properties
            </h3>
            <p className="text-xs text-[#7A6B44] mt-0.5">
              Provide specific material detail to describe premium tactile feel.
            </p>
          </div>
          <Switch
            checked={hasFabric}
            onCheckedChange={toggleFabricForm}
            className="data-[state=checked]:bg-[#01454A]"
          />
        </div>

        {hasFabric && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="fabric_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#1A1208] font-semibold text-sm">Fabric Type *</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="e.g. Cashmere, Senegalese Cotton, Silk Satin"
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
                        value={field.value ?? ""}
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

              <div className="space-y-3 bg-white p-4 border border-[#ECE6D6] rounded-xl">
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

                    {compositionFields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeComposition(index)}
                        className="text-red-500 hover:bg-red-50 hover:text-red-600 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}

                <div className="flex justify-between items-center text-xs mt-2 border-t pt-2 border-dashed">
                  <span className="text-[#7A6B44]">Sum: {compositionSum}%</span>
                  {compositionSum !== 100 && (
                    <span className="text-amber-600 font-semibold">Composition percentages should sum to 100%</span>
                  )}
                </div>
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
                      <SelectContent className="bg-white border border-[#D9D9D9] text-[#1A1208] shadow-lg rounded-xl">
                        {CARE_INSTRUCTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value} className="cursor-pointer">
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4 items-center">
                <FormField
                  control={form.control}
                  name="fabric_is_organic"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-xl bg-white border border-[#D9D9D9] px-4 py-2 mt-6">
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
                    <FormItem className="flex items-center justify-between rounded-xl bg-white border border-[#D9D9D9] px-4 py-2 mt-6">
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
                      value={field.value ?? ""}
                      placeholder="e.g. Iron inside out, avoid direct sunlight when drying, or steam iron only..."
                      className="bg-white border border-[#D9D9D9] text-[#1A1208] placeholder:text-[#7A6B44]/50 focus:ring-[#01454A] focus:border-[#01454A] rounded-xl px-4 py-3"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}
      </div>
    </div>
  );
}
