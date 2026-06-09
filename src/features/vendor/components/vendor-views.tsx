 "use client";

import { FashionistarImage } from "@/components/media";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import {
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  BarChart3,
  Check,
  ChevronRight,
  Clock,
  CreditCard,
  Globe,
  Instagram,
  Key,
  Landmark,
  MapPin,
  Package,
  PackageCheck,
  Plus,
  RefreshCw,
  Search,
  ShoppingBag,
  ShoppingCart,
  Star,
  Store,
  Tag,
  TrendingUp,
  Twitter,
  Users,
  Wallet,
  Zap,
  X,
  XCircle,
  CheckCircle2,
  Shield,
  Upload,
  FileCheck,
} from "lucide-react";

import { Transactions } from "@/features/account/components";
import { AuthAlert } from "@/components/shared/feedback/AuthAlert";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { parseApiError } from "@/lib/api/parseApiError";
import {
  ProductBuilder,
  ProductBuilderProvider,
  publishProduct,
  useVendorCatalogProducts,
  useUpdateProduct,
  productKeys,
} from "@/features/product";
import type { ProductBuilderFormValues } from "@/features/product";
import {
  useSubmitVendorSetup,
  useVendorDashboard,
  useVendorProfile,
  useVendorSetupState,
} from "@/features/vendor/hooks/use-vendor-setup";
import {
  useVendorAnalyticsSummary,
  useVendorCustomerBehavior,
  useVendorRevenueChart,
} from "@/features/vendor/hooks/use-vendor-analytics";
import {
  useVendorOrders,
  useVendorOrder,
  useUpdateOrderStatus,
  useSetVendorPin,
} from "@/features/vendor/hooks/use-vendor-orders";
import type {
  VendorDashboard,
  VendorSetupPayload,
  VendorOrderStatus,
} from "@/features/vendor/types/vendor.types";
import type { ProductListItem } from "@/features/product";
import { useCatalogCollections } from "@/features/catalog/hooks/use-catalog";
import {
  useNinjaKycStatus,
  useNinjaKycDocuments,
  useInitiateKyc,
  useRecordKycDocument,
} from "@/features/kyc";
import type { KycDocumentType } from "@/features/kyc";
import { BankAccountsList, PayoutGateGuard } from "./bank-accounts";
import { uploadFile } from "@/features/uploads/services/upload.service";

// ── Recharts (installed with shadcn) ─────────────────────────────────────────

import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  useVendorOrderChart,
  useVendorTopCategories,
  useVendorPaymentDistribution,
} from "@/features/vendor/hooks/use-vendor-analytics";
import {
  useVendorTopSellingProducts,
} from "@/features/vendor/hooks/use-vendor-dashboard";
import { useDraftStore } from "@/features/product/builder/store";
import { Button } from "@/shared/ui";
import { Tooltip as UiTooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import {
  AddressReferenceField,
  type AddressSelection,
} from "@/shared/reference-data";



// ── Brand Palette (local) ────────────────────────────────────────────────────
const BV = {
  gold:     "#FDA600",
  goldD:    "#E8960A",
  green:    "#01454A",
  greenM:   "#01454A",
  cream:    "#F8F5ED",
  creamB:   "#ECE6D6",
  muted:    "#7A6B44",
  ink:      "#1A1208",
} as const;

const emptyAddressSelection = (
  city = "",
  state = "",
  country = "Nigeria",
): AddressSelection => ({
  country_code: country === "Nigeria" || country === "NG" ? "NG" : country,
  state_code: state,
  lga_code: "",
  city_code: city,
  custom_city: city,
  street_address: "",
});

const applyAddressSelection = <
  T extends { city: string; state: string; country?: string },
>(
  current: T,
  address: AddressSelection,
): T => ({
  ...current,
  city: address.custom_city || address.city_code || address.lga_code || current.city,
  state: address.state_code || current.state,
  country: address.country_code === "NG" ? "Nigeria" : address.country_code || current.country,
});





// ── Shared primitives ─────────────────────────────────────────────────────────
function Badge({
  children,
  color = "gold",
}: {
  children: React.ReactNode;
  color?: "gold" | "green" | "red" | "blue" | "gray";
}) {
  const map = {
    gold:  "bg-[#FFF6E3] text-[#B37700] border border-[#FDA600]/30",
    green: "bg-[#E6F4F5] text-[#01454A] border border-[#01454A]/20",
    red:   "bg-[#FFF0F0] text-[#8A3030] border border-red-200",
    blue:  "bg-[#EDF4FF] text-[#1A4B8C] border border-blue-200",
    gray:  "bg-[#F5F5F5] text-[#5A6465] border border-[#D9D9D9]",
  };
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${map[color]}`}>
      {children}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const lower = status.toLowerCase();
  if (lower === "fulfilled" || lower === "completed" || lower === "paid" || lower === "published")
    return <Badge color="green">{status}</Badge>;
  if (lower === "pending" || lower === "processing" || lower === "draft")
    return <Badge color="gold">{status}</Badge>;
  if (lower === "cancelled" || lower === "failed" || lower === "disabled")
    return <Badge color="red">{status}</Badge>;
  if (lower === "shipped" || lower === "in-review")
    return <Badge color="blue">{status}</Badge>;
  return <Badge color="gray">{status}</Badge>;
}

// ── Premium KPI Card ──────────────────────────────────────────────────────────
function KpiCard({
  title, value, hint, icon: Icon, trend, accent = "gold",
}: {
  title:   string;
  value:   string;
  hint:    string;
  icon?:   React.ElementType;
  trend?:  number;
  accent?: "gold" | "green" | "blue" | "red";
}) {
  const accentMap = {
    gold:  { bg: "rgba(253,166,0,0.10)",  icon: "#FDA600", orb: "rgba(253,166,0,0.06)"  },
    green: { bg: "rgba(1,69,74,0.08)",   icon: "#01454A", orb: "rgba(1,69,74,0.05)"   },
    blue:  { bg: "rgba(26,75,140,0.08)",  icon: "#1A4B8C", orb: "rgba(26,75,140,0.05)"  },
    red:   { bg: "rgba(220,38,38,0.08)",  icon: "#DC2626", orb: "rgba(220,38,38,0.05)"  },
  };
  const ac = accentMap[accent];
  return (
    <div
      className="group relative overflow-hidden rounded-2xl bg-white border border-[#ECE6D6] p-5 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 hover:border-[#ECE6D6]"
      style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-black uppercase tracking-[0.18em]" style={{ color: BV.muted }}>{title}</p>
          <p className="mt-2.5 text-2xl font-bold leading-none" style={{ color: BV.ink }}>{value}</p>
          <p className="mt-1.5 text-xs leading-5" style={{ color: "#5A6465" }}>{hint}</p>
        </div>
        {Icon && (
          <div
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6"
            style={{ background: ac.bg }}
          >
            <Icon className="h-5 w-5" style={{ color: ac.icon }} />
          </div>
        )}
      </div>
      {trend !== undefined && (
        <div className={`mt-3 flex items-center gap-1.5 text-[11px] font-bold ${trend >= 0 ? "text-[#01454A]" : "text-red-500"}`}>
          <TrendingUp className={`h-3 w-3 ${trend < 0 ? "rotate-180" : ""}`} />
          <span>{trend >= 0 ? "+" : ""}{trend.toFixed(1)}% vs prior period</span>
        </div>
      )}
      {/* Decorative orb */}
      <div
        className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full transition-all duration-500 group-hover:scale-150 group-hover:opacity-70"
        style={{ background: ac.orb }}
      />
      {/* Bottom shimmer on hover */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-0.5 rounded-b-2xl transition-all duration-300 opacity-0 group-hover:opacity-100"
        style={{ background: `linear-gradient(90deg, transparent, ${ac.icon}60, transparent)` }} />
    </div>
  );
}

// ── Premium Page Header ───────────────────────────────────────────────────────
function PageHeader({
  eyebrow, title, description, action,
}: {
  eyebrow?:     string;
  title:        string;
  description?: string;
  action?:      React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        {eyebrow && (
          <div className="mb-2 flex items-center gap-2">
            <div className="h-px w-4 rounded-full" style={{ background: BV.gold }} />
            <p className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: BV.muted }}>{eyebrow}</p>
          </div>
        )}
        <h1 className="font-bon_foyage text-4xl text-[#1A1208] lg:text-5xl">{title}</h1>
        {description && (
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#5A6465]">{description}</p>
        )}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}

function FieldLabel({ htmlFor, children }: { htmlFor?: string; children: React.ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="block text-sm font-semibold text-[#1A1208]">
      {children}
    </label>
  );
}

function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`h-12 w-full rounded-xl border border-[#D9D9D9] bg-white px-4 text-sm text-black placeholder:text-[#BDBDBD] outline-none transition-all focus:border-[#FDA600] focus:ring-2 focus:ring-[#FDA600]/20 ${props.className ?? ""}`}
    />
  );
}

function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`min-h-[140px] w-full rounded-xl border border-[#D9D9D9] bg-white px-4 py-3 text-sm text-black placeholder:text-[#BDBDBD] outline-none transition-all focus:border-[#FDA600] focus:ring-2 focus:ring-[#FDA600]/20 ${props.className ?? ""}`}
    />
  );
}

function PrimaryButton({
  children, loading, disabled, type = "button", onClick,
}: {
  children: React.ReactNode;
  loading?:  boolean;
  disabled?: boolean;
  type?:     "button" | "submit";
  onClick?:  () => void;
}) {
  return (
    <Button asChild>
      <button
        type={type}
        disabled={disabled ?? loading}
        onClick={onClick}
        className="inline-flex items-center gap-2 rounded-xl bg-[#FDA600] px-6 py-3 text-sm font-bold text-black shadow-sm transition-all hover:bg-[#f28705] hover:shadow-md active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 h-auto"
      >
        {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : null}
        {children}
      </button>
    </Button>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function SkeletonCard({ className = "" }: { className?: string }) {
  return (
    <div
      className={`rounded-2xl ${className}`}
      style={{
        background: "linear-gradient(90deg, #F5F3EE 25%, #ECE9E0 50%, #F5F3EE 75%)",
        backgroundSize: "200% 100%",
        animation: "shimmer 1.5s infinite",
      }}
    />
  );
}
// SkeletonCard uses a global keyframe. Add it once via style tag in VendorDashboardView.

function CloudinaryFileUploader({
  id,
  value,
  onChange,
  folder = "vendor_shop",
  placeholder = "Upload image",
  aspectRatio = "square",
}: {
  id: string;
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  placeholder?: string;
  aspectRatio?: "square" | "video";
}) {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("Image file is too large (max 10MB).");
      return;
    }

    setIsUploading(true);
    setProgress(0);
    setError(null);

    try {
      const result = await uploadFile(file, folder, "image", (event) => {
        setProgress(event.percentage);
      });
      onChange(result.secure_url);
    } catch (err: any) {
      console.error("Cloudinary upload error:", err);
      setError(err?.message || "Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (isUploading) return;
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const triggerSelect = () => {
    if (isUploading) return;
    fileInputRef.current?.click();
  };

  const removeFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-1 w-full">
      <input
        type="file"
        id={id}
        ref={fileInputRef}
        onChange={onFileChange}
        accept="image/*"
        className="hidden"
      />

      <div
        onDragOver={onDragOver}
        onDrop={onDrop}
        onClick={triggerSelect}
        className={`group relative flex cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed p-6 transition-all ${
          aspectRatio === "video" ? "aspect-[21/9] w-full" : "aspect-square w-full md:max-w-[200px]"
        } ${
          isUploading
            ? "border-[#FDA600]/40 bg-[#FDA600]/5"
            : error
            ? "border-red-300 bg-red-50/50 hover:border-red-400"
            : value
            ? "border-emerald-300 bg-emerald-50/10 hover:border-[#FDA600]/40"
            : "border-[#D9D9D9] bg-[#FAFAF8] hover:border-[#FDA600]/50 hover:bg-white"
        }`}
      >
        {value ? (
          <>
            <FashionistarImage
              src={value}
              alt="Uploaded preview"
              fill={true}
              objectFit="cover"
              imgClassName="transition duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={(e) => { e.stopPropagation(); triggerSelect(); }}
                  className="rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-black shadow-sm transition hover:bg-[#FDA600] h-auto min-h-0 cursor-pointer"
                >
                  Replace
                </Button>
                <Button
                  type="button"
                  variant="danger"
                  size="sm"
                  onClick={removeFile}
                  className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-red-700 h-auto min-h-0 cursor-pointer border-none"
                >
                  Remove
                </Button>
              </div>
            </div>
          </>
        ) : isUploading ? (
          <div className="flex flex-col items-center text-center">
            <div className="relative flex h-12 w-12 items-center justify-center">
              <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-gray-200"
                  strokeWidth="3"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-[#FDA600] transition-all duration-300"
                  strokeDasharray={`${progress}, 100`}
                  strokeWidth="3"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="text-xs font-bold text-[#1A1208]">{progress}%</span>
            </div>
            <p className="mt-3 text-xs font-semibold text-[#1A1208]">Uploading...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FDA600]/10 text-[#FDA600] transition group-hover:bg-[#FDA600]/20">
              <Upload className="h-5 w-5" />
            </div>
            <p className="mt-3 text-sm font-semibold text-[#1A1208]">{placeholder}</p>
            <p className="mt-1 text-xs text-[#7A6B44]">Drag & drop or click</p>
          </div>
        )}

        {value && !isUploading && (
          <div className="absolute right-2 top-2 rounded-full bg-emerald-500 p-1 text-white shadow-sm">
            <CheckCircle2 className="h-4 w-4" />
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-1.5 text-xs font-semibold text-red-600">
          <XCircle className="h-3.5 w-3.5" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}

// ── Setup View ────────────────────────────────────────────────────────────────
export function VendorSetupView() {
  const hasVendorProfile = useAuthStore((s) => s.user?.has_vendor_profile === true);
  const { data: setupState } = useVendorSetupState();
  const { data: profile }    = useVendorProfile({ enabled: hasVendorProfile });
  const { data: collections = [], isLoading: isCollectionsLoading } = useCatalogCollections();
  const submitSetup  = useSubmitVendorSetup();

  useEffect(() => {
    if (!hasVendorProfile) {
      toast.info("Welcome to FASHIONISTAR! 🌟", {
        id: "fashionistar-vendor-setup-encourage",
        description: "Please complete your store profile to activate your seller dashboard and start listing products.",
        duration: 8000,
      });
    }
  }, [hasVendorProfile]);

  const [payload, setPayload] = useState<VendorSetupPayload>({
    store_name: "", description: "", tagline: "", logo_url: "",
    cover_url: "", city: "", state: "", country: "Nigeria",
    collection_ids: [], instagram_url: "", tiktok_url: "",
    twitter_url: "", website_url: "",
  });
  const [address, setAddress] = useState<AddressSelection>(() => emptyAddressSelection());

  useEffect(() => {
    if (!profile) return;
    setAddress(emptyAddressSelection(profile.city, profile.state, profile.country || "Nigeria"));
    setPayload((cur) => ({
      ...cur,
      store_name:     profile.store_name    || cur.store_name,
      description:    profile.description   || cur.description,
      tagline:        profile.tagline        || cur.tagline,
      logo_url:       profile.logo_url      || cur.logo_url,
      cover_url:      profile.cover_url     || cur.cover_url,
      city:           profile.city          || cur.city,
      state:          profile.state         || cur.state,
      country:        profile.country       || cur.country,
      collection_ids: profile.collections?.length && cur.collection_ids.length === 0
        ? profile.collections.map((c) => c.id) : cur.collection_ids,
      instagram_url:  profile.instagram_url || cur.instagram_url,
      tiktok_url:     profile.tiktok_url    || cur.tiktok_url,
      twitter_url:    profile.twitter_url   || cur.twitter_url,
      website_url:    profile.website_url   || cur.website_url,
    }));
  }, [profile]);

  const handleAddressChange = (next: AddressSelection) => {
    setAddress(next);
    setPayload((cur) => applyAddressSelection(cur, next));
  };

  const completion        = setupState?.completion_percentage ?? 0;
  const requiresCollections = collections.length > 0;
  const isSubmitDisabled    =
    submitSetup.isPending || isCollectionsLoading ||
    (requiresCollections && payload.collection_ids.length === 0);

  const toggleCollection = (id: string) =>
    setPayload((cur) => ({
      ...cur,
      collection_ids: cur.collection_ids.includes(id)
        ? cur.collection_ids.filter((x) => x !== id)
        : [...cur.collection_ids, id],
    }));

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await submitSetup.mutateAsync(payload);
  };

  const setupError = submitSetup.error
    ? parseApiError(submitSetup.error, "We could not save your vendor profile. Please review the form and try again.")
    : null;

  const steps = [
    { key: "profile_complete", label: "Store profile",   done: setupState?.profile_complete },
    { key: "bank_details",     label: "Bank details",    done: setupState?.bank_details },
    { key: "id_verified",      label: "ID verification", done: setupState?.id_verified },
    { key: "first_product",    label: "First product",   done: setupState?.first_product },
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {/* Hero banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1a1208] to-[#2D1A00] p-8 text-white shadow-xl md:p-10">
        <div className="relative z-10">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FDA600] shadow-lg shadow-[#FDA600]/30">
            <Store className="h-6 w-6 text-black" />
          </div>
          <h1 className="mt-4 font-bon_foyage text-4xl leading-tight md:text-5xl">
            Set Up Your Vendor Space
          </h1>
          <p className="mt-3 max-w-xl text-base leading-7 text-white/70">
            Complete your store profile, branding, and location. Bank details and
            KYC only come later when you are ready to withdraw.
          </p>
        </div>
        {/* Progress ring area */}
        <div className="absolute right-8 top-1/2 -translate-y-1/2 hidden md:block">
          <div className="flex h-32 w-32 items-center justify-center rounded-full border-4 border-[#FDA600]/30 bg-[#FDA600]/10">
            <div className="text-center">
              <p className="text-3xl font-bold text-[#FDA600]">{completion}%</p>
              <p className="text-xs text-white/50">complete</p>
            </div>
          </div>
        </div>
        {/* Background decoration */}
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-[#FDA600]/5" />
        <div className="pointer-events-none absolute -bottom-8 right-40 h-32 w-32 rounded-full bg-[#FDA600]/5" />
      </div>

      {/* Steps tracker */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {steps.map(({ key, label, done }) => (
          <div key={key} className={`rounded-2xl border p-4 transition-all ${done ? "border-[#01454A]/30 bg-[#E6F4F5]" : "border-[#ECE6D6] bg-white"}`}>
            <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${done ? "bg-[#01454A] text-white" : "bg-[#ECE6D6] text-[#7A6B44]"}`}>
              {done ? <Check className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
            </div>
            <p className="mt-2 text-xs font-semibold text-[#1A1208]">{label}</p>
            <p className="text-xs text-[#7A6B44] mt-0.5">{done ? "Done" : "Pending"}</p>
          </div>
        ))}
      </div>

      {/* Form */}
      <form onSubmit={onSubmit} className="rounded-3xl bg-white border border-[#ECE6D6] p-8 shadow-sm md:p-10">
        <h2 className="text-xl font-bold text-[#1A1208] mb-6">Store information</h2>

        {setupError && (
          <div className="mb-6">
            <AuthAlert variant="error" message={setupError.message} />
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <FieldLabel htmlFor="store_name">Store name *</FieldLabel>
            <TextInput id="store_name" value={payload.store_name} required
              onChange={(e) => setPayload((c) => ({ ...c, store_name: e.target.value }))}
              placeholder="Sapphire Collections" />
          </div>

          <div className="space-y-2">
            <FieldLabel htmlFor="tagline">Tagline</FieldLabel>
            <TextInput id="tagline" value={payload.tagline ?? ""}
              onChange={(e) => setPayload((c) => ({ ...c, tagline: e.target.value }))}
              placeholder="Modern tailoring for confident people" />
          </div>

          <div className="space-y-2 md:col-span-2">
            <FieldLabel htmlFor="description">Store description *</FieldLabel>
            <TextArea id="description" value={payload.description} required
              onChange={(e) => setPayload((c) => ({ ...c, description: e.target.value }))}
              placeholder="Tell customers what makes your store special..." />
          </div>

          <div className="space-y-3 md:col-span-2">
            <FieldLabel>Store location *</FieldLabel>
            <AddressReferenceField
              value={address}
              onChange={handleAddressChange}
            />
            <p className="text-xs font-medium text-[#7A6B44]">
              Choose the closest registered location. You can still use a custom city where the reference list is not exact.
            </p>
          </div>

          <div className="space-y-2">
            <FieldLabel htmlFor="website_url">Website</FieldLabel>
            <TextInput id="website_url" value={payload.website_url ?? ""}
              onChange={(e) => setPayload((c) => ({ ...c, website_url: e.target.value }))}
              placeholder="https://your-store.com" />
          </div>

          <div className="space-y-2">
            <FieldLabel htmlFor="instagram_url">Instagram</FieldLabel>
            <TextInput id="instagram_url" value={payload.instagram_url ?? ""}
              onChange={(e) => setPayload((c) => ({ ...c, instagram_url: e.target.value }))}
              placeholder="https://instagram.com/yourbrand" />
          </div>

          <div className="space-y-2">
            <FieldLabel htmlFor="tiktok_url">TikTok</FieldLabel>
            <TextInput id="tiktok_url" value={payload.tiktok_url ?? ""}
              onChange={(e) => setPayload((c) => ({ ...c, tiktok_url: e.target.value }))}
              placeholder="https://tiktok.com/@yourbrand" />
          </div>

          <div className="space-y-2">
            <FieldLabel htmlFor="twitter_url">X / Twitter</FieldLabel>
            <TextInput id="twitter_url" value={payload.twitter_url ?? ""}
              onChange={(e) => setPayload((c) => ({ ...c, twitter_url: e.target.value }))}
              placeholder="https://x.com/yourbrand" />
          </div>

          <div className="space-y-2">
            <FieldLabel htmlFor="logo_url">Store Logo</FieldLabel>
            <CloudinaryFileUploader
              id="logo_url"
              value={payload.logo_url ?? ""}
              onChange={(url) => setPayload((c) => ({ ...c, logo_url: url }))}
              placeholder="Upload Store Logo"
              aspectRatio="square"
            />
          </div>

          <div className="space-y-2">
            <FieldLabel htmlFor="cover_url">Store Cover Image</FieldLabel>
            <CloudinaryFileUploader
              id="cover_url"
              value={payload.cover_url ?? ""}
              onChange={(url) => setPayload((c) => ({ ...c, cover_url: url }))}
              placeholder="Upload Store Cover Image"
              aspectRatio="video"
            />
          </div>

          {/* Collections */}
          <div className="space-y-3 md:col-span-2">
            <FieldLabel htmlFor="vendor-collections">
              Fashion Collections
            </FieldLabel>
            <div id="vendor-collections" className="rounded-xl border border-[#D9D9D9] bg-[#FAFAF8] p-4">
              <p className="text-sm text-[#5A6465] mb-4">
                Select the fashion collections your store specializes in — powers marketplace discovery.
              </p>
              {isCollectionsLoading ? (
                <div className="grid gap-3 md:grid-cols-2">
                  {[1,2,3,4].map((i) => <SkeletonCard key={i} className="h-16" />)}
                </div>
              ) : collections.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[#D9D9D9] p-5 text-center">
                  <p className="text-sm font-semibold text-[#1A1208]">No collections available yet</p>
                  <p className="mt-1 text-xs text-[#7A6B44]">You can continue setup — collections will be available soon.</p>
                </div>
              ) : (
                <div className="grid gap-3 md:grid-cols-2">
                  {collections.map((col) => {
                    const selected = payload.collection_ids.includes(col.id);
                    return (
                      <Button key={col.id} asChild>
                        <button type="button" onClick={() => toggleCollection(col.id)}
                          className={`flex items-center gap-3 rounded-xl border p-4 text-left transition-all h-auto ${
                            selected ? "border-[#FDA600] bg-[#FFF6E3] shadow-sm" : "border-[#D9D9D9] bg-white hover:border-[#FDA600]/50"
                          }`}
                        >
                          <span className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 transition-all ${
                            selected ? "border-[#FDA600] bg-[#FDA600]" : "border-[#D9D9D9]"
                          }`}>
                            {selected && <Check className="h-3 w-3 text-black" />}
                          </span>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-[#1A1208] truncate">{col.title}</p>
                            <p className="text-xs text-[#7A6B44] truncate">{col.slug}</p>
                          </div>
                        </button>
                      </Button>
                    );
                  })}
                </div>
              )}
              {payload.collection_ids.length > 0 && (
                <p className="mt-3 text-xs font-semibold text-[#FDA600]">
                  {payload.collection_ids.length} collection{payload.collection_ids.length > 1 ? "s" : ""} selected
                </p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center justify-end gap-3 md:col-span-2 pt-2">
            <Link href="/vendor/dashboard"
              className="rounded-xl border border-[#D9D9D9] px-6 py-3 text-sm font-semibold text-[#5A6465] transition hover:bg-[#F4F3EC]">
              Skip for now
            </Link>
            <PrimaryButton type="submit" loading={submitSetup.isPending} disabled={isSubmitDisabled}>
              Save shop details
              <ArrowRight className="h-4 w-4" />
            </PrimaryButton>
          </div>
        </div>
      </form>
    </div>
  );
}

// ── Dashboard View ────────────────────────────────────────────────────────────
function resolveDashboardStats(data?: VendorDashboard) {
  return {
    products: data?.analytics.total_products ?? 0,
    sales:    data?.analytics.total_sales    ?? 0,
    revenue:  data?.analytics.total_revenue  ?? 0,
    rating:   data?.analytics.average_rating ?? 0,
    reviews:  data?.analytics.review_count   ?? 0,
  };
}

export function VendorDashboardView() {
  const { data: dashboard, isLoading } = useVendorDashboard();
  const { data: setupState }           = useVendorSetupState();
  const { data: revenueData, isLoading: isRevenueLoading } = useVendorRevenueChart();
  const stats = resolveDashboardStats(dashboard);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
        <SkeletonCard className="h-52" />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {[1,2,3,4,5].map((i) => <SkeletonCard key={i} className="h-28" />)}
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[1,2,3].map((i) => <SkeletonCard key={i} className="h-28" />)}
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <SkeletonCard className="h-72" />
          <SkeletonCard className="h-72" />
        </div>
      </div>
    );
  }

  const completion    = setupState?.completion_percentage ?? 0;
  const walletBal     = dashboard?.wallet?.balance ?? 0;
  const recentOrders  = dashboard?.recent_orders ?? [];
  const couponStats   = dashboard?.coupons ?? { active: 0, inactive: 0 };
  const payoutReady   = dashboard?.payout_profile?.is_verified ?? false;
  const lowStockCount = dashboard?.low_stock_alerts?.length ?? 0;

  return (
    <div className="space-y-6">
      <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>

      {/* ── COMMAND CENTRE HERO ── */}
      <div
        className="relative overflow-hidden rounded-3xl text-white shadow-2xl"
        style={{
          background: "linear-gradient(135deg, #0f1d0b 0%, #01454A 38%, #2D1A00 68%, #1a1208 100%)",
          boxShadow: "0 20px 60px rgba(15,29,11,0.4), 0 8px 24px rgba(253,166,0,0.08)",
        }}
      >
        {/* Mesh blobs */}
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, #FDA600 0%, transparent 70%)" }} />
        <div className="pointer-events-none absolute -bottom-16 left-1/3 h-48 w-48 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #FDA600 0%, transparent 70%)" }} />
        <div className="pointer-events-none absolute bottom-0 right-0 h-32 w-32 opacity-5"
          style={{ background: "radial-gradient(circle at bottom right, #fff 0%, transparent 70%)" }} />

        <div className="relative z-10 flex flex-col gap-6 p-7 md:flex-row md:items-center md:justify-between md:p-10">
          {/* Left: Store identity */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-brand-pulse" />
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#FDA600]/80">Vendor Command Centre</p>
            </div>
            <h1 className="font-bon_foyage text-3xl leading-tight text-white md:text-5xl">
              {dashboard?.profile.store_name || "Welcome back"}
            </h1>
            <p className="mt-2 text-sm text-white/50 max-w-sm leading-relaxed">
              {dashboard?.profile.tagline || "Track performance, grow your catalog, and manage payouts."}
            </p>

            {/* Store quick stats row */}
            <div className="mt-4 flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-1.5 rounded-xl bg-white/8 px-3 py-1.5">
                <ShoppingBag className="h-3.5 w-3.5 text-[#FDA600]" />
                <span className="text-xs font-bold text-white">{stats.products} Products</span>
              </div>
              <div className="flex items-center gap-1.5 rounded-xl bg-white/8 px-3 py-1.5">
                <ShoppingCart className="h-3.5 w-3.5 text-[#FDA600]" />
                <span className="text-xs font-bold text-white">{stats.sales} Orders</span>
              </div>
              {dashboard?.profile.is_verified && (
                <div className="flex items-center gap-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/20 px-3 py-1.5">
                  <BadgeCheck className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-xs font-bold text-emerald-400">Verified</span>
                </div>
              )}
            </div>

            {/* CTAs */}
            <div className="mt-5 flex items-center gap-3 flex-wrap">
              <Link href="/vendor/products"
                className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-black transition-all hover:scale-105 shadow-lg"
                style={{ background: "linear-gradient(135deg, #FDA600 0%, #E8960A 100%)", boxShadow: "0 4px 18px rgba(253,166,0,0.35)" }}
              >
                <Plus className="h-4 w-4" /> Add Product
              </Link>
              <Link href="/vendor/analytics"
                className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/8 px-5 py-2.5 text-sm font-bold text-white transition-all hover:bg-white/15 backdrop-blur-sm"
              >
                <BarChart3 className="h-4 w-4" /> Analytics
              </Link>
            </div>
          </div>

          {/* Right: Onboarding + Wallet tiles */}
          <div className="flex gap-3 flex-shrink-0 flex-col sm:flex-row md:flex-col xl:flex-row">
            {/* Onboarding */}
            <div
              className="rounded-2xl border border-white/10 p-5 min-w-[160px]"
              style={{ background: "rgba(255,255,255,0.05)", backdropFilter: "blur(8px)" }}
            >
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30">Onboarding</p>
              <p className="mt-1.5 text-3xl font-bold text-[#FDA600]">{completion}%</p>
              <div className="mt-2.5 h-1 w-full rounded-full bg-white/10">
                <div
                  className="h-1 rounded-full transition-all duration-700"
                  style={{ width: `${completion}%`, background: "linear-gradient(90deg, #FDA600, #E8960A)" }}
                />
              </div>
              <p className="mt-2 text-[10px] text-white/30">
                {completion === 100 ? "✓ Setup complete" : `${100 - completion}% remaining`}
              </p>
            </div>

            {/* Wallet balance */}
            <div
              className="rounded-2xl border border-white/10 p-5 min-w-[160px]"
              style={{ background: "rgba(255,255,255,0.05)", backdropFilter: "blur(8px)" }}
            >
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30">Wallet</p>
              <p className="mt-1.5 text-2xl font-bold text-[#FDA600]">₦{walletBal.toLocaleString()}</p>
              <Link href="/vendor/payouts"
                className="mt-3 flex items-center gap-1 text-[10px] font-bold text-[#FDA600]/60 hover:text-[#FDA600] transition-colors"
              >
                <Zap className="h-2.5 w-2.5" /> {payoutReady ? "Ready to withdraw" : "Set up payouts"}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── LOW STOCK ALERT ── */}
      {lowStockCount > 0 && (
        <div
          className="flex items-center justify-between gap-4 rounded-2xl border px-5 py-4"
          style={{
            background: "linear-gradient(135deg, #01454A 0%, #0f1d0b 100%)",
            borderColor: "rgba(253,166,0,0.2)",
            boxShadow: "0 2px 16px rgba(253,166,0,0.08)",
          }}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FDA600]/15 flex-shrink-0">
              <AlertTriangle className="h-4 w-4 text-[#FDA600]" />
            </div>
            <div>
              <p className="text-sm font-bold text-[#FDA600]">Low Stock Alert</p>
              <p className="text-xs text-white/50 mt-0.5">
                {lowStockCount} product{lowStockCount !== 1 ? "s" : ""} running low — update inventory.
              </p>
            </div>
          </div>
          <Link
            href="/vendor/products/catalog"
            className="flex-shrink-0 rounded-xl px-4 py-2 text-xs font-bold text-black transition-all hover:scale-105"
            style={{ background: "linear-gradient(135deg, #FDA600 0%, #E8960A 100%)" }}
          >
            Manage Catalog
          </Link>
        </div>
      )}

      {/* ── KPI STRIP (5 primary) ── */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <KpiCard title="Products"  value={String(stats.products)} hint="Catalog items" icon={ShoppingBag} accent="gold" />
        <KpiCard title="Sales"     value={String(stats.sales)}    hint="Orders recorded" icon={ShoppingCart} accent="green" />
        <KpiCard title="Revenue"   value={`₦${stats.revenue.toLocaleString()}`} hint="Gross value" icon={TrendingUp} accent="gold" />
        <KpiCard title="Rating"    value={stats.rating.toFixed(1)} hint={`${stats.reviews} review${stats.reviews === 1 ? "" : "s"}`} icon={Star} accent="gold" />
        <KpiCard title="Status"    value={dashboard?.profile.is_verified ? "Verified" : "Pending"}
          hint={dashboard?.profile.is_verified ? "KYC approved" : "Pending review"}
          icon={PackageCheck} accent={dashboard?.profile.is_verified ? "green" : "gold"} />
      </div>

      {/* ── SECONDARY KPIs (3 finance) ── */}
      <div className="grid gap-4 md:grid-cols-3">
        <KpiCard title="Wallet Balance" value={`₦${walletBal.toLocaleString()}`} hint="Available balance" icon={Wallet} accent="gold" />
        <KpiCard title="Active Coupons" value={String(couponStats.active)}
          hint={`${couponStats.inactive} inactive`} icon={Tag} accent="blue" />
        <KpiCard title="Payout Status" value={payoutReady ? "Ready" : "Not set up"}
          hint={payoutReady ? "Bank verified" : "Add bank in Payouts"} icon={Zap} accent={payoutReady ? "green" : "red"} />
      </div>

      {/* Revenue trend chart */}
      <div className="rounded-3xl bg-white border border-[#ECE6D6] p-7 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FDA600]/10 text-[#FDA600]">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#1A1208]">Revenue Trend</h2>
              <p className="text-xs text-[#7A6B44]">6-Month gross sales value</p>
            </div>
          </div>
        </div>
        <div className="h-72 w-full">
          {isRevenueLoading ? (
            <SkeletonCard className="h-full w-full" />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData?.data ?? []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FDA600" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#FDA600" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F5F3EE" vertical={false} />
                <XAxis dataKey="label" stroke="#7A6B44" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#7A6B44" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `₦${v.toLocaleString()}`} />
                <Tooltip formatter={(value: any) => [`₦${value.toLocaleString()}`, "Revenue"]} contentStyle={{ background: "#FFF", borderRadius: "12px", border: "1px solid #ECE6D6" }} labelStyle={{ fontWeight: "bold", color: "#1A1208" }} />
                <Area type="monotone" dataKey="value" stroke="#FDA600" strokeWidth={2.5} fillOpacity={1} fill="url(#goldGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Middle row: Store snapshot + Quick actions */}
      <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        {/* Store snapshot */}
        <div className="rounded-3xl bg-white border border-[#ECE6D6] p-7 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FDA600]/10 text-[#FDA600]">
              <Store className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-bold text-[#1A1208]">Store snapshot</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-[#ECE6D6] bg-[#FAFAF8] p-4">
              <p className="text-xs font-bold uppercase tracking-widest text-[#7A6B44] mb-2">Location</p>
              <p className="flex items-center gap-2 text-sm font-semibold text-[#1A1208]">
                <MapPin className="h-4 w-4 text-[#FDA600]" />
                {dashboard?.profile.city || "Not set"}, {dashboard?.profile.state || "—"}
              </p>
            </div>
            <div className="rounded-xl border border-[#ECE6D6] bg-[#FAFAF8] p-4">
              <p className="text-xs font-bold uppercase tracking-widest text-[#7A6B44] mb-2">Store URL</p>
              <p className="flex items-center gap-2 text-sm font-mono text-[#1A1208]">
                <Globe className="h-4 w-4 text-[#FDA600]" />
                /{dashboard?.profile.store_slug || "slug-pending"}
              </p>
            </div>
            <div className="rounded-xl border border-[#ECE6D6] bg-[#FAFAF8] p-4">
              <p className="text-xs font-bold uppercase tracking-widest text-[#7A6B44] mb-2">Verification</p>
              <div>
                {dashboard?.profile.is_verified
                  ? <Badge color="green">Verified ✓</Badge>
                  : <Badge color="gold">Pending Review</Badge>}
              </div>
            </div>
            <div className="rounded-xl border border-[#ECE6D6] bg-[#FAFAF8] p-4">
              <p className="text-xs font-bold uppercase tracking-widest text-[#7A6B44] mb-2">Activity</p>
              {dashboard?.profile.is_active
                ? <Badge color="green">Active</Badge>
                : <Badge color="gray">Inactive</Badge>}
            </div>
            <div className="rounded-xl border border-[#ECE6D6] bg-[#FAFAF8] p-4">
              <p className="text-xs font-bold uppercase tracking-widest text-[#7A6B44] mb-2">Last Active</p>
              <UiTooltip>
                <TooltipTrigger className="text-sm font-semibold text-[#1A1208] text-left hover:text-[#FDA600] transition-colors">
                  {dashboard?.profile.last_active_at
                    ? new Date(dashboard.profile.last_active_at).toLocaleDateString("en-NG", { dateStyle: "medium" })
                    : "Active Now"}
                </TooltipTrigger>
                <TooltipContent side="top">
                  Vendor's last logged operational activity timestamp
                </TooltipContent>
              </UiTooltip>
            </div>
            <div className="rounded-xl border border-[#ECE6D6] bg-[#FAFAF8] p-4">
              <p className="text-xs font-bold uppercase tracking-widest text-[#7A6B44] mb-2">Support Rating</p>
              <UiTooltip>
                <TooltipTrigger className="flex items-center gap-1 text-sm font-semibold text-[#1A1208] hover:text-[#FDA600] transition-colors">
                  <span>
                    {dashboard?.profile.support_rating ? Number(dashboard.profile.support_rating).toFixed(1) : "5.0"}
                  </span>
                  <span className="text-xs text-amber-400">★</span>
                </TooltipTrigger>
                <TooltipContent side="top">
                  Overall customer support score based on reviews (scale 1-5)
                </TooltipContent>
              </UiTooltip>
            </div>
          </div>

          {/* Social links */}
          {(dashboard?.profile.instagram_url || dashboard?.profile.twitter_url) && (
            <div className="mt-5 flex items-center gap-3">
              <p className="text-xs font-bold uppercase tracking-widest text-[#7A6B44]">Social</p>
              {dashboard?.profile.instagram_url && (
                <a href={dashboard.profile.instagram_url} target="_blank" rel="noreferrer"
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#ECE6D6] text-[#7A6B44] hover:bg-[#F8F5ED] transition-colors">
                  <Instagram className="h-3.5 w-3.5" />
                </a>
              )}
              {dashboard?.profile.twitter_url && (
                <a href={dashboard.profile.twitter_url} target="_blank" rel="noreferrer"
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#ECE6D6] text-[#7A6B44] hover:bg-[#F8F5ED] transition-colors">
                  <Twitter className="h-3.5 w-3.5" />
                </a>
              )}
              {dashboard?.profile.website_url && (
                <a href={dashboard.profile.website_url} target="_blank" rel="noreferrer"
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#ECE6D6] text-[#7A6B44] hover:bg-[#F8F5ED] transition-colors">
                  <Globe className="h-3.5 w-3.5" />
                </a>
              )}
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div className="rounded-3xl bg-white border border-[#ECE6D6] p-7 shadow-sm">
          <h2 className="text-lg font-bold text-[#1A1208] mb-5">Quick actions</h2>
          <div className="space-y-2">
            {[
              { href: "/vendor/products",         icon: ShoppingBag, label: "Create a product", hint: "Add to your catalog" },
              { href: "/vendor/products/catalog",  icon: Package,      label: "Manage catalog",  hint: "View & edit products" },
              { href: "/vendor/orders",            icon: ShoppingCart, label: "View orders",     hint: "Process & track orders" },
              { href: "/vendor/wallet",            icon: Wallet,       label: "Wallet & payouts",hint: "Manage your earnings" },
              { href: "/vendor/analytics",         icon: BarChart3,    label: "Analytics",       hint: "Performance insights" },
            ].map(({ href, icon: Icon, label, hint }) => (
              <Link key={href} href={href}
                className="group flex items-center gap-4 rounded-xl border border-[#ECE6D6] bg-[#FAFAF8] px-4 py-3 transition-all hover:border-[#FDA600]/40 hover:bg-[#FFF6E3] hover:shadow-sm">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-[#FDA600]/10 text-[#FDA600] transition-transform group-hover:scale-110">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-[#1A1208] truncate">{label}</p>
                  <p className="text-xs text-[#7A6B44] truncate">{hint}</p>
                </div>
                <ArrowRight className="h-4 w-4 flex-shrink-0 text-[#D9D9D9] transition-transform group-hover:translate-x-0.5 group-hover:text-[#FDA600]" />
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Recent orders */}
      {recentOrders.length > 0 && (
        <div className="rounded-3xl bg-white border border-[#ECE6D6] shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-7 py-5 border-b border-[#ECE6D6]">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FDA600]/10 text-[#FDA600]">
                <ShoppingCart className="h-4 w-4" />
              </div>
              <h2 className="text-base font-bold text-[#1A1208]">Recent Orders</h2>
            </div>
            <Link href="/vendor/orders" className="flex items-center gap-1.5 text-xs font-semibold text-[#FDA600] hover:underline">
              View all <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-[#FAFAF8]">
                <tr className="text-left text-xs font-bold uppercase tracking-widest text-[#7A6B44]">
                  <th className="px-6 py-3">Order ID</th>
                  <th className="px-6 py-3">Customer</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Payment</th>
                  <th className="px-6 py-3 text-right">Total</th>
                  <th className="px-6 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F5F3EE]">
                {recentOrders.slice(0, 5).map((order) => (
                  <tr key={order.id} className="hover:bg-[#FAFAF8] transition-colors">
                    <td className="px-6 py-4 font-mono text-sm font-semibold text-[#1A1208]">
                      {order.oid ?? `#${order.id}`}
                    </td>
                    <td className="px-6 py-4 text-sm text-[#1A1208]">
                      <p className="font-medium">{order.buyer_full_name || "—"}</p>
                      <p className="text-xs text-[#7A6B44]">{order.buyer_email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={order.order_status} />
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={order.payment_status} />
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-bold text-[#1A1208]">
                      ₦{(order.total_price ?? order.total ?? 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-xs text-[#7A6B44]">
                      {new Date(order.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Top Products + Low Stock Alerts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top selling products */}
        <VendorTopProductsWidget />
        {/* Low stock alert */}
        <VendorLowStockWidget />
      </div>
    </div>
  );
}

// ── Top Products Widget ────────────────────────────────────────────────────────
function VendorTopProductsWidget() {
  const { data: topProds, isLoading } = useVendorTopSellingProducts(5);
  const products = topProds ?? [];

  return (
    <div className="rounded-3xl bg-white border border-[#ECE6D6] shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-7 py-5 border-b border-[#ECE6D6]">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FDA600]/10">
            <Star className="h-4 w-4 text-[#FDA600]" />
          </div>
          <h2 className="text-base font-bold text-[#1A1208]">Top Products</h2>
        </div>
        <Link href="/vendor/products/catalog"
          className="flex items-center gap-1 text-xs font-semibold text-[#FDA600] hover:underline">
          View all <ArrowUpRight className="h-3 w-3" />
        </Link>
      </div>
      <div className="p-5 space-y-3">
        {isLoading ? (
          [1,2,3,4,5].map((i) => <SkeletonCard key={i} className="h-12" />)
        ) : products.length === 0 ? (
          <div className="py-8 text-center">
            <ShoppingBag className="mx-auto mb-2 h-8 w-8 text-[#ECE6D6]" />
            <p className="text-xs text-[#7A6B44]">No products with sales yet.</p>
          </div>
        ) : (
          products.map((p, i) => (
            <div key={String(p.id ?? i)} className="flex items-center gap-4">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-[#F8F5ED] text-xs font-bold text-[#FDA600]">
                {i + 1}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-[#1A1208] truncate">{p.title}</p>
                <p className="text-xs text-[#7A6B44]">{(p.total_qty ?? 0)} sold · ₦{Number(p.price).toLocaleString()}</p>
              </div>
              <div className="text-xs font-semibold text-[#01454A] flex items-center gap-1">
                <Package className="h-3 w-3" /> {p.stock_qty}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ── Low Stock Alert Widget ─────────────────────────────────────────────────────
function VendorLowStockWidget() {
  const { data: dashboard } = useVendorDashboard();
  // Pull from dashboard analytics if the dedicated endpoint isn't wired yet
  const lowStock = (dashboard?.low_stock_alerts ?? []) as Array<{ title: string; stock_qty: number }>;

  return (
    <div className="rounded-3xl bg-white border border-[#ECE6D6] shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-7 py-5 border-b border-[#ECE6D6]">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </div>
          <h2 className="text-base font-bold text-[#1A1208]">Low Stock Alerts</h2>
        </div>
        {lowStock.length > 0 && (
          <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-bold text-red-600">
            {lowStock.length} item{lowStock.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>
      <div className="p-5 space-y-3">
        {lowStock.length === 0 ? (
          <div className="py-8 text-center">
            <PackageCheck className="mx-auto mb-2 h-8 w-8 text-[#01454A]/40" />
            <p className="text-xs text-[#7A6B44]">All products are well stocked.</p>
          </div>
        ) : (
          lowStock.slice(0, 6).map((p, i) => (
            <div key={i} className="flex items-center justify-between gap-4 rounded-xl border border-red-100 bg-red-50/50 px-4 py-3">
              <p className="text-sm font-semibold text-[#1A1208] truncate">{p.title}</p>
              <span className="flex-shrink-0 inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-bold text-red-700">
                <Package className="h-3 w-3" /> {p.stock_qty} left
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ── Status Tab Config ─────────────────────────────────────────────────────────
const ORDER_STATUS_TABS = [
  { key: "all",        label: "All" },
  { key: "Pending",    label: "Pending" },
  { key: "Processing", label: "Processing" },
  { key: "Shipped",    label: "Shipped" },
  { key: "Fulfilled",  label: "Fulfilled" },
  { key: "Cancelled",  label: "Cancelled" },
] as const;

// ── Orders View ───────────────────────────────────────────────────────────────
export function VendorOrdersView() {
  const [search, setSearch]       = useState("");
  const [activeTab, setActiveTab] = useState<string>("all");
  const filterKey = activeTab === "all" ? undefined : activeTab;
  const { data: orders = [], isLoading, isError } = useVendorOrders(filterKey);

  const filtered = orders.filter((o) => {
    const q = search.toLowerCase();
    return (
      !q ||
      (o.oid ?? "").toLowerCase().includes(q) ||
      (o.buyer_email ?? "").toLowerCase().includes(q) ||
      String(o.buyer_full_name ?? "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Commerce"
        title="Orders"
        description="Every customer order from your store — search, filter by status, and click for full details."
        action={
          <Link href="/vendor/analytics"
            className="inline-flex items-center gap-2 rounded-xl border border-[#ECE6D6] bg-white px-5 py-2.5 text-sm font-semibold text-[#1A1208] transition hover:bg-[#F8F5ED] shadow-sm">
            <BarChart3 className="h-4 w-4 text-[#FDA600]" /> Analytics
          </Link>
        }
      />

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#BDBDBD]" />
        <input id="order-search" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by order ID, customer name or email…"
          className="h-11 w-full rounded-xl border border-[#D9D9D9] bg-white pl-10 pr-4 text-sm outline-none transition focus:border-[#FDA600] focus:ring-2 focus:ring-[#FDA600]/15" />
      </div>

      {/* Status tabs */}
      <div className="flex gap-1.5 flex-wrap">
        {ORDER_STATUS_TABS.map(({ key, label }) => (
          <Button key={key} asChild>
            <button type="button" id={`order-tab-${key}`} onClick={() => setActiveTab(key)}
              className={["rounded-xl px-4 py-1.5 text-xs font-semibold transition-all h-auto",
                activeTab === key ? "bg-[#FDA600] text-black shadow-sm" : "border border-[#ECE6D6] bg-white text-[#7A6B44] hover:bg-[#F8F5ED]",
              ].join(" ")}>
              {label}
            </button>
          </Button>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-3xl bg-white border border-[#ECE6D6] shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 space-y-3">{[1,2,3,4,5].map((i) => <SkeletonCard key={i} className="h-16" />)}</div>
        ) : isError ? (
          <div className="p-10 text-center">
            <AlertTriangle className="mx-auto mb-2 h-8 w-8 text-[#FDA600]" />
            <p className="text-sm font-semibold text-[#1A1208]">Could not load orders</p>
            <p className="mt-1 text-xs text-[#7A6B44]">Check your connection or refresh the page.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-[#F8F5ED]">
                <tr className="text-left text-xs font-bold uppercase tracking-widest text-[#7A6B44]">
                  <th className="px-6 py-4">Order ID</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Payment</th>
                  <th className="px-6 py-4 text-right">Total</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4" />
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F5F3EE]">
                {filtered.length === 0 ? (
                  <tr><td colSpan={7} className="px-6 py-14 text-center">
                    <ShoppingCart className="mx-auto mb-3 h-10 w-10 text-[#ECE6D6]" />
                    <p className="text-sm font-semibold text-[#1A1208]">
                      {search ? "No orders match your search" : `No ${activeTab === "all" ? "" : activeTab + " "}orders yet`}
                    </p>
                    <p className="mt-1 text-xs text-[#7A6B44]">{"Orders appear here as customers purchase from your store."}</p>
                  </td></tr>
                ) : filtered.map((order) => (
                  <tr key={order.id}
                    className="hover:bg-[#FFFBF0] transition-colors cursor-pointer group"
                    onClick={() => window.location.assign(`/vendor/orders/${order.id}`)}>
                    <td className="px-6 py-4 font-mono text-sm font-bold text-[#1A1208]">{order.oid ?? `#${order.id}`}</td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-[#1A1208]">{String(order.buyer_full_name ?? "—")}</p>
                      <p className="text-xs text-[#7A6B44]">{order.buyer_email}</p>
                    </td>
                    <td className="px-6 py-4"><StatusBadge status={order.order_status} /></td>
                    <td className="px-6 py-4"><StatusBadge status={String(order.payment_status ?? "pending")} /></td>
                    <td className="px-6 py-4 text-right text-sm font-bold text-[#1A1208]">
                      ₦{Number(order.total_price ?? 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-xs text-[#7A6B44]">
                      {new Date(order.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-6 py-4">
                      <ChevronRight className="h-4 w-4 text-[#D9D9D9] group-hover:text-[#FDA600] transition-colors" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {!isLoading && !isError && filtered.length > 0 && (
          <div className="border-t border-[#F5F3EE] px-6 py-3">
            <p className="text-xs text-[#7A6B44]">
              Showing <span className="font-bold text-[#1A1208]">{filtered.length}</span> order{filtered.length !== 1 ? "s" : ""}
              {activeTab !== "all" ? ` · status: ${activeTab}` : ""}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Order Detail View ─────────────────────────────────────────────────────────
const ORDER_STEPS = [
  { key: "Pending",    label: "Order Placed" },
  { key: "Processing", label: "Confirmed" },
  { key: "Shipped",    label: "Shipped" },
  { key: "Fulfilled",  label: "Delivered" },
] as const;

export function VendorOrderDetailView({ orderOid }: { orderOid: string }) {
  const orderId = parseInt(orderOid, 10);
  const { data: order, isLoading, isError } = useVendorOrder(isNaN(orderId) ? null : orderId);
  const { data: dashboard } = useVendorDashboard();
  const updateStatus = useUpdateOrderStatus();

  const [isMeasurementModalOpen, setIsMeasurementModalOpen] = useState(false);
  const [selectedMeasurementItem, setSelectedMeasurementItem] = useState<any>(null);

  const dashOrder = dashboard?.recent_orders.find(
    (o) => o.oid === orderOid || String(o.id) === orderOid,
  );
  const displayOrder = (order ?? dashOrder) as any;
  const currentStatus = String(displayOrder?.order_status ?? "Pending");
  const currentStepIdx = ORDER_STEPS.findIndex((s) => s.key === currentStatus);

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-2">
        <Link href="/vendor/orders"
          className="flex items-center gap-1.5 text-sm font-semibold text-[#7A6B44] hover:text-[#FDA600] transition-colors">
          <ChevronRight className="h-4 w-4 rotate-180" />All Orders
        </Link>
        <span className="text-[#D9D9D9]">/</span>
        <span className="text-sm font-semibold text-[#1A1208]">{orderOid}</span>
      </div>
      <PageHeader eyebrow="Order Detail" title={`Order ${orderOid}`}
        description={displayOrder ? `Placed ${new Date(displayOrder.date).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })}` : ""} />

      {isLoading && <div className="space-y-4"><SkeletonCard className="h-28" /><SkeletonCard className="h-48" /></div>}

      {isError && !dashOrder && (
        <div className="rounded-2xl border border-[#F2C9C9] bg-[#FFF7F7] p-6">
          <p className="text-sm font-semibold text-[#8A3B3B]">Order not found or could not be loaded.</p>
        </div>
      )}

      {displayOrder && (
        <>
          {/* Status Stepper */}
          <div className="rounded-3xl bg-white border border-[#ECE6D6] p-7 shadow-sm">
            <h2 className="text-base font-bold text-[#1A1208] mb-6">Order Progress</h2>
            <div className="flex items-start">
              {ORDER_STEPS.map((step, idx) => {
                const done = idx <= currentStepIdx;
                const active = idx === currentStepIdx;
                const isLast = idx === ORDER_STEPS.length - 1;
                return (
                  <div key={step.key} className="flex flex-1 flex-col items-center">
                    <div className="flex w-full items-center">
                      <div className={["flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border-2 font-bold text-xs transition-all",
                        active ? "border-[#FDA600] bg-[#FDA600] text-black shadow-md shadow-[#FDA600]/30" :
                        done   ? "border-[#01454A] bg-[#01454A] text-white" :
                                 "border-[#D9D9D9] bg-white text-[#BDBDBD]",
                      ].join(" ")}>
                        {done && !active ? <Check className="h-4 w-4" /> : <span>{idx + 1}</span>}
                      </div>
                      {!isLast && <div className={"flex-1 h-0.5 mx-1 rounded-full " + (idx < currentStepIdx ? "bg-[#01454A]" : "bg-[#ECE6D6]")} />}
                    </div>
                    <p className={"mt-2 text-xs font-semibold text-center " + (active ? "text-[#FDA600]" : done ? "text-[#01454A]" : "text-[#BDBDBD]")}>
                      {step.label}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Customer / Payment / Total */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl bg-white border border-[#ECE6D6] p-5 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-widest text-[#7A6B44] mb-3">Customer</p>
              <p className="text-sm font-bold text-[#1A1208]">{String(displayOrder.buyer_full_name ?? "—")}</p>
              <p className="mt-0.5 text-xs text-[#7A6B44]">{displayOrder.buyer_email}</p>
            </div>
            <div className="rounded-2xl bg-white border border-[#ECE6D6] p-5 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-widest text-[#7A6B44] mb-3">Payment</p>
              <StatusBadge status={displayOrder.payment_status} />
            </div>
            <div className="rounded-2xl bg-white border border-[#ECE6D6] p-5 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-widest text-[#7A6B44] mb-2">Total</p>
              <p className="text-3xl font-bold text-[#1A1208]">
                ₦{Number(displayOrder.total_price ?? (displayOrder as { total?: number }).total ?? 0).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Order Items */}
          <div className="rounded-3xl bg-white border border-[#ECE6D6] p-7 shadow-sm">
            <h2 className="text-base font-bold text-[#1A1208] mb-4">Ordered Items</h2>
            <div className="divide-y divide-[#F5F3EE]">
              {displayOrder.items?.map((item: any) => {
                const hasMeasurements = !!item.measurement_data || !!displayOrder.measurement_data;
                return (
                  <div key={item.id} className="py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-[#1A1208]">
                        {item.product_title_snapshot || "Product Item"}
                      </p>
                      <p className="text-xs text-[#7A6B44] mt-0.5">
                        SKU: {item.product_sku_snapshot || "—"} · Qty: {item.quantity}
                      </p>
                      {item.variant_description_snapshot && (
                        <p className="text-xs text-[#5A6465] mt-0.5">
                          Variant: {item.variant_description_snapshot}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-bold text-[#1A1208]">
                          ₦{Number(item.line_total ?? (Number(item.unit_price) * item.quantity)).toLocaleString()}
                        </p>
                        <p className="text-[10px] text-[#7A6B44]">
                          ₦{Number(item.unit_price).toLocaleString()} each
                        </p>
                      </div>

                      {/* Custom sizing overlay button */}
                      {hasMeasurements && (
                        <Button asChild>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedMeasurementItem(item);
                              setIsMeasurementModalOpen(true);
                            }}
                            className="rounded-xl border border-[#FDA600] bg-[#FFF6E3] px-3.5 py-1.5 text-xs font-bold text-black transition hover:bg-[#FDA600] cursor-pointer h-auto"
                          >
                            View Sizing
                          </button>
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Status Update */}
          {!isNaN(orderId) && (
            <div className="rounded-3xl bg-white border border-[#ECE6D6] p-7 shadow-sm">
              <h2 className="text-base font-bold text-[#1A1208] mb-4">Update Order Status</h2>
              <div className="flex flex-wrap gap-2">
                {(["Pending", "Processing", "Shipped", "Fulfilled", "Cancelled"] as VendorOrderStatus[]).map((s) => (
                  <Button key={s} asChild>
                    <button id={`status-btn-${s}`} type="button"
                      disabled={currentStatus === s || updateStatus.isPending}
                      onClick={() => updateStatus.mutate({ orderId, order_status: s })}
                      className={["inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition-all border cursor-pointer h-auto",
                        currentStatus === s
                          ? "bg-[#FDA600] border-[#FDA600] text-black cursor-default font-bold"
                          : "border-[#ECE6D6] bg-white text-[#5A6465] hover:border-[#FDA600]/50 hover:bg-[#FFF6E3] disabled:opacity-40",
                      ].join(" ")}>
                      {updateStatus.isPending && updateStatus.variables?.order_status === s
                        ? <RefreshCw className="h-3 w-3 animate-spin" /> : null}
                      {s}
                    </button>
                  </Button>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Sizing profile overlay modal */}
      {isMeasurementModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md rounded-3xl border border-[#ECE6D6] bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#ECE6D6] pb-4 mb-4">
              <div>
                <h3 className="text-lg font-bold text-[#1A1208]">Custom Sizing Profile</h3>
                <p className="text-xs text-[#7A6B44] mt-0.5">
                  {selectedMeasurementItem?.product_title_snapshot || "Order Item"}
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsMeasurementModalOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-xl text-[#7A6B44]/60 hover:bg-[#F8F5ED] hover:text-[#7A6B44] transition-all cursor-pointer p-0 min-w-0 min-h-0 border-none"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-3.5 max-h-[60vh] overflow-y-auto">
              {(() => {
                const data = selectedMeasurementItem?.measurement_data ?? displayOrder.measurement_data ?? {};
                const keys = Object.keys(data);
                if (keys.length === 0) {
                  return (
                    <div className="py-8 text-center text-sm text-[#7A6B44]">
                      No digital body measurements found for this item.
                    </div>
                  );
                }
                return (
                  <div className="grid grid-cols-2 gap-3.5">
                    {keys.map((k) => (
                      <div key={k} className="rounded-xl border border-[#ECE6D6] bg-[#FAFAF8] p-3">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-[#7A6B44]">{k.replace(/_/g, " ")}</p>
                        <p className="mt-1 text-sm font-bold text-[#1A1208]">{String(data[k])}</p>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>

            <div className="mt-6 flex justify-end">
              <Button
                type="button"
                variant="primary"
                onClick={() => setIsMeasurementModalOpen(false)}
                className="rounded-xl bg-[#FDA600] text-black hover:bg-[#E8960A] px-5 py-2.5 text-xs font-bold transition cursor-pointer border-none"
              >
                Close details
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}






// ── Product Composer ──────────────────────────────────────────────────────────
// ── Resume Draft Banner ─────────────────────────────────────────────────────────────
function ResumeDraftBanner() {
  const draftKey   = useDraftStore((s) => s.draft_key);
  const syncStatus = useDraftStore((s) => s.syncStatus);
  const step       = useDraftStore((s) => s.current_step);
  const resetStore = useDraftStore((s) => s.resetStore);

  if (!draftKey || syncStatus === "idle") return null;

  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-[#01454A]/30 bg-[#E6F4F5] px-6 py-4">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-[#01454A] text-white">
          <RefreshCw className="h-4 w-4" />
        </div>
        <div>
          <p className="text-sm font-bold text-[#01454A]">Unsaved product draft detected</p>
          <p className="mt-0.5 text-xs text-[#01454A]/70">
            You started building a product (step {step ?? 1} of 8). Resume where you left off or discard.
          </p>
        </div>
      </div>
      <div className="flex gap-2 flex-shrink-0">
        <Button
          type="button"
          variant="secondary"
          onClick={() => { resetStore(); }}
          className="rounded-xl border border-[#01454A]/30 px-4 py-2 text-xs font-semibold text-[#01454A] hover:bg-[#01454A]/10 transition h-auto min-h-0"
        >
          Discard draft
        </Button>
        <Link
          href="/vendor/products"
          className="rounded-xl bg-[#01454A] px-4 py-2 text-xs font-bold text-white hover:bg-[#01454A]/90 transition"
        >
          Resume building
        </Link>
      </div>
    </div>
  );
}

export function VendorProductComposerView() {
  const router   = useRouter();
  const qc       = useQueryClient();
  const vendorId = useAuthStore((s) => s.user?.id ?? "anonymous");
  const productSlugRef    = useRef<string | null>(null);
  const updateMutation    = useUpdateProduct(productSlugRef.current ?? "");

  const handleBuilderSubmit = async (values: ProductBuilderFormValues, productId: string | null) => {
    const sizeIds   = (values.size_ids   ?? []) as string[];
    const colorIds  = (values.color_ids  ?? []) as string[];
    const tagIds    = (values.tag_ids    ?? []) as string[];
    const hotDeal   = (values.hot_deal   ?? false) as boolean;
    const isDigital = (values.digital    ?? false) as boolean;

    let savedSlug: string | null = productSlugRef.current;
    const sharedPayload = {
      title: values.title, description: values.description,
      short_description: values.short_description ?? "",
      price: values.price, old_price: values.old_price ?? undefined,
      currency: values.currency ?? "NGN",
      shipping_amount: values.shipping_amount ?? "0.00",
      stock_qty: values.stock_qty as number,
      requires_measurement: values.requires_measurement as boolean,
      is_customisable: values.is_customisable as boolean,
      category_ids: values.category_ids,
      sub_category_ids: values.sub_category_ids ?? [],
      size_ids: sizeIds, color_ids: colorIds, tag_ids: tagIds,
      hot_deal: hotDeal, digital: isDigital,
      weight_kg: values.weight_kg || undefined,
      condition: values.condition,
      meta_title: values.meta_title || undefined,
      meta_description: values.meta_description || undefined,
      variants: (values.variants ?? []).map(v => ({
        size_id: v.size_id || null,
        color_id: v.color_id || null,
        price_override: v.price_override || null,
        stock_qty: v.stock_qty ?? 0,
        sku: v.sku || undefined,
        is_active: v.is_active ?? true,
      })),
    };

    if (productSlugRef.current) {
      await updateMutation.mutateAsync(sharedPayload);
    } else if (productId) {
      savedSlug = productId;
      productSlugRef.current = productId;
    }

    // Draft commit owns creation. This parent only handles optional review submission and navigation.
    if (values.publish_intent === "pending" && savedSlug) await publishProduct(savedSlug);
    void qc.invalidateQueries({ queryKey: productKeys.lists() });
    void qc.invalidateQueries({ queryKey: productKeys.vendorList() });
    router.push("/vendor/products/catalog");
  };

  return (
    <div className="space-y-6">
      {/* Resume Draft banner — shown if a draft session is active */}
      <ResumeDraftBanner />

      <div className="flex items-center justify-between rounded-2xl bg-white border border-[#ECE6D6] px-8 py-6 shadow-sm">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-[#7A6B44]">Product Studio</p>
          <h1 className="mt-1 font-bon_foyage text-4xl text-[#1A1208]">Add New Product</h1>
        </div>
        <Link href="/vendor/products/catalog"
          className="rounded-xl border border-[#D9D9D9] px-5 py-2.5 text-sm font-semibold text-[#5A6465] transition hover:bg-[#F8F5ED]">
          Open catalog
        </Link>
      </div>
      <div className="rounded-3xl bg-white border border-[#ECE6D6] text-[#1A1208] p-8 shadow-sm relative overflow-hidden">
        <ProductBuilderProvider vendorId={vendorId} onSubmit={handleBuilderSubmit}>
          <ProductBuilder />
        </ProductBuilderProvider>
      </div>
    </div>
  );
}

// ── Catalog View ──────────────────────────────────────────────────────────────
function formatPrice(v: number) {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(v);
}

// formatDate unused and removed

function CatalogProductCard({ product }: { product: ProductListItem }) {
  return (
    <div className="group rounded-2xl bg-white border border-[#ECE6D6] p-5 shadow-sm transition-all hover:shadow-md hover:border-[#FDA600]/30 flex gap-4 items-center">
      {product.image_url ? (
        <div className="relative h-20 w-20 overflow-hidden rounded-xl bg-[#F8F5ED] border border-[#ECE6D6] flex-shrink-0">
          <FashionistarImage src={product.image_url} alt={product.title} fill={true} objectFit="cover" imgClassName="transition-transform group-hover:scale-105 animate-fadeIn" />
        </div>
      ) : (
        <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-xl bg-[#F8F5ED] border border-[#ECE6D6] text-[#FDA600]">
          <ShoppingBag className="h-8 w-8" />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            {product.sku && (
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#7A6B44] mb-0.5">{product.sku}</p>
            )}
            <h2 className="text-sm font-bold text-[#1A1208] truncate leading-tight">{product.title}</h2>
            {product.category_name && (
              <p className="text-[11px] text-[#7A6B44]/75 mt-0.5">{product.category_name}</p>
            )}
          </div>
          <StatusBadge status={product.in_stock ? "published" : "disabled"} />
        </div>
        <div className="mt-2.5 flex items-center justify-between text-xs text-[#5A6465] gap-2 flex-wrap">
          <span className="font-bold text-[#1A1208]">{formatPrice(Number(product.price))}</span>
          <span className="flex items-center gap-1">
            <Package className="h-3.5 w-3.5 text-[#FDA600]" /> Stock: {product.stock_qty}
          </span>
        </div>
      </div>
    </div>
  );
}

export function VendorProductCatalogView() {
  const { data, isLoading, isError, error } = useVendorCatalogProducts();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const products = data?.results ?? [];

  const categories = ["All", ...Array.from(new Set(products.map((p) => p.category_name).filter(Boolean) as string[]))];

  const filtered = products.filter((p) => {
    const matchesSearch = !search || p.title.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === "All" || p.category_name === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Catalog"
        title="My Products"
        description="Browse, manage, and update your entire product catalog."
        action={
          <Link href="/vendor/products"
            className="inline-flex items-center gap-2 rounded-xl bg-[#FDA600] px-5 py-2.5 text-sm font-bold text-black transition hover:bg-[#f28705] shadow-sm">
            <Plus className="h-4 w-4" /> New product
          </Link>
        }
      />

      {/* Search and category filter row */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#BDBDBD]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products by title..."
            className="h-11 w-full rounded-xl border border-[#D9D9D9] bg-white pl-10 pr-4 text-sm outline-none transition focus:border-[#FDA600] focus:ring-2 focus:ring-[#FDA600]/15"
          />
        </div>

        {/* Category filter tabs */}
        {categories.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            {categories.map((cat: string) => (
              <Button key={cat} asChild>
                <button
                  onClick={() => setSelectedCategory(cat)}
                  className={`rounded-xl px-4 py-2 text-xs font-bold transition-all border whitespace-nowrap h-auto ${
                    selectedCategory === cat
                      ? "bg-[#FDA600] border-[#FDA600] text-black shadow-sm"
                      : "bg-white border-[#ECE6D6] text-[#7A6B44] hover:bg-[#F8F5ED]"
                  }`}
                >
                  {cat}
                </button>
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      {isLoading && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1,2,3].map((i) => <SkeletonCard key={i} className="h-24" />)}
        </div>
      )}
      {isError && (
        <div className="rounded-2xl border border-red-100 bg-red-50 p-6 text-sm text-red-700">
          Could not load catalog. {error instanceof Error ? error.message : ""}
        </div>
      )}
      {!isLoading && !isError && filtered.length === 0 && (
        <div className="rounded-2xl border border-dashed border-[#D9D9D9] bg-white p-12 text-center">
          <ShoppingBag className="mx-auto h-10 w-10 text-[#D9D9D9] mb-3" />
          <p className="text-sm font-semibold text-[#1A1208]">
            {search ? "No products match your search" : "No products yet"}
          </p>
          <p className="mt-1 text-xs text-[#7A6B44]">
            {search ? "Try a different search term" : "Create your first product to get started."}
          </p>
          {!search && (
            <Link href="/vendor/products" className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#FDA600] px-5 py-2.5 text-sm font-bold text-black transition hover:bg-[#f28705]">
              <Plus className="h-4 w-4" /> Create product
            </Link>
          )}
        </div>
      )}
      {!isLoading && !isError && filtered.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => <CatalogProductCard key={p.slug} product={p} />)}
        </div>
      )}
    </div>
  );
}

// ── Analytics View ────────────────────────────────────────────────────────────
const PIE_COLORS = ["#FDA600", "#01454A", "#01454A", "#7A6B44", "#E8960A", "#01454A"];

export function VendorAnalyticsView() {
  const { data: summary, isLoading, isError } = useVendorAnalyticsSummary();
  const { data: dashboard } = useVendorDashboard();
  const [range, setRange] = useState<"7d" | "30d" | "90d" | "1y">("30d");
  const analytics = dashboard?.analytics;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Insights"
        title="Analytics"
        description="Live performance metrics — revenue, orders, and growth trends."
        action={
          <div className="flex gap-1 rounded-xl bg-[#FAFAF8] border border-[#ECE6D6] p-1 shadow-sm">
            {(["7d", "30d", "90d", "1y"] as const).map((r) => (
              <Button key={r} asChild>
                <button
                  onClick={() => setRange(r)}
                  className={`rounded-lg px-3 py-1 text-xs font-bold transition-all h-auto ${
                    range === r
                      ? "bg-[#FDA600] text-black shadow-sm"
                      : "text-[#7A6B44] hover:bg-[#F8F5ED] hover:text-[#1A1208]"
                  }`}
                >
                  {r === "7d" ? "7d" : r === "30d" ? "30d" : r === "90d" ? "90d" : "1y"}
                </button>
              </Button>
            ))}
          </div>
        }
      />
      {isError && (
        <div className="rounded-2xl border border-[#F2C9C9] bg-[#FFF7F7] p-4 text-sm text-[#8A3B3B]">
          Extended analytics endpoint unavailable. Dashboard snapshot shown where available.
        </div>
      )}

      {/* Group 1: Sales & Revenue Performance */}
      <div className="space-y-4">
        <h2 className="text-xs font-black uppercase tracking-[0.2em] text-[#7A6B44] flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-[#FDA600]" />
          Sales & Revenue Performance
        </h2>
        <div className="grid gap-4 md:grid-cols-4">
          <KpiCard
            title="Total Revenue"
            icon={TrendingUp}
            value={isLoading ? "—" : `₦${(summary?.total_revenue ?? analytics?.total_revenue ?? 0).toLocaleString()}`}
            hint="Gross revenue tracked"
            trend={summary?.revenue_trend}
            accent="gold"
          />
          <KpiCard
            title="Today's Sales"
            icon={Clock}
            value={isLoading ? "—" : `₦${(summary?.todays_sales ?? 0).toLocaleString()}`}
            hint="Sales recorded today"
            accent="green"
          />
          <KpiCard
            title="This Month"
            icon={ShoppingBag}
            value={isLoading ? "—" : `₦${(summary?.this_month_sales ?? 0).toLocaleString()}`}
            hint="Sales recorded this month"
            accent="blue"
          />
          <KpiCard
            title="Year to Date"
            icon={Store}
            value={isLoading ? "—" : `₦${(summary?.year_to_date_sales ?? 0).toLocaleString()}`}
            hint="Sales recorded this year"
            accent="gold"
          />
        </div>
      </div>

      {/* Group 2: Operations & Customers */}
      <div className="space-y-4">
        <h2 className="text-xs font-black uppercase tracking-[0.2em] text-[#7A6B44] flex items-center gap-2">
          <ShoppingCart className="h-4 w-4 text-[#01454A]" />
          Operations & Customers
        </h2>
        <div className="grid gap-4 md:grid-cols-4">
          <KpiCard
            title="Total Orders"
            icon={ShoppingCart}
            value={isLoading ? "—" : String(summary?.total_orders ?? analytics?.total_sales ?? 0)}
            hint="All-time transactions"
            accent="blue"
          />
          <KpiCard
            title="Avg. Order Value"
            icon={CreditCard}
            value={isLoading ? "—" : `₦${(summary?.avg_order_value ?? 0).toLocaleString()}`}
            hint="Per transaction average"
            accent="gold"
          />
          <KpiCard
            title="Total Customers"
            icon={Users}
            value={isLoading ? "—" : String(summary?.total_customers ?? 0)}
            hint="Unique buying customers"
            accent="green"
          />
          <KpiCard
            title="Conversion Rate"
            icon={Zap}
            value={isLoading ? "—" : `${(summary?.conversion_rate ?? 0).toFixed(1)}%`}
            hint="Visit-to-sale rate"
            accent="red"
          />
        </div>
      </div>

      {/* Group 3: Catalog & Shop Status */}
      <div className="space-y-4">
        <h2 className="text-xs font-black uppercase tracking-[0.2em] text-[#7A6B44] flex items-center gap-2">
          <Package className="h-4 w-4 text-[#1A4B8C]" />
          Catalog & Shop Status
        </h2>
        <div className="grid gap-4 md:grid-cols-4">
          <KpiCard
            title="Total Products"
            icon={Package}
            value={isLoading ? "—" : String(summary?.total_products ?? analytics?.total_products ?? 0)}
            hint="Active catalog items"
            accent="gold"
          />
          <KpiCard
            title="Low Stock Alerts"
            icon={AlertTriangle}
            value={isLoading ? "—" : String(summary?.low_stock_count ?? 0)}
            hint="Stock quantity below 5"
            accent="red"
          />
          <KpiCard
            title="Wallet Balance"
            icon={Wallet}
            value={isLoading ? "—" : `₦${(summary?.wallet_balance ?? 0).toLocaleString()}`}
            hint="Available payout balance"
            accent="green"
          />
          <KpiCard
            title="Store Rating"
            icon={Star}
            value={isLoading ? "—" : (summary?.average_rating ?? analytics?.average_rating ?? 0.0).toFixed(1)}
            hint={`${summary?.review_count ?? analytics?.review_count ?? 0} reviews total`}
            accent="blue"
          />
        </div>
      </div>

      {/* Group 4: Promotional & Marketing Engagement */}
      <div className="space-y-4">
        <h2 className="text-xs font-black uppercase tracking-[0.2em] text-[#7A6B44] flex items-center gap-2">
          <Tag className="h-4 w-4 text-[#DC2626]" />
          Marketing & Promotions
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          <KpiCard
            title="Active Coupons"
            icon={Tag}
            value={isLoading ? "—" : String(summary?.active_coupons ?? 0)}
            hint="Currently active coupons"
            accent="green"
          />
          <KpiCard
            title="Inactive Coupons"
            icon={Tag}
            value={isLoading ? "—" : String(summary?.inactive_coupons ?? 0)}
            hint="Expired or paused coupons"
            accent="red"
          />
        </div>
      </div>

      {/* Revenue + Orders charts side-by-side */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl bg-white border border-[#ECE6D6] p-7 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FDA600]/10">
                <TrendingUp className="h-4 w-4 text-[#FDA600]" />
              </div>
              <h2 className="text-base font-bold text-[#1A1208]">Revenue Trend</h2>
            </div>
            <Badge color="gold">6-month</Badge>
          </div>
          <VendorRevenueAreaChart />
        </div>

        <div className="rounded-3xl bg-white border border-[#ECE6D6] p-7 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#01454A]/10">
                <ShoppingCart className="h-4 w-4 text-[#01454A]" />
              </div>
              <h2 className="text-base font-bold text-[#1A1208]">Monthly Orders</h2>
            </div>
            <Badge color="green">Bar chart</Badge>
          </div>
          <VendorOrderBarChart />
        </div>
      </div>

      {/* Payment Distribution + Top Categories side-by-side */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl bg-white border border-[#ECE6D6] p-7 shadow-sm">
          <div className="flex items-center gap-2 mb-5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1d4ed8]/10">
              <CreditCard className="h-4 w-4 text-[#1d4ed8]" />
            </div>
            <h2 className="text-base font-bold text-[#1A1208]">Payment Methods</h2>
          </div>
          <VendorPaymentPieChart />
        </div>

        <div className="rounded-3xl bg-white border border-[#ECE6D6] p-7 shadow-sm">
          <div className="flex items-center gap-2 mb-5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#7c3aed]/10">
              <Tag className="h-4 w-4 text-[#7c3aed]" />
            </div>
            <h2 className="text-base font-bold text-[#1A1208]">Top Categories</h2>
          </div>
          <VendorTopCategoriesChart />
        </div>
      </div>
    </div>
  );
}

// ── Revenue Area Chart Helper ─────────────────────────────────────────────────
function VendorRevenueAreaChart() {
  const { data: rawChart, isLoading } = useVendorRevenueChart();
  const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  const chartArr = Array.isArray(rawChart)
    ? rawChart
    : Array.isArray((rawChart as { data?: unknown[] })?.data)
    ? (rawChart as { data: unknown[] }).data
    : [];

  const points: { month: string; revenue: number }[] = chartArr.length
    ? chartArr.map((p) => ({
        month:   String((p as { month?: string; label?: string }).month ?? (p as { label?: string }).label ?? "—"),
        revenue: Number((p as { revenue?: number; value?: number }).revenue ?? (p as { value?: number }).value ?? 0),
      }))
    : MONTHS.slice(0, 6).map((m) => ({ month: m, revenue: 0 }));

  if (isLoading) return <SkeletonCard className="h-52" />;

  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={points} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#FDA600" stopOpacity={0.28} />
            <stop offset="95%" stopColor="#FDA600" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#F0EDE4" vertical={false} />
        <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#7A6B44" }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: "#7A6B44" }} axisLine={false} tickLine={false}
          tickFormatter={(v: number) => v >= 1000 ? `₦${(v/1000).toFixed(0)}k` : `₦${v}`} />
        <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #ECE6D6", fontSize: "12px" }}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          formatter={(value: any) => {
            const num = Number(value ?? 0);
            return [`₦${isNaN(num) ? String(value ?? "") : num.toLocaleString()}`, "Revenue"] as [string, string];
          }} />
        <Area type="monotone" dataKey="revenue" stroke="#FDA600" strokeWidth={2.5}
          fill="url(#revGrad)" dot={false} activeDot={{ r: 5, fill: "#FDA600" }} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// ── Monthly Orders Bar Chart ──────────────────────────────────────────────────
function VendorOrderBarChart() {
  const { data: rawChart, isLoading } = useVendorOrderChart();
  const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  const chartArr = Array.isArray(rawChart)
    ? rawChart
    : Array.isArray((rawChart as { data?: unknown[] })?.data)
    ? (rawChart as { data: unknown[] }).data
    : [];

  const points: { month: string; orders: number }[] = chartArr.length
    ? chartArr.map((p) => ({
        month:  String((p as { month?: string; label?: string }).month ?? (p as { label?: string }).label ?? "—"),
        orders: Number((p as { orders?: number; count?: number }).orders ?? (p as { count?: number }).count ?? 0),
      }))
    : MONTHS.slice(0, 6).map((m) => ({ month: m, orders: 0 }));

  if (isLoading) return <SkeletonCard className="h-52" />;

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={points} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="orderGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"  stopColor="#01454A" stopOpacity={0.85} />
            <stop offset="100%" stopColor="#01454A" stopOpacity={0.4} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#F0EDE4" vertical={false} />
        <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#7A6B44" }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: "#7A6B44" }} axisLine={false} tickLine={false} allowDecimals={false} />
        <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #ECE6D6", fontSize: "12px" }}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          formatter={(value: any) => [String(value), "Orders"]} />
        <Bar dataKey="orders" fill="url(#orderGrad)" radius={[6, 6, 0, 0]} maxBarSize={40} />
      </BarChart>
    </ResponsiveContainer>
  );
}

// ── Payment Distribution Pie Chart ───────────────────────────────────────────
function VendorPaymentPieChart() {
  const { data: rawDist, isLoading } = useVendorPaymentDistribution();

  const dist = Array.isArray(rawDist)
    ? rawDist
    : Array.isArray((rawDist as { data?: unknown[] })?.data)
    ? (rawDist as { data: unknown[] }).data
    : [];

  const items: { name: string; value: number }[] = dist.length
    ? dist.map((d) => ({
        name:  String((d as { method?: string; payment_method?: string; name?: string }).method ??
                       (d as { payment_method?: string }).payment_method ??
                       (d as { name?: string }).name ?? "Other"),
        value: Number((d as { count?: number; value?: number; total?: number }).count ??
                       (d as { value?: number }).value ??
                       (d as { total?: number }).total ?? 0),
      }))
    : [
        { name: "Card", value: 45 },
        { name: "Transfer", value: 35 },
        { name: "Wallet", value: 15 },
        { name: "Cash", value: 5 },
      ];

  if (isLoading) return <SkeletonCard className="h-52" />;

  return (
    <div className="flex flex-col items-center gap-4">
      <ResponsiveContainer width="100%" height={180}>
        <PieChart>
          <Pie
            data={items}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={80}
            paddingAngle={3}
            dataKey="value"
          >
            {items.map((_, i) => (
              <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ borderRadius: "12px", border: "1px solid #ECE6D6", fontSize: "12px" }}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            formatter={(value: any) => [String(value), ""]}
          />
          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: "11px", color: "#7A6B44" }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

// ── Top Categories Horizontal Bar Chart ──────────────────────────────────────
function VendorTopCategoriesChart() {
  const { data: rawCats, isLoading } = useVendorTopCategories();

  const cats = Array.isArray(rawCats)
    ? rawCats
    : Array.isArray((rawCats as { data?: unknown[] })?.data)
    ? (rawCats as { data: unknown[] }).data
    : [];

  const items: { name: string; revenue: number }[] = cats.length
    ? cats.slice(0, 6).map((c) => ({
        name:    String((c as { name?: string; category?: string; category_name?: string }).name ??
                         (c as { category?: string }).category ??
                         (c as { category_name?: string }).category_name ?? "Unnamed"),
        revenue: Number((c as { revenue?: number; total?: number; count?: number }).revenue ??
                         (c as { total?: number }).total ??
                         (c as { count?: number }).count ?? 0),
      }))
    : [
        { name: "Gowns", revenue: 1200000 },
        { name: "Suits", revenue: 850000 },
        { name: "Casual", revenue: 640000 },
        { name: "Bridal", revenue: 520000 },
        { name: "Agbada", revenue: 380000 },
      ];

  if (isLoading) return <SkeletonCard className="h-52" />;

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart
        layout="vertical"
        data={items}
        margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#F0EDE4" horizontal={false} />
        <XAxis
          type="number"
          tick={{ fontSize: 11, fill: "#7A6B44" }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v: number) => v >= 1000 ? `₦${(v/1000).toFixed(0)}k` : String(v)}
        />
        <YAxis
          type="category"
          dataKey="name"
          tick={{ fontSize: 11, fill: "#7A6B44" }}
          axisLine={false}
          tickLine={false}
          width={60}
        />
        <Tooltip
          contentStyle={{ borderRadius: "12px", border: "1px solid #ECE6D6", fontSize: "12px" }}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          formatter={(value: any) => {
            const num = Number(value ?? 0);
            return [`₦${isNaN(num) ? String(value) : num.toLocaleString()}`, "Revenue"];
          }}
        />
        <Bar dataKey="revenue" fill="#01454A" radius={[0, 6, 6, 0]} maxBarSize={20} />
      </BarChart>
    </ResponsiveContainer>
  );
}


// ── Wallet View ───────────────────────────────────────────────────────────────
export function VendorWalletView() {
  const { data: dashboard, isLoading } = useVendorDashboard();
  const wallet     = dashboard?.wallet;
  const payout     = dashboard?.payout_profile;
  const isVerified = payout?.is_verified ?? false;
  const balance    = wallet?.balance ?? 0;
  const txCount    = (wallet?.recent_transactions ?? []).length;

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Finance" title="Wallet" description="Your earnings, live balance, and transaction history." />

      {/* Premium balance hero */}
      <div
        className="relative overflow-hidden rounded-3xl text-white"
        style={{
          background: "linear-gradient(135deg, #0f1d0b 0%, #01454A 50%, #0a2010 100%)",
          boxShadow: "0 20px 60px rgba(15,29,11,0.35), 0 4px 20px rgba(253,166,0,0.08)",
        }}
      >
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full opacity-15"
          style={{ background: "radial-gradient(circle, #FDA600 0%, transparent 70%)" }} />
        <div className="pointer-events-none absolute -bottom-10 left-12 h-36 w-36 rounded-full opacity-8"
          style={{ background: "radial-gradient(circle, #FDA600 0%, transparent 70%)" }} />
        <div className="relative z-10 p-7 md:p-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.25em] text-white/30">Available Balance</p>
              <p className="mt-2 text-4xl font-bold text-[#FDA600] md:text-5xl">
                {isLoading ? "—" : `₦${balance.toLocaleString()}`}
              </p>
              <p className="mt-1.5 text-xs text-white/30">
                {txCount} recent transaction{txCount !== 1 ? "s" : ""}
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row md:flex-col xl:flex-row">
              <Link
                href="/vendor/payouts"
                className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-black transition-all hover:scale-105"
                style={{ background: "linear-gradient(135deg, #FDA600 0%, #E8960A 100%)", boxShadow: "0 4px 18px rgba(253,166,0,0.35)" }}
              >
                <Zap className="h-4 w-4" /> {isVerified ? "Request Payout" : "Set Up Payouts"}
              </Link>
              <Link
                href="/vendor/transactions"
                className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/8 px-5 py-2.5 text-sm font-bold text-white transition-all hover:bg-white/15 backdrop-blur-sm"
              >
                <ArrowRight className="h-4 w-4" /> All Transactions
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid gap-4 md:grid-cols-3">
        <KpiCard title="Balance" icon={Wallet}
          value={isLoading ? "—" : `₦${balance.toLocaleString()}`}
          hint="Available wallet balance" accent="gold" />
        <KpiCard title="Payout Status" icon={Zap}
          value={isVerified ? "Ready" : "Not set up"}
          hint={isVerified ? "Bank verified — ready to withdraw" : "Add bank details"}
          accent={isVerified ? "green" : "red"} />
        <KpiCard title="Bank" icon={CreditCard}
          value={payout?.bank_name || "Not added"}
          hint={payout?.account_last4 ? `Account ····${payout.account_last4}` : "Add bank account"}
          accent="blue" />
      </div>

      {/* Payout setup nudge */}
      {!isVerified && (
        <div
          className="flex items-center justify-between gap-4 rounded-2xl border px-5 py-4"
          style={{ background: "#FFF6E3", borderColor: "rgba(253,166,0,0.3)" }}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FDA600]/15 flex-shrink-0">
              <Zap className="h-4 w-4 text-[#FDA600]" />
            </div>
            <div>
              <p className="text-sm font-bold text-[#B37700]">Complete payout setup</p>
              <p className="mt-0.5 text-xs text-[#7A6B44]">Add your bank details to start receiving withdrawals.</p>
            </div>
          </div>
          <Link href="/vendor/payouts"
            className="flex-shrink-0 inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-black transition hover:scale-105"
            style={{ background: "linear-gradient(135deg, #FDA600 0%, #E8960A 100%)" }}>
            Set up <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}

      {/* Transaction history */}
      <div
        className="rounded-3xl bg-white border border-[#ECE6D6] shadow-sm overflow-hidden"
        style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.04)" }}
      >
        <div className="flex items-center justify-between px-7 py-5 border-b border-[#ECE6D6]">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FDA600]/10">
              <Wallet className="h-4 w-4 text-[#FDA600]" />
            </div>
            <h2 className="text-base font-bold text-[#1A1208]">Transaction History</h2>
          </div>
          <Badge color="gold">{txCount} recent</Badge>
        </div>
        <div className="p-4">
          <Transactions />
        </div>
      </div>
    </div>
  );
}

// ── Payouts View ──────────────────────────────────────────────────────────────
function PinSetupSection() {
  const [pinForm, setPinForm] = useState({ pin: "", confirm_pin: "" });
  const setPin = useSetVendorPin();

  const handleSetPin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pinForm.pin !== pinForm.confirm_pin) return;
    try {
      await setPin.mutateAsync({ pin: pinForm.pin, confirm_pin: pinForm.confirm_pin });
      toast.success("Wallet PIN set successfully.");
      setPinForm({ pin: "", confirm_pin: "" });
    } catch {
      toast.error("Could not set PIN. Try again.");
    }
  };

  return (
    <form onSubmit={handleSetPin}
      className="rounded-3xl bg-white border border-[#ECE6D6] p-8 shadow-sm space-y-5">
      <div className="flex items-center gap-3 mb-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FDA600]/10 text-[#FDA600]">
          <Key className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-base font-bold text-[#1A1208]">Wallet PIN</h2>
          <p className="text-xs text-[#7A6B44]">Set a 4-digit PIN to authorise wallet withdrawals.</p>
        </div>
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-1.5">
          <FieldLabel htmlFor="pin-new">New PIN (4 digits)</FieldLabel>
          <TextInput id="pin-new" type="password" maxLength={4} inputMode="numeric" required placeholder="••••"
            value={pinForm.pin}
            onChange={(e) => setPinForm((c) => ({ ...c, pin: e.target.value.replace(/\D/g, "") }))} />
        </div>
        <div className="space-y-1.5">
          <FieldLabel htmlFor="pin-confirm">Confirm PIN</FieldLabel>
          <TextInput id="pin-confirm" type="password" maxLength={4} inputMode="numeric" required placeholder="••••"
            value={pinForm.confirm_pin}
            onChange={(e) => setPinForm((c) => ({ ...c, confirm_pin: e.target.value.replace(/\D/g, "") }))} />
        </div>
      </div>
      {pinForm.pin && pinForm.confirm_pin && pinForm.pin !== pinForm.confirm_pin && (
        <p className="text-xs font-semibold text-red-500">PINs do not match.</p>
      )}
      <div className="flex justify-end">
        <PrimaryButton type="submit" loading={setPin.isPending}
          disabled={pinForm.pin !== pinForm.confirm_pin || pinForm.pin.length < 4}>
          Set wallet PIN <Key className="h-4 w-4" />
        </PrimaryButton>
      </div>
    </form>
  );
}

export function VendorPayoutsView() {
  const { data: dashboard } = useVendorDashboard();
  const walletBalance = dashboard?.wallet?.balance ?? 0;
  const [activeTab, setActiveTab] = useState<"accounts" | "pin">("accounts");

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Finance"
        title="Payouts"
        description="Manage your bank accounts and request withdrawals."
        action={
          <PayoutGateGuard walletBalance={walletBalance} renderTrigger />
        }
      />

      {/* Tabs */}
      <div className="flex gap-1 border-b border-[#ECE6D6]">
        {([
          { id: "accounts", label: "Bank Accounts", icon: Landmark },
          { id: "pin", label: "Wallet PIN", icon: Key },
        ] as const).map(({ id, label, icon: Icon }) => (
          <Button key={id} asChild>
            <button
              type="button"
              className={[
                "flex items-center gap-1.5 px-5 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors cursor-pointer h-auto",
                activeTab === id
                  ? "border-[#FDA600] text-[#1A1208]"
                  : "border-transparent text-[#7A6B44] hover:text-[#1A1208]",
              ].join(" ")}
              onClick={() => setActiveTab(id)}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          </Button>
        ))}
      </div>

      {activeTab === "accounts" && (
        <BankAccountsList />
      )}

      {activeTab === "pin" && (
        <PinSetupSection />
      )}
    </div>
  );
}



// ── KYC View ──────────────────────────────────────────────────────────────────
export function VendorKycView() {
  const { data: setupState } = useVendorSetupState();
  const { data: dashboard } = useVendorDashboard();
  const { data: statusData } = useNinjaKycStatus();
  const { data: docsData, isLoading: docsLoading } = useNinjaKycDocuments();
  const initiateKyc = useInitiateKyc();
  const recordDoc = useRecordKycDocument();

  // Mock upload progress states
  const [selectedDocType, setSelectedDocType] = useState<KycDocumentType>("nin_card");
  const [docNumber, setDocNumber] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const kycStatus = statusData?.status ?? "not_started";
  const isApproved = statusData?.is_approved ?? false;
  const isBankVerified = dashboard?.payout_profile?.is_verified ?? false;

  const identityUploaded = docsData?.documents?.some((d) =>
    ["nin_card", "passport", "drivers_license", "voters_card", "selfie"].includes(d.document_type)
  ) ?? false;
  const cacUploaded = docsData?.documents?.some((d) => d.document_type === "cac_certificate") ?? false;
  const bvnUploaded = docsData?.documents?.some((d) => d.document_type === "bvn_slip") ?? false;

  const kycSteps = [
    { label: "Identity Upload", desc: "NIN or International Passport", done: identityUploaded || isApproved },
    { label: "Business Information", desc: "CAC Certificate (Optional)", done: cacUploaded || setupState?.profile_complete },
    { label: "Payout Integration", desc: "Verified bank account linked", done: isBankVerified || bvnUploaded },
    { label: "Full Verification", desc: "Compliance team approval", done: isApproved },
  ];

  const handleFileUploadSimulated = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadProgress(0);
    setUploadSuccess(false);

    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setUploadProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(async () => {
          try {
            const fakeUrl = `https://res.cloudinary.com/fashionistar/image/upload/v1700000000/kyc/user_id/${file.name}`;
            const fakePublicId = `fashionistar/kyc/user_id/${file.name.split(".")[0]}`;

            // Make sure we have a submission
            if (kycStatus === "not_started") {
              await initiateKyc.mutateAsync({});
            }

            await recordDoc.mutateAsync({
              document_type: selectedDocType,
              secure_url: fakeUrl,
              public_id: fakePublicId,
              document_number: docNumber.trim() || undefined,
            });

            setUploadSuccess(true);
            setDocNumber("");
          } catch {
            toast.error("Failed to record document.");
          } finally {
            setUploading(false);
          }
        }, 300);
      }
    }, 100);
  };

  const handleStartKyc = async () => {
    try {
      await initiateKyc.mutateAsync({});
    } catch {
      toast.error("Could not start KYC verification process.");
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Compliance"
        title="KYC Verification"
        description="Verify your identity and business registry to unlock unrestricted withdrawals and unlimited sales limits."
      />

      {/* Modern Horizontal Stepper */}
      <div className="rounded-3xl bg-white border border-[#ECE6D6] p-7 shadow-sm">
        <h2 className="text-base font-bold text-[#1A1208] mb-6">Verification Progress</h2>
        <div className="grid gap-6 md:grid-cols-4">
          {kycSteps.map((step, idx) => {
            const isCompleted = step.done;
            return (
              <div key={idx} className="relative flex flex-col items-start p-4 rounded-2xl border border-[#ECE6D6] bg-[#FAFAF8] transition-all hover:shadow-sm">
                <div className="flex items-center gap-3">
                  <div className={["flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-bold transition-all",
                    isCompleted ? "border-[#01454A] bg-[#01454A] text-white" : "border-[#FDA600]/40 bg-[#FFF6E3] text-[#B37700]",
                  ].join(" ")}>
                    {isCompleted ? <Check className="h-4 w-4" /> : <span>{idx + 1}</span>}
                  </div>
                  <p className="text-xs font-bold uppercase tracking-wider text-[#7A6B44]">Step {idx + 1}</p>
                </div>
                <p className="mt-3 text-sm font-bold text-[#1A1208]">{step.label}</p>
                <p className="mt-1 text-xs text-[#5A6465] leading-normal">{step.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main compliance status card */}
      {kycStatus === "approved" ? (
        <div className="rounded-3xl border border-[#01454A]/20 bg-[#E6F4F5] p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex gap-4">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-[#01454A] text-white">
              <BadgeCheck className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#01454A]">Store KYC Approved ✓</h3>
              <p className="mt-1 text-sm max-w-xl leading-relaxed text-[#01454A]/80">
                Congratulations! Your store is fully verified. You have full withdrawal privileges and featured placement on the Fashionistar marketplace.
              </p>
            </div>
          </div>
        </div>
      ) : kycStatus === "rejected" || kycStatus === "resubmit" ? (
        <div className="rounded-3xl border border-red-200 bg-red-50 p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex gap-4">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-red-600 text-white">
              <XCircle className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-red-700">Verification Rejected / Requires Alteration</h3>
              <p className="mt-1 text-sm max-w-xl leading-relaxed text-red-600">
                The compliance team reviewed your submission and requested adjustments. Please see the notes below and resubmit the corrected documents.
              </p>
              {statusData?.review_notes && (
                <div className="mt-3 rounded-xl bg-white border border-red-150 p-4 text-xs font-semibold text-red-700 font-mono">
                  Feedback: {statusData.review_notes}
                </div>
              )}
            </div>
          </div>
          <Link
            href={`/vendor/support?category=payment_issue&subject=KYC%20Compliance%20Appeal&body=My%20KYC%20verification%20was%20rejected.%20Review%20Notes:%20${encodeURIComponent(statusData?.review_notes || "")}`}
            className="flex-shrink-0 inline-flex items-center gap-2 rounded-xl bg-[#FDA600] px-5 py-3 text-sm font-bold text-black shadow-sm transition hover:bg-[#f28705] hover:shadow-md cursor-pointer"
          >
            Contact Compliance <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : kycStatus === "pending" || kycStatus === "in_review" ? (
        <div className="rounded-3xl border border-[#FDA600]/30 bg-[#FFF6E3] p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex gap-4">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-[#FDA600]/25 text-[#FDA600]">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#B37700]">Verification Pending Compliance Review</h3>
              <p className="mt-1 text-sm max-w-xl leading-relaxed text-[#7A6B44]">
                Your verification request is currently under compliance review. Standard review takes 24-48 business hours. You can continue updating your catalog and processing orders in the meantime.
              </p>
            </div>
          </div>
          <Link href="/vendor/support"
            className="flex-shrink-0 inline-flex items-center gap-2 rounded-xl bg-[#FDA600] px-5 py-3 text-sm font-bold text-black shadow-sm transition hover:bg-[#f28705] hover:shadow-md">
            Contact Support <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <div className="rounded-3xl border border-[#ECE6D6] bg-white p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm">
          <div className="flex gap-4">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-[#FDA600]/10 text-[#FDA600]">
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#1A1208]">Start Verification</h3>
              <p className="mt-1 text-sm max-w-xl leading-relaxed text-[#5A6465]">
                Complete your identity check to enable bank payouts and boost your shop rating on the Fashionistar marketplace.
              </p>
            </div>
          </div>
          <Button asChild>
            <button
              onClick={handleStartKyc}
              disabled={initiateKyc.isPending}
              className="flex-shrink-0 inline-flex items-center gap-2 rounded-xl bg-[#FDA600] px-5 py-3 text-sm font-bold text-black shadow-sm transition hover:bg-[#f28705] hover:shadow-md disabled:opacity-60 cursor-pointer h-auto"
            >
              {initiateKyc.isPending ? "Starting..." : "Begin Compliance Check"}
              <ArrowRight className="h-4 w-4" />
            </button>
          </Button>
        </div>
      )}

      {/* Dynamic Upload Zone if not verified */}
      {!isApproved && kycStatus !== "not_started" && (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Upload panel */}
          <div className="rounded-3xl bg-white border border-[#ECE6D6] p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FDA600]/10 text-[#FDA600]">
                <Upload className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-[#1A1208]">Document Upload Zone</h3>
            </div>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <FieldLabel htmlFor="doc-type">Document Type *</FieldLabel>
                <select
                  id="doc-type"
                  value={selectedDocType}
                  onChange={(e) => setSelectedDocType(e.target.value as KycDocumentType)}
                  className="h-10 w-full rounded-xl border border-[#D9D9D9] bg-white px-3 text-sm outline-none transition focus:border-[#FDA600]"
                >
                  <option value="nin_card">National Identification Number (NIN)</option>
                  <option value="bvn_slip">Bank Verification Number (BVN)</option>
                  <option value="passport">International Passport</option>
                  <option value="drivers_license">Driver's License</option>
                  <option value="voters_card">Voter's Card</option>
                  <option value="cac_certificate">CAC Certificate (Corporate)</option>
                  <option value="selfie">Selfie / Live Portrait</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <FieldLabel htmlFor="doc-number">Document Number (Optional)</FieldLabel>
                <TextInput
                  id="doc-number"
                  placeholder="e.g. NIN or Passport ID"
                  value={docNumber}
                  onChange={(e) => setDocNumber(e.target.value)}
                />
              </div>

              {/* Drag and Drop Box */}
              <div className="relative border-2 border-dashed border-[#ECE6D6] hover:border-[#FDA600]/60 rounded-2xl p-6 text-center cursor-pointer transition bg-[#FAFAF8] group">
                <input
                  type="file"
                  id="kyc-file-selector"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={handleFileUploadSimulated}
                  disabled={uploading}
                />
                <div className="flex flex-col items-center gap-2">
                  <div className="h-10 w-10 rounded-xl bg-white border border-[#ECE6D6] flex items-center justify-center text-[#7A6B44] group-hover:text-[#FDA600] transition">
                    <Upload className="h-5 w-5" />
                  </div>
                  <p className="text-sm font-semibold text-[#1A1208]">
                    {uploading ? `Uploading document... ${uploadProgress}%` : "Choose file or drag here"}
                  </p>
                  <p className="text-xs text-[#7A6B44]">PNG, JPG, PDF up to 5MB</p>
                </div>

                {uploading && (
                  <div className="absolute inset-0 bg-white/80 rounded-2xl flex flex-col items-center justify-center p-4">
                    <div className="w-full bg-[#ECE6D6] h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-[#FDA600] h-full transition-all duration-100"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold text-black mt-2">Uploading to secure storage ({uploadProgress}%)</span>
                  </div>
                )}
              </div>

              {uploadSuccess && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 flex items-center gap-2 text-xs font-semibold text-emerald-800">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>Document uploaded and recorded successfully!</span>
                </div>
              )}
            </div>
          </div>

          {/* List of uploaded files */}
          <div className="rounded-3xl bg-white border border-[#ECE6D6] p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-[#1A1208]">Registered Documents</h3>
            {docsLoading ? (
              <div className="space-y-2">
                {[1, 2].map((i) => (
                  <div key={i} className="h-12 rounded-xl bg-[#F5F3EE] animate-pulse" />
                ))}
              </div>
            ) : !docsData?.documents || docsData.documents.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center text-[#7A6B44]">
                <FileCheck className="h-8 w-8 text-[#ECE6D6] mb-2" />
                <p className="text-xs">No documents registered yet. Start uploading your NIN/Passport above.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                {docsData.documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between border border-[#ECE6D6] rounded-xl p-3 bg-[#FAFAF8]">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                        <FileCheck className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#1A1208] capitalize">{doc.document_type.replace(/_/g, " ")}</p>
                        <p className="text-[10px] text-[#7A6B44]">
                          Uploaded {new Date(doc.uploaded_at || Date.now()).toLocaleDateString("en-NG")}
                        </p>
                      </div>
                    </div>
                    <span className={["rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider",
                      doc.provider_verified ? "bg-[#E6F4F5] text-[#01454A]" : "bg-[#FFF6E3] text-[#B37700]"
                    ].join(" ")}>
                      {doc.provider_verified ? "Verified" : "Under review"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Document Checkpoints Section */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* National Identity Card */}
        <div className="rounded-3xl bg-white border border-[#ECE6D6] p-6 shadow-sm flex flex-col justify-between min-h-[220px]">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-widest text-[#7A6B44]">Identity ID</span>
              {identityUploaded || isApproved ? <Badge color="green">Verified ✓</Badge> : <Badge color="gold">Missing</Badge>}
            </div>
            <h4 className="text-base font-bold text-[#1A1208]">NIN / International Passport</h4>
            <p className="mt-2 text-xs text-[#5A6465] leading-relaxed">
              Official government registry identification. Used to guarantee legally binding seller profiles.
            </p>
          </div>
          <div className="mt-4 pt-4 border-t border-[#F5F3EE] flex items-center justify-between text-xs text-[#7A6B44]">
            <span>Status</span>
            <span className={identityUploaded || isApproved ? "font-semibold text-emerald-700" : "font-semibold text-amber-600"}>
              {identityUploaded || isApproved ? "Active" : "Awaiting NIN slip"}
            </span>
          </div>
        </div>

        {/* BVN */}
        <div className="rounded-3xl bg-white border border-[#ECE6D6] p-6 shadow-sm flex flex-col justify-between min-h-[220px]">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-widest text-[#7A6B44]">Financial Check</span>
              {isBankVerified || bvnUploaded ? <Badge color="green">Linked ✓</Badge> : <Badge color="gold">Under Verification</Badge>}
            </div>
            <h4 className="text-base font-bold text-[#1A1208]">Bank Verification Number</h4>
            <p className="mt-2 text-xs text-[#5A6465] leading-relaxed">
              Biometric verification linked with Nigeria Inter-Bank Settlement System (NIBSS) for Paystack compliance.
            </p>
          </div>
          <div className="mt-4 pt-4 border-t border-[#F5F3EE] flex items-center justify-between text-xs text-[#7A6B44]">
            <span>Bank Link</span>
            <span className={isBankVerified || bvnUploaded ? "font-semibold text-emerald-700" : "font-semibold text-amber-600"}>
              {isBankVerified || bvnUploaded ? "Verified" : "Pending account linkage"}
            </span>
          </div>
        </div>

        {/* CAC Certificate */}
        <div className="rounded-3xl bg-white border border-[#ECE6D6] p-6 shadow-sm flex flex-col justify-between min-h-[220px]">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-widest text-[#7A6B44]">Corporate Check</span>
              {cacUploaded || setupState?.profile_complete ? <Badge color="green">Verified ✓</Badge> : <Badge color="gray">Optional</Badge>}
            </div>
            <h4 className="text-base font-bold text-[#1A1208]">CAC Certificate (Optional)</h4>
            <p className="mt-2 text-xs text-[#5A6465] leading-relaxed">
              Corporate Affairs Commission company registration. Only required for enterprise boutique accounts.
            </p>
          </div>
          <div className="mt-4 pt-4 border-t border-[#F5F3EE] flex items-center justify-between text-xs text-[#7A6B44]">
            <span>CAC Registration</span>
            <span className={cacUploaded || setupState?.profile_complete ? "font-semibold text-emerald-700" : "font-semibold text-amber-600"}>
              {cacUploaded || setupState?.profile_complete ? "Uploaded" : "Pending upload"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Customers View ────────────────────────────────────────────────────────────
function readVal(source: unknown, keys: string[], fallback = "—"): string {
  if (!source || typeof source !== "object") return fallback;
  const rec = source as Record<string, unknown>;
  for (const k of keys) {
    const v = rec[k];
    if (v !== null && v !== undefined && v !== "") return String(v);
  }
  return fallback;
}

function resolveCustomerRows(data: unknown, dashboard?: VendorDashboard) {
  const source = Array.isArray(data) ? data :
    data && typeof data === "object" && Array.isArray((data as { data?: unknown }).data)
      ? (data as { data: unknown[] }).data : [];

  if (source.length > 0) {
    return source.map((c, i) => ({
      id:     readVal(c, ["id", "email", "name"], `customer-${i}`),
      name:   readVal(c, ["name", "buyer_full_name", "buyer_email", "email"]),
      date:   readVal(c, ["date", "last_order_date", "created_at"]),
      status: readVal(c, ["status", "segment"], "customer"),
      rating: readVal(c, ["rating", "average_rating"], "—"),
      orders: readVal(c, ["items", "order_count", "orders"], "0"),
    }));
  }
  return (dashboard?.recent_orders ?? []).map((o) => ({
    id:     String(o.id),
    name:   o.buyer_full_name || o.buyer_email || "Customer",
    date:   o.date,
    status: o.order_status,
    rating: "—",
    orders: "1",
  }));
}

export function VendorCustomersView() {
  const { data, isLoading, isError } = useVendorCustomerBehavior();
  const { data: dashboard }          = useVendorDashboard();
  const rows = resolveCustomerRows(data, dashboard);

  return (
    <div className="space-y-8">
      <PageHeader eyebrow="Commerce" title="Customers"
        description="Review customer activity derived from your order analytics." />
      {isError && (
        <div className="rounded-2xl border border-[#F2C9C9] bg-[#FFF7F7] p-4 text-sm text-[#8A3B3B]">
          Extended analytics unavailable — showing recent order customers.
        </div>
      )}
      <div className="rounded-3xl bg-white border border-[#ECE6D6] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-[#F8F5ED]">
              <tr className="text-left text-xs font-bold uppercase tracking-widest text-[#7A6B44]">
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Rating</th>
                <th className="px-6 py-4">Orders</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F5F3EE]">
              {isLoading ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-sm text-[#7A6B44]">Loading...</td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-sm text-[#7A6B44]">No customer activity yet.</td></tr>
              ) : rows.map((c) => (
                <tr key={`${c.id}-${c.date}`} className="hover:bg-[#FAFAF8] transition-colors">
                  <td className="px-6 py-4 text-sm font-semibold text-[#1A1208]">{c.name}</td>
                  <td className="px-6 py-4 text-xs text-[#7A6B44]">{c.date}</td>
                  <td className="px-6 py-4"><StatusBadge status={c.status} /></td>
                  <td className="px-6 py-4 text-sm text-[#5A6465]">{c.rating}</td>
                  <td className="px-6 py-4 text-sm text-[#5A6465]">{c.orders}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── Payments View ─────────────────────────────────────────────────────────────
export function VendorPaymentsView() {
  const { data: dashboard, isLoading } = useVendorDashboard();
  const wallet = dashboard?.wallet;

  return (
    <div className="space-y-8">
      <PageHeader eyebrow="Finance" title="Payments"
        description="Payment records and invoice history for your store." />
      <div className="grid gap-4 md:grid-cols-3">
        <KpiCard title="Wallet balance" icon={Wallet}
          value={isLoading ? "—" : `₦${(wallet?.balance ?? 0).toLocaleString()}`}
          hint="Current wallet balance" />
        <KpiCard title="Revenue" icon={TrendingUp}
          value={isLoading ? "—" : `₦${(dashboard?.analytics.total_revenue ?? 0).toLocaleString()}`}
          hint="Total gross revenue" />
        <KpiCard title="Orders paid" icon={PackageCheck}
          value={isLoading ? "—" : String(dashboard?.analytics.total_sales ?? 0)}
          hint="Paid order count" />
      </div>

      <div className="rounded-3xl bg-white border border-[#ECE6D6] shadow-sm overflow-hidden">
        <div className="px-7 py-5 border-b border-[#ECE6D6]">
          <h2 className="text-base font-bold text-[#1A1208]">Recent Transactions</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-[#F8F5ED]">
              <tr className="text-left text-xs font-bold uppercase tracking-widest text-[#7A6B44]">
                <th className="px-6 py-4">Description</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F5F3EE]">
              {isLoading ? (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-sm text-[#7A6B44]">Loading...</td></tr>
              ) : (wallet?.recent_transactions ?? []).length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-12 text-center text-sm text-[#7A6B44]">No transactions yet.</td></tr>
              ) : wallet?.recent_transactions.map((tx, i) => (
                <tr key={`${tx.date}-${i}`} className="hover:bg-[#FAFAF8] transition-colors">
                  <td className="px-6 py-4 text-sm text-[#1A1208]">{tx.description || "—"}</td>
                  <td className="px-6 py-4"><StatusBadge status={tx.transaction_type} /></td>
                  <td className="px-6 py-4 text-xs text-[#7A6B44]">{tx.date}</td>
                  <td className="px-6 py-4 text-right text-sm font-bold text-[#1A1208]">
                    ₦{tx.amount.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── Settings View ─────────────────────────────────────────────────────────────
export function VendorSettingsView() {
  return <VendorSettingsContainer />;
}

function VendorSettingsContainer() {
  const { data: profile } = useVendorProfile();
  const submitSetup = useSubmitVendorSetup();
  const [activeTab, setActiveTab] = useState<"profile" | "branding" | "security" | "notifications">("profile");

  const [form, setForm] = useState({
    store_name: "",
    tagline: "",
    description: "",
    city: "",
    state: "",
    country: "Nigeria",
    website_url: "",
    instagram_url: "",
    tiktok_url: "",
    twitter_url: "",
    logo_url: "",
    cover_url: "",
  });
  const [settingsAddress, setSettingsAddress] = useState<AddressSelection>(() => emptyAddressSelection());

  const [notifPreferences, setNotifPreferences] = useState({
    orders: true,
    payouts: true,
    lowStock: true,
    reviews: false,
    chat: true,
  });

  useEffect(() => {
    if (profile) {
      setSettingsAddress(emptyAddressSelection(profile.city, profile.state, profile.country || "Nigeria"));
      setForm({
        store_name: profile.store_name || "",
        tagline: profile.tagline || "",
        description: profile.description || "",
        city: profile.city || "",
        state: profile.state || "",
        country: profile.country || "Nigeria",
        website_url: profile.website_url || "",
        instagram_url: profile.instagram_url || "",
        tiktok_url: profile.tiktok_url || "",
        twitter_url: profile.twitter_url || "",
        logo_url: profile.logo_url || "",
        cover_url: profile.cover_url || "",
      });
    }
  }, [profile]);

  const handleSettingsAddressChange = (next: AddressSelection) => {
    setSettingsAddress(next);
    setForm((cur) => applyAddressSelection(cur, next));
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await submitSetup.mutateAsync({
        ...form,
        collection_ids: profile?.collections?.map((c) => c.id) || [],
      });
    } catch {
      toast.error("Could not update profile details. Please try again.");
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Account"
        title="Settings"
        description="Manage your boutique branding, location coordinates, API webhook payouts, and alert configurations."
      />

      {/* Settings Navigation Tabs */}
      <div className="flex gap-1 border-b border-[#ECE6D6]">
        {[
          { key: "profile", label: "Store Profile", icon: Store },
          { key: "branding", label: "Branding Assets", icon: Globe },
          { key: "security", label: "Security & PIN", icon: Key },
          { key: "notifications", label: "Alert Toggles", icon: Tag },
        ].map((t) => {
          const TabIcon = t.icon;
          return (
            <Button key={t.key} asChild>
              <button
                type="button"
                className={["flex items-center gap-1.5 px-5 py-3 text-sm font-semibold border-b-2 -mb-px transition-colors h-auto",
                  activeTab === t.key ? "border-[#FDA600] text-[#1A1208]" : "border-transparent text-[#7A6B44] hover:text-[#1A1208]",
                ].join(" ")}
                onClick={() => setActiveTab(t.key as typeof activeTab)}
              >
                <TabIcon className="h-4 w-4" />
                {t.label}
              </button>
            </Button>
          );
        })}
      </div>

      {activeTab === "profile" && (
        <form onSubmit={handleProfileSubmit} className="rounded-3xl bg-white border border-[#ECE6D6] p-7 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-[#F5F3EE] pb-4">
            <h2 className="text-lg font-bold text-[#1A1208]">Edit Boutique Information</h2>
            {submitSetup.isSuccess && <Badge color="green">Profile Sync'd ✓</Badge>}
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-1.5">
              <FieldLabel htmlFor="set-store-name">Store Name *</FieldLabel>
              <TextInput
                id="set-store-name"
                required
                value={form.store_name}
                onChange={(e) => setForm((c) => ({ ...c, store_name: e.target.value }))}
                placeholder="e.g. Lagos Bespoke House"
              />
            </div>

            <div className="space-y-1.5">
              <FieldLabel htmlFor="set-tagline">Tagline</FieldLabel>
              <TextInput
                id="set-tagline"
                value={form.tagline}
                onChange={(e) => setForm((c) => ({ ...c, tagline: e.target.value }))}
                placeholder="e.g. Authentic premium craftsmanship"
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <FieldLabel htmlFor="set-description">Description *</FieldLabel>
              <TextArea
                id="set-description"
                required
                value={form.description}
                onChange={(e) => setForm((c) => ({ ...c, description: e.target.value }))}
                placeholder="Tell customers about your tailoring specialties..."
              />
            </div>

            <div className="space-y-3 md:col-span-2">
              <FieldLabel>Store location *</FieldLabel>
              <AddressReferenceField
                value={settingsAddress}
                onChange={handleSettingsAddressChange}
              />
              <p className="text-xs font-medium text-[#7A6B44]">
                This keeps your marketplace location, delivery region, and vendor profile aligned.
              </p>
            </div>

            <div className="space-y-1.5">
              <FieldLabel htmlFor="set-website">Website URL</FieldLabel>
              <TextInput
                id="set-website"
                value={form.website_url}
                onChange={(e) => setForm((c) => ({ ...c, website_url: e.target.value }))}
                placeholder="https://yourbrand.com"
              />
            </div>

            <div className="space-y-1.5">
              <FieldLabel htmlFor="set-instagram">Instagram URL</FieldLabel>
              <TextInput
                id="set-instagram"
                value={form.instagram_url}
                onChange={(e) => setForm((c) => ({ ...c, instagram_url: e.target.value }))}
                placeholder="https://instagram.com/yourbrand"
              />
            </div>

            <div className="space-y-1.5">
              <FieldLabel htmlFor="set-tiktok">TikTok URL</FieldLabel>
              <TextInput
                id="set-tiktok"
                value={form.tiktok_url}
                onChange={(e) => setForm((c) => ({ ...c, tiktok_url: e.target.value }))}
                placeholder="https://tiktok.com/@yourbrand"
              />
            </div>

            <div className="space-y-1.5">
              <FieldLabel htmlFor="set-twitter">X / Twitter URL</FieldLabel>
              <TextInput
                id="set-twitter"
                value={form.twitter_url}
                onChange={(e) => setForm((c) => ({ ...c, twitter_url: e.target.value }))}
                placeholder="https://x.com/yourbrand"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[#F5F3EE]">
            <PrimaryButton type="submit" loading={submitSetup.isPending}>
              Update Boutique Info <Check className="h-4 w-4" />
            </PrimaryButton>
          </div>
        </form>
      )}

      {activeTab === "branding" && (
        <form onSubmit={handleProfileSubmit} className="rounded-3xl bg-white border border-[#ECE6D6] p-7 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-[#F5F3EE] pb-4">
            <h2 className="text-lg font-bold text-[#1A1208]">Branding Assets</h2>
            <Badge color="gold">Real-time Preview</Badge>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Logo Section */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <FieldLabel htmlFor="set-logo-url">Logo Image URL</FieldLabel>
                <TextInput
                  id="set-logo-url"
                  value={form.logo_url}
                  onChange={(e) => setForm((c) => ({ ...c, logo_url: e.target.value }))}
                  placeholder="Cloudinary image asset secure URL"
                />
              </div>
              <div className="rounded-2xl border border-[#ECE6D6] bg-[#FAFAF8] p-5 flex flex-col items-center justify-center min-h-[140px]">
                {form.logo_url ? (
                  <FashionistarImage src={form.logo_url} alt="Boutique Logo Preview" width={80} height={80} imgClassName="h-20 w-20 rounded-full object-cover border border-[#ECE6D6] shadow-inner" />
                ) : (
                  <div className="text-center text-xs text-[#7A6B44]">
                    <Store className="mx-auto h-8 w-8 text-[#ECE6D6] mb-2" />
                    <span>No logo URL configured. Previews show fallback boutique icon.</span>
                  </div>
                )}
              </div>
            </div>

            {/* Cover Banner Section */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <FieldLabel htmlFor="set-cover-url">Cover Banner Image URL</FieldLabel>
                <TextInput
                  id="set-cover-url"
                  value={form.cover_url}
                  onChange={(e) => setForm((c) => ({ ...c, cover_url: e.target.value }))}
                  placeholder="Cloudinary banner image secure URL"
                />
              </div>
              <div className="rounded-2xl border border-[#ECE6D6] bg-[#FAFAF8] p-5 flex flex-col items-center justify-center min-h-[140px]">
                {form.cover_url ? (
                  <FashionistarImage src={form.cover_url} alt="Cover Banner Preview" width={800} height={80} imgClassName="h-20 w-full rounded-lg object-cover border border-[#ECE6D6]" />
                ) : (
                  <div className="text-center text-xs text-[#7A6B44]">
                    <Globe className="mx-auto h-8 w-8 text-[#ECE6D6] mb-2" />
                    <span>No banner configured. Previews display default marketplace hero gradient.</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[#F5F3EE]">
            <PrimaryButton type="submit" loading={submitSetup.isPending}>
              Save Branding Assets <Check className="h-4 w-4" />
            </PrimaryButton>
          </div>
        </form>
      )}

      {activeTab === "security" && (
        <div className="rounded-3xl bg-white border border-[#ECE6D6] p-7 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-[#F5F3EE] pb-4">
            <h2 className="text-lg font-bold text-[#1A1208]">Store Security & Auth</h2>
            <Badge color="green">Active Session</Badge>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-[#ECE6D6] bg-[#FAFAF8] p-5 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-[#1A1208]">Wallet Security PIN</h4>
                <p className="text-xs text-[#7A6B44] mt-1">PIN is required to authenticate withdrawals to your linked bank account.</p>
              </div>
              <Link href="/vendor/payouts" className="inline-flex items-center gap-1 rounded-xl bg-[#FDA600] px-4 py-2 text-xs font-bold text-black hover:bg-[#E8960A] transition">
                Change PIN <Key className="h-3 w-3" />
              </Link>
            </div>

            <div className="rounded-2xl border border-[#ECE6D6] bg-[#FAFAF8] p-5 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-[#1A1208]">API Integrations</h4>
                <p className="text-xs text-[#7A6B44] mt-1">Access secure webhooks and custom checkout endpoints for external boutique sites.</p>
              </div>
              <Badge color="gray">Sandboxed</Badge>
            </div>
          </div>
        </div>
      )}

      {activeTab === "notifications" && (
        <div className="rounded-3xl bg-white border border-[#ECE6D6] p-7 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-[#F5F3EE] pb-4">
            <h2 className="text-lg font-bold text-[#1A1208]">Notification Preferences</h2>
            <Badge color="green">System Sync'd</Badge>
          </div>

          <div className="divide-y divide-[#F5F3EE]">
            {[
              { key: "orders", label: "New Orders Placed", desc: "Receive email & push notifications immediately when a customer purchases a product." },
              { key: "payouts", label: "Payout Completions", desc: "Get notified when bank withdrawals succeed or complete manual compliance reviews." },
              { key: "lowStock", label: "Low Stock Warnings", desc: "Alerts when catalog products fall below 5 items remaining in stock." },
              { key: "reviews", label: "Customer Reviews", desc: "Alert when buyers publish verified review stars or feedback." },
              { key: "chat", label: "Customer Chat Messages", desc: "Real-time push updates for instant messages from active bespoke clients." },
            ].map((p) => (
              <div key={p.key} className="py-4 flex items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-bold text-[#1A1208]">{p.label}</h4>
                  <p className="text-xs text-[#7A6B44] mt-0.5 leading-relaxed">{p.desc}</p>
                </div>
                <Button asChild>
                  <button
                    type="button"
                    onClick={() => setNotifPreferences((c) => ({ ...c, [p.key]: !c[p.key as keyof typeof notifPreferences] }))}
                    className={["relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none h-auto",
                      notifPreferences[p.key as keyof typeof notifPreferences] ? "bg-[#FDA600]" : "bg-gray-200",
                    ].join(" ")}
                  >
                    <span
                      className={["pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                        notifPreferences[p.key as keyof typeof notifPreferences] ? "translate-x-5" : "translate-x-0",
                      ].join(" ")}
                    />
                  </button>
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Transactions View ─────────────────────────────────────────────────────────
export function VendorTransactionsView() {
  const { data: dashboard } = useVendorDashboard();
  const transactions = dashboard?.wallet?.recent_transactions ?? [];

  return (
    <div className="space-y-8">
      <PageHeader eyebrow="Finance" title="Transactions"
        description="Complete transaction log for your store wallet." />
      <div className="rounded-3xl bg-white border border-[#ECE6D6] shadow-sm overflow-hidden">
        <div className="px-7 py-5 border-b border-[#ECE6D6] flex items-center justify-between">
          <h2 className="text-base font-bold text-[#1A1208]">All Transactions</h2>
          <Badge color="gold">{transactions.length} records</Badge>
        </div>
        <div className="p-4">
          <Transactions />
        </div>
      </div>
    </div>
  );
}

// ── Overview Tiles (used on /vendor page redirect) ────────────────────────────
export function VendorOverviewTiles() {
  const { data: dashboard } = useVendorDashboard();
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <KpiCard title="Store"    icon={Store}    value="Ready"  hint="Core setup is modular." />
      <KpiCard title="Payout"   icon={Zap}      value={dashboard?.payout_profile?.is_verified ? "Verified" : "Not set"} hint="Withdrawal from Wallet." />
      <KpiCard title="Catalog"  icon={Package}  value="Active" hint="Products and catalog separated." />
      <KpiCard title="Customers" icon={Users}   value={String(dashboard?.analytics.total_sales ?? 0)} hint="Total order count." />
    </div>
  );
}

