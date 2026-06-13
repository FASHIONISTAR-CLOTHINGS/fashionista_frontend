"use client";

/**
 * @file Step3Gallery.tsx
 * @description Step 3 — Cover Image + Gallery Media (Two-Phase Cloudinary Upload)
 *
 * Layout:
 *   ┌─────────────────────────────────────────────────┐
 *   │  SECTION 1 — PRIMARY COVER IMAGE               │
 *   │  (Single image → Product.image field)           │
 *   ├─────────────────────────────────────────────────┤
 *   │  SECTION 2 — GALLERY MEDIA                     │
 *   │  (Up to 12 images/videos → ProductGalleryMedia) │
 *   └─────────────────────────────────────────────────┘
 *
 * Upload flow (both sections):
 *   1. getPresignedToken()   → POST /v1/upload/presign/  (JWT-authenticated)
 *   2. uploadToCloudinary()  → Upload directly to Cloudinary (presigned, secure)
 *   3. Store public_id + secure_url in React Hook Form state
 *   4. On final form submit, backend receives public_ids and creates DB records
 */

import { useCallback, useRef, useState } from "react";
import { useFormContext } from "react-hook-form";
import type { ProductBuilderFormValues, GalleryItem } from "../schemas/builder.schemas";
import { FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
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
} from "lucide-react";
import {
  getPresignedToken,
  uploadToCloudinary,
} from "@/features/uploads/services/upload.service";

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

interface UploadState {
  /** Client-generated temp ID for matching during upload. */
  tempId: string;
  progress: number;
  error: string | null;
  done: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

const MAX_GALLERY = 12;
const ACCEPTED_IMAGES = "image/jpeg,image/png,image/webp,image/avif";
const ACCEPTED_MEDIA = "image/jpeg,image/png,image/webp,image/avif,video/mp4,video/quicktime";

// ─────────────────────────────────────────────────────────────────────────────
// UPLOAD PROGRESS RING (for cover image)
// ─────────────────────────────────────────────────────────────────────────────

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

export function Step3Gallery() {
  const form = useFormContext<ProductBuilderFormValues>();
  const gallery = form.watch("gallery") ?? [];
  const coverPublicId = form.watch("cover_image_public_id");
  const coverImageUrl = form.watch("cover_image_url");

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
        const presigned = await getPresignedToken(
          "product_image",
          "image",
        );
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

  // ── GALLERY ITEM ACTIONS ──────────────────────────────────────────────────

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

  // ── Derived state ─────────────────────────────────────────────────────────

  const activeGalleryUploads = Object.values(galleryUploads).filter((u) => !u.done);
  const galleryErrors = Object.values(galleryUploads).filter((u) => u.error);
  const hasCover = !!coverPublicId;
  const coverUploading = coverUpload && !coverUpload.done;

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-8">

      {/* ══════════════════════════════════════════════════════════════════
          SECTION 1 — PRIMARY COVER IMAGE
      ══════════════════════════════════════════════════════════════════ */}
      <div className="rounded-2xl border-2 border-[#E9E0CC] bg-white overflow-hidden shadow-sm">
        {/* Section header */}
        <div className="flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-[#FDF8EE] to-white border-b border-[#E9E0CC]">
          <div className="w-8 h-8 rounded-lg bg-[#FDA600]/15 flex items-center justify-center">
            <Crown className="w-4 h-4 text-[#FDA600]" />
          </div>
          <div>
            <p className="text-sm font-bold text-[#1A1208]">Primary Cover Image</p>
            <p className="text-xs text-[#7A6B44]">
              This is the main image shown on product listings and the product page. Required.
            </p>
          </div>
          {hasCover && (
            <Badge className="ml-auto bg-emerald-500/15 text-emerald-700 border-0 text-xs font-semibold">
              <CheckCircle2 className="w-3 h-3 mr-1" /> Set
            </Badge>
          )}
        </div>

        <div className="p-6">
          {/* Preview or Drop Zone */}
          {hasCover && coverImageUrl ? (
            /* ── Cover Preview ── */
            <div className="relative group rounded-xl overflow-hidden border-2 border-[#FDA600]/40 ring-2 ring-[#FDA600]/15 shadow-md max-w-sm mx-auto">
              <FashionistarImage
                publicId={coverPublicId}
                src={coverImageUrl}
                alt="Primary cover image"
                transformation="product_detail"
                aspectRatio="4:3"
                className="w-full"
                imgClassName="w-full h-full object-cover"
              />
              {/* Overlay actions */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => coverInputRef.current?.click()}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/90 hover:bg-white text-[#1A1208] text-sm font-semibold shadow transition-all"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Replace
                </button>
                <button
                  type="button"
                  onClick={clearCover}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-red-500/80 hover:bg-red-500 text-white text-sm font-semibold shadow transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Remove
                </button>
              </div>
              {/* Crown badge */}
              <div className="absolute top-2 left-2">
                <Badge className="bg-[#FDA600] text-black text-[10px] px-2 py-0.5 h-auto font-bold shadow">
                  <Crown className="w-2.5 h-2.5 mr-1" /> Cover
                </Badge>
              </div>
            </div>
          ) : coverUploading ? (
            /* ── Upload in progress ── */
            <div className="flex flex-col items-center justify-center min-h-[180px] gap-4 rounded-xl border-2 border-dashed border-[#FDA600]/40 bg-[#FDF8EE]">
              <div className="relative">
                <ProgressRing progress={coverUpload.progress} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-bold text-[#FDA600]">{coverUpload.progress}%</span>
                </div>
              </div>
              <p className="text-sm text-[#7A6B44] font-medium">Uploading cover image…</p>
            </div>
          ) : (
            /* ── Drop Zone ── */
            <div
              onDrop={onCoverDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => coverInputRef.current?.click()}
              className={cn(
                "relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed cursor-pointer group",
                "border-[#D9D9D9] hover:border-[#FDA600]/60 bg-[#FAFAF8] hover:bg-[#FDF8EE]",
                "transition-all duration-200 p-10 min-h-[180px]",
                coverUpload?.error && "border-red-400 bg-red-50",
              )}
            >
              <div className="flex flex-col items-center gap-3 pointer-events-none">
                <div className="w-14 h-14 rounded-2xl bg-[#FDA600]/10 border border-[#FDA600]/20 flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                  <Upload className="w-6 h-6 text-[#FDA600]" />
                </div>
                <div className="text-center">
                  <p className="text-[#1A1208] font-semibold text-sm">
                    Click or drag your cover photo here
                  </p>
                  <p className="text-zinc-500 text-xs mt-1">
                    JPEG, PNG, WebP, AVIF · Single image · Recommended 800×600px or larger
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Cover error */}
          {coverUpload?.error && (
            <div className="mt-3 flex items-center gap-2 text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {coverUpload.error}
            </div>
          )}

          {/* Hidden file input */}
          <input
            ref={coverInputRef}
            type="file"
            accept={ACCEPTED_IMAGES}
            className="hidden"
            onChange={onCoverInputChange}
          />
        </div>
      </div>

      {/* Form validation error for cover */}
      <FormField
        control={form.control}
        name="cover_image_public_id"
        render={() => (
          <FormItem className="-mt-6">
            <FormMessage />
          </FormItem>
        )}
      />

      {/* ══════════════════════════════════════════════════════════════════
          SECTION 2 — GALLERY MEDIA
      ══════════════════════════════════════════════════════════════════ */}
      <div className="rounded-2xl border-2 border-[#E9E0CC] bg-white overflow-hidden shadow-sm">
        {/* Section header */}
        <div className="flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-[#F0F5F5] to-white border-b border-[#E9E0CC]">
          <div className="w-8 h-8 rounded-lg bg-[#01454A]/10 flex items-center justify-center">
            <Images className="w-4 h-4 text-[#01454A]" />
          </div>
          <div>
            <p className="text-sm font-bold text-[#1A1208]">Gallery Media</p>
            <p className="text-xs text-[#7A6B44]">
              Add up to {MAX_GALLERY} extra photos or a short product video. Buyers can swipe through these on the product page.
            </p>
          </div>
          <Badge className="ml-auto bg-[#01454A]/10 text-[#01454A] border-0 text-xs font-semibold">
            {gallery.length}/{MAX_GALLERY}
          </Badge>
        </div>

        <div className="p-6 space-y-5">

          {/* Drop zone — only if not at limit */}
          {gallery.length < MAX_GALLERY && (
            <div
              onDrop={onGalleryDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => galleryInputRef.current?.click()}
              className={cn(
                "relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed cursor-pointer group",
                "border-[#C9D9DA] hover:border-[#01454A]/50 bg-[#F7FAFA] hover:bg-[#EFF5F5]",
                "transition-all duration-200 p-8 min-h-[140px]",
              )}
            >
              <div className="flex flex-col items-center gap-3 pointer-events-none">
                <div className="flex gap-2">
                  <div className="w-10 h-10 rounded-xl bg-[#01454A]/10 border border-[#01454A]/20 flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                    <ImagePlus className="w-5 h-5 text-[#01454A]" />
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-[#01454A]/10 border border-[#01454A]/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Video className="w-5 h-5 text-[#01454A]" />
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-[#1A1208] font-semibold text-sm">
                    Click or drag photos &amp; videos here
                  </p>
                  <p className="text-zinc-500 text-xs mt-1">
                    JPEG, PNG, WebP, AVIF, MP4 · Max {MAX_GALLERY} items · {gallery.length}/{MAX_GALLERY} used
                  </p>
                </div>
              </div>
              <input
                ref={galleryInputRef}
                type="file"
                multiple
                accept={ACCEPTED_MEDIA}
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={onGalleryInputChange}
              />
            </div>
          )}

          {/* Active upload progress bars */}
          {activeGalleryUploads.length > 0 && (
            <div className="space-y-2.5 rounded-xl bg-[#F7FAFA] border border-[#C9D9DA] p-4">
              <p className="text-xs font-semibold text-[#01454A] mb-2">Uploading…</p>
              {activeGalleryUploads.map((u) => (
                <div key={u.tempId} className="flex items-center gap-3">
                  <Loader2 className="w-4 h-4 animate-spin text-[#01454A] flex-shrink-0" />
                  <Progress value={u.progress} className="flex-1 h-1.5 bg-zinc-100" />
                  <span className="text-xs font-medium text-[#01454A] w-9 text-right tabular-nums">
                    {u.progress}%
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Upload errors */}
          {galleryErrors.length > 0 && (
            <div className="space-y-1.5">
              {galleryErrors.map((u) => (
                <div
                  key={u.tempId}
                  className="flex items-center gap-2 text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2"
                >
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {u.error}
                </div>
              ))}
            </div>
          )}

          {/* Gallery grid */}
          {gallery.length > 0 && (
            <div>
              <p className="text-xs text-zinc-400 mb-3">
                ✦ Drag cards to reorder · ⭐ Star to make a photo the cover · First card = display order 1
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {gallery.map((item, idx) => {
                  const isCover = item.public_id === coverPublicId;
                  return (
                    <div
                      key={item.public_id}
                      draggable
                      onDragStart={() => onDragStart(idx)}
                      onDragOver={(e) => onDragOver(e, idx)}
                      className={cn(
                        "relative group rounded-xl overflow-hidden border-2 transition-all duration-200 aspect-square cursor-grab active:cursor-grabbing",
                        isCover
                          ? "border-[#FDA600] ring-2 ring-[#FDA600]/30 shadow-md"
                          : "border-[#D9D9D9] hover:border-[#01454A]/40 hover:shadow-sm",
                      )}
                    >
                      {/* Thumbnail */}
                      {item.media_type === "video" ? (
                        <FashionistarVideo
                          src={item.secure_url}
                          publicId={item.public_id}
                          ariaLabel={item.alt_text ?? "Product gallery video"}
                          showControls={false}
                          muted
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <FashionistarImage
                          publicId={item.public_id}
                          src={item.secure_url}
                          alt={item.alt_text ?? "Gallery item"}
                          transformation="thumbnail"
                          aspectRatio="1"
                          className="w-full h-full rounded-none"
                          imgClassName="w-full h-full object-cover"
                        />
                      )}

                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-black/55 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        {item.media_type === "image" && !isCover && (
                          <button
                            type="button"
                            onClick={() => setCoverFromGallery(item)}
                            className="p-2 rounded-full bg-[#FDA600]/90 hover:bg-[#FDA600] text-black shadow transition-all hover:scale-110"
                            title="Set as cover image"
                          >
                            <Star className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => removeGalleryItem(idx)}
                          className="p-2 rounded-full bg-red-500/80 hover:bg-red-500 text-white shadow transition-all hover:scale-110"
                          title="Remove"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <span className="p-2 rounded-full bg-black/40 text-white/70">
                          <GripVertical className="w-3.5 h-3.5" />
                        </span>
                      </div>

                      {/* Type + Cover badges */}
                      <div className="absolute top-1.5 left-1.5 flex flex-col gap-1">
                        {isCover && (
                          <Badge className="bg-[#FDA600] text-black text-[9px] px-1.5 py-0.5 h-auto font-bold shadow">
                            Cover
                          </Badge>
                        )}
                        {item.media_type === "video" && (
                          <Badge className="bg-zinc-800/90 text-white/80 text-[9px] px-1.5 py-0.5 h-auto">
                            Video
                          </Badge>
                        )}
                      </div>

                      {/* Order number */}
                      <div className="absolute bottom-1.5 right-1.5 w-5 h-5 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-[10px] font-bold text-white/80">
                        {idx + 1}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Empty gallery hint */}
          {gallery.length === 0 && activeGalleryUploads.length === 0 && (
            <div className="text-center py-4">
              <p className="text-xs text-zinc-400">
                No gallery media yet — upload images or a short video above to showcase your product.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
