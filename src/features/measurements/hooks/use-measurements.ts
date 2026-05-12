/**
 * @file use-measurements.ts
 * @description TanStack Query hooks for the Measurements domain.
 *
 * All reads and writes route through the Ninja async surface
 * (GET/POST/PATCH/DELETE /api/v1/ninja/measurements/).
 *
 * Key hooks:
 *   useMeasurementProfiles       — list all profiles (Ninja GET /)
 *   useDefaultMeasurementProfile — single default profile (Ninja GET /default/)
 *   useCreateMeasurementProfile  — create (Ninja POST /)
 *   useUpdateMeasurementProfile  — partial update (Ninja PATCH /{id}/)
 *   useSetDefaultProfile         — set default (Ninja POST /{id}/set-default/)
 *   useDeleteMeasurementProfile  — delete (Ninja DELETE /{id}/)
 */
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  fetchMeasurementProfiles,
  fetchDefaultMeasurementProfile,
  createMeasurementProfile,
  createMirrorSizeSession,
  updateMeasurementProfile,
  setDefaultMeasurementProfile,
  deleteMeasurementProfile,
  importMirrorSizeMeasurement,
} from "../api/measurements.api";
import type {
  CreateMeasurementProfileInput,
  MirrorSizeImportInput,
  MirrorSizeSessionInput,
  UpdateMeasurementProfileInput,
} from "../types/measurements.types";

// ─── Query Key Factory ────────────────────────────────────────────────────────

export const measurementKeys = {
  all: ["measurement"] as const,
  profiles: () => [...measurementKeys.all, "profiles"] as const,
  default: () => [...measurementKeys.all, "default"] as const,
  detail: (id: string | number) => [...measurementKeys.all, "detail", id] as const,
  mirrorsize: () => [...measurementKeys.all, "mirrorsize"] as const,
} as const;

// ─── READ HOOKS ───────────────────────────────────────────────────────────────

/**
 * All measurement profiles for the authenticated user.
 * Source: GET /api/v1/ninja/measurements/
 */
export function useMeasurementProfiles() {
  return useQuery({
    queryKey: measurementKeys.profiles(),
    queryFn: fetchMeasurementProfiles,
    staleTime: 120_000,
  });
}

/**
 * The user's default measurement profile.
 * Source: GET /api/v1/ninja/measurements/default/
 * Returns null when no default is set (404 from backend → null from API fn).
 */
export function useDefaultMeasurementProfile() {
  return useQuery({
    queryKey: measurementKeys.default(),
    queryFn: fetchDefaultMeasurementProfile,
    staleTime: 120_000,
  });
}

// ─── MUTATION HOOKS ───────────────────────────────────────────────────────────

/** Create a new measurement profile. */
export function useCreateMeasurementProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateMeasurementProfileInput) =>
      createMeasurementProfile(input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: measurementKeys.all });
      toast.success("Measurement profile created!");
    },
    onError: (err: unknown) => {
      const msg =
        err instanceof Error ? err.message : "Failed to create profile.";
      toast.error(msg);
    },
  });
}

/** Partial update of an existing measurement profile. */
export function useUpdateMeasurementProfile(profileId: string | number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateMeasurementProfileInput) =>
      updateMeasurementProfile(profileId, input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: measurementKeys.all });
      toast.success("Measurement profile updated.");
    },
    onError: () => {
      toast.error("Failed to update measurement profile.");
    },
  });
}

/**
 * Atomically promote a profile to the user's default.
 * The backend clears any existing default within the same transaction.
 */
export function useSetDefaultProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (profileId: string | number) =>
      setDefaultMeasurementProfile(profileId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: measurementKeys.all });
      toast.success("Default measurement profile updated.");
    },
    onError: () => {
      toast.error("Failed to set default profile.");
    },
  });
}

/** Hard-delete a measurement profile (GDPR right-to-erasure). */
export function useDeleteMeasurementProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (profileId: string | number) =>
      deleteMeasurementProfile(profileId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: measurementKeys.all });
      toast.success("Profile deleted.");
    },
    onError: () => {
      toast.error(
        "Cannot delete this profile. If it is the default, set another as default first.",
      );
    },
  });
}

export function useCreateMirrorSizeSession() {
  return useMutation({
    mutationFn: (input: MirrorSizeSessionInput) => createMirrorSizeSession(input),
    onSuccess: () => {
      toast.success("MirrorSize measurement session created.");
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "Failed to start MirrorSize.";
      toast.error(msg);
    },
  });
}

export function useImportMirrorSizeMeasurement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: MirrorSizeImportInput) => importMirrorSizeMeasurement(input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: measurementKeys.all });
      toast.success("MirrorSize measurements imported.");
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "Measurement is not available yet.";
      toast.error(msg);
    },
  });
}
