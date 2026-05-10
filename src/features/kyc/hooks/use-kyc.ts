/**
 * @file use-kyc.ts
 * @description TanStack Query hooks for the KYC FSD feature.
 *
 * Hook Tiers:
 *  ① DRF read:      useKycStatus (legacy DRF sync)
 *  ② DRF mutation:  useInitiateKyc, useRecordKycDocument
 *  ③ Ninja reads:   useNinjaKycStatus, useNinjaKycDocuments
 *
 * KYC Lifecycle:
 *   useInitiateKyc()     → POST /v1/kyc/submit/           (create PENDING)
 *   useRecordKycDocument → POST /v1/kyc/documents/upload/  (record Cloudinary asset)
 *   useNinjaKycStatus    → GET  /ninja/kyc/status/          (poll status + doc count)
 *   useNinjaKycDocuments → GET  /ninja/kyc/documents/       (full doc list)
 */
"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  fetchKycStatus,
  initiateKyc,
  recordKycDocument,
  getNinjaKycDocuments,
  getNinjaKycStatus,
  submitKyc,
} from "../api/kyc.api";
import type {
  KycSubmitInput,
  KycDocumentUploadInput,
} from "../types/kyc.types";

// ─── Query Key Factory ────────────────────────────────────────────────────────

export const kycKeys = {
  all: ["kyc"] as const,
  /** DRF legacy status */
  status: () => [...kycKeys.all, "status"] as const,
  /** Ninja status summary (status + document_count) */
  ninjaStatus: () => [...kycKeys.all, "ninja", "status"] as const,
  /** Ninja full documents view */
  ninjaDocuments: () => [...kycKeys.all, "ninja", "documents"] as const,
} as const;

// ── Helper: invalidate all KYC caches ────────────────────────────────────────
function invalidateAll(qc: ReturnType<typeof useQueryClient>) {
  void qc.invalidateQueries({ queryKey: kycKeys.all });
}

// ─── DRF Sync — Read ─────────────────────────────────────────────────────────

/** DRF KYC status read (legacy — prefer useNinjaKycStatus for UI components) */
export function useKycStatus() {
  return useQuery({
    queryKey: kycKeys.status(),
    queryFn: fetchKycStatus,
    staleTime: 60_000,
  });
}

// ─── DRF Sync — Mutations ────────────────────────────────────────────────────

/**
 * Initiate or reopen a KYC submission.
 *  - No prior submission → creates PENDING
 *  - REJECTED/RESUBMIT   → resets to PENDING
 *  - Other states        → idempotent, returns current state
 *
 * Source: POST /api/v1/kyc/submit/
 */
export function useInitiateKyc() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: KycSubmitInput = {}) => initiateKyc(input),
    onSuccess: () => {
      invalidateAll(qc);
      toast.success(
        "KYC submission initiated. Upload your identity documents to continue.",
      );
    },
    onError: () => {
      toast.error("Failed to initiate KYC. Please try again.");
    },
  });
}

/**
 * @deprecated — use useInitiateKyc
 * Preserved for backward compatibility with existing consumers.
 */
export function useSubmitKyc() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: KycSubmitInput) => submitKyc(input),
    onSuccess: () => {
      invalidateAll(qc);
    },
  });
}

/**
 * Record a KYC document upload against the user's active submission.
 * The document must already be uploaded to Cloudinary by the client.
 *
 * Source: POST /api/v1/kyc/documents/upload/
 * Idempotent per (submission, document_type).
 */
export function useRecordKycDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: KycDocumentUploadInput) => recordKycDocument(input),
    onSuccess: (_, variables) => {
      invalidateAll(qc);
      toast.success(
        `${variables.document_type.replace(/_/g, " ")} document uploaded successfully.`,
      );
    },
    onError: (err: unknown) => {
      const msg =
        err instanceof Error ? err.message : "Failed to record document.";
      toast.error(msg);
    },
  });
}

// ─── Ninja Async Hooks — Reads ────────────────────────────────────────────────

/**
 * KYC status summary from Ninja /kyc/status/
 * Returns: status, is_approved, document_count, timestamps.
 * 2 DB queries: afirst (submission) + acount (documents).
 */
export function useNinjaKycStatus() {
  return useQuery({
    queryKey: kycKeys.ninjaStatus(),
    queryFn: getNinjaKycStatus,
    staleTime: 60_000, // KYC status is semi-static
  });
}

/**
 * KYC submission + all documents from Ninja /kyc/documents/
 * Returns: full submission record + document array.
 * 2 DB queries: afirst (submission) + async for loop (documents).
 */
export function useNinjaKycDocuments() {
  return useQuery({
    queryKey: kycKeys.ninjaDocuments(),
    queryFn: getNinjaKycDocuments,
    staleTime: 60_000,
  });
}
