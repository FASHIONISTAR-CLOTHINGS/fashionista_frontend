/**
 * JsonLdScript.tsx — Server-safe JSON-LD structured data injector.
 *
 * RSC-compatible (no "use client"). Renders a <script type="application/ld+json">
 * tag directly into the HTML stream from a Server Component, enabling Google
 * to index rich snippets (Product, BreadcrumbList, ItemList, WebSite).
 *
 * Phase 4 — SEO & Performance (FASHIONISTAR Enterprise Blueprint)
 *
 * Usage (in any RSC page):
 *   import { JsonLdScript } from "@/components/seo/JsonLdScript";
 *   <JsonLdScript data={websiteSchema} />
 *   <JsonLdScript data={productSchema} id="product-ld" />
 */

interface JsonLdScriptProps {
  /** The structured data object to serialize as JSON-LD. */
  data: Record<string, unknown>;
  /**
   * Optional HTML id for the script tag.
   * Use distinct IDs when injecting multiple LD scripts on the same page.
   * Defaults to "json-ld".
   */
  id?: string;
}

/**
 * Renders a `<script type="application/ld+json">` inline in the server HTML.
 *
 * SECURITY: The data object is serialized via JSON.stringify — never inject
 * raw user-supplied strings into the `data` prop without sanitization.
 *
 * PERFORMANCE: This component has zero JS cost — it is a pure RSC that emits
 * a raw script tag. Google, Bing, and other crawlers parse it on first byte.
 */
export function JsonLdScript({ data, id = "json-ld" }: JsonLdScriptProps) {
  return (
    <script
      id={id}
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data, null, 0),
      }}
    />
  );
}
