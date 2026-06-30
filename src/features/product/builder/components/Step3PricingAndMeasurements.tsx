"use client";

/**
 * @file Step3PricingAndMeasurements.tsx
 * @description Pricing, inventory, fabric details, and media-owned size links.
 * Rendered as Step 3 in the vendor product builder.
 */

import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useFormContext } from "react-hook-form";
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
import { Modal } from "@/components/ui/common";
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
  Calendar,
  Leaf,
  Globe,
  Scissors,
  AlertCircle,
  Image as ImageIcon,
  Video as VideoIcon,
} from "lucide-react";
import {
  createVendorMeasurementTemplate,
  fetchVendorMeasurementTemplates,
} from "@/features/product";
import { toast } from "sonner";

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
const NO_SIZE_VALUE = "__no_size_link__";

interface SizingTemplateOption {
  size_id: string;
  label: string;
  templateName: string;
  size_label: string;
}

function formatLocalDatePlusDays(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

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
    <div className="min-w-0 rounded-2xl border border-[#ECE6D6] bg-[#FAFAF8] p-4 sm:p-6 space-y-6 transition-shadow hover:shadow-md">
      <div className="border-b border-[#ECE6D6] pb-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-[#01454A]/10 text-[#01454A]">
            {icon}
          </span>
          <h3 className="min-w-0 text-base font-bold text-[#1A1208]">{title}</h3>
        </div>
        {subtitle && (
          <p className="mt-1.5 text-xs text-[#7A6B44] sm:ml-10">{subtitle}</p>
        )}
      </div>
      {children}
    </div>
  );
}

function SizeLinkSelect({
  control,
  name,
  sizeOptions,
  onAdd,
}: {
  control: ReturnType<typeof useFormContext<ProductBuilderFormValues>>["control"];
  name: string;
  sizeOptions: SizingTemplateOption[];
  onAdd: (fieldName: string) => void;
}) {
  return (
    <FormField
      control={control}
      name={name as never}
      render={({ field }) => (
        <FormItem className="min-w-0">
          <FormLabel className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#7A6B44]">
            Size Link
          </FormLabel>
          <div className="flex min-w-0 gap-2">
            <Select
              onValueChange={(value) => field.onChange(value === NO_SIZE_VALUE ? null : value)}
              value={(field.value as string | null | undefined) || NO_SIZE_VALUE}
            >
              <FormControl>
                <SelectTrigger className="min-w-0 flex-1 rounded-xl border-[#D9D9D9] bg-white h-11 focus:ring-[#01454A]">
                  <SelectValue placeholder="Link to a size..." />
                </SelectTrigger>
              </FormControl>
              <SelectContent className="rounded-xl border-[#D9D9D9] bg-white shadow-lg">
                <SelectItem value={NO_SIZE_VALUE}>No size link</SelectItem>
                {sizeOptions.map((option) => (
                  <SelectItem key={option.size_id} value={option.size_id}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => onAdd(name)}
              className="h-11 w-11 flex-shrink-0 rounded-xl border-[#D9D9D9] hover:bg-[#E8F3F1] hover:text-[#01454A]"
              aria-label="Add new size template"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export function Step3PricingAndMeasurements() {
  const form = useFormContext<ProductBuilderFormValues>();
  const isDiscounted = form.watch("is_discounted");
  const isPreOrder = form.watch("is_pre_order");
  const requiresMeasurement = form.watch("requires_measurement");
  const galleryItems = form.watch("gallery") ?? [];
  const minPreOrderDate = useMemo(() => formatLocalDatePlusDays(3), []);

  const coverPublicId = form.watch("cover_image_public_id");
  const coverUrl = form.watch("cover_image_url");
  const coverColorName = form.watch("cover_image_color_name");
  const coverColorHex = form.watch("cover_image_color_hex");

  const { data: templates = [], refetch: refetchTemplates } = useQuery({
    queryKey: ["vendor", "measurement-templates"],
    queryFn: fetchVendorMeasurementTemplates,
  });

  const sizeOptions = useMemo(() => {
    const options: SizingTemplateOption[] = [];
    templates.forEach((template) => {
      (template.template_rows || []).forEach((row) => {
        if (row.size_id) {
          options.push({
            size_id: row.size_id,
            label: `${template.name} - ${row.size_label}`,
            templateName: template.name,
            size_label: row.size_label,
          });
        }
      });
    });
    return options;
  }, [templates]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [targetFieldName, setTargetFieldName] = useState<string | null>(null);
  const [templateName, setTemplateName] = useState("");
  const [sizeLabel, setSizeLabel] = useState<(typeof SIZE_LABELS)[number]>("M");
  const [chest, setChest] = useState("");
  const [waist, setWaist] = useState("");
  const [hip, setHip] = useState("");
  const [length, setLength] = useState("");
  const [shoulder, setShoulder] = useState("");
  const [sleeve, setSleeve] = useState("");
  const [inseam, setInseam] = useState("");
  const [footLength, setFootLength] = useState("");
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);

  const handleOpenAddSizeModal = (fieldName: string) => {
    setTargetFieldName(fieldName);
    setTemplateName("");
    setSizeLabel("M");
    setChest("");
    setWaist("");
    setHip("");
    setLength("");
    setShoulder("");
    setSleeve("");
    setInseam("");
    setFootLength("");
    setIsModalOpen(true);
  };

  const handleSaveSizeGuide = async () => {
    if (!templateName.trim()) {
      toast.error("Please enter a template name.");
      return;
    }
    if (!targetFieldName) {
      toast.error("Select a product media item before saving a size.");
      return;
    }

    setIsSavingTemplate(true);
    try {
      const created = await createVendorMeasurementTemplate({
        name: templateName.trim(),
        description: "Created from the product builder pricing and measurement step.",
        template_rows: [
          {
            size_label: sizeLabel,
            chest_cm: chest || undefined,
            waist_cm: waist || undefined,
            hip_cm: hip || undefined,
            length_cm: length || undefined,
            shoulder_cm: shoulder || undefined,
            sleeve_cm: sleeve || undefined,
            inseam_cm: inseam || undefined,
            foot_length_cm: footLength || undefined,
            sort_order: 0,
          },
        ],
      });

      const createdRow =
        (created.template_rows || []).find((row) => row.size_label === sizeLabel) ||
        created.template_rows?.[0];

      if (createdRow?.size_id) {
        form.setValue(targetFieldName as never, createdRow.size_id as never, {
          shouldDirty: true,
          shouldValidate: true,
        });
        await refetchTemplates();
        toast.success("Size guide saved and linked to this media.");
        setIsModalOpen(false);
      } else {
        toast.error("Size guide saved, but no reusable size ID was returned.");
      }
    } catch {
      toast.error("We could not save that size guide. Please try again.");
    } finally {
      setIsSavingTemplate(false);
    }
  };

  return (
    <div className="min-w-0 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <SectionCard
        icon={<DollarSign className="h-4 w-4" />}
        title="Pricing & Inventory"
        subtitle="Set the new price, optional old price, total stock, and payment mode."
      >
        <div className="grid min-w-0 grid-cols-1 gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem className="min-w-0">
                <FormLabel className="text-sm font-semibold text-[#1A1208]">
                  New Price (NGN) <span className="text-[#FDA600]">*</span>
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-zinc-400">
                      NGN
                    </span>
                    <Input
                      {...field}
                      id="new-price"
                      type="number"
                      step="0.01"
                      min="5000"
                      placeholder="e.g. 15000.00"
                      className="h-11 rounded-xl border-[#D9D9D9] bg-white pl-12 focus-visible:ring-[#01454A]"
                    />
                  </div>
                </FormControl>
                <FormDescription className="text-xs">
                  This is the selling price customers will pay. Minimum NGN 5,000.00.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="old_price"
            render={({ field }) => (
              <FormItem className="min-w-0">
                <FormLabel className="text-sm font-semibold text-[#1A1208]">
                  Old Price (NGN)
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-zinc-400">
                      NGN
                    </span>
                    <Input
                      {...field}
                      id="old-price"
                      type="number"
                      step="0.01"
                      min="0"
                      value={field.value ?? ""}
                      placeholder="e.g. 20000.00"
                      className="h-11 rounded-xl border-[#D9D9D9] bg-white pl-12 focus-visible:ring-[#01454A]"
                    />
                  </div>
                </FormControl>
                <FormDescription className="text-xs">
                  Optional previous price shown as the crossed-out reference.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="stock_qty"
            render={({ field }) => (
              <FormItem className="min-w-0">
                <FormLabel className="text-sm font-semibold text-[#1A1208]">
                  Total Stock Quantity <span className="text-[#FDA600]">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    id="stock-qty"
                    type="number"
                    min={1}
                    onChange={(event) =>
                      field.onChange(Number.parseInt(event.target.value, 10) || 0)
                    }
                    placeholder="e.g. 50"
                    className="h-11 rounded-xl border-[#D9D9D9] bg-white focus-visible:ring-[#01454A]"
                  />
                </FormControl>
                <FormDescription className="text-xs">
                  Enter the physical units available for sale.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="cash_payment_mode"
            render={({ field }) => (
              <FormItem className="min-w-0">
                <FormLabel className="text-sm font-semibold text-[#1A1208]">
                  Payment Mode <span className="text-[#FDA600]">*</span>
                </FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger
                      id="payment-mode"
                      className="h-11 rounded-xl border-[#D9D9D9] bg-white focus:ring-[#01454A]"
                    >
                      <SelectValue placeholder="Select payment mode" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="rounded-xl border-[#D9D9D9] bg-white shadow-lg">
                    {PAYMENT_MODES.map((mode) => (
                      <SelectItem key={mode.value} value={mode.value}>
                        {mode.label}
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
            name="currency"
            render={({ field }) => (
              <FormItem className="min-w-0">
                <FormLabel className="text-sm font-semibold text-[#1A1208]">
                  Currency
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    id="currency"
                    maxLength={3}
                    placeholder="NGN"
                    className="h-11 rounded-xl border-[#D9D9D9] bg-white uppercase focus-visible:ring-[#01454A]"
                  />
                </FormControl>
                <FormDescription className="text-xs">Use a 3-letter code such as NGN.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-4">
          <FormField
            control={form.control}
            name="is_discounted"
            render={({ field }) => (
              <FormItem className="flex flex-col gap-3 rounded-xl border border-[#D9D9D9] bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <FormLabel className="cursor-pointer text-sm font-semibold text-[#1A1208]">
                    Apply Discount
                  </FormLabel>
                  <p className="text-xs text-[#7A6B44]">
                    Enable this only when you want customers to see a clear discount.
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
            <div className="grid grid-cols-1 gap-6 border-l-2 border-[#FDA600]/40 pl-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="discount_percentage"
                render={({ field }) => (
                  <FormItem className="min-w-0">
                    <FormLabel className="text-sm font-semibold text-[#1A1208]">
                      Discount Percentage <span className="text-[#FDA600]">*</span>
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          type="number"
                          min={0}
                          max={100}
                          step={1}
                          onChange={(event) =>
                            field.onChange(Number.parseFloat(event.target.value) || 0)
                          }
                          placeholder="e.g. 25"
                          className="h-11 rounded-xl border-[#D9D9D9] bg-white pr-8 focus-visible:ring-[#FDA600]"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold text-zinc-400">
                          %
                        </span>
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
                  <FormItem className="min-w-0">
                    <FormLabel className="text-sm font-semibold text-[#1A1208]">
                      Discounted Price (NGN)
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-zinc-400">
                          NGN
                        </span>
                        <Input
                          {...field}
                          type="number"
                          step="0.01"
                          value={field.value ?? ""}
                          placeholder="e.g. 11250.00"
                          className="h-11 rounded-xl border-[#D9D9D9] bg-white pl-12 focus-visible:ring-[#FDA600]"
                        />
                      </div>
                    </FormControl>
                    <FormDescription className="text-xs">
                      Leave blank if the system should calculate from the percentage.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}
        </div>

        <div className="space-y-4">
          <FormField
            control={form.control}
            name="is_pre_order"
            render={({ field }) => (
              <FormItem className="flex flex-col gap-3 rounded-xl border border-[#D9D9D9] bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <FormLabel className="flex cursor-pointer items-center gap-1.5 text-sm font-semibold text-[#1A1208]">
                    <Calendar className="h-4 w-4 text-[#01454A]" />
                    Pre-Order Mode
                  </FormLabel>
                  <p className="text-xs text-[#7A6B44]">
                    Use this when the tailor needs production time before the product is available.
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
                <FormItem className="border-l-2 border-[#01454A]/40 pl-4">
                  <FormLabel className="text-sm font-semibold text-[#1A1208]">
                    Expected Availability Date
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="date"
                      min={minPreOrderDate}
                      value={field.value ?? ""}
                      className="h-11 rounded-xl border-[#D9D9D9] bg-white focus-visible:ring-[#01454A]"
                    />
                  </FormControl>
                  <FormDescription className="text-xs">
                    Choose a date at least 3 days from today so production time is realistic.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>
      </SectionCard>

      <SectionCard
        icon={<Palette className="h-4 w-4" />}
        title="Fabric Specification"
        subtitle="Describe the material, care instructions, and ethical sourcing details."
      >
        <div className="grid min-w-0 grid-cols-1 gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="fabric_type"
            render={({ field }) => (
              <FormItem className="min-w-0">
                <FormLabel className="flex items-center gap-1.5 text-sm font-semibold text-[#1A1208]">
                  <Scissors className="h-3.5 w-3.5 text-[#01454A]" />
                  Fabric Type
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    id="fabric-type"
                    value={field.value ?? ""}
                    placeholder="e.g. 100% Egyptian Cotton"
                    className="h-11 rounded-xl border-[#D9D9D9] bg-white focus-visible:ring-[#01454A]"
                    maxLength={120}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="fabric_care_instructions"
            render={({ field }) => (
              <FormItem className="min-w-0">
                <FormLabel className="text-sm font-semibold text-[#1A1208]">
                  Care Instructions
                </FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger
                      id="care-instructions"
                      className="h-11 rounded-xl border-[#D9D9D9] bg-white focus:ring-[#01454A]"
                    >
                      <SelectValue placeholder="Select care instructions" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="rounded-xl border-[#D9D9D9] bg-white shadow-lg">
                    {CARE_INSTRUCTION_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
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
            name="fabric_country_of_origin"
            render={({ field }) => (
              <FormItem className="min-w-0">
                <FormLabel className="flex items-center gap-1.5 text-sm font-semibold text-[#1A1208]">
                  <Globe className="h-3.5 w-3.5 text-[#01454A]" />
                  Country of Origin
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    id="country-origin"
                    value={field.value ?? ""}
                    placeholder="e.g. Nigeria, Ghana, Italy"
                    className="h-11 rounded-xl border-[#D9D9D9] bg-white focus-visible:ring-[#01454A]"
                    maxLength={80}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="fabric_is_organic"
            render={({ field }) => (
              <FormItem className="flex flex-col gap-3 rounded-xl border border-[#D9D9D9] bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <FormLabel className="flex cursor-pointer items-center gap-1.5 text-sm font-semibold text-[#1A1208]">
                    <Leaf className="h-4 w-4 text-green-600" />
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
              <FormItem className="flex flex-col gap-3 rounded-xl border border-[#D9D9D9] bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <FormLabel className="cursor-pointer text-sm font-semibold text-[#1A1208]">
                    Vegan / Cruelty-Free
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
              <FormItem className="flex flex-col gap-3 rounded-xl border border-[#D9D9D9] bg-white px-4 py-3 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <FormLabel className="cursor-pointer text-sm font-semibold text-[#1A1208]">
                    Accept Custom Orders
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

      <SectionCard
        icon={<Ruler className="h-4 w-4" />}
        title="Size Links & Measurements"
        subtitle="Attach uploaded media to reusable size templates. Upload media first, then link the right size here."
      >
        <FormField
          control={form.control}
          name="requires_measurement"
          render={({ field }) => (
            <FormItem className="flex flex-col gap-3 rounded-xl border border-[#D9D9D9] bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <FormLabel className="cursor-pointer text-base font-semibold text-[#1A1208]">
                  Enable Size Guide
                </FormLabel>
                <FormDescription className="text-xs">
                  Turn this on when customers need size measurements before ordering.
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

        {requiresMeasurement ? (
          <div className="space-y-4">
            <p className="rounded-xl border border-[#FDA600]/30 bg-[#FFF7E6] px-4 py-3 text-xs text-[#7A6B44]">
              <AlertCircle className="mr-1 inline h-3 w-3 text-[#FDA600]" />
              Size links now live in Step 3 so pricing and measurement decisions stay together.
            </p>

            <div className="grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-2">
              {coverPublicId || coverUrl ? (
                <div className="min-w-0 rounded-2xl border border-[#ECE6D6] bg-white p-4 shadow-sm">
                  <div className="mb-4 flex min-w-0 items-start gap-3">
                    <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[#E8F3F1] text-[#01454A]">
                      <ImageIcon className="h-5 w-5" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-[#1A1208]">Cover Image</p>
                      <div className="mt-1 flex min-w-0 items-center gap-2 text-xs text-[#7A6B44]">
                        <span
                          className="h-3 w-3 flex-shrink-0 rounded-full border border-[#D9D9D9]"
                          style={{ backgroundColor: coverColorHex || "#F8F5ED" }}
                        />
                        <span className="truncate">{coverColorName || "No color linked yet"}</span>
                      </div>
                    </div>
                  </div>
                  <SizeLinkSelect
                    control={form.control}
                    name="cover_image_size_id"
                    sizeOptions={sizeOptions}
                    onAdd={handleOpenAddSizeModal}
                  />
                </div>
              ) : (
                <div className="min-w-0 rounded-2xl border border-dashed border-[#D9D9D9] bg-white p-6 text-center">
                  <ImageIcon className="mx-auto mb-2 h-8 w-8 text-zinc-300" />
                  <p className="text-sm text-zinc-500">Upload a cover image in Step 2 to link a size.</p>
                </div>
              )}

              {galleryItems.map((item, idx) => (
                <div
                  key={`${item.public_id || item.secure_url || idx}-${idx}`}
                  className="min-w-0 rounded-2xl border border-[#ECE6D6] bg-white p-4 shadow-sm"
                >
                  <div className="mb-4 flex min-w-0 items-start gap-3">
                    <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[#E8F3F1] text-[#01454A]">
                      {item.media_type === "video" ? (
                        <VideoIcon className="h-5 w-5" />
                      ) : (
                        <ImageIcon className="h-5 w-5" />
                      )}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-[#1A1208]">Gallery Media #{idx + 1}</p>
                      <div className="mt-1 flex min-w-0 items-center gap-2 text-xs text-[#7A6B44]">
                        <span
                          className="h-3 w-3 flex-shrink-0 rounded-full border border-[#D9D9D9]"
                          style={{ backgroundColor: item.color_hex || "#F8F5ED" }}
                        />
                        <span className="truncate">{item.color_name || "No color linked yet"}</span>
                      </div>
                    </div>
                  </div>
                  <SizeLinkSelect
                    control={form.control}
                    name={`gallery.${idx}.size_id`}
                    sizeOptions={sizeOptions}
                    onAdd={handleOpenAddSizeModal}
                  />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-[#D9D9D9] bg-white p-6 text-center">
            <Ruler className="mx-auto mb-2 h-8 w-8 text-zinc-300" />
            <p className="text-sm text-zinc-500">
              Turn on size guide support if this product needs customer measurements.
            </p>
          </div>
        )}
      </SectionCard>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Measurement Size"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-xs text-[#7A6B44]">
            Save a reusable size row, then link it directly to the selected cover or gallery media.
          </p>

          <div className="space-y-3">
            <label className="block text-xs font-bold uppercase tracking-[0.16em] text-[#7A6B44]">
              Template Name
            </label>
            <Input
              value={templateName}
              onChange={(event) => setTemplateName(event.target.value)}
              placeholder="e.g. Women's Premium Dress Guide"
              className="h-10 rounded-xl border-[#D9D9D9] bg-white focus-visible:ring-[#01454A]"
            />
          </div>

          <div className="space-y-3">
            <label className="block text-xs font-bold uppercase tracking-[0.16em] text-[#7A6B44]">
              Measurement Size
            </label>
            <Select
              value={sizeLabel}
              onValueChange={(value) => setSizeLabel(value as (typeof SIZE_LABELS)[number])}
            >
              <SelectTrigger className="h-10 rounded-xl border-[#D9D9D9] bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl bg-white">
                {SIZE_LABELS.map((size) => (
                  <SelectItem key={size} value={size}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {[
              ["Chest (cm)", chest, setChest],
              ["Waist (cm)", waist, setWaist],
              ["Hip (cm)", hip, setHip],
              ["Length (cm)", length, setLength],
              ["Shoulder (cm)", shoulder, setShoulder],
              ["Sleeve (cm)", sleeve, setSleeve],
              ["Inseam (cm)", inseam, setInseam],
              ["Foot (cm)", footLength, setFootLength],
            ].map(([label, value, setter]) => (
              <label key={label as string} className="space-y-1">
                <span className="text-xs font-semibold text-[#1A1208]">{label as string}</span>
                <Input
                  value={value as string}
                  onChange={(event) => (setter as (next: string) => void)(event.target.value)}
                  placeholder="Optional"
                  className="h-10 rounded-xl border-[#D9D9D9] bg-white focus-visible:ring-[#01454A]"
                />
              </label>
            ))}
          </div>

          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsModalOpen(false)}
              className="h-10 rounded-xl px-4 text-[#7A6B44] hover:text-[#1A1208]"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSaveSizeGuide}
              isLoading={isSavingTemplate}
              className="h-10 rounded-xl bg-[#FDA600] px-4 text-white hover:bg-[#E89700]"
            >
              Save Template
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
