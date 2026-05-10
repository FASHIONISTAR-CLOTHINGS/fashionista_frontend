import { z } from "zod";

const IdSchema = z.union([z.string(), z.number()]).transform(String);
const NullableStringSchema = z.string().nullable();
const OptionalNullableStringSchema = z.string().nullable().optional().default(null);
const ImageUrlSchema = z.string().nullable().optional().transform((value) => value ?? "");

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
