"use client";

/**
 * @file VisualSearchModal.tsx
 * @description AI-powered visual search modal for the products listing page.
 *
 * Psychological triggers:
 *   - Authority: "AI-powered" search creates trust in results
 *   - Novelty: Visual search is cutting-edge, creates engagement
 *   - Reciprocity: Free service that saves time
 *
 * Flow:
 *   1. User clicks camera icon in search/filter bar
 *   2. Modal opens with file picker + drag-and-drop zone
 *   3. On image select, uploads to backend CLIP embedding endpoint
 *   4. Results display as product grid inside modal
 *   5. User can click through to PDP or refine search
 */

import { useState, useRef, useCallback } from "react";
import { Camera, X, Upload, Search, Loader2 } from "lucide-react";
import { apiAsync } from "@/core/api/client.async";
import { FashionistarImage } from "@/components/media/FashionistarImage";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";

interface VisualSearchResult {
  id: string;
  title: string;
  slug: string;
  price: string;
  currency: string;
  image_url: string | null;
  cloudinary_url: string | null;
  similarity_score: number;
}

interface VisualSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function VisualSearchModal({ isOpen, onClose }: VisualSearchModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [results, setResults] = useState<VisualSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const dropZoneRef = useRef<HTMLDivElement | null>(null);

  const handleFileSelect = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }
    setError(null);
    setSelectedFile(file);
    setResults([]);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleSearch = async () => {
    if (!selectedFile) return;
    setIsSearching(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("image", selectedFile);
      const res = await apiAsync
        .post("catalog/visual-search/", { body: formData })
        .json<{ results: VisualSearchResult[] }>();
      setResults(res.results ?? []);
      if (!res.results?.length) {
        setError("No matching products found. Try a different image.");
      }
    } catch {
      setError("Visual search is temporarily unavailable. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setResults([]);
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={handleClose}
      data-testid="visual-search-modal"
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Camera size={20} className="text-[#01454A]" />
            <h2 className="text-lg font-bold text-foreground">AI Visual Search</h2>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-lg hover:bg-muted transition"
            aria-label="Close visual search"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {!previewUrl ? (
            /* Upload zone */
            <div
              ref={dropZoneRef}
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center justify-center gap-4 border-2 border-dashed border-[#01454A]/30 rounded-2xl py-16 cursor-pointer hover:border-[#01454A] hover:bg-[#01454A]/3 transition-all"
              data-testid="visual-search-dropzone"
            >
              <div className="w-16 h-16 rounded-full bg-[#01454A]/10 flex items-center justify-center">
                <Upload size={28} className="text-[#01454A]" />
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-foreground">Upload an image to find similar products</p>
                <p className="text-xs text-muted-foreground mt-1">Drag & drop or click to browse — JPG, PNG, WEBP</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileInput}
                className="hidden"
              />
            </div>
          ) : (
            /* Preview + search */
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="relative w-32 h-32 rounded-xl overflow-hidden border border-border shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={previewUrl} alt="Search query" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 flex flex-col justify-center gap-3">
                  <p className="text-sm font-semibold text-foreground">{selectedFile?.name}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={handleSearch}
                      disabled={isSearching}
                      className="inline-flex items-center gap-2 rounded-xl bg-[#01454A] text-white px-4 py-2.5 text-sm font-bold hover:bg-[#0a6b72] transition disabled:opacity-60"
                      data-testid="visual-search-submit"
                    >
                      {isSearching ? (
                        <><Loader2 size={16} className="animate-spin" /> Searching...</>
                      ) : (
                        <><Search size={16} /> Find Similar</>
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setSelectedFile(null);
                        setPreviewUrl(null);
                        setResults([]);
                      }}
                      className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-muted transition"
                    >
                      <X size={16} /> Clear
                    </button>
                  </div>
                </div>
              </div>

              {error && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                  {error}
                </div>
              )}

              {/* Results grid */}
              {results.length > 0 && (
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                    {results.length} similar products found
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {results.map((r) => (
                      <Link
                        key={r.id}
                        href={`/products/${r.slug}`}
                        onClick={handleClose}
                        className="group flex flex-col gap-1.5 rounded-xl border border-border overflow-hidden hover:shadow-md transition"
                      >
                        <div className="relative aspect-square bg-muted">
                          {r.cloudinary_url || r.image_url ? (
                            <FashionistarImage
                              src={r.cloudinary_url || r.image_url || ""}
                              alt={r.title}
                              fill
                              sizes="150px"
                              className="object-cover"
                            />
                          ) : null}
                        </div>
                        <div className="p-2">
                          <p className="text-xs font-semibold text-foreground line-clamp-2 leading-snug">{r.title}</p>
                          <p className="text-sm font-bold text-[#FDA600] mt-0.5">
                            {formatCurrency(parseFloat(r.price), r.currency || "NGN")}
                          </p>
                          <p className="text-[10px] text-emerald-600 mt-0.5">
                            {Math.round(r.similarity_score * 100)}% match
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
