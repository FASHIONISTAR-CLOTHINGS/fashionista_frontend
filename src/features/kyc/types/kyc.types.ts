/**
 * @file kyc.types.ts
 * @description KYC feature contracts for client/vendor/admin dashboards.
 */

export type KycStatus = "pending" | "in_review" | "approved" | "rejected" | "resubmit";

export type KycDocumentType =
  | "nin_card"
  | "bvn_slip"
  | "passport"
  | "drivers_license"
  | "voters_card"
  | "selfie"
  | "cac_certificate"
  | "utility_bill";

export interface KycSubmission {
  id?: string;
  status: KycStatus | "not_started";
  provider_reference: string;
  review_notes: string;
  submitted_at: string;
  reviewed_at: string | null;
  updated_at: string;
}

export interface KycDocument {
  id: string;
  document_type: KycDocumentType;
  secure_url: string;
  public_id?: string;
  provider_verified?: boolean;
  uploaded_at: string;
}

export interface KycSubmitInput {
  nin?: string;
  bvn?: string;
}

/**
 * Input for POST /api/v1/kyc/documents/upload/
 * Client uploads the file to Cloudinary first, then records the result here.
 */
export interface KycDocumentUploadInput {
  document_type: KycDocumentType;
  secure_url: string;
  public_id: string;
  document_number?: string;
}

// ── Ninja Async Dashboard Types ───────────────────────────────────────────────

/**
 * Full KYC status summary from GET /api/v1/ninja/kyc/status/
 * Includes document_count aggregated at DB level.
 */
export interface NinjaKycStatusSummary {
  id?: string;
  status: KycStatus | "not_started";
  is_approved: boolean;
  is_pending?: boolean;
  document_count: number;
  submitted_at: string | null;
  reviewed_at: string | null;
  review_notes: string;
  provider_reference: string;
}

/**
 * Full submission + documents from GET /api/v1/ninja/kyc/documents/
 */
export interface NinjaKycWithDocuments {
  id?: string;
  status: KycStatus | "not_started";
  is_approved: boolean;
  review_notes: string;
  provider_reference: string;
  submitted_at: string | null;
  reviewed_at: string | null;
  documents: KycDocument[];
}
