import { KycDocumentUploadPanel } from "@/features/kyc/components/KycDocumentUploadPanel";

export const metadata = {
  title: "KYC Verification | Fashionistar Vendor Portal",
  description:
    "Complete identity verification to unlock withdrawals, payout setup, and high-value custom orders on the Fashionistar platform.",
};

export default function VendorKycPage() {
  return <KycDocumentUploadPanel audience="vendor" />;
}
