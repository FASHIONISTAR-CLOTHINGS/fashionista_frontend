"use client";

import { useFormContext } from "react-hook-form";
import type { ProductBuilderFormValues } from "../schemas/builder.schemas";
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Truck } from "lucide-react";

export function Step4Shipping() {
  const form = useFormContext<ProductBuilderFormValues>();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* SECTION A: Shipping Profile */}
      <div className="rounded-2xl border border-[#ECE6D6] bg-[#FAFAF8] p-6 space-y-6">
        <div className="flex items-center gap-2 border-b border-[#ECE6D6] pb-3">
          <Truck className="w-5 h-5 text-[#01454A]" />
          <h3 className="text-lg font-bold text-[#1A1208]">Shipping Profile</h3>
        </div>
        
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
          <FormField
            control={form.control}
            name="weight_kg"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[#1A1208] font-semibold text-sm">Weight (kg)</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="e.g. 1.5" className="bg-white border-[#D9D9D9]" />
                </FormControl>
                <FormDescription>Used for courier rate calculation.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="shipping_amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[#1A1208] font-semibold text-sm">Fixed Shipping Cost (₦)</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="e.g. 2500.00" className="bg-white border-[#D9D9D9]" />
                </FormControl>
                <FormDescription>Leave blank for free shipping.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="courier_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[#1A1208] font-semibold text-sm">Preferred Courier ID (Optional)</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value || ""} placeholder="e.g. courier uuid" className="bg-white border-[#D9D9D9]" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

    </div>
  );
}
