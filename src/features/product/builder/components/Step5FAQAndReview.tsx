"use client";

/**
 * @file Step5ReviewSubmit.tsx
 * @description Step 5 — Final Review, Specifications, FAQs, SEO, and Publish Settings
 */

import { useFormContext, useFieldArray } from "react-hook-form";
import type { ProductBuilderFormValues } from "../schemas/builder.schemas";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
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
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Settings, SendHorizontal, BookOpen, Sparkles } from "lucide-react";

const GENDER_OPTIONS = [
  { value: "unisex", label: "Unisex" },
  { value: "male", label: "Male / Men" },
  { value: "female", label: "Female / Women" },
];

const AGE_OPTIONS = [
  { value: "adult", label: "Adult" },
  { value: "teen", label: "Teenagers" },
  { value: "kids", label: "Kids / Children" },
  { value: "infant", label: "Infants / Toddlers" },
];

export function Step5ReviewSubmit() {
  const form = useFormContext<ProductBuilderFormValues>();

  const { fields: faqFields, append: appendFaq, remove: removeFaq } = useFieldArray({
    control: form.control,
    name: "faqs",
  });

  return (
    <div className="space-y-10">
      {/* ── SECTION 1 — TARGETING & DEMOGRAPHICS ── */}
      <div className="rounded-2xl border border-[#ECE6D6] bg-[#FAFAF8] p-6 space-y-6">
        <div>
          <h3 className="text-md font-bold text-[#1A1208] flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#01454A]" /> Target Audience
          </h3>
          <p className="text-xs text-[#7A6B44] mt-0.5">
            Optimize search visibility and category placement by defining your target audience.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="gender_target"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[#1A1208] font-semibold text-sm">Gender Targeting</FormLabel>
                <Select onValueChange={field.onChange} value={field.value ?? ""}>
                  <FormControl>
                    <SelectTrigger className="bg-white border border-[#D9D9D9] text-[#1A1208] rounded-xl px-4 py-3">
                      <SelectValue placeholder="All/Unisex" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-white border border-[#D9D9D9] text-[#1A1208] shadow-lg">
                    {GENDER_OPTIONS.map((opt) => (
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

          <FormField
            control={form.control}
            name="age_group"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[#1A1208] font-semibold text-sm">Age Group</FormLabel>
                <Select onValueChange={field.onChange} value={field.value ?? ""}>
                  <FormControl>
                    <SelectTrigger className="bg-white border border-[#D9D9D9] text-[#1A1208] rounded-xl px-4 py-3">
                      <SelectValue placeholder="All Ages" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-white border border-[#D9D9D9] text-[#1A1208] shadow-lg">
                    {AGE_OPTIONS.map((opt) => (
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
        </div>
      </div>



      {/* ── SECTION 3 — FAQS ── */}
      <div className="rounded-2xl border border-[#ECE6D6] bg-[#FAFAF8] p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-[#ECE6D6] pb-3">
          <div>
            <h3 className="text-md font-bold text-[#1A1208] flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#01454A]" /> Frequently Asked Questions
            </h3>
            <p className="text-xs text-[#7A6B44] mt-0.5">Answer buyer queries beforehand to reduce custom support conversations.</p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => appendFaq({ question: "", answer: "" })}
            className="text-[#01454A] border-[#01454A]/30 hover:bg-[#F0F5F5] rounded-lg text-xs"
          >
            <Plus className="w-3.5 h-3.5 mr-1" /> Add FAQ Row
          </Button>
        </div>

        {faqFields.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-200 py-6 text-center bg-white text-xs text-zinc-400">
            No FAQ rows added. Answer questions about tailoring timeline, packaging, custom variations.
          </div>
        ) : (
          <div className="space-y-4">
            {faqFields.map((field, idx) => (
              <div key={field.id} className="bg-white border border-zinc-200 rounded-xl p-4 space-y-3 relative group">
                <FormField
                  control={form.control}
                  name={`faqs.${idx}.question`}
                  render={({ field: f }) => (
                    <FormItem>
                      <FormLabel className="text-xs text-[#7A6B44] font-semibold">Question</FormLabel>
                      <FormControl>
                        <Input {...f} placeholder="e.g. How long does sewing take?" className="text-xs h-8 bg-white" />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`faqs.${idx}.answer`}
                  render={({ field: f }) => (
                    <FormItem>
                      <FormLabel className="text-xs text-[#7A6B44] font-semibold">Answer</FormLabel>
                      <FormControl>
                        <Textarea {...f} placeholder="e.g. Our standard tailoring cycle takes 7-10 business days before shipping." className="text-xs h-16 bg-white" />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeFaq(idx)}
                  className="absolute top-2 right-2 h-7 w-7 text-red-500 hover:bg-red-50 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── SECTION 4 — SEO META OVERRIDES ── */}
      <div className="rounded-2xl border border-[#ECE6D6] bg-[#FAFAF8] p-6 space-y-6">
        <div>
          <h3 className="text-md font-bold text-[#1A1208] flex items-center gap-2">
            <Settings className="w-4 h-4 text-[#01454A]" /> SEO Search Engine Optimization
          </h3>
          <p className="text-xs text-[#7A6B44] mt-0.5">Provide custom title tags and search engine descriptions.</p>
        </div>

        <div className="space-y-4">
          <FormField
            control={form.control}
            name="meta_title"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[#1A1208] font-semibold text-sm">Meta Title</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value ?? ""} placeholder="Custom SEO Title (Falls back to product title if empty)" className="bg-white rounded-xl" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="meta_description"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[#1A1208] font-semibold text-sm">Meta Description</FormLabel>
                <FormControl>
                  <Textarea {...field} value={field.value ?? ""} placeholder="Custom SEO Description..." className="bg-white rounded-xl h-20" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      {/* ── SECTION 5 — PUBLISH METHOD ── */}
      <div className="rounded-2xl border border-[#ECE6D6] bg-[#FAFAF8] p-6 space-y-6">
        <div>
          <h3 className="text-md font-bold text-[#1A1208] flex items-center gap-2">
            <SendHorizontal className="w-4 h-4 text-[#01454A]" /> Publish Options
          </h3>
          <p className="text-xs text-[#7A6B44] mt-0.5">Determine how your product is saved and published.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="publish_intent"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[#1A1208] font-semibold text-sm">Action Type</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="bg-white border border-[#D9D9D9] text-[#1A1208] rounded-xl px-4 py-3">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-white border border-[#D9D9D9] text-[#1A1208] shadow-lg">
                    <SelectItem value="draft">Save as Draft (Private)</SelectItem>
                    <SelectItem value="pending">Submit for Review (Publish)</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-4">
            <FormField
              control={form.control}
              name="featured"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-xl bg-white border border-[#D9D9D9] px-4 py-3">
                  <FormLabel className="text-sm font-semibold text-[#1A1208] cursor-pointer">Request Featured Hero Position</FormLabel>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} className="data-[state=checked]:bg-[#01454A]" />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="hot_deal"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-xl bg-white border border-[#D9D9D9] px-4 py-3">
                  <FormLabel className="text-sm font-semibold text-[#1A1208] cursor-pointer">Apply Hot Deal / Sale tag</FormLabel>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} className="data-[state=checked]:bg-[#01454A]" />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
