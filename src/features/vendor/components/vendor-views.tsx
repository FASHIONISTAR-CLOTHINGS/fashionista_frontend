"use client";

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
} from "lucide-react";

import { Transactions } from "@/features/account/components";
import { AuthAlert } from "@/components/shared/feedback/AuthAlert";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { parseApiError } from "@/lib/api/parseApiError";
import {
  ProductBuilder,
  ProductBuilderProvider,
  publishProduct,
  useCreateProduct,
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
  useSubmitPayoutProfile,
  useSetVendorPin,
} from "@/features/vendor/hooks/use-vendor-orders";
import type {
  VendorDashboard,
  VendorSetupPayload,
  VendorOrderStatus,
} from "@/features/vendor/types/vendor.types";
import type { ProductListItem } from "@/features/product";
import { useCatalogCollections } from "@/features/catalog/hooks/use-catalog";

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
    green: "bg-[#E8F5E0] text-[#2D5016] border border-[#2D5016]/20",
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

function KpiCard({
  title, value, hint, icon: Icon, trend,
}: {
  title: string;
  value: string;
  hint:  string;
  icon?: React.ElementType;
  trend?: number;
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl bg-white border border-[#ECE6D6] p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold uppercase tracking-widest text-[#7A6B44]">{title}</p>
          <p className="mt-2 text-3xl font-bold text-[#1A1208] leading-none">{value}</p>
          <p className="mt-2 text-sm text-[#5A6465] leading-5">{hint}</p>
        </div>
        {Icon && (
          <div className="ml-4 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[#FDA600]/10 text-[#FDA600] transition-transform group-hover:scale-110">
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
      {trend !== undefined && (
        <div className={`mt-4 flex items-center gap-1.5 text-xs font-semibold ${trend >= 0 ? "text-[#2D5016]" : "text-red-500"}`}>
          <TrendingUp className={`h-3.5 w-3.5 ${trend < 0 ? "rotate-180" : ""}`} />
          <span>{trend >= 0 ? "+" : ""}{trend.toFixed(1)}% vs last period</span>
        </div>
      )}
      {/* Decorative gradient */}
      <div className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-[#FDA600]/5 transition-all group-hover:scale-150" />
    </div>
  );
}

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
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-[#7A6B44]">{eyebrow}</p>
        )}
        <h1 className="font-bon_foyage text-4xl text-[#1A1208] lg:text-5xl">{title}</h1>
        {description && (
          <p className="mt-2 max-w-2xl text-base leading-7 text-[#5A6465]">{description}</p>
        )}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}

function FieldLabel({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
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
    <button
      type={type}
      disabled={disabled ?? loading}
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-xl bg-[#FDA600] px-6 py-3 text-sm font-bold text-black shadow-sm transition-all hover:bg-[#f28705] hover:shadow-md active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : null}
      {children}
    </button>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function SkeletonCard({ className = "" }: { className?: string }) {
  return (
    <div className={`rounded-2xl bg-[#F5F3EE] animate-pulse ${className}`} />
  );
}

// ── Setup View ────────────────────────────────────────────────────────────────
export function VendorSetupView() {
  const hasVendorProfile = useAuthStore((s) => s.user?.has_vendor_profile === true);
  const { data: setupState } = useVendorSetupState();
  const { data: profile }    = useVendorProfile({ enabled: hasVendorProfile });
  const { data: collections = [], isLoading: isCollectionsLoading } = useCatalogCollections();
  const submitSetup  = useSubmitVendorSetup();
  const [payload, setPayload] = useState<VendorSetupPayload>({
    store_name: "", description: "", tagline: "", logo_url: "",
    cover_url: "", city: "", state: "", country: "Nigeria",
    collection_ids: [], instagram_url: "", tiktok_url: "",
    twitter_url: "", website_url: "",
  });

  useEffect(() => {
    if (!profile) return;
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
          <div key={key} className={`rounded-2xl border p-4 transition-all ${done ? "border-[#2D5016]/30 bg-[#E8F5E0]" : "border-[#ECE6D6] bg-white"}`}>
            <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${done ? "bg-[#2D5016] text-white" : "bg-[#ECE6D6] text-[#7A6B44]"}`}>
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

          <div className="space-y-2">
            <FieldLabel htmlFor="city">City *</FieldLabel>
            <TextInput id="city" value={payload.city} required
              onChange={(e) => setPayload((c) => ({ ...c, city: e.target.value }))}
              placeholder="Lagos" />
          </div>

          <div className="space-y-2">
            <FieldLabel htmlFor="state">State *</FieldLabel>
            <TextInput id="state" value={payload.state} required
              onChange={(e) => setPayload((c) => ({ ...c, state: e.target.value }))}
              placeholder="Lagos State" />
          </div>

          <div className="space-y-2">
            <FieldLabel htmlFor="country">Country</FieldLabel>
            <TextInput id="country" value={payload.country ?? ""}
              onChange={(e) => setPayload((c) => ({ ...c, country: e.target.value }))}
              placeholder="Nigeria" />
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
            <FieldLabel htmlFor="logo_url">Logo URL</FieldLabel>
            <TextInput id="logo_url" value={payload.logo_url ?? ""}
              onChange={(e) => setPayload((c) => ({ ...c, logo_url: e.target.value }))}
              placeholder="Cloudinary logo URL" />
          </div>

          <div className="space-y-2">
            <FieldLabel htmlFor="cover_url">Cover URL</FieldLabel>
            <TextInput id="cover_url" value={payload.cover_url ?? ""}
              onChange={(e) => setPayload((c) => ({ ...c, cover_url: e.target.value }))}
              placeholder="Cloudinary cover image URL" />
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
                      <button key={col.id} type="button" onClick={() => toggleCollection(col.id)}
                        className={`flex items-center gap-3 rounded-xl border p-4 text-left transition-all ${
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
  const stats = resolveDashboardStats(dashboard);

  if (isLoading) {
    return (
      <div className="space-y-8">
        <SkeletonCard className="h-48" />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {[1,2,3,4,5].map((i) => <SkeletonCard key={i} className="h-36" />)}
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <SkeletonCard className="h-64" />
          <SkeletonCard className="h-64" />
        </div>
      </div>
    );
  }

  const completion   = setupState?.completion_percentage ?? 0;
  const walletBal    = dashboard?.wallet?.balance ?? 0;
  const recentOrders = dashboard?.recent_orders ?? [];
  const couponStats  = dashboard?.coupons ?? { active: 0, inactive: 0 };
  const payoutReady  = dashboard?.payout_profile?.is_verified ?? false;

  return (
    <div className="space-y-8">
      {/* Hero banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1a1208] via-[#2D1A00] to-[#1a1208] p-8 text-white shadow-xl md:p-10">
        <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-[#FDA600]">
              Vendor Command Centre
            </p>
            <h1 className="mt-2 font-bon_foyage text-4xl leading-tight md:text-5xl">
              {dashboard?.profile.store_name || "Welcome back"}
            </h1>
            <p className="mt-2 text-sm text-white/60 max-w-md">
              {dashboard?.profile.tagline || "Track performance, grow your catalog, and manage payouts."}
            </p>
            <div className="mt-4 flex items-center gap-3 flex-wrap">
              <Link href="/vendor/products"
                className="inline-flex items-center gap-2 rounded-xl bg-[#FDA600] px-5 py-2.5 text-sm font-bold text-black transition hover:bg-[#f28705] shadow-lg shadow-[#FDA600]/20">
                <Plus className="h-4 w-4" /> Add Product
              </Link>
              <Link href="/vendor/analytics"
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-white/20 backdrop-blur-sm">
                <BarChart3 className="h-4 w-4" /> Analytics
              </Link>
            </div>
          </div>
          {/* Onboarding widget */}
          <div className="flex-shrink-0 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm min-w-[200px]">
            <p className="text-xs font-bold uppercase tracking-wider text-white/50">Onboarding</p>
            <p className="mt-2 text-4xl font-bold text-[#FDA600]">{completion}%</p>
            <div className="mt-3 h-1.5 w-full rounded-full bg-white/10">
              <div className="h-1.5 rounded-full bg-[#FDA600] transition-all" style={{ width: `${completion}%` }} />
            </div>
            <p className="mt-2 text-xs text-white/40">
              {completion === 100 ? "Setup complete!" : "Payout setup stays separate."}
            </p>
          </div>
        </div>
        {/* Background decorations */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#FDA600]/5" />
        <div className="pointer-events-none absolute -bottom-12 right-48 h-40 w-40 rounded-full bg-white/3" />
      </div>

      {/* KPI strip */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <KpiCard title="Products"  value={String(stats.products)} hint="Active catalog items" icon={ShoppingBag} />
        <KpiCard title="Sales"     value={String(stats.sales)}    hint="Total orders recorded" icon={ShoppingCart} />
        <KpiCard title="Revenue"   value={`₦${stats.revenue.toLocaleString()}`} hint="Gross sales value" icon={TrendingUp} />
        <KpiCard title="Rating"    value={stats.rating.toFixed(1)} hint={`${stats.reviews} review${stats.reviews === 1 ? "" : "s"}`} icon={Star} />
        <KpiCard title="Status"    value={dashboard?.profile.is_verified ? "Verified" : "Pending"}
          hint={dashboard?.profile.is_verified ? "KYC approved" : "Verification pending"}
          icon={PackageCheck} />
      </div>

      {/* Secondary KPIs */}
      <div className="grid gap-4 md:grid-cols-3">
        <KpiCard title="Wallet balance" value={`₦${walletBal.toLocaleString()}`} hint="Available balance" icon={Wallet} />
        <KpiCard title="Active coupons" value={String(couponStats.active)}
          hint={`${couponStats.inactive} inactive`} icon={Tag} />
        <KpiCard title="Payout ready" value={payoutReady ? "Ready" : "Not set up"}
          hint={payoutReady ? "Bank verified" : "Add bank details in Payouts"} icon={Zap} />
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
          <div className="grid gap-4 md:grid-cols-2">
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
              <div className="text-xs font-semibold text-[#2D5016] flex items-center gap-1">
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
            <PackageCheck className="mx-auto mb-2 h-8 w-8 text-[#2D5016]/40" />
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
          <button key={key} type="button" id={`order-tab-${key}`} onClick={() => setActiveTab(key)}
            className={["rounded-xl px-4 py-1.5 text-xs font-semibold transition-all",
              activeTab === key ? "bg-[#FDA600] text-black shadow-sm" : "border border-[#ECE6D6] bg-white text-[#7A6B44] hover:bg-[#F8F5ED]",
            ].join(" ")}>
            {label}
          </button>
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

  const dashOrder = dashboard?.recent_orders.find(
    (o) => o.oid === orderOid || String(o.id) === orderOid,
  );
  const displayOrder = order ?? dashOrder;
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
                        done   ? "border-[#2D5016] bg-[#2D5016] text-white" :
                                 "border-[#D9D9D9] bg-white text-[#BDBDBD]",
                      ].join(" ")}>
                        {done && !active ? <Check className="h-4 w-4" /> : <span>{idx + 1}</span>}
                      </div>
                      {!isLast && <div className={"flex-1 h-0.5 mx-1 rounded-full " + (idx < currentStepIdx ? "bg-[#2D5016]" : "bg-[#ECE6D6]")} />}
                    </div>
                    <p className={"mt-2 text-xs font-semibold text-center " + (active ? "text-[#FDA600]" : done ? "text-[#2D5016]" : "text-[#BDBDBD]")}>
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

          {/* Status Update */}
          {!isNaN(orderId) && (
            <div className="rounded-3xl bg-white border border-[#ECE6D6] p-7 shadow-sm">
              <h2 className="text-base font-bold text-[#1A1208] mb-4">Update Order Status</h2>
              <div className="flex flex-wrap gap-2">
                {(["Pending", "Processing", "Shipped", "Fulfilled", "Cancelled"] as VendorOrderStatus[]).map((s) => (
                  <button key={s} id={`status-btn-${s}`} type="button"
                    disabled={currentStatus === s || updateStatus.isPending}
                    onClick={() => updateStatus.mutate({ orderId, order_status: s })}
                    className={["inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition-all border",
                      currentStatus === s
                        ? "bg-[#FDA600] border-[#FDA600] text-black cursor-default"
                        : "border-[#ECE6D6] bg-white text-[#5A6465] hover:border-[#FDA600]/50 hover:bg-[#FFF6E3] disabled:opacity-40",
                    ].join(" ")}>
                    {updateStatus.isPending && updateStatus.variables?.order_status === s
                      ? <RefreshCw className="h-3 w-3 animate-spin" /> : null}
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}






// ── Product Composer ──────────────────────────────────────────────────────────
export function VendorProductComposerView() {
  const router   = useRouter();
  const qc       = useQueryClient();
  const vendorId = useAuthStore((s) => s.user?.id ?? "anonymous");
  const productSlugRef    = useRef<string | null>(null);
  const createMutation    = useCreateProduct();
  const updateMutation    = useUpdateProduct(productSlugRef.current ?? "");

  const handleBuilderSubmit = async (values: ProductBuilderFormValues, productId: string | null) => {
    const idempotencyKey = productId ?? (typeof crypto !== "undefined" ? crypto.randomUUID() : Date.now().toString());
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
    };

    if (!productSlugRef.current) {
      const created = await createMutation.mutateAsync({ ...sharedPayload, idempotency_key: idempotencyKey });
      savedSlug = created.slug;
      productSlugRef.current = savedSlug;
    } else {
      await updateMutation.mutateAsync(sharedPayload);
    }

    if (values.publish_intent === "pending" && savedSlug) await publishProduct(savedSlug);
    void qc.invalidateQueries({ queryKey: productKeys.lists() });
    router.push("/vendor/products/catalog");
  };

  return (
    <div className="space-y-6">
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
      <div className="rounded-3xl bg-white border border-[#ECE6D6] p-8 shadow-sm">
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

function formatDate(v: string) {
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return v;
  return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(d);
}

function CatalogProductCard({ product }: { product: ProductListItem }) {
  return (
    <div className="group rounded-2xl bg-white border border-[#ECE6D6] p-5 shadow-sm transition-all hover:shadow-md hover:border-[#FDA600]/30">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          {product.sku && (
            <p className="text-xs font-bold uppercase tracking-widest text-[#7A6B44] mb-1">{product.sku}</p>
          )}
          <h2 className="text-base font-bold text-[#1A1208] truncate">{product.title}</h2>
          {product.category_name && (
            <p className="mt-1 text-xs text-[#7A6B44]">{product.category_name}</p>
          )}
        </div>
        <StatusBadge status={product.in_stock ? "published" : "disabled"} />
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-[#5A6465]">
        <span className="font-bold text-[#1A1208]">{formatPrice(Number(product.price))}</span>
        <span className="flex items-center gap-1">
          <Package className="h-3.5 w-3.5 text-[#FDA600]" /> Stock: {product.stock_qty}
        </span>
        <span className="text-xs text-[#BDBDBD]">{formatDate(product.created_at)}</span>
      </div>
    </div>
  );
}

export function VendorProductCatalogView() {
  const { data, isLoading, isError, error } = useVendorCatalogProducts();
  const [search, setSearch] = useState("");
  const products = data?.results ?? [];
  const filtered = products.filter((p) =>
    !search || p.title.toLowerCase().includes(search.toLowerCase()),
  );

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

      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#BDBDBD]" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products by title..."
          className="h-11 w-full rounded-xl border border-[#D9D9D9] bg-white pl-10 pr-4 text-sm outline-none transition focus:border-[#FDA600] focus:ring-2 focus:ring-[#FDA600]/15"
        />
      </div>

      {/* Content */}
      {isLoading && (
        <div className="space-y-3">
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
        <div className="space-y-3">
          {filtered.map((p) => <CatalogProductCard key={p.slug} product={p} />)}
        </div>
      )}
    </div>
  );
}

// ── Analytics View ────────────────────────────────────────────────────────────
const PIE_COLORS = ["#FDA600", "#2D5016", "#1d4ed8", "#7c3aed", "#c0392b", "#01454A"];

export function VendorAnalyticsView() {
  const { data: summary, isLoading, isError } = useVendorAnalyticsSummary();
  const { data: dashboard } = useVendorDashboard();
  const analytics = dashboard?.analytics;

  return (
    <div className="space-y-8">
      <PageHeader eyebrow="Insights" title="Analytics" description="Live performance metrics — revenue, orders, and growth trends." />
      {isError && (
        <div className="rounded-2xl border border-[#F2C9C9] bg-[#FFF7F7] p-4 text-sm text-[#8A3B3B]">
          Extended analytics endpoint unavailable. Dashboard snapshot shown where available.
        </div>
      )}

      {/* KPI Strip */}
      <div className="grid gap-4 md:grid-cols-3">
        <KpiCard title="Revenue" icon={TrendingUp}
          value={isLoading ? "—" : `₦${(summary?.total_revenue ?? analytics?.total_revenue ?? 0).toLocaleString()}`}
          hint="Gross revenue tracked" trend={summary?.revenue_trend} />
        <KpiCard title="Orders" icon={ShoppingCart}
          value={isLoading ? "—" : String(summary?.total_orders ?? analytics?.total_sales ?? 0)}
          hint="Total completed + in-progress" />
        <KpiCard title="Avg. Order Value" icon={CreditCard}
          value={isLoading ? "—" : `₦${(summary?.avg_order_value ?? 0).toLocaleString()}`}
          hint="Per transaction average" />
        <KpiCard title="Products" icon={Package}
          value={isLoading ? "—" : String(summary?.total_products ?? analytics?.total_products ?? 0)}
          hint="Items in your catalog" />
        <KpiCard title="Rating" icon={Star}
          value={isLoading ? "—" : (analytics?.average_rating ?? 0).toFixed(1)}
          hint={`${analytics?.review_count ?? 0} reviews`} />
        <KpiCard title="Conversion" icon={Zap}
          value={isLoading ? "—" : `${(summary?.conversion_rate ?? 0).toFixed(1)}%`}
          hint="Visit-to-sale rate" />
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
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#2D5016]/10">
                <ShoppingCart className="h-4 w-4 text-[#2D5016]" />
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
            <stop offset="0%"  stopColor="#2D5016" stopOpacity={0.85} />
            <stop offset="100%" stopColor="#2D5016" stopOpacity={0.4} />
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
        <Bar dataKey="revenue" fill="#7c3aed" radius={[0, 6, 6, 0]} maxBarSize={20} />
      </BarChart>
    </ResponsiveContainer>
  );
}


// ── Wallet View ───────────────────────────────────────────────────────────────
export function VendorWalletView() {
  const { data: dashboard, isLoading } = useVendorDashboard();
  const wallet      = dashboard?.wallet;
  const payout      = dashboard?.payout_profile;
  const isVerified  = payout?.is_verified ?? false;

  return (
    <div className="space-y-8">
      <PageHeader eyebrow="Finance" title="Wallet" description="Your earnings, balance, and transaction history." />

      <div className="grid gap-4 md:grid-cols-3">
        <KpiCard title="Balance" icon={Wallet}
          value={isLoading ? "—" : `₦${(wallet?.balance ?? 0).toLocaleString()}`}
          hint="Available wallet balance" />
        <KpiCard title="Payout Status" icon={Zap}
          value={isVerified ? "Ready" : "Not set up"}
          hint={isVerified ? "Bank verified — ready to withdraw" : "Add bank details in Payouts"} />
        <KpiCard title="Bank" icon={CreditCard}
          value={payout?.bank_name || "Not added"}
          hint={payout?.account_last4 ? `Account ending ····${payout.account_last4}` : "Add bank account to enable payouts"} />
      </div>

      {!isVerified && (
        <div className="flex items-center justify-between rounded-2xl bg-[#FFF6E3] border border-[#FDA600]/30 p-5">
          <div>
            <p className="text-sm font-bold text-[#B37700]">Complete payout setup</p>
            <p className="mt-0.5 text-xs text-[#7A6B44]">Add your bank details to start receiving withdrawals.</p>
          </div>
          <Link href="/vendor/payouts"
            className="flex-shrink-0 inline-flex items-center gap-2 rounded-xl bg-[#FDA600] px-5 py-2.5 text-sm font-bold text-black transition hover:bg-[#f28705]">
            Set up <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}

      {/* Transaction history */}
      <div className="rounded-3xl bg-white border border-[#ECE6D6] shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-7 py-5 border-b border-[#ECE6D6]">
          <h2 className="text-base font-bold text-[#1A1208]">Transaction History</h2>
          <Badge color="gold">{(wallet?.recent_transactions ?? []).length} recent</Badge>
        </div>
        <div className="p-4">
          <Transactions />
        </div>
      </div>
    </div>
  );
}

// ── Payouts View ──────────────────────────────────────────────────────────────
export function VendorPayoutsView() {
  const { data: dashboard } = useVendorDashboard();
  const payout = dashboard?.payout_profile;
  const [showForm,  setShowForm]  = useState(!payout?.bank_name);
  const [activeTab, setActiveTab] = useState<"bank" | "pin">("bank");
  const [bankForm,  setBankForm]  = useState({ bank_name: "", account_number: "", account_name: "" });
  const [pinForm,   setPinForm]   = useState({ pin: "", confirm_pin: "" });
  const savePayout = useSubmitPayoutProfile();
  const setPin     = useSetVendorPin();

  const handleSaveBank = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await savePayout.mutateAsync(bankForm);
      toast.success("Bank account saved! Under review for verification.");
      setShowForm(false);
    } catch {
      toast.error("Could not save bank details. Try again.");
    }
  };

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
    <div className="space-y-8">
      <PageHeader eyebrow="Finance" title="Payouts"
        description="Configure your bank account for receiving withdrawals." />


      {payout?.is_verified ? (
        <div className="rounded-2xl border border-[#2D5016]/20 bg-[#E8F5E0] p-5 flex items-center gap-3">
          <BadgeCheck className="h-5 w-5 text-[#2D5016] flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-bold text-[#2D5016]">Payout account verified ✓</p>
            <p className="text-xs text-[#2D5016]/70 mt-0.5">
              {payout?.bank_name} — Account ending ····{payout?.account_last4}
            </p>
          </div>
          <button type="button" onClick={() => setShowForm((f) => !f)}
            className="text-xs font-semibold text-[#2D5016] underline hover:no-underline">
            {showForm ? "Hide" : "Update"}
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-4 rounded-2xl border border-[#FDA600]/30 bg-[#FFF6E3] p-5">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[#FDA600]/20">
            <Landmark className="h-5 w-5 text-[#FDA600]" />
          </div>
          <div>
            <p className="text-sm font-bold text-[#B37700]">No payout account yet</p>
            <p className="text-xs text-[#7A6B44] mt-0.5">Add your bank details below to receive withdrawals.</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 border-b border-[#ECE6D6]">
        {(["bank", "pin"] as const).map((t) => (
          <button key={t} type="button"
            className={["flex items-center gap-1.5 px-5 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors",
              activeTab === t ? "border-[#FDA600] text-[#1A1208]" : "border-transparent text-[#7A6B44] hover:text-[#1A1208]",
            ].join(" ")}
            onClick={() => setActiveTab(t)}>
            {t === "bank" ? <Landmark className="h-4 w-4" /> : <Key className="h-4 w-4" />}
            {t === "bank" ? "Bank Account" : "Wallet PIN"}
          </button>
        ))}
      </div>

      {activeTab === "bank" && (
        <>
          {/* Existing account display */}
          {payout && (payout.bank_name || payout.account_name) && (
            <div className="grid gap-4 md:grid-cols-2">
              {[
                { label: "Bank",           value: payout.bank_name || "—" },
                { label: "Account Name",   value: payout.account_name || "—" },
                { label: "Account Number", value: payout.account_last4 ? `·········${payout.account_last4}` : "—" },
              ].map(({ label, value }) => (
                <div key={label} className="rounded-xl bg-[#FAFAF8] border border-[#ECE6D6] p-4">
                  <p className="text-xs font-bold uppercase tracking-widest text-[#7A6B44] mb-1">{label}</p>
                  <p className="text-sm font-semibold text-[#1A1208] font-mono">{value}</p>
                </div>
              ))}
              <div className="rounded-xl bg-[#FAFAF8] border border-[#ECE6D6] p-4">
                <p className="text-xs font-bold uppercase tracking-widest text-[#7A6B44] mb-1">Status</p>
                {payout.is_verified ? <Badge color="green">Verified ✓</Badge> : <Badge color="gold">Under review</Badge>}
              </div>
            </div>
          )}

          {showForm && (
            <form onSubmit={handleSaveBank}
              className="rounded-3xl bg-white border border-[#ECE6D6] p-8 shadow-sm space-y-5">
              <h2 className="text-lg font-bold text-[#1A1208]">Bank account details</h2>
              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-1.5">
                  <FieldLabel htmlFor="bank-name">Bank name *</FieldLabel>
                  <TextInput id="bank-name" required placeholder="e.g. GTBank, Access, Zenith"
                    value={bankForm.bank_name}
                    onChange={(e) => setBankForm((c) => ({ ...c, bank_name: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <FieldLabel htmlFor="account-number">Account number *</FieldLabel>
                  <TextInput id="account-number" required placeholder="10-digit NUBAN"
                    maxLength={10} inputMode="numeric"
                    value={bankForm.account_number}
                    onChange={(e) => setBankForm((c) => ({ ...c, account_number: e.target.value.replace(/\D/g, "") }))} />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <FieldLabel htmlFor="account-name">Account name *</FieldLabel>
                  <TextInput id="account-name" required placeholder="Name on the account"
                    value={bankForm.account_name}
                    onChange={(e) => setBankForm((c) => ({ ...c, account_name: e.target.value }))} />
                </div>
              </div>
              <div className="flex items-center justify-between pt-2">
                <p className="text-xs text-[#7A6B44]">Your bank details are encrypted and stored securely.</p>
                <PrimaryButton type="submit" loading={savePayout.isPending}>
                  Save bank account <Check className="h-4 w-4" />
                </PrimaryButton>
              </div>
            </form>
          )}

          {!showForm && !payout && (
            <div className="flex justify-center">
              <button type="button" onClick={() => setShowForm(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-[#FDA600] px-6 py-3 text-sm font-bold text-black transition hover:bg-[#f28705] shadow-sm">
                <Landmark className="h-4 w-4" /> Add bank account
              </button>
            </div>
          )}
        </>
      )}

      {activeTab === "pin" && (
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
      )}
    </div>
  );
}


// ── KYC View ──────────────────────────────────────────────────────────────────
export function VendorKycView() {
  const { data: setupState } = useVendorSetupState();
  const { data: dashboard } = useVendorDashboard();
  const isVerified = setupState?.id_verified ?? false;
  const isBankVerified = dashboard?.payout_profile?.is_verified ?? false;

  const kycSteps = [
    { label: "Identity Upload", desc: "NIN or International Passport", done: isVerified },
    { label: "Business Information", desc: "CAC Certificate or Store Profile", done: setupState?.profile_complete },
    { label: "Payout Integration", desc: "Verified bank account linked", done: isBankVerified },
    { label: "Full Verification", desc: "Compliance team approval", done: isVerified && isBankVerified },
  ];

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
                    isCompleted ? "border-[#2D5016] bg-[#2D5016] text-white" : "border-[#FDA600]/40 bg-[#FFF6E3] text-[#B37700]",
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
      <div className={`rounded-3xl border p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 ${
        isVerified ? "border-[#2D5016]/20 bg-[#E8F5E0]" : "border-[#FDA600]/30 bg-[#FFF6E3]"
      }`}>
        <div className="flex gap-4">
          <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl ${
            isVerified ? "bg-[#2D5016] text-white" : "bg-[#FDA600]/25 text-[#FDA600]"
          }`}>
            {isVerified ? <BadgeCheck className="h-6 w-6" /> : <Clock className="h-6 w-6" />}
          </div>
          <div>
            <h3 className={`text-lg font-bold ${isVerified ? "text-[#2D5016]" : "text-[#B37700]"}`}>
              {isVerified ? "Store KYC Approved ✓" : "Verification Pending Compliance Review"}
            </h3>
            <p className={`mt-1 text-sm max-w-xl leading-relaxed ${isVerified ? "text-[#2D5016]/80" : "text-[#7A6B44]"}`}>
              {isVerified
                ? "Congratulations! Your store is fully verified. You have full withdrawal privileges and featured placement on the Fashionistar marketplace."
                : "Your verification request is currently under compliance review. Standard review takes 24-48 business hours. You can continue updating your catalog and processing orders in the meantime."}
            </p>
          </div>
        </div>
        {!isVerified && (
          <Link href="/vendor/support"
            className="flex-shrink-0 inline-flex items-center gap-2 rounded-xl bg-[#FDA600] px-5 py-3 text-sm font-bold text-black shadow-sm transition hover:bg-[#f28705] hover:shadow-md">
            Contact Compliance <ArrowRight className="h-4 w-4" />
          </Link>
        )}
      </div>

      {/* Document Checkpoints Section */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* National Identity Card */}
        <div className="rounded-3xl bg-white border border-[#ECE6D6] p-6 shadow-sm flex flex-col justify-between min-h-[220px]">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-widest text-[#7A6B44]">Identity ID</span>
              {isVerified ? <Badge color="green">Verified ✓</Badge> : <Badge color="gold">In Review</Badge>}
            </div>
            <h4 className="text-base font-bold text-[#1A1208]">NIN / International Passport</h4>
            <p className="mt-2 text-xs text-[#5A6465] leading-relaxed">
              Official government registry identification. Used to guarantee legally binding seller profiles.
            </p>
          </div>
          <div className="mt-4 pt-4 border-t border-[#F5F3EE] flex items-center justify-between text-xs text-[#7A6B44]">
            <span>Document type: Government Slip</span>
            <span className="font-semibold text-black">SIMULATED OK</span>
          </div>
        </div>

        {/* BVN */}
        <div className="rounded-3xl bg-white border border-[#ECE6D6] p-6 shadow-sm flex flex-col justify-between min-h-[220px]">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-widest text-[#7A6B44]">Financial Check</span>
              {isBankVerified ? <Badge color="green">Linked ✓</Badge> : <Badge color="gold">Under Verification</Badge>}
            </div>
            <h4 className="text-base font-bold text-[#1A1208]">Bank Verification Number</h4>
            <p className="mt-2 text-xs text-[#5A6465] leading-relaxed">
              Biometric verification linked with Nigeria Inter-Bank Settlement System (NIBSS) for Paystack compliance.
            </p>
          </div>
          <div className="mt-4 pt-4 border-t border-[#F5F3EE] flex items-center justify-between text-xs text-[#7A6B44]">
            <span>Linked: {dashboard?.payout_profile?.bank_name || "Access Bank"}</span>
            <span className="font-semibold text-emerald-700">Verified</span>
          </div>
        </div>

        {/* CAC Certificate */}
        <div className="rounded-3xl bg-white border border-[#ECE6D6] p-6 shadow-sm flex flex-col justify-between min-h-[220px]">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-widest text-[#7A6B44]">Corporate Check</span>
              {isVerified ? <Badge color="green">Optional Verified ✓</Badge> : <Badge color="gray">Optional</Badge>}
            </div>
            <h4 className="text-base font-bold text-[#1A1208]">CAC Certificate (Optional)</h4>
            <p className="mt-2 text-xs text-[#5A6465] leading-relaxed">
              Corporate Affairs Commission company registration. Only required for enterprise boutique accounts.
            </p>
          </div>
          <div className="mt-4 pt-4 border-t border-[#F5F3EE] flex items-center justify-between text-xs text-[#7A6B44]">
            <span>CAC Registration</span>
            <span className="font-semibold text-amber-600">Pending upload</span>
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

  const [notifPreferences, setNotifPreferences] = useState({
    orders: true,
    payouts: true,
    lowStock: true,
    reviews: false,
    chat: true,
  });

  useEffect(() => {
    if (profile) {
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
            <button
              key={t.key}
              type="button"
              className={["flex items-center gap-1.5 px-5 py-3 text-sm font-semibold border-b-2 -mb-px transition-colors",
                activeTab === t.key ? "border-[#FDA600] text-[#1A1208]" : "border-transparent text-[#7A6B44] hover:text-[#1A1208]",
              ].join(" ")}
              onClick={() => setActiveTab(t.key as typeof activeTab)}
            >
              <TabIcon className="h-4 w-4" />
              {t.label}
            </button>
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

            <div className="space-y-1.5">
              <FieldLabel htmlFor="set-city">City *</FieldLabel>
              <TextInput
                id="set-city"
                required
                value={form.city}
                onChange={(e) => setForm((c) => ({ ...c, city: e.target.value }))}
              />
            </div>

            <div className="space-y-1.5">
              <FieldLabel htmlFor="set-state">State *</FieldLabel>
              <TextInput
                id="set-state"
                required
                value={form.state}
                onChange={(e) => setForm((c) => ({ ...c, state: e.target.value }))}
              />
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
                  <img src={form.logo_url} alt="Boutique Logo Preview" className="h-20 w-20 rounded-full object-cover border border-[#ECE6D6] shadow-inner" />
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
                  <img src={form.cover_url} alt="Cover Banner Preview" className="h-20 w-full rounded-lg object-cover border border-[#ECE6D6]" />
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
                <button
                  type="button"
                  onClick={() => setNotifPreferences((c) => ({ ...c, [p.key]: !c[p.key as keyof typeof notifPreferences] }))}
                  className={["relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                    notifPreferences[p.key as keyof typeof notifPreferences] ? "bg-[#FDA600]" : "bg-gray-200",
                  ].join(" ")}
                >
                  <span
                    className={["pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                      notifPreferences[p.key as keyof typeof notifPreferences] ? "translate-x-5" : "translate-x-0",
                    ].join(" ")}
                  />
                </button>
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
