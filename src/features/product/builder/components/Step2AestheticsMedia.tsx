"use client";

/**
 * @file Step2AestheticsMedia.tsx
 * @description Step 2 — Cover Image + Gallery Media (Two-Phase Cloudinary Upload) + Fabric Details
 */

import { useCallback, useRef, useState, useMemo } from "react";
import { useFormContext, useFieldArray } from "react-hook-form";
import type { ProductBuilderFormValues, GalleryItem } from "../schemas/builder.schemas";
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
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
import { FashionistarImage, FashionistarVideo } from "@/components/media";
import { cn } from "@/lib/utils";
import {
  ImagePlus,
  Trash2,
  Star,
  GripVertical,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Upload,
  Images,
  Video,
  RefreshCw,
  Crown,
  Plus,
} from "lucide-react";
import {
  getPresignedToken,
  uploadToCloudinary,
} from "@/features/uploads/services/upload.service";

// ─────────────────────────────────────────────────────────────────────────────
// TYPES & CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

interface UploadState {
  tempId: string;
  progress: number;
  error: string | null;
  done: boolean;
}

const MAX_GALLERY = 12;
const ACCEPTED_IMAGES = "image/jpeg,image/png,image/webp,image/avif";
const ACCEPTED_MEDIA = "image/jpeg,image/png,image/webp,image/avif,video/mp4,video/quicktime";

const CARE_INSTRUCTIONS = [
  { value: "machine_wash", label: "Machine Wash" },
  { value: "hand_wash", label: "Hand Wash Only" },
  { value: "dry_clean", label: "Dry Clean Only" },
  { value: "do_not_wash", label: "Do Not Wash" },
];

function ProgressRing({ progress }: { progress: number }) {
  const r = 20;
  const circ = 2 * Math.PI * r;
  const dash = (progress / 100) * circ;
  return (
    <svg className="w-12 h-12 -rotate-90" viewBox="0 0 48 48">
      <circle cx="24" cy="24" r={r} fill="none" stroke="#E9E0CC" strokeWidth="4" />
      <circle
        cx="24"
        cy="24"
        r={r}
        fill="none"
        stroke="#FDA600"
        strokeWidth="4"
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        className="transition-all duration-200"
      />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export function Step2AestheticsMedia() {
  const form = useFormContext<ProductBuilderFormValues>();
  const gallery = form.watch("gallery") ?? [];
  const coverPublicId = form.watch("cover_image_public_id");
  const coverImageUrl = form.watch("cover_image_url");
  const fabricData = form.watch("fabric");

  const [hasFabric, setHasFabric] = useState(!!fabricData);

  // Field array for fabric composition
  const { fields: compositionFields, append: appendComposition, remove: removeComposition } = useFieldArray({
    control: form.control,
    name: "fabric.composition",
  });

  const toggleFabricForm = (checked: boolean) => {
    setHasFabric(checked);
    if (checked) {
      form.setValue("fabric", {
        fabric_type: "",
        composition: [{ material: "", percentage: 100 }],
        care_instructions: "machine_wash",
        care_notes: "",
        is_organic: false,
        is_vegan: false,
        country_of_origin: "",
      }, { shouldValidate: true });
    } else {
      form.setValue("fabric", null, { shouldValidate: true });
    }
  };

  const compositionSum = useMemo(() => {
    if (!fabricData || !fabricData.composition || !Array.isArray(fabricData.composition)) return 0;
    return fabricData.composition.reduce((sum, item) => sum + (Number(item?.percentage) || 0), 0);
  }, [fabricData]);

  // Refs
  const coverInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const dragItem = useRef<number | null>(null);

  // Upload states
  const [coverUpload, setCoverUpload] = useState<UploadState | null>(null);
  const [galleryUploads, setGalleryUploads] = useState<Record<string, UploadState>>({});

  // ── COVER IMAGE UPLOAD ────────────────────────────────────────────────────

  const handleCoverFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) return;
      const tempId = crypto.randomUUID();
      setCoverUpload({ tempId, progress: 0, error: null, done: false });

      try {
        const presigned = await getPresignedToken("product_image", "image");
        const result = await uploadToCloudinary(file, presigned, (evt) => {
          setCoverUpload((prev) =>
            prev ? { ...prev, progress: evt.percentage } : prev,
          );
        });

        form.setValue("cover_image_public_id", result.public_id, {
          shouldValidate: true,
        });
        form.setValue("cover_image_url", result.secure_url);
        setCoverUpload({ tempId, progress: 100, error: null, done: true });
      } catch (err) {
        setCoverUpload({
          tempId,
          progress: 0,
          error: (err as Error).message,
          done: true,
        });
      }
    },
    [form],
  );

  const onCoverInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleCoverFile(file);
  };

  const onCoverDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files?.[0];
      if (file) handleCoverFile(file);
    },
    [handleCoverFile],
  );

  const clearCover = () => {
    form.setValue("cover_image_public_id", "");
    form.setValue("cover_image_url", undefined);
    setCoverUpload(null);
    if (coverInputRef.current) coverInputRef.current.value = "";
  };

  // ── GALLERY UPLOAD ────────────────────────────────────────────────────────

  const handleGalleryFiles = useCallback(
    async (files: FileList) => {
      const remaining = MAX_GALLERY - gallery.length;
      const toUpload = Array.from(files).slice(0, remaining);

      for (const file of toUpload) {
        const tempId = crypto.randomUUID();
        const isVideo = file.type.startsWith("video/");
        setGalleryUploads((prev) => ({
          ...prev,
          [tempId]: { tempId, progress: 0, error: null, done: false },
        }));

        try {
          const presigned = await getPresignedToken(
            isVideo ? "product_video" : "product_gallery",
            isVideo ? "video" : "image",
          );
          const result = await uploadToCloudinary(file, presigned, (evt) => {
            setGalleryUploads((prev) => ({
              ...prev,
              [tempId]: { ...prev[tempId], progress: evt.percentage },
            }));
          });

          const newItem: GalleryItem = {
            public_id: result.public_id,
            secure_url: result.secure_url,
            media_type: isVideo ? "video" : "image",
            alt_text: file.name.replace(/\.[^.]+$/, ""),
            ordering: gallery.length,
          };

          const current = form.getValues("gallery") ?? [];
          const updated = [...current, newItem];
          form.setValue("gallery", updated, { shouldValidate: true });

          setGalleryUploads((prev) => ({
            ...prev,
            [tempId]: { ...prev[tempId], progress: 100, done: true },
          }));
        } catch (err) {
          setGalleryUploads((prev) => ({
            ...prev,
            [tempId]: {
              ...prev[tempId],
              error: (err as Error).message,
              done: true,
            },
          }));
        }
      }
    },
    [form, gallery],
  );

  const onGalleryInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) handleGalleryFiles(e.target.files);
  };

  const onGalleryDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (e.dataTransfer.files) handleGalleryFiles(e.dataTransfer.files);
    },
    [handleGalleryFiles],
  );

  const removeGalleryItem = (idx: number) => {
    const current = form.getValues("gallery");
    const updated = current
      .filter((_, i) => i !== idx)
      .map((item, i) => ({ ...item, ordering: i }));
    form.setValue("gallery", updated, { shouldValidate: true });
  };

  const setCoverFromGallery = (item: GalleryItem) => {
    form.setValue("cover_image_public_id", item.public_id);
    form.setValue("cover_image_url", item.secure_url);
  };

  const onDragStart = (idx: number) => {
    dragItem.current = idx;
  };
  const onDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (dragItem.current === null || dragItem.current === idx) return;
    const current = form.getValues("gallery");
    const reordered = [...current];
    const [moved] = reordered.splice(dragItem.current, 1);
    reordered.splice(idx, 0, moved);
    dragItem.current = idx;
    form.setValue(
      "gallery",
      reordered.map((item, i) => ({ ...item, ordering: i })),
    );
  };

  const activeGalleryUploads = Object.values(galleryUploads).filter((u) => !u.done);
  const galleryErrors = Object.values(galleryUploads).filter((u) => u.error);
  const hasCover = !!coverPublicId;
  const coverUploading = coverUpload && !coverUpload.done;

  return (
    <div className="space-y-10">
      {/* ── SECTION 1 — COVER PHOTO ── */}
      <div className="rounded-2xl border border-[#ECE6D6] bg-[#FAFAF8] p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-[#ECE6D6] pb-3">
          <div>
            <h3 className="text-md font-bold text-[#1A1208] flex items-center gap-2">
              <Crown className="w-4 h-4 text-[#FDA600]" /> Cover Image
            </h3>
            <p className="text-xs text-[#7A6B44] mt-0.5">
              The primary display photo on catalogs and detail screens.
            </p>
          </div>
          {hasCover && (
            <Badge className="bg-emerald-500/10 text-emerald-700 border-0 text-xs font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Configured
            </Badge>
          )}
        </div>

        {hasCover && coverImageUrl ? (
          <div className="relative group rounded-xl overflow-hidden border-2 border-[#FDA600]/40 shadow-sm max-w-sm mx-auto">
            <FashionistarImage
              publicId={coverPublicId}
              src={coverImageUrl}
              alt="Primary cover image"
              transformation="product_detail"
              aspectRatio="4:3"
              className="w-full"
              imgClassName="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => coverInputRef.current?.click()}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/90 hover:bg-white text-[#1A1208] text-sm font-semibold transition-all"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Replace
              </button>
              <button
                type="button"
                onClick={clearCover}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-red-500/80 hover:bg-red-500 text-white text-sm font-semibold transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Remove
              </button>
            </div>
          </div>
        ) : coverUploading ? (
          <div className="flex flex-col items-center justify-center min-h-[160px] gap-3 rounded-xl border border-dashed border-[#FDA600]/40 bg-[#FFF6E3]/20">
            <ProgressRing progress={coverUpload.progress} />
            <p className="text-xs text-[#7A6B44] font-semibold">Uploading... {coverUpload.progress}%</p>
          </div>
        ) : (
          <div
            onDrop={onCoverDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => coverInputRef.current?.click()}
            className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#D9D9D9] hover:border-[#FDA600]/60 bg-white hover:bg-[#FFF6E3]/10 cursor-pointer p-8 min-h-[160px] transition-all"
          >
            <Upload className="w-8 h-8 text-[#FDA600] mb-2" />
            <p className="text-[#1A1208] font-bold text-sm">Upload Cover Photo</p>
            <p className="text-zinc-500 text-xs mt-1">JPEG, PNG, WebP or AVIF formats</p>
          </div>
        )}

        <input ref={coverInputRef} type="file" accept={ACCEPTED_IMAGES} className="hidden" onChange={onCoverInputChange} />
      </div>

      {/* ── SECTION 2 — GALLERY ── */}
      <div className="rounded-2xl border border-[#ECE6D6] bg-[#FAFAF8] p-6 space-y-4">
        <div>
          <h3 className="text-md font-bold text-[#1A1208] flex items-center gap-2">
            <Images className="w-4 h-4 text-[#01454A]" /> Gallery Media
          </h3>
          <p className="text-xs text-[#7A6B44] mt-0.5">
            Add up to {MAX_GALLERY} additional product photos or short fabric walkthrough video clips.
          </p>
        </div>

        {gallery.length < MAX_GALLERY && (
          <div
            onDrop={onGalleryDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => galleryInputRef.current?.click()}
            className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#C9D9DA] hover:border-[#01454A]/50 bg-white hover:bg-[#F7FAFA] cursor-pointer p-6 min-h-[120px] transition-all"
          >
            <ImagePlus className="w-7 h-7 text-[#01454A] mb-2" />
            <p className="text-[#1A1208] font-bold text-sm">Add Gallery Photos &amp; Video</p>
            <p className="text-zinc-500 text-xs mt-0.5">Drag multiple files here to upload instantly</p>
            <input ref={galleryInputRef} type="file" multiple accept={ACCEPTED_MEDIA} className="hidden" onChange={onGalleryInputChange} />
          </div>
        )}

        {/* Upload indicators */}
        {activeGalleryUploads.length > 0 && (
          <div className="space-y-2 bg-white rounded-xl p-3 border border-[#C9D9DA]">
            {activeGalleryUploads.map((u) => (
              <div key={u.tempId} className="flex items-center gap-2 text-xs">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#01454A]" />
                <Progress value={u.progress} className="h-1 bg-zinc-100 flex-1" />
                <span className="font-semibold text-[#01454A]">{u.progress}%</span>
              </div>
            ))}
          </div>
        )}

        {/* Gallery media grid */}
        {gallery.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {gallery.map((item, idx) => {
              const isCover = item.public_id === coverPublicId;
              return (
                <div
                  key={item.public_id}
                  draggable
                  onDragStart={() => onDragStart(idx)}
                  onDragOver={(e) => onDragOver(e, idx)}
                  className={cn(
                    "relative group rounded-xl overflow-hidden border transition-all aspect-square cursor-grab active:cursor-grabbing",
                    isCover ? "border-[#FDA600] ring-2 ring-[#FDA600]/25 shadow-sm" : "border-[#D9D9D9] hover:border-[#01454A]/40"
                  )}
                >
                  {item.media_type === "video" ? (
                    <FashionistarVideo
                      src={item.secure_url}
                      publicId={item.public_id}
                      ariaLabel="Gallery video"
                      showControls={false}
                      muted
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <FashionistarImage
                      publicId={item.public_id}
                      src={item.secure_url}
                      alt="Gallery item"
                      transformation="thumbnail"
                      aspectRatio="1"
                      className="w-full h-full"
                      imgClassName="w-full h-full object-cover"
                    />
                  )}

                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    {item.media_type === "image" && !isCover && (
                      <button
                        type="button"
                        onClick={() => setCoverFromGallery(item)}
                        className="p-1.5 rounded-full bg-[#FDA600] text-black transition-all hover:scale-110"
                        title="Set cover"
                      >
                        <Star className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => removeGalleryItem(idx)}
                      className="p-1.5 rounded-full bg-red-600 text-white transition-all hover:scale-110"
                      title="Remove"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <GripVertical className="w-3.5 h-3.5 text-white/70" />
                  </div>
                  <div className="absolute top-1 right-1 bg-black/60 rounded px-1.5 py-0.5 text-[10px] text-white">
                    {idx + 1}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── SECTION 3 — FABRIC SPECIFICS ── */}
      <div className="rounded-2xl border border-[#ECE6D6] bg-[#FAFAF8] p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-[#ECE6D6] pb-3">
          <div>
            <h3 className="text-md font-bold text-[#1A1208]">Fabric &amp; Care Details</h3>
            <p className="text-xs text-[#7A6B44] mt-0.5">
              Providing fabric properties adds a premium, bespoke feel and helps customers understand the material.
            </p>
          </div>
          <Switch
            checked={hasFabric}
            onCheckedChange={toggleFabricForm}
            className="data-[state=checked]:bg-[#01454A]"
          />
        </div>

        {hasFabric && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="fabric.fabric_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#1A1208] font-semibold text-sm">Fabric Type *</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="e.g. Cashmere, Senegalese Cotton, Silk Satin"
                        className="bg-white border border-[#D9D9D9] text-[#1A1208] placeholder:text-[#7A6B44]/50 focus:ring-[#01454A] focus:border-[#01454A] rounded-xl px-4 py-3"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="fabric.country_of_origin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#1A1208] font-semibold text-sm">Country of Origin</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value ?? ""}
                        placeholder="e.g. Nigeria, Senegal, Italy"
                        className="bg-white border border-[#D9D9D9] text-[#1A1208] placeholder:text-[#7A6B44]/50 focus:ring-[#01454A] focus:border-[#01454A] rounded-xl px-4 py-3"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Fabric Composition Array */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <FormLabel className="text-[#1A1208] font-semibold text-sm">Material Composition (%)</FormLabel>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => appendComposition({ material: "", percentage: 0 })}
                  className="text-[#01454A] border-[#01454A]/30 hover:bg-[#F0F5F5] rounded-lg text-xs"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" /> Add Material
                </Button>
              </div>

              <div className="space-y-3 bg-white p-4 border border-[#ECE6D6] rounded-xl">
                {compositionFields.map((field, index) => (
                  <div key={field.id} className="flex gap-4 items-center">
                    <FormField
                      control={form.control}
                      name={`fabric.composition.${index}.material`}
                      render={({ field: matField }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input
                              {...matField}
                              placeholder="e.g. Cotton, Wool, Silk"
                              className="bg-white border border-[#D9D9D9] text-[#1A1208] rounded-xl"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`fabric.composition.${index}.percentage`}
                      render={({ field: pctField }) => (
                        <FormItem className="w-32">
                          <FormControl>
                            <div className="relative">
                              <Input
                                {...pctField}
                                type="number"
                                min="0"
                                max="100"
                                placeholder="100"
                                onChange={(e) => pctField.onChange(parseInt(e.target.value, 10) || 0)}
                                className="bg-white border border-[#D9D9D9] text-[#1A1208] rounded-xl pr-8"
                              />
                              <span className="absolute right-3 top-3 text-xs text-zinc-400">%</span>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {compositionFields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeComposition(index)}
                        className="text-red-500 hover:bg-red-50 hover:text-red-600 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}

                <div className="flex justify-between items-center text-xs mt-2 border-t pt-2 border-dashed">
                  <span className="text-[#7A6B44]">Sum: {compositionSum}%</span>
                  {compositionSum !== 100 && (
                    <span className="text-amber-600 font-semibold">Composition percentages should sum to 100%</span>
                  )}
                </div>
              </div>
            </div>

            {/* Care instructions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="fabric.care_instructions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#1A1208] font-semibold text-sm">Care Instructions</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value ?? "machine_wash"}>
                      <FormControl>
                        <SelectTrigger className="bg-white border border-[#D9D9D9] text-[#1A1208] focus:ring-[#01454A] focus:border-[#01454A] rounded-xl px-4 py-3">
                          <SelectValue placeholder="Care instructions" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-white border border-[#D9D9D9] text-[#1A1208] shadow-lg">
                        {CARE_INSTRUCTIONS.map((opt) => (
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

              <div className="grid grid-cols-2 gap-4 items-center">
                <FormField
                  control={form.control}
                  name="fabric.is_organic"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-xl bg-white border border-[#D9D9D9] px-4 py-2">
                      <FormLabel className="text-[#1A1208] font-semibold text-xs cursor-pointer">Organic</FormLabel>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="data-[state=checked]:bg-[#01454A]"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="fabric.is_vegan"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-xl bg-white border border-[#D9D9D9] px-4 py-2">
                      <FormLabel className="text-[#1A1208] font-semibold text-xs cursor-pointer">Vegan Friendly</FormLabel>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="data-[state=checked]:bg-[#01454A]"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Care Notes */}
            <FormField
              control={form.control}
              name="fabric.care_notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#1A1208] font-semibold text-sm">Special Care Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      value={field.value ?? ""}
                      placeholder="e.g. Iron inside out, avoid direct sunlight when drying, or steam iron only..."
                      className="bg-white border border-[#D9D9D9] text-[#1A1208] placeholder:text-[#7A6B44]/50 focus:ring-[#01454A] focus:border-[#01454A] rounded-xl px-4 py-3"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}
      </div>
    </div>
  );
}
