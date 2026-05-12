/**
 * Core API Module — Public Exports
 *
 * Named imports (no barrel anti-pattern for tree shaking):
 *   import { apiSync } from '@/core/api/client.sync'
 *   import { apiAsync } from '@/core/api/client.async'
 */
export { apiSync, default as syncClient } from "./client.sync";
export { apiAsync, default as asyncClient } from "./client.async";
export {
  buildSearchParams,
  unwrapApiData,
  unwrapResults,
  type PaginatedEnvelope,
} from "./response";
