"use client";

/**
 * @file Step5FAQAndReview.tsx
 * @description Step 5 — FAQs (Static 10 fashion FAQs, pick up to 5) & Publish Settings
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
import { Button } from "@/components/ui/button";
import { BookOpen, SendHorizontal, Settings, X, Check } from "lucide-react";

// ── Static 10 expertly-crafted fashion FAQs ─────────────────────────────────
const FASHION_FAQS = [
  {
    id: "faq_01",
    question: "What sizes are available for this item?",
    answer:
      "This product is available in sizes XS through XXL. Please refer to the size guide on the product page for exact measurements to find your perfect fit.",
  },
  {
    id: "faq_02",
    question: "How do I care for and wash this garment?",
    answer:
      "Care instructions vary by fabric. Please check the label stitched inside the garment. As a general rule, we recommend gentle hand-washing or a delicate machine cycle in cold water, then air-drying flat to maintain shape and colour vibrancy.",
  },
  {
    id: "faq_03",
    question: "Can I request a custom colour or tailored fit?",
    answer:
      "Yes! We offer bespoke colour and tailoring options on select items. Please contact our support team or use the 'Custom Request' option at checkout to discuss your requirements before placing an order.",
  },
  {
    id: "faq_04",
    question: "What is your return and exchange policy?",
    answer:
      "We accept returns and exchanges within 14 days of delivery, provided the item is unworn, unwashed, and in its original packaging with all tags attached. Custom or sale items are final sale and non-refundable.",
  },
  {
    id: "faq_05",
    question: "How long does order processing and delivery take?",
    answer:
      "Standard orders are processed within 1–3 business days. Delivery timelines depend on your location — typically 3–7 business days for domestic orders and 10–21 business days for international shipments.",
  },
  {
    id: "faq_06",
    question: "Is this item made from sustainable or ethically sourced fabrics?",
    answer:
      "We are committed to ethical fashion. Many of our collections use GOTS-certified organic cotton, recycled fibres, or traceable supply-chain materials. Each product listing specifies the fabric composition and sourcing details.",
  },
  {
    id: "faq_07",
    question: "What payment methods do you accept?",
    answer:
      "We accept Visa, Mastercard, bank transfers, and select mobile payment wallets. We also offer Buy Now Pay Later (BNPL) options at checkout for eligible orders above ₦10,000.",
  },
  {
    id: "faq_08",
    question: "Do you offer gift wrapping or personalised packaging?",
    answer:
      "Yes! Gift wrapping and a personalised message card can be added at checkout for a small fee. We take pride in our luxury unboxing experience — every order ships in our signature branded tissue paper.",
  },
  {
    id: "faq_09",
    question: "How can I track my order after it has shipped?",
    answer:
      "Once your order ships, you will receive a tracking number via email and SMS. You can also view real-time shipment status from your account dashboard under 'My Orders'.",
  },
  {
    id: "faq_10",
    question: "Are the colours in the photos accurate to the actual product?",
    answer:
      "We use professional studio lighting and colour-calibrated photography to ensure the most accurate representation possible. However, colours may appear slightly different depending on your device screen calibration. We always recommend checking the exact fabric swatch description in the product details.",
  },
];

export function Step5FAQAndReview() {
  const form = useFormContext<ProductBuilderFormValues>();
  const selectedFaqIds: string[] = (form.watch("faqs") as string[]) ?? [];

  const toggleFaq = (id: string) => {
    const current: string[] = form.getValues("faqs") as string[];
    if (current.includes(id)) {
      form.setValue("faqs", current.filter((f) => f !== id), { shouldValidate: true });
    } else if (current.length < 5) {
      form.setValue("faqs", [...current, id], { shouldValidate: true });
    }
  };

  const removeFaq = (id: string) => {
    const current: string[] = form.getValues("faqs") as string[];
    form.setValue("faqs", current.filter((f) => f !== id), { shouldValidate: true });
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* ── SECTION A — FASHION FAQs ─────────────────────────────────────── */}
      <div className="rounded-2xl border border-[#ECE6D6] bg-[#FAFAF8] p-6 space-y-5">
        <div className="flex items-start justify-between border-b border-[#ECE6D6] pb-4">
          <div>
            <h3 className="text-lg font-bold text-[#1A1208] flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#01454A]" />
              Frequently Asked Questions
            </h3>
            <p className="text-xs text-[#7A6B44] mt-1">
              Select up to <strong>5</strong> FAQs from our curated fashion library to display on your product page.{" "}
              <span className="text-[#01454A] font-semibold">{selectedFaqIds.length}/5 selected</span>
            </p>
          </div>
          {selectedFaqIds.length >= 5 && (
            <Badge className="bg-[#01454A] text-white text-xs px-3 py-1">Max Reached</Badge>
          )}
        </div>

        {/* Selected chips */}
        {selectedFaqIds.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {selectedFaqIds.map((faqId) => {
              const faq = FASHION_FAQS.find((f) => f.id === faqId);
              return (
                <Badge
                  key={faqId}
                  variant="secondary"
                  className="bg-[#E8F3F1] text-[#01454A] border border-[#01454A]/20 pl-3 pr-1.5 py-1 text-xs gap-1.5 max-w-[280px]"
                >
                  <span className="truncate">{faq?.question}</span>
                  <button
                    type="button"
                    onClick={() => removeFaq(faqId)}
                    className="ml-1 text-[#01454A] hover:text-red-600 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              );
            })}
          </div>
        )}

        {/* FAQ List */}
        <div className="space-y-3">
          {FASHION_FAQS.map((faq) => {
            const isSelected = selectedFaqIds.includes(faq.id);
            const isDisabled = !isSelected && selectedFaqIds.length >= 5;
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
                    ? "border-[#D9D9D9] bg-zinc-50 opacity-50 cursor-not-allowed"
                    : "border-[#D9D9D9] bg-white hover:border-[#01454A]/40 hover:bg-[#F5FAF9]"
                }`}
              >
                <span
                  className={`flex-shrink-0 mt-0.5 flex h-5 w-5 items-center justify-center rounded-full border-2 transition-all ${
                    isSelected
                      ? "border-[#01454A] bg-[#01454A]"
                      : "border-[#D9D9D9]"
                  }`}
                >
                  {isSelected && <Check className="h-3 w-3 text-white" />}
                </span>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold leading-snug ${isSelected ? "text-[#01454A]" : "text-[#1A1208]"}`}>
                    {faq.question}
                  </p>
                  <p className="text-xs text-[#7A6B44] mt-1 leading-relaxed line-clamp-2">
                    {faq.answer}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── SECTION B — SEO META ─────────────────────────────────────────── */}
      <div className="rounded-2xl border border-[#ECE6D6] bg-[#FAFAF8] p-6 space-y-5">
        <div className="border-b border-[#ECE6D6] pb-3">
          <h3 className="text-lg font-bold text-[#1A1208] flex items-center gap-2">
            <Settings className="w-5 h-5 text-[#01454A]" />
            SEO & Discovery
          </h3>
          <p className="text-xs text-[#7A6B44] mt-1">
            Custom title and description override for search engines. Falls back to product title when blank.
          </p>
        </div>

        <div className="space-y-4">
          <FormField
            control={form.control}
            name="meta_title"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[#1A1208] font-semibold text-sm">Meta Title</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    value={field.value ?? ""}
                    placeholder="Custom SEO title (max 160 chars)"
                    className="bg-white border-[#D9D9D9] rounded-xl"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="meta_description"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[#1A1208] font-semibold text-sm">Meta Description</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    value={field.value ?? ""}
                    placeholder="Custom SEO description (max 320 chars)"
                    className="bg-white border-[#D9D9D9] rounded-xl h-20 resize-none"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      {/* ── SECTION C — PUBLISH SETTINGS ─────────────────────────────────── */}
      <div className="rounded-2xl border border-[#ECE6D6] bg-[#FAFAF8] p-6 space-y-5">
        <div className="border-b border-[#ECE6D6] pb-3">
          <h3 className="text-lg font-bold text-[#1A1208] flex items-center gap-2">
            <SendHorizontal className="w-5 h-5 text-[#01454A]" />
            Publish Settings
          </h3>
          <p className="text-xs text-[#7A6B44] mt-1">
            Choose how this product is saved and promoted across the platform.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="publish_intent"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[#1A1208] font-semibold text-sm">Publish Action *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="bg-white border-[#D9D9D9] text-[#1A1208] rounded-xl px-4 py-3">
                      <SelectValue placeholder="Select publish action" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-white border-[#D9D9D9] text-[#1A1208] shadow-lg rounded-xl">
                    <SelectItem value="draft">💾 Save as Draft (Private)</SelectItem>
                    <SelectItem value="pending">🚀 Submit for Review (Publish)</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription className="text-xs text-[#7A6B44]">
                  "Submit for Review" puts your product in the admin queue for approval before going live.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

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
                    <p className="text-[10px] text-[#7A6B44]">Admin approval required</p>
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
                    <p className="text-[10px] text-[#7A6B44]">Shows Hot Deal badge on listing</p>
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
      </div>

    </div>
  );
}
