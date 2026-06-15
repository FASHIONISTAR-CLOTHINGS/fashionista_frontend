"use client";

/**
 * @file Step3MediaAndMapping.tsx
 * @description Step 3 — Media Uploads with Direct Cloudinary Integration and Dynamic Size Link Creation
 */

import React, { useState, useRef } from "react";
import { useFormContext, useFieldArray } from "react-hook-form";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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
import { Modal } from "@/components/ui/common";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { fetchVendorMeasurementTemplates, createVendorMeasurementTemplate } from "@/features/product";
import { toast } from "sonner";

// ─────────────────────────────────────────────────────────────────────────────
// TYPES & SCHEMAS
// ─────────────────────────────────────────────────────────────────────────────

type MediaType = "image" | "video";

interface SizingTemplateOption {
  size_id: string;
  label: string;
  templateName: string;
  size_label: string;
}

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
        <video
          src={url}
          className="w-full h-full object-cover"
          muted
          preload="metadata"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <VideoIcon className="w-8 h-8 text-white/80" />
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
// COMPONENT: Step3MediaAndMapping
// ─────────────────────────────────────────────────────────────────────────────

export function Step3MediaAndMapping() {
  const form = useFormContext<ProductBuilderFormValues>();
  const queryClient = useQueryClient();

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

  // ── Sizing guide templates query ───────────────────────────────────────────
  const { data: templates = [], refetch: refetchTemplates } = useQuery({
    queryKey: ["vendor", "measurement-templates"],
    queryFn: fetchVendorMeasurementTemplates,
  });

  const sizeOptions = React.useMemo(() => {
    const options: SizingTemplateOption[] = [];
    templates.forEach((tpl) => {
      (tpl.template_rows || []).forEach((row) => {
        if (row.size_id) {
          options.push({
            size_id: row.size_id,
            label: `${tpl.name} — ${row.size_label}`,
            templateName: tpl.name,
            size_label: row.size_label,
          });
        }
      });
    });
    return options;
  }, [templates]);

  // ── Dialog template creation state ──────────────────────────────────────────
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [targetFieldName, setTargetFieldName] = useState<string | null>(null);
  const [templateName, setTemplateName] = useState("");
  const [sizeLabel, setSizeLabel] = useState<string>("M");
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);

  // Guide values
  const [chest, setChest] = useState("");
  const [waist, setWaist] = useState("");
  const [hip, setHip] = useState("");
  const [length, setLength] = useState("");
  const [shoulder, setShoulder] = useState("");
  const [sleeve, setSleeve] = useState("");
  const [inseam, setInseam] = useState("");
  const [footLength, setFootLength] = useState("");

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

  const updateGalleryUploadState = (idx: number, patch: Partial<{ isUploading: boolean; progress: number; error: string | null }>) => {
    setGalleryUploads((prev) => ({
      ...prev,
      [idx]: {
        isUploading: false,
        progress: 0,
        error: null,
        ...(prev[idx] || {}),
        ...patch,
      },
    }));
  };

  const addGalleryItem = (type: MediaType = "image") => {
    appendGallery({
      public_id: "",
      secure_url: "",
      media_type: type,
      alt_text: title || "",
      ordering: galleryFields.length,
      color_name: "",
      color_hex: "",
      size_id: null,
      sku: "",
    });
  };

  // ── Size Guide Modal Submission ────────────────────────────────────────────
  const handleOpenAddSizeModal = (fieldName: string) => {
    setTargetFieldName(fieldName);
    setTemplateName("");
    setChest("");
    setWaist("");
    setHip("");
    setLength("");
    setShoulder("");
    setSleeve("");
    setInseam("");
    setFootLength("");
    setIsModalOpen(true);
  };

  const handleSaveSizeGuide = async () => {
    if (!templateName.trim()) {
      toast.error("Please enter a template name.");
      return;
    }
    if (!sizeLabel) {
      toast.error("Please select a size label.");
      return;
    }

    setIsSavingTemplate(true);

    try {
      const matchingTemplate = templates.find(
        (t) => t.name.toLowerCase() === templateName.trim().toLowerCase(),
      );

      // Build the new row payload
      const newRow = {
        size_label: sizeLabel,
        chest_cm: chest,
        waist_cm: waist,
        hip_cm: hip,
        length_cm: length,
        shoulder_cm: shoulder,
        sleeve_cm: sleeve,
        inseam_cm: inseam,
        foot_length_cm: footLength,
        sort_order: matchingTemplate ? matchingTemplate.template_rows.length + 1 : 1,
      };

      let finalRows = [newRow];

      if (matchingTemplate) {
        // Retrieve existing rows and filter out the one we are replacing/updating
        const existingRows = (matchingTemplate.template_rows || []).map((r) => ({
          size_label: r.size_label,
          chest_cm: r.chest_cm ?? "",
          waist_cm: r.waist_cm ?? "",
          hip_cm: r.hip_cm ?? "",
          length_cm: r.length_cm ?? "",
          shoulder_cm: r.shoulder_cm ?? "",
          sleeve_cm: r.sleeve_cm ?? "",
          inseam_cm: r.inseam_cm ?? "",
          foot_length_cm: r.foot_length_cm ?? "",
          sort_order: r.sort_order ?? 0,
        }));

        const filtered = existingRows.filter((r) => r.size_label !== sizeLabel);
        finalRows = [...filtered, newRow];
      }

      // Save template to backend
      const savedTemplate = await createVendorMeasurementTemplate({
        name: templateName.trim(),
        description: "Measurement template rows",
        template_rows: finalRows as any,
      });

      toast.success("Size guide template saved.");

      // Refetch from backend so sizeOptions gets updated
      const refetched = await refetchTemplates();

      // Find the saved size_id row
      const savedRows = (refetched.data || []).find(
        (t) => t.name.toLowerCase() === templateName.trim().toLowerCase(),
      )?.template_rows;

      const createdRow = (savedRows || []).find((r) => r.size_label === sizeLabel);

      if (createdRow?.size_id && targetFieldName) {
        form.setValue(targetFieldName as any, createdRow.size_id, { shouldValidate: true });
      }

      setIsModalOpen(false);
    } catch (err: any) {
      console.error("Failed to create size template:", err);
      toast.error(err?.message || "Failed to create measurement template.");
    } finally {
      setIsSavingTemplate(false);
    }
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

                    {/* Size Link */}
                    <FormField
                      control={form.control}
                      name="cover_image_size_id"
                      render={({ field }) => (
                        <FormItem className="space-y-1.5">
                          <FormLabel className="text-[10px] font-bold uppercase text-zinc-500 tracking-wide">
                            Size Link
                          </FormLabel>
                          <div className="flex items-center gap-2">
                            <Select
                              onValueChange={(val) =>
                                field.onChange(val === "__none__" ? null : val)
                              }
                              value={field.value ?? "__none__"}
                            >
                              <FormControl>
                                <SelectTrigger className="h-9 text-xs border-[#D9D9D9] rounded-lg bg-white">
                                  <SelectValue placeholder="No size link" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="rounded-xl">
                                <SelectItem value="__none__" className="text-xs">
                                  — No size link
                                </SelectItem>
                                {sizeOptions.map((opt) => (
                                  <SelectItem
                                    key={opt.size_id}
                                    value={opt.size_id}
                                    className="text-xs"
                                  >
                                    {opt.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={() => handleOpenAddSizeModal("cover_image_size_id")}
                              className="h-9 w-9 flex-shrink-0 border-[#D9D9D9] rounded-lg hover:bg-zinc-50 hover:text-[#01454A]"
                              aria-label="Add new size template"
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
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
            <VideoIcon className="w-4 h-4 mr-1.5" />
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
                  className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-4 bg-white border border-zinc-200 rounded-2xl p-4 hover:border-[#D9D9D9] transition-colors"
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

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

                            {/* Size Link */}
                            <FormField
                              control={form.control}
                              name={`gallery.${idx}.size_id`}
                              render={({ field }) => (
                                <FormItem className="space-y-1.5">
                                  <FormLabel className="text-[10px] font-bold uppercase text-zinc-500 tracking-wide">
                                    Size Link
                                  </FormLabel>
                                  <div className="flex items-center gap-2">
                                    <Select
                                      onValueChange={(val) =>
                                        field.onChange(val === "__none__" ? null : val)
                                      }
                                      value={field.value ?? "__none__"}
                                    >
                                      <FormControl>
                                        <SelectTrigger className="h-8 text-xs border-[#D9D9D9] rounded-lg bg-white">
                                          <SelectValue placeholder="No size link" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent className="rounded-xl">
                                        <SelectItem value="__none__" className="text-xs">
                                          — No size link
                                        </SelectItem>
                                        {sizeOptions.map((opt) => (
                                          <SelectItem
                                            key={opt.size_id}
                                            value={opt.size_id}
                                            className="text-xs"
                                          >
                                            {opt.label}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="icon"
                                      onClick={() => handleOpenAddSizeModal(`gallery.${idx}.size_id`)}
                                      className="h-8 w-8 flex-shrink-0 border-[#D9D9D9] rounded-lg hover:bg-zinc-50 hover:text-[#01454A]"
                                      aria-label="Add new size template"
                                    >
                                      <Plus className="w-3.5 h-3.5" />
                                    </Button>
                                  </div>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
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

      {/* ── SIZE GUIDE MODAL ────────────────────────────────────────────────── */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Measurement Size"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-300">
            Define a sizing guide and measurements for this template. If the template name already exists, the size row will be appended/updated without losing other size rows.
          </p>

          <div className="space-y-3">
            <div>
              <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wide block mb-1">
                Template Name
              </label>
              <Input
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="e.g. Men Senator Fit"
                list="template-names-list"
                className="bg-white/5 border-white/10 text-white rounded-xl h-10 focus-visible:ring-amber-500"
              />
              <datalist id="template-names-list">
                {templates.map((t) => (
                  <option key={t.id} value={t.name} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wide block mb-1">
                Size Label
              </label>
              <Select onValueChange={setSizeLabel} value={sizeLabel}>
                <SelectTrigger className="bg-[#1e293b] border-white/10 text-white rounded-xl h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {["XS", "S", "M", "L", "XL", "XXL", "Custom"].map((lbl) => (
                    <SelectItem key={lbl} value={lbl} className="text-xs">
                      {lbl}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <label className="text-[9px] font-bold uppercase text-slate-400 tracking-wide block mb-0.5">
                  Chest (cm)
                </label>
                <Input
                  value={chest}
                  onChange={(e) => setChest(e.target.value)}
                  placeholder="e.g. 96"
                  className="bg-white/5 border-white/10 text-white rounded-lg h-9 text-xs"
                />
              </div>
              <div>
                <label className="text-[9px] font-bold uppercase text-slate-400 tracking-wide block mb-0.5">
                  Waist (cm)
                </label>
                <Input
                  value={waist}
                  onChange={(e) => setWaist(e.target.value)}
                  placeholder="e.g. 84"
                  className="bg-white/5 border-white/10 text-white rounded-lg h-9 text-xs"
                />
              </div>
              <div>
                <label className="text-[9px] font-bold uppercase text-slate-400 tracking-wide block mb-0.5">
                  Hip (cm)
                </label>
                <Input
                  value={hip}
                  onChange={(e) => setHip(e.target.value)}
                  placeholder="e.g. 102"
                  className="bg-white/5 border-white/10 text-white rounded-lg h-9 text-xs"
                />
              </div>
              <div>
                <label className="text-[9px] font-bold uppercase text-slate-400 tracking-wide block mb-0.5">
                  Length (cm)
                </label>
                <Input
                  value={length}
                  onChange={(e) => setLength(e.target.value)}
                  placeholder="e.g. 78"
                  className="bg-white/5 border-white/10 text-white rounded-lg h-9 text-xs"
                />
              </div>
              <div>
                <label className="text-[9px] font-bold uppercase text-slate-400 tracking-wide block mb-0.5">
                  Shoulder (cm)
                </label>
                <Input
                  value={shoulder}
                  onChange={(e) => setShoulder(e.target.value)}
                  placeholder="e.g. 46"
                  className="bg-white/5 border-white/10 text-white rounded-lg h-9 text-xs"
                />
              </div>
              <div>
                <label className="text-[9px] font-bold uppercase text-slate-400 tracking-wide block mb-0.5">
                  Sleeve (cm)
                </label>
                <Input
                  value={sleeve}
                  onChange={(e) => setSleeve(e.target.value)}
                  placeholder="e.g. 64"
                  className="bg-white/5 border-white/10 text-white rounded-lg h-9 text-xs"
                />
              </div>
              <div>
                <label className="text-[9px] font-bold uppercase text-slate-400 tracking-wide block mb-0.5">
                  Inseam (cm)
                </label>
                <Input
                  value={inseam}
                  onChange={(e) => setInseam(e.target.value)}
                  placeholder="e.g. 80"
                  className="bg-white/5 border-white/10 text-white rounded-lg h-9 text-xs"
                />
              </div>
              <div>
                <label className="text-[9px] font-bold uppercase text-slate-400 tracking-wide block mb-0.5">
                  Foot Length (cm)
                </label>
                <Input
                  value={footLength}
                  onChange={(e) => setFootLength(e.target.value)}
                  placeholder="e.g. 27"
                  className="bg-white/5 border-white/10 text-white rounded-lg h-9 text-xs"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-white/10">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsModalOpen(false)}
              className="text-slate-300 hover:text-white rounded-xl h-10 px-4"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSaveSizeGuide}
              isLoading={isSavingTemplate}
              className="bg-amber-500 hover:bg-amber-400 text-white rounded-xl h-10 px-4"
            >
              Save Template
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
