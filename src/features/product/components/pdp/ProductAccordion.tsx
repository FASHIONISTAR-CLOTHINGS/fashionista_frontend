"use client";

/**
 * @file ProductAccordion.tsx
 * @description Accordion section for the PDP — Description, Fabric & Care,
 *   Shipping & Delivery, Sustainability, Size Chart, Specifications, FAQs.
 *   Extracted from ProductDetailClient to reduce its line count.
 */

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { ProductDetail } from "@/features/product";

function AccordionItem({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border">
      <Button
        variant="ghost"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between py-4 text-left text-sm font-semibold text-foreground hover:text-[hsl(var(--primary))] transition-colors px-0 hover:bg-transparent h-auto"
        aria-expanded={open}
      >
        {title}
        {open ? <ChevronUp size={16} className="shrink-0" /> : <ChevronDown size={16} className="shrink-0" />}
      </Button>
      {open && (
        <div className="pb-4 text-sm leading-7 text-muted-foreground">
          {children}
        </div>
      )}
    </div>
  );
}

interface ProductAccordionProps {
  product: ProductDetail;
}

export function ProductAccordion({ product }: ProductAccordionProps) {
  return (
    <div className="mt-2 rounded-2xl border border-border bg-card p-4">
      {product.description && (
        <AccordionItem title="Description">
          <p className="whitespace-pre-wrap">{product.description}</p>
        </AccordionItem>
      )}

      {product.fabric && (
        <AccordionItem title="Fabric & Care">
          <div className="space-y-4 pt-1">
            <div className="flex flex-wrap gap-2">
              {product.fabric.is_organic && (
                <Badge variant="outline" className="border-emerald-500/30 bg-emerald-50/50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 text-[10px]">
                  Organic
                </Badge>
              )}
              {product.fabric.is_vegan && (
                <Badge variant="outline" className="border-green-500/30 bg-green-50/50 text-green-700 dark:bg-green-950/20 dark:text-green-400 text-[10px]">
                  Vegan
                </Badge>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="font-semibold text-foreground block mb-0.5">Fabric Type</span>
                <span className="text-muted-foreground">{product.fabric.fabric_type}</span>
              </div>
              {product.fabric.country_of_origin && (
                <div>
                  <span className="font-semibold text-foreground block mb-0.5">Origin</span>
                  <span className="text-muted-foreground">{product.fabric.country_of_origin}</span>
                </div>
              )}
            </div>

            <div className="border-t border-border pt-3 space-y-2">
              <div>
                <span className="font-semibold text-foreground text-xs block">Care Instructions</span>
                <span className="text-muted-foreground capitalize text-xs">
                  {product.fabric.care_instructions.replace(/_/g, " ")}
                </span>
              </div>
            </div>
          </div>
        </AccordionItem>
      )}

      {product.shipping_profile && (
        <AccordionItem title="Shipping & Delivery">
          <div className="space-y-4 pt-1">
            <div className="flex flex-wrap gap-2">
              {product.shipping_profile.is_fragile && (
                <Badge variant="outline" className="border-amber-500/30 bg-amber-50/50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400 text-[10px]">
                  Fragile Product
                </Badge>
              )}
              {product.shipping_profile.requires_signature && (
                <Badge variant="outline" className="border-blue-500/30 bg-blue-50/50 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400 text-[10px]">
                  Signature Required
                </Badge>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="font-semibold text-foreground block mb-0.5">Package Weight</span>
                <span className="text-muted-foreground">{product.shipping_profile.weight_kg} kg</span>
              </div>
              <div>
                <span className="font-semibold text-foreground block mb-0.5">Handling Time</span>
                <span className="text-muted-foreground">{product.shipping_profile.processing_days} handling day{product.shipping_profile.processing_days > 1 ? "s" : ""}</span>
              </div>
              <div>
                <span className="font-semibold text-foreground block mb-0.5">Volumetric Dimensions</span>
                <span className="text-muted-foreground">
                  {parseFloat(product.shipping_profile.length_cm)} × {parseFloat(product.shipping_profile.width_cm)} × {parseFloat(product.shipping_profile.height_cm)} cm
                </span>
              </div>
              {product.shipping_profile.free_shipping_threshold && (
                <div>
                  <span className="font-semibold text-foreground block mb-0.5">Free Shipping Override</span>
                  <span className="text-muted-foreground">Orders above {formatCurrency(parseFloat(product.shipping_profile.free_shipping_threshold), product.currency ?? "NGN")}</span>
                </div>
              )}
            </div>
          </div>
        </AccordionItem>
      )}

      {product.sustainability_score !== undefined && product.sustainability_score !== null && (
        <AccordionItem title="Sustainability & Environmental Impact">
          <div className="space-y-4 pt-1">
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-foreground flex items-center gap-1">🌱 Sustainability Score</span>
                <span className="text-emerald-600">{product.sustainability_score}/100</span>
              </div>
              <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                  style={{ width: `${product.sustainability_score}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              {product.carbon_footprint_kg !== undefined && product.carbon_footprint_kg !== null && (
                <div>
                  <span className="font-semibold text-foreground block mb-0.5">Estimated Carbon Footprint</span>
                  <span className="text-muted-foreground">{product.carbon_footprint_kg} kg CO₂e</span>
                </div>
              )}
              {product.ai_trend_score !== undefined && product.ai_trend_score !== null && (
                <div>
                  <span className="font-semibold text-foreground block mb-0.5">Curation Trend Index</span>
                  <span className="text-muted-foreground">{product.ai_trend_score}% Trend Index</span>
                </div>
              )}
            </div>
          </div>
        </AccordionItem>
      )}

      {product.measurement_guide && product.measurement_guide.length > 0 && (
        <AccordionItem title="Size Chart & Measurement Guide">
          <div className="space-y-3 pt-1">
            <p className="text-xs text-muted-foreground">
              Measurements are in centimeters. Compare these values with your body dimensions to find the perfect fit.
            </p>
            {(() => {
              const rows = [...product.measurement_guide].sort((a, b) => a.sort_order - b.sort_order);

              const hasChest = rows.some(r => r.chest_cm && r.chest_cm !== "0" && r.chest_cm.trim() !== "");
              const hasWaist = rows.some(r => r.waist_cm && r.waist_cm !== "0" && r.waist_cm.trim() !== "");
              const hasHip = rows.some(r => r.hip_cm && r.hip_cm !== "0" && r.hip_cm.trim() !== "");
              const hasShoulder = rows.some(r => r.shoulder_cm && r.shoulder_cm !== "0" && r.shoulder_cm.trim() !== "");
              const hasSleeve = rows.some(r => r.sleeve_cm && r.sleeve_cm !== "0" && r.sleeve_cm.trim() !== "");
              const hasLength = rows.some(r => r.length_cm && r.length_cm !== "0" && r.length_cm.trim() !== "");
              const hasInseam = rows.some(r => r.inseam_cm && r.inseam_cm !== "0" && r.inseam_cm.trim() !== "");
              const hasFoot = rows.some(r => r.foot_length_cm && r.foot_length_cm !== "0" && r.foot_length_cm.trim() !== "");

              return (
                <div className="overflow-x-auto rounded-xl border border-border bg-card">
                  <table className="w-full min-w-[500px] border-collapse text-left text-[11px]">
                    <thead>
                      <tr className="border-b border-border bg-muted/50 text-foreground font-semibold">
                        <th className="p-2.5">Size</th>
                        {hasChest && <th className="p-2.5">Chest</th>}
                        {hasWaist && <th className="p-2.5">Waist</th>}
                        {hasHip && <th className="p-2.5">Hips</th>}
                        {hasShoulder && <th className="p-2.5">Shoulder</th>}
                        {hasSleeve && <th className="p-2.5">Sleeve</th>}
                        {hasLength && <th className="p-2.5">Length</th>}
                        {hasInseam && <th className="p-2.5">Inseam</th>}
                        {hasFoot && <th className="p-2.5">Foot</th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border text-muted-foreground">
                      {rows.map((r, i) => (
                        <tr key={i} className="hover:bg-muted/30 transition-colors">
                          <td className="p-2.5 font-semibold text-foreground">{r.size_label}</td>
                          {hasChest && <td className="p-2.5">{r.chest_cm || "—"}</td>}
                          {hasWaist && <td className="p-2.5">{r.waist_cm || "—"}</td>}
                          {hasHip && <td className="p-2.5">{r.hip_cm || "—"}</td>}
                          {hasShoulder && <td className="p-2.5">{r.shoulder_cm || "—"}</td>}
                          {hasSleeve && <td className="p-2.5">{r.sleeve_cm || "—"}</td>}
                          {hasLength && <td className="p-2.5">{r.length_cm || "—"}</td>}
                          {hasInseam && <td className="p-2.5">{r.inseam_cm || "—"}</td>}
                          {hasFoot && <td className="p-2.5">{r.foot_length_cm || "—"}</td>}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            })()}
          </div>
        </AccordionItem>
      )}

      {(product as unknown as { specifications?: unknown[] }).specifications &&
        ((product as unknown as { specifications: { title: string; content: string }[] }).specifications ?? []).length > 0 && (
        <AccordionItem title="Specifications">
          <dl className="space-y-2">
            {((product as unknown as { specifications: { title: string; content: string }[] }).specifications ?? []).map((s: { title: string; content: string }, i: number) => (
              <div key={i} className="flex justify-between">
                <dt className="font-medium text-foreground">{s.title}</dt>
                <dd>{s.content}</dd>
              </div>
            ))}
          </dl>
        </AccordionItem>
      )}

      {product.faqs?.length > 0 && (
        <AccordionItem title="FAQs">
          <div className="space-y-4">
            {product.faqs.map((f, i) => (
              <div key={i}>
                <p className="font-semibold text-foreground">{f.question}</p>
                <p className="mt-1">{f.answer}</p>
              </div>
            ))}
          </div>
        </AccordionItem>
      )}
    </div>
  );
}
