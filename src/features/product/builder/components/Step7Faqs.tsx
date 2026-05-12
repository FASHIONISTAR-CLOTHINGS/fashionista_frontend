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
import { Button } from "@/components/ui/Button";
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
        <h3 className="text-white font-semibold flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-violet-400" />
          Frequently Asked Questions
        </h3>
        <p className="text-white/40 text-xs mt-1">
          Pre-answer common customer questions to reduce support queries.
          Maximum 10 FAQs.
        </p>
      </div>

      {/* ── Empty state ── */}
      {fields.length === 0 && (
        <div className="rounded-xl border border-dashed border-white/15 py-10 text-center">
          <p className="text-white/40 text-sm">
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
                isOpen ? "border-violet-500/40 bg-violet-500/5" : "border-white/10 bg-white/3",
              )}
            >
              {/* ── Row header ── */}
              <div className="flex items-center gap-3 px-4 py-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-violet-500/20 text-violet-400 text-xs flex items-center justify-center font-semibold">
                  {idx + 1}
                </span>
                <button
                  type="button"
                  className="flex-1 text-left"
                  onClick={() => setExpanded(isOpen ? null : idx)}
                >
                  <span className={cn(
                    "text-sm font-medium transition-colors",
                    question ? "text-white/80" : "text-white/30",
                  )}>
                    {question || `Question ${idx + 1}…`}
                  </span>
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => remove(idx)}
                    className="text-white/20 hover:text-red-400 transition-colors p-1"
                    title="Remove FAQ"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setExpanded(isOpen ? null : idx)}
                    className="text-white/20 hover:text-white/60 transition-colors p-1"
                  >
                    <ChevronDown className={cn("w-4 h-4 transition-transform", isOpen && "rotate-180")} />
                  </button>
                </div>
              </div>

              {/* ── Expandable fields ── */}
              {isOpen && (
                <div className="border-t border-white/10 px-4 pb-4 pt-3 space-y-4">
                  <FormField
                    control={form.control}
                    name={`faqs.${idx}.question`}
                    render={({ field: f }) => (
                      <FormItem>
                        <FormLabel className="text-white/60 text-xs">Question</FormLabel>
                        <FormControl>
                          <Input
                            {...f}
                            placeholder="e.g. What is the return policy?"
                            className="bg-black/20 border-white/10 text-white text-sm focus:border-violet-500"
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
                        <FormLabel className="text-white/60 text-xs">Answer</FormLabel>
                        <FormControl>
                          <Textarea
                            {...f}
                            rows={3}
                            placeholder="Provide a clear, helpful answer…"
                            className="bg-black/20 border-white/10 text-white text-sm focus:border-violet-500"
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
          className="w-full border-dashed border-white/20 text-white/60 hover:text-white hover:border-violet-500/50 bg-transparent hover:bg-white/5"
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
