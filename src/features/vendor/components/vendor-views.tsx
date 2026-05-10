"use client";

import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  ChartColumn,
  MapPin,
  Package,
  Store,
  Wallet,
} from "lucide-react";

import { Transactions } from "@/features/account/components";
import { useAuthStore } from "@/features/auth/store/auth.store";
import {
  ProductBuilder,
  ProductBuilderProvider,
  publishProduct,
  useCreateProduct,
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
import type {
  VendorDashboard,
  VendorProfile,
  VendorSetupPayload,
} from "@/features/vendor/types/vendor.types";

type VendorStatCardProps = {
  title: string;
  value: string;
  hint: string;
};

function VendorStatCard({ title, value, hint }: VendorStatCardProps) {
  return (
    <div className="rounded-[24px] bg-white p-6 shadow-card_shadow">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#858585]">
        {title}
      </p>
      <p className="mt-4 font-bon_foyage text-4xl leading-none text-black">
        {value}
      </p>
      <p className="mt-3 text-sm leading-6 text-[#5A6465]">{hint}</p>
    </div>
  );
}

function FieldLabel({
  htmlFor,
  children,
}: {
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <label htmlFor={htmlFor} className="text-sm font-semibold text-black">
      {children}
    </label>
  );
}

function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`h-14 w-full rounded-[18px] border border-[#D9D9D9] bg-white px-4 text-black outline-none transition focus:border-[#FDA600] ${props.className ?? ""}`}
    />
  );
}

function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`min-h-[160px] w-full rounded-[18px] border border-[#D9D9D9] bg-white px-4 py-4 text-black outline-none transition focus:border-[#FDA600] ${props.className ?? ""}`}
    />
  );
}

export function VendorSetupView() {
  const router = useRouter();
  const hasVendorProfile = useAuthStore(
    (state) => state.user?.has_vendor_profile === true,
  );
  const { data: setupState } = useVendorSetupState();
  const { data: profile } = useVendorProfile({ enabled: hasVendorProfile });
  const submitSetup = useSubmitVendorSetup();
  const [payload, setPayload] = useState<VendorSetupPayload>({
    store_name: "",
    description: "",
    tagline: "",
    logo_url: "",
    cover_url: "",
    city: "",
    state: "",
    country: "Nigeria",
    instagram_url: "",
    tiktok_url: "",
    twitter_url: "",
    website_url: "",
  });

  useEffect(() => {
    if (!profile) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate setup form from async vendor profile.
    setPayload((current) => ({
      ...current,
      store_name: profile.store_name || current.store_name,
      description: profile.description || current.description,
      tagline: profile.tagline || current.tagline,
      logo_url: profile.logo_url || current.logo_url,
      cover_url: profile.cover_url || current.cover_url,
      city: profile.city || current.city,
      state: profile.state || current.state,
      country: profile.country || current.country,
      instagram_url: profile.instagram_url || current.instagram_url,
      tiktok_url: profile.tiktok_url || current.tiktok_url,
      twitter_url: profile.twitter_url || current.twitter_url,
      website_url: profile.website_url || current.website_url,
    }));
  }, [profile]);

  const completion = setupState?.completion_percentage ?? 0;

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await submitSetup.mutateAsync(payload);
    router.push("/vendor/dashboard");
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8 py-4">
      <section className="rounded-[32px] bg-white p-8 shadow-card_shadow md:p-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="max-w-3xl space-y-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FDA600]/10 text-[#FDA600]">
              <Store className="h-7 w-7" />
            </div>
            <h1 className="font-bon_foyage text-4xl leading-tight text-primary">
              Finish Setting Up Your Vendor Space
            </h1>
            <p className="max-w-2xl text-base leading-7 text-muted-foreground">
              Keep this first step simple: add your shop information, branding,
              and contact details. Bank details and KYC only come later when
              you want to request your first withdrawal.
            </p>
          </div>

          <div className="rounded-[24px] border border-[#ECE6D6] bg-[#F8F5ED] p-5 md:w-[300px]">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#7A6B44]">
              Setup Progress
            </p>
            <p className="mt-3 font-bon_foyage text-4xl text-black">
              {completion}%
            </p>
            <div className="mt-4 h-3 rounded-full bg-white">
              <div
                className="h-3 rounded-full bg-[#FDA600] transition-all"
                style={{ width: `${completion}%` }}
              />
            </div>
            <p className="mt-3 text-sm leading-6 text-[#5A6465]">
              Your dashboard opens as soon as your shop essentials are in place.
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-[24px] bg-white p-6 shadow-card_shadow">
          <h2 className="text-lg font-semibold text-black">What we need now</h2>
          <p className="mt-3 text-sm leading-6 text-[#5A6465]">
            Store name, description, location, and the links your customers
            should see first.
          </p>
        </div>
        <div className="rounded-[24px] bg-white p-6 shadow-card_shadow">
          <h2 className="text-lg font-semibold text-black">What we skip now</h2>
          <p className="mt-3 text-sm leading-6 text-[#5A6465]">
            No bank account, no payout profile, and no KYC friction during this
            first onboarding pass.
          </p>
        </div>
        <div className="rounded-[24px] bg-white p-6 shadow-card_shadow">
          <h2 className="text-lg font-semibold text-black">What comes later</h2>
          <p className="mt-3 text-sm leading-6 text-[#5A6465]">
            Withdrawal setup, payout verification, and compliance checks only
            when the vendor is ready to cash out.
          </p>
        </div>
      </section>

      <form
        onSubmit={onSubmit}
        className="grid gap-8 rounded-[32px] bg-white p-8 shadow-card_shadow md:grid-cols-2 md:p-10"
      >
        <div className="space-y-3">
          <FieldLabel htmlFor="store_name">Store name</FieldLabel>
          <TextInput
            id="store_name"
            value={payload.store_name}
            onChange={(event) =>
              setPayload((current) => ({
                ...current,
                store_name: event.target.value,
              }))
            }
            placeholder="Sapphire Collections"
            required
          />
        </div>

        <div className="space-y-3">
          <FieldLabel htmlFor="tagline">Tagline</FieldLabel>
          <TextInput
            id="tagline"
            value={payload.tagline ?? ""}
            onChange={(event) =>
              setPayload((current) => ({
                ...current,
                tagline: event.target.value,
              }))
            }
            placeholder="Modern tailoring for confident people"
          />
        </div>

        <div className="space-y-3 md:col-span-2">
          <FieldLabel htmlFor="description">Store description</FieldLabel>
          <TextArea
            id="description"
            value={payload.description}
            onChange={(event) =>
              setPayload((current) => ({
                ...current,
                description: event.target.value,
              }))
            }
            placeholder="Tell customers what makes your store special."
            required
          />
        </div>

        <div className="space-y-3">
          <FieldLabel htmlFor="city">City</FieldLabel>
          <TextInput
            id="city"
            value={payload.city}
            onChange={(event) =>
              setPayload((current) => ({ ...current, city: event.target.value }))
            }
            placeholder="Lagos"
            required
          />
        </div>

        <div className="space-y-3">
          <FieldLabel htmlFor="state">State</FieldLabel>
          <TextInput
            id="state"
            value={payload.state}
            onChange={(event) =>
              setPayload((current) => ({ ...current, state: event.target.value }))
            }
            placeholder="Lagos State"
            required
          />
        </div>

        <div className="space-y-3">
          <FieldLabel htmlFor="country">Country</FieldLabel>
          <TextInput
            id="country"
            value={payload.country ?? ""}
            onChange={(event) =>
              setPayload((current) => ({
                ...current,
                country: event.target.value,
              }))
            }
            placeholder="Nigeria"
          />
        </div>

        <div className="space-y-3">
          <FieldLabel htmlFor="website_url">Website</FieldLabel>
          <TextInput
            id="website_url"
            value={payload.website_url ?? ""}
            onChange={(event) =>
              setPayload((current) => ({
                ...current,
                website_url: event.target.value,
              }))
            }
            placeholder="https://your-store.com"
          />
        </div>

        <div className="space-y-3">
          <FieldLabel htmlFor="instagram_url">Instagram</FieldLabel>
          <TextInput
            id="instagram_url"
            value={payload.instagram_url ?? ""}
            onChange={(event) =>
              setPayload((current) => ({
                ...current,
                instagram_url: event.target.value,
              }))
            }
            placeholder="https://instagram.com/yourbrand"
          />
        </div>

        <div className="space-y-3">
          <FieldLabel htmlFor="tiktok_url">TikTok</FieldLabel>
          <TextInput
            id="tiktok_url"
            value={payload.tiktok_url ?? ""}
            onChange={(event) =>
              setPayload((current) => ({
                ...current,
                tiktok_url: event.target.value,
              }))
            }
            placeholder="https://tiktok.com/@yourbrand"
          />
        </div>

        <div className="space-y-3">
          <FieldLabel htmlFor="logo_url">Logo URL</FieldLabel>
          <TextInput
            id="logo_url"
            value={payload.logo_url ?? ""}
            onChange={(event) =>
              setPayload((current) => ({
                ...current,
                logo_url: event.target.value,
              }))
            }
            placeholder="Cloudinary logo URL"
          />
        </div>

        <div className="space-y-3">
          <FieldLabel htmlFor="cover_url">Cover URL</FieldLabel>
          <TextInput
            id="cover_url"
            value={payload.cover_url ?? ""}
            onChange={(event) =>
              setPayload((current) => ({
                ...current,
                cover_url: event.target.value,
              }))
            }
            placeholder="Cloudinary cover image URL"
          />
        </div>

        <div className="space-y-3 md:col-span-2">
          <FieldLabel htmlFor="twitter_url">X / Twitter</FieldLabel>
          <TextInput
            id="twitter_url"
            value={payload.twitter_url ?? ""}
            onChange={(event) =>
              setPayload((current) => ({
                ...current,
                twitter_url: event.target.value,
              }))
            }
            placeholder="https://x.com/yourbrand"
          />
        </div>

        <div className="flex flex-wrap items-center justify-end gap-4 md:col-span-2">
          <Link
            href="/vendor/dashboard"
            className="rounded-full border border-black/10 px-6 py-3 text-sm font-semibold text-[#5A6465] transition hover:bg-[#F4F3EC]"
          >
            Skip for now
          </Link>
          <button
            type="submit"
            disabled={submitSetup.isPending}
            className="inline-flex items-center gap-2 rounded-full bg-[#FDA600] px-6 py-3 text-sm font-semibold text-black transition hover:bg-[#f28705] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitSetup.isPending ? "Saving..." : "Save shop details"}
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </form>
    </div>
  );
}

function resolveDashboardStats(data?: VendorDashboard) {
  return {
    products: data?.analytics.total_products ?? 0,
    sales: data?.analytics.total_sales ?? 0,
    revenue: data?.analytics.total_revenue ?? 0,
    rating: data?.analytics.average_rating ?? 0,
    reviews: data?.analytics.review_count ?? 0,
  };
}

export function VendorDashboardView() {
  const { data: dashboard, isLoading } = useVendorDashboard();
  const { data: setupState } = useVendorSetupState();
  const stats = resolveDashboardStats(dashboard);

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((card) => (
          <div
            key={card}
            className="h-[180px] animate-pulse rounded-[24px] bg-white shadow-card_shadow"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8 py-4">
      <section className="rounded-[32px] bg-[#EDE7D9] p-8 shadow-card_shadow md:p-10">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#7A6B44]">
              Vendor Dashboard
            </p>
            <h1 className="mt-3 font-bon_foyage text-5xl leading-none text-black">
              {dashboard?.profile.store_name || "Your shop is ready"}
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[#5A6465]">
              Track store performance, keep your catalog moving, and only
              unlock payout verification when you are ready to withdraw.
            </p>
          </div>

          <div className="rounded-[24px] bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#7A6B44]">
              Onboarding
            </p>
            <p className="mt-3 text-3xl font-semibold text-black">
              {setupState?.completion_percentage ?? 0}%
            </p>
            <p className="mt-2 text-sm text-[#5A6465]">
              Payout setup stays separate from this stage.
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <VendorStatCard
          title="Products"
          value={String(stats.products)}
          hint="Active items in your catalog."
        />
        <VendorStatCard
          title="Sales"
          value={String(stats.sales)}
          hint="Orders recorded against your store."
        />
        <VendorStatCard
          title="Revenue"
          value={`NGN ${stats.revenue.toLocaleString()}`}
          hint="Gross sales value currently tracked."
        />
        <VendorStatCard
          title="Rating"
          value={stats.rating.toFixed(1)}
          hint={`Across ${stats.reviews} review${stats.reviews === 1 ? "" : "s"}.`}
        />
        <VendorStatCard
          title="Status"
          value={dashboard?.profile.is_verified ? "Verified" : "Pending"}
          hint="Verification becomes critical at payout time."
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[32px] bg-white p-8 shadow-card_shadow">
          <div className="flex items-center gap-3">
            <ChartColumn className="h-5 w-5 text-[#FDA600]" />
            <h2 className="text-xl font-semibold text-black">Store snapshot</h2>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-[24px] border border-[#ECE6D6] p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#7A6B44]">
                Location
              </p>
              <p className="mt-3 flex items-center gap-2 text-base text-black">
                <MapPin className="h-4 w-4 text-[#FDA600]" />
                {dashboard?.profile.city || "City not set"},{" "}
                {dashboard?.profile.state || "State not set"}
              </p>
            </div>
            <div className="rounded-[24px] border border-[#ECE6D6] p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#7A6B44]">
                Store slug
              </p>
              <p className="mt-3 text-base text-black">
                {dashboard?.profile.store_slug || "Slug pending"}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-[32px] bg-white p-8 shadow-card_shadow">
          <h2 className="text-xl font-semibold text-black">Quick actions</h2>
          <div className="mt-6 space-y-3">
            <Link
              href="/vendor/products"
              className="flex items-center justify-between rounded-[20px] bg-[#F8F5ED] px-5 py-4 text-sm font-semibold text-black transition hover:bg-[#ECE6D6]"
            >
              <span className="flex items-center gap-3">
                <Package className="h-4 w-4 text-[#FDA600]" />
                Create a product
              </span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/vendor/products/catelog"
              className="flex items-center justify-between rounded-[20px] bg-[#F8F5ED] px-5 py-4 text-sm font-semibold text-black transition hover:bg-[#ECE6D6]"
            >
              <span className="flex items-center gap-3">
                <Store className="h-4 w-4 text-[#FDA600]" />
                Open catalog
              </span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/vendor/wallet"
              className="flex items-center justify-between rounded-[20px] bg-[#F8F5ED] px-5 py-4 text-sm font-semibold text-black transition hover:bg-[#ECE6D6]"
            >
              <span className="flex items-center gap-3">
                <Wallet className="h-4 w-4 text-[#FDA600]" />
                Review payout readiness
              </span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

const vendorOrders = [
  {
    id: "ORD-2007",
    customer: "Jennifer Osato",
    status: "processing",
    total: "NGN 45,000",
    items: "3 items",
  },
  {
    id: "ORD-2008",
    customer: "Daniel Iyke",
    status: "completed",
    total: "NGN 18,500",
    items: "1 item",
  },
  {
    id: "ORD-2011",
    customer: "Amaka Obi",
    status: "awaiting pickup",
    total: "NGN 29,000",
    items: "2 items",
  },
];

export function VendorOrdersView() {
  return (
    <div className="space-y-8 py-4">
      <div>
        <h1 className="font-bon_foyage text-5xl text-black">Orders</h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-[#5A6465]">
          This is the clean vendor order workspace inside the new FSD flow.
        </p>
      </div>

      <div className="overflow-hidden rounded-[32px] bg-white shadow-card_shadow">
        <table className="min-w-full">
          <thead className="bg-[#F8F5ED]">
            <tr className="text-left text-sm font-semibold uppercase tracking-[0.12em] text-[#7A6B44]">
              <th className="px-6 py-4">Order</th>
              <th className="px-6 py-4">Customer</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Total</th>
              <th className="px-6 py-4">Items</th>
            </tr>
          </thead>
          <tbody>
            {vendorOrders.map((order) => (
              <tr key={order.id} className="border-t border-[#ECE6D6] text-black">
                <td className="px-6 py-5 font-semibold">{order.id}</td>
                <td className="px-6 py-5">{order.customer}</td>
                <td className="px-6 py-5">{order.status}</td>
                <td className="px-6 py-5">{order.total}</td>
                <td className="px-6 py-5">{order.items}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function VendorOrderDetailView({ orderOid }: { orderOid: string }) {
  return (
    <div className="space-y-6 py-4">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#7A6B44]">
          Order Detail
        </p>
        <h1 className="mt-3 font-bon_foyage text-4xl text-black">{orderOid}</h1>
      </div>
      <div className="rounded-[32px] bg-white p-8 shadow-card_shadow">
        <p className="text-base leading-7 text-[#5A6465]">
          This detail surface now lives in the new vendor feature slice. The
          next execution pass can wire it to the real order contract after the
          dedicated orders domain migration lands.
        </p>
      </div>
    </div>
  );
}

export function VendorProductComposerView() {
  const router = useRouter();
  const qc = useQueryClient();

  // Pull the vendor id from the auth store — used for draft namespacing
  const vendorId = useAuthStore((s) => s.user?.id ?? "anonymous");

  // We track the created product slug in a ref so the submit handler can
  // call updateProduct / publishProduct after the initial create.
  const productSlugRef = useRef<string | null>(null);

  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct(productSlugRef.current ?? "");

  /**
   * Called by ProductBuilderProvider when the vendor clicks
   * "Save Draft" or "Submit for Review" on Step 8.
   */
  const handleBuilderSubmit = async (
    values: ProductBuilderFormValues,
    productId: string | null,
  ) => {
    // Generate a stable idempotency key only on first creation
    const idempotencyKey =
      productId ?? (typeof crypto !== "undefined" ? crypto.randomUUID() : Date.now().toString());

    // Zod superRefine wraps Step2Schema in ZodEffects — the merged type loses
    // precision on optional array/boolean fields. These casts are safe because
    // Zod has already validated the shape before onSubmit fires.
    const sizeIds   = (values.size_ids ?? [])   as string[];
    const colorIds  = (values.color_ids ?? [])  as string[];
    const tagIds    = (values.tag_ids ?? [])     as string[];
    const hotDeal   = (values.hot_deal ?? false)  as boolean;
    const isDigital = (values.digital ?? false)   as boolean;

    // ── 1. Create or update the product record ───────────────────────────────
    let savedSlug: string | null = productSlugRef.current;

    if (!productSlugRef.current) {
      // First-time save → CREATE
      const created = await createMutation.mutateAsync({
        title: values.title,
        description: values.description,
        short_description: values.short_description ?? "",
        price: values.price,
        old_price: values.old_price ?? undefined,
        currency: values.currency ?? "NGN",
        shipping_amount: values.shipping_amount ?? "0.00",
        stock_qty: values.stock_qty as number,
        requires_measurement: values.requires_measurement as boolean,
        is_customisable: values.is_customisable as boolean,
        category_ids: values.category_ids,
        sub_category_ids: values.sub_category_ids ?? [],
        size_ids: sizeIds,
        color_ids: colorIds,
        tag_ids: tagIds,
        hot_deal: hotDeal,
        digital: isDigital,
        idempotency_key: idempotencyKey,
      });
      savedSlug = created.slug;
      productSlugRef.current = savedSlug;
    } else {
      // Subsequent save → PATCH
      await updateMutation.mutateAsync({
        title: values.title,
        description: values.description,
        short_description: values.short_description ?? "",
        price: values.price,
        old_price: values.old_price ?? undefined,
        currency: values.currency ?? "NGN",
        shipping_amount: values.shipping_amount ?? "0.00",
        stock_qty: values.stock_qty as number,
        requires_measurement: values.requires_measurement as boolean,
        is_customisable: values.is_customisable as boolean,
        category_ids: values.category_ids,
        sub_category_ids: values.sub_category_ids ?? [],
        size_ids: sizeIds,
        color_ids: colorIds,
        tag_ids: tagIds,
        hot_deal: hotDeal,
        digital: isDigital,
      });
    }

    // ── 2. Submit for review if publish_intent === "pending" ─────────────────
    if (values.publish_intent === "pending" && savedSlug) {
      await publishProduct(savedSlug);
    }

    // ── 3. Invalidate catalog cache + redirect ───────────────────────────────
    void qc.invalidateQueries({ queryKey: productKeys.lists() });
    router.push("/vendor/products/catelog");
  };

  return (
    <div className="space-y-5 py-4">
      {/* ── Page header ── */}
      <div className="flex items-center justify-between rounded-[32px] bg-white px-8 py-6 shadow-card_shadow">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#7A6B44]">
            Product Studio
          </p>
          <h1 className="mt-3 font-bon_foyage text-4xl text-black">
            Add New Product
          </h1>
        </div>
        <Link
          href="/vendor/products/catelog"
          className="rounded-full border border-black/10 px-6 py-3 text-sm font-semibold text-[#5A6465] transition hover:bg-[#F4F3EC]"
        >
          Open catalog
        </Link>
      </div>

      {/* ── 8-step enterprise builder ── */}
      <div className="rounded-[32px] bg-white p-8 shadow-card_shadow">
        <ProductBuilderProvider
          vendorId={vendorId}
          onSubmit={handleBuilderSubmit}
        >
          <ProductBuilder />
        </ProductBuilderProvider>
      </div>
    </div>
  );
}

const productCatalog = [
  {
    id: "P-1001",
    title: "Men Senator",
    price: "NGN 120,000",
    status: "active",
    date: "02.07.2026",
  },
  {
    id: "P-1002",
    title: "Isi Agu Native Wear",
    price: "NGN 95,000",
    status: "draft",
    date: "05.07.2026",
  },
];

export function VendorProductCatalogView() {
  return (
    <div className="space-y-8 py-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-bon_foyage text-5xl text-black">Catalog</h1>
          <p className="mt-3 text-base leading-7 text-[#5A6465]">
            Your migrated product listing workspace now lives in
            `features/vendor`.
          </p>
        </div>
        <Link
          href="/vendor/products"
          className="inline-flex items-center gap-2 rounded-full bg-[#FDA600] px-6 py-3 text-sm font-semibold text-black transition hover:bg-[#f28705]"
        >
          Create new product
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="space-y-4">
        {productCatalog.map((product) => (
          <div
            key={product.id}
            className="flex flex-col gap-3 rounded-[24px] bg-white p-6 shadow-card_shadow md:flex-row md:items-center md:justify-between"
          >
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#7A6B44]">
                {product.id}
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-black">
                {product.title}
              </h2>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm text-[#5A6465]">
              <span>{product.price}</span>
              <span>{product.status}</span>
              <span>{product.date}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function VendorSettingsView() {
  const { data: profile } = useVendorProfile();

  return (
    <VendorProfileCard
      profile={profile}
      title="Settings"
      description="This screen now reads from the new vendor profile contract. Full edit mutations can keep expanding from the setup-first foundation."
    />
  );
}

function VendorProfileCard({
  profile,
  title,
  description,
}: {
  profile?: VendorProfile;
  title: string;
  description: string;
}) {
  const fields = useMemo(
    () => [
      { label: "Business mail", value: profile?.user_email || "Not set yet" },
      { label: "Store name", value: profile?.store_name || "Not set yet" },
      { label: "State", value: profile?.state || "Not set yet" },
      { label: "City", value: profile?.city || "Not set yet" },
      { label: "Website", value: profile?.website_url || "Not set yet" },
      { label: "Instagram", value: profile?.instagram_url || "Not set yet" },
    ],
    [profile],
  );

  return (
    <div className="space-y-8 py-4">
      <div>
        <h1 className="font-bon_foyage text-5xl text-black">{title}</h1>
        <p className="mt-3 max-w-3xl text-base leading-7 text-[#5A6465]">
          {description}
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {fields.map((field) => (
          <div
            key={field.label}
            className="rounded-[24px] bg-white p-6 shadow-card_shadow"
          >
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#7A6B44]">
              {field.label}
            </p>
            <p className="mt-3 text-lg text-black">{field.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function VendorWalletView() {
  return (
    <div className="space-y-8 py-4">
      <div>
        <h1 className="font-bon_foyage text-5xl text-black">Wallet</h1>
        <p className="mt-3 max-w-3xl text-base leading-7 text-[#5A6465]">
          This is where payout readiness belongs. Bank details and KYC stay
          here, not in vendor setup.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <VendorStatCard
          title="Total Amount"
          value="NGN 180,050"
          hint="Gross platform balance."
        />
        <VendorStatCard
          title="Withdrawable"
          value="NGN 42,500"
          hint="Available once payout setup is complete."
        />
        <VendorStatCard
          title="Payout status"
          value="Not started"
          hint="KYC and bank verification will begin here."
        />
      </div>
      <div className="rounded-[32px] bg-white p-8 shadow-card_shadow">
        <p className="mb-6 text-sm font-semibold uppercase tracking-[0.16em] text-[#7A6B44]">
          Transaction history
        </p>
        <Transactions />
      </div>
    </div>
  );
}

export function VendorAnalyticsView() {
  return (
    <div className="space-y-8 py-4">
      <div>
        <h1 className="font-bon_foyage text-5xl text-black">Analytics</h1>
        <p className="mt-3 max-w-3xl text-base leading-7 text-[#5A6465]">
          The old analytics copy has been moved into the new vendor slice as a
          clean placeholder surface for the upcoming real metrics integration.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <VendorStatCard
          title="Customers"
          value="18"
          hint="Returning and first-time buyers."
        />
        <VendorStatCard
          title="Revenue"
          value="NGN 42,500"
          hint="Revenue trend card migrated from the old dashboard."
        />
        <VendorStatCard
          title="Orders"
          value="91"
          hint="Total completed and in-progress orders."
        />
      </div>
    </div>
  );
}

const customerRows = [
  {
    name: "Michael Atafor",
    date: "April 2nd, 2026",
    address: "312 W Festac Rd",
    status: "customer",
    rating: 5,
    items: 10,
  },
  {
    name: "Jennifer Osato",
    date: "April 5th, 2026",
    address: "Surulere, Lagos",
    status: "repeat",
    rating: 4,
    items: 5,
  },
];

export function VendorCustomersView() {
  return (
    <div className="space-y-8 py-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-bon_foyage text-5xl text-black">Customers</h1>
          <p className="mt-3 text-base leading-7 text-[#5A6465]">
            Migrated customer summary space for the vendor dashboard.
          </p>
        </div>
        <button className="rounded-full bg-[#FDA600] px-6 py-3 text-sm font-semibold text-black transition hover:bg-[#f28705]">
          Add customer
        </button>
      </div>

      <div className="overflow-hidden rounded-[32px] bg-white shadow-card_shadow">
        <table className="min-w-full">
          <thead className="bg-[#F8F5ED]">
            <tr className="text-left text-sm font-semibold uppercase tracking-[0.12em] text-[#7A6B44]">
              <th className="px-6 py-4">Customer</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Address</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Rating</th>
              <th className="px-6 py-4">Items</th>
            </tr>
          </thead>
          <tbody>
            {customerRows.map((customer) => (
              <tr
                key={`${customer.name}-${customer.date}`}
                className="border-t border-[#ECE6D6] text-black"
              >
                <td className="px-6 py-5 font-semibold">{customer.name}</td>
                <td className="px-6 py-5">{customer.date}</td>
                <td className="px-6 py-5">{customer.address}</td>
                <td className="px-6 py-5">{customer.status}</td>
                <td className="px-6 py-5">{customer.rating}</td>
                <td className="px-6 py-5">{customer.items}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const paymentRows = [
  {
    invoice: "50899065",
    method: "Bank transfer",
    date: "12.05.26 09:00",
    status: "paid",
    amount: "NGN 10,059",
  },
  {
    invoice: "34299229",
    method: "Bank transfer",
    date: "30.06.26 12:04",
    status: "pending",
    amount: "NGN 10,059",
  },
];

export function VendorPaymentsView() {
  return (
    <div className="space-y-8 py-4">
      <div>
        <h1 className="font-bon_foyage text-5xl text-black">Payments</h1>
        <p className="mt-3 max-w-3xl text-base leading-7 text-[#5A6465]">
          Payment history migrated into the new vendor slice while withdrawal
          verification remains intentionally separate from setup.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <VendorStatCard
          title="Customers"
          value="18"
          hint="Customers attached to payment history."
        />
        <VendorStatCard
          title="Payments"
          value="20"
          hint="Recorded payout or invoice entries."
        />
        <VendorStatCard
          title="Total payments"
          value="NGN 432.92"
          hint="Running payment ledger total."
        />
      </div>

      <div className="overflow-hidden rounded-[32px] bg-white shadow-card_shadow">
        <table className="min-w-full">
          <thead className="bg-[#F8F5ED]">
            <tr className="text-left text-sm font-semibold uppercase tracking-[0.12em] text-[#7A6B44]">
              <th className="px-6 py-4">Invoice</th>
              <th className="px-6 py-4">Method</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Amount</th>
              <th className="px-6 py-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {paymentRows.map((row) => (
              <tr key={row.invoice} className="border-t border-[#ECE6D6] text-black">
                <td className="px-6 py-5 font-semibold">{row.invoice}</td>
                <td className="px-6 py-5">{row.method}</td>
                <td className="px-6 py-5">{row.date}</td>
                <td className="px-6 py-5">{row.amount}</td>
                <td className="px-6 py-5">{row.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function VendorOverviewTiles() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <VendorStatCard title="Store" value="Ready" hint="Core setup is now modular." />
      <VendorStatCard
        title="Payout"
        value="Later"
        hint="Withdrawal checks happen inside wallet."
      />
      <VendorStatCard
        title="Catalog"
        value="Active"
        hint="Product creation and catalog are now separated cleanly."
      />
      <VendorStatCard
        title="Customers"
        value="Tracked"
        hint="Dedicated customer and payment views are now split out."
      />
    </div>
  );
}
