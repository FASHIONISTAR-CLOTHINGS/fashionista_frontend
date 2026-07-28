/**
 * @file brand-colors.ts
 * @description Shared FASHIONISTAR brand color constants.
 *
 * Brand Identity:
 *   - Forest Green (primary):   #01454A
 *   - Golden Yellow (accent):   #FDA600
 *   - Warm Cream (surface):     #F4F3EC
 *   - Cream Border (divider):   #ECE6D6
 *   - Pure Milk White:          #FFFFFF
 *   - Onyx (text):              #141414
 *   - Charcoal (muted text):    #565960
 *   - Muted Gold:               #7A6B44
 *
 * Sidebar gradient (matches vendor dashboard):
 *   from #01272C via #01454A to #012028
 */

export const BRAND = {
  // Primary palette
  green:        "#01454A",
  greenDark:    "#01272C",
  greenEnd:     "#012028",
  greenHover:   "#016B73",
  greenMid:     "#01454A",

  // Accent
  gold:         "#FDA600",
  goldDark:     "#E8960A",
  goldHover:    "#F28705",
  mutedGold:    "#7A6B44",

  // Surfaces
  cream:        "#F4F3EC",
  creamDark:    "#ECE6D6",
  creamBorder:  "#ECE6D6",
  milk:         "#FFFFFF",
  warmCream:    "#F8F5ED",

  // Text
  onyx:         "#141414",
  charcoal:     "#565960",
  muted:        "#8A8E95",

  // Sidebar gradient classes (Tailwind)
  sidebarGradient: "from-[#01272C] via-[#01454A] to-[#012028]",
} as const;

// Hex values for canvas / inline-style usage
export const BRAND_HEX = {
  green:        "#01454A",
  greenDark:    "#01272C",
  greenEnd:     "#012028",
  gold:         "#FDA600",
  goldDark:     "#E8960A",
  cream:        "#F4F3EC",
  creamBorder:  "#ECE6D6",
  milk:         "#FFFFFF",
  onyx:         "#141414",
  charcoal:     "#565960",
  mutedGold:    "#7A6B44",
} as const;

// Phase color mapping for measurement progress (brand-aligned)
export const PHASE_COLORS = {
  loading:      BRAND_HEX.green,
  initialising: BRAND_HEX.green,
  detecting:    BRAND_HEX.gold,
  submitting:   BRAND_HEX.gold,
  processing:   BRAND_HEX.gold,
  saving:       BRAND_HEX.gold,
  completed:    BRAND_HEX.gold,
  failed:       "#ef4444",
} as const;

export const PHASE_GRADIENTS = {
  completed:    `linear-gradient(90deg, ${BRAND_HEX.green}, ${BRAND_HEX.gold})`,
  failed:       "#ef4444",
  loading:      `linear-gradient(90deg, ${BRAND_HEX.greenDark}, ${BRAND_HEX.green})`,
  initialising: `linear-gradient(90deg, ${BRAND_HEX.greenDark}, ${BRAND_HEX.green})`,
  detecting:    `linear-gradient(90deg, ${BRAND_HEX.goldDark}, ${BRAND_HEX.gold})`,
  submitting:   `linear-gradient(90deg, ${BRAND_HEX.goldDark}, ${BRAND_HEX.gold})`,
  processing:   `linear-gradient(90deg, ${BRAND_HEX.goldDark}, ${BRAND_HEX.gold})`,
  saving:       `linear-gradient(90deg, ${BRAND_HEX.green}, ${BRAND_HEX.gold})`,
} as const;
