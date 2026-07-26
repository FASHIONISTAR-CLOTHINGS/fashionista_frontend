"use client";

/**
 * @file VariantSelector.tsx
 * @description Color & size variant selector component for PDP (Phase 5.1).
 *   - Color swatches with visual feedback (hex code background + active state border)
 *   - Automatic gallery image sync on color selection
 *   - Accessible button states
 */

import { Button } from "@/components/ui/button";

export interface GalleryVariantItem {
  color_name?: string;
  color_hex?: string;
  media_url?: string | null;
}

interface VariantSelectorProps {
  galleryItems: GalleryVariantItem[];
  selectedVariantId: string | null;
  onSelectVariant: (id: string, colorName: string) => void;
}

export function VariantSelector({
  galleryItems,
  selectedVariantId,
  onSelectVariant,
}: VariantSelectorProps) {
  const colorItems = galleryItems.filter(
    (v): v is GalleryVariantItem & { color_name: string } => !!v.color_name
  );

  if (colorItems.length === 0) return null;

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Select Colour
      </p>
      <div className="flex flex-wrap gap-2">
        {colorItems.map((v, i) => {
          const cn_ = v.color_name;
          const hex = v.color_hex ?? "";
          const isSelected = selectedVariantId === String(i);

          return (
            <Button
              key={i}
              type="button"
              variant={isSelected ? "default" : "outline"}
              onClick={() => onSelectVariant(String(i), cn_)}
              className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold transition h-auto min-h-0"
              title={cn_}
            >
              {hex && (
                <span
                  className="inline-block h-4 w-4 rounded-full border border-black/10 flex-shrink-0"
                  style={{ background: hex }}
                />
              )}
              {cn_}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
