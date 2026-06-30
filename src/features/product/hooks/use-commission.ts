"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createCommissionSnapshot, getCommissionSnapshot, listCommissionSnapshots, updateCommissionSnapshot } from "../api/commission.api";
import type { CommissionSnapshotCreatePayload } from "../types/commission.types";

export const commissionKeys = {
  all: ["commission-snapshots"] as const,
  list: (productId?: string, vendorId?: string) =>
    ["commission-snapshots", "list", productId ?? "all", vendorId ?? "all"] as const,
  detail: (id: string) => ["commission-snapshots", "detail", id] as const,
};

export function useCommissionSnapshots(productId?: string, vendorId?: string) {
  return useQuery({
    queryKey: commissionKeys.list(productId, vendorId),
    queryFn: () => listCommissionSnapshots(productId, vendorId),
    staleTime: 60_000,
  });
}

export function useCommissionSnapshot(id: string) {
  return useQuery({
    queryKey: commissionKeys.detail(id),
    queryFn: () => getCommissionSnapshot(id),
    enabled: Boolean(id),
    staleTime: 60_000,
  });
}

export function useCreateCommissionSnapshot() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CommissionSnapshotCreatePayload) => createCommissionSnapshot(payload),
    onSuccess: () => { qc.invalidateQueries({ queryKey: commissionKeys.all }); },
  });
}

export function useUpdateCommissionSnapshot(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { note?: string; effective_to?: string | null }) =>
      updateCommissionSnapshot(id, payload),
    onSuccess: () => { qc.invalidateQueries({ queryKey: commissionKeys.all }); },
  });
}
