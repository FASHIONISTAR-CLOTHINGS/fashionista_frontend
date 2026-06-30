"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createShippingProfile, getShippingProfile, listShippingProfiles, updateShippingProfile } from "../api/shipping.api";
import type { ShippingProfileCreatePayload } from "../types/shipping.types";

export const shippingKeys = {
  all: ["shipping-profiles"] as const,
  list: (vendorId?: string) => ["shipping-profiles", "list", vendorId ?? "me"] as const,
  detail: (id: string) => ["shipping-profiles", "detail", id] as const,
};

export function useShippingProfiles(vendorId?: string) {
  return useQuery({
    queryKey: shippingKeys.list(vendorId),
    queryFn: () => listShippingProfiles(vendorId),
    staleTime: 60_000,
  });
}

export function useShippingProfile(id: string) {
  return useQuery({
    queryKey: shippingKeys.detail(id),
    queryFn: () => getShippingProfile(id),
    enabled: Boolean(id),
    staleTime: 60_000,
  });
}

export function useCreateShippingProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: ShippingProfileCreatePayload) => createShippingProfile(payload),
    onSuccess: () => { qc.invalidateQueries({ queryKey: shippingKeys.all }); },
  });
}

export function useUpdateShippingProfile(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<ShippingProfileCreatePayload>) => updateShippingProfile(id, payload),
    onSuccess: () => { qc.invalidateQueries({ queryKey: shippingKeys.all }); },
  });
}
