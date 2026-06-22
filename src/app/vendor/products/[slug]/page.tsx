"use client";

/**
 * @file src/app/vendor/products/[slug]/page.tsx
 * @description Vendor Product Details, Edit, and Soft-Deletion view.
 * Displays all product settings/measurements/fabric fields in a premium brand UI,
 * with edit toggle routing to ProductBuilder.
 */

import { use, useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Package,
  ShoppingBag,
  Ruler,
  Scissors,
  HelpCircle,
  FileText,
  Clock,
  ChevronLeft,
  ChevronRight,
  Video,
} from "lucide-react";

import { useVendorProfile } from "@/features/vendor/hooks/use-vendor-setup";
import {
  useVendorProductDetail,
  useUpdateProduct,
  useDeleteProduct,
  usePublishProduct,
  productKeys,
  ProductBuilder,
  ProductBuilderProvider,
  BuilderErrorBoundary,
  HydrationGuard,
} from "@/features/product";
import type { ProductDetail } from "@/features/product";
import type { ProductBuilderFormValues } from "@/features/product/builder/schemas/builder.schemas";
import { buildProductWritePayload } from "@/features/product/builder/utils/product-builder-payload";
import { FashionistarImage, FashionistarVideo } from "@/components/media";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

function isVideoUrl(url: string | null): boolean {
  if (!url) return false;
  const clean = url.split("?")[0].toLowerCase();
  return clean.endsWith(".mp4") || clean.endsWith(".webm") || clean.endsWith(".mov") || url.includes("/video/upload/");
}

function formatPrice(v: number) {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(v);
}

type VendorDetailMedia = {
  id: string;
  public_id?: string | null;
  media_url: string;
  thumbnail_url?: string | null;
  video_thumbnail_url?: string | null;
  media_type: "image" | "video";
  duration_sec?: number | null;
  alt_text?: string;
  ordering?: number;
  is_primary?: boolean;
  sku?: string;
  barcode?: string;
  color_name?: string;
  color_hex?: string;
  size?: { id?: string; size_label?: string } | null;
};

function mediaUrlOf(item: any): string {
  return item?.media_url || item?.image_url || item?.thumbnail_url || "";
}

function normalizeVendorProductMedia(product?: ProductDetail): VendorDetailMedia[] {
  if (!product) return [];

  const byKey = new Map<string, VendorDetailMedia>();
  const add = (item: any, fallbackUrl?: string | null, forcePrimary = false) => {
    const url = mediaUrlOf(item) || fallbackUrl || "";
    if (!url) return;
    const key = item?.id || url;
    if (byKey.has(key)) {
      const existing = byKey.get(key)!;
      byKey.set(key, {
        ...existing,
        ...item,
        media_url: existing.media_url || url,
        is_primary: existing.is_primary || item?.is_primary || forcePrimary,
      });
      return;
    }
    byKey.set(key, {
      id: String(item?.id || key),
      public_id: item?.public_id ?? null,
      media_url: url,
      thumbnail_url: item?.thumbnail_url ?? null,
      video_thumbnail_url: item?.video_thumbnail_url ?? null,
      media_type: (item?.media_type || (isVideoUrl(url) ? "video" : "image")) as "image" | "video",
      alt_text: item?.alt_text || product.title,
      ordering: Number(item?.ordering ?? byKey.size),
      is_primary: Boolean(item?.is_primary || forcePrimary),
      sku: item?.sku || "",
      barcode: item?.barcode || "",
      color_name: item?.color_name || "",
      color_hex: item?.color_hex || "",
      size: item?.size ?? null,
    });
  };

  const gallery = product.gallery ?? [];
  const variants = product.variants ?? [];
  const primaryRow =
    gallery.find((item) => item.is_primary) ??
    variants.find((item) => item.is_primary) ??
    gallery.find((item) => mediaUrlOf(item)) ??
    variants.find((item) => mediaUrlOf(item));

  add(primaryRow ?? {}, product.cover_image_url || product.image_url, true);
  gallery.forEach((item) => add(item));
  variants.forEach((item) => add(item));

  return [...byKey.values()].sort((a, b) => {
    if (a.is_primary && !b.is_primary) return -1;
    if (!a.is_primary && b.is_primary) return 1;
    return (a.ordering ?? 0) - (b.ordering ?? 0);
  });
}

function ColorMeta({ name, hex }: { name?: string; hex?: string }) {
  if (!name && !hex) return <span className="text-[#7A6B44]/70">No colour link</span>;
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className="h-3.5 w-3.5 rounded-full border border-[#ECE6D6] shadow-inner"
        style={{ backgroundColor: hex || "#F8F5ED" }}
        aria-hidden="true"
      />
      <span>{name || hex}</span>
      {hex && <span className="font-mono text-[9px] text-[#7A6B44]/70">{hex}</span>}
    </span>
  );
}

// Custom Accordion Component to avoid Shadcn accordion dependency compilation issues
function CustomAccordionItem({
  title,
  icon: Icon,
  children,
  defaultOpen = false,
}: {
  title: string;
  icon: any;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="border border-[#ECE6D6] rounded-xl overflow-hidden bg-white shadow-sm transition-all duration-200">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex w-full items-center justify-between px-5 py-4 bg-[#FAFAF8] text-left text-sm font-bold text-[#1A1208] hover:text-[#01454A] transition-colors"
      >
        <span className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-[#FDA600]" />
          {title}
        </span>
        <span className="text-[#7A6B44] text-xs font-semibold">
          {isOpen ? "Hide" : "Show"}
        </span>
      </button>
      {isOpen && (
        <div className="px-5 py-4 border-t border-[#ECE6D6] text-xs leading-relaxed text-[#5A6465] animate-fadeIn">
          {children}
        </div>
      )}
    </div>
  );
}

export default function VendorProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const router = useRouter();
  const qc = useQueryClient();
  
  const { data: vendor } = useVendorProfile();
  const vendorId = vendor?.id ?? "unknown";

  const { data: product, isLoading, isError, error } = useVendorProductDetail(slug);
  const updateMutation = useUpdateProduct(slug);
  const deleteMutation = useDeleteProduct();
  const publishMutation = usePublishProduct(slug);

  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);
  const productMedia = useMemo(() => normalizeVendorProductMedia(product), [product]);
  const activeMedia = productMedia[Math.min(selectedMediaIndex, Math.max(productMedia.length - 1, 0))] ?? null;

  // Auto-redirect if unauthenticated vendor loading
  useEffect(() => {
    if (!isLoading && !isError && product && product.vendor_id !== vendorId) {
      toast.error("Unauthorized to access this catalog product detail.");
      router.push("/vendor/products/catalog");
    }
  }, [product, vendorId, isLoading, isError, router]);

  useEffect(() => {
    setSelectedMediaIndex(0);
  }, [product?.id]);

  useEffect(() => {
    if (selectedMediaIndex >= productMedia.length) {
      setSelectedMediaIndex(Math.max(productMedia.length - 1, 0));
    }
  }, [productMedia.length, selectedMediaIndex]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-[#FDA600] border-t-transparent animate-spin" />
        <p className="text-xs text-[#7A6B44] font-medium">Loading catalog product detail…</p>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="max-w-xl mx-auto mt-12 p-6 rounded-2xl bg-red-50 border border-red-100 text-center">
        <HelpCircle className="mx-auto w-12 h-12 text-red-400 mb-2" />
        <h2 className="text-md font-bold text-red-800">Product Load Error</h2>
        <p className="text-xs text-red-600 mt-1">
          {error instanceof Error ? error.message : "The requested product detail was not found."}
        </p>
        <Link
          href="/vendor/products/catalog"
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#FDA600] px-4 py-2 text-xs font-bold text-black transition hover:bg-[#f28705]"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Catalog
        </Link>
      </div>
    );
  }

  const handleDelete = async () => {
    if (isDeleting) return;
    const confirmDelete = confirm(
      `Are you sure you want to delete "${product.title}"? This will archive the item from your storefront.`
    );
    if (!confirmDelete) return;

    setIsDeleting(true);
    try {
      await deleteMutation.mutateAsync(product.slug);
      void qc.invalidateQueries({ queryKey: productKeys.vendorList() });
      toast.success("Product archived successfully.");
      router.push("/vendor/products/catalog");
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete product.");
      setIsDeleting(false);
    }
  };

  const handlePublish = async () => {
    try {
      await publishMutation.mutateAsync();
      void qc.invalidateQueries({ queryKey: productKeys.detail(slug) });
      toast.success("Product submitted for review.");
    } catch (err: any) {
      toast.error(err?.message || "Failed to submit product.");
    }
  };

  // Convert API detail into matching initial values for ProductBuilder
  const mapProductToFormValues = (p: ProductDetail): Partial<ProductBuilderFormValues> => {
    const category_ids = p.categories?.map((c) => c.id) || [];
    const normalizedMedia = normalizeVendorProductMedia(p);
    const primaryGallery =
      normalizedMedia.find((item) => item.is_primary) ??
      normalizedMedia.find((item) => item.media_type === "image") ??
      normalizedMedia[0] ??
      null;
    const coverUrl = primaryGallery?.media_url || p.cover_image_url || p.image_url || null;

    const gallery = normalizedMedia
      .filter((g) => !g.is_primary && g.media_url)
      .slice(0, 3)
      .map((g) => ({
      // Product detail reads expose the unified gallery row id and media URL.
      // Reusing the row id keeps edit-mode validation stable without requiring
      // a second Cloudinary public-id read field from the backend.
      public_id: g.public_id || g.id || g.media_url || "",
      secure_url: g.media_url || "",
      media_type: g.media_type || "image",
      alt_text: g.alt_text || "",
      ordering: g.ordering || 0,
      color_name: g.color_name || "",
      color_hex: g.color_hex || "",
      size_id: g.size?.id || undefined,
      sku: "",
      barcode: "",
      video_thumbnail: g.video_thumbnail_url || "",
      duration_sec: g.duration_sec ?? null,
    }));

    const faqs = p.faqs?.map((f) => ({
      question: f.question,
      answer: f.answer,
    })) || [];

    return {
      title: p.title,
      description: p.description,
      price: String(p.price),
      old_price: p.old_price ? String(p.old_price) : "",
      currency: p.currency || "NGN",
      stock_qty: p.stock_qty || 1,
      requires_measurement: p.requires_measurement ?? false,
      is_customisable: p.is_customisable ?? false,
      condition: p.condition || "new",
      is_pre_order: p.is_pre_order ?? false,
      pre_order_date: p.pre_order_date || null,
      category_ids,
      
      // Fabric
      fabric_type: p.fabric?.fabric_type || "",
      fabric_care_instructions: (p.fabric?.care_instructions || "machine_wash") as any,
      fabric_is_organic: p.fabric?.is_organic ?? false,
      fabric_is_vegan: p.fabric?.is_vegan ?? false,
      fabric_country_of_origin: p.fabric?.country_of_origin || "",

      // Media
      cover_image_public_id: primaryGallery?.public_id || primaryGallery?.id || coverUrl || "",
      cover_image_url: coverUrl,
      cover_image_color_name: primaryGallery?.color_name || "",
      cover_image_color_hex: primaryGallery?.color_hex || "",
      cover_image_size_id: primaryGallery?.size?.id || null,
      gallery,

      // Shipping profile
      weight_kg: p.shipping_profile?.weight_kg || "",
      length_cm: Number(p.shipping_profile?.length_cm ?? 0),
      width_cm: Number(p.shipping_profile?.width_cm ?? 0),
      height_cm: Number(p.shipping_profile?.height_cm ?? 0),
      dimensions_cm: null,
      is_fragile: p.shipping_profile?.is_fragile ?? false,
      requires_signature: p.shipping_profile?.requires_signature ?? false,
      processing_days: p.shipping_profile?.processing_days ?? 1,
      courier_id: null,

      // FAQs
      faqs,
      publish_intent: p.status === "published" || p.status === "pending" ? "pending" : "draft",
      featured: p.featured ?? false,
      hot_deal: p.hot_deal ?? false,
      age_group: p.age_group || "",
      gender_target: p.gender_target || "",
    };
  };

  const handleEditSubmit = async (values: ProductBuilderFormValues) => {
    try {
      const payload = buildProductWritePayload(values);

      await updateMutation.mutateAsync(payload);
      void qc.invalidateQueries({ queryKey: productKeys.detail(slug) });
      void qc.invalidateQueries({ queryKey: productKeys.vendorDetail(slug) });
      setIsEditing(false);
    } catch {
      // The shared mutation hook owns the visible toast so update failures do
      // not stack duplicate messages in the product studio.
    }
  };

  const initialFormValues = mapProductToFormValues(product);

  return (
    <div className="space-y-6">
      {/* ── Header Navigator ── */}
      <div className="flex items-center justify-between border-b border-[#ECE6D6] pb-4">
        <Link
          href="/vendor/products/catalog"
          className="flex items-center gap-2 text-xs font-bold text-[#7A6B44] hover:text-[#01454A] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Catalog
        </Link>
        <div className="flex gap-2">
          {isEditing ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(false)}
              className="text-[#7A6B44] border-[#ECE6D6] hover:bg-[#F8F5ED]"
            >
              Cancel Edit
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="text-[#01454A] border-[#01454A]/30 hover:bg-[#F0F5F5] gap-1.5"
              >
                <Edit className="w-3.5 h-3.5" /> Edit Product
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={isDeleting}
                onClick={handleDelete}
                className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 gap-1.5"
              >
                {isDeleting ? (
                  <span className="w-3.5 h-3.5 border-2 border-red-600 border-t-transparent animate-spin rounded-full" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5" />
                )}
                Delete
              </Button>
            </>
          )}
        </div>
      </div>

      {isEditing ? (
        <div className="rounded-3xl bg-white border border-[#ECE6D6] p-8 shadow-sm relative overflow-hidden">
          <h2 className="text-xl font-bold text-[#1A1208] mb-6 flex items-center gap-2">
            <Edit className="w-5 h-5 text-[#01454A]" /> Edit Studio: {product.title}
          </h2>
          <ProductBuilderProvider vendorId={vendorId} initialValues={initialFormValues} onSubmit={handleEditSubmit}>
            <BuilderErrorBoundary>
              <HydrationGuard>
                <ProductBuilder />
              </HydrationGuard>
            </BuilderErrorBoundary>
          </ProductBuilderProvider>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ── LEFT COLUMN: Primary Details & Media ── */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-3xl bg-white border border-[#ECE6D6] p-6 shadow-sm space-y-5">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                  <h1 className="text-2xl font-bold text-[#1A1208]">{product.title}</h1>
                  <div className="flex gap-2 items-center mt-1">
                    {(product.variants?.[0]?.sku || (product as any).sku) && (
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#7A6B44]">
                        SKU: {product.variants?.[0]?.sku || (product as any).sku}
                      </span>
                    )}
                    <Badge variant="secondary" className="capitalize text-[10px] py-0.5 px-2">
                      Condition: {product.condition}
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Badge
                    variant="outline"
                    className={`capitalize text-xs py-1 px-3 font-semibold ${
                      product.status === "published"
                        ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                        : product.status === "pending"
                        ? "border-[#FDA600] bg-[#FFFBEB] text-[#B45309]"
                        : "border-[#ECE6D6] bg-[#FAFAF8] text-[#7A6B44]"
                    }`}
                  >
                    {product.status.replace(/_/g, " ")}
                  </Badge>
                  {product.status === "draft" && (
                    <Button
                      size="sm"
                      onClick={handlePublish}
                      className="bg-[#FDA600] hover:bg-[#E8960A] text-black font-semibold text-xs py-1 h-auto"
                    >
                      Publish Item
                    </Button>
                  )}
                </div>
              </div>

              {/* Product Gallery */}
              <div className="space-y-4">
                <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden border border-[#ECE6D6] bg-[#FAFAF8] flex items-center justify-center">
                  {activeMedia ? (
                    <>
                      {activeMedia.media_type === "video" || isVideoUrl(activeMedia.media_url) ? (
                        <FashionistarVideo
                          src={activeMedia.media_url}
                          autoPlay={false}
                          muted={true}
                          showControls={true}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <FashionistarImage
                          src={activeMedia.media_url}
                          alt={activeMedia.alt_text || product.title}
                          fill={true}
                          objectFit="contain"
                          imgClassName="p-2"
                          priority={selectedMediaIndex === 0}
                        />
                      )}

                      {productMedia.length > 1 && (
                        <>
                          <button
                            type="button"
                            aria-label="Previous product media"
                            onClick={() =>
                              setSelectedMediaIndex((index) =>
                                index === 0 ? productMedia.length - 1 : index - 1,
                              )
                            }
                            className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full border border-white/70 bg-white/90 p-2 text-[#01454A] shadow-lg transition hover:bg-[#FDA600] hover:text-black"
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            aria-label="Next product media"
                            onClick={() =>
                              setSelectedMediaIndex((index) =>
                                index === productMedia.length - 1 ? 0 : index + 1,
                              )
                            }
                            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full border border-white/70 bg-white/90 p-2 text-[#01454A] shadow-lg transition hover:bg-[#FDA600] hover:text-black"
                          >
                            <ChevronRight className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-[#7A6B44]/40">
                      <ShoppingBag className="w-12 h-12" />
                      <span className="text-xs">No cover media uploaded</span>
                    </div>
                  )}
                </div>

                {activeMedia && (
                  <div className="rounded-2xl border border-[#ECE6D6] bg-[#F8F5ED]/70 p-4">
                    <div className="grid grid-cols-1 gap-3 text-xs sm:grid-cols-3">
                      <div>
                        <span className="block text-[10px] font-extrabold uppercase tracking-widest text-[#7A6B44]/70">
                          Size
                        </span>
                        <span className="font-bold text-[#1A1208]">
                          {activeMedia.size?.size_label || "Standard Size"}
                        </span>
                      </div>
                      <div>
                        <span className="block text-[10px] font-extrabold uppercase tracking-widest text-[#7A6B44]/70">
                          Colour
                        </span>
                        <span className="font-bold text-[#1A1208]">
                          <ColorMeta name={activeMedia.color_name} hex={activeMedia.color_hex} />
                        </span>
                      </div>
                      <div>
                        <span className="block text-[10px] font-extrabold uppercase tracking-widest text-[#7A6B44]/70">
                          SKU
                        </span>
                        <span className="font-mono font-bold text-[#01454A]">
                          {activeMedia.sku || "Not assigned"}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {productMedia.length > 1 && (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {productMedia.map((item, index) => (
                      <button
                        key={`${item.id}-${item.media_url}`}
                        type="button"
                        onClick={() => setSelectedMediaIndex(index)}
                        className={`group overflow-hidden rounded-2xl border bg-white text-left transition ${
                          selectedMediaIndex === index
                            ? "border-[#FDA600] shadow-lg shadow-[#FDA600]/20"
                            : "border-[#ECE6D6] hover:border-[#01454A]/40"
                        }`}
                      >
                        <div className="relative aspect-[4/3] bg-[#FAFAF8]">
                          {item.media_type === "video" || isVideoUrl(item.media_url) ? (
                            <div className="flex h-full items-center justify-center bg-black text-white">
                              <Video className="h-6 w-6 opacity-80" />
                            </div>
                          ) : (
                            <FashionistarImage
                              src={item.thumbnail_url || item.media_url}
                              alt={item.alt_text || product.title}
                              fill={true}
                              objectFit="cover"
                              transformation="thumbnail"
                            />
                          )}
                        </div>
                        <div className="space-y-1 p-2 text-[10px]">
                          <div className="font-bold text-[#1A1208]">
                            {item.is_primary ? "Cover media" : `Gallery ${index + 1}`}
                          </div>
                          <div className="truncate text-[#7A6B44]">
                            <ColorMeta name={item.color_name} hex={item.color_hex} />
                          </div>
                          <div className="truncate font-mono text-[#01454A]">
                            {item.sku || item.size?.size_label || "Unmapped variant"}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="pt-2 border-t border-[#ECE6D6]">
                <h3 className="text-sm font-bold text-[#1A1208] mb-2 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-[#01454A]" /> Description
                </h3>
                <p className="text-xs text-[#5A6465] leading-relaxed whitespace-pre-wrap">
                  {product.description || "No description provided."}
                </p>
              </div>
            </div>

            {/* Accordions */}
            <div className="space-y-4">
              {/* Fabric Specs */}
              <CustomAccordionItem title="Fabric & care properties" icon={Scissors} defaultOpen={true}>
                {product.fabric ? (
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {product.fabric.is_organic && (
                        <Badge variant="outline" className="border-emerald-500/30 bg-emerald-50/50 text-emerald-700 text-[10px]">
                          Organic
                        </Badge>
                      )}
                      {product.fabric.is_vegan && (
                        <Badge variant="outline" className="border-green-500/30 bg-green-50/50 text-green-700 text-[10px]">
                          Vegan
                        </Badge>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="font-bold text-[#1A1208] block mb-0.5">Fabric Type</span>
                        <span className="text-muted-foreground">{product.fabric.fabric_type}</span>
                      </div>
                      {product.fabric.country_of_origin && (
                        <div>
                          <span className="font-bold text-[#1A1208] block mb-0.5">Origin</span>
                          <span className="text-muted-foreground">{product.fabric.country_of_origin}</span>
                        </div>
                      )}
                    </div>

                    <div className="border-t border-[#ECE6D6] pt-3 space-y-2">
                      <div>
                        <span className="font-bold text-[#1A1208] block">Care Instructions</span>
                        <span className="text-muted-foreground capitalize">
                          {product.fabric.care_instructions.replace(/_/g, " ")}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground italic">No fabric properties configured for this listing.</p>
                )}
              </CustomAccordionItem>

              {/* Sizing Guides */}
              <CustomAccordionItem title="Size Chart & Measurement Guides" icon={Ruler}>
                {product.measurement_guide && product.measurement_guide.length > 0 ? (
                  <div className="space-y-3">
                    <p className="text-xs text-muted-foreground">
                      Centimeter guidelines defined per size taxonomy for vendor reference:
                    </p>
                    {(() => {
                      const rows = [...product.measurement_guide].sort((a, b) => a.sort_order - b.sort_order);
                      const hasChest = rows.some((r) => r.chest_cm && r.chest_cm !== "0");
                      const hasWaist = rows.some((r) => r.waist_cm && r.waist_cm !== "0");
                      const hasHip = rows.some((r) => r.hip_cm && r.hip_cm !== "0");
                      const hasShoulder = rows.some((r) => r.shoulder_cm && r.shoulder_cm !== "0");
                      const hasSleeve = rows.some((r) => r.sleeve_cm && r.sleeve_cm !== "0");
                      const hasLength = rows.some((r) => r.length_cm && r.length_cm !== "0");
                      const hasInseam = rows.some((r) => r.inseam_cm && r.inseam_cm !== "0");

                      return (
                        <div className="overflow-x-auto rounded-xl border border-[#ECE6D6] bg-card">
                          <table className="w-full min-w-[500px] border-collapse text-left text-[11px]">
                            <thead>
                              <tr className="border-b border-[#ECE6D6] bg-[#FAFAF8] text-[#1A1208] font-bold">
                                <th className="p-2.5">Size Label</th>
                                {hasChest && <th className="p-2.5">Chest</th>}
                                {hasWaist && <th className="p-2.5">Waist</th>}
                                {hasHip && <th className="p-2.5">Hips</th>}
                                {hasShoulder && <th className="p-2.5">Shoulder</th>}
                                {hasSleeve && <th className="p-2.5">Sleeve</th>}
                                {hasLength && <th className="p-2.5">Length</th>}
                                {hasInseam && <th className="p-2.5">Inseam</th>}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-[#ECE6D6] text-[#5A6465]">
                              {rows.map((r, i) => (
                                <tr key={i} className="hover:bg-[#F8F5ED]/30 transition-colors">
                                  <td className="p-2.5 font-bold text-[#1A1208]">{r.size_label}</td>
                                  {hasChest && <td className="p-2.5">{r.chest_cm || "—"}</td>}
                                  {hasWaist && <td className="p-2.5">{r.waist_cm || "—"}</td>}
                                  {hasHip && <td className="p-2.5">{r.hip_cm || "—"}</td>}
                                  {hasShoulder && <td className="p-2.5">{r.shoulder_cm || "—"}</td>}
                                  {hasSleeve && <td className="p-2.5">{r.sleeve_cm || "—"}</td>}
                                  {hasLength && <td className="p-2.5">{r.length_cm || "—"}</td>}
                                  {hasInseam && <td className="p-2.5">{r.inseam_cm || "—"}</td>}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      );
                    })()}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground italic">No measurement guides defined for this listing.</p>
                )}
              </CustomAccordionItem>

              {/* FAQs Accordion */}
              {product.faqs && product.faqs.length > 0 && (
                <CustomAccordionItem title="Frequently Asked Questions" icon={HelpCircle}>
                  <div className="space-y-4">
                    {product.faqs.map((f, i) => (
                      <div key={i} className="pb-3 border-b border-[#ECE6D6]/50 last:border-b-0">
                        <p className="font-bold text-[#1A1208]">Q: {f.question}</p>
                        <p className="mt-1 text-[#5A6465]">A: {f.answer}</p>
                      </div>
                    ))}
                  </div>
                </CustomAccordionItem>
              )}
            </div>
          </div>

          {/* ── RIGHT COLUMN: Pricing, Logistics & Variants ── */}
          <div className="space-y-6">
            {/* Pricing & Stock Card */}
            <div className="rounded-3xl bg-white border border-[#ECE6D6] p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-[#1A1208] flex items-center gap-1.5 border-b border-[#ECE6D6] pb-2">
                <Package className="w-4 h-4 text-[#01454A]" /> Inventory &amp; Pricing
              </h3>

              <div className="space-y-3">
                <div className="flex justify-between items-baseline">
                  <span className="text-xs text-[#7A6B44]">Price</span>
                  <span className="text-lg font-extrabold text-[#01454A]">
                    {formatPrice(parseFloat(product.price))}
                  </span>
                </div>

                {product.old_price && parseFloat(product.old_price) > parseFloat(product.price) && (
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs text-[#7A6B44]">Strike Price</span>
                    <span className="text-sm text-muted-foreground line-through">
                      {formatPrice(parseFloat(product.old_price))}
                    </span>
                  </div>
                )}

                <div className="flex justify-between items-center pt-2 border-t border-[#ECE6D6]/50">
                  <span className="text-xs text-[#7A6B44]">In Stock Status</span>
                  <Badge variant={product.in_stock ? "default" : "destructive"}>
                    {product.in_stock ? "Available" : "Sold Out"}
                  </Badge>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-xs text-[#7A6B44]">Physical Stock</span>
                  <span className="text-xs font-bold text-[#1A1208]">{product.stock_qty} units</span>
                </div>

              </div>
            </div>

            {/* Shipping Profile Card */}
            <div className="rounded-3xl bg-white border border-[#ECE6D6] p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-[#1A1208] flex items-center gap-1.5 border-b border-[#ECE6D6] pb-2">
                <Clock className="w-4 h-4 text-[#01454A]" /> Shipping &amp; Logistics
              </h3>

              {product.shipping_profile ? (
                <div className="space-y-3 text-xs">
                  <div className="grid grid-cols-2 gap-2 pb-2 border-b border-[#ECE6D6]/50">
                    <div>
                      <span className="text-muted-foreground block text-[10px]">Weight</span>
                      <span className="font-bold text-[#1A1208]">{product.shipping_profile.weight_kg} kg</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[10px]">Fragile</span>
                      <span className="font-bold text-[#1A1208]">
                        {product.shipping_profile.is_fragile ? "Yes" : "No"}
                      </span>
                    </div>
                  </div>

                  <div className="pb-2 border-b border-[#ECE6D6]/50">
                    <span className="text-muted-foreground block text-[10px] mb-1">Dimensions (L × W × H)</span>
                    <span className="font-bold text-[#1A1208]">
                      {product.shipping_profile.length_cm} × {product.shipping_profile.width_cm} ×{" "}
                      {product.shipping_profile.height_cm} cm
                    </span>
                  </div>

                  <div className="flex justify-between items-center pb-2 border-b border-[#ECE6D6]/50">
                    <span className="text-[#7A6B44]">Handling Days</span>
                    <span className="font-bold text-[#1A1208]">
                      {product.shipping_profile.processing_days} days
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-[#7A6B44]">Requires Signature</span>
                    <span className="font-bold text-[#1A1208]">
                      {product.shipping_profile.requires_signature ? "Yes" : "No"}
                    </span>
                  </div>

                </div>
              ) : (
                <p className="text-xs text-muted-foreground italic">Using standard system-default shipping rates.</p>
              )}
            </div>

            {/* Variants List Card */}
            {productMedia.length > 0 && (
              <div className="rounded-3xl bg-white border border-[#ECE6D6] p-6 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-[#1A1208] flex items-center gap-1.5 border-b border-[#ECE6D6] pb-2">
                  <Scissors className="w-4 h-4 text-[#01454A]" /> Multi-Variant Options
                </h3>
                <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
                  {productMedia.map((v) => (
                    <div
                      key={v.id}
                      className="flex items-center justify-between p-2.5 rounded-xl border border-[#ECE6D6]/60 bg-[#FAFAF8] text-xs"
                    >
                      <div>
                        <span className="font-bold text-[#1A1208] block">
                          {v.size?.size_label || "Standard Size"}
                        </span>
                        <span className="text-[10px] text-[#7A6B44] block mt-0.5">
                          <ColorMeta name={v.color_name} hex={v.color_hex} />
                        </span>
                        {v.sku && (
                          <span className="text-[9px] text-[#7A6B44]/70 block font-mono">
                            SKU: {v.sku}
                          </span>
                        )}
                      </div>
                      <div className="text-right">
                        {v.barcode && (
                          <span className="text-[10px] text-[#7A6B44] block mt-0.5 font-mono">
                            Barcode: {v.barcode}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
