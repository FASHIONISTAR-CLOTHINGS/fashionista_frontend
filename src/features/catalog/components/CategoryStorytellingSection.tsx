"use client";

/**
 * @file CategoryStorytellingSection.tsx
 * @description AI-powered storytelling section for category pages.
 *
 * Psychological triggers:
 *   - Storytelling: Creates emotional connection with category
 *   - Authority: AI-curated style guide positions platform as expert
 *   - Reciprocity: Free style advice adds value beyond products
 */

import { Sparkles, Lightbulb, TrendingUp } from "lucide-react";

interface CategoryStorytellingSectionProps {
  categoryName: string;
  productCount: number | null;
}

const STORY_TEMPLATES: Record<string, { tagline: string; story: string; tips: string[] }> = {
  default: {
    tagline: "Crafted for the modern African",
    story: "Each piece in this collection is curated by our AI style engine, analyzing trends, fabric quality, and artisan craftsmanship to bring you only the finest selections.",
    tips: ["Pair with statement accessories for a bold look", "Consider custom measurements for the perfect fit", "Mix traditional patterns with contemporary silhouettes"],
  },
};

export function CategoryStorytellingSection({ categoryName, productCount }: CategoryStorytellingSectionProps) {
  const template = STORY_TEMPLATES[categoryName.toLowerCase()] ?? STORY_TEMPLATES.default;

  return (
    <section
      className="bg-gradient-to-br from-[#01454A]/5 to-[#FDA600]/5 px-5 py-10 md:px-10 lg:px-20"
      data-testid="category-storytelling"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm">
            <Sparkles size={18} className="text-[#01454A]" />
          </div>
          <div>
            <h2 className="font-bon_foyage text-2xl text-foreground md:text-3xl">
              {template.tagline}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">AI-curated for {categoryName}</p>
          </div>
        </div>

        {/* Story */}
        <p className="text-sm leading-7 text-foreground/80 font-raleway">
          {template.story}
        </p>

        {/* Stats */}
        {productCount !== null && productCount > 0 && (
          <div className="flex items-center gap-2 text-xs text-[#01454A]">
            <TrendingUp size={14} />
            <span className="font-semibold">
              {productCount.toLocaleString()} curated pieces · Updated daily by AI
            </span>
          </div>
        )}

        {/* Style tips */}
        <div className="grid gap-3 sm:grid-cols-3">
          {template.tips.map((tip, i) => (
            <div
              key={i}
              className="flex items-start gap-2 rounded-xl border border-[#01454A]/10 bg-white/60 px-3 py-2.5"
            >
              <Lightbulb size={14} className="text-[#FDA600] shrink-0 mt-0.5" />
              <p className="text-xs text-foreground/70 leading-snug">{tip}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
