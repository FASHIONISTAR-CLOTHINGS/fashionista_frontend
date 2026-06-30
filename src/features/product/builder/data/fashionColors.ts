/**
 * @file fashionColors.ts
 * @description 150+ curated fashion colors for the 2026+ FASHIONISTAR platform.
 *
 * Covers all major fashion textile color families:
 *   - Classic Neutrals, Whites & Off-Whites
 *   - Blacks & Charcoals
 *   - Browns, Tans & Earthy Tones
 *   - Reds & Crimsons
 *   - Pinks & Roses
 *   - Oranges & Corals
 *   - Yellows & Golds
 *   - Greens (Sage, Emerald, Olive, Khaki)
 *   - Blues (Navy, Royal, Sky, Teal)
 *   - Purples & Lavenders
 *   - Metallics (Gold, Silver, Bronze, Rose Gold)
 *   - 2026 Pantone Trend Colors
 *   - African Fashion Heritage Colors (Aso-oke, Ankara, Kente)
 *
 * Each entry has:
 *   - name: human-readable color name (sent to backend as color_name)
 *   - hex: 7-character hex code e.g. "#1A1A4E" (sent as color_hex)
 *   - family: color family grouping (for future filtering UI)
 */

export interface FashionColor {
  name: string;
  hex: string;
  family: string;
}

export const FASHION_COLORS: FashionColor[] = [
  // ──────────────────────────────────────────────────────────────────────────
  // WHITES & OFF-WHITES
  // ──────────────────────────────────────────────────────────────────────────
  { name: "Pure White",       hex: "#FFFFFF", family: "White" },
  { name: "Off White",        hex: "#FAF9F6", family: "White" },
  { name: "Cloud Dancer",     hex: "#F0EEE9", family: "White" }, // Pantone 2026 COTY
  { name: "Ivory",            hex: "#FFFFF0", family: "White" },
  { name: "Cream",            hex: "#FFFDD0", family: "White" },
  { name: "Pearl",            hex: "#F5F0E8", family: "White" },
  { name: "Snow White",       hex: "#FFFAFA", family: "White" },
  { name: "Linen",            hex: "#FAF0E6", family: "White" },
  { name: "Eggshell",         hex: "#F0EAD6", family: "White" },
  { name: "Antique White",    hex: "#FAEBD7", family: "White" },

  // ──────────────────────────────────────────────────────────────────────────
  // BLACKS & CHARCOALS
  // ──────────────────────────────────────────────────────────────────────────
  { name: "Jet Black",        hex: "#0A0A0A", family: "Black" },
  { name: "Soft Black",       hex: "#1A1A1A", family: "Black" },
  { name: "Onyx",             hex: "#353935", family: "Black" },
  { name: "Charcoal",         hex: "#36454F", family: "Black" },
  { name: "Dark Charcoal",    hex: "#2C2C2C", family: "Black" },
  { name: "Graphite",         hex: "#474747", family: "Black" },
  { name: "Slate Grey",       hex: "#708090", family: "Black" },
  { name: "Ash Grey",         hex: "#B2BEB5", family: "Black" },
  { name: "Smoke",            hex: "#738276", family: "Black" },

  // ──────────────────────────────────────────────────────────────────────────
  // GREYS
  // ──────────────────────────────────────────────────────────────────────────
  { name: "Dove Grey",        hex: "#6D6D6D", family: "Grey" },
  { name: "Medium Grey",      hex: "#9E9E9E", family: "Grey" },
  { name: "Silver",           hex: "#C0C0C0", family: "Grey" },
  { name: "Light Grey",       hex: "#D3D3D3", family: "Grey" },
  { name: "Pale Grey",        hex: "#ECECEC", family: "Grey" },
  { name: "Heather Grey",     hex: "#BDB9BF", family: "Grey" },
  { name: "Storm Grey",       hex: "#5A5A6A", family: "Grey" },

  // ──────────────────────────────────────────────────────────────────────────
  // BROWNS & EARTHY TONES
  // ──────────────────────────────────────────────────────────────────────────
  { name: "Chocolate Brown",  hex: "#3D1C02", family: "Brown" },
  { name: "Dark Brown",       hex: "#5C3317", family: "Brown" },
  { name: "Mocha",            hex: "#967259", family: "Brown" },
  { name: "Walnut",           hex: "#773F1A", family: "Brown" },
  { name: "Caramel",          hex: "#C68642", family: "Brown" },
  { name: "Tan",              hex: "#D2B48C", family: "Brown" },
  { name: "Beige",            hex: "#F5F5DC", family: "Brown" },
  { name: "Sand",             hex: "#C2B280", family: "Brown" },
  { name: "Taupe",            hex: "#483C32", family: "Brown" },
  { name: "Tawny",            hex: "#CD5700", family: "Brown" },
  { name: "Sienna",           hex: "#882D17", family: "Brown" },
  { name: "Saddle Brown",     hex: "#8B4513", family: "Brown" },
  { name: "Umber",            hex: "#635147", family: "Brown" },
  { name: "Khaki",            hex: "#C3B091", family: "Brown" },
  { name: "Nude",             hex: "#E8C4A0", family: "Brown" },
  { name: "Champagne",        hex: "#F7E7CE", family: "Brown" },

  // ──────────────────────────────────────────────────────────────────────────
  // REDS & CRIMSONS
  // ──────────────────────────────────────────────────────────────────────────
  { name: "Crimson Red",      hex: "#DC143C", family: "Red" },
  { name: "Scarlet",          hex: "#FF2400", family: "Red" },
  { name: "Cherry Red",       hex: "#990000", family: "Red" },
  { name: "Wine Red",         hex: "#722F37", family: "Red" },
  { name: "Burgundy",         hex: "#800020", family: "Red" },
  { name: "Maroon",           hex: "#800000", family: "Red" },
  { name: "Rust",             hex: "#B7410E", family: "Red" },
  { name: "Tomato Red",       hex: "#FF6347", family: "Red" },
  { name: "Cardinal Red",     hex: "#C41E3A", family: "Red" },
  { name: "Lava Falls",       hex: "#CF1020", family: "Red" }, // Pantone 2026 Trend

  // ──────────────────────────────────────────────────────────────────────────
  // PINKS & ROSES
  // ──────────────────────────────────────────────────────────────────────────
  { name: "Hot Pink",         hex: "#FF69B4", family: "Pink" },
  { name: "Fuchsia",          hex: "#FF00FF", family: "Pink" },
  { name: "Blush Pink",       hex: "#FFB7C5", family: "Pink" },
  { name: "Dusty Rose",       hex: "#DCAE96", family: "Pink" },
  { name: "Baby Pink",        hex: "#F4C2C2", family: "Pink" },
  { name: "Salmon Pink",      hex: "#FF91A4", family: "Pink" },
  { name: "Coral Pink",       hex: "#F88379", family: "Pink" },
  { name: "Rose Gold",        hex: "#B76E79", family: "Pink" },
  { name: "Mauve",            hex: "#E0B0FF", family: "Pink" },
  { name: "Tickled Pink",     hex: "#FC89AC", family: "Pink" }, // Pantone 2026 Trend
  { name: "Millennial Pink",  hex: "#FFB6C1", family: "Pink" },
  { name: "Watermelon",       hex: "#FC6C85", family: "Pink" },

  // ──────────────────────────────────────────────────────────────────────────
  // ORANGES & CORALS
  // ──────────────────────────────────────────────────────────────────────────
  { name: "Burnt Orange",     hex: "#CC5500", family: "Orange" },
  { name: "Terracotta",       hex: "#E2725B", family: "Orange" },
  { name: "Coral",            hex: "#FF7F50", family: "Orange" },
  { name: "Tangerine",        hex: "#F28500", family: "Orange" },
  { name: "Amber",            hex: "#FFBF00", family: "Orange" },
  { name: "Mango",            hex: "#FDA600", family: "Orange" },
  { name: "Peach",            hex: "#FFCBA4", family: "Orange" },
  { name: "Apricot",          hex: "#FBCEB1", family: "Orange" },
  { name: "Papaya",           hex: "#FF9F71", family: "Orange" },

  // ──────────────────────────────────────────────────────────────────────────
  // YELLOWS & GOLDS
  // ──────────────────────────────────────────────────────────────────────────
  { name: "Canary Yellow",    hex: "#FFEF00", family: "Yellow" },
  { name: "Lemon Yellow",     hex: "#FFF44F", family: "Yellow" },
  { name: "Golden Yellow",    hex: "#FFC200", family: "Yellow" },
  { name: "Sunflower",        hex: "#FFD700", family: "Yellow" },
  { name: "Mustard",          hex: "#FFDB58", family: "Yellow" },
  { name: "Honey Gold",       hex: "#E8B400", family: "Yellow" },
  { name: "Saffron",          hex: "#F4C430", family: "Yellow" },
  { name: "Butter Yellow",    hex: "#FFFD74", family: "Yellow" },
  { name: "Straw",            hex: "#E4D96F", family: "Yellow" },

  // ──────────────────────────────────────────────────────────────────────────
  // GREENS
  // ──────────────────────────────────────────────────────────────────────────
  { name: "Forest Green",     hex: "#228B22", family: "Green" },
  { name: "Emerald Green",    hex: "#50C878", family: "Green" },
  { name: "Hunter Green",     hex: "#355E3B", family: "Green" },
  { name: "Sage Green",       hex: "#8FAA7A", family: "Green" }, // 2026 Trend
  { name: "Olive Green",      hex: "#808000", family: "Green" },
  { name: "Mint Green",       hex: "#98FF98", family: "Green" },
  { name: "Neo Mint",         hex: "#A8E6CF", family: "Green" }, // 2026 Trend
  { name: "Grass Green",      hex: "#7CFC00", family: "Green" },
  { name: "Lime Green",       hex: "#32CD32", family: "Green" },
  { name: "Dark Olive",       hex: "#556B2F", family: "Green" },
  { name: "Avocado Green",    hex: "#568203", family: "Green" },
  { name: "Pistachio",        hex: "#93C572", family: "Green" },
  { name: "Jade",             hex: "#00A86B", family: "Green" },
  { name: "Bottle Green",     hex: "#006A4E", family: "Green" },

  // ──────────────────────────────────────────────────────────────────────────
  // BLUES
  // ──────────────────────────────────────────────────────────────────────────
  { name: "Navy Blue",        hex: "#001F54", family: "Blue" },
  { name: "Midnight Blue",    hex: "#191970", family: "Blue" },
  { name: "Royal Blue",       hex: "#4169E1", family: "Blue" },
  { name: "Cobalt Blue",      hex: "#0047AB", family: "Blue" },
  { name: "Sky Blue",         hex: "#87CEEB", family: "Blue" },
  { name: "Baby Blue",        hex: "#89CFF0", family: "Blue" },
  { name: "Denim Blue",       hex: "#1560BD", family: "Blue" },
  { name: "Steel Blue",       hex: "#4682B4", family: "Blue" },
  { name: "Powder Blue",      hex: "#B0E0E6", family: "Blue" },
  { name: "Cerulean",         hex: "#2A52BE", family: "Blue" },
  { name: "Teal",             hex: "#008080", family: "Blue" },
  { name: "Alexandrite",      hex: "#005F60", family: "Blue" }, // 2026 Pantone Trend
  { name: "Aqua",             hex: "#00FFFF", family: "Blue" },
  { name: "Ocean Blue",       hex: "#4F97A3", family: "Blue" },
  { name: "Turquoise",        hex: "#40E0D0", family: "Blue" },
  { name: "Ice Blue",         hex: "#D0F0FF", family: "Blue" },
  { name: "Dusty Blue",       hex: "#6699CC", family: "Blue" },

  // ──────────────────────────────────────────────────────────────────────────
  // PURPLES & LAVENDERS
  // ──────────────────────────────────────────────────────────────────────────
  { name: "Deep Purple",      hex: "#301934", family: "Purple" },
  { name: "Royal Purple",     hex: "#7851A9", family: "Purple" },
  { name: "Violet",           hex: "#8F00FF", family: "Purple" },
  { name: "Amethyst",         hex: "#9966CC", family: "Purple" },
  { name: "Lavender",         hex: "#E6E6FA", family: "Purple" },
  { name: "Lilac",            hex: "#C8A2C8", family: "Purple" },
  { name: "Plum",             hex: "#DDA0DD", family: "Purple" },
  { name: "Orchid",           hex: "#DA70D6", family: "Purple" },
  { name: "Periwinkle",       hex: "#CCCCFF", family: "Purple" },
  { name: "Indigo",           hex: "#4B0082", family: "Purple" },
  { name: "Eggplant",         hex: "#614051", family: "Purple" },

  // ──────────────────────────────────────────────────────────────────────────
  // METALLICS
  // ──────────────────────────────────────────────────────────────────────────
  { name: "Gold",             hex: "#FFD700", family: "Metallic" },
  { name: "Silver Metallic",  hex: "#C0C0C0", family: "Metallic" },
  { name: "Bronze",           hex: "#CD7F32", family: "Metallic" },
  { name: "Copper",           hex: "#B87333", family: "Metallic" },
  { name: "Gunmetal",         hex: "#2A3439", family: "Metallic" },
  { name: "Chrome",           hex: "#DBE4EE", family: "Metallic" },
  { name: "Antique Gold",     hex: "#CFB53B", family: "Metallic" },

  // ──────────────────────────────────────────────────────────────────────────
  // AFRICAN HERITAGE FASHION COLORS (Aso-Oke, Ankara, Kente, Adire)
  // ──────────────────────────────────────────────────────────────────────────
  { name: "Ankara Coral",     hex: "#E05C2A", family: "Heritage" },
  { name: "Aso-Oke Gold",     hex: "#C8A12A", family: "Heritage" },
  { name: "Kente Green",      hex: "#1E8449", family: "Heritage" },
  { name: "Kente Black",      hex: "#1A1A1A", family: "Heritage" },
  { name: "Adire Indigo",     hex: "#1F3A6E", family: "Heritage" },
  { name: "Adire White",      hex: "#F5F5F0", family: "Heritage" },
  { name: "Royal Ankara Blue",hex: "#1B4F8A", family: "Heritage" },
  { name: "Lagos Fuchsia",    hex: "#E91E8C", family: "Heritage" },
  { name: "Abuja Red",        hex: "#B22222", family: "Heritage" },
  { name: "Accra Yellow",     hex: "#F5C518", family: "Heritage" },
  { name: "Nairobi Green",    hex: "#006B3F", family: "Heritage" },
];

/** Look up a color by name (case-insensitive). */
export function findColorByName(name: string): FashionColor | undefined {
  const lower = name.toLowerCase().trim();
  return FASHION_COLORS.find((c) => c.name.toLowerCase() === lower);
}

/** Look up a color by hex code. */
export function findColorByHex(hex: string): FashionColor | undefined {
  const normalized = hex.toUpperCase().trim();
  return FASHION_COLORS.find((c) => c.hex.toUpperCase() === normalized);
}

/** Get all unique color families for grouping. */
export const COLOR_FAMILIES = [
  ...new Set(FASHION_COLORS.map((c) => c.family)),
] as const;
