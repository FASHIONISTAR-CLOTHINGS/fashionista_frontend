"use client";

/**
 * @file Step8Publish.tsx
 * @description Step 8 — Publish Settings
 *
 * Final step. Vendor configures:
 *  - Publish intent: draft (save silently) or pending (submit for admin review)
 *  - Feature / hot-deal / digital flags
 *  - SEO meta title + description overrides
 *
 * Shows a comprehensive pre-submit summary panel on the right (desktop)
 * or above the form (mobile) so the vendor can review before confirming.
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
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  SendHorizontal,
  FileText,
  Star,
  Zap,
  Download,
  Search,
} from "lucide-react";
import { useBuilderContext } from "./ProductBuilderProvider";

// ─────────────────────────────────────────────────────────────────────────────
// SUMMARY PANEL
// ─────────────────────────────────────────────────────────────────────────────

function SummaryPanel() {
  const form = useFormContext<ProductBuilderFormValues>();
  const { productId } = useBuilderContext();

  const values = form.getValues();

  return (
    <div className="rounded-2xl border border-white/10 bg-white/3 p-5 space-y-4 text-sm">
      <h4 className="text-white/80 font-semibold text-base">Pre-publish Summary</h4>

      <div className="space-y-2">
        <Row label="Title" value={values.title || "—"} />
        <Row
          label="Price"
          value={values.price ? `${values.currency} ${parseFloat(values.price).toLocaleString()}` : "—"}
        />
        <Row label="Stock" value={String(values.stock_qty ?? 0)} />
        <Row label="Gallery" value={`${values.gallery?.length ?? 0} items`} />
        <Row label="Variants" value={`${values.variants?.length ?? 0} SKUs`} />
        <Row label="Specs" value={`${values.specifications?.length ?? 0} rows`} />
        <Row label="FAQs" value={`${values.faqs?.length ?? 0} pairs`} />

        {productId && (
          <Row label="Draft ID" value={productId.slice(0, 8) + "…"} mono />
        )}
      </div>

      <div className="border-t border-white/10 pt-3 flex flex-wrap gap-2">
        {values.featured && <Flag icon="⭐" label="Featured" color="amber" />}
        {values.hot_deal && <Flag icon="⚡" label="Hot Deal" color="red" />}
        {values.digital && <Flag icon="📥" label="Digital" color="blue" />}
        {values.requires_measurement && <Flag icon="📏" label="Measured" color="green" />}
        {values.is_customisable && <Flag icon="✏️" label="Customisable" color="purple" />}
      </div>
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-white/40">{label}</span>
      <span className={cn("text-white/80 text-right truncate max-w-[60%]", mono && "font-mono text-xs")}>{value}</span>
    </div>
  );
}

function Flag({ icon, label, color }: { icon: string; label: string; color: string }) {
  const colorMap: Record<string, string> = {
    amber: "bg-amber-500/15 text-amber-300 border-amber-500/25",
    red: "bg-red-500/15 text-red-300 border-red-500/25",
    blue: "bg-blue-500/15 text-blue-300 border-blue-500/25",
    green: "bg-emerald-500/15 text-emerald-300 border-emerald-500/25",
    purple: "bg-violet-500/15 text-violet-300 border-violet-500/25",
  };
  return (
    <Badge className={cn("text-xs gap-1 border", colorMap[color])}>
      {icon} {label}
    </Badge>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export function Step8Publish() {
  const form = useFormContext<ProductBuilderFormValues>();

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
      {/* ── Main form (2/3 on desktop) ── */}
      <div className="xl:col-span-2 space-y-8">

        {/* ── Publish Intent ── */}
        <FormField
          control={form.control}
          name="publish_intent"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white/90 font-semibold text-base">
                Publish Setting <span className="text-fuchsia-400">*</span>
              </FormLabel>
              <FormDescription className="text-white/40 text-xs mb-4">
                Choose how this product should be saved
              </FormDescription>

              <RadioGroup
                onValueChange={field.onChange}
                value={field.value}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                {/* Draft option */}
                <Label
                  htmlFor="intent-draft"
                  className={cn(
                    "flex flex-col gap-2 rounded-xl border-2 p-5 cursor-pointer transition-all",
                    field.value === "draft"
                      ? "border-violet-500 bg-violet-500/10"
                      : "border-white/10 bg-white/3 hover:border-white/20",
                  )}
                >
                  <RadioGroupItem value="draft" id="intent-draft" className="hidden" />
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-violet-400" />
                    <span className="font-semibold text-white">Save as Draft</span>
                    {field.value === "draft" && (
                      <Badge className="ml-auto bg-violet-500 text-white text-xs">Selected</Badge>
                    )}
                  </div>
                  <p className="text-white/50 text-xs leading-relaxed">
                    Product is saved privately. Not visible to customers. You can come back and complete it later.
                  </p>
                </Label>

                {/* Submit for review option */}
                <Label
                  htmlFor="intent-pending"
                  className={cn(
                    "flex flex-col gap-2 rounded-xl border-2 p-5 cursor-pointer transition-all",
                    field.value === "pending"
                      ? "border-fuchsia-500 bg-fuchsia-500/10"
                      : "border-white/10 bg-white/3 hover:border-white/20",
                  )}
                >
                  <RadioGroupItem value="pending" id="intent-pending" className="hidden" />
                  <div className="flex items-center gap-2">
                    <SendHorizontal className="w-5 h-5 text-fuchsia-400" />
                    <span className="font-semibold text-white">Submit for Review</span>
                    {field.value === "pending" && (
                      <Badge className="ml-auto bg-fuchsia-500 text-white text-xs">Selected</Badge>
                    )}
                  </div>
                  <p className="text-white/50 text-xs leading-relaxed">
                    Product enters admin moderation queue. Typically approved within 24 hours. A cover image is required.
                  </p>
                </Label>
              </RadioGroup>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* ── Visibility Flags ── */}
        <div className="space-y-3">
          <h4 className="text-white/80 font-semibold">Visibility Flags</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {([
              { name: "featured" as const, label: "Featured", desc: "Shown in homepage hero carousel", icon: Star },
              { name: "hot_deal" as const, label: "Hot Deal", desc: "Flash-sale / limited-time badge", icon: Zap },
              { name: "digital" as const, label: "Digital Product", desc: "Downloadable — no shipping", icon: Download },
            ] as const).map(({ name, label, desc, icon: Icon }) => (
              <FormField
                key={name}
                control={form.control}
                name={name}
                render={({ field }) => (
                  <FormItem className="flex flex-col gap-3 rounded-xl bg-white/5 border border-white/10 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4 text-violet-400" />
                        <FormLabel className="text-white/80 font-medium cursor-pointer text-sm">
                          {label}
                        </FormLabel>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="data-[state=checked]:bg-violet-500"
                        />
                      </FormControl>
                    </div>
                    <FormDescription className="text-white/40 text-xs">{desc}</FormDescription>
                  </FormItem>
                )}
              />
            ))}
          </div>
        </div>

        {/* ── SEO Overrides ── */}
        <div className="space-y-5">
          <h4 className="text-white/80 font-semibold flex items-center gap-2">
            <Search className="w-4 h-4 text-violet-400" />
            SEO Overrides <span className="text-white/30 font-normal text-xs">(optional)</span>
          </h4>

          <FormField
            control={form.control}
            name="meta_title"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white/70 text-sm">Meta Title</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Defaults to product title if blank"
                    maxLength={160}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-violet-500"
                  />
                </FormControl>
                <FormDescription className="text-white/40 text-xs">
                  {field.value?.length ?? 0} / 160 characters. Recommended: 50–60 characters.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="meta_description"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white/70 text-sm">Meta Description</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    rows={3}
                    placeholder="Defaults to product short description if blank"
                    maxLength={320}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-violet-500 resize-none"
                  />
                </FormControl>
                <FormDescription className="text-white/40 text-xs">
                  {field.value?.length ?? 0} / 320 characters. Recommended: 120–160 characters.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      {/* ── Summary panel (1/3 on desktop) ── */}
      <div className="xl:col-span-1">
        <SummaryPanel />
      </div>
    </div>
  );
}
