/**
 * core/api/middleware.ts — Re-exports fetchWithAuth from the canonical implementation.
 *
 * Canonical source: @/lib/api/fetchAuth
 * New code should import directly from @/lib/api/fetchAuth.
 * This file exists only to avoid breaking any imports that still point here.
 */
export { fetchWithAuth, default } from "@/lib/api/fetchAuth";
