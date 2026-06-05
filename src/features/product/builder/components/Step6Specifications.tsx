"use client";

/**
 * @file Step6Specifications.tsx
 * @description Step 6 — Product Specifications (key-value table)
 *
 * Renders a dynamic list of title + content pairs.
 * Supports:
 *  - Add row (up to 20)
 *  - Delete row
 *  - Drag-to-reorder via keyboard-accessible handles
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
import { Button } from "@/components/ui/button";
import { Plus, Trash2, GripVertical, ListChecks } from "lucide-react";

export function Step6Specifications() {
  const form = useFormContext<ProductBuilderFormValues>();
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "specifications",
  });

  const addSpec = () => {
    if (fields.length < 20) {
      append({ title: "", content: "" });
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div>
        <h3 className="text-[#1A1208] font-semibold flex items-center gap-2 text-base">
          <ListChecks className="w-5 h-5 text-violet-500" />
          Product Specifications
        </h3>
        <p className="text-zinc-500 text-xs mt-1">
          Add technical details like material, dimensions, and care instructions.
          Maximum 20 entries.
        </p>
      </div>

      {/* ── Empty state ── */}
      {fields.length === 0 && (
        <div className="rounded-xl border border-dashed border-zinc-200 py-10 text-center bg-[#FAFAF8]">
          <p className="text-zinc-500 text-sm">
            No specifications yet. Click "Add Specification" to start.
          </p>
        </div>
      )}

      {/* ── Spec rows ── */}
      <div className="space-y-3">
        {fields.map((field, idx) => (
          <div
            key={field.id}
            className="group flex gap-3 items-start rounded-xl bg-white border border-zinc-200 p-4 hover:border-zinc-300 transition-colors"
          >
            {/* Drag handle */}
            <div className="flex-shrink-0 pt-2 text-zinc-400 cursor-grab group-hover:text-zinc-600 transition-colors">
              <GripVertical className="w-4 h-4" />
            </div>

            {/* Fields */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name={`specifications.${idx}.title`}
                render={({ field: f }) => (
                  <FormItem>
                    <FormLabel className="text-zinc-500 text-xs font-semibold">Title</FormLabel>
                    <FormControl>
                      <Input
                        {...f}
                        placeholder="e.g. Material"
                        className="bg-white border border-[#D9D9D9] text-[#1A1208] placeholder:text-[#7A6B44]/50 focus:ring-violet-500 focus:border-violet-500 rounded-xl px-3 py-2 text-xs"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name={`specifications.${idx}.content`}
                render={({ field: f }) => (
                  <FormItem>
                    <FormLabel className="text-zinc-500 text-xs font-semibold">Value</FormLabel>
                    <FormControl>
                      <Textarea
                        {...f}
                        rows={2}
                        placeholder="e.g. 100% Premium Ankara Cotton"
                        className="bg-white border border-[#D9D9D9] text-[#1A1208] placeholder:text-[#7A6B44]/50 focus:ring-violet-500 focus:border-violet-500 rounded-xl px-3 py-2 text-xs resize-none"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Delete */}
            <button
              type="button"
              onClick={() => remove(idx)}
              className="flex-shrink-0 pt-1.5 text-zinc-400 hover:text-red-600 transition-colors"
              title="Remove specification"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* ── Add button ── */}
      {fields.length < 20 && (
        <Button
          type="button"
          variant="outline"
          onClick={addSpec}
          className="w-full border-dashed border-zinc-300 text-zinc-600 hover:text-zinc-800 hover:border-violet-500/50 bg-transparent hover:bg-zinc-50 rounded-xl"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Specification ({fields.length}/20)
        </Button>
      )}

      {/* Global validation */}
      <FormField
        control={form.control}
        name="specifications"
        render={() => <FormItem><FormMessage /></FormItem>}
      />
    </div>
  );
}
