/**
 * @file kyc.api.ts
 * @description KYC API client — full document submission lifecycle.
 *
 * Endpoint Routing (Dual-Engine):
 *  - DRF sync  → /api/v1/kyc/  (mutations: initiate, document upload, admin)
 *  - Ninja async → /api/v1/ninja/kyc/ (reads: status summary, documents list)
 *
 * KYC lifecycle:
 *   1. POST /v1/kyc/submit/           → initiateKyc() — create PENDING submission
 *   2. POST /v1/kyc/documents/upload/ → recordKycDocument() — record Cloudinary doc
 *   3. GET  /ninja/kyc/status/        → getNinjaKycStatus() — poll status
 *   4. GET  /ninja/kyc/documents/     → getNinjaKycDocuments() — full view
 */
import { apiSync } from "@/core/api/client.sync";
import { apiAsync } from "@/core/api/client.async";
import { unwrapApiData } from "@/core/api/response";
import {
  KycSubmissionSchema,
  KycDocumentSchema,
  NinjaKycStatusSchema,
  NinjaKycWithDocumentsSchema,
  parseKycResponse,
} from "../schemas/kyc.schemas";
import type {
  KycSubmission,
  KycSubmitInput,
  KycDocument,
  KycDocumentUploadInput,
  NinjaKycStatusSummary,
  NinjaKycWithDocuments,
} from "../types/kyc.types";

// ─── DRF Sync Endpoints — Status (legacy read) ────────────────────────────────

export async function fetchKycStatus(): Promise<KycSubmission | null> {
  const { data } = await apiSync.get<unknown>("v1/kyc/status/");
  const payload = unwrapApiData<unknown>(data);
  if (!payload) return null;
  return parseKycResponse(KycSubmissionSchema, payload, "fetchKycStatus") as KycSubmission;
}

// ─── DRF Sync Endpoints — Mutation: Initiate Submission ──────────────────────

/**
 * POST /api/v1/kyc/submit/
 *
 * Initiate or reopen a KYC submission.
 *  - No prior submission → creates PENDING submission
 *  - REJECTED/RESUBMIT → resets to PENDING
 *  - APPROVED/PENDING/IN_REVIEW → idempotent, returns current state
 */
export async function initiateKyc(input: KycSubmitInput = {}): Promise<KycSubmission> {
  const { data } = await apiSync.post<unknown>("v1/kyc/submit/", input);
  return parseKycResponse(
    KycSubmissionSchema,
    unwrapApiData(data),
    "initiateKyc",
  ) as KycSubmission;
}

/** @deprecated — use initiateKyc() */
export const submitKyc = initiateKyc;

// ─── DRF Sync Endpoints — Mutation: Record Document Upload ───────────────────

/**
 * POST /api/v1/kyc/documents/upload/
 *
 * Record a KYC document that has already been uploaded to Cloudinary.
 * The client must upload the file to Cloudinary first, then pass the
 * resulting secure_url + public_id to this endpoint.
 *
 * Idempotent per (submission, document_type) — re-uploading the same
 * document type updates the existing record.
 *
 * Body:
 *   document_type    — "nin" | "passport" | "drivers_license" | ...
 *   secure_url       — Cloudinary secure URL
 *   public_id        — Cloudinary public_id
 *   document_number  — optional NIN / passport number
 */
export async function recordKycDocument(
  input: KycDocumentUploadInput,
): Promise<KycDocument> {
  const { data } = await apiSync.post<unknown>("v1/kyc/documents/upload/", input);
  return parseKycResponse(
    KycDocumentSchema,
    unwrapApiData(data),
    "recordKycDocument",
  ) as KycDocument;
}

// ─── Ninja Async Endpoints — Read: Status ────────────────────────────────────

/**
 * GET /api/v1/ninja/kyc/status/
 *
 * KYC status summary (2 DB queries):
 *   1. afirst(submission) → status, is_approved, timestamps
 *   2. acount(documents) → document_count
 */
export async function getNinjaKycStatus(): Promise<NinjaKycStatusSummary> {
  const envelope = await apiAsync
    .get("kyc/status/")
    .json<{ status: string; data: unknown }>();
  return parseKycResponse(
    NinjaKycStatusSchema,
    envelope?.data ?? envelope,
    "getNinjaKycStatus",
  ) as NinjaKycStatusSummary;
}

// ─── Ninja Async Endpoints — Read: Full Documents View ───────────────────────

/**
 * GET /api/v1/ninja/kyc/documents/
 *
 * Full submission with all document records (async for-loop iteration).
 */
export async function getNinjaKycDocuments(): Promise<NinjaKycWithDocuments> {
  const envelope = await apiAsync
    .get("kyc/documents/")
    .json<{ status: string; data: unknown }>();
  return parseKycResponse(
    NinjaKycWithDocumentsSchema,
    envelope?.data ?? envelope,
    "getNinjaKycDocuments",
  ) as NinjaKycWithDocuments;
}
