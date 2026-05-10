/**
 * @file index.ts
 * @description Builder store barrel.
 * The builder uses React Hook Form state (managed by ProductBuilderProvider).
 * No separate Zustand store is required — this barrel is kept for future extension.
 */

export { useBuilderContext } from "../components/ProductBuilderProvider";
