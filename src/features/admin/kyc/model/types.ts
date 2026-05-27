/**
 * features/admin/kyc/model/types.ts
 */

export interface AdminKycDocument {
  id: string;
  document_type: string;
  status: string | null;
  created_at: string;
}

export interface AdminKycSubmission {
  id: string;
  user_id: string;
  user_email: string | null;
  user_member_id: string | null;
  status: "pending" | "in_review" | "approved" | "rejected" | "resubmit";
  legal_name: string | null;
  review_notes: string | null;
  provider_reference: string | null;
  submitted_at: string;
  reviewed_at: string | null;
  created_at: string;
  documents?: AdminKycDocument[];
}

export interface AdminKycStats {
  pending: number;
  in_review: number;
  approved: number;
  rejected: number;
  new_today: number;
  total: number;
}
