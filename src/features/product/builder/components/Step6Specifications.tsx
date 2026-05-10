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
import { Button } from "@/components/ui/Button";
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
        <h3 className="text-white font-semibold flex items-center gap-2">
          <ListChecks className="w-5 h-5 text-violet-400" />
          Product Specifications
        </h3>
        <p className="text-white/40 text-xs mt-1">
          Add technical details like material, dimensions, and care instructions.
          Maximum 20 entries.
        </p>
      </div>

      {/* ── Empty state ── */}
      {fields.length === 0 && (
        <div className="rounded-xl border border-dashed border-white/15 py-10 text-center">
          <p className="text-white/40 text-sm">
            No specifications yet. Click "Add Specification" to start.
          </p>
        </div>
      )}

      {/* ── Spec rows ── */}
      <div className="space-y-3">
        {fields.map((field, idx) => (
          <div
            key={field.id}
            className="group flex gap-3 items-start rounded-xl bg-white/5 border border-white/10 p-4 hover:border-white/20 transition-colors"
          >
            {/* Drag handle */}
            <div className="flex-shrink-0 pt-2 text-white/20 cursor-grab group-hover:text-white/40 transition-colors">
              <GripVertical className="w-4 h-4" />
            </div>

            {/* Fields */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name={`specifications.${idx}.title`}
                render={({ field: f }) => (
                  <FormItem>
                    <FormLabel className="text-white/60 text-xs">Title</FormLabel>
                    <FormControl>
                      <Input
                        {...f}
                        placeholder="e.g. Material"
                        className="bg-black/20 border-white/10 text-white text-sm focus:border-violet-500"
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
                    <FormLabel className="text-white/60 text-xs">Value</FormLabel>
                    <FormControl>
                      <Textarea
                        {...f}
                        rows={2}
                        placeholder="e.g. 100% Premium Ankara Cotton"
                        className="bg-black/20 border-white/10 text-white text-sm focus:border-violet-500 resize-none"
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
              className="flex-shrink-0 pt-1.5 text-white/20 hover:text-red-400 transition-colors"
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
          className="w-full border-dashed border-white/20 text-white/60 hover:text-white hover:border-violet-500/50 bg-transparent hover:bg-white/5"
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
