"use client";

/**
 * @file KycStatusView.tsx
 * @description KYC status surface for client, vendor, and admin routes.
 * Updated to use the high-performance async Ninja and admin DRF endpoints.
 */
import {
  ShieldCheck,
  Eye,
  Check,
  X,
  Search,
  FileText,
  AlertCircle,
  User,
} from "lucide-react";
import { FashionistarImage } from "@/components/media";
import { Button } from "@/shared/ui";
import { useState } from "react";
import { toast } from "sonner";
import {
  useInitiateKyc,
  useNinjaKycStatus,
  useRecordKycDocument,
  useAdminKycSubmissions,
  useApproveKyc,
  useRejectKyc,
} from "../hooks/use-kyc";
import type { KycDocumentType } from "../types/kyc.types";

const copy = {
  client: "Verify identity before high-trust wallet payments and custom measurement sharing.",
  vendor: "Complete KYC before withdrawals, payout setup, and high-value custom orders.",
  admin: "Monitor verification readiness and provider integration status.",
} as const;

export function KycStatusView({
  audience = "client",
}: {
  audience?: keyof typeof copy;
}) {
  const { data, isError, isLoading } = useNinjaKycStatus();
  const initiate = useInitiateKyc();
  const recordDocument = useRecordKycDocument();
  const [nin, setNin] = useState("");
  const [bvn, setBvn] = useState("");
  const [documentType, setDocumentType] = useState<KycDocumentType>("nin_card");
  const [documentNumber, setDocumentNumber] = useState("");
  const [secureUrl, setSecureUrl] = useState("");
  const [publicId, setPublicId] = useState("");

  if (audience === "admin") {
    return <AdminKycTerminal />;
  }

  const submitKyc = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    initiate.mutate({ nin, bvn });
  };

  const uploadDocument = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    recordDocument.mutate({
      document_type: documentType,
      document_number: documentNumber,
      secure_url: secureUrl,
      public_id: publicId,
    });
  };

  return (
    <div className="flex flex-col gap-8 py-4">
      <div>
        <h1 className="font-bon_foyage text-5xl text-black">KYC Verification</h1>
        <p className="mt-3 max-w-3xl text-base leading-7 text-[#5A6465]">
          {copy[audience]}
        </p>
      </div>

      <section className="rounded-[32px] bg-white p-8 shadow-card_shadow">
        <div className="flex items-center gap-4">
          <div className="flex size-14 items-center justify-center rounded-[20px] bg-[#FDA600]/10 text-[#FDA600]">
            <ShieldCheck />
          </div>
          <div>
            <p className="text-lg font-semibold text-black capitalize">
              {isLoading ? "Checking status..." : data?.status ?? "Not started"}
            </p>
            <p className="mt-1 text-sm text-[#5A6465]">
              {isError
                ? "Backend KYC routes are offline. Check connection."
                : data?.status === "approved"
                  ? "Identity verified. All high-trust actions are enabled."
                  : data?.document_count
                    ? `Verification pending review. ${data.document_count} document(s) uploaded.`
                    : "Upload identity documents through the secure Cloudinary flow to begin."}
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <form onSubmit={submitKyc} className="rounded-[8px] border border-[#E5E7EB] bg-white p-6 shadow-card_shadow">
          <p className="text-lg font-semibold text-black">Start identity verification</p>
          <p className="mt-1 text-sm text-[#5A6465]">BVN/NIN values are hashed server-side and only last-four markers are retained.</p>
          <div className="mt-5 space-y-4">
            <Input label="NIN" value={nin} onChange={setNin} placeholder="11-digit NIN" />
            <Input label="BVN" value={bvn} onChange={setBvn} placeholder="11-digit BVN" />
          </div>
          <Button
            type="submit"
            disabled={initiate.isPending}
            className="mt-5 h-12 w-full text-sm font-bold text-white"
          >
            {initiate.isPending ? "Submitting..." : "Submit KYC"}
          </Button>
        </form>

        <form onSubmit={uploadDocument} className="rounded-[8px] border border-[#E5E7EB] bg-white p-6 shadow-card_shadow">
          <p className="text-lg font-semibold text-black">Record uploaded document</p>
          <p className="mt-1 text-sm text-[#5A6465]">Upload to Cloudinary first, then record the secure URL and public ID here.</p>
          <div className="mt-5 space-y-4">
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-widest text-[#858585]">Document Type</span>
              <select
                value={documentType}
                onChange={(event) => setDocumentType(event.target.value as KycDocumentType)}
                className="mt-2 h-11 w-full rounded-[8px] border border-[#E5E7EB] px-3 text-sm outline-none focus:border-[#FDA600]"
              >
                <option value="nin_card">NIN Card</option>
                <option value="bvn_slip">BVN Slip</option>
                <option value="passport">International Passport</option>
                <option value="drivers_license">Driver License</option>
                <option value="voters_card">Voter Card</option>
                <option value="selfie">Selfie</option>
                <option value="cac_certificate">CAC Certificate</option>
                <option value="utility_bill">Utility Bill</option>
              </select>
            </label>
            <Input label="Document Last Digits" value={documentNumber} onChange={setDocumentNumber} placeholder="Optional" />
            <Input label="Cloudinary Secure URL" value={secureUrl} onChange={setSecureUrl} placeholder="https://res.cloudinary.com/..." />
            <Input label="Cloudinary Public ID" value={publicId} onChange={setPublicId} placeholder="fashionistar/kyc/..." />
          </div>
          <Button
            type="submit"
            variant="secondary"
            disabled={recordDocument.isPending}
            className="mt-5 h-12 w-full bg-slate-900 border border-slate-800 text-sm font-bold text-white"
          >
            {recordDocument.isPending ? "Recording..." : "Record Document"}
          </Button>
        </form>
      </section>
    </div>
  );
}

function AdminKycTerminal() {
  const { data: rawData, isLoading, isError, refetch } = useAdminKycSubmissions();
  const approveMutation = useApproveKyc();
  const rejectMutation = useRejectKyc();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const [allowResubmit, setAllowResubmit] = useState(true);

  // Safely extract submissions list
  const submissionsList = Array.isArray(rawData)
    ? rawData
    : Array.isArray(rawData?.results)
      ? rawData.results
      : Array.isArray(rawData?.data)
        ? rawData.data
        : [];

  const filteredSubmissions = submissionsList.filter((sub: any) => {
    const userEmail = sub.user?.email || "";
    const userFirstName = sub.user?.first_name || "";
    const userLastName = sub.user?.last_name || "";
    const subId = sub.id || "";

    const matchesSearch =
      userEmail.toLowerCase().includes(search.toLowerCase()) ||
      userFirstName.toLowerCase().includes(search.toLowerCase()) ||
      userLastName.toLowerCase().includes(search.toLowerCase()) ||
      subId.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === "all" || sub.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleApprove = (id: string) => {
    approveMutation.mutate(
      { submissionId: id },
      {
        onSuccess: () => {
          setSelectedSubmission(null);
          refetch();
        },
      }
    );
  };

  const handleReject = (id: string) => {
    if (!reviewNotes.trim()) {
      toast.error("Please provide review notes explaining the rejection.");
      return;
    }
    rejectMutation.mutate(
      { submissionId: id, reviewNotes, allowResubmit },
      {
        onSuccess: () => {
          setSelectedSubmission(null);
          setReviewNotes("");
          refetch();
        },
      }
    );
  };

  return (
    <div className="flex flex-col gap-8 py-4">
      <div>
        <h1 className="font-bon_foyage text-5xl text-black">KYC Operations Terminal</h1>
        <p className="mt-3 max-w-3xl text-base leading-7 text-[#5A6465]">
          Review client and vendor identity verifications, verify secure uploaded documents, and approve or reject submissions under strict compliance policies.
        </p>
      </div>

      {/* Analytics KPI Row */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-[#ECE6D6] bg-white p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-widest text-[#858585]">Total Submissions</p>
          <p className="mt-2 text-3xl font-bold text-black">{submissionsList.length}</p>
        </div>
        <div className="rounded-2xl border border-[#ECE6D6] bg-[#01454A]/5 p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-widest text-[#01454A]">Pending Review</p>
          <p className="mt-2 text-3xl font-bold text-[#01454A]">
            {submissionsList.filter((s: any) => s.status === "pending" || s.status === "in_review").length}
          </p>
        </div>
        <div className="rounded-2xl border border-[#ECE6D6] bg-green-50 p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-widest text-green-700">Approved Users</p>
          <p className="mt-2 text-3xl font-bold text-green-800">
            {submissionsList.filter((s: any) => s.status === "approved").length}
          </p>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-[#ECE6D6] bg-white p-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email, or submission ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-11 w-full rounded-lg border border-[#ECE6D6] pl-10 pr-4 text-sm outline-none focus:border-[#01454A]"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-500">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-11 rounded-lg border border-[#ECE6D6] bg-white px-3 text-sm outline-none focus:border-[#01454A]"
          >
            <option value="all">All statuses</option>
            <option value="pending">Pending</option>
            <option value="in_review">In Review</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="resubmit">Resubmit</option>
          </select>
        </div>
      </div>

      {/* Main Submissions Table */}
      {isLoading ? (
        <div className="flex h-64 items-center justify-center rounded-2xl border border-[#ECE6D6] bg-white">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#01454A] border-t-transparent" />
            <p className="text-sm font-medium text-[#5A6465]">Loading verification queue...</p>
          </div>
        </div>
      ) : isError ? (
        <div className="flex h-64 flex-col items-center justify-center gap-4 rounded-2xl border border-red-100 bg-red-50 p-6 text-center">
          <AlertCircle className="h-12 w-12 text-red-500" />
          <div>
            <p className="text-lg font-bold text-red-800">Operational Gateway Error</p>
            <p className="mt-1 text-sm text-red-600">Failed to connect to `/api/v1/kyc/admin/submissions/` endpoint.</p>
          </div>
          <Button
            variant="danger"
            onClick={() => refetch()}
            className="px-4 py-2 text-sm font-bold"
          >
            Retry Connection
          </Button>
        </div>
      ) : filteredSubmissions.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center gap-3 rounded-2xl border border-[#ECE6D6] bg-[#F8F5ED]/50 p-8 text-center">
          <ShieldCheck className="h-12 w-12 text-[#858585]" />
          <p className="text-lg font-bold text-black">No submissions match current filters</p>
          <p className="max-w-md text-sm text-[#5A6465]">All client and vendor verifications have been fully reviewed or do not match your search query.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-[#ECE6D6] bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-[#ECE6D6] bg-[#F8F5ED] text-xs font-bold uppercase tracking-wider text-[#1A1208]">
                  <th className="px-6 py-4">User Details</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Submitted Date</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Docs</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ECE6D6]">
                {filteredSubmissions.map((sub: any) => {
                  const name = `${sub.user?.first_name || ""} ${sub.user?.last_name || ""}`.trim() || sub.user?.email || "Anonymous User";
                  const date = sub.submitted_at ? new Date(sub.submitted_at).toLocaleDateString("en-NG", { dateStyle: "medium" }) : "-N/A-";
                  const statusColors = {
                    approved: "bg-green-100 text-green-800 border-green-200",
                    pending: "bg-[#FDA600]/10 text-[#FDA600] border-[#FDA600]/20",
                    in_review: "bg-blue-100 text-blue-800 border-blue-200",
                    rejected: "bg-red-100 text-red-800 border-red-200",
                    resubmit: "bg-orange-100 text-orange-800 border-orange-200",
                    not_started: "bg-gray-100 text-gray-800 border-gray-200",
                  }[sub.status as string] || "bg-gray-100 text-gray-800 border-gray-200";

                  return (
                    <tr key={sub.id} className="hover:bg-[#F8F5ED]/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex size-10 items-center justify-center rounded-full bg-[#01454A]/10 text-[#01454A] overflow-hidden">
                            {sub.user?.avatar ? (
                              <FashionistarImage src={sub.user.avatar} alt={name} width={40} height={40} imgClassName="object-cover" />
                            ) : (
                              <User className="h-5 w-5" />
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-black">{name}</p>
                            <p className="text-xs text-gray-500">{sub.user?.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-800 capitalize">
                          {sub.user?.role || "Client"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{date}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${statusColors}`}>
                          {sub.status.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-medium text-black">
                          {sub.documents?.length || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedSubmission(sub);
                            setReviewNotes(sub.review_notes || "");
                            setAllowResubmit(sub.can_resubmit ?? true);
                          }}
                          className="inline-flex items-center gap-1.5 border border-[#ECE6D6] bg-white px-3 py-1.5 text-xs font-bold text-[#01454A] hover:bg-[#01454A] hover:text-white shadow-sm"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          Review Documents
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Review Dialog/Modal overlay */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in">
          <div className="relative flex flex-col w-full max-w-3xl rounded-[24px] bg-white border border-[#ECE6D6] shadow-2xl max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#ECE6D6] bg-[#F8F5ED] px-6 py-4">
              <div>
                <h3 className="text-xl font-bold text-black font-bon_foyage">KYC Document Verification</h3>
                <p className="text-xs text-[#5A6465] mt-1">Review applicant uploads and log compliance action.</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedSubmission(null)}
                className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 min-h-0 min-w-0"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* User Identity Details */}
              <div className="grid gap-4 sm:grid-cols-2 rounded-xl bg-[#F8F5ED]/40 p-4 border border-[#ECE6D6]">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#858585]">Applicant</p>
                  <p className="mt-1 text-base font-bold text-black">
                    {`${selectedSubmission.user?.first_name || ""} ${selectedSubmission.user?.last_name || ""}`.trim() || selectedSubmission.user?.email}
                  </p>
                  <p className="text-sm text-gray-500 mt-0.5">{selectedSubmission.user?.email}</p>
                </div>
                <div className="sm:border-l sm:border-[#ECE6D6] sm:pl-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#858585]">Role & Phone</p>
                  <p className="mt-1 text-sm font-semibold text-black capitalize">{selectedSubmission.user?.role || "Client"}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{selectedSubmission.user?.phone || "-N/A-"}</p>
                </div>
              </div>

              {/* Status and Ref details */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#858585]">Current Status</p>
                  <div className="mt-1">
                    <span className="inline-flex rounded-full border border-yellow-200 bg-[#FDA600]/10 px-2.5 py-0.5 text-xs font-semibold capitalize text-[#FDA600]">
                      {selectedSubmission.status.replace(/_/g, " ")}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#858585]">Submission ID</p>
                  <p className="mt-1 text-xs font-mono text-gray-600 select-all">{selectedSubmission.id}</p>
                </div>
              </div>

              {/* Documents Block */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-widest text-[#858585] mb-3">Uploaded Evidence</h4>
                {(!selectedSubmission.documents || selectedSubmission.documents.length === 0) ? (
                  <div className="rounded-xl border border-dashed border-[#ECE6D6] bg-gray-50 p-6 text-center text-sm text-gray-500">
                    No documents uploaded yet for this submission.
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {selectedSubmission.documents.map((doc: any) => {
                      const secureUrlStr = doc.secure_url || "";
                      const isImage = secureUrlStr.match(/\.(jpeg|jpg|gif|png|webp)/i);
                      return (
                        <div key={doc.id} className="flex flex-col gap-3 rounded-xl border border-[#ECE6D6] bg-white p-4 shadow-sm hover:border-[#01454A]/30 transition-all">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                              <FileText className="h-5 w-5 text-[#01454A]" />
                              <div>
                                <p className="text-sm font-bold text-black capitalize">
                                  {doc.document_type.replace(/_/g, " ")}
                                </p>
                                <p className="text-xs text-gray-500">
                                  Digit digits: {doc.document_number || "None"}
                                </p>
                              </div>
                            </div>
                            <span className="text-[10px] text-gray-400">
                              {doc.uploaded_at ? new Date(doc.uploaded_at).toLocaleDateString() : ""}
                            </span>
                          </div>

                           {doc.secure_url ? (
                             <div className="relative mt-2 h-32 w-full overflow-hidden rounded-lg bg-gray-100 border border-[#ECE6D6]">
                               {isImage ? (
                                 <FashionistarImage src={doc.secure_url} alt={doc.document_type} fill imgClassName="object-cover" />
                               ) : (
                                 <div className="flex h-full w-full items-center justify-center bg-gray-50 text-xs font-medium text-gray-500">
                                   Preview unavailable (Non-image type)
                                 </div>
                               )}
                             </div>
                           ) : null}

                          {doc.secure_url && (
                            <a
                              href={doc.secure_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-1 text-xs font-bold text-[#01454A] hover:underline"
                            >
                              Open Full Document ↗
                            </a>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Compliance decision block */}
              <div className="rounded-xl border border-[#ECE6D6] bg-[#F8F5ED]/30 p-4 space-y-4">
                <h4 className="text-sm font-bold text-black">Compliance Decision Form</h4>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">
                    Review / Rejection Notes <span className="text-red-500">* Required for Rejection</span>
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Enter review notes here..."
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    className="w-full rounded-lg border border-[#ECE6D6] bg-white p-3 text-sm outline-none focus:border-[#01454A]"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="allowResubmit"
                    checked={allowResubmit}
                    onChange={(e) => setAllowResubmit(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-[#01454A] focus:ring-[#01454A]"
                  />
                  <label htmlFor="allowResubmit" className="text-xs font-semibold text-gray-700 cursor-pointer select-none">
                    Allow applicant to re-upload documents if rejected
                  </label>
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-between border-t border-[#ECE6D6] bg-[#F8F5ED]/50 px-6 py-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setSelectedSubmission(null)}
                className="border border-[#ECE6D6] bg-white px-4 py-2 text-sm font-bold text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Button>

              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="danger"
                  disabled={rejectMutation.isPending || approveMutation.isPending}
                  onClick={() => handleReject(selectedSubmission.id)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-bold"
                >
                  <X className="h-4 w-4" />
                  {rejectMutation.isPending ? "Rejecting..." : "Reject Submission"}
                </Button>

                <Button
                  type="button"
                  variant="success"
                  disabled={rejectMutation.isPending || approveMutation.isPending}
                  onClick={() => handleApprove(selectedSubmission.id)}
                  className="inline-flex items-center gap-1.5 bg-[#01454A] px-4 py-2 text-sm font-bold text-white hover:bg-[#003438]"
                >
                  <Check className="h-4 w-4" />
                  {approveMutation.isPending ? "Approving..." : "Approve & Verify"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-bold uppercase tracking-widest text-[#858585]">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="mt-2 h-11 w-full rounded-[8px] border border-[#E5E7EB] px-3 text-sm outline-none focus:border-[#FDA600]"
      />
    </label>
  );
}
