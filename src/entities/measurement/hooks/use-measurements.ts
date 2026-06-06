// src/entities/measurement/hooks/use-measurements.ts
/**
 * TanStack Query hooks for the Measurement entity.
 * Consumers: features/measurements, features/cart (MeasurementGate), features/vendor.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import ky from "ky";

const MEAS_BASE = "/api/v1/ninja/measurements/";

export const measurementKeys = {
  all: ["measurements"] as const,
  lists: () => [...measurementKeys.all, "list"] as const,
  list: (params?: Record<string, unknown>) => [...measurementKeys.lists(), params ?? {}] as const,
  details: () => [...measurementKeys.all, "detail"] as const,
  detail: (id: string) => [...measurementKeys.details(), id] as const,
};

/**
 * All measurement profiles for the current user.
 */
export function useMeasurements() {
  return useQuery({
    queryKey: measurementKeys.lists(),
    queryFn: async () => {
      const res = await ky.get(MEAS_BASE).json<{ results: unknown[]; count: number }>();
      return res;
    },
    staleTime: 5 * 60_000,
  });
}

/**
 * Single measurement profile by ID.
 */
export function useMeasurement(id: string | null) {
  return useQuery({
    queryKey: measurementKeys.detail(id ?? ""),
    queryFn: async () => {
      const res = await ky.get(`${MEAS_BASE}${id}/`).json();
      return res;
    },
    enabled: Boolean(id),
    staleTime: 5 * 60_000,
  });
}

/**
 * Delete a measurement profile.
 */
export function useDeleteMeasurement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await ky.delete(`${MEAS_BASE}${id}/`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: measurementKeys.lists() });
    },
  });
}
