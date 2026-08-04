import type { CatalogBlogPost, CatalogCategory, CatalogCollection } from "../types/catalog.types";
import staticBlogPosts from "./static-blog-posts.json";

const now = "2026-04-26T00:00:00.000Z";

export const fallbackCatalogCategories: CatalogCategory[] = [
  {
    id: "fallback-category-1",
    name: "Minimalist",
    title: "Minimalist",
    slug: "minimalist",
    image: "/minimalist.svg",
    image_url: "/minimalist.svg",
    cloudinary_url: null,
    active: true,
    created_at: now,
    updated_at: now,
  },
  {
    id: "fallback-category-2",
    name: "Gowns",
    title: "Gowns",
    slug: "gowns",
    image: "/gown.svg",
    image_url: "/gown.svg",
    cloudinary_url: null,
    active: true,
    created_at: now,
    updated_at: now,
  },
  {
    id: "fallback-category-3",
    name: "Vintage",
    title: "Vintage",
    slug: "vintage",
    image: "/vintage.svg",
    image_url: "/vintage.svg",
    cloudinary_url: null,
    active: true,
    created_at: now,
    updated_at: now,
  },
];

export const fallbackCatalogCollections: CatalogCollection[] = [
  {
    id: "fallback-collection-1",
    name: "Wedding Edit",
    title: "Wedding Edit",
    slug: "wedding-edit",
    sub_title: "Ceremony ready pieces",
    description: "Curated occasion looks for custom and ready-to-wear orders.",
    image: "/gown.svg",
    image_url: "/gown.svg",
    cloudinary_url: null,
    background_image: null,
    background_image_url: "",
    background_cloudinary_url: null,
    created_at: now,
    updated_at: now,
  },
  {
    id: "fallback-collection-2",
    name: "Native Essentials",
    title: "Native Essentials",
    slug: "native-essentials",
    sub_title: "Tailored Nigerian classics",
    description: "Senator, kaftan, agbada, and daily premium tailoring inspiration.",
    image: "/minimalist.svg",
    image_url: "/minimalist.svg",
    cloudinary_url: null,
    background_image: null,
    background_image_url: "",
    background_cloudinary_url: null,
    created_at: now,
    updated_at: now,
  },
  {
    id: "fallback-collection-3",
    name: "Vintage Finds",
    title: "Vintage Finds",
    slug: "vintage-finds",
    sub_title: "Distinctive pieces with character",
    description: "A tighter collection for rare textures, statement silhouettes, and refined edits.",
    image: "/vintage.svg",
    image_url: "/vintage.svg",
    cloudinary_url: null,
    background_image: null,
    background_image_url: "",
    background_cloudinary_url: null,
    created_at: now,
    updated_at: now,
  },
];

export const fallbackCatalogBlogPosts: CatalogBlogPost[] =
  staticBlogPosts as CatalogBlogPost[];
