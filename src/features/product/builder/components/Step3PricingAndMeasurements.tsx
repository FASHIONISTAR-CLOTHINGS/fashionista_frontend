"use client";

/**
 * @file Step3PricingAndMeasurements.tsx
 * @description Pricing & Inventory, Fabric Specification, Size & Measurement Guide.
 * Rendered as Step 3 in the vendor product builder.
 *
 * Fields covered (aligned to ProductBuilderFormSchema Step3PricingAndMeasurementsBaseSchema):
 *   PRICING & INVENTORY:
 *     price, old_price, is_discounted, discount_percentage, discounted_price,
 *     currency, stock_qty, max_stock, cash_payment_mode, is_pre_order, pre_order_date
 *   FABRIC SPECIFICATION:
 *     fabric_type, fabric_care_instructions, fabric_is_organic, fabric_is_vegan,
 *     fabric_country_of_origin, is_customisable
 *   MEASUREMENT GUIDE:
 *     requires_measurement, measurement_guide[]
 */

import { useFormContext, useFieldArray } from "react-hook-form";
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
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DollarSign,
  Ruler,
  Palette,
  Plus,
  Trash2,
  Calendar,
  Leaf,
  Globe,
  Scissors,
  AlertCircle,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

const PAYMENT_MODES = [
  { value: "payment_before_delivery",      label: "💳 Payment Before Delivery" },
  { value: "payment_on_delivery",          label: "🚚 Payment On Delivery (POD)" },
  { value: "part_payment_before_delivery", label: "⚡ Part Payment Before Delivery" },
];

const CARE_INSTRUCTION_OPTIONS = [
  { value: "machine_wash", label: "🫧 Machine Wash" },
  { value: "hand_wash",    label: "🤲 Hand Wash" },
  { value: "dry_clean",    label: "👔 Dry Clean Only" },
  { value: "do_not_wash",  label: "🚫 Do Not Wash" },
  { value: "cold_wash",    label: "❄️ Cold Wash" },
  { value: "tumble_dry",   label: "💨 Tumble Dry Low" },
  { value: "air_dry",      label: "🌬️ Air Dry Flat" },
];

const SIZE_LABELS = ["XS", "S", "M", "L", "XL", "XXL", "Custom"] as const;

const MEASUREMENT_COLS: { name: string; placeholder: string; field: string }[] =
  [
    { name: "Chest (cm)",  placeholder: "e.g. 92", field: "chest_cm"       },
    { name: "Waist (cm)",  placeholder: "e.g. 76", field: "waist_cm"       },
    { name: "Hip (cm)",    placeholder: "e.g. 98", field: "hip_cm"         },
    { name: "Shoulder",    placeholder: "e.g. 44", field: "shoulder_cm"    },
    { name: "Sleeve",      placeholder: "e.g. 62", field: "sleeve_cm"      },
    { name: "Length",      placeholder: "e.g. 65", field: "length_cm"      },
    { name: "Inseam",      placeholder: "e.g. 78", field: "inseam_cm"      },
    { name: "Foot (cm)",   placeholder: "e.g. 26", field: "foot_length_cm" },
  ];

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
// MAIN STEP 3 COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export function Step3PricingAndMeasurements() {
  const form = useFormContext<ProductBuilderFormValues>();

  const isDiscounted = form.watch("is_discounted");
  const isPreOrder   = form.watch("is_pre_order");
  const requiresMeasurement = form.watch("requires_measurement");

  const {
    fields: guideFields,
    append: appendGuideRow,
    remove: removeGuideRow,
  } = useFieldArray({
    control: form.control,
    name: "measurement_guide",
  });

  const addNewGuideRow = () => {
    appendGuideRow({
      size_label:      "M",
      chest_cm:        "",
      waist_cm:        "",
      hip_cm:          "",
      shoulder_cm:     "",
      sleeve_cm:       "",
      length_cm:       "",
      inseam_cm:       "",
      foot_length_cm:  "",
      sort_order:      guideFields.length,
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* ── SECTION A: PRICING & INVENTORY ───────────────────────────────── */}
      <SectionCard
        icon={<DollarSign className="w-4 h-4" />}
        title="Pricing & Inventory"
        subtitle="Set your base price, optional compare-at price, and stock quantity."
      >
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2">

          {/* Base Price */}
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[#1A1208] font-semibold text-sm">
                  Base Price (₦) <span className="text-[#FDA600]">*</span>
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm font-bold">₦</span>
                    <Input
                      {...field}
                      id="base-price"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="e.g. 15000.00"
                      className="bg-white border-[#D9D9D9] rounded-xl pl-8 h-11 focus-visible:ring-[#01454A]"
                    />
                  </div>
                </FormControl>
                <FormDescription className="text-xs">Minimum ₦5,000.00</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Compare-at / Old Price */}
          <FormField
            control={form.control}
            name="old_price"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[#1A1208] font-semibold text-sm">
                  Compare-at Price (₦)
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm font-bold">₦</span>
                    <Input
                      {...field}
                      id="compare-price"
                      type="number"
                      step="0.01"
                      min="0"
                      value={field.value ?? ""}
                      placeholder="e.g. 20000.00"
                      className="bg-white border-[#D9D9D9] rounded-xl pl-8 h-11 focus-visible:ring-[#01454A]"
                    />
                  </div>
                </FormControl>
                <FormDescription className="text-xs">Shows a strikethrough "was" price.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Stock Qty */}
          <FormField
            control={form.control}
            name="stock_qty"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[#1A1208] font-semibold text-sm">
                  Total Stock Quantity <span className="text-[#FDA600]">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    id="stock-qty"
                    type="number"
                    min={1}
                    onChange={(e) =>
                      field.onChange(parseInt(e.target.value) || 0)
                    }
                    placeholder="e.g. 50"
                    className="bg-white border-[#D9D9D9] rounded-xl h-11 focus-visible:ring-[#01454A]"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Max Stock */}
          <FormField
            control={form.control}
            name="max_stock"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[#1A1208] font-semibold text-sm">
                  Max Stock Cap
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    id="max-stock"
                    type="number"
                    min={0}
                    value={field.value ?? ""}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value === "" ? null : parseInt(e.target.value)
                      )
                    }
                    placeholder="Leave blank for unlimited"
                    className="bg-white border-[#D9D9D9] rounded-xl h-11 focus-visible:ring-[#01454A]"
                  />
                </FormControl>
                <FormDescription className="text-xs">
                  Caps replenishment. Leave blank for unlimited stock.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Payment Mode */}
          <FormField
            control={form.control}
            name="cash_payment_mode"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[#1A1208] font-semibold text-sm">
                  Payment Mode <span className="text-[#FDA600]">*</span>
                </FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger
                      id="payment-mode"
                      className="bg-white border-[#D9D9D9] rounded-xl h-11 focus:ring-[#01454A]"
                    >
                      <SelectValue placeholder="Select payment mode" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="rounded-xl bg-white border-[#D9D9D9] shadow-lg">
                    {PAYMENT_MODES.map((m) => (
                      <SelectItem key={m.value} value={m.value}>
                        {m.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Currency */}
          <FormField
            control={form.control}
            name="currency"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[#1A1208] font-semibold text-sm">
                  Currency
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    id="currency"
                    maxLength={3}
                    placeholder="NGN"
                    className="bg-white border-[#D9D9D9] rounded-xl h-11 uppercase focus-visible:ring-[#01454A]"
                  />
                </FormControl>
                <FormDescription className="text-xs">3-letter ISO code (e.g. NGN, USD)</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Discount Toggle Row */}
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="is_discounted"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between rounded-xl border border-[#D9D9D9] bg-white px-4 py-3">
                <div>
                  <FormLabel className="text-sm font-semibold text-[#1A1208] cursor-pointer">
                    🏷️ Apply Discount
                  </FormLabel>
                  <p className="text-xs text-[#7A6B44]">
                    Enable to set a custom discount percentage and price.
                  </p>
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

          {isDiscounted && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-2 border-l-2 border-[#FDA600]/40 ml-2">
              <FormField
                control={form.control}
                name="discount_percentage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#1A1208] font-semibold text-sm">
                      Discount % <span className="text-[#FDA600]">*</span>
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          type="number"
                          min={0}
                          max={100}
                          step={1}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          placeholder="e.g. 25"
                          className="bg-white border-[#D9D9D9] rounded-xl h-11 pr-8 focus-visible:ring-[#FDA600]"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm font-bold">%</span>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="discounted_price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#1A1208] font-semibold text-sm">
                      Discounted Price (₦)
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm font-bold">₦</span>
                        <Input
                          {...field}
                          type="number"
                          step="0.01"
                          value={field.value ?? ""}
                          placeholder="e.g. 11250.00"
                          className="bg-white border-[#D9D9D9] rounded-xl h-11 pl-8 focus-visible:ring-[#FDA600]"
                        />
                      </div>
                    </FormControl>
                    <FormDescription className="text-xs">
                      Auto-computed or set manually.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}
        </div>

        {/* Pre-Order Toggle */}
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="is_pre_order"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between rounded-xl border border-[#D9D9D9] bg-white px-4 py-3">
                <div>
                  <FormLabel className="text-sm font-semibold text-[#1A1208] cursor-pointer flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-[#01454A]" />
                    Pre-Order Mode
                  </FormLabel>
                  <p className="text-xs text-[#7A6B44]">
                    Customers can order before stock is available.
                  </p>
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

          {isPreOrder && (
            <FormField
              control={form.control}
              name="pre_order_date"
              render={({ field }) => (
                <FormItem className="pl-2 border-l-2 border-[#01454A]/40 ml-2">
                  <FormLabel className="text-[#1A1208] font-semibold text-sm">
                    Expected Availability Date
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="date"
                      value={field.value ?? ""}
                      className="bg-white border-[#D9D9D9] rounded-xl h-11 focus-visible:ring-[#01454A]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>
      </SectionCard>

      {/* ── SECTION B: FABRIC SPECIFICATION ──────────────────────────────── */}
      <SectionCard
        icon={<Palette className="w-4 h-4" />}
        title="Fabric Specification"
        subtitle="Describe the material composition, care instructions, and ethical sourcing details."
      >
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2">

          {/* Fabric Type */}
          <FormField
            control={form.control}
            name="fabric_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[#1A1208] font-semibold text-sm flex items-center gap-1.5">
                  <Scissors className="w-3.5 h-3.5 text-[#01454A]" />
                  Fabric Type
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    id="fabric-type"
                    value={field.value ?? ""}
                    placeholder="e.g. 100% Egyptian Cotton, Silk-Organza Blend"
                    className="bg-white border-[#D9D9D9] rounded-xl h-11 focus-visible:ring-[#01454A]"
                    maxLength={120}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Care Instructions */}
          <FormField
            control={form.control}
            name="fabric_care_instructions"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[#1A1208] font-semibold text-sm">
                  Care Instructions
                </FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger
                      id="care-instructions"
                      className="bg-white border-[#D9D9D9] rounded-xl h-11 focus:ring-[#01454A]"
                    >
                      <SelectValue placeholder="Select care instructions" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="rounded-xl bg-white border-[#D9D9D9] shadow-lg">
                    {CARE_INSTRUCTION_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Country of Origin */}
          <FormField
            control={form.control}
            name="fabric_country_of_origin"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[#1A1208] font-semibold text-sm flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-[#01454A]" />
                  Country of Origin
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    id="country-origin"
                    value={field.value ?? ""}
                    placeholder="e.g. Nigeria, Ghana, Italy"
                    className="bg-white border-[#D9D9D9] rounded-xl h-11 focus-visible:ring-[#01454A]"
                    maxLength={80}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Ethical toggles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="fabric_is_organic"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between rounded-xl border border-[#D9D9D9] bg-white px-4 py-3">
                <div>
                  <FormLabel className="text-sm font-semibold text-[#1A1208] cursor-pointer flex items-center gap-1.5">
                    <Leaf className="w-4 h-4 text-green-600" />
                    Organic / Certified
                  </FormLabel>
                  <p className="text-[10px] text-[#7A6B44]">GOTS-certified or organic material</p>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="data-[state=checked]:bg-green-600"
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="fabric_is_vegan"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between rounded-xl border border-[#D9D9D9] bg-white px-4 py-3">
                <div>
                  <FormLabel className="text-sm font-semibold text-[#1A1208] cursor-pointer">
                    🌿 Vegan / Cruelty-Free
                  </FormLabel>
                  <p className="text-[10px] text-[#7A6B44]">No animal-derived materials used</p>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="data-[state=checked]:bg-emerald-600"
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="is_customisable"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between rounded-xl border border-[#D9D9D9] bg-white px-4 py-3 sm:col-span-2">
                <div>
                  <FormLabel className="text-sm font-semibold text-[#1A1208] cursor-pointer">
                    🎨 Accept Custom Orders
                  </FormLabel>
                  <p className="text-[10px] text-[#7A6B44]">
                    Enable for bespoke color, fit, or embroidery requests.
                  </p>
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
      </SectionCard>

      {/* ── SECTION C: SIZE & MEASUREMENT GUIDE ──────────────────────────── */}
      <SectionCard
        icon={<Ruler className="w-4 h-4" />}
        title="Size & Measurement Guide"
        subtitle="Build a detailed per-size measurement table to help customers find their fit."
      >
        {/* Toggle */}
        <FormField
          control={form.control}
          name="requires_measurement"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-xl border border-[#D9D9D9] bg-white px-4 py-3">
              <div>
                <FormLabel className="text-base font-semibold text-[#1A1208] cursor-pointer">
                  Enable Size Guide
                </FormLabel>
                <FormDescription className="text-xs">
                  Turn on to build a per-size measurement chart.
                </FormDescription>
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

        {requiresMeasurement && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-[#7A6B44]">
                <AlertCircle className="w-3 h-3 inline mr-1 text-[#FDA600]" />
                Leave measurement fields blank if not applicable for that size.
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addNewGuideRow}
                className="border-[#01454A] text-[#01454A] hover:bg-[#E8F3F1] rounded-xl"
              >
                <Plus className="w-4 h-4 mr-1.5" />
                Add Size Row
              </Button>
            </div>

            {guideFields.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[#D9D9D9] p-8 text-center bg-white">
                <Ruler className="w-8 h-8 text-zinc-300 mx-auto mb-2" />
                <p className="text-sm text-zinc-400">
                  Click "Add Size Row" to build your measurement guide.
                </p>
              </div>
            ) : (
              <div className="space-y-3 overflow-x-auto">
                {/* Table header */}
                <div className="grid grid-cols-[90px_repeat(8,1fr)_40px] gap-1.5 px-3 py-2 bg-[#F5FAF9] rounded-xl border border-[#D9D9D9] min-w-[800px]">
                  <span className="text-[10px] font-bold uppercase text-zinc-500">Size</span>
                  {MEASUREMENT_COLS.map((col) => (
                    <span
                      key={col.field}
                      className="text-[10px] font-bold uppercase text-zinc-500 truncate"
                    >
                      {col.name}
                    </span>
                  ))}
                  <span />
                </div>

                {/* Measurement rows */}
                {guideFields.map((fieldRow, idx) => (
                  <div
                    key={fieldRow.id}
                    className="grid grid-cols-[90px_repeat(8,1fr)_40px] gap-1.5 items-center bg-white p-2 rounded-xl border border-zinc-200 min-w-[800px]"
                  >
                    {/* Size label */}
                    <FormField
                      control={form.control}
                      name={`measurement_guide.${idx}.size_label`}
                      render={({ field: f }) => (
                        <FormItem>
                          <Select onValueChange={f.onChange} value={f.value}>
                            <FormControl>
                              <SelectTrigger className="h-8 text-xs border-[#D9D9D9] rounded-lg">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="rounded-xl">
                              {SIZE_LABELS.map((sz) => (
                                <SelectItem key={sz} value={sz} className="text-xs">
                                  {sz}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />

                    {/* Measurement fields */}
                    {MEASUREMENT_COLS.map((col) => (
                      <FormField
                        key={col.field}
                        control={form.control}
                        name={
                          `measurement_guide.${idx}.${col.field}` as
                            | `measurement_guide.${number}.chest_cm`
                            | `measurement_guide.${number}.waist_cm`
                            | `measurement_guide.${number}.hip_cm`
                            | `measurement_guide.${number}.shoulder_cm`
                            | `measurement_guide.${number}.sleeve_cm`
                            | `measurement_guide.${number}.length_cm`
                            | `measurement_guide.${number}.inseam_cm`
                            | `measurement_guide.${number}.foot_length_cm`
                        }
                        render={({ field: f }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                {...f}
                                value={f.value ?? ""}
                                placeholder={col.placeholder}
                                className="h-8 text-xs border-[#D9D9D9] rounded-lg focus-visible:ring-[#01454A]/30"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    ))}

                    {/* Delete row */}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                      onClick={() => removeGuideRow(idx)}
                      aria-label={`Remove size row ${idx + 1}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </SectionCard>
    </div>
  );
}
