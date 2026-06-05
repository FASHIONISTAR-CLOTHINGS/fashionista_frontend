"use client";

/**
 * @file Step7Faqs.tsx
 * @description Step 7 — Product FAQs (Q&A pairs accordion editor)
 *
 * Up to 10 FAQ pairs rendered as an expandable editor list.
 * On PDP, these render as a Radix accordion.
 */

import { useState } from "react";
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
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Plus, Trash2, ChevronDown, HelpCircle } from "lucide-react";

export function Step7Faqs() {
  const form = useFormContext<ProductBuilderFormValues>();
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "faqs",
  });
  const [expanded, setExpanded] = useState<number | null>(null);

  const addFaq = () => {
    if (fields.length < 10) {
      const newIdx = fields.length;
      append({ question: "", answer: "" });
      setExpanded(newIdx);
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div>
        <h3 className="text-[#1A1208] font-semibold flex items-center gap-2 text-base">
          <HelpCircle className="w-5 h-5 text-[#FDA600]" />
          Frequently Asked Questions
        </h3>
        <p className="text-zinc-500 text-xs mt-1">
          Pre-answer common customer questions to reduce support queries.
          Maximum 10 FAQs.
        </p>
      </div>

      {/* ── Empty state ── */}
      {fields.length === 0 && (
        <div className="rounded-xl border border-dashed border-zinc-200 py-10 text-center bg-[#FAFAF8]">
          <p className="text-zinc-500 text-sm">
            No FAQs yet. Add your first question below.
          </p>
        </div>
      )}

      {/* ── FAQ list ── */}
      <div className="space-y-3">
        {fields.map((field, idx) => {
          const isOpen = expanded === idx;
          const question = form.watch(`faqs.${idx}.question`);

          return (
            <div
              key={field.id}
              className={cn(
                "rounded-xl border transition-all duration-200",
                isOpen ? "border-[#01454A]/30 bg-[#E6F4F5]/30" : "border-[#D9D9D9] bg-white",
              )}
            >
              {/* ── Row header ── */}
              <div className="flex items-center gap-3 px-4 py-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#FFF6E3] text-[#B37700] text-xs flex items-center justify-center font-semibold border border-[#FDA600]/30">
                  {idx + 1}
                </span>
                <button
                  type="button"
                  className="flex-1 text-left"
                  onClick={() => setExpanded(isOpen ? null : idx)}
                >
                  <span className={cn(
                    "text-sm font-semibold transition-colors",
                    question ? "text-zinc-800" : "text-zinc-400",
                  )}>
                    {question || `Question ${idx + 1}…`}
                  </span>
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => remove(idx)}
                    className="text-zinc-400 hover:text-red-600 transition-colors p-1"
                    title="Remove FAQ"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setExpanded(isOpen ? null : idx)}
                    className="text-zinc-400 hover:text-zinc-600 transition-colors p-1"
                  >
                    <ChevronDown className={cn("w-4 h-4 transition-transform", isOpen && "rotate-180")} />
                  </button>
                </div>
              </div>

              {/* ── Expandable fields ── */}
              {isOpen && (
                <div className="border-t border-zinc-100 px-4 pb-4 pt-3 space-y-4">
                  <FormField
                    control={form.control}
                    name={`faqs.${idx}.question`}
                    render={({ field: f }) => (
                      <FormItem>
                        <FormLabel className="text-zinc-500 text-xs font-semibold">Question</FormLabel>
                        <FormControl>
                          <Input
                            {...f}
                            placeholder="e.g. What is the return policy?"
                            className="bg-white border border-[#D9D9D9] text-[#1A1208] placeholder:text-[#7A6B44]/50 focus:ring-[#01454A] focus:border-[#01454A] rounded-xl px-3 py-2 text-xs"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`faqs.${idx}.answer`}
                    render={({ field: f }) => (
                      <FormItem>
                        <FormLabel className="text-zinc-500 text-xs font-semibold">Answer</FormLabel>
                        <FormControl>
                          <Textarea
                            {...f}
                            rows={3}
                            placeholder="Provide a clear, helpful answer…"
                            className="bg-white border border-[#D9D9D9] text-[#1A1208] placeholder:text-[#7A6B44]/50 focus:ring-[#01454A] focus:border-[#01454A] rounded-xl px-3 py-2 text-xs"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Add button ── */}
      {fields.length < 10 && (
        <Button
          type="button"
          variant="outline"
          onClick={addFaq}
          className="w-full border-dashed border-[#D9D9D9] text-[#7A6B44] hover:text-[#01454A] hover:border-[#01454A]/40 bg-transparent hover:bg-[#E6F4F5]/30 rounded-xl"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add FAQ ({fields.length}/10)
        </Button>
      )}

      {/* Global validation */}
      <FormField
        control={form.control}
        name="faqs"
        render={() => <FormItem><FormMessage /></FormItem>}
      />
    </div>
  );
}
