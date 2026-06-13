"use client";

/**
 * @file Step3MediaAndMapping.tsx
 * @description Step 3 — Cover Image + Gallery Media Uploader with Color Mapping support
 */

import { useCallback, useRef, useState, useMemo } from "react";
import { useFormContext } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { apiAsync } from "@/core/api/client.async";
import type { ProductBuilderFormValues, GalleryItem } from "../schemas/builder.schemas";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FashionistarImage, FashionistarVideo } from "@/components/media";
import { cn } from "@/lib/utils";
import {
  ImagePlus,
  Trash2,
  Star,
  GripVertical,
  Loader2,
  CheckCircle2,
  Upload,
  Images,
  RefreshCw,
  Crown,
  Link,
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

interface ColorOption { id: string; name: string; hex_code: string; }
interface PaginatedEnvelope<T> { results?: T[]; }

const MAX_GALLERY = 12;
const ACCEPTED_IMAGES = "image/jpeg,image/png,image/webp,image/avif";
const ACCEPTED_MEDIA = "image/jpeg,image/png,image/webp,image/avif,video/mp4,video/quicktime";

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

export function Step3MediaAndMapping() {
  const form = useFormContext<ProductBuilderFormValues>();
  const gallery = form.watch("gallery") ?? [];
  const coverPublicId = form.watch("cover_image_public_id");
  const coverImageUrl = form.watch("cover_image_url");

  // Get selected colors from Step 2 to allow mapping
  const selectedColorIds = form.watch("color_ids") ?? [];

  // Fetch colors metadata to get their human-readable names
  const { data: colorsData } = useQuery({
    queryKey: ["product-builder", "colors-lookup"],
    queryFn: async () => {
      const res = await apiAsync.get("product/colors/?page_size=100").json<PaginatedEnvelope<ColorOption>>();
      return res.results ?? [];
    },
    staleTime: 5 * 60_000,
  });

  const activeColors = useMemo(() => {
    if (!colorsData) return [];
    return colorsData.filter((c) => selectedColorIds.includes(c.id));
  }, [colorsData, selectedColorIds]);

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
            color_id: null,
            variant_id: null,
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
  const hasCover = !!coverPublicId;
  const coverUploading = coverUpload && !coverUpload.done;

  return (
    <div className="space-y-10">
      {/* ── COVER PHOTO SECTION ── */}
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

      {/* ── GALLERY MEDIA SECTION ── */}
      <div className="rounded-2xl border border-[#ECE6D6] bg-[#FAFAF8] p-6 space-y-4">
        <div>
          <h3 className="text-md font-bold text-[#1A1208] flex items-center gap-2">
            <Images className="w-4 h-4 text-[#01454A]" /> Gallery Media &amp; Variation Mapping
          </h3>
          <p className="text-xs text-[#7A6B44] mt-0.5">
            Add up to {MAX_GALLERY} additional product photos or short video clips, and link them to specific color variations.
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

        {/* Gallery media list with color mappings */}
        {gallery.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {gallery.map((item, idx) => {
              const isCover = item.public_id === coverPublicId;
              return (
                <div
                  key={item.public_id}
                  draggable
                  onDragStart={() => onDragStart(idx)}
                  onDragOver={(e) => onDragOver(e, idx)}
                  className={cn(
                    "flex flex-col rounded-xl overflow-hidden bg-white border transition-all duration-200 hover:shadow-md",
                    isCover ? "border-[#FDA600] ring-2 ring-[#FDA600]/25" : "border-[#D9D9D9]"
                  )}
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-[4/3] w-full bg-zinc-50 border-b border-[#ECE6D6]">
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
                        aspectRatio="4:3"
                        className="w-full h-full"
                        imgClassName="w-full h-full object-cover"
                      />
                    )}

                    <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
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
                      <GripVertical className="w-3.5 h-3.5 text-white/70 cursor-grab" />
                    </div>

                    <div className="absolute bottom-2 right-2 bg-black/60 rounded px-1.5 py-0.5 text-[10px] text-white">
                      Order: {idx + 1}
                    </div>
                  </div>

                  {/* Variation Link Form Section */}
                  <div className="p-3 space-y-2">
                    <div className="flex items-center gap-1.5 text-[#7A6B44]">
                      <Link className="w-3.5 h-3.5 text-[#01454A]" />
                      <span className="text-xs font-semibold">Associate Variation</span>
                    </div>

                    <Select
                      onValueChange={(val) => {
                        const nextVal = val === "none" ? null : val;
                        form.setValue(`gallery.${idx}.color_id`, nextVal, { shouldValidate: true });
                      }}
                      value={form.watch(`gallery.${idx}.color_id`) || "none"}
                    >
                      <SelectTrigger className="h-8 text-xs border-[#D9D9D9] bg-white rounded-lg">
                        <SelectValue placeholder="Associate Colour" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-[#D9D9D9] text-[#1A1208]">
                        <SelectItem value="none">General / No Colour Link</SelectItem>
                        {activeColors.map((color) => (
                          <SelectItem key={color.id} value={color.id}>
                            <div className="flex items-center gap-2">
                              <span
                                className="w-3.5 h-3.5 rounded-full border border-zinc-200 flex-shrink-0"
                                style={{ backgroundColor: color.hex_code }}
                              />
                              {color.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
