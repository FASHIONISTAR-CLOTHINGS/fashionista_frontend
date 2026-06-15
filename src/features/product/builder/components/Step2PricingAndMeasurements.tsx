"use client";

import { useFormContext, useFieldArray } from "react-hook-form";
import type { ProductBuilderFormValues } from "../schemas/builder.schemas";
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DollarSign, Ruler, Palette, Plus, Trash2 } from "lucide-react";

export function Step2PricingAndMeasurements() {
  const form = useFormContext<ProductBuilderFormValues>();

  const { fields: guideFields, append: appendGuideRow, remove: removeGuideRow } = useFieldArray({
    control: form.control,
    name: "measurement_guide",
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* SECTION A: Pricing */}
      <div className="rounded-2xl border border-[#ECE6D6] bg-[#FAFAF8] p-6 space-y-6">
        <div className="flex items-center gap-2 border-b border-[#ECE6D6] pb-3">
          <DollarSign className="w-5 h-5 text-[#01454A]" />
          <h3 className="text-lg font-bold text-[#1A1208]">Pricing & Inventory</h3>
        </div>
        
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[#1A1208] font-semibold text-sm">Base Price (₦) *</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" {...field} placeholder="e.g. 15000" className="bg-white border-[#D9D9D9]" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="old_price"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[#1A1208] font-semibold text-sm">Compare at Price (₦)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" {...field} placeholder="e.g. 20000" className="bg-white border-[#D9D9D9]" />
                </FormControl>
                <FormDescription>Shows a strike-through price.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="stock_qty"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[#1A1208] font-semibold text-sm">Total Stock Quantity *</FormLabel>
                <FormControl>
                  <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value) || 0)} placeholder="e.g. 50" className="bg-white border-[#D9D9D9]" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="cash_payment_mode"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[#1A1208] font-semibold text-sm">Payment Mode *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="bg-white border-[#D9D9D9]">
                      <SelectValue placeholder="Select payment mode" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="payment_before_delivery">Payment Before Delivery</SelectItem>
                    <SelectItem value="payment_on_delivery">Payment On Delivery</SelectItem>
                    <SelectItem value="part_payment_before_delivery">Part Payment Before Delivery</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      {/* SECTION B: Measurements */}
      <div className="rounded-2xl border border-[#ECE6D6] bg-[#FAFAF8] p-6 space-y-6">
        <div className="flex items-center gap-2 border-b border-[#ECE6D6] pb-3">
          <Ruler className="w-5 h-5 text-[#01454A]" />
          <h3 className="text-lg font-bold text-[#1A1208]">Measurements & Guide</h3>
        </div>
        
        <FormField
          control={form.control}
          name="requires_measurement"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-xl border border-[#D9D9D9] p-4 bg-white">
              <div className="space-y-0.5">
                <FormLabel className="text-base font-semibold text-[#1A1208]">Requires Measurements</FormLabel>
                <FormDescription>Enable to provide a size guide.</FormDescription>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />

        {form.watch("requires_measurement") && (
          <div className="space-y-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => appendGuideRow({ size_label: "M", chest_cm: "", waist_cm: "", hip_cm: "", shoulder_cm: "", sleeve_cm: "", length_cm: "", inseam_cm: "", foot_length_cm: "", sort_order: guideFields.length })}
            >
              <Plus className="w-4 h-4 mr-2" /> Add Size Row
            </Button>
            
            {guideFields.map((field, idx) => (
              <div key={field.id} className="grid grid-cols-6 gap-2 items-center bg-white p-3 rounded-lg border border-zinc-200">
                <FormField
                  control={form.control}
                  name={`measurement_guide.${idx}.size_label`}
                  render={({ field: f }) => (
                    <FormItem className="col-span-1">
                      <Select onValueChange={f.onChange} defaultValue={f.value}>
                        <FormControl>
                          <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {["XS", "S", "M", "L", "XL", "XXL", "Custom"].map(sz => (
                            <SelectItem key={sz} value={sz}>{sz}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name={`measurement_guide.${idx}.chest_cm`}
                  render={({ field: f }) => (
                    <FormItem className="col-span-1">
                      <FormControl><Input {...f} placeholder="Chest" className="h-8 text-xs" /></FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`measurement_guide.${idx}.length_cm`}
                  render={({ field: f }) => (
                    <FormItem className="col-span-1">
                      <FormControl><Input {...f} placeholder="Length" className="h-8 text-xs" /></FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`measurement_guide.${idx}.waist_cm`}
                  render={({ field: f }) => (
                    <FormItem className="col-span-1">
                      <FormControl><Input {...f} placeholder="Waist" className="h-8 text-xs" /></FormControl>
                    </FormItem>
                  )}
                />

                <Button type="button" variant="ghost" size="icon" className="col-span-1 text-red-500" onClick={() => removeGuideRow(idx)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECTION C: Fabric details */}
      <div className="rounded-2xl border border-[#ECE6D6] bg-[#FAFAF8] p-6 space-y-6">
        <div className="flex items-center gap-2 border-b border-[#ECE6D6] pb-3">
          <Palette className="w-5 h-5 text-[#01454A]" />
          <h3 className="text-lg font-bold text-[#1A1208]">Fabric Details</h3>
        </div>
        
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
          <FormField
            control={form.control}
            name="fabric_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[#1A1208] font-semibold text-sm">Fabric Type</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="e.g. Cotton, Silk" className="bg-white border-[#D9D9D9]" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="fabric_care_instructions"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[#1A1208] font-semibold text-sm">Care Instructions</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="bg-white border-[#D9D9D9]">
                      <SelectValue placeholder="Select care instructions" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="machine_wash">Machine Wash</SelectItem>
                    <SelectItem value="hand_wash">Hand Wash</SelectItem>
                    <SelectItem value="dry_clean">Dry Clean</SelectItem>
                    <SelectItem value="do_not_wash">Do Not Wash</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

    </div>
  );
}
