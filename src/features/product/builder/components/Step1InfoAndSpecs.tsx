"use client";

/**
 * @file Step1InfoAndSpecs.tsx
 * @description Step 1 — Basic Information & Technical Specifications
 * Consolidates title, description, condition, category facets, tags, and technical specifications.
 */

import { useFormContext,  } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { apiAsync } from "@/core/api/client.async";
import type { ProductBuilderFormValues } from "../schemas/builder.schemas";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X, Check, Plus, Trash2, FileText } from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// TYPES & CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

interface SelectOption {
  id: string;
  name: string;
  slug?: string;
}

interface PaginatedOptions {
  results: SelectOption[];
}

// ─────────────────────────────────────────────────────────────────────────────
// API FETCHERS — Ky-based
// ─────────────────────────────────────────────────────────────────────────────

async function fetchCategories(): Promise<SelectOption[]> {
  const data = await apiAsync
    .get("catalog/categories/?page_size=100")
    .json<PaginatedOptions>();
  return data.results ?? [];
}

interface CategoryDetail {
  id: string;
  name: string;
  slug: string;
  children: SelectOption[];
}

async function fetchSubCategories(parentSlug: string): Promise<SelectOption[]> {
  if (!parentSlug) return [];
  const data = await apiAsync
    .get(`catalog/categories/${parentSlug}/detail/`)
    .json<CategoryDetail>();
  return data.children ?? [];
}

async function fetchTags(): Promise<SelectOption[]> {
  const data = await apiAsync
    .get("catalog/tags/?page_size=100")
    .json<PaginatedOptions>();
  return data.results ?? [];
}

// ─────────────────────────────────────────────────────────────────────────────
// SKELETONS
// ─────────────────────────────────────────────────────────────────────────────

function FieldSkeleton({ label }: { label: string }) {
  return (
    <div className="space-y-2">
      <div className="text-zinc-800 font-semibold text-sm">{label}</div>
      <div className="h-10 w-full rounded-lg bg-zinc-100 animate-pulse" />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN STEP 1 COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export function Step1InfoAndSpecs() {
  const form = useFormContext<ProductBuilderFormValues>();

  const selectedCategoryIds = form.watch("category_ids") ?? [];
  const selectedSubCategoryIds = form.watch("sub_category_ids") ?? [];
  const selectedPrimaryCategoryId = selectedCategoryIds[0] ?? "";
  const selectedTagIds = form.watch("tag_ids") ?? [];

  // Specifications field array
  const { fields: specFields, append: appendSpec, remove: removeSpec } = ({
    control: form.control,
    name: "specifications",
  });

  // ── TanStack Query — categories (cached 5 min) ────────────────────────────
  const {
    data: categories = [],
    isLoading: catsLoading,
  } = useQuery({
    queryKey: ["catalog", "categories"],
    queryFn: fetchCategories,
    staleTime: 5 * 60_000,
    gcTime: 10 * 60_000,
  });

  const primaryCategory = categories.find((cat) => cat.id === selectedPrimaryCategoryId);
  const selectedPrimaryCategorySlug = primaryCategory?.slug ?? "";

  // ── TanStack Query — sub-categories (dependent on primary category) ────────
  const {
    data: subCategories = [],
    isLoading: subsLoading,
  } = useQuery({
    queryKey: ["catalog", "subcategories", selectedPrimaryCategorySlug],
    queryFn: () => fetchSubCategories(selectedPrimaryCategorySlug),
    enabled: !!selectedPrimaryCategorySlug,
    staleTime: 5 * 60_000,
    gcTime: 10 * 60_000,
  });

  // ── TanStack Query — tags (cached 5 min) ─────────────────────────────────
  const {
    data: tags = [],
    isLoading: tagsLoading,
  } = useQuery({
    queryKey: ["catalog", "tags"],
    queryFn: fetchTags,
    staleTime: 5 * 60_000,
    gcTime: 10 * 60_000,
  });

  // ── Category helpers ───────────────────────────────────────────────────────
  const toggleCategory = (categoryId: string) => {
    const current = form.getValues("category_ids") ?? [];
    let next: string[];
    if (current.includes(categoryId)) {
      next = current.filter((id) => id !== categoryId);
    } else {
      if (current.length >= 15) return;
      next = [...current, categoryId];
    }
    form.setValue("category_ids", next, { shouldValidate: true });
    
    // Clear subcategories if the primary category changes
    if (next.length === 0 || next[0] !== current[0]) {
      form.setValue("sub_category_ids", [], { shouldValidate: true });
    }
  };

  const toggleSubCategory = (subId: string) => {
    const current = form.getValues("sub_category_ids") ?? [];
    let next: string[];
    if (current.includes(subId)) {
      next = current.filter((id) => id !== subId);
    } else {
      if (current.length >= 15) return;
      next = [...current, subId];
    }
    form.setValue("sub_category_ids", next, { shouldValidate: true });
  };

  // ── Tag helpers ────────────────────────────────────────────────────────────
  
  
  // ── Initial skeleton during first catalog fetch ───────────────────────────
  const initialLoading = catsLoading || tagsLoading;

  if (initialLoading) {
    return (
      <div className="space-y-8 animate-pulse">
        <FieldSkeleton label="Product Title *" />
        <FieldSkeleton label="Full Description *" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <FieldSkeleton label="Condition *" />
        </div>
        <div className="space-y-4">
          <FieldSkeleton label="Categories *" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* SECTION A: Base Details */}
      <div className="rounded-2xl border border-[#ECE6D6] bg-[#FAFAF8] p-6 space-y-6">
        <h3 className="text-md font-bold text-[#1A1208] border-b border-[#ECE6D6] pb-2">
          1. Basic Details
        </h3>

        {/* Title */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[#1A1208] font-semibold text-sm">
                Product Title <span className="text-[#FDA600]">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="e.g. Royal Blue Hand-Embroidered Male Agbada Set (3-piece)"
                  className="bg-white border border-[#D9D9D9] text-[#1A1208] placeholder:text-[#7A6B44]/50 focus:ring-[#01454A] focus:border-[#01454A] rounded-xl px-4 py-3"
                  maxLength={255}
                />
              </FormControl>
              <FormDescription className="text-zinc-500 text-xs">
                {field.value?.length ?? 0} / 255 characters
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[#1A1208] font-semibold text-sm">
                Full Description <span className="text-[#FDA600]">*</span>
              </FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  rows={6}
                  placeholder="Write about the fabrics used, embroidery detailing, care instructions, and accessories included..."
                  className="bg-white border border-[#D9D9D9] text-[#1A1208] placeholder:text-[#7A6B44]/50 focus:ring-[#01454A] focus:border-[#01454A] rounded-xl px-4 py-3"
                />
              </FormControl>
              <FormDescription className="text-zinc-500 text-xs">
                {field.value?.length ?? 0} / 10,000 characters (min 30 characters)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Condition */}
        <FormField
          control={form.control}
          name="condition"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[#1A1208] font-semibold text-sm">
                Condition <span className="text-[#FDA600]">*</span>
              </FormLabel>
              <Select onValueChange={field.onChange} value={field.value ?? "new"}>
                <FormControl>
                  <SelectTrigger className="bg-white border border-[#D9D9D9] text-[#1A1208] focus:ring-2 focus:ring-[#01454A] focus:border-[#01454A] rounded-xl px-4 py-3">
                    <SelectValue placeholder="Select condition" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="bg-white border border-[#D9D9D9] text-[#1A1208] shadow-lg rounded-xl">
                  <SelectItem value="new" className="cursor-pointer">New — brand new item</SelectItem>
                  <SelectItem value="used" className="cursor-pointer">Used — pre-owned item</SelectItem>
                  <SelectItem value="refurbished" className="cursor-pointer">Refurbished — professionally restored</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* SECTION B: Categories & Tags */}
      <div className="rounded-2xl border border-[#ECE6D6] bg-[#FAFAF8] p-6 space-y-6">
        <h3 className="text-md font-bold text-[#1A1208] border-b border-[#ECE6D6] pb-2">
          2. Categories &amp; Tags
        </h3>

        {/* Categories grid */}
        <FormField
          control={form.control}
          name="category_ids"
          render={({ fieldState }) => (
            <FormItem className="space-y-3">
              <FormLabel className="text-[#1A1208] font-semibold text-sm">
                Categories <span className="text-[#FDA600]">*</span>
              </FormLabel>
              <div className={`rounded-xl border p-4 ${
                fieldState.invalid ? "border-destructive bg-destructive/5" : "border-[#D9D9D9] bg-white"
              }`}>
                <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
                  {categories.map((cat) => {
                    const selected = selectedCategoryIds.includes(cat.id);
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => toggleCategory(cat.id)}
                        className={`flex items-center gap-3 rounded-xl border p-4 text-left transition-all ${
                          selected
                            ? "border-[#FDA600] bg-[#FFF6E3] shadow-sm font-semibold"
                            : "border-[#D9D9D9] bg-white hover:border-[#FDA600]/50"
                        }`}
                      >
                        <span className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 transition-all ${
                          selected ? "border-[#FDA600] bg-[#FDA600]" : "border-[#D9D9D9]"
                        }`}>
                          {selected && <Check className="h-3 w-3 text-black" />}
                        </span>
                        <span className="text-sm text-[#1A1208] truncate">{cat.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Subcategories dependent on primary */}
        <FormField
          control={form.control}
          name="sub_category_ids"
          render={() => (
            <FormItem className="space-y-3">
              <FormLabel className="text-[#1A1208] font-semibold text-sm">Sub-Categories</FormLabel>
              <div className="rounded-xl border border-[#D9D9D9] bg-white p-4">
                {!selectedPrimaryCategoryId ? (
                  <div className="rounded-xl border border-dashed border-[#D9D9D9] p-5 text-center bg-white">
                    <p className="text-sm font-semibold text-[#5A6465]">Select a category above first</p>
                  </div>
                ) : subsLoading ? (
                  <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-14 rounded-xl bg-zinc-100 animate-pulse" />
                    ))}
                  </div>
                ) : subCategories.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-[#D9D9D9] p-5 text-center bg-white">
                    <p className="text-sm font-semibold text-[#5A6465]">No sub-categories available</p>
                  </div>
                ) : (
                  <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
                    {subCategories.map((sub) => {
                      const selected = selectedSubCategoryIds.includes(sub.id);
                      return (
                        <button
                          key={sub.id}
                          type="button"
                          onClick={() => toggleSubCategory(sub.id)}
                          className={`flex items-center gap-3 rounded-xl border p-4 text-left transition-all ${
                            selected
                              ? "border-[#FDA600] bg-[#FFF6E3] shadow-sm font-semibold"
                              : "border-[#D9D9D9] bg-white hover:border-[#FDA600]/50"
                          }`}
                        >
                          <span className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 transition-all ${
                            selected ? "border-[#FDA600] bg-[#FDA600]" : "border-[#D9D9D9]"
                          }`}>
                            {selected && <Check className="h-3 w-3 text-black" />}
                          </span>
                          <span className="text-sm text-[#1A1208] truncate">{sub.name}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        </div>
    </div>
  );
}
