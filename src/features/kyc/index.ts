/**
 * @file index.ts
 * @description Public API for the `features/kyc` canonical FSD slice.
 *
 * Dual-Engine Strategy:
 *  - DRF (sync)    → /v1/kyc/           (mutations: initiate, document upload)
 *  - Ninja (async) → /ninja/kyc/        (reads: status summary, documents view)
 *
 * KYC lifecycle:
 *   1. useInitiateKyc()       → POST /v1/kyc/submit/            (PENDING state)
 *   2. useRecordKycDocument() → POST /v1/kyc/documents/upload/   (record asset)
 *   3. useNinjaKycStatus()    → GET  /ninja/kyc/status/          (poll progress)
 *   4. useNinjaKycDocuments() → GET  /ninja/kyc/documents/       (full doc list)
 */

// ── Types ──────────────────────────────────────────────────────────────────────
export type {
  KycStatus,
  KycDocumentType,
  KycSubmission,
  KycDocument,
  KycSubmitInput,
  KycDocumentUploadInput,
  NinjaKycStatusSummary,
  NinjaKycWithDocuments,
} from "./types/kyc.types";

// ── Schemas ────────────────────────────────────────────────────────────────────
export {
  KycSubmissionSchema,
  KycDocumentSchema,
  NinjaKycStatusSchema,
  NinjaKycWithDocumentsSchema,
  parseKycResponse,
} from "./schemas/kyc.schemas";

// ── API Client ─────────────────────────────────────────────────────────────────
export {
  fetchKycStatus,
  initiateKyc,
  submitKyc,        // @deprecated — use initiateKyc
  recordKycDocument,
  getNinjaKycStatus,
  getNinjaKycDocuments,
  getAdminKycSubmissions,
  approveKycSubmission,
  rejectKycSubmission,
} from "./api/kyc.api";

// ── TanStack Query Hooks ───────────────────────────────────────────────────────
export {
  kycKeys,
  useKycStatus,
  useInitiateKyc,
  useSubmitKyc,     // @deprecated — use useInitiateKyc
  useRecordKycDocument,
  useNinjaKycStatus,
  useNinjaKycDocuments,
} from "./hooks/use-kyc";

// ── Components ─────────────────────────────────────────────────────────────────
export { KycStatusView } from "./components/KycStatusView";
export { KycDocumentUploadPanel } from "./components/KycDocumentUploadPanel";
// Provider Registry UI — Phase 7
export { KYCGate } from "./components/KYCGate";
export { KYCStatusBadge } from "./components/KYCStatusBadge";

// ── Admin Dashboard ─────────────────────────────────────────────────────────
