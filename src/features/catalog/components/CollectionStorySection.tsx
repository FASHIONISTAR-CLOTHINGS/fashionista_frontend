"use client";

/**
 * @file CollectionStorySection.tsx
 * @description Editorial storytelling section for collections.
 *
 * Psychological triggers:
 *   - Narrative Transportation: Immersive editorial content
 *   - Authority: "Curated by Fashionistar's style editors"
 *   - Exclusivity: Behind-the-scenes narrative
 */

import { BookOpen } from "lucide-react";

interface CollectionStorySectionProps {
  collectionTitle: string;
  description?: string | null;
  bannerImage?: string | null;
}

export function CollectionStorySection({
  collectionTitle,
  description,
  bannerImage,
}: CollectionStorySectionProps) {
  if (!description) return null;

  return (
    <section
      className="border-b border-border/50 bg-[#F8F9FC]"
      data-testid="collection-story-section"
    >
      <div className="px-5 py-12 md:px-10 lg:px-20">
        <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <BookOpen size={18} className="text-[#01454A]" />
              <span className="text-xs font-bold uppercase tracking-wider text-[#01454A]">
                The Story Behind {collectionTitle}
              </span>
            </div>
            <h2 className="font-bon_foyage text-2xl text-foreground md:text-3xl">
              Curated by Fashionistar&apos;s Style Editors
            </h2>
            <p className="font-raleway text-base leading-7 text-muted-foreground">
              {description}
            </p>
            <p className="font-raleway text-sm leading-6 text-muted-foreground/80">
              Each piece in this collection has been hand-selected for quality, craftsmanship,
              and cultural significance. We partner with verified vendors who share our
              commitment to excellence in Nigerian fashion.
            </p>
          </div>

          {bannerImage && (
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl shadow-lg">
              <img
                src={bannerImage}
                alt={`${collectionTitle} editorial`}
                className="h-full w-full object-cover"
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
