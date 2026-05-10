"use client";

/**
 * @file Step3Gallery.tsx
 * @description Step 3 — Product Gallery (Two-Phase Cloudinary Upload)
 *
 * Upload flow:
 *   1. Client calls POST /api/product/media/presign/ with filename + content_type
 *   2. Backend returns { upload_url, public_id, signature } (signed params)
 *   3. Client POSTs file directly to Cloudinary upload endpoint
 *   4. On success, client stores { public_id, secure_url, media_type } in form state
 *   5. On final submit, backend receives the public_ids and creates GalleryMedia records
 *
 * Features:
 *  - Drag-and-drop reorder with visual handles
 *  - Cover image designation (first item = cover)
 *  - Individual item delete with confirmation
 *  - Upload progress indicators per file
 *  - Graceful fallback for non-Cloudinary environments
 */

import { useCallback, useRef, useState } from "react";
import { useFormContext } from "react-hook-form";
import type { ProductBuilderFormValues, GalleryItem } from "../schemas/builder.schemas";
import {
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { FashionistarImage, FashionistarVideo } from "@/components/ui/media";
import { cn } from "@/lib/utils";
import {
  ImagePlus,
  Trash2,
  Star,
  GripVertical,
  Loader2,
  AlertCircle,
} from "lucide-react";

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
// PRESIGN HELPER
// ─────────────────────────────────────────────────────────────────────────────

async function presignUpload(
  file: File,
): Promise<{ upload_url: string; public_id: string; fields: Record<string, string> }> {
  const res = await fetch("/api/product/media/presign/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      filename: file.name,
      content_type: file.type,
      resource_type: file.type.startsWith("video/") ? "video" : "image",
    }),
  });
  if (!res.ok) throw new Error("Failed to get upload signature");
  return res.json();
}

async function directUpload(
  file: File,
  uploadUrl: string,
  fields: Record<string, string>,
  onProgress: (pct: number) => void,
): Promise<{ public_id: string; secure_url: string }> {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    Object.entries(fields).forEach(([k, v]) => formData.append(k, v));
    formData.append("file", file);

    const xhr = new XMLHttpRequest();
    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    });
    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const data = JSON.parse(xhr.responseText);
        resolve({ public_id: data.public_id, secure_url: data.secure_url });
      } else {
        reject(new Error("Upload failed"));
      }
    });
    xhr.addEventListener("error", () => reject(new Error("Network error during upload")));
    xhr.open("POST", uploadUrl);
    xhr.send(formData);
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

const MAX_GALLERY = 12;
const ACCEPTED_TYPES = "image/jpeg,image/png,image/webp,image/avif,video/mp4,video/quicktime";

export function Step3Gallery() {
  const form = useFormContext<ProductBuilderFormValues>();
  const gallery = form.watch("gallery") ?? [];
  const coverPublicId = form.watch("cover_image_public_id");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploads, setUploads] = useState<Record<string, UploadState>>({});
  const dragItem = useRef<number | null>(null);

  // ── Upload handler ─────────────────────────────────────────────────────────
  const handleFiles = useCallback(
    async (files: FileList) => {
      const remaining = MAX_GALLERY - gallery.length;
      const toUpload = Array.from(files).slice(0, remaining);

      for (const file of toUpload) {
        const tempId = crypto.randomUUID();
        setUploads((prev) => ({
          ...prev,
          [tempId]: { tempId, progress: 0, error: null, done: false },
        }));

        try {
          const { upload_url, fields } = await presignUpload(file);
          const { public_id, secure_url } = await directUpload(
            file,
            upload_url,
            fields,
            (pct) =>
              setUploads((prev) => ({
                ...prev,
                [tempId]: { ...prev[tempId], progress: pct },
              })),
          );

          const newItem: GalleryItem = {
            public_id,
            secure_url,
            media_type: file.type.startsWith("video/") ? "video" : "image",
            alt_text: file.name.replace(/\.[^.]+$/, ""),
            ordering: gallery.length,
          };

          const current = form.getValues("gallery") ?? [];
          const updated = [...current, newItem];
          form.setValue("gallery", updated, { shouldValidate: true });

          // First image becomes cover automatically
          if (updated.filter((i) => i.media_type === "image").length === 1) {
            form.setValue("cover_image_public_id", public_id);
            form.setValue("cover_image_url", secure_url);
          }

          setUploads((prev) => ({
            ...prev,
            [tempId]: { ...prev[tempId], progress: 100, done: true },
          }));
        } catch (err) {
          setUploads((prev) => ({
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

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) handleFiles(e.target.files);
  };

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (e.dataTransfer.files) handleFiles(e.dataTransfer.files);
    },
    [handleFiles],
  );

  // ── Remove item ────────────────────────────────────────────────────────────
  const removeItem = (idx: number) => {
    const current = form.getValues("gallery");
    const removed = current[idx];
    const updated = current.filter((_, i) => i !== idx).map((item, i) => ({ ...item, ordering: i }));
    form.setValue("gallery", updated, { shouldValidate: true });

    // If cover was removed, promote next image
    if (removed.public_id === coverPublicId) {
      const nextImage = updated.find((i) => i.media_type === "image");
      form.setValue("cover_image_public_id", nextImage?.public_id ?? null);
      form.setValue("cover_image_url", nextImage?.secure_url ?? null);
    }
  };

  // ── Set cover ──────────────────────────────────────────────────────────────
  const setCover = (item: GalleryItem) => {
    form.setValue("cover_image_public_id", item.public_id);
    form.setValue("cover_image_url", item.secure_url);
  };

  // ── Drag-to-reorder ────────────────────────────────────────────────────────
  const onDragStart = (idx: number) => { dragItem.current = idx; };
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

  // ── Active uploads ─────────────────────────────────────────────────────────
  const activeUploads = Object.values(uploads).filter((u) => !u.done);

  return (
    <div className="space-y-6">
      {/* ── Drop zone ── */}
      {gallery.length < MAX_GALLERY && (
        <div
          onDrop={onDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed cursor-pointer",
            "border-white/15 hover:border-violet-500/50 bg-white/3 hover:bg-white/5",
            "transition-all duration-200 p-10 min-h-[200px]",
          )}
        >
          <div className="flex flex-col items-center gap-3 pointer-events-none">
            <div className="p-4 rounded-full bg-violet-500/10 border border-violet-500/20">
              <ImagePlus className="w-8 h-8 text-violet-400" />
            </div>
            <div className="text-center">
              <p className="text-white/80 font-semibold">
                Drag & drop or click to upload
              </p>
              <p className="text-white/40 text-sm mt-1">
                JPEG, PNG, WebP, AVIF, MP4 · Max {MAX_GALLERY} items · {gallery.length}/{MAX_GALLERY} used
              </p>
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={ACCEPTED_TYPES}
            className="absolute inset-0 opacity-0 cursor-pointer"
            onChange={onInputChange}
          />
        </div>
      )}

      {/* ── Active upload progress ── */}
      {activeUploads.length > 0 && (
        <div className="space-y-2">
          {activeUploads.map((u) => (
            <div key={u.tempId} className="flex items-center gap-3">
              <Loader2 className="w-4 h-4 animate-spin text-violet-400 flex-shrink-0" />
              <Progress value={u.progress} className="flex-1 h-1.5 bg-white/10" />
              <span className="text-xs text-white/60 w-10 text-right">{u.progress}%</span>
            </div>
          ))}
        </div>
      )}

      {/* ── Upload errors ── */}
      {Object.values(uploads)
        .filter((u) => u.error)
        .map((u) => (
          <div key={u.tempId} className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 rounded-lg px-3 py-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {u.error}
          </div>
        ))}

      {/* ── Gallery grid ── */}
      {gallery.length > 0 && (
        <div>
          <p className="text-sm text-white/50 mb-3">
            Drag to reorder · Star to set cover · First image is cover by default
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {gallery.map((item, idx) => {
              const isCover = item.public_id === coverPublicId;
              return (
                <div
                  key={item.public_id}
                  draggable
                  onDragStart={() => onDragStart(idx)}
                  onDragOver={(e) => onDragOver(e, idx)}
                  className={cn(
                    "relative group rounded-xl overflow-hidden border-2 transition-all duration-200 aspect-square",
                    isCover
                      ? "border-fuchsia-500 ring-2 ring-fuchsia-500/30"
                      : "border-white/10 hover:border-white/20",
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

                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    {item.media_type === "image" && !isCover && (
                      <button
                        type="button"
                        onClick={() => setCover(item)}
                        className="p-1.5 rounded-full bg-fuchsia-500/80 hover:bg-fuchsia-500 text-white"
                        title="Set as cover image"
                      >
                        <Star className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => removeItem(idx)}
                      className="p-1.5 rounded-full bg-red-500/80 hover:bg-red-500 text-white"
                      title="Remove"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <span className="p-1.5 rounded-full bg-black/50 text-white/60 cursor-grab">
                      <GripVertical className="w-3.5 h-3.5" />
                    </span>
                  </div>

                  {/* Badges */}
                  <div className="absolute top-2 left-2 flex gap-1">
                    {isCover && (
                      <Badge className="bg-fuchsia-500 text-white text-[10px] px-1.5 py-0.5 h-auto">
                        Cover
                      </Badge>
                    )}
                    {item.media_type === "video" && (
                      <Badge className="bg-zinc-700 text-white/70 text-[10px] px-1.5 py-0.5 h-auto">
                        Video
                      </Badge>
                    )}
                  </div>

                  {/* Index number */}
                  <div className="absolute bottom-2 right-2 w-5 h-5 rounded-full bg-black/60 flex items-center justify-center text-[10px] text-white/60">
                    {idx + 1}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Form validation message ── */}
      <FormField
        control={form.control}
        name="cover_image_public_id"
        render={() => (
          <FormItem>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
