"use client";

/**
 * @file Step1InfoAndSpecs.tsx
 * @description Step 1 — Basic Information & Technical Specifications
 *
 * Fields covered (aligned to ProductBuilderFormSchema Step1Schema):
 *   • title            — Product Title (required, min 5, max 255)
 *   • description      — Full rich description (required, min 30)
 *   • condition        — New / Used / Refurbished (required)
 *   • gender_target    — Men / Women / Unisex / Kids / Boys / Girls
 *   • age_group        — Adult / Teen / Child / Toddler / Infant
 *   • category_ids     — Multi-select from API (required, 1–15)
 *   • sub_category_ids — Dependent sub-category multi-select (optional, 0–15)
 */

import { useState } from "react";
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Check, FileText, Tag, Users, Baby, ShoppingBag, ChevronDown, FolderOpen, Image as ImageIcon, X } from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// TYPES & CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

interface SelectOption {
  id: string;
  name: string;
  slug?: string;
  image_url?: string;
}

interface PaginatedOptions {
  results: SelectOption[];
}

interface CategoryDetail {
  id: string;
  name: string;
  slug: string;
  children: SelectOption[];
}

const GENDER_OPTIONS = [
  { value: "men",    label: "👔 Men"    },
  { value: "women",  label: "👗 Women"  },
  { value: "unisex", label: "🧢 Unisex" },
  { value: "kids",   label: "👶 Kids"   },
  { value: "boys",   label: "🧒 Boys"   },
  { value: "girls",  label: "👧 Girls"  },
];

const AGE_GROUP_OPTIONS = [
  { value: "adult",   label: "🧑 Adult (18+)"       },
  { value: "teen",    label: "🧑‍🦱 Teen (13–17)"  },
  { value: "child",   label: "🧒 Child (3–12)"      },
  { value: "toddler", label: "👶 Toddler (1–3)"     },
  { value: "infant",  label: "🍼 Infant (0–12 mo)"  },
];

const CONDITION_OPTIONS = [
  {
    value: "new",
    label: "✨ New",
    description: "Brand new, never worn, with original packaging.",
  },
  {
    value: "used",
    label: "🔄 Used",
    description: "Pre-owned but in good condition. Minor wear may be present.",
  },
  {
    value: "refurbished",
    label: "🛠 Refurbished",
    description: "Professionally restored to near-original condition.",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// API FETCHERS
// ─────────────────────────────────────────────────────────────────────────────

async function fetchCategories(): Promise<SelectOption[]> {
  const data = await apiAsync
    .get("catalog/categories/?page_size=100")
    .json<PaginatedOptions>();
  return data.results ?? [];
}

async function fetchSubCategories(parentSlug: string): Promise<SelectOption[]> {
  if (!parentSlug) return [];
  const data = await apiAsync
    .get(`catalog/categories/${parentSlug}/detail/`)
    .json<CategoryDetail>();
  return data.children ?? [];
}

// ─────────────────────────────────────────────────────────────────────────────
// SKELETON
// ─────────────────────────────────────────────────────────────────────────────

function FieldSkeleton({ label }: { label: string }) {
  return (
    <div className="space-y-2">
      <div className="text-[#1A1208] font-semibold text-sm">{label}</div>
      <div className="h-11 w-full rounded-xl bg-zinc-100 animate-pulse" />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION WRAPPER
// ─────────────────────────────────────────────────────────────────────────────

function SectionCard({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-[#ECE6D6] bg-[#FAFAF8] p-6 space-y-6 transition-shadow hover:shadow-md">
      <div className="flex items-center gap-2.5 border-b border-[#ECE6D6] pb-3">
        <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#01454A]/10 text-[#01454A]">
          {icon}
        </span>
        <h3 className="text-base font-bold text-[#1A1208]">{title}</h3>
      </div>
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DROPDOWN SELECTORS FOR CATEGORIES & SUB-CATEGORIES
// ─────────────────────────────────────────────────────────────────────────────

export function CategoryDropdownSelector({
  categories,
  selectedCategoryIds,
  toggleCategory,
  onClearAll,
  maxCategories = 15,
}: {
  categories: SelectOption[];
  selectedCategoryIds: string[];
  toggleCategory: (id: string) => void;
  onClearAll: () => void;
  maxCategories?: number;
}) {
  const [open, setOpen] = useState(false);
  const selectedList = categories.filter((c) => selectedCategoryIds.includes(c.id));

  return (
    <div className="space-y-3 w-full">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "flex items-center justify-between w-full px-4 py-3 rounded-xl border text-sm font-medium transition-all",
              "bg-white border-[#D9D9D9] text-[#5A6465]",
              "hover:border-[#FDA600]/50 hover:bg-[#FFF6E3]/20",
              "focus:outline-none focus:ring-2 focus:ring-[#01454A]/20 focus:border-[#01454A]",
              open && "border-[#01454A] ring-2 ring-[#01454A]/20"
            )}
          >
            <span className="flex items-center gap-2">
              <FolderOpen className="w-4 h-4 text-[#01454A]" />
              {selectedCategoryIds.length > 0 ? (
                <span className="text-[#1A1208] font-semibold">
                  {selectedCategoryIds.length} categor{selectedCategoryIds.length !== 1 ? "ies" : "y"} selected
                </span>
              ) : (
                <span className="text-zinc-400">Select categories...</span>
              )}
            </span>
            <ChevronDown
              className={cn(
                "w-4 h-4 text-zinc-400 transition-transform duration-200",
                open && "rotate-180"
              )}
            />
          </button>
        </PopoverTrigger>

        <PopoverContent
          className="w-[340px] p-0 border border-[#D9D9D9] shadow-xl rounded-2xl bg-white overflow-hidden"
          align="start"
          side="bottom"
          sideOffset={6}
        >
          <Command className="bg-white">
            <div className="border-b border-[#ECE6D6] px-3 py-2">
              <CommandInput
                placeholder="Search categories (e.g. Traditional, Men...)"
                className="h-9 text-sm placeholder:text-zinc-400 border-0 focus:ring-0 bg-transparent"
              />
            </div>
            <CommandList className="max-h-[280px] overflow-y-auto overscroll-contain">
              <CommandEmpty className="py-8 text-center text-sm text-zinc-400">
                No category found.
              </CommandEmpty>
              <CommandGroup className="py-1">
                {categories.map((cat) => {
                  const selected = selectedCategoryIds.includes(cat.id);
                  const disabled = !selected && selectedCategoryIds.length >= maxCategories;
                  return (
                    <CommandItem
                      key={cat.id}
                      value={cat.name}
                      onSelect={() => {
                        if (!disabled) toggleCategory(cat.id);
                      }}
                      className={cn(
                        "flex items-center justify-between px-3 py-2 mx-1 rounded-lg cursor-pointer transition-all",
                        "data-[selected=true]:bg-[#F5F5F5]",
                        selected && "bg-[#F0F9F9]",
                        disabled && "opacity-40 cursor-not-allowed"
                      )}
                    >
                      <span className="flex items-center gap-2.5">
                        <span
                          className={cn(
                            "w-4 h-4 rounded-sm flex items-center justify-center flex-shrink-0 border border-[#01454A]/30 transition-all",
                            selected ? "bg-[#01454A]" : "bg-transparent"
                          )}
                        >
                          {selected && <Check className="w-2.5 h-2.5 text-white" />}
                        </span>
                        <span className="text-sm font-medium text-[#1A1208]">{cat.name}</span>
                      </span>

                      {cat.image_url ? (
                        <img
                          src={cat.image_url}
                          alt={cat.name}
                          className="w-7 h-7 rounded-md object-cover border border-zinc-200"
                        />
                      ) : (
                        <span className="w-7 h-7 rounded-md bg-zinc-100 flex items-center justify-center border border-zinc-200">
                          <ImageIcon className="w-3.5 h-3.5 text-zinc-400" />
                        </span>
                      )}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
            {selectedCategoryIds.length > 0 && (
              <div className="border-t border-[#ECE6D6] px-3 py-2 flex items-center justify-between bg-[#FAFAF8]">
                <span className="text-xs text-zinc-500 font-medium">
                  {selectedCategoryIds.length}/{maxCategories} selected
                </span>
                <button
                  type="button"
                  onClick={onClearAll}
                  className="text-xs text-red-500 font-semibold hover:underline"
                >
                  Clear all
                </button>
              </div>
            )}
          </Command>
        </PopoverContent>
      </Popover>

      {selectedList.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedList.map((cat) => (
            <Badge
              key={cat.id}
              className={cn(
                "flex items-center gap-1.5 pl-1.5 pr-2 py-1 rounded-full border",
                "bg-white border-[#D9D9D9] text-[#1A1208] hover:border-[#01454A]/50",
                "transition-all cursor-default"
              )}
            >
              {cat.image_url ? (
                <img
                  src={cat.image_url}
                  alt={cat.name}
                  className="w-4 h-4 rounded-full object-cover"
                />
              ) : (
                <span className="w-4 h-4 rounded-full bg-zinc-100 flex items-center justify-center">
                  <ImageIcon className="w-2 h-2 text-zinc-400" />
                </span>
              )}
              <span className="text-xs font-semibold">{cat.name}</span>
              <button
                type="button"
                onClick={() => toggleCategory(cat.id)}
                className="ml-0.5 text-zinc-400 hover:text-red-500 transition-colors"
                aria-label={`Remove ${cat.name}`}
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

export function SubCategoryDropdownSelector({
  subCategories,
  selectedSubCategoryIds,
  toggleSubCategory,
  onClearAll,
  maxSubCategories = 15,
  disabled = false,
}: {
  subCategories: SelectOption[];
  selectedSubCategoryIds: string[];
  toggleSubCategory: (id: string) => void;
  onClearAll: () => void;
  maxSubCategories?: number;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const selectedList = subCategories.filter((c) => selectedSubCategoryIds.includes(c.id));

  return (
    <div className="space-y-3 w-full">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className={cn(
              "flex items-center justify-between w-full px-4 py-3 rounded-xl border text-sm font-medium transition-all",
              "bg-white border-[#D9D9D9] text-[#5A6465]",
              disabled
                ? "bg-zinc-50 border-zinc-200 opacity-40 cursor-not-allowed"
                : "hover:border-[#FDA600]/50 hover:bg-[#FFF6E3]/20 focus:outline-none focus:ring-2 focus:ring-[#01454A]/20 focus:border-[#01454A]",
              open && !disabled && "border-[#01454A] ring-2 ring-[#01454A]/20"
            )}
          >
            <span className="flex items-center gap-2">
              <FolderOpen className="w-4 h-4 text-[#01454A]" />
              {selectedSubCategoryIds.length > 0 ? (
                <span className="text-[#1A1208] font-semibold">
                  {selectedSubCategoryIds.length} sub-categor{selectedSubCategoryIds.length !== 1 ? "ies" : "y"} selected
                </span>
              ) : (
                <span className="text-zinc-400">Select sub-categories...</span>
              )}
            </span>
            <ChevronDown
              className={cn(
                "w-4 h-4 text-zinc-400 transition-transform duration-200",
                open && "rotate-180"
              )}
            />
          </button>
        </PopoverTrigger>

        <PopoverContent
          className="w-[340px] p-0 border border-[#D9D9D9] shadow-xl rounded-2xl bg-white overflow-hidden"
          align="start"
          side="bottom"
          sideOffset={6}
        >
          <Command className="bg-white">
            <div className="border-b border-[#ECE6D6] px-3 py-2">
              <CommandInput
                placeholder="Search sub-categories..."
                className="h-9 text-sm placeholder:text-zinc-400 border-0 focus:ring-0 bg-transparent"
              />
            </div>
            <CommandList className="max-h-[280px] overflow-y-auto overscroll-contain">
              <CommandEmpty className="py-8 text-center text-sm text-zinc-400">
                No sub-category found.
              </CommandEmpty>
              <CommandGroup className="py-1">
                {subCategories.map((sub) => {
                  const selected = selectedSubCategoryIds.includes(sub.id);
                  const disabledItem = !selected && selectedSubCategoryIds.length >= maxSubCategories;
                  return (
                    <CommandItem
                      key={sub.id}
                      value={sub.name}
                      onSelect={() => {
                        if (!disabledItem) toggleSubCategory(sub.id);
                      }}
                      className={cn(
                        "flex items-center justify-between px-3 py-2 mx-1 rounded-lg cursor-pointer transition-all",
                        "data-[selected=true]:bg-[#F5F5F5]",
                        selected && "bg-[#F0F9F9]",
                        disabledItem && "opacity-40 cursor-not-allowed"
                      )}
                    >
                      <span className="flex items-center gap-2.5">
                        <span
                          className={cn(
                            "w-4 h-4 rounded-sm flex items-center justify-center flex-shrink-0 border border-[#01454A]/30 transition-all",
                            selected ? "bg-[#01454A]" : "bg-transparent"
                          )}
                        >
                          {selected && <Check className="w-2.5 h-2.5 text-white" />}
                        </span>
                        <span className="text-sm font-medium text-[#1A1208]">{sub.name}</span>
                      </span>

                      {sub.image_url ? (
                        <img
                          src={sub.image_url}
                          alt={sub.name}
                          className="w-7 h-7 rounded-md object-cover border border-zinc-200"
                        />
                      ) : (
                        <span className="w-7 h-7 rounded-md bg-zinc-100 flex items-center justify-center border border-zinc-200">
                          <ImageIcon className="w-3.5 h-3.5 text-zinc-400" />
                        </span>
                      )}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
            {selectedSubCategoryIds.length > 0 && (
              <div className="border-t border-[#ECE6D6] px-3 py-2 flex items-center justify-between bg-[#FAFAF8]">
                <span className="text-xs text-zinc-500 font-medium">
                  {selectedSubCategoryIds.length}/{maxSubCategories} selected
                </span>
                <button
                  type="button"
                  onClick={onClearAll}
                  className="text-xs text-red-500 font-semibold hover:underline"
                >
                  Clear all
                </button>
              </div>
            )}
          </Command>
        </PopoverContent>
      </Popover>

      {selectedList.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedList.map((sub) => (
            <Badge
              key={sub.id}
              className={cn(
                "flex items-center gap-1.5 pl-1.5 pr-2 py-1 rounded-full border",
                "bg-white border-[#D9D9D9] text-[#1A1208] hover:border-[#01454A]/50",
                "transition-all cursor-default"
              )}
            >
              {sub.image_url ? (
                <img
                  src={sub.image_url}
                  alt={sub.name}
                  className="w-4 h-4 rounded-full object-cover"
                />
              ) : (
                <span className="w-4 h-4 rounded-full bg-zinc-100 flex items-center justify-center">
                  <ImageIcon className="w-2 h-2 text-zinc-400" />
                </span>
              )}
              <span className="text-xs font-semibold">{sub.name}</span>
              <button
                type="button"
                onClick={() => toggleSubCategory(sub.id)}
                className="ml-0.5 text-zinc-400 hover:text-red-500 transition-colors"
                aria-label={`Remove ${sub.name}`}
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
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
  const selectedCondition = form.watch("condition") ?? "new";
  const selectedPrimaryCategoryId = selectedCategoryIds[0] ?? "";

  // ── TanStack Queries ───────────────────────────────────────────────────────
  const { data: categories = [], isLoading: catsLoading } = useQuery({
    queryKey: ["catalog", "categories"],
    queryFn: fetchCategories,
    staleTime: 5 * 60_000,
    gcTime: 10 * 60_000,
  });

  const primaryCategory = categories.find(
    (cat) => cat.id === selectedPrimaryCategoryId
  );
  const selectedPrimaryCategorySlug = primaryCategory?.slug ?? "";

  const { data: subCategories = [], isLoading: subsLoading } = useQuery({
    queryKey: ["catalog", "subcategories", selectedPrimaryCategorySlug],
    queryFn: () => fetchSubCategories(selectedPrimaryCategorySlug),
    enabled: !!selectedPrimaryCategorySlug,
    staleTime: 5 * 60_000,
    gcTime: 10 * 60_000,
  });

  // ── Category toggle helpers ────────────────────────────────────────────────
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

  // ── Loading skeleton ───────────────────────────────────────────────────────
  if (catsLoading) {
    return (
      <div className="space-y-8 animate-pulse">
        <FieldSkeleton label="Product Title *" />
        <FieldSkeleton label="Full Description *" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <FieldSkeleton label="Condition *" />
          <FieldSkeleton label="Gender Target" />
        </div>
        <FieldSkeleton label="Age Group" />
        <FieldSkeleton label="Categories *" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* ── SECTION A: BASIC DETAILS ──────────────────────────────────────── */}
      <SectionCard icon={<FileText className="w-4 h-4" />} title="Basic Details">

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
                  id="product-title"
                  placeholder="e.g. Royal Blue Hand-Embroidered Male Agbada Set (3-piece)"
                  className="bg-white border border-[#D9D9D9] text-[#1A1208] placeholder:text-[#7A6B44]/50 focus-visible:ring-[#01454A] focus-visible:border-[#01454A] rounded-xl px-4 py-3 h-11"
                  maxLength={255}
                />
              </FormControl>
              <div className="flex items-center justify-between">
                <FormDescription className="text-zinc-500 text-xs">
                  Be descriptive: include style, color, material, and gender.
                </FormDescription>
                <span
                  className={`text-xs font-mono ${
                    (field.value?.length ?? 0) > 220
                      ? "text-orange-500"
                      : "text-zinc-400"
                  }`}
                >
                  {field.value?.length ?? 0} / 255
                </span>
              </div>
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
                  id="product-description"
                  rows={7}
                  placeholder="Describe the fabrics used, embroidery detailing, care instructions, accessories included, and the inspiration behind this piece…"
                  className="bg-white border border-[#D9D9D9] text-[#1A1208] placeholder:text-[#7A6B44]/50 focus-visible:ring-[#01454A] focus-visible:border-[#01454A] rounded-xl px-4 py-3 resize-y"
                />
              </FormControl>
              <div className="flex items-center justify-between">
                <FormDescription className="text-zinc-500 text-xs">
                  Minimum 30 characters. Detailed descriptions rank better in search.
                </FormDescription>
                <span
                  className={`text-xs font-mono ${
                    (field.value?.length ?? 0) < 30
                      ? "text-red-400"
                      : "text-zinc-400"
                  }`}
                >
                  {field.value?.length ?? 0} / 10,000
                </span>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
      </SectionCard>

      {/* ── SECTION B: CONDITION, GENDER, AGE ────────────────────────────── */}
      <SectionCard icon={<ShoppingBag className="w-4 h-4" />} title="Classification">
        
        {/* Condition — Card radio group */}
        <FormField
          control={form.control}
          name="condition"
          render={({ fieldState }) => (
            <FormItem>
              <FormLabel className="text-[#1A1208] font-semibold text-sm">
                Condition <span className="text-[#FDA600]">*</span>
              </FormLabel>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {CONDITION_OPTIONS.map((opt) => {
                  const isActive = selectedCondition === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() =>
                        form.setValue("condition", opt.value as "new" | "used" | "refurbished", {
                          shouldValidate: true,
                        })
                      }
                      className={`flex flex-col items-start gap-1 rounded-xl border p-4 text-left transition-all duration-200 ${
                        isActive
                          ? "border-[#01454A] bg-[#E8F3F1] shadow-sm ring-1 ring-[#01454A]/30"
                          : "border-[#D9D9D9] bg-white hover:border-[#01454A]/40 hover:bg-[#F5FAF9]"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span
                          className={`flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full border-2 transition-all ${
                            isActive
                              ? "border-[#01454A] bg-[#01454A]"
                              : "border-[#D9D9D9]"
                          }`}
                        >
                          {isActive && <Check className="h-2.5 w-2.5 text-white" />}
                        </span>
                        <span
                          className={`text-sm font-bold ${
                            isActive ? "text-[#01454A]" : "text-[#1A1208]"
                          }`}
                        >
                          {opt.label}
                        </span>
                      </span>
                      <p className="text-xs text-[#7A6B44] leading-relaxed pl-6">
                        {opt.description}
                      </p>
                    </button>
                  );
                })}
              </div>
              {fieldState.error && (
                <p className="text-xs text-red-500 mt-1">{fieldState.error.message}</p>
              )}
            </FormItem>
          )}
        />

        {/* Gender & Age row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Gender Target */}
          <FormField
            control={form.control}
            name="gender_target"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[#1A1208] font-semibold text-sm flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-[#01454      {/* ── SECTION C: CATEGORIES ─────────────────────────────────────────── */}
      <SectionCard icon={<Tag className="w-4 h-4" />} title="Categories">

        {/* Primary Categories */}
        <FormField
          control={form.control}
          name="category_ids"
          render={({ fieldState }) => (
            <FormItem className="space-y-3">
              <div className="flex items-center justify-between">
                <FormLabel className="text-[#1A1208] font-semibold text-sm">
                  Primary Categories <span className="text-[#FDA600]">*</span>
                </FormLabel>
                <span className="text-xs text-zinc-500 font-mono">
                  {selectedCategoryIds.length} / 15 selected
                </span>
              </div>

              <FormControl>
                <CategoryDropdownSelector
                  categories={categories}
                  selectedCategoryIds={selectedCategoryIds}
                  toggleCategory={toggleCategory}
                  onClearAll={() => {
                    form.setValue("category_ids", [], { shouldValidate: true });
                    form.setValue("sub_category_ids", [], { shouldValidate: true });
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Sub-Categories (dependent) */}
        <FormField
          control={form.control}
          name="sub_category_ids"
          render={() => (
            <FormItem className="space-y-3">
              <div className="flex items-center justify-between">
                <FormLabel className="text-[#1A1208] font-semibold text-sm">
                  Sub-Categories
                  <span className="ml-1.5 text-xs font-normal text-zinc-400">
                    (optional)
                  </span>
                </FormLabel>
                {selectedSubCategoryIds.length > 0 && (
                  <span className="text-xs text-zinc-500 font-mono">
                    {selectedSubCategoryIds.length} / 15 selected
                  </span>
                )}
              </div>

              <FormControl>
                <SubCategoryDropdownSelector
                  subCategories={subCategories}
                  selectedSubCategoryIds={selectedSubCategoryIds}
                  toggleSubCategory={toggleSubCategory}
                  onClearAll={() => form.setValue("sub_category_ids", [], { shouldValidate: true })}
                  disabled={!selectedPrimaryCategoryId || subsLoading}
                />
              </FormControl>
              {!selectedPrimaryCategoryId && (
                <p className="text-xs text-zinc-400 italic">
                  Select a primary category to load sub-categories.
                </p>
              )}
              {selectedPrimaryCategoryId && subsLoading && (
                <p className="text-xs text-[#01454A] animate-pulse">
                  Loading sub-categories...
                </p>
              )}
              <FormMessage />
            </FormItem>
          )}
        />
      </SectionCard>
    </div>
  );
}                 />
                    ))}
                  </div>
                ) : subCategories.length === 0 ? (
                  <p className="text-sm text-zinc-400 italic text-center w-full">
                    No sub-categories for this category.
                  </p>
                ) : (
                  <div className="grid gap-2 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 w-full">
                    {subCategories.map((sub) => {
                      const selected = selectedSubCategoryIds.includes(sub.id);
                      const disabled =
                        !selected && selectedSubCategoryIds.length >= 15;
                      return (
                        <button
                          key={sub.id}
                          type="button"
                          disabled={disabled}
                          onClick={() => toggleSubCategory(sub.id)}
                          className={`flex items-center gap-3 rounded-xl border p-3.5 text-left transition-all duration-200 ${
                            selected
                              ? "border-[#FDA600] bg-[#FFF6E3] shadow-sm"
                              : disabled
                              ? "border-[#D9D9D9] bg-zinc-50 opacity-40 cursor-not-allowed"
                              : "border-[#D9D9D9] bg-white hover:border-[#FDA600]/50"
                          }`}
                        >
                          <span
                            className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 transition-all ${
                              selected
                                ? "border-[#FDA600] bg-[#FDA600]"
                                : "border-[#D9D9D9]"
                            }`}
                          >
                            {selected && (
                              <Check className="h-2.5 w-2.5 text-white" />
                            )}
                          </span>
                          <span
                            className={`text-sm truncate ${
                              selected
                                ? "font-semibold text-[#7A5500]"
                                : "text-[#1A1208]"
                            }`}
                          >
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
      </SectionCard>
    </div>
  );
}
