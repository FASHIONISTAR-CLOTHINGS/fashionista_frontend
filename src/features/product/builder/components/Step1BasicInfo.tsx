"use client";

/**
 * @file Step1BasicInfo.tsx
 * @description Step 1 — Basic Information
 *
 * Fields: title, description, short_description, condition,
 *         category_ids, sub_category_ids, tag_ids
 *
 * Data fetching:
 *  - ALL catalog data uses TanStack Query + apiAsync (Ky) — zero raw fetch() calls.
 *  - Sub-categories use a dependent query keyed on the first selected category.
 *  - All queries cache for 5 minutes — vendors never see a spinner on revisit.
 */

import { useFormContext } from "react-hook-form";
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
import { X, Check } from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
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
// API FETCHERS — Ky-based, goes through the shared apiAsync client
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
// SKELETON — shown during initial catalog load
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
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export function Step1BasicInfo() {
  const form = useFormContext<ProductBuilderFormValues>();

  const selectedCategoryIds = form.watch("category_ids") ?? [];
  const selectedSubCategoryIds = form.watch("sub_category_ids") ?? [];
  const selectedPrimaryCategoryId = selectedCategoryIds[0] ?? "";
  const selectedTagIds = form.watch("tag_ids") ?? [];

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
  const addTag = (tagId: string) => {
    const current = form.getValues("tag_ids") ?? [];
    if (!current.includes(tagId) && current.length < 10) {
      form.setValue("tag_ids", [...current, tagId], { shouldValidate: true });
    }
  };

  const removeTag = (tagId: string) => {
    const current = form.getValues("tag_ids") ?? [];
    form.setValue(
      "tag_ids",
      current.filter((id) => id !== tagId),
      { shouldValidate: true },
    );
  };

  // ── Initial skeleton during first catalog fetch ───────────────────────────
  const initialLoading = catsLoading || tagsLoading;

  if (initialLoading) {
    return (
      <div className="space-y-8 animate-pulse">
        <FieldSkeleton label="Product Title *" />
        <FieldSkeleton label="Full Description *" />
        <FieldSkeleton label="Condition *" />
        <div className="space-y-4">
          <FieldSkeleton label="Categories *" />
          <FieldSkeleton label="Sub-Category" />
        </div>
        <FieldSkeleton label="Tags" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* ── Title ── */}
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
                placeholder="e.g. Premium Hand-Stitched Agbada Set"
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

      {/* ── Description ── */}
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
                placeholder="Detailed product description — fabric, craftsmanship, sizing, care instructions…"
                className="bg-white border border-[#D9D9D9] text-[#1A1208] placeholder:text-[#7A6B44]/50 focus:ring-[#01454A] focus:border-[#01454A] rounded-xl px-4 py-3"
              />
            </FormControl>
            <FormDescription className="text-zinc-500 text-xs">
              {field.value?.length ?? 0} / 10,000 characters
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* ── Condition ── */}
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
                <SelectTrigger className="bg-white border border-[#D9D9D9] text-[#1A1208] focus:ring-2 focus:ring-[#01454A] focus:border-[#01454A] rounded-xl px-4 py-3 data-[state=open]:ring-2 data-[state=open]:ring-[#01454A]">
                  <SelectValue placeholder="Select condition" />
                </SelectTrigger>
              </FormControl>
              <SelectContent className="z-50 bg-white dark:bg-white border border-[#D9D9D9] text-[#1A1208] dark:text-[#1A1208] shadow-lg shadow-black/8 rounded-xl">
                <SelectItem value="new" className="cursor-pointer rounded-lg hover:bg-zinc-50 focus:bg-zinc-50">New — brand new item</SelectItem>
                <SelectItem value="used" className="cursor-pointer rounded-lg hover:bg-zinc-50 focus:bg-zinc-50">Used — pre-owned item</SelectItem>
                <SelectItem value="refurbished" className="cursor-pointer rounded-lg hover:bg-zinc-50 focus:bg-zinc-50">Refurbished — professionally restored</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* ── Categories (Checkable Grid) ── */}
      <FormField
        control={form.control}
        name="category_ids"
        render={() => (
          <FormItem className="space-y-3">
            <FormLabel className="text-[#1A1208] font-semibold text-sm">
              Categories <span className="text-[#FDA600]">*</span>
            </FormLabel>
            <FormDescription className="text-zinc-500 text-xs">
              Select 1 to 15 categories your product specializes in. Powers search, catalog filtering, and AI matching.
            </FormDescription>
            <div className="rounded-xl border border-[#D9D9D9] bg-[#FAFAF8] p-4">
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
                          ? "border-[#FDA600] bg-[#FFF6E3] shadow-sm"
                          : "border-[#D9D9D9] bg-white hover:border-[#FDA600]/50"
                      }`}
                    >
                      <span
                        className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 transition-all ${
                          selected ? "border-[#FDA600] bg-[#FDA600]" : "border-[#D9D9D9]"
                        }`}
                      >
                        {selected && <Check className="h-3 w-3 text-black" />}
                      </span>
                      <span className="text-sm font-semibold text-[#1A1208] truncate">
                        {cat.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* ── Sub-Category (Checkable Grid, Dependent on Primary) ── */}
      <FormField
        control={form.control}
        name="sub_category_ids"
        render={() => (
          <FormItem className="space-y-3">
            <FormLabel className="text-[#1A1208] font-semibold text-sm font-outfit">
              Sub-Categories
            </FormLabel>
            <FormDescription className="text-zinc-500 text-xs">
              Select up to 15 sub-categories to refine catalog discovery.
            </FormDescription>
            <div className="rounded-xl border border-[#D9D9D9] bg-[#FAFAF8] p-4">
              {!selectedPrimaryCategoryId ? (
                <div className="rounded-xl border border-dashed border-[#D9D9D9] p-5 text-center bg-white">
                  <p className="text-sm font-semibold text-[#5A6465]">Select a category above first</p>
                  <p className="mt-1 text-xs text-[#7A6B44]">Sub-categories will populate once a primary category is chosen.</p>
                </div>
              ) : subsLoading ? (
                <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-14 rounded-xl bg-zinc-100 animate-pulse" />
                  ))}
                </div>
              ) : subCategories.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[#D9D9D9] p-5 text-center bg-white">
                  <p className="text-sm font-semibold text-[#5A6465]">No sub-categories available for this category</p>
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
                            ? "border-[#FDA600] bg-[#FFF6E3] shadow-sm"
                            : "border-[#D9D9D9] bg-white hover:border-[#FDA600]/50"
                        }`}
                      >
                        <span
                          className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 transition-all ${
                            selected ? "border-[#FDA600] bg-[#FDA600]" : "border-[#D9D9D9]"
                          }`}
                        >
                          {selected && <Check className="h-3 w-3 text-black" />}
                        </span>
                        <span className="text-sm font-semibold text-[#1A1208] truncate">
                          {sub.name}
                        </span>
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



      {/* ── Tags ── */}
      <FormField
        control={form.control}
        name="tag_ids"
        render={() => (
          <FormItem>
            <FormLabel className="text-[#1A1208] font-semibold text-sm">Tags</FormLabel>
            <FormDescription className="text-zinc-500 text-xs mb-2">
              Add up to 10 tags to improve searchability
            </FormDescription>

            {/* Selected tag chips */}
            {selectedTagIds.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {selectedTagIds.map((tagId) => {
                  const tag = tags.find((t) => t.id === tagId);
                  return (
                    <Badge
                      key={tagId}
                      variant="secondary"
                      className="bg-[#FFF6E3] text-[#7A6B44] border-[#FDA600]/25 pl-3 pr-1 gap-1"
                    >
                      {tag?.name ?? tagId}
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeTag(tagId)}
                        className="h-4 w-4 p-0 text-[#01454A] hover:text-red-600 hover:bg-transparent"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  );
                })}
              </div>
            )}

            {/* Tag selector */}
            <Select
              onValueChange={addTag}
              value=""
              disabled={selectedTagIds.length >= 10}
            >
              <SelectTrigger className="bg-white border border-[#D9D9D9] text-[#1A1208] focus:ring-[#01454A] focus:border-[#01454A] rounded-xl px-4 py-3">
                <SelectValue
                  placeholder={
                    selectedTagIds.length >= 10
                      ? "Maximum tags reached"
                      : "Add a tag…"
                  }
                />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-white border border-[#D9D9D9] text-[#1A1208] dark:text-[#1A1208] max-h-60 overflow-y-auto shadow-lg shadow-black/8">
                {tags
                  .filter((t) => !selectedTagIds.includes(t.id))
                  .map((tag) => (
                    <SelectItem key={tag.id} value={tag.id} className="hover:bg-zinc-50 focus:bg-zinc-50">
                      {tag.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
