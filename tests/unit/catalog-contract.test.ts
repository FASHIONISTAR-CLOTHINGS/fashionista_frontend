import { describe, expect, it } from "vitest";

import {
  CatalogBlogPostListSchema,
  CatalogCategoryListSchema,
  CatalogCollectionListSchema,
  HomepageBundleSchema,
} from "@/features/catalog";

describe("catalog contracts", () => {
  it("parses normalized backend category payloads", () => {
    const payload = [
      {
        id: "2f9e2f9a-b33a-4f65-b421-74b5fbf26d1f",
        name: "Gowns",
        title: "Gowns",
        slug: "gowns",
        image: null,
        image_url: "https://cdn.example/gowns.jpg",
        cloudinary_url: "https://cdn.example/gowns.jpg",
        active: true,
        created_at: "2026-04-26T00:00:00.000Z",
        updated_at: "2026-04-26T00:00:00.000Z",
      },
    ];

    expect(CatalogCategoryListSchema.parse(payload)[0]?.id).toBe("2f9e2f9a-b33a-4f65-b421-74b5fbf26d1f");
  });

  it("parses normalized backend collection payloads", () => {
    const payload = [
      {
        id: 1,
        name: "Wedding Edit",
        title: "Wedding Edit",
        slug: "wedding-edit",
        sub_title: "Ceremony pieces",
        description: "Curated occasion wear",
        image: null,
        image_url: "",
        cloudinary_url: null,
        background_image: null,
        background_image_url: "",
        background_cloudinary_url: null,
        created_at: "2026-04-26T00:00:00.000Z",
        updated_at: "2026-04-26T00:00:00.000Z",
      },
    ];

    expect(CatalogCollectionListSchema.parse(payload)[0]?.id).toBe("1");
  });

  it("parses normalized backend blog payloads", () => {
    const payload = [
      {
        id: "018f8ad4-63ef-7a9a-9a2f-f3adf72dd00a",
        author: null,
        author_name: "Fashionistar Editorial",
        category: null,
        category_name: "Measurements",
        title: "How Digital Measurements Improve Tailor Fit",
        slug: "digital-measurements-tailor-fit",
        excerpt: "A practical guide to better fitting custom clothes.",
        content: "Digital measurements help clients and tailors reduce sizing errors.",
        featured_image: null,
        featured_image_cloudinary_url: null,
        image_url: "https://cdn.example/blog.jpg",
        status: "published",
        tags: ["measurements"],
        seo_title: "Digital Measurements For Tailors",
        seo_description: "How measurements improve tailoring outcomes.",
        is_featured: true,
        published_at: "2026-04-26T00:00:00.000Z",
        view_count: 0,
        created_at: "2026-04-26T00:00:00.000Z",
        updated_at: "2026-04-26T00:00:00.000Z",
      },
    ];

    expect(CatalogBlogPostListSchema.parse(payload)[0]?.slug).toBe("digital-measurements-tailor-fit");
  });

  it("parses homepage bundle payloads with banners and banners_count", () => {
    const payload = {
      collections: [],
      categories: [],
      featured_products: [],
      hot_deals: [],
      reviews: [],
      banners: [
        {
          id: 11,
          slot: "hero",
          title: "Hero Banner",
          subtitle: "Live storefront promo",
          cta_text: "Shop now",
          cta_url: "/collections/wedding-edit",
          image_url: "https://cdn.example/banner.jpg",
          mobile_image_url: "https://cdn.example/banner-mobile.jpg",
          sort_order: 0,
        },
      ],
      meta: {
        collections_count: 0,
        categories_count: 0,
        products_count: 0,
        hot_deals_count: 0,
        reviews_count: 0,
        banners_count: 1,
      },
    };

    const result = HomepageBundleSchema.parse(payload);
    expect(result.banners).toHaveLength(1);
    expect(result.meta.banners_count).toBe(1);
  });
});
