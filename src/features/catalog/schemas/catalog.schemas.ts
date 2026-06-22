import { z } from "zod";

const IdSchema = z.union([z.string(), z.number()]).transform(String);
const NullableStringSchema = z.string().nullable();
const OptionalNullableStringSchema = z.string().nullable().optional().default(null);
/** Sanitizes image URLs — treats null, undefined, /media/None, /media/null etc. as empty string. */
const ImageUrlSchema = z
  .string()
  .nullable()
  .optional()
  .transform((value) => {
    if (!value) return "";
    const s = value.trim();
    // Guard against Django serializer bug: /media/None, /media/null, /media/undefined
    if (
      s === "null" ||
      s === "undefined" ||
      s === "None" ||
      s.endsWith("/media/None") ||
      s.endsWith("/media/null") ||
      s.endsWith("/media/undefined")
    ) {
      return "";
    }
    return s;
  });


export const CatalogCategorySchema = z.object({
  id: IdSchema,
  name: z.string(),
  title: z.string(),
  slug: z.string(),
  image: NullableStringSchema,
  image_url: ImageUrlSchema,
  cloudinary_url: OptionalNullableStringSchema,
  active: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const CatalogBrandSchema = z.object({
  id: IdSchema,
  name: z.string(),
  title: z.string(),
  slug: z.string(),
  description: z.string().nullable().transform((value) => value ?? ""),
  image: NullableStringSchema,
  image_url: ImageUrlSchema,
  cloudinary_url: OptionalNullableStringSchema,
  active: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const CatalogCollectionSchema = z.object({
  id: IdSchema,
  name: z.string(),
  title: z.string(),
  slug: z.string(),
  sub_title: z.string().nullable().transform((value) => value ?? ""),
  description: z.string().nullable().transform((value) => value ?? ""),
  image: NullableStringSchema,
  image_url: ImageUrlSchema,
  cloudinary_url: OptionalNullableStringSchema,
  background_image: NullableStringSchema,
  background_image_url: ImageUrlSchema,
  background_cloudinary_url: OptionalNullableStringSchema,
  created_at: z.string(),
  updated_at: z.string(),
});

// A blog media item from the backend can be a full serializer object or just a URL string
const BlogMediaItemSchema = z
  .union([
    z.object({
      id: z.union([z.string(), z.number()]).transform(String).optional(),
      image: z.string().nullable().optional(),
      public_id: z.string().optional(),
      image_url: z.string().nullable().optional().transform((v) => v ?? ""),
      alt_text: z.string().optional(),
      sort_order: z.number().optional(),
      created_at: z.string().optional(),
      updated_at: z.string().optional(),
    }),
    z.string(),
  ])
  .transform((item) => {
    if (typeof item === "string") return item;
    return item.image_url ?? item.image ?? "";
  });

export const CatalogBlogPostSchema = z
  .object({
    id: IdSchema,
    author: IdSchema.nullable(),
    author_name: z.string().default("Fashionistar Editorial"),
    category: IdSchema.nullable(),
    category_name: z.string().nullable().transform((value) => value ?? ""),
    title: z.string(),
    slug: z.string(),
    excerpt: z.string().nullable().transform((value) => value ?? ""),
    content: z.string(),
    featured_image: NullableStringSchema,
    featured_image_cloudinary_url: OptionalNullableStringSchema,
    featured_image_url: OptionalNullableStringSchema,
    gallery_media: z.array(BlogMediaItemSchema).default([]),
    status: z.enum(["draft", "review", "published", "archived"]),
    tags: z.array(z.string()).default([]),
    seo_title: z.string().nullable().transform((value) => value ?? ""),
    seo_description: z.string().nullable().transform((value) => value ?? ""),
    is_featured: z.boolean(),
    published_at: z.string().nullable(),
    view_count: z.number(),
    created_at: z.string(),
    updated_at: z.string(),
  })
  .transform((post) => {
    const resolvedImage =
      post.featured_image_cloudinary_url ||
      post.featured_image_url ||
      post.gallery_media[0] ||
      "";
    return {
      ...post,
      featured_image_url: resolvedImage,
      image_url: resolvedImage,
      gallery_media: post.gallery_media.length > 0 ? post.gallery_media : resolvedImage ? [resolvedImage] : [],
    };
  });

export const CatalogCategoryListSchema = z.array(CatalogCategorySchema);
export const CatalogBrandListSchema = z.array(CatalogBrandSchema);
export const CatalogCollectionListSchema = z.array(CatalogCollectionSchema);
export const CatalogBlogPostListSchema = z.array(CatalogBlogPostSchema);

// ─────────────────────────────────────────────────────────────────────────────
// Phase 11 — Homepage Bundle Zod Schemas
// Match the JSON shape returned by GET /api/v1/ninja/catalog/homepage/
// Every field uses safe transforms so partial/null server data never throws.
// ─────────────────────────────────────────────────────────────────────────────

const HomepageProductCardSchema = z.object({
  id: IdSchema,
  title: z.string(),
  slug: z.string(),
  sku: z.string().default(""),
  price: z.string().default("0.00"),
  old_price: z.string().nullable().optional().default(null),
  // numeric fields: backend returns null for products without computed values;
  // .nullable() allows null, .default(N) coerces null → fallback via .transform()
  discount_percentage: z.number().nullable().default(0),
  currency: z.string().default("NGN"),
  image_url: ImageUrlSchema,
  in_stock: z.boolean().default(true),
  stock_qty: z.number().nullable().default(0),
  featured: z.boolean().default(false),
  hot_deal: z.boolean().default(false),
  rating: z.number().nullable().default(0),
  review_count: z.number().nullable().default(0),
  computed_review_count: z.number().nullable().default(0),
  computed_avg_rating: z.number().nullable().default(0),
  category_name: z.string().nullable().optional().default(null),
  category_slug: z.string().nullable().optional().default(null),
  vendor_name: z.string().default("Fashionistar"),
  vendor_slug: z.string().nullable().optional().default(null),
  requires_measurement: z.boolean().default(false),
  is_customisable: z.boolean().default(false),
  sizes: z.array(z.object({ id: IdSchema, name: z.string() })).default([]),
  colors: z
    .array(z.object({ id: IdSchema, name: z.string(), hex_code: z.string() }))
    .default([]),
  created_at: z.string().nullable().optional().default(null),
}).transform((data) => ({
  ...data,
  // Coerce any remaining null numeric fields to their safe defaults
  discount_percentage: data.discount_percentage ?? 0,
  stock_qty: data.stock_qty ?? 0,
  rating: data.rating ?? 0,
  review_count: data.review_count ?? 0,
  computed_review_count: data.computed_review_count ?? 0,
  computed_avg_rating: data.computed_avg_rating ?? 0,
  store_name: data.vendor_name,
  store_slug: data.vendor_slug,
}));

const HomepageReviewCardSchema = z.object({
  id: IdSchema,
  reviewer_name: z.string().default("Anonymous"),
  reviewer_avatar_url: NullableStringSchema,
  product_title: z.string().nullable().optional().default(null),
  product_slug: z.string().nullable().optional().default(null),
  rating: z.number().min(1).max(5).default(5),
  review_text: z.string().default(""),
  helpful_votes: z.number().default(0),
  created_at: z.string().nullable().optional().default(null),
});

const HomepageCollectionCardSchema = z.object({
  id: IdSchema,
  name: z.string().default(""),
  title: z.string().default(""),
  slug: z.string(),
  sub_title: z.string().nullable().transform((v) => v ?? ""),
  description: z.string().nullable().transform((v) => v ?? ""),
  image: NullableStringSchema,
  image_url: ImageUrlSchema,
  background_image: NullableStringSchema,
  background_image_url: ImageUrlSchema,
  created_at: z.string().nullable().optional().default(null),
});

const HomepageCategoryCardSchema = z.object({
  id: IdSchema,
  name: z.string(),
  title: z.string().default(""),
  slug: z.string(),
  image: NullableStringSchema,
  image_url: ImageUrlSchema,
  active: z.boolean().default(true),
  created_at: z.string().nullable().optional().default(null),
});

const HomepageBannerCardSchema = z.object({
  id: IdSchema,
  slot: z.enum(["hero", "mid", "footer_cta"]).default("hero"),
  title: z.string().default(""),
  subtitle: z.string().default(""),
  cta_text: z.string().default("Shop Now"),
  cta_url: z.string().default(""),
  image_url: z.string().nullable().optional().default(null),
  mobile_image_url: z.string().nullable().optional().default(null),
  sort_order: z.number().default(0),
});

const HomepageBundleMetaSchema = z.object({
  collections_count: z.number().nullable().default(0).transform((v) => v ?? 0),
  categories_count: z.number().nullable().default(0).transform((v) => v ?? 0),
  products_count: z.number().nullable().default(0).transform((v) => v ?? 0),
  hot_deals_count: z.number().nullable().default(0).transform((v) => v ?? 0),
  reviews_count: z.number().nullable().default(0).transform((v) => v ?? 0),
  banners_count: z.number().nullable().default(0).transform((v) => v ?? 0),
});

export const HomepageBundleSchema = z.object({
  collections: z.array(HomepageCollectionCardSchema).default([]),
  categories: z.array(HomepageCategoryCardSchema).default([]),
  featured_products: z.array(HomepageProductCardSchema).default([]),
  hot_deals: z.array(HomepageProductCardSchema).default([]),
  reviews: z.array(HomepageReviewCardSchema).default([]),
  banners: z.array(HomepageBannerCardSchema).default([]),
  meta: HomepageBundleMetaSchema.default({}),
});
