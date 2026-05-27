/**
 * features/kyc/admin-dashboard/hooks.ts
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchAdminKycSubmissions,
  fetchAdminKycDetail,
  fetchAdminKycStats,
  approveKycSync,
  rejectKycSync,
  markKycInReviewSync,
} from "./api";
import { toast } from "sonner";

export function useAdminKycSubmissions(filters?: {
  status?: string;
  user_id?: string;
  search?: string;
  ordering?: string;
  page?: number;
  page_size?: number;
}) {
  return useQuery({
    queryKey: ["admin", "kyc", filters],
    queryFn: () => fetchAdminKycSubmissions(filters),
    placeholderData: (previousData) => previousData,
    staleTime: 15_000,
  });
}

export function useAdminKycDetail(submissionId: string | null) {
  return useQuery({
    queryKey: ["admin", "kyc", "detail", submissionId],
    queryFn: () => fetchAdminKycDetail(submissionId!),
    enabled: !!submissionId,
    staleTime: 30_000,
  });
}

export function useAdminKycStats() {
  return useQuery({
    queryKey: ["admin", "kyc", "stats"],
    queryFn: fetchAdminKycStats,
    staleTime: 60_000,
  });
}

// ── Mutation Hooks ──────────────────────────────────────────────────────────

export function useApproveKyc() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ submissionId, legalName }: { submissionId: string; legalName?: string }) =>
      approveKycSync(submissionId, legalName),
    onSuccess: () => {
      toast.success("KYC submission has been approved.");
      void queryClient.invalidateQueries({ queryKey: ["admin", "kyc"] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || err?.message || "Failed to approve KYC.");
    },
  });
}

export function useRejectKyc() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      submissionId,
      notes,
      allowResubmit,
    }: {
      submissionId: string;
      notes: string;
      allowResubmit?: boolean;
    }) => rejectKycSync(submissionId, notes, allowResubmit),
    onSuccess: () => {
      toast.success("KYC submission has been rejected.");
      void queryClient.invalidateQueries({ queryKey: ["admin", "kyc"] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || err?.message || "Failed to reject KYC.");
    },
  });
}

export function useMarkKycInReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ submissionId }: { submissionId: string }) => markKycInReviewSync(submissionId),
    onSuccess: () => {
      toast.success("KYC status moved to In Review.");
      void queryClient.invalidateQueries({ queryKey: ["admin", "kyc"] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || err?.message || "Failed to update KYC status.");
    },
  });
}
