"use client";

/**
 * @file Step2Pricing.tsx
 * @description Step 2 — Pricing & Stock
 *
 * Fields: price, old_price, currency, stock_qty, weight_kg,
 *         requires_measurement, is_customisable, shipping_amount, courier_id
 *
 * Features:
 *  - Live discount badge: shows "X% off" when old_price > price
 *  - Currency selector with NGN default (platform standard)
 *  - Courier lookup from DeliveryCourier catalog endpoint
 *  - Measurement toggle with contextual tooltip
 */

import React from "react";
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
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { InfoIcon, TrendingDown } from "lucide-react";

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

const CURRENCIES = [
  { code: "NGN", label: "₦ Nigerian Naira" },
  { code: "USD", label: "$ US Dollar" },
  { code: "GBP", label: "£ British Pound" },
  { code: "EUR", label: "€ Euro" },
  { code: "GHS", label: "₵ Ghanaian Cedi" },
];

export function Step2Pricing() {
  const form = useFormContext<ProductBuilderFormValues>();
  const { data: couriers = [] } = useQuery({
    queryKey: ["product-builder", "couriers"],
    queryFn: async () => {
      const data = await apiAsync
        .get("product/couriers/?page_size=50&active=true")
        .json<CourierEnvelope>();
      return data.results ?? [];
    },
    staleTime: 5 * 60_000,
    gcTime: 10 * 60_000,
  });

  const price = form.watch("price");
  const oldPrice = form.watch("old_price");

  // Compute live discount percentage
  const discountPct = React.useMemo(() => {
    const p = parseFloat(price ?? "0");
    const o = parseFloat(oldPrice ?? "0");
    if (!isNaN(p) && !isNaN(o) && o > p && o > 0) {
      return Math.round(((o - p) / o) * 100);
    }
    return null;
  }, [price, oldPrice]);

  return (
    <div className="space-y-8">
      {/* ── Currency + Price row ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <FormField
          control={form.control}
          name="currency"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[#1A1208] font-semibold text-sm">Currency</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="bg-white border border-[#D9D9D9] text-[#1A1208] focus:ring-violet-500 focus:border-violet-500 rounded-xl px-4 py-3">
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="bg-white border border-[#D9D9D9] text-[#1A1208]">
                  {CURRENCIES.map((c) => (
                    <SelectItem key={c.code} value={c.code} className="hover:bg-zinc-50 focus:bg-zinc-50">
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem className="sm:col-span-2">
              <FormLabel className="text-[#1A1208] font-semibold text-sm">\r\n                Selling Price <span className="text-fuchsia-600">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="e.g. 25000.00"
                  className="bg-white border border-[#D9D9D9] text-[#1A1208] placeholder:text-[#7A6B44]/50 focus:ring-violet-500 focus:border-violet-500 rounded-xl px-4 py-3"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* ── Old Price with discount badge ── */}
      <FormField
        control={form.control}
        name="old_price"
        render={({ field }) => (
          <FormItem>
            <div className="flex items-center gap-3">
              <FormLabel className="text-[#1A1208] font-semibold text-sm">\r\n                Original Price (before discount)
              </FormLabel>
              {discountPct !== null && (
                <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 gap-1 font-semibold">
                  <TrendingDown className="w-3 h-3" />
                  {discountPct}% OFF
                </Badge>
              )}
            </div>
            <FormControl>
              <Input
                {...field}
                type="number"
                step="0.01"
                min="0"
                placeholder="Leave blank if no discount"
                className="bg-white border border-[#D9D9D9] text-[#1A1208] placeholder:text-[#7A6B44]/50 focus:ring-violet-500 focus:border-violet-500 rounded-xl px-4 py-3"
              />
            </FormControl>
            <FormDescription className="text-zinc-500 text-xs">
              Must be higher than the selling price if provided
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* ── Stock & Weight Row ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="stock_qty"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[#1A1208] font-semibold text-sm">\r\n                Stock Quantity <span className="text-fuchsia-600">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="number"
                  min="1"
                  step="1"
                  placeholder="e.g. 50"
                  onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 0)}
                  className="bg-white border border-[#D9D9D9] text-[#1A1208] placeholder:text-[#7A6B44]/50 focus:ring-violet-500 focus:border-violet-500 rounded-xl px-4 py-3"
                />
              </FormControl>
              <FormDescription className="text-zinc-500 text-xs">
                Total units available across all variants
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="weight_kg"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[#1A1208] font-semibold text-sm">\r\n                Weight (kg)
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="number"
                  step="0.001"
                  min="0"
                  placeholder="e.g. 1.5"
                  className="bg-white border border-[#D9D9D9] text-[#1A1208] placeholder:text-[#7A6B44]/50 focus:ring-violet-500 focus:border-violet-500 rounded-xl px-4 py-3"
                />
              </FormControl>
              <FormDescription className="text-zinc-500 text-xs">
                Physical weight in kilograms (used for shipping calculations)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* ── Toggle flags ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="requires_measurement"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-xl bg-white border border-[#D9D9D9] p-4">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <FormLabel className="text-[#1A1208] font-semibold text-sm cursor-pointer">\r\n                    Requires Measurement
                  </FormLabel>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <InfoIcon className="w-3.5 h-3.5 text-zinc-400 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="bg-[#1A1208] text-white text-xs max-w-xs p-2 rounded-lg">
                      Enable this for tailored/made-to-measure items. Customers will be asked to provide body measurements during checkout.
                    </TooltipContent>
                  </Tooltip>
                </div>
                <FormDescription className="text-zinc-500 text-xs">
                  Made-to-measure / tailored items
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  className="data-[state=checked]:bg-violet-500"
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="is_customisable"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-xl bg-white border border-[#D9D9D9] p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-[#1A1208] font-semibold text-sm cursor-pointer">\r\n                  Allow Customisation
                </FormLabel>
                <FormDescription className="text-zinc-500 text-xs">
                  Customer can add personalisation notes
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  className="data-[state=checked]:bg-violet-500"
                />
              </FormControl>
            </FormItem>
          )}
        />
      </div>

      {/* ── Shipping ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="shipping_amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[#1A1208] font-semibold text-sm">\r\n                Flat Shipping Fee
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Leave blank for free / calculated"
                  className="bg-white border border-[#D9D9D9] text-[#1A1208] placeholder:text-[#7A6B44]/50 focus:ring-violet-500 focus:border-violet-500 rounded-xl px-4 py-3"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="courier_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[#1A1208] font-semibold text-sm">\r\n                Preferred Courier
              </FormLabel>
              <Select onValueChange={field.onChange} value={field.value ?? ""}>
                <FormControl>
                  <SelectTrigger className="bg-white border border-[#D9D9D9] text-[#1A1208] focus:ring-violet-500 focus:border-violet-500 rounded-xl px-4 py-3">
                    <SelectValue placeholder="Platform default" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="bg-white border border-[#D9D9D9] text-[#1A1208]">
                  <SelectItem value="" className="hover:bg-zinc-50 focus:bg-zinc-50">— Platform default —</SelectItem>
                  {couriers.map((c) => (
                    <SelectItem key={c.id} value={c.id} className="hover:bg-zinc-50 focus:bg-zinc-50">
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
  );
}
