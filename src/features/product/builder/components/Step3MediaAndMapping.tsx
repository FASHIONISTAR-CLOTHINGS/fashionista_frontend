"use client";

/**
 * @file Step3MediaAndMapping.tsx
 * @description Step 3 — Media Uploads with Inline Color & Size Mappings
 *
 * Fields covered (aligned to ProductBuilderFormSchema Step3Schema):
 *   • cover_image_public_id  — Cloudinary public_id of cover image (required)
 *   • cover_image_url        — Cloudinary secure_url of cover image
 *   • gallery[]              — Array of ProductVariantGalleryMedia items, each with:
 *       public_id, secure_url, media_type, alt_text, ordering,
 *       color_name, color_hex (via SingleColorSwatchPicker), size_id
 *
 * Each gallery row renders a card with:
 *   - Image preview (if secure_url present)
 *   - Public ID + Secure URL fields (text, for Cloudinary widget integration)
 *   - Media type select (image / video)
 *   - Alt text field
 *   - SingleColorSwatchPicker — selects from 150+ Pantone fashion colors
 *   - Size mapping dropdown (shows size labels from measurement_guide)
 *   - Ordering field (auto-set)
 */

import React from "react";
import { useFormContext, useFieldArray } from "react-hook-form";
import type { ProductBuilderFormValues } from "../schemas/builder.schemas";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Image as ImageIcon,
  Video,
  Plus,
  Trash2,
  GripVertical,
  AlertCircle,
  Star,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SingleColorSwatchPicker } from "./ColorSwatchPicker";
import type { SelectedColor } from "./ColorSwatchPicker";

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

type MediaType = "image" | "video";

// ─────────────────────────────────────────────────────────────────────────────
// SECTION CARD
// ─────────────────────────────────────────────────────────────────────────────

function SectionCard({
  icon,
  title,
  subtitle,
  badge,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  badge?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-[#ECE6D6] bg-[#FAFAF8] p-6 space-y-6 transition-shadow hover:shadow-md">
      <div className="border-b border-[#ECE6D6] pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#01454A]/10 text-[#01454A]">
              {icon}
            </span>
            <h3 className="text-base font-bold text-[#1A1208]">{title}</h3>
          </div>
          {badge}
        </div>
        {subtitle && (
          <p className="text-xs text-[#7A6B44] mt-1.5 ml-10">{subtitle}</p>
        )}
      </div>
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MEDIA PREVIEW
// ─────────────────────────────────────────────────────────────────────────────

function MediaPreview({
  url,
  mediaType,
  altText,
  isCover = false,
}: {
  url: string;
  mediaType: MediaType;
  altText?: string;
  isCover?: boolean;
}) {
  if (!url) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-36 rounded-xl bg-zinc-100 border border-dashed border-zinc-300">
        {mediaType === "video" ? (
          <Video className="w-8 h-8 text-zinc-300 mb-1" />
        ) : (
          <ImageIcon className="w-8 h-8 text-zinc-300 mb-1" />
        )}
        <span className="text-xs text-zinc-400">
          {mediaType === "video" ? "Video preview" : "Image preview"}
        </span>
      </div>
    );
  }

  if (mediaType === "video") {
    return (
      <div className="relative w-full h-36 rounded-xl overflow-hidden bg-black">
        <video
          src={url}
          className="w-full h-full object-cover"
          muted
          preload="metadata"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <Video className="w-8 h-8 text-white/80" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-36 rounded-xl overflow-hidden bg-zinc-100 border border-zinc-200">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt={altText || "Product image preview"}
        className="w-full h-full object-cover"
        loading="lazy"
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = "none";
        }}
      />
      {isCover && (
        <div className="absolute top-2 left-2">
          <Badge className="bg-[#FDA600] text-white text-[10px] px-2 py-0.5 font-bold flex items-center gap-1">
            <Star className="w-2.5 h-2.5" />
            Cover
          </Badge>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN STEP 3 COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export function Step3MediaAndMapping() {
  const form = useFormContext<ProductBuilderFormValues>();

  const coverUrl       = form.watch("cover_image_url") ?? "";
  const coverPublicId  = form.watch("cover_image_public_id") ?? "";
  const measureGuide   = form.watch("measurement_guide") ?? [];

  const {
    fields: galleryFields,
    append: appendGallery,
    remove: removeGallery,
  } = useFieldArray({
    control: form.control,
    name: "gallery",
  });

  const addGalleryItem = (type: MediaType = "image") => {
    appendGallery({
      public_id:  "",
      secure_url: "",
      media_type: type,
      alt_text:   "",
      ordering:   galleryFields.length,
      color_name: "",
      color_hex:  "",
      size_id:    null,
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* ── SECTION A: COVER IMAGE ────────────────────────────────────────── */}
      <SectionCard
        icon={<Star className="w-4 h-4" />}
        title="Cover Image"
        subtitle="The primary product thumbnail shown on listing cards and at the top of the product page."
      >
        <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-6 items-start">
          {/* Live preview */}
          <MediaPreview
            url={coverUrl}
            mediaType="image"
            altText="Cover image"
            isCover
          />

          {/* Fields */}
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="cover_image_public_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#1A1208] font-semibold text-sm">
                    Cloudinary Public ID <span className="text-[#FDA600]">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      id="cover-public-id"
                      placeholder="fashionistar/products/product-slug-cover"
                      className="bg-white border-[#D9D9D9] rounded-xl h-11 font-mono text-xs focus-visible:ring-[#01454A]"
                    />
                  </FormControl>
                  <FormDescription className="text-xs">
                    Paste the Cloudinary public_id returned after upload.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cover_image_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#1A1208] font-semibold text-sm">
                    Secure URL
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      id="cover-secure-url"
                      value={field.value ?? ""}
                      placeholder="https://res.cloudinary.com/fashionistar/image/upload/…"
                      className="bg-white border-[#D9D9D9] rounded-xl h-11 font-mono text-xs focus-visible:ring-[#01454A]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {!coverPublicId && (
              <div className="flex items-start gap-2 rounded-xl border border-[#FDA600]/30 bg-[#FFF6E3] p-3">
                <AlertCircle className="w-4 h-4 text-[#FDA600] flex-shrink-0 mt-0.5" />
                <p className="text-xs text-[#7A5500]">
                  A cover image is required before you can publish your product.
                </p>
              </div>
            )}
          </div>
        </div>
      </SectionCard>

      {/* ── SECTION B: GALLERY & VARIANT MAPPINGS ────────────────────────── */}
      <SectionCard
        icon={<ImageIcon className="w-4 h-4" />}
        title="Gallery & Variant Mappings"
        subtitle="Upload up to 12 images/videos. Map each media to a colour and/or size variant for the storefront gallery filter."
        badge={
          <Badge
            variant="secondary"
            className="bg-[#E8F3F1] text-[#01454A] border border-[#01454A]/20 text-xs"
          >
            {galleryFields.length} / 12
          </Badge>
        }
      >
        {/* Add buttons */}
        <div className="flex items-center gap-3 flex-wrap">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={galleryFields.length >= 12}
            onClick={() => addGalleryItem("image")}
            className="border-[#01454A] text-[#01454A] hover:bg-[#E8F3F1] rounded-xl"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Add Image
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={galleryFields.length >= 12}
            onClick={() => addGalleryItem("video")}
            className="border-[#FDA600] text-[#7A5500] hover:bg-[#FFF6E3] rounded-xl"
          >
            <Video className="w-4 h-4 mr-1.5" />
            Add Video
          </Button>
          <p className="text-xs text-zinc-400 ml-auto">
            Maximum 12 gallery items allowed.
          </p>
        </div>

        {galleryFields.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[#D9D9D9] p-10 text-center bg-white">
            <ImageIcon className="w-10 h-10 text-zinc-200 mx-auto mb-3" />
            <p className="text-sm font-semibold text-zinc-400">
              No gallery media added yet.
            </p>
            <p className="text-xs text-zinc-300 mt-1">
              Click "Add Image" or "Add Video" above to start building your gallery.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {galleryFields.map((galleryField, idx) => {
              const mediaType: MediaType =
                (form.watch(`gallery.${idx}.media_type`) as MediaType) ?? "image";
              const secureUrl = form.watch(`gallery.${idx}.secure_url`) ?? "";
              const colorName = form.watch(`gallery.${idx}.color_name`) ?? "";
              const colorHex  = form.watch(`gallery.${idx}.color_hex`)  ?? "";

              const currentColor: SelectedColor | null =
                colorName && colorHex
                  ? { color_name: colorName, color_hex: colorHex }
                  : null;

              return (
                <div
                  key={galleryField.id}
                  className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-4 bg-white border border-zinc-200 rounded-2xl p-4 hover:border-[#D9D9D9] transition-colors"
                >
                  {/* Left: Preview + ordering handle */}
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 mb-1">
                      <GripVertical className="w-4 h-4 text-zinc-300 cursor-grab" />
                      <span className="text-xs font-bold text-zinc-400 uppercase">
                        #{idx + 1}{" "}
                        {mediaType === "video" ? (
                          <Video className="w-3 h-3 inline" />
                        ) : (
                          <ImageIcon className="w-3 h-3 inline" />
                        )}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="ml-auto h-7 w-7 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                        onClick={() => removeGallery(idx)}
                        aria-label={`Remove gallery item ${idx + 1}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                    <MediaPreview
                      url={secureUrl}
                      mediaType={mediaType}
                      altText={form.watch(`gallery.${idx}.alt_text`) ?? ""}
                    />
                  </div>

                  {/* Right: fields */}
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Public ID */}
                      <FormField
                        control={form.control}
                        name={`gallery.${idx}.public_id`}
                        render={({ field: f }) => (
                          <FormItem>
                            <FormLabel className="text-[10px] font-bold uppercase text-zinc-500 tracking-wide">
                              Cloudinary Public ID
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...f}
                                placeholder="fashionistar/products/…"
                                className="h-9 text-xs border-[#D9D9D9] rounded-lg font-mono focus-visible:ring-[#01454A]/30"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Secure URL */}
                      <FormField
                        control={form.control}
                        name={`gallery.${idx}.secure_url`}
                        render={({ field: f }) => (
                          <FormItem>
                            <FormLabel className="text-[10px] font-bold uppercase text-zinc-500 tracking-wide">
                              Secure URL
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...f}
                                placeholder="https://res.cloudinary.com/…"
                                className="h-9 text-xs border-[#D9D9D9] rounded-lg font-mono focus-visible:ring-[#01454A]/30"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Media Type */}
                      <FormField
                        control={form.control}
                        name={`gallery.${idx}.media_type`}
                        render={({ field: f }) => (
                          <FormItem>
                            <FormLabel className="text-[10px] font-bold uppercase text-zinc-500 tracking-wide">
                              Media Type
                            </FormLabel>
                            <Select onValueChange={f.onChange} value={f.value}>
                              <FormControl>
                                <SelectTrigger className="h-9 text-xs border-[#D9D9D9] rounded-lg">
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="rounded-xl">
                                <SelectItem value="image" className="text-xs">
                                  🖼️ Image
                                </SelectItem>
                                <SelectItem value="video" className="text-xs">
                                  🎬 Video
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Alt Text */}
                      <FormField
                        control={form.control}
                        name={`gallery.${idx}.alt_text`}
                        render={({ field: f }) => (
                          <FormItem>
                            <FormLabel className="text-[10px] font-bold uppercase text-zinc-500 tracking-wide">
                              Alt Text
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...f}
                                value={f.value ?? ""}
                                placeholder="Describe the image for accessibility…"
                                className="h-9 text-xs border-[#D9D9D9] rounded-lg focus-visible:ring-[#01454A]/30"
                                maxLength={200}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Color & Size Mapping */}
                    <div className="rounded-xl border border-[#ECE6D6] bg-[#FAFAF8] p-3 space-y-3">
                      <p className="text-[10px] font-bold uppercase text-zinc-400 tracking-widest">
                        Variant Mapping
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* Color mapping via SingleColorSwatchPicker */}
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold uppercase text-zinc-500 tracking-wide">
                            Colour Link
                          </label>
                          <SingleColorSwatchPicker
                            value={currentColor}
                            placeholder="Link to a colour…"
                            onChange={(color) => {
                              form.setValue(
                                `gallery.${idx}.color_name`,
                                color?.color_name ?? "",
                                { shouldValidate: false }
                              );
                              form.setValue(
                                `gallery.${idx}.color_hex`,
                                color?.color_hex ?? "",
                                { shouldValidate: false }
                              );
                            }}
                          />
                        </div>

                        {/* Size mapping via measurement guide rows */}
                        <FormField
                          control={form.control}
                          name={`gallery.${idx}.size_id`}
                          render={({ field: f }) => (
                            <FormItem>
                              <FormLabel className="text-[10px] font-bold uppercase text-zinc-500 tracking-wide">
                                Size Link
                              </FormLabel>
                              {measureGuide.length === 0 ? (
                                <div className="h-8 rounded-lg border border-dashed border-zinc-200 flex items-center px-3">
                                  <span className="text-xs text-zinc-300 italic">
                                    Add sizes in Step 2 to link here
                                  </span>
                                </div>
                              ) : (
                                <Select
                                  onValueChange={(val) =>
                                    f.onChange(val === "__none__" ? null : val)
                                  }
                                  value={f.value ?? "__none__"}
                                >
                                  <FormControl>
                                    <SelectTrigger className="h-8 text-xs border-[#D9D9D9] rounded-lg">
                                      <SelectValue placeholder="No size link" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent className="rounded-xl">
                                    <SelectItem value="__none__" className="text-xs">
                                      — No size link
                                    </SelectItem>
                                    {measureGuide.map((row, rowIdx) => (
                                      <SelectItem
                                        key={rowIdx}
                                        value={row.size_id ?? `local-${rowIdx}`}
                                        className="text-xs"
                                      >
                                        {row.size_label} (row {rowIdx + 1})
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              )}
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </SectionCard>
    </div>
  );
}
