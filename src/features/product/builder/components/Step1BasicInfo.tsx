"use client";

/**
 * @file Step1BasicInfo.tsx
 * @description Step 1 — Basic Information
 *
 * Fields: title, description (rich-text), short_description, condition,
 *         category_ids, sub_category_ids, tag_ids
 *
 * The category list is fetched from the catalog API on mount.
 * Tags use a combobox multi-select with search debounce.
 */

import { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
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
import { Button } from "@/components/ui/Button";
import { X, Loader2 } from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

interface SelectOption {
  id: string;
  name: string;
  slug?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export function Step1BasicInfo() {
  const form = useFormContext<ProductBuilderFormValues>();

  // ── Catalog data ───────────────────────────────────────────────────────────
  const [categories, setCategories] = useState<SelectOption[]>([]);
  const [subCategories, setSubCategories] = useState<SelectOption[]>([]);
  const [tags, setTags] = useState<SelectOption[]>([]);
  const [loadingCatalog, setLoadingCatalog] = useState(true);

  const selectedCategoryIds = form.watch("category_ids") ?? [];
  const selectedSubCategoryIds = form.watch("sub_category_ids") ?? [];
  const selectedPrimaryCategoryId = selectedCategoryIds[0];
  const selectedTagIds = form.watch("tag_ids") ?? [];

  useEffect(() => {
    async function loadCatalog() {
      try {
        const [catRes, tagRes] = await Promise.all([
          fetch("/api/catalog/categories/?page_size=100").then((r) => r.json()),
          fetch("/api/product/tags/?page_size=100").then((r) => r.json()),
        ]);
        setCategories(catRes.results ?? []);
        setTags(tagRes.results ?? []);
      } catch {
        // Non-critical — vendor can type manually
      } finally {
        setLoadingCatalog(false);
      }
    }
    loadCatalog();
  }, []);

  // Load sub-categories when category changes
  useEffect(() => {
    if (!selectedPrimaryCategoryId) {
      setSubCategories([]);
      return;
    }
    fetch(`/api/catalog/categories/${selectedPrimaryCategoryId}/children/?page_size=50`)
      .then((r) => r.json())
      .then((data) => setSubCategories(data.results ?? []))
      .catch(() => setSubCategories([]));
  }, [selectedPrimaryCategoryId]);

  const addCategory = (categoryId: string) => {
    const current = form.getValues("category_ids") ?? [];
    if (!current.includes(categoryId) && current.length < 5) {
      form.setValue("category_ids", [...current, categoryId], { shouldValidate: true });
      if (current.length === 0) {
        // Sub-categories are loaded from the first selected category only.
        form.setValue("sub_category_ids", [], { shouldValidate: true });
      }
    }
  };

  const removeCategory = (categoryId: string) => {
    const current = form.getValues("category_ids") ?? [];
    form.setValue(
      "category_ids",
      current.filter((id) => id !== categoryId),
      { shouldValidate: true },
    );
    if (categoryId === current[0]) {
      form.setValue("sub_category_ids", [], { shouldValidate: true });
    }
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

  if (loadingCatalog) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 animate-spin text-violet-400" />
        <span className="ml-3 text-sm text-white/60">Loading catalog…</span>
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
            <FormLabel className="text-white/90 font-semibold">
              Product Title <span className="text-fuchsia-400">*</span>
            </FormLabel>
            <FormControl>
              <Input
                {...field}
                placeholder="e.g. Premium Hand-Stitched Agbada Set"
                className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-violet-500"
                maxLength={255}
              />
            </FormControl>
            <FormDescription className="text-white/40 text-xs">
              {field.value?.length ?? 0} / 255 characters
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* ── Short Description ── */}
      <FormField
        control={form.control}
        name="short_description"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-white/90 font-semibold">
              Short Description
            </FormLabel>
            <FormControl>
              <Textarea
                {...field}
                rows={2}
                placeholder="Brief marketing copy shown on listing cards (max 500 chars)"
                className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-violet-500 resize-none"
                maxLength={500}
              />
            </FormControl>
            <FormDescription className="text-white/40 text-xs">
              {field.value?.length ?? 0} / 500 characters
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
            <FormLabel className="text-white/90 font-semibold">
              Full Description <span className="text-fuchsia-400">*</span>
            </FormLabel>
            <FormControl>
              <Textarea
                {...field}
                rows={8}
                placeholder="Detailed product description — fabric, craftsmanship, sizing, care instructions…"
                className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-violet-500"
              />
            </FormControl>
            <FormDescription className="text-white/40 text-xs">
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
            <FormLabel className="text-white/90 font-semibold">
              Condition <span className="text-fuchsia-400">*</span>
            </FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger className="bg-white/5 border-white/10 text-white focus:border-violet-500">
                  <SelectValue placeholder="Select condition" />
                </SelectTrigger>
              </FormControl>
              <SelectContent className="bg-zinc-900 border-white/10">
                <SelectItem value="new">New — brand new item</SelectItem>
                <SelectItem value="used">Used — pre-owned item</SelectItem>
                <SelectItem value="refurbished">Refurbished — professionally restored</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* ── Categories + Sub-Category ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="category_ids"
          render={() => (
            <FormItem>
              <FormLabel className="text-white/90 font-semibold">
                Categories <span className="text-fuchsia-400">*</span>
              </FormLabel>
              <Select
                onValueChange={addCategory}
                disabled={selectedCategoryIds.length >= 5}
              >
                <FormControl>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white focus:border-violet-500">
                    <SelectValue placeholder="Add category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="bg-zinc-900 border-white/10 max-h-60 overflow-y-auto">
                  {categories
                    .filter((cat) => !selectedCategoryIds.includes(cat.id))
                    .map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <FormDescription className="text-white/40 text-xs">
                Select 1 to 5 categories for search, SEO, and recommendations.
              </FormDescription>
              {selectedCategoryIds.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {selectedCategoryIds.map((categoryId) => {
                    const category = categories.find((cat) => cat.id === categoryId);
                    return (
                      <Badge
                        key={categoryId}
                        variant="secondary"
                        className="bg-violet-500/20 text-violet-300 border-violet-500/30 pl-3 pr-1 gap-1"
                      >
                        {category?.name ?? categoryId}
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeCategory(categoryId)}
                          className="h-4 w-4 p-0 text-violet-400 hover:text-red-400 hover:bg-transparent"
                          aria-label={`Remove ${category?.name ?? "category"}`}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    );
                  })}
                </div>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="sub_category_ids"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white/90 font-semibold">
                Sub-Category
              </FormLabel>
              <Select
                onValueChange={(value) => field.onChange(value ? [value] : [])}
                value={selectedSubCategoryIds[0] ?? ""}
                disabled={subCategories.length === 0}
              >
                <FormControl>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white focus:border-violet-500 disabled:opacity-40">
                    <SelectValue placeholder={subCategories.length === 0 ? "Select a category first" : "Select sub-category"} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="bg-zinc-900 border-white/10 max-h-60 overflow-y-auto">
                  {subCategories.map((sub) => (
                    <SelectItem key={sub.id} value={sub.id}>
                      {sub.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* ── Tags ── */}
      <FormField
        control={form.control}
        name="tag_ids"
        render={() => (
          <FormItem>
            <FormLabel className="text-white/90 font-semibold">Tags</FormLabel>
            <FormDescription className="text-white/40 text-xs mb-2">
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
                      className="bg-violet-500/20 text-violet-300 border-violet-500/30 pl-3 pr-1 gap-1"
                    >
                      {tag?.name ?? tagId}
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeTag(tagId)}
                        className="h-4 w-4 p-0 text-violet-400 hover:text-red-400 hover:bg-transparent"
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
              <SelectTrigger className="bg-white/5 border-white/10 text-white focus:border-violet-500">
                <SelectValue placeholder={selectedTagIds.length >= 10 ? "Maximum tags reached" : "Add a tag…"} />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-white/10 max-h-60 overflow-y-auto">
                {tags
                  .filter((t) => !selectedTagIds.includes(t.id))
                  .map((tag) => (
                    <SelectItem key={tag.id} value={tag.id}>
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
