/**
 * features/admin/kyc/hooks/useAdminKyc.ts
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchAdminKycSubmissions,
  fetchAdminKycDetail,
  fetchAdminKycStats,
  quickApproveKyc,
  quickRejectKyc,
  approveKycSync,
  rejectKycSync,
  markKycInReviewSync,
} from "../api";
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
    staleTime: 30_000,
  });
}

// ── Mutation Hooks ──────────────────────────────────────────────────────────

export function useQuickApproveKyc() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ submissionId, legalName }: { submissionId: string; legalName?: string }) =>
      quickApproveKyc(submissionId, legalName),
    onSuccess: (data) => {
      if (data?.success === false) {
        toast.error(data.message || "Failed to approve KYC.");
      } else {
        toast.success("KYC submission approved successfully.");
        void queryClient.invalidateQueries({ queryKey: ["admin", "kyc"] });
      }
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || err?.message || "Failed to approve KYC.");
    },
  });
}

export function useQuickRejectKyc() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      submissionId,
      notes,
      allowResubmit,
    }: {
      submissionId: string;
      notes: string;
      allowResubmit: boolean;
    }) => quickRejectKyc(submissionId, notes, allowResubmit),
    onSuccess: (data) => {
      if (data?.success === false) {
        toast.error(data.message || "Failed to reject KYC.");
      } else {
        toast.success("KYC submission rejected.");
        void queryClient.invalidateQueries({ queryKey: ["admin", "kyc"] });
      }
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || err?.message || "Failed to reject KYC.");
    },
  });
}

export function useApproveKycSync() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ submissionId, legalName }: { submissionId: string; legalName?: string }) =>
      approveKycSync(submissionId, legalName),
    onSuccess: () => {
      toast.success("KYC submission approved successfully.");
      void queryClient.invalidateQueries({ queryKey: ["admin", "kyc"] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || err?.message || "Failed to approve KYC.");
    },
  });
}

export function useRejectKycSync() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      submissionId,
      notes,
      allowResubmit,
    }: {
      submissionId: string;
      notes: string;
      allowResubmit: boolean;
    }) => rejectKycSync(submissionId, notes, allowResubmit),
    onSuccess: () => {
      toast.success("KYC submission rejected successfully.");
      void queryClient.invalidateQueries({ queryKey: ["admin", "kyc"] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || err?.message || "Failed to reject KYC.");
    },
  });
}

export function useMarkKycInReviewSync() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ submissionId }: { submissionId: string }) =>
      markKycInReviewSync(submissionId),
    onSuccess: () => {
      toast.success("KYC submission marked as in review.");
      void queryClient.invalidateQueries({ queryKey: ["admin", "kyc"] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || err?.message || "Failed to mark in review.");
    },
  });
}
