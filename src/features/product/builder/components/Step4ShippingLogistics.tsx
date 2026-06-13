"use client";

/**
 * @file Step4ShippingLogistics.tsx
 * @description Step 4 — Shipping & Logistics Package Details
 */

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useFormContext } from "react-hook-form";
import { apiAsync } from "@/core/api/client.async";
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
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { InfoIcon, Truck, Package, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Courier {
  id: string;
  name: string;
  base_fee: string;
  estimated_days_min: number;
  estimated_days_max: number;
}

interface CourierEnvelope {
  results?: Courier[];
}

export function Step4ShippingLogistics() {
  const form = useFormContext<ProductBuilderFormValues>();
  const shippingProfile = form.watch("shipping_profile");

  const [hasProfile, setHasProfile] = useState(!!shippingProfile);

  const toggleShippingProfile = (checked: boolean) => {
    setHasProfile(checked);
    if (checked) {
      form.setValue("shipping_profile", {
        weight_kg: "0.00",
        length_cm: "0.0",
        width_cm: "0.0",
        height_cm: "0.0",
        is_fragile: false,
        requires_signature: false,
        restricted_countries: [],
        free_shipping_threshold: "",
        processing_days: 1,
      }, { shouldValidate: true });
    } else {
      form.setValue("shipping_profile", null, { shouldValidate: true });
    }
  };

  const { data: couriers = [] } = useQuery({
    queryKey: ["product-builder", "couriers-full"],
    queryFn: async () => {
      try {
        const data = await apiAsync
          .get("product/couriers/?page_size=50&active=true")
          .json<CourierEnvelope>();
        return data.results ?? [];
      } catch {
        return [] as Courier[];
      }
    },
    staleTime: 5 * 60_000,
    gcTime: 10 * 60_000,
    retry: 0,
    throwOnError: false,
  });

  return (
    <div className="space-y-8">
      {/* ── SECTION A: BASIC OVERRIDES ── */}
      <div className="rounded-2xl border border-[#ECE6D6] bg-[#FAFAF8] p-6 space-y-6">
        <div>
          <h3 className="text-md font-bold text-[#1A1208] flex items-center gap-2">
            <Truck className="w-4 h-4 text-[#01454A]" /> Flat Rates &amp; Couriers
          </h3>
          <p className="text-xs text-[#7A6B44] mt-0.5">
            Optionally set custom pricing rules or select your preferred shipping provider.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="shipping_amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[#1A1208] font-semibold text-sm">
                  Flat Shipping Fee (₦)
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="e.g. 2500.00"
                    className="bg-white border border-[#D9D9D9] text-[#1A1208] focus:ring-[#01454A] focus:border-[#01454A] rounded-xl px-4 py-3"
                  />
                </FormControl>
                <FormDescription className="text-zinc-500 text-xs">
                  Overrides default platform checkout rates for this item.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="courier_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[#1A1208] font-semibold text-sm">
                  Preferred Delivery Courier
                </FormLabel>
                <Select onValueChange={field.onChange} value={field.value ?? ""}>
                  <FormControl>
                    <SelectTrigger className="bg-white border border-[#D9D9D9] text-[#1A1208] focus:ring-[#01454A] focus:border-[#01454A] rounded-xl px-4 py-3">
                      <SelectValue placeholder="Use Platform Default" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-white border border-[#D9D9D9] text-[#1A1208] shadow-lg">
                    <SelectItem value="">— Platform Default —</SelectItem>
                    {couriers.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name} — ₦{parseFloat(c.base_fee).toLocaleString()} ({c.estimated_days_min}–{c.estimated_days_max} days)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      {/* ── SECTION B: SHIPPING PROFILE ── */}
      <div className="rounded-2xl border border-[#ECE6D6] bg-[#FAFAF8] p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-[#ECE6D6] pb-3">
          <div>
            <h3 className="text-md font-bold text-[#1A1208] flex items-center gap-2">
              <Package className="w-4 h-4 text-[#01454A]" /> Custom Parcel Specifications
            </h3>
            <p className="text-xs text-[#7A6B44] mt-0.5">
              Specify packaging weight &amp; sizes. Used by couriers for weight-based shipping rates.
            </p>
          </div>
          <Switch
            checked={hasProfile}
            onCheckedChange={toggleShippingProfile}
            className="data-[state=checked]:bg-[#01454A]"
          />
        </div>

        {hasProfile && (
          <div className="space-y-6">
            {/* Dimensions Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <FormField
                control={form.control}
                name="shipping_profile.weight_kg"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs text-[#1A1208] font-bold">Weight (kg) *</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" step="0.001" className="bg-white rounded-xl text-xs h-9" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="shipping_profile.length_cm"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs text-[#1A1208] font-bold">Length (cm)</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" step="0.1" className="bg-white rounded-xl text-xs h-9" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="shipping_profile.width_cm"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs text-[#1A1208] font-bold">Width (cm)</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" step="0.1" className="bg-white rounded-xl text-xs h-9" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="shipping_profile.height_cm"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs text-[#1A1208] font-bold">Height (cm)</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" step="0.1" className="bg-white rounded-xl text-xs h-9" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Additional parameters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="shipping_profile.processing_days"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#1A1208] font-semibold text-sm">Processing / Handling Time</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          type="number"
                          min="1"
                          onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 1)}
                          className="bg-white border border-[#D9D9D9] text-[#1A1208] focus:ring-[#01454A] focus:border-[#01454A] rounded-xl px-4 py-3 pr-16"
                        />
                        <span className="absolute right-4 top-3.5 text-xs text-zinc-400 font-semibold">days</span>
                      </div>
                    </FormControl>
                    <FormDescription className="text-xs text-zinc-500">
                      Days required to package and dispatch this product (excluding delivery transit).
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="shipping_profile.free_shipping_threshold"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#1A1208] font-semibold text-sm">
                      Free Shipping Threshold (₦)
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value ?? ""}
                        placeholder="e.g. 50000.00"
                        className="bg-white border border-[#D9D9D9] text-[#1A1208] focus:ring-[#01454A] focus:border-[#01454A] rounded-xl px-4 py-3"
                      />
                    </FormControl>
                    <FormDescription className="text-xs text-zinc-500">
                      Orders exceeding this price receive free shipping (overrides global platform limits).
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Special switches */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="shipping_profile.is_fragile"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-xl bg-white border border-[#D9D9D9] p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-[#1A1208] font-semibold text-sm cursor-pointer">Fragile Package</FormLabel>
                      <FormDescription className="text-xs text-zinc-500">Requires extra-care sorting and packaging.</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} className="data-[state=checked]:bg-[#01454A]" />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="shipping_profile.requires_signature"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-xl bg-white border border-[#D9D9D9] p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-[#1A1208] font-semibold text-sm cursor-pointer">Requires Signature</FormLabel>
                      <FormDescription className="text-xs text-zinc-500">Customer must sign physically upon delivery.</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} className="data-[state=checked]:bg-[#01454A]" />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
