/**
 * app/robots.ts — S24: robots.txt generation
 *
 * Allows all public-facing commerce routes.
 * Disallows admin, vendor, and client dashboard routes from search indexing.
 */
import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://fashionistar.net";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin-dashboard/",
          "/vendor/",
          "/vendor-dashboard/",
          "/client/",
          "/client-dashboard/",
          "/api/",
          "/auth/",
          "/cart/",
          "/wishlist/",
          "/account/",
          "/_next/",
        ],
      },
      {
        // Block GPTBot from crawling private areas
        userAgent: "GPTBot",
        disallow: ["/"],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}
