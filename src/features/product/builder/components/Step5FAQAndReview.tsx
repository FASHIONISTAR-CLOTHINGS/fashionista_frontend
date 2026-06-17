"use client";

/**
 * @file Step5FAQAndReview.tsx
 * @description Step 5 — FAQs, SEO Meta, Publish Settings & Review Summary
 *
 * Fields covered (aligned to ProductBuilderFormSchema Step5Schema):
 *   • faqs            — persisted question/answer rows (max 5)
 *   • meta_title      — SEO title override (max 160 chars)
 *   • meta_description — SEO description override (max 320 chars)
 *   • publish_intent  — "draft" | "pending"
 *   • featured        — boolean, request featured placement
 *   • hot_deal        — boolean, mark as Hot Deal
 *
 * Plus a read-only REVIEW SUMMARY that surfaces the key data from all prior
 * steps for final confirmation before submission.
 */

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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  SendHorizontal,
  Settings,
  X,
  Check,
  ClipboardList,
  Package,
  Palette,
  Ruler,
  Truck,
  ImageIcon,
  AlertCircle,
  Tag,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// STATIC FAQ LIBRARY (10 expertly-crafted fashion FAQs)
// ─────────────────────────────────────────────────────────────────────────────

export const FASHION_FAQS = [
  {
    id: "faq_01",
    icon: "📏",
    question: "What sizes are available for this item?",
    answer:
      "This product is available in sizes XS through XXL. Please refer to the size guide on the product page for exact measurements to find your perfect fit.",
  },
  {
    id: "faq_02",
    icon: "🧺",
    question: "How do I care for and wash this garment?",
    answer:
      "Care instructions vary by fabric. Please check the label stitched inside the garment. As a general rule, we recommend gentle hand-washing or a delicate machine cycle in cold water, then air-drying flat to maintain shape and colour vibrancy.",
  },
  {
    id: "faq_03",
    icon: "🎨",
    question: "Can I request a custom colour or tailored fit?",
    answer:
      "Yes! We offer bespoke colour and tailoring options on select items. Please contact our support team or use the 'Custom Request' option at checkout to discuss your requirements before placing an order.",
  },
  {
    id: "faq_04",
    icon: "🔄",
    question: "What is your return and exchange policy?",
    answer:
      "We accept returns and exchanges within 14 days of delivery, provided the item is unworn, unwashed, and in its original packaging with all tags attached. Custom or sale items are final sale and non-refundable.",
  },
  {
    id: "faq_05",
    icon: "🚚",
    question: "How long does order processing and delivery take?",
    answer:
      "Standard orders are processed within 1–3 business days. Delivery timelines depend on your location — typically 3–7 business days for domestic orders and 10–21 business days for international shipments.",
  },
  {
    id: "faq_06",
    icon: "🌿",
    question: "Is this item made from sustainable or ethically sourced fabrics?",
    answer:
      "We are committed to ethical fashion. Many of our collections use GOTS-certified organic cotton, recycled fibres, or traceable supply-chain materials. Each product listing specifies the fabric composition and sourcing details.",
  },
  {
    id: "faq_07",
    icon: "💳",
    question: "What payment methods do you accept?",
    answer:
      "We accept Visa, Mastercard, bank transfers, and select mobile payment wallets. We also offer Buy Now Pay Later (BNPL) options at checkout for eligible orders above ₦10,000.",
  },
  {
    id: "faq_08",
    icon: "🎁",
    question: "Do you offer gift wrapping or personalised packaging?",
    answer:
      "Yes! Gift wrapping and a personalised message card can be added at checkout for a small fee. We take pride in our luxury unboxing experience — every order ships in our signature branded tissue paper.",
  },
  {
    id: "faq_09",
    icon: "📦",
    question: "How can I track my order after it has shipped?",
    answer:
      "Once your order ships, you will receive a tracking number via email and SMS. You can also view real-time shipment status from your account dashboard under 'My Orders'.",
  },
  {
    id: "faq_10",
    icon: "🖼️",
    question: "Are the colours in the photos accurate to the actual product?",
    answer:
      "We use professional studio lighting and colour-calibrated photography to ensure the most accurate representation possible. However, colours may appear slightly different depending on your device screen calibration. We always recommend checking the exact fabric swatch description in the product details.",
  },
] as const;

type BuilderFaqRow = ProductBuilderFormValues["faqs"][number];

// ─────────────────────────────────────────────────────────────────────────────
// SECTION CARD
// ─────────────────────────────────────────────────────────────────────────────

function SectionCard({
  icon,
  title,
  subtitle,
  headerRight,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  headerRight?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-[#ECE6D6] bg-[#FAFAF8] p-6 space-y-5 transition-shadow hover:shadow-md">
      <div className="border-b border-[#ECE6D6] pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#01454A]/10 text-[#01454A]">
              {icon}
            </span>
            <h3 className="text-base font-bold text-[#1A1208]">{title}</h3>
          </div>
          {headerRight}
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
// REVIEW SUMMARY ITEM
// ─────────────────────────────────────────────────────────────────────────────

function ReviewItem({
  icon,
  label,
  value,
  status,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  status?: "ok" | "warn" | "missing";
}) {
  const statusColor =
    status === "ok"
      ? "text-green-600"
      : status === "warn"
      ? "text-[#FDA600]"
      : status === "missing"
      ? "text-red-400"
      : "text-zinc-600";

  return (
    <div className="flex items-start gap-3 rounded-xl bg-white border border-zinc-100 px-4 py-3">
      <span className="text-[#01454A] mt-0.5 flex-shrink-0">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-bold uppercase text-zinc-400 tracking-wide mb-0.5">
          {label}
        </p>
        <p className={`text-sm font-semibold truncate ${statusColor}`}>
          {value}
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN STEP 5 COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export function Step5FAQAndReview() {
  const form = useFormContext<ProductBuilderFormValues>();

  const selectedFaqs: BuilderFaqRow[] = form.watch("faqs") ?? [];
  const selectedFaqQuestions = new Set(
    selectedFaqs.map((faq) => faq.question),
  );
  const publishIntent   = form.watch("publish_intent");

  // Data for Review Summary
  const title         = form.watch("title")         ?? "";
  const price         = form.watch("price")         ?? "";
  const stockQty      = form.watch("stock_qty")     ?? 0;
  const fabricType    = form.watch("fabric_type")   ?? "";
  const weightKg      = form.watch("weight_kg")     ?? "";
  const coverPublicId = form.watch("cover_image_public_id") ?? "";
  const galleryCount  = (form.watch("gallery") ?? []).length;
  const guideCount    = (form.watch("measurement_guide") ?? []).length;

  // ── FAQ toggle helpers ────────────────────────────────────────────────────
  const toggleFaq = (id: string) => {
    const faq = FASHION_FAQS.find((item) => item.id === id);
    if (!faq) return;

    const current = form.getValues("faqs") ?? [];
    const alreadySelected = current.some((item) => item.question === faq.question);

    if (alreadySelected) {
      form.setValue("faqs", current.filter((item) => item.question !== faq.question), {
        shouldValidate: true,
      });
    } else if (current.length < 5) {
      form.setValue(
        "faqs",
        [...current, { question: faq.question, answer: faq.answer }],
        { shouldValidate: true },
      );
    }
  };

  const removeFaq = (question: string) => {
    const current = form.getValues("faqs") ?? [];
    form.setValue(
      "faqs",
      current.filter((faq) => faq.question !== question),
      { shouldValidate: true }
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* ── SECTION A: FASHION FAQs ───────────────────────────────────────── */}
      <SectionCard
        icon={<BookOpen className="w-4 h-4" />}
        title="Frequently Asked Questions"
        subtitle="Select up to 5 FAQs from our curated fashion library to display on your product page."
        headerRight={
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#01454A]">
              {selectedFaqs.length} / 5
            </span>
            {selectedFaqs.length >= 5 && (
              <Badge className="bg-[#01454A] text-white text-[10px] px-2 py-0.5">
                Max
              </Badge>
            )}
          </div>
        }
      >
        {/* Selected FAQ chips */}
        {selectedFaqs.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {selectedFaqs.map((faq) => {
              const preset = FASHION_FAQS.find((item) => item.question === faq.question);
              return (
                <Badge
                  key={faq.question}
                  variant="secondary"
                  className="bg-[#E8F3F1] text-[#01454A] border border-[#01454A]/20 pl-2.5 pr-1.5 py-1 text-xs gap-1.5 max-w-[300px] h-auto"
                >
                  <span className="truncate">{preset?.icon ?? "•"} {faq.question}</span>
                  <button
                    type="button"
                    onClick={() => removeFaq(faq.question)}
                    className="ml-0.5 text-[#01454A]/60 hover:text-red-600 transition-colors flex-shrink-0"
                    aria-label={`Remove FAQ: ${faq.question}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              );
            })}
          </div>
        )}

        {/* FAQ selection list */}
        <div className="space-y-2.5">
          {FASHION_FAQS.map((faq) => {
            const isSelected = selectedFaqQuestions.has(faq.question);
            const isDisabled = !isSelected && selectedFaqs.length >= 5;

            return (
              <button
                key={faq.id}
                type="button"
                disabled={isDisabled}
                onClick={() => toggleFaq(faq.id)}
                className={`w-full text-left rounded-xl border p-4 transition-all duration-200 flex items-start gap-3 ${
                  isSelected
                    ? "border-[#01454A] bg-[#E8F3F1] shadow-sm"
                    : isDisabled
                    ? "border-[#D9D9D9] bg-zinc-50 opacity-40 cursor-not-allowed"
                    : "border-[#D9D9D9] bg-white hover:border-[#01454A]/40 hover:bg-[#F5FAF9]"
                }`}
              >
                {/* Checkbox indicator */}
                <span
                  className={`flex-shrink-0 mt-0.5 flex h-5 w-5 items-center justify-center rounded-full border-2 transition-all ${
                    isSelected
                      ? "border-[#01454A] bg-[#01454A]"
                      : "border-[#D9D9D9]"
                  }`}
                >
                  {isSelected && <Check className="h-2.5 w-2.5 text-white" />}
                </span>

                {/* FAQ content */}
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-semibold leading-snug ${
                      isSelected ? "text-[#01454A]" : "text-[#1A1208]"
                    }`}
                  >
                    {faq.icon} {faq.question}
                  </p>
                  <p className="text-xs text-[#7A6B44] mt-1 leading-relaxed line-clamp-2">
                    {faq.answer}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </SectionCard>

      {/* ── SECTION B: SEO & DISCOVERY ────────────────────────────────────── */}
      <SectionCard
        icon={<Settings className="w-4 h-4" />}
        title="SEO & Discovery"
        subtitle="Custom meta title and description for search engines. Falls back to product title when blank."
      >
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="meta_title"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[#1A1208] font-semibold text-sm">
                  Meta Title
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    id="meta-title"
                    value={field.value ?? ""}
                    placeholder="Custom SEO title (max 160 characters)"
                    className="bg-white border-[#D9D9D9] rounded-xl h-11 focus-visible:ring-[#01454A]"
                    maxLength={160}
                  />
                </FormControl>
                <div className="flex justify-end">
                  <span
                    className={`text-xs font-mono ${
                      (field.value?.length ?? 0) > 140
                        ? "text-orange-500"
                        : "text-zinc-400"
                    }`}
                  >
                    {field.value?.length ?? 0} / 160
                  </span>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="meta_description"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[#1A1208] font-semibold text-sm">
                  Meta Description
                </FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    id="meta-description"
                    value={field.value ?? ""}
                    placeholder="Custom SEO description (max 320 characters) — appears in Google search snippets."
                    className="bg-white border-[#D9D9D9] rounded-xl h-24 resize-none focus-visible:ring-[#01454A]"
                    maxLength={320}
                  />
                </FormControl>
                <div className="flex items-center justify-between">
                  <FormDescription className="text-xs">
                    Aim for 120–160 characters for optimal search snippet display.
                  </FormDescription>
                  <span
                    className={`text-xs font-mono ${
                      (field.value?.length ?? 0) > 280
                        ? "text-orange-500"
                        : "text-zinc-400"
                    }`}
                  >
                    {field.value?.length ?? 0} / 320
                  </span>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </SectionCard>

      {/* ── SECTION C: PUBLISH SETTINGS ───────────────────────────────────── */}
      <SectionCard
        icon={<SendHorizontal className="w-4 h-4" />}
        title="Publish Settings"
        subtitle="Choose how this product is saved and promoted across the platform."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Publish Intent */}
          <FormField
            control={form.control}
            name="publish_intent"
            render={({ field }) => (
              <FormItem className="md:col-span-1">
                <FormLabel className="text-[#1A1208] font-semibold text-sm">
                  Publish Action <span className="text-[#FDA600]">*</span>
                </FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger
                      id="publish-intent"
                      className="bg-white border-[#D9D9D9] text-[#1A1208] rounded-xl h-11 focus:ring-[#01454A]"
                    >
                      <SelectValue placeholder="Select publish action" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-white border-[#D9D9D9] text-[#1A1208] shadow-lg rounded-xl">
                    <SelectItem value="draft">
                      💾 Save as Draft (Private)
                    </SelectItem>
                    <SelectItem value="pending">
                      🚀 Submit for Review (Publish)
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription className="text-xs text-[#7A6B44]">
                  {publishIntent === "pending"
                    ? '"Submit for Review" puts your product in the admin approval queue before going live.'
                    : "Draft mode keeps the product private until you submit it."}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Toggles column */}
          <div className="space-y-3">
            <FormField
              control={form.control}
              name="featured"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-xl bg-white border border-[#D9D9D9] px-4 py-3">
                  <div>
                    <FormLabel className="text-sm font-semibold text-[#1A1208] cursor-pointer">
                      ⭐ Request Featured Placement
                    </FormLabel>
                    <p className="text-[10px] text-[#7A6B44]">
                      Admin approval required. Boosts visibility.
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

            <FormField
              control={form.control}
              name="hot_deal"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-xl bg-white border border-[#D9D9D9] px-4 py-3">
                  <div>
                    <FormLabel className="text-sm font-semibold text-[#1A1208] cursor-pointer">
                      🔥 Mark as Hot Deal
                    </FormLabel>
                    <p className="text-[10px] text-[#7A6B44]">
                      Shows a Hot Deal badge on the product listing.
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
        </div>
      </SectionCard>

      {/* ── SECTION D: REVIEW SUMMARY ─────────────────────────────────────── */}
      <SectionCard
        icon={<ClipboardList className="w-4 h-4" />}
        title="Review Summary"
        subtitle="Double-check your product details before submitting."
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <ReviewItem
            icon={<Tag className="w-4 h-4" />}
            label="Product Title"
            value={title || "— Not set —"}
            status={title.length >= 5 ? "ok" : "missing"}
          />
          <ReviewItem
            icon={<Package className="w-4 h-4" />}
            label="Base Price"
            value={price ? `₦${parseFloat(price).toLocaleString()}` : "— Not set —"}
            status={price ? "ok" : "missing"}
          />
          <ReviewItem
            icon={<Package className="w-4 h-4" />}
            label="Stock Quantity"
            value={stockQty > 0 ? `${stockQty} units` : "— Not set —"}
            status={stockQty > 0 ? "ok" : "missing"}
          />
          <ReviewItem
            icon={<Palette className="w-4 h-4" />}
            label="Fabric Type"
            value={fabricType || "— Not specified —"}
            status={fabricType ? "ok" : "warn"}
          />
          <ReviewItem
            icon={<Ruler className="w-4 h-4" />}
            label="Measurement Guide"
            value={
              guideCount > 0
                ? `${guideCount} size row${guideCount !== 1 ? "s" : ""} defined`
                : "— No size guide —"
            }
            status={guideCount > 0 ? "ok" : "warn"}
          />
          <ReviewItem
            icon={<ImageIcon className="w-4 h-4" />}
            label="Cover Image"
            value={coverPublicId ? "✓ Cover image set" : "— Missing cover image —"}
            status={coverPublicId ? "ok" : "missing"}
          />
          <ReviewItem
            icon={<ImageIcon className="w-4 h-4" />}
            label="Gallery"
            value={
              galleryCount > 0
                ? `${galleryCount} media item${galleryCount !== 1 ? "s" : ""} uploaded`
                : "— No gallery media —"
            }
            status={galleryCount > 0 ? "ok" : "warn"}
          />
          <ReviewItem
            icon={<Truck className="w-4 h-4" />}
            label="Shipping Weight"
            value={weightKg ? `${weightKg} kg` : "— Not specified —"}
            status={weightKg ? "ok" : "warn"}
          />
          <ReviewItem
            icon={<BookOpen className="w-4 h-4" />}
            label="FAQs Selected"
            value={
              selectedFaqs.length > 0
                ? `${selectedFaqs.length} FAQ${selectedFaqs.length !== 1 ? "s" : ""} selected`
                : "— No FAQs selected —"
            }
            status={selectedFaqs.length > 0 ? "ok" : "warn"}
          />
          <ReviewItem
            icon={<SendHorizontal className="w-4 h-4" />}
            label="Publish Action"
            value={
              publishIntent === "pending"
                ? "🚀 Submit for Review"
                : publishIntent === "draft"
                ? "💾 Save as Draft"
                : "— Not selected —"
            }
            status={publishIntent ? "ok" : "missing"}
          />
        </div>

        {/* Final warning if critical fields missing */}
        {(!title || !price || !coverPublicId || !publishIntent) && (
          <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-4 mt-2">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-red-600 font-medium">
              Some required fields are missing. Please go back and complete all
              required fields (marked with{" "}
              <span className="text-[#FDA600] font-bold">*</span>) before
              submitting.
            </p>
          </div>
        )}
      </SectionCard>
    </div>
  );
}
