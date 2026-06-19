"use client";

/**
 * @file Step2MediaAndMapping.tsx
 * @description Media Uploads with Direct Cloudinary Integration and Color Mapping.
 * Rendered as Step 2 in the vendor product builder.
 */

import React, { useState, useRef } from "react";
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
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Image as ImageIcon,
  Video as VideoIcon,
  Plus,
  Trash2,
  GripVertical,
  AlertCircle,
  Star,
  Upload,
  CheckCircle2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SingleColorSwatchPicker } from "./ColorSwatchPicker";
import type { SelectedColor } from "./ColorSwatchPicker";
import { uploadFile } from "@/features/uploads/services/upload.service";
import { toast } from "sonner";
import { FashionistarImage, FashionistarVideo } from "@/components/media";

// ─────────────────────────────────────────────────────────────────────────────
// TYPES & SCHEMAS
// ─────────────────────────────────────────────────────────────────────────────

type MediaType = "image" | "video";
const MAX_GALLERY_ITEMS = 3;
const MAX_GALLERY_VIDEOS = 1;

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT: SectionCard
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
// COMPONENT: MediaPreview
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
          <VideoIcon className="w-8 h-8 text-zinc-300 mb-1" />
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
        <FashionistarVideo
          src={url}
          muted={true}
          autoPlay={false}
          showControls={false}
          className="w-full h-full"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <VideoIcon className="w-8 h-8 text-white/80" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-36 rounded-xl overflow-hidden bg-zinc-100 border border-zinc-200">
      <FashionistarImage
        src={url}
        alt={altText || "Product image preview"}
        fill={true}
        objectFit="cover"
        transformation="thumbnail"
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
// COMPONENT: UploadProgressArea
// ─────────────────────────────────────────────────────────────────────────────

function UploadProgressArea({
  isUploading,
  progress,
  error,
  mediaType,
  onSelectFile,
}: {
  isUploading: boolean;
  progress: number;
  error: string | null;
  mediaType: MediaType;
  onSelectFile: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (isUploading) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-36 rounded-xl bg-[#01454A]/5 border border-dashed border-[#01454A]/30 p-4 space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#01454A] animate-pulse">
          <Upload className="w-4 h-4 animate-bounce" />
          Uploading to cloud ({progress}%)
        </div>
        <Progress value={progress} className="h-1.5 w-4/5" />
      </div>
    );
  }

  return (
    <div
      onClick={() => fileInputRef.current?.click()}
      className="flex flex-col items-center justify-center w-full h-36 rounded-xl bg-white border border-dashed border-[#ECE6D6] hover:bg-zinc-50/50 hover:border-[#01454A]/50 transition-colors cursor-pointer p-4 text-center group"
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={onSelectFile}
        accept={mediaType === "video" ? "video/*" : "image/*"}
        className="hidden"
      />
      <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400 group-hover:bg-[#01454A]/10 group-hover:text-[#01454A] transition-colors mb-2">
        <Upload className="w-5 h-5" />
      </div>
      <span className="text-xs font-bold text-zinc-600 group-hover:text-[#01454A] transition-colors">
        Click to upload {mediaType}
      </span>
      {error ? (
        <span className="text-[10px] text-red-500 font-semibold mt-1">
          {error}
        </span>
      ) : (
        <span className="text-[10px] text-zinc-400 mt-1">
          Maximum size 10MB
        </span>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT: Step2MediaAndMapping
// ─────────────────────────────────────────────────────────────────────────────

export function Step2MediaAndMapping() {
  const form = useFormContext<ProductBuilderFormValues>();


  const title = form.watch("title") || "";
  const coverUrl = form.watch("cover_image_url") ?? "";
  const coverPublicId = form.watch("cover_image_public_id") ?? "";
  const coverColorName = form.watch("cover_image_color_name") ?? "";
  const coverColorHex = form.watch("cover_image_color_hex") ?? "";

  const {
    fields: galleryFields,
    append: appendGallery,
    remove: removeGallery,
  } = useFieldArray({
    control: form.control,
    name: "gallery",
  });
  const galleryItems = form.watch("gallery") ?? [];
  const galleryVideoCount = galleryItems.filter((item) => item.media_type === "video").length;
  const canAddGalleryItem = galleryFields.length < MAX_GALLERY_ITEMS;
  const canAddVideo = canAddGalleryItem && galleryVideoCount < MAX_GALLERY_VIDEOS;

  // ── Upload handlers ────────────────────────────────────────────────────────
  const [coverUploading, setCoverUploading] = useState(false);
  const [coverProgress, setCoverProgress] = useState(0);
  const [coverError, setCoverError] = useState<string | null>(null);

  const [galleryUploads, setGalleryUploads] = useState<
    Record<
      number,
      { isUploading: boolean; progress: number; error: string | null }
    >
  >({});

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setCoverError("Only images are accepted for the cover image.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setCoverError("File is too large (max 10MB).");
      return;
    }

    setCoverUploading(true);
    setCoverProgress(0);
    setCoverError(null);

    try {
      const result = await uploadFile(file, "product_image", "image", (event) => {
        setCoverProgress(event.percentage);
      });
      form.setValue("cover_image_public_id", result.public_id, { shouldValidate: true });
      form.setValue("cover_image_url", result.secure_url, { shouldValidate: true });
      toast.success("Cover image uploaded successfully.");
    } catch (err: any) {
      console.error("Cover image upload error:", err);
      setCoverError(err?.message || "Upload failed. Please try again.");
    } finally {
      setCoverUploading(false);
    }
  };

  const handleGalleryUpload = async (
    idx: number,
    mediaType: MediaType,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (mediaType === "video" && !file.type.startsWith("video/")) {
      updateGalleryUploadState(idx, { error: "Please select a valid video file." });
      return;
    }
    if (mediaType === "image" && !file.type.startsWith("image/")) {
      updateGalleryUploadState(idx, { error: "Please select a valid image file." });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      updateGalleryUploadState(idx, { error: "File size exceeds 10MB limit." });
      return;
    }

    updateGalleryUploadState(idx, { isUploading: true, progress: 0, error: null });

    try {
      const folder = mediaType === "video" ? "product_video" : "product_gallery";
      const result = await uploadFile(file, folder, mediaType, (event) => {
        updateGalleryUploadState(idx, { progress: event.percentage });
      });

      form.setValue(`gallery.${idx}.public_id`, result.public_id, { shouldValidate: true });
      form.setValue(`gallery.${idx}.secure_url`, result.secure_url, { shouldValidate: true });
      form.setValue(`gallery.${idx}.alt_text`, title || "Product Gallery Image", { shouldValidate: true });

      toast.success("Gallery item uploaded successfully.");
    } catch (err: any) {
      console.error("Gallery item upload error:", err);
      updateGalleryUploadState(idx, { error: err?.message || "Upload failed." });
    } finally {
      updateGalleryUploadState(idx, { isUploading: false });
    }
  };

  const updateGalleryUploadState = (
    idx: number,
    patch: Partial<{ isUploading: boolean; progress: number; error: string | null }>,
  ) => {
    setGalleryUploads((prev) => {
      const current = prev[idx] || { isUploading: false, progress: 0, error: null };
      return {
        ...prev,
        [idx]: {
          ...current,
          ...patch,
        },
      };
    });
  };

  const addGalleryItem = (type: MediaType = "image") => {
    if (galleryFields.length >= MAX_GALLERY_ITEMS) {
      toast.error("Maximum gallery reached", {
        description: "Use one cover image plus up to 3 gallery items.",
      });
      return;
    }
    if (type === "video" && galleryVideoCount >= MAX_GALLERY_VIDEOS) {
      toast.error("Only one video is allowed per product gallery.");
      return;
    }
    appendGallery({
      public_id: "",
      secure_url: "",
      media_type: type,
      alt_text: title || "",
      ordering: galleryFields.length,
      color_name: "",
      color_hex: "",
      sku: "",
      barcode: "",
      video_thumbnail: "",
      duration_sec: null,
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
          {/* Live preview / Upload area */}
          <div className="space-y-2">
            <MediaPreview
              url={coverUrl}
              mediaType="image"
              altText="Cover image"
              isCover
            />
            {coverPublicId && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  form.setValue("cover_image_public_id", "");
                  form.setValue("cover_image_url", "");
                }}
                className="w-full text-zinc-400 hover:text-red-500 text-xs py-1 h-7 rounded-lg hover:bg-red-50"
              >
                Remove cover image
              </Button>
            )}
          </div>

          {/* Fields */}
          <div className="space-y-4">
            {!coverPublicId ? (
              <UploadProgressArea
                isUploading={coverUploading}
                progress={coverProgress}
                error={coverError}
                mediaType="image"
                onSelectFile={handleCoverUpload}
              />
            ) : (
              <div className="rounded-xl border border-zinc-200 bg-white p-4 space-y-4 shadow-sm animate-in fade-in duration-200">
                <div className="flex items-center gap-2 text-[#01454A] font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4 text-[#01454A]" />
                  Cover image uploaded successfully
                </div>
                <div className="text-[10px] text-zinc-400 font-mono select-all truncate">
                  Cloudinary ID: {coverPublicId}
                </div>

                {/* Cover variant mappings */}
                <div className="rounded-xl border border-[#ECE6D6] bg-[#FAFAF8] p-3.5 space-y-3.5">
                  <p className="text-[10px] font-bold uppercase text-zinc-400 tracking-widest">
                    Variant Mapping
                  </p>
                  <div className="grid grid-cols-1 gap-4">
                    {/* Swatch picker */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase text-zinc-500 tracking-wide">
                        Colour Link
                      </label>
                      <SingleColorSwatchPicker
                        value={
                          coverColorName && coverColorHex
                            ? { color_name: coverColorName, color_hex: coverColorHex }
                            : null
                        }
                        placeholder="Link to a colour…"
                        onChange={(color) => {
                          form.setValue("cover_image_color_name", color?.color_name ?? "", { shouldValidate: true });
                          form.setValue("cover_image_color_hex", color?.color_hex ?? "", { shouldValidate: true });
                        }}
                      />
                    </div>

                  </div>
                </div>
              </div>
            )}

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
        subtitle="Use one cover image plus up to 3 gallery items. One optional video is allowed per product."
        badge={
          <Badge
            variant="secondary"
            className="bg-[#E8F3F1] text-[#01454A] border border-[#01454A]/20 text-xs"
          >
            {galleryFields.length} / {MAX_GALLERY_ITEMS}
          </Badge>
        }
      >
        {/* Add buttons */}
        <div className="flex items-center gap-3 flex-wrap">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!canAddGalleryItem}
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
            disabled={!canAddVideo}
            onClick={() => addGalleryItem("video")}
            className="border-[#FDA600] text-[#7A5500] hover:bg-[#FFF6E3] rounded-xl"
          >
            <VideoIcon className="w-4 h-4 mr-1.5" />
            Add Video
          </Button>
          <p className="text-xs text-zinc-400 ml-auto">
            Maximum 3 gallery items and 1 video allowed.
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
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {galleryFields.map((galleryField, idx) => {
              const mediaType: MediaType =
                (form.watch(`gallery.${idx}.media_type`) as MediaType) ?? "image";
              const secureUrl = form.watch(`gallery.${idx}.secure_url`) ?? "";
              const publicId = form.watch(`gallery.${idx}.public_id`) ?? "";
              const colorName = form.watch(`gallery.${idx}.color_name`) ?? "";
              const colorHex = form.watch(`gallery.${idx}.color_hex`) ?? "";

              const currentColor: SelectedColor | null =
                colorName && colorHex
                  ? { color_name: colorName, color_hex: colorHex }
                  : null;

              const uploadState = galleryUploads[idx] || {
                isUploading: false,
                progress: 0,
                error: null,
              };

              return (
                <div
                  key={galleryField.id}
                  className="grid grid-cols-1 gap-4 bg-white border border-zinc-200 rounded-2xl p-4 hover:border-[#D9D9D9] transition-colors"
                >
                  {/* Left: Preview + ordering handle */}
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 mb-1">
                      <GripVertical className="w-4 h-4 text-zinc-300 cursor-grab" />
                      <span className="text-xs font-bold text-zinc-400 uppercase">
                        #{idx + 1}{" "}
                        {mediaType === "video" ? (
                          <VideoIcon className="w-3 h-3 inline ml-1" />
                        ) : (
                          <ImageIcon className="w-3 h-3 inline ml-1" />
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

                  {/* Right: upload / mappings */}
                  <div className="space-y-3">
                    {!publicId ? (
                      <UploadProgressArea
                        isUploading={uploadState.isUploading}
                        progress={uploadState.progress}
                        error={uploadState.error}
                        mediaType={mediaType}
                        onSelectFile={(e) => handleGalleryUpload(idx, mediaType, e)}
                      />
                    ) : (
                      <div className="rounded-xl border border-zinc-100 bg-white p-3 space-y-3.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-[#01454A] font-bold text-xs">
                            <CheckCircle2 className="w-4 h-4 text-[#01454A]" />
                            Uploaded successfully
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              form.setValue(`gallery.${idx}.public_id`, "");
                              form.setValue(`gallery.${idx}.secure_url`, "");
                            }}
                            className="text-[10px] text-zinc-400 hover:text-red-500 h-6 px-2"
                          >
                            Replace File
                          </Button>
                        </div>
                        <div className="text-[9px] text-zinc-400 font-mono truncate select-all">
                          ID: {publicId}
                        </div>

                        {/* Mappings */}
                        <div className="rounded-xl border border-[#ECE6D6] bg-[#FAFAF8] p-3 space-y-3">
                          <p className="text-[10px] font-bold uppercase text-zinc-400 tracking-widest">
                            Variant Mapping
                          </p>

                          <div className="grid grid-cols-1 gap-3">
                            {/* Color Link */}
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-bold uppercase text-zinc-500 tracking-wide">
                                Colour Link
                              </label>
                              <SingleColorSwatchPicker
                                value={currentColor}
                                placeholder="Link to a colour…"
                                onChange={(color) => {
                                  form.setValue(`gallery.${idx}.color_name`, color?.color_name ?? "", { shouldValidate: true });
                                  form.setValue(`gallery.${idx}.color_hex`, color?.color_hex ?? "", { shouldValidate: true });
                                }}
                              />
                            </div>

                          </div>
                          {mediaType === "video" && (
                            <FormField
                              control={form.control}
                              name={`gallery.${idx}.duration_sec`}
                              render={({ field }) => (
                                <FormItem className="space-y-1.5">
                                  <FormLabel className="text-[10px] font-bold uppercase text-zinc-500 tracking-wide">
                                    Video Duration (seconds)
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      min={0}
                                      value={field.value ?? ""}
                                      onChange={(event) => {
                                        const value = event.target.value;
                                        field.onChange(value === "" ? null : Number(value));
                                      }}
                                      placeholder="Optional video length"
                                      className="h-8 rounded-lg border-[#D9D9D9] bg-white text-xs focus-visible:ring-[#01454A]"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          )}
                        </div>
                      </div>
                    )}
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
