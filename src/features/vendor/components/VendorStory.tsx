"use client";

/**
 * @file VendorStory.tsx
 * @description Editorial story section for a vendor's brand narrative.
 *
 * Psychological triggers:
 *   - Narrative Transportation: Brand origin story
 *   - Authority: Years of experience, craftsmanship
 *   - Trust: Transparency about the vendor's journey
 */

import { BookOpen, Award, Heart } from "lucide-react";

interface VendorStoryProps {
  displayName: string;
  tagline?: string;
  description?: string;
  city?: string;
  state?: string;
  isVerified?: boolean;
  totalProducts?: number;
  totalSales?: number;
}

export function VendorStory({
  displayName,
  tagline,
  description,
  city,
  state,
  isVerified = false,
  totalProducts = 0,
  totalSales = 0,
}: VendorStoryProps) {
  const location = [city, state].filter(Boolean).join(", ");

  return (
    <section
      className="rounded-[2rem] border border-[#ECE6D6] bg-gradient-to-br from-[#F8F5ED] to-white p-8 shadow-sm space-y-5"
      data-testid="vendor-story-section"
    >
      <div className="flex items-center gap-2">
        <BookOpen size={18} className="text-[#01454A]" />
        <span className="text-xs font-black uppercase tracking-widest text-[#01454A]">
          Our Story
        </span>
      </div>

      <h3 className="font-bon_foyage text-3xl text-[#01454A] leading-tight">
        {tagline || `The ${displayName} Journey`}
      </h3>

      <p className="text-base leading-8 text-[hsl(var(--muted-foreground))]">
        {description ||
          `${displayName} is a fashion boutique committed to quality, craftsmanship, and cultural expression through every garment they create.`}
      </p>

      <div className="grid grid-cols-1 gap-4 pt-4 sm:grid-cols-3">
        <div className="flex items-center gap-3 rounded-2xl bg-white p-4 border border-[#ECE6D6]">
          <Award size={20} className="text-[#FDA600] shrink-0" />
          <div>
            <p className="text-sm font-bold text-[#01454A]">
              {isVerified ? "Verified Studio" : "Emerging Brand"}
            </p>
            <p className="text-xs text-[#7A6B44]">
              {isVerified ? "Fashionistar verified" : "Growing on Fashionistar"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-2xl bg-white p-4 border border-[#ECE6D6]">
          <Heart size={20} className="text-rose-500 shrink-0" />
          <div>
            <p className="text-sm font-bold text-[#01454A]">
              {totalSales > 0 ? `${totalSales}+ Happy Customers` : "Crafting With Passion"}
            </p>
            <p className="text-xs text-[#7A6B44]">
              {totalProducts > 0 ? `${totalProducts} products crafted` : "Bespoke creations"}
            </p>
          </div>
        </div>

        {location && (
          <div className="flex items-center gap-3 rounded-2xl bg-white p-4 border border-[#ECE6D6]">
            <BookOpen size={20} className="text-[#01454A] shrink-0" />
            <div>
              <p className="text-sm font-bold text-[#01454A]">{location}</p>
              <p className="text-xs text-[#7A6B44]">Based in Nigeria</p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
