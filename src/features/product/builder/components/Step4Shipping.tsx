"use client";

/**
 * @file Step4Shipping.tsx
 * @description Step 4 — Shipping Profile
 *
 * Fields covered (aligned to ProductBuilderFormSchema Step4Schema):
 *   • weight_kg       — Product weight for courier rate calculation
 *   • shipping_amount — Fixed shipping cost overriding courier base (optional)
 *   • courier_id      — Optional preferred DeliveryCourier UUID
 *
 * Additionally surfaces available courier options from the platform API
 * so the vendor can pick a preferred courier for this product.
 */

import { useFormContext } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import type { ProductBuilderFormValues } from "../schemas/builder.schemas";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Truck, Package, DollarSign, Info, Ruler, ShieldCheck } from "lucide-react";
import { apiAsync } from "@/core/api/client.async";

// ─────────────────────────────────────────────────────────────────────────────
// TYPES & API
// ─────────────────────────────────────────────────────────────────────────────

interface CourierOption {
  id: string;
  name: string;
  base_fee: string;
  estimated_days_min: number;
  estimated_days_max: number;
  active: boolean;
}

interface PaginatedCouriers {
  results: CourierOption[];
}

async function fetchCouriers(): Promise<CourierOption[]> {
  try {
    const data = await apiAsync
      .get("product/couriers/?page_size=50&active=true")
      .json<PaginatedCouriers>();
    return data.results ?? [];
  } catch {
    return [];
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION CARD
// ─────────────────────────────────────────────────────────────────────────────

function SectionCard({
  icon,
  title,
  subtitle,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-[#ECE6D6] bg-[#FAFAF8] p-6 space-y-6 transition-shadow hover:shadow-md">
      <div className="border-b border-[#ECE6D6] pb-3">
        <div className="flex items-center gap-2.5">
          <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#01454A]/10 text-[#01454A]">
            {icon}
          </span>
          <h3 className="text-base font-bold text-[#1A1208]">{title}</h3>
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
// MAIN STEP 4 COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export function Step4Shipping() {
  const form = useFormContext<ProductBuilderFormValues>();

  const weightKg      = form.watch("weight_kg")      ?? "";
  const shippingAmt   = form.watch("shipping_amount") ?? "";
  const selectedCourierId = form.watch("courier_id")  ?? null;
  const isFragile = form.watch("is_fragile");
  const requiresSignature = form.watch("requires_signature");

  // Fetch available couriers from the platform API
  const { data: couriers = [], isLoading: couriersLoading } = useQuery({
    queryKey: ["logistics", "couriers"],
    queryFn: fetchCouriers,
    staleTime: 10 * 60_000,
    gcTime:    20 * 60_000,
  });

  const selectedCourier = couriers.find((c) => c.id === selectedCourierId);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* ── INFO BANNER ───────────────────────────────────────────────────── */}
      <div className="flex items-start gap-3 rounded-xl border border-[#01454A]/20 bg-[#E8F3F1] p-4">
        <Info className="w-5 h-5 text-[#01454A] flex-shrink-0 mt-0.5" />
        <div className="text-sm text-[#01454A]">
          <p className="font-semibold">Shipping Profile</p>
          <p className="text-xs mt-0.5 text-[#01454A]/80">
            Set your product weight for courier rate calculation. Optionally
            lock a fixed shipping fee and/or a preferred courier. If left blank,
            platform shipping rules will apply automatically.
          </p>
        </div>
      </div>

      {/* ── SECTION A: WEIGHT & SHIPPING COST ────────────────────────────── */}
      <SectionCard
        icon={<Package className="w-4 h-4" />}
        title="Package Details"
        subtitle="Used by the platform to calculate courier rates at checkout."
      >
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2">

          {/* Weight */}
          <FormField
            control={form.control}
            name="weight_kg"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[#1A1208] font-semibold text-sm">
                  Product Weight (kg)
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      {...field}
                      id="weight-kg"
                      type="text"
                      inputMode="decimal"
                      value={field.value ?? ""}
                      placeholder="e.g. 1.5"
                      className="bg-white border-[#D9D9D9] rounded-xl h-11 pr-12 focus-visible:ring-[#01454A]"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm font-semibold">
                      kg
                    </span>
                  </div>
                </FormControl>
                <FormDescription className="text-xs">
                  Include packaging weight. Used for courier rate calculation.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Fixed Shipping Cost */}
          <FormField
            control={form.control}
            name="shipping_amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[#1A1208] font-semibold text-sm flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-[#01454A]" />
                  Fixed Shipping Cost (₦)
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm font-bold">
                      ₦
                    </span>
                    <Input
                      {...field}
                      id="shipping-amount"
                      type="number"
                      step="0.01"
                      min="0"
                      value={field.value ?? ""}
                  placeholder="e.g. 2500.00"
                      className="bg-white border-[#D9D9D9] rounded-xl h-11 pl-8 focus-visible:ring-[#01454A]"
                    />
                  </div>
                </FormControl>
                <FormDescription className="text-xs">
                  Minimum vendor-defined fixed shipping cost is ₦2,500. Leave blank to use platform rules.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-4 grid-cols-1 md:grid-cols-4">
          {(["length_cm", "width_cm", "height_cm"] as const).map((fieldName) => (
            <FormField
              key={fieldName}
              control={form.control}
              name={fieldName}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#1A1208] font-semibold text-sm capitalize">
                    {fieldName.replace("_cm", "")} (cm)
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      step="0.1"
                      value={field.value ?? 0}
                      onChange={(event) => field.onChange(Number(event.target.value))}
                      placeholder="0"
                      className="bg-white border-[#D9D9D9] rounded-xl h-11 focus-visible:ring-[#01454A]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}

          <FormField
            control={form.control}
            name="processing_days"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[#1A1208] font-semibold text-sm">
                  Processing Days
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={1}
                    max={90}
                    value={field.value ?? 1}
                    onChange={(event) => field.onChange(Number(event.target.value))}
                    placeholder="1"
                    className="bg-white border-[#D9D9D9] rounded-xl h-11 focus-visible:ring-[#01454A]"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
          <FormField
            control={form.control}
            name="free_shipping_threshold"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[#1A1208] font-semibold text-sm">
                  Free Shipping Threshold (₦)
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    value={field.value ?? ""}
                    inputMode="decimal"
                    placeholder="Leave blank for platform default"
                    className="bg-white border-[#D9D9D9] rounded-xl h-11 focus-visible:ring-[#01454A]"
                  />
                </FormControl>
                <FormDescription className="text-xs">
                  Optional product-level threshold. When blank, the global platform threshold applies.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-3 grid-cols-1 md:grid-cols-2">
          <FormField
            control={form.control}
            name="is_fragile"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between rounded-xl bg-white border border-[#D9D9D9] px-4 py-3">
                <div className="flex items-start gap-2">
                  <Ruler className="mt-0.5 h-4 w-4 text-[#01454A]" />
                  <div>
                    <FormLabel className="text-sm font-semibold text-[#1A1208] cursor-pointer">
                      Fragile Package
                    </FormLabel>
                    <p className="text-[10px] text-[#7A6B44]">
                      Adds handling context for delicate embellishments.
                    </p>
                  </div>
                </div>
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
            name="requires_signature"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between rounded-xl bg-white border border-[#D9D9D9] px-4 py-3">
                <div className="flex items-start gap-2">
                  <ShieldCheck className="mt-0.5 h-4 w-4 text-[#01454A]" />
                  <div>
                    <FormLabel className="text-sm font-semibold text-[#1A1208] cursor-pointer">
                      Signature Required
                    </FormLabel>
                    <p className="text-[10px] text-[#7A6B44]">
                      Recommended for premium bespoke garments.
                    </p>
                  </div>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="data-[state=checked]:bg-[#FDA600]"
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        {/* Summary pill */}
        {(weightKg || shippingAmt || isFragile || requiresSignature) && (
          <div className="flex flex-wrap gap-3 mt-2">
            {weightKg && (
              <div className="inline-flex items-center gap-1.5 rounded-full bg-[#E8F3F1] border border-[#01454A]/20 px-3 py-1.5">
                <Package className="w-3 h-3 text-[#01454A]" />
                <span className="text-xs font-semibold text-[#01454A]">
                  {weightKg} kg
                </span>
              </div>
            )}
            {shippingAmt && (
              <div className="inline-flex items-center gap-1.5 rounded-full bg-[#FFF6E3] border border-[#FDA600]/30 px-3 py-1.5">
                <DollarSign className="w-3 h-3 text-[#7A5500]" />
                <span className="text-xs font-semibold text-[#7A5500]">
                  ₦{parseFloat(shippingAmt).toLocaleString()} fixed
                </span>
              </div>
            )}
            {isFragile && (
              <div className="inline-flex items-center gap-1.5 rounded-full bg-[#F8F5ED] border border-[#ECE6D6] px-3 py-1.5">
                <Ruler className="w-3 h-3 text-[#7A6B44]" />
                <span className="text-xs font-semibold text-[#7A6B44]">
                  Fragile handling
                </span>
              </div>
            )}
            {requiresSignature && (
              <div className="inline-flex items-center gap-1.5 rounded-full bg-[#E8F3F1] border border-[#01454A]/20 px-3 py-1.5">
                <ShieldCheck className="w-3 h-3 text-[#01454A]" />
                <span className="text-xs font-semibold text-[#01454A]">
                  Signature required
                </span>
              </div>
            )}
          </div>
        )}
      </SectionCard>

      {/* ── SECTION B: PREFERRED COURIER ─────────────────────────────────── */}
      <SectionCard
        icon={<Truck className="w-4 h-4" />}
        title="Preferred Courier"
        subtitle="Optionally link this product to a specific platform courier. Leave blank to use the customer's chosen courier."
      >
        <FormField
          control={form.control}
          name="courier_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[#1A1208] font-semibold text-sm">
                Select Courier{" "}
                <span className="text-zinc-400 font-normal">(optional)</span>
              </FormLabel>

              {couriersLoading ? (
                <div className="h-11 rounded-xl bg-zinc-100 animate-pulse" />
              ) : (
                <Select
                  onValueChange={(val) =>
                    field.onChange(val === "__none__" ? null : val)
                  }
                  value={field.value ?? "__none__"}
                >
                  <FormControl>
                    <SelectTrigger
                      id="courier-id"
                      className="bg-white border-[#D9D9D9] rounded-xl h-11 focus:ring-[#01454A]"
                    >
                      <SelectValue placeholder="No preferred courier" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="rounded-xl bg-white border-[#D9D9D9] shadow-lg">
                    <SelectItem value="__none__" className="text-sm italic text-zinc-400">
                      — No preferred courier
                    </SelectItem>
                    {couriers.map((courier) => (
                      <SelectItem key={courier.id} value={courier.id}>
                        <div className="flex items-center justify-between w-full">
                          <span className="font-medium">{courier.name}</span>
                          <span className="ml-4 text-xs text-zinc-400">
                            ₦{parseFloat(courier.base_fee).toLocaleString()} base ·{" "}
                            {courier.estimated_days_min}–{courier.estimated_days_max} days
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {couriers.length === 0 && !couriersLoading && (
                <p className="text-xs text-zinc-400 italic mt-1">
                  No couriers available. Platform defaults will apply.
                </p>
              )}

              <FormMessage />
            </FormItem>
          )}
        />

        {/* Selected courier info card */}
        {selectedCourier && (
          <div className="rounded-xl border border-[#ECE6D6] bg-white p-4 space-y-2">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-[#01454A]" />
              <span className="font-bold text-[#1A1208] text-sm">
                {selectedCourier.name}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs text-zinc-600">
              <div className="flex items-center gap-1.5">
                <DollarSign className="w-3 h-3 text-zinc-400" />
                <span>
                  Base fee:{" "}
                  <strong>
                    ₦{parseFloat(selectedCourier.base_fee).toLocaleString()}
                  </strong>
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Package className="w-3 h-3 text-zinc-400" />
                <span>
                  Delivery:{" "}
                  <strong>
                    {selectedCourier.estimated_days_min}–
                    {selectedCourier.estimated_days_max} business days
                  </strong>
                </span>
              </div>
            </div>
          </div>
        )}
      </SectionCard>
    </div>
  );
}
