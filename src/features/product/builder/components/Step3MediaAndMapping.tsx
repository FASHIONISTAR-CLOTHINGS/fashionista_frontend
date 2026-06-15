"use client";

import { useFormContext, useFieldArray } from "react-hook-form";
import type { ProductBuilderFormValues } from "../schemas/builder.schemas";
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Image as ImageIcon, Plus, Trash2 } from "lucide-react";

export function Step3MediaAndMapping() {
  const form = useFormContext<ProductBuilderFormValues>();

  const { fields: galleryFields, append: appendGallery, remove: removeGallery } = useFieldArray({
    control: form.control,
    name: "gallery",
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* SECTION A: Cover Image */}
      <div className="rounded-2xl border border-[#ECE6D6] bg-[#FAFAF8] p-6 space-y-6">
        <div className="flex items-center gap-2 border-b border-[#ECE6D6] pb-3">
          <ImageIcon className="w-5 h-5 text-[#01454A]" />
          <h3 className="text-lg font-bold text-[#1A1208]">Cover Image</h3>
        </div>
        
        <FormField
          control={form.control}
          name="cover_image_public_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[#1A1208] font-semibold text-sm">Cover Image Public ID *</FormLabel>
              <FormControl>
                <Input {...field} placeholder="e.g. fashionistar/product123" className="bg-white border-[#D9D9D9]" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="cover_image_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[#1A1208] font-semibold text-sm">Cover Image URL *</FormLabel>
              <FormControl>
                <Input {...field} value={field.value || ""} placeholder="e.g. https://res.cloudinary.com/..." className="bg-white border-[#D9D9D9]" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* SECTION B: Gallery */}
      <div className="rounded-2xl border border-[#ECE6D6] bg-[#FAFAF8] p-6 space-y-6">
        <div className="flex items-center gap-2 border-b border-[#ECE6D6] pb-3">
          <ImageIcon className="w-5 h-5 text-[#01454A]" />
          <h3 className="text-lg font-bold text-[#1A1208]">Gallery & Variant Mapping</h3>
        </div>
        
        <div className="space-y-4">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => appendGallery({ public_id: "", secure_url: "", media_type: "image", ordering: galleryFields.length, color_name: "", color_hex: "", size_id: null })}
          >
            <Plus className="w-4 h-4 mr-2" /> Add Gallery Image
          </Button>
          
          {galleryFields.map((field, idx) => (
            <div key={field.id} className="grid grid-cols-12 gap-4 items-start bg-white p-4 rounded-lg border border-zinc-200">
              <div className="col-span-12 md:col-span-5 space-y-2">
                <FormField
                  control={form.control}
                  name={`gallery.${idx}.public_id`}
                  render={({ field: f }) => (
                    <FormItem>
                      <FormControl><Input {...f} placeholder="Public ID" className="h-8 text-xs" /></FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`gallery.${idx}.secure_url`}
                  render={({ field: f }) => (
                    <FormItem>
                      <FormControl><Input {...f} placeholder="Secure URL" className="h-8 text-xs" /></FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <div className="col-span-12 md:col-span-6 grid grid-cols-2 gap-2">
                <FormField
                  control={form.control}
                  name={`gallery.${idx}.color_name`}
                  render={({ field: f }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] uppercase text-zinc-500">Color Name</FormLabel>
                      <FormControl><Input {...f} placeholder="e.g. Red" className="h-8 text-xs" /></FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`gallery.${idx}.color_hex`}
                  render={({ field: f }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] uppercase text-zinc-500">Color Hex</FormLabel>
                      <FormControl><Input {...f} placeholder="#FF0000" className="h-8 text-xs" /></FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`gallery.${idx}.size_id`}
                  render={({ field: f }) => (
                    <FormItem className="col-span-2">
                      <FormLabel className="text-[10px] uppercase text-zinc-500">Size Mapping (UUID)</FormLabel>
                      <FormControl><Input {...f} value={f.value || ""} placeholder="Measurement Guide UUID" className="h-8 text-xs" /></FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <div className="col-span-12 md:col-span-1 flex justify-end">
                <Button type="button" variant="ghost" size="icon" className="text-red-500" onClick={() => removeGallery(idx)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
