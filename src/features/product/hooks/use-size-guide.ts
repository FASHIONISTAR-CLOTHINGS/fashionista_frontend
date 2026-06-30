/**
 * @file use-size-guide.ts
 * @description TanStack Query hooks for ProductSizeAndMeasurementGuide.
 *
 * All hooks use Ky (async Ninja) for reads and Axios (DRF) for mutations.
 * Cache keys follow the pattern ["size-guides", ...params] for easy invalidation.
 */

"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createSizeGuide,
  deleteSizeGuide,
  getClientSizeGuideOverlay,
  getSizeGuide,
  listSizeGuides,
  updateSizeGuide,
} from "../api/size-guide.api";
import type { SizeGuideCreatePayload } from "../types/size-guide.types";

// --- Query Keys ----------------------------------------------------------

export const sizeGuideKeys = {
  all: ["size-guides"] as const,
  list: (vendorId?: string) =>
    ["size-guides", "list", vendorId ?? "me"] as const,
  detail: (id: string) => ["size-guides", "detail", id] as const,
  clientOverlay: (vendorId: string, profileId?: string) =>
    ["size-guides", "client-overlay", vendorId, profileId ?? "none"] as const,
};

// --- Read Hooks ----------------------------------------------------------

/**
 * Hook: list size guides (vendor-scoped or admin all).
 *
 * @param vendorId - Optional admin vendor filter.
 */
export function useSizeGuides(vendorId?: string) {
  return useQuery({
    queryKey: sizeGuideKeys.list(vendorId),
    queryFn: () => listSizeGuides(vendorId),
    staleTime: 60_000, // 1 minute
  });
}

/**
 * Hook: single size guide detail.
 *
 * @param id - UUID of the guide row.
 */
export function useSizeGuide(id: string) {
  return useQuery({
    queryKey: sizeGuideKeys.detail(id),
    queryFn: () => getSizeGuide(id),
    enabled: Boolean(id),
    staleTime: 60_000,
  });
}

/**
 * Hook: client size guide overlay enriched with personal measurements.
 *
 * @param vendorId           - VendorProfile UUID.
 * @param measurementProfileId - Optional MeasurementProfile UUID.
 */
export function useClientSizeGuideOverlay(
  vendorId: string,
  measurementProfileId?: string
) {
  return useQuery({
    queryKey: sizeGuideKeys.clientOverlay(vendorId, measurementProfileId),
    queryFn: () => getClientSizeGuideOverlay(vendorId, measurementProfileId),
    enabled: Boolean(vendorId),
    staleTime: 120_000, // 2 minutes
  });
}

// --- Write Hooks ---------------------------------------------------------

/**
 * Hook: create a size guide template.
 * Invalidates the list cache on success.
 */
export function useCreateSizeGuide() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: SizeGuideCreatePayload) => createSizeGuide(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: sizeGuideKeys.all });
    },
  });
}

/**
 * Hook: update a size guide template.
 *
 * @param id - UUID of the guide to update.
 */
export function useUpdateSizeGuide(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<SizeGuideCreatePayload>) =>
      updateSizeGuide(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: sizeGuideKeys.all });
    },
  });
}

/**
 * Hook: soft-delete a size guide template.
 */
export function useDeleteSizeGuide() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteSizeGuide(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: sizeGuideKeys.all });
    },
  });
}
