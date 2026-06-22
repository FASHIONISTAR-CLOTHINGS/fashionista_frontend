/**
 * @/components/seo — barrel export
 *
 * Public API for SEO utilities in the FASHIONISTAR platform.
 */
export { JsonLdScript } from "./JsonLdScript";
export {
  generateWebSiteSchema,
  generateOrganizationSchema,
  generateItemListSchema,
  generateProductSchema,
  generateBreadcrumbSchema,
} from "./schemas";
export type {
  SchemaProduct,
  SchemaBreadcrumb,
  SchemaListItem,
} from "./schemas";
