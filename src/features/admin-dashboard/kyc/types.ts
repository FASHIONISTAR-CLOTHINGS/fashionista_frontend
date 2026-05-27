/**
 * features/kyc/admin-dashboard/types.ts
 */

export interface AdminKycSubmission {
  id: string;
  user_id: string;
  status: "pending" | "in_review" | "approved" | "rejected";
  id_type: string;
  id_number: string;
  id_image_url: string;
  selfie_image_url: string;
  notes: string | null;
  allow_resubmit: boolean;
  legal_name: string | null;
  submitted_at: string;
  reviewed_at: string | null;
  user: {
    email: string;
    first_name: string;
    last_name: string;
  };
}

export interface AdminKycStats {
  total_submissions: number;
  pending_submissions: number;
  approved_submissions: number;
  rejected_submissions: number;
}
