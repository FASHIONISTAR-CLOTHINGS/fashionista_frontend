"use client";

/**
 * @file KycDocumentUploadPanel.tsx
 * @description Full KYC verification journey for client/vendor dashboards.
 *
 * Step flow:
 *   Step 1: Initiate → POST /v1/kyc/submit/
 *   Step 2: Upload documents → POST /v1/kyc/documents/upload/ (per doc type)
 *   Step 3: Status polling → GET /ninja/kyc/status/ (auto-refreshes)
 *
 * Features:
 *   - Multi-step UX (initiate → upload → review)
 *   - Document type selector (NIN, Passport, Driver's License, etc.)
 *   - Cloudinary public_id + secure_url recording
 *   - Real-time status display from Ninja async endpoint
 *   - Document count progress tracker
 *
 * NOTE: Actual file upload to Cloudinary is handled client-side via
 * the Cloudinary Upload Widget or presigned POST. This component records
 * the Cloudinary result (secure_url + public_id) to the backend.
 */
import { useState } from "react";
import {
  ShieldCheck,
  Upload,
  FileCheck,
  AlertCircle,
  ChevronRight,
  CheckCircle2,
  Clock,
  XCircle,
  RefreshCw,
} from "lucide-react";
import {
  useNinjaKycStatus,
  useNinjaKycDocuments,
  useInitiateKyc,
  useRecordKycDocument,
} from "../hooks/use-kyc";
import { FashionistarImage } from "@/components/media";
import { Button } from "@/components/ui/button";
import type { KycDocumentType } from "../types/kyc.types";

// ── Constants ─────────────────────────────────────────────────────────────────

const DOCUMENT_TYPES: Array<{ value: KycDocumentType; label: string }> = [
  { value: "nin_card", label: "National Identification Number (NIN)" },
  { value: "bvn_slip", label: "Bank Verification Number (BVN)" },
  { value: "passport", label: "International Passport" },
  { value: "drivers_license", label: "Driver's License" },
  { value: "voters_card", label: "Voter's Card" },
  { value: "selfie", label: "Selfie / Live Photo" },
  { value: "cac_certificate", label: "CAC Certificate (Business)" },
  { value: "utility_bill", label: "Utility Bill (Address proof)" },
];

const STATUS_CONFIG = {
  not_started: {
    icon: ShieldCheck,
    color: "text-[#858585]",
    bg: "bg-[#F0F0F0]",
    label: "Not Started",
  },
  pending: {
    icon: Clock,
    color: "text-amber-600",
    bg: "bg-amber-50",
    label: "Pending Review",
  },
  in_review: {
    icon: RefreshCw,
    color: "text-blue-600",
    bg: "bg-blue-50",
    label: "Under Review",
  },
  approved: {
    icon: CheckCircle2,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    label: "Approved ✓",
  },
  rejected: {
    icon: XCircle,
    color: "text-red-600",
    bg: "bg-red-50",
    label: "Rejected",
  },
  resubmit: {
    icon: RefreshCw,
    color: "text-orange-600",
    bg: "bg-orange-50",
    label: "Resubmission Required",
  },
} as const;

// ── Main Component ────────────────────────────────────────────────────────────

type Audience = "client" | "vendor" | "admin";

const audienceCopy = {
  client:
    "Verify your identity to enable high-trust wallet payments and custom measurement sharing.",
  vendor:
    "Complete KYC before withdrawals, payout setup, and high-value custom orders.",
  admin: "Monitor verification readiness and provider integration status.",
};

export function KycDocumentUploadPanel({
  audience = "client",
}: {
  audience?: Audience;
}) {
  const { data: statusData, isLoading, isError, refetch } = useNinjaKycStatus();
  const { data: docsData } = useNinjaKycDocuments();
  const initiateKyc = useInitiateKyc();

  const kycStatus = statusData?.status ?? "not_started";
  const cfg =
    STATUS_CONFIG[kycStatus as keyof typeof STATUS_CONFIG] ??
    STATUS_CONFIG.not_started;
  const StatusIcon = cfg.icon;

  const isApproved = statusData?.is_approved;
  const canInitiate =
    kycStatus === "not_started" ||
    kycStatus === "rejected" ||
    kycStatus === "resubmit";

  return (
    <div className="flex flex-col gap-8 py-4">
      {/* Header */}
      <div>
        <h1 className="font-bon_foyage text-5xl text-black">
          KYC Verification
        </h1>
        <p className="mt-3 max-w-3xl text-base leading-7 text-[#5A6465]">
          {audienceCopy[audience]}
        </p>
      </div>

      {/* Status Card */}
      <section className="rounded-[32px] bg-white p-8 shadow-card_shadow">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div
              className={`flex size-14 items-center justify-center rounded-[20px] ${cfg.bg} ${cfg.color}`}
            >
              <StatusIcon size={24} />
            </div>
            <div>
              <p
                className={`text-lg font-bold ${isLoading ? "text-[#D9D9D9]" : cfg.color}`}
              >
                {isLoading ? "Checking status..." : cfg.label}
              </p>
              <p className="mt-0.5 text-sm text-[#5A6465]">
                {isError
                  ? "Backend KYC routes are offline."
                  : statusData?.document_count
                    ? `${statusData.document_count} document(s) recorded`
                    : "No documents uploaded yet"}
              </p>
            </div>
          </div>

          {/* Initiate / Resubmit CTA */}
          {canInitiate && (
            <Button
              onClick={() => initiateKyc.mutate({})}
              disabled={initiateKyc.isPending}
              className="flex items-center gap-2 rounded-[16px] bg-[#FDA600] px-5 py-3 text-sm font-bold text-white hover:bg-[#e59500] disabled:opacity-60"
            >
              {initiateKyc.isPending ? "Initiating..." : "Start Verification"}
              <ChevronRight size={16} />
            </Button>
          )}
        </div>

        {/* Review notes (rejection reason) */}
        {statusData?.review_notes && (
          <div className="mt-5 flex items-start gap-3 rounded-[16px] border border-red-100 bg-red-50 p-4">
            <AlertCircle size={16} className="mt-0.5 shrink-0 text-red-500" />
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-red-500">
                Review Notes
              </p>
              <p className="mt-1 text-sm text-red-700">
                {statusData.review_notes}
              </p>
            </div>
          </div>
        )}

        {/* Approved banner */}
        {isApproved && (
          <div className="mt-5 flex items-center gap-3 rounded-[16px] border border-emerald-200 bg-emerald-50 p-4">
            <CheckCircle2 size={18} className="text-emerald-500" />
            <p className="text-sm font-semibold text-emerald-700">
              Identity verified. All high-trust actions are enabled.
            </p>
          </div>
        )}
      </section>

      {/* Document Upload Section — show when submission exists but not approved */}
      {kycStatus !== "not_started" && !isApproved && (
        <DocumentUploadSection
          uploadedTypes={
            (docsData?.documents?.map((d) => d.document_type) ?? []) as KycDocumentType[]
          }
        />
      )}

      {/* Uploaded Documents List */}
      {docsData?.documents && docsData.documents.length > 0 && (
        <section className="rounded-[28px] bg-white p-7 shadow-card_shadow">
          <p className="mb-5 text-xs font-bold uppercase tracking-widest text-[#858585]">
            Uploaded Documents
          </p>
          <div className="space-y-3">
            {docsData.documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between gap-4 rounded-[16px] bg-[#F8F9FC] px-5 py-4"
              >
                <div className="flex items-center gap-3">
                  {doc.secure_url ? (
                    <FashionistarImage
                      src={doc.secure_url}
                      alt={doc.document_type.replace(/_/g, " ")}
                      width={48}
                      height={48}
                      className="size-12 rounded-[8px] object-cover"
                    />
                  ) : (
                    <FileCheck size={18} className="text-emerald-500" />
                  )}
                  <div>
                    <p className="text-sm font-semibold capitalize text-black">
                      {doc.document_type.replace(/_/g, " ")}
                    </p>
                    <p className="text-xs text-[#858585]">
                      Uploaded {new Date(doc.uploaded_at).toLocaleDateString("en-NG")}
                    </p>
                  </div>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest ${
                  doc.provider_verified
                    ? "bg-emerald-50 text-emerald-600"
                    : "bg-amber-50 text-amber-600"
                }`}>
                  {doc.provider_verified ? "Verified" : "Recorded"}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Error */}
      {isError && (
        <div className="flex items-center gap-3 rounded-[20px] border border-red-100 bg-red-50 p-5 text-sm text-red-700">
          <AlertCircle size={18} />
          <div className="flex flex-col gap-1">
            <span>KYC backend is unreachable. Check your connection.</span>
            <Button
              variant="link"
              onClick={() => void refetch()}
              className="text-left text-xs underline p-0 h-auto inline-block text-red-700"
            >
              Retry
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Document Upload Sub-Section ───────────────────────────────────────────────

function DocumentUploadSection({
  uploadedTypes,
}: {
  uploadedTypes: KycDocumentType[];
}) {
  const recordDoc = useRecordKycDocument();
  const [docType, setDocType] = useState<KycDocumentType>("nin_card");
  const [secureUrl, setSecureUrl] = useState("");
  const [publicId, setPublicId] = useState("");
  const [docNumber, setDocNumber] = useState("");

  const alreadyUploaded = uploadedTypes.includes(docType);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!secureUrl.trim() || !publicId.trim()) return;
    recordDoc.mutate(
      {
        document_type: docType,
        secure_url: secureUrl.trim(),
        public_id: publicId.trim(),
        document_number: docNumber.trim() || undefined,
      },
      {
        onSuccess: () => {
          setSecureUrl("");
          setPublicId("");
          setDocNumber("");
        },
      },
    );
  };

  return (
    <section className="rounded-[28px] bg-white p-8 shadow-card_shadow">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex size-12 items-center justify-center rounded-[18px] bg-[#FDA600]/10 text-[#FDA600]">
          <Upload size={22} />
        </div>
        <div>
          <p className="font-semibold text-black">Upload Identity Documents</p>
          <p className="text-sm text-[#5A6465]">
            Upload your document to Cloudinary first, then paste the URL below.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Document type */}
        <div>
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-[#858585]">
            Document Type *
          </label>
          <select
            value={docType}
            onChange={(e) => setDocType(e.target.value as KycDocumentType)}
            className="w-full rounded-[14px] border border-[#E5E7EB] px-4 py-3 text-sm text-black focus:border-[#FDA600] focus:outline-none"
          >
            {DOCUMENT_TYPES.map((dt) => (
              <option key={dt.value} value={dt.value}>
                {dt.label}
                {uploadedTypes.includes(dt.value) ? " ✓" : ""}
              </option>
            ))}
          </select>
          {alreadyUploaded && (
            <p className="mt-1.5 text-xs text-amber-600">
              You&apos;ve already uploaded this document type. Re-uploading will
              update the existing record.
            </p>
          )}
        </div>

        {/* Secure URL */}
        <div>
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-[#858585]">
            Cloudinary Secure URL *
          </label>
          <input
            type="url"
            required
            value={secureUrl}
            onChange={(e) => setSecureUrl(e.target.value)}
            placeholder="https://res.cloudinary.com/fashionistar/..."
            className="w-full rounded-[14px] border border-[#E5E7EB] px-4 py-3 text-sm text-black placeholder-[#C4C4C4] focus:border-[#FDA600] focus:outline-none"
          />
        </div>

        {/* Public ID */}
        <div>
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-[#858585]">
            Cloudinary Public ID *
          </label>
          <input
            type="text"
            required
            value={publicId}
            onChange={(e) => setPublicId(e.target.value)}
            placeholder="fashionistar/kyc/user_id/nin_card"
            className="w-full rounded-[14px] border border-[#E5E7EB] px-4 py-3 text-sm text-black placeholder-[#C4C4C4] focus:border-[#FDA600] focus:outline-none"
          />
        </div>

        {/* Document number (optional) */}
        <div>
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-[#858585]">
            Document Number{" "}
            <span className="font-normal normal-case text-[#858585]">
              (optional)
            </span>
          </label>
          <input
            type="text"
            value={docNumber}
            onChange={(e) => setDocNumber(e.target.value)}
            placeholder="e.g. NIN: 12345678901"
            className="w-full rounded-[14px] border border-[#E5E7EB] px-4 py-3 text-sm text-black placeholder-[#C4C4C4] focus:border-[#FDA600] focus:outline-none"
          />
        </div>

        <Button
          type="submit"
          disabled={recordDoc.isPending || !secureUrl || !publicId}
          className="flex w-full items-center justify-center gap-2 rounded-[14px] bg-[#FDA600] py-3.5 text-sm font-bold text-white hover:bg-[#e59500] disabled:opacity-60"
        >
          <Upload size={16} />
          {recordDoc.isPending ? "Recording..." : "Record Document Upload"}
        </Button>
      </form>
    </section>
  );
}
