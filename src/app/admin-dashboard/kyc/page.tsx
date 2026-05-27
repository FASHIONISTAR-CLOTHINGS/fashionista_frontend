"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiSync } from "@/core/api/client.sync";
import { toast } from "sonner";
import {
  CheckCircle2,
  XCircle,
  Shield,
  ShieldAlert,
  FileText,
  Search,
  ZoomIn,
  AlertTriangle,
  Loader2,
  FileSearch
} from "lucide-react";

interface UserCompact {
  id: string;
  email: string | null;
  phone: string | null;
  first_name: string;
  last_name: string;
  role: string;
  avatar: string | null;
}

interface KycDocument {
  id: string;
  document_type: string;
  document_number: string | null;
  secure_url: string;
  public_id: string;
  provider_verified: boolean;
  provider_response: string | null;
  uploaded_at: string;
}

interface KycSubmission {
  id: string;
  user: UserCompact;
  status: "pending" | "in_review" | "approved" | "rejected" | "resubmit";
  is_approved: boolean;
  is_pending: boolean;
  is_rejected: boolean;
  can_resubmit: boolean;
  review_notes: string;
  provider_reference: string;
  submitted_at: string;
  reviewed_at: string | null;
  documents: KycDocument[];
  created_at: string;
  updated_at: string;
}

export default function AdminKycPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string | null>(null);
  
  // Rejection notes and reference inputs
  const [reviewNotes, setReviewNotes] = useState("");
  const [allowResubmit, setAllowResubmit] = useState(true);
  const [providerReference, setProviderReference] = useState("");
  const [zoomUrl, setZoomUrl] = useState<string | null>(null);

  // ── Query: Fetch All KYC Submissions (Staff Only) ─────────────────────────
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["admin", "kyc-submissions"],
    queryFn: async () => {
      const response = await apiSync.get("v1/kyc/admin/submissions/");
      return response.data; // Unwrapped by client.sync.ts response interceptor
    },
    staleTime: 15_000,
  });

  const rawSubmissions: KycSubmission[] = Array.isArray(data)
    ? data
    : (data as any)?.results || [];

  // Find currently selected submission object
  const selectedSubmission = rawSubmissions.find((s) => s.id === selectedSubmissionId) || null;

  // ── Mutation: Approve KYC Submission ──────────────────────────────────────
  const approveMutation = useMutation({
    mutationFn: async ({ submissionId, providerRef }: { submissionId: string; providerRef?: string }) => {
      const response = await apiSync.post(`v1/kyc/admin/${submissionId}/approve/`, {
        provider_reference: providerRef || ""
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success("KYC submission approved successfully! User's identity is verified.");
      void queryClient.invalidateQueries({ queryKey: ["admin", "kyc-submissions"] });
      setSelectedSubmissionId(null);
      setProviderReference("");
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.detail || err?.message || "Failed to approve KYC.";
      toast.error(msg);
    }
  });

  // ── Mutation: Reject KYC Submission ──────────────────────────────────────
  const rejectMutation = useMutation({
    mutationFn: async ({
      submissionId,
      notes,
      allowResub
    }: {
      submissionId: string;
      notes: string;
      allowResub: boolean;
    }) => {
      const response = await apiSync.post(`v1/kyc/admin/${submissionId}/reject/`, {
        review_notes: notes,
        allow_resubmit: allowResub
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success("KYC submission rejected successfully. Review notes recorded.");
      void queryClient.invalidateQueries({ queryKey: ["admin", "kyc-submissions"] });
      setSelectedSubmissionId(null);
      setReviewNotes("");
      setAllowResubmit(true);
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.detail || err?.message || "Failed to reject KYC.";
      toast.error(msg);
    }
  });

  // Filter Submissions
  const filteredSubmissions = rawSubmissions.filter((sub) => {
    // 1. Text Search matches legal name, email, or user ID
    const searchLower = search.toLowerCase();
    const fullName = `${sub.user.first_name || ""} ${sub.user.last_name || ""}`.toLowerCase();
    const matchesSearch =
      !search ||
      fullName.includes(searchLower) ||
      (sub.user.email || "").toLowerCase().includes(searchLower) ||
      sub.user.id.toLowerCase().includes(searchLower);

    // 2. Status Filter
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "pending" && sub.status === "pending") ||
      (statusFilter === "approved" && sub.status === "approved") ||
      (statusFilter === "rejected" && (sub.status === "rejected" || sub.status === "resubmit"));

    return matchesSearch && matchesStatus;
  });

  const handleApprove = (id: string) => {
    approveMutation.mutate({ submissionId: id, providerRef: providerReference });
  };

  const handleReject = (id: string) => {
    if (!reviewNotes.trim()) {
      toast.error("Please supply review notes to clarify the rejection reason.");
      return;
    }
    rejectMutation.mutate({
      submissionId: id,
      notes: reviewNotes.trim(),
      allowResub: allowResubmit
    });
  };

  const formatDocName = (type: string) => {
    return type.replace(/_/g, " ").toUpperCase();
  };

  const formatDate = (isoString: string | null) => {
    if (!isoString) return "-N/A-";
    return new Date(isoString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const getStatusBadgeStyles = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "pending":
      case "in_review":
        return "bg-amber-50 text-[#FDA600] border-amber-200 animate-pulse";
      case "rejected":
      case "resubmit":
        return "bg-red-50 text-red-600 border-red-200";
      default:
        return "bg-gray-50 text-gray-500 border-gray-200";
    }
  };

  return (
    <div className="space-y-10 bg-inherit min-h-screen pb-12">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-bon_foyage text-4xl text-black md:text-5xl">
            KYC Verification Desk
          </h3>
          <p className="font-satoshi text-sm text-[#5A6465] mt-1">
            Review user-submitted legal identification documents, crosscheck biometric registries, and approve platform verification.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => refetch()}
            className="border border-[#ECE6D6] bg-white hover:bg-[#F4F3EC] text-black font-satoshi font-bold transition-all duration-200 px-5 py-3 rounded-xl shadow-sm text-sm"
          >
            Refetch Queue
          </button>
        </div>
      </div>

      {/* Split Moderation Workplace */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: List/Queue Selection (5 Columns) */}
        <div className="xl:col-span-5 bg-[#F8F5ED]/40 border border-[#ECE6D6] rounded-[32px] p-6 space-y-5 h-[calc(100vh-220px)] overflow-y-auto flex flex-col justify-start">
          <span className="font-satoshi text-xs font-bold uppercase tracking-wider text-[#5A6465]">
            Submission Verification Queue
          </span>

          {/* Keyword Search & Selector */}
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A9596]" />
              <input
                type="text"
                placeholder="Search legal name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-11 pl-10 pr-4 bg-white border border-[#ECE6D6] focus:border-[#01454A] rounded-xl outline-none font-satoshi text-xs text-black placeholder:text-[#8A9596] transition-all"
              />
            </div>

            <div className="flex gap-2">
              {["all", "pending", "approved", "rejected"].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`flex-1 py-1.5 rounded-lg border text-[10px] font-bold uppercase tracking-wider transition font-satoshi ${
                    statusFilter === status
                      ? "bg-[#01454A] text-white border-[#01454A]"
                      : "bg-white text-black border-[#ECE6D6] hover:bg-[#F4F3EC]"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* Loading state inside queue */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="w-8 h-8 text-[#01454A] animate-spin" />
              <span className="font-satoshi text-xs text-[#5A6465] animate-pulse">Loading queue submissions...</span>
            </div>
          )}

          {isError && (
            <div className="text-center py-10 space-y-3">
              <ShieldAlert className="w-8 h-8 text-red-500 mx-auto" />
              <p className="font-satoshi text-xs text-[#5A6465]">Failed to retrieve queue submissions.</p>
            </div>
          )}

          {/* Empty queue state */}
          {!isLoading && !isError && filteredSubmissions.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-[#ECE6D6] bg-white rounded-2xl gap-2 flex-1">
              <FileSearch className="w-8 h-8 text-[#8A9596]" />
              <p className="font-bon_foyage text-lg text-black">Queue is clear</p>
              <p className="font-satoshi text-xs text-[#5A6465]">No submissions matching your filter choices.</p>
            </div>
          )}

          {/* List items */}
          {!isLoading && !isError && filteredSubmissions.length > 0 && (
            <div className="space-y-3 flex-1 overflow-y-auto">
              {filteredSubmissions.map((sub) => {
                const isSelected = sub.id === selectedSubmissionId;
                const userInitials = `${sub.user.first_name?.[0] || ""}${sub.user.last_name?.[0] || ""}`.toUpperCase() || "U";
                return (
                  <div
                    key={sub.id}
                    onClick={() => {
                      setSelectedSubmissionId(sub.id);
                      setReviewNotes(sub.review_notes || "");
                      setProviderReference(sub.provider_reference || "");
                    }}
                    className={`border rounded-2xl p-4 cursor-pointer transition-all duration-200 flex items-center justify-between gap-3 ${
                      isSelected
                        ? "bg-white border-[#01454A] shadow-sm"
                        : "bg-white/60 border-[#ECE6D6] hover:bg-white hover:border-[#8A9596]"
                    }`}
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      {sub.user.avatar ? (
                        <img
                          src={sub.user.avatar}
                          alt=""
                          className="w-10 h-14 rounded-xl object-cover shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-[#01454A]/5 border border-[#01454A]/10 text-[#01454A] font-bon_foyage text-sm flex items-center justify-center shrink-0">
                          {userInitials}
                        </div>
                      )}

                      <div className="overflow-hidden space-y-0.5">
                        <h4 className="font-bon_foyage text-base text-black truncate leading-tight">
                          {sub.user.first_name || sub.user.last_name
                            ? `${sub.user.first_name} ${sub.user.last_name}`
                            : "Anonymous Builder"}
                        </h4>
                        <p className="font-satoshi text-[10px] text-[#8A9596] truncate">
                          {sub.user.email}
                        </p>
                        <p className="font-satoshi text-[9px] text-[#5A6465] flex items-center gap-1">
                          <FileText className="w-3 h-3 text-[#8A9596]" />
                          <span>{sub.documents.length} document(s) uploaded</span>
                        </p>
                      </div>
                    </div>

                    {/* Status badges */}
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${getStatusBadgeStyles(sub.status)}`}>
                        {sub.status}
                      </span>
                      <span className="text-[8px] font-satoshi text-[#8A9596]">
                        {formatDate(sub.submitted_at).split(",")[0]}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Live Inspection & Decision Desk (7 Columns) */}
        <div className="xl:col-span-7 bg-[#F8F5ED]/40 border border-[#ECE6D6] rounded-[32px] p-6 md:p-8 h-[calc(100vh-220px)] overflow-y-auto flex flex-col justify-start">
          
          {/* Empty workspace state */}
          {!selectedSubmission ? (
            <div className="flex flex-col items-center justify-center text-center m-auto max-w-md py-12 gap-4">
              <div className="w-16 h-16 bg-[#01454A]/5 border border-[#01454A]/10 rounded-[20px] text-[#01454A] flex items-center justify-center">
                <Shield className="w-8 h-8 text-[#01454A]" />
              </div>
              <div className="space-y-1.5">
                <h4 className="font-bon_foyage text-2xl text-black">
                  Inspector Desk Workspace
                </h4>
                <p className="font-satoshi text-xs text-[#5A6465] leading-relaxed">
                  Select a candidate from the left queue. The system will load their full biography details, submitted BVN/NIN hashes, and retrieve identity file assets uploaded to secure Cloudinary buckets.
                </p>
              </div>
            </div>
          ) : (
            // Inspection Workspace
            <div className="space-y-6 flex-1 flex flex-col justify-between">
              
              {/* Applicant Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-[#ECE6D6]/80 pb-4 gap-4">
                <div className="flex items-center gap-4">
                  {selectedSubmission.user.avatar ? (
                    <img
                      src={selectedSubmission.user.avatar}
                      alt=""
                      className="w-14 h-14 rounded-2xl object-cover border border-[#ECE6D6]"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-2xl bg-[#01454A]/5 flex items-center justify-center text-[#01454A] font-bon_foyage text-xl">
                      {`${selectedSubmission.user.first_name?.[0] || ""}${selectedSubmission.user.last_name?.[0] || ""}`.toUpperCase() || "U"}
                    </div>
                  )}
                  <div>
                    <h4 className="font-bon_foyage text-2xl text-black leading-snug">
                      {selectedSubmission.user.first_name} {selectedSubmission.user.last_name}
                    </h4>
                    <p className="font-satoshi text-xs text-[#5A6465]">
                      Account role: <span className="font-bold uppercase text-[#01454A]">{selectedSubmission.user.role}</span>
                    </p>
                  </div>
                </div>

                <div className="flex flex-col md:items-end gap-1 font-satoshi text-xs text-[#8A9596]">
                  <span className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full border text-center ${getStatusBadgeStyles(selectedSubmission.status)}`}>
                    QUEUE STATUS: {selectedSubmission.status}
                  </span>
                  <span>Submitted: {formatDate(selectedSubmission.submitted_at)}</span>
                </div>
              </div>

              {/* Document previews & Legal detail list */}
              <div className="space-y-6 flex-1">
                
                {/* Contact coordinates list */}
                <div className="grid grid-cols-2 gap-4 text-xs font-satoshi">
                  <div className="bg-white border border-[#ECE6D6] p-3 rounded-xl">
                    <span className="text-[#8A9596] block">Applicant Email</span>
                    <span className="font-semibold text-black block mt-0.5 truncate">{selectedSubmission.user.email || "-N/A-"}</span>
                  </div>
                  <div className="bg-white border border-[#ECE6D6] p-3 rounded-xl">
                    <span className="text-[#8A9596] block">Contact Mobile</span>
                    <span className="font-semibold text-black block mt-0.5">{selectedSubmission.user.phone || "-N/A-"}</span>
                  </div>
                </div>

                {/* Secure ID documents gallery review */}
                <div className="space-y-3.5">
                  <span className="font-satoshi text-xs font-bold uppercase text-[#5A6465] tracking-wide block">
                    Cloudinary Identification Assets ({selectedSubmission.documents.length})
                  </span>

                  {selectedSubmission.documents.length === 0 ? (
                    <div className="bg-amber-50/50 border border-amber-200 rounded-2xl p-5 flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-[#FDA600] shrink-0 mt-0.5" />
                      <div className="font-satoshi text-xs text-[#5A6465] space-y-1">
                        <p className="font-semibold text-black">No documents recorded</p>
                        <p>This user has declared their KYC intent but hasn't uploaded any verification assets to Cloudinary yet.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedSubmission.documents.map((doc) => (
                        <div
                          key={doc.id}
                          className="bg-white border border-[#ECE6D6] rounded-2xl p-4 space-y-3 flex flex-col justify-between group"
                        >
                          <div className="space-y-1.5 font-satoshi">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-extrabold text-[#01454A]">
                                {formatDocName(doc.document_type)}
                              </span>
                              {doc.provider_verified && (
                                <span className="bg-emerald-50 text-emerald-700 font-extrabold text-[8px] px-1.5 py-0.5 rounded">
                                  REGISTRY VERIFIED
                                </span>
                              )}
                            </div>
                            {doc.document_number && (
                              <p className="text-[10px] text-[#5A6465] font-mono bg-[#F8F5ED] px-2 py-0.5 rounded border border-[#ECE6D6]/40 inline-block">
                                ID ending: ...{doc.document_number}
                              </p>
                            )}
                          </div>

                          {/* Image preview box */}
                          <div className="relative h-44 w-full bg-[#F8F5ED] rounded-xl overflow-hidden border border-[#ECE6D6] flex items-center justify-center group-hover:border-[#01454A] transition-all duration-200">
                            {doc.secure_url ? (
                              <>
                                <img
                                  src={doc.secure_url}
                                  alt=""
                                  className="w-full h-full object-contain"
                                />
                                <button
                                  onClick={() => setZoomUrl(doc.secure_url)}
                                  className="absolute bottom-2.5 right-2.5 p-1.5 rounded-lg bg-black/60 text-white hover:bg-black transition-colors flex items-center gap-1 text-[10px] font-bold"
                                >
                                  <ZoomIn className="w-3.5 h-3.5" />
                                  Zoom Card
                                </button>
                              </>
                            ) : (
                              <div className="text-center p-4">
                                <FileText className="w-8 h-8 text-[#8A9596] mx-auto mb-1" />
                                <span className="text-[10px] font-bold text-[#8A9596]">No URL stored</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Administrative Decisions Panel */}
              <div className="pt-6 border-t border-[#ECE6D6]/80 bg-inherit space-y-5">
                <span className="font-satoshi text-xs font-bold uppercase text-[#5A6465] tracking-wider block">
                  Moderator Action Desk
                </span>

                {/* Approve Sub-panel */}
                <div className="bg-white border border-[#ECE6D6] rounded-2xl p-4 space-y-4">
                  <div className="flex items-center gap-2 text-emerald-700 font-bon_foyage text-lg border-b border-[#ECE6D6]/40 pb-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span>Approve Identity Submission</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
                    <div className="md:col-span-2">
                      <label className="block font-satoshi">
                        <span className="text-[10px] font-bold uppercase text-[#8A9596]">Provider Audit Reference</span>
                        <input
                          type="text"
                          placeholder="SmileID job reference or legal code..."
                          value={providerReference}
                          onChange={(e) => setProviderReference(e.target.value)}
                          className="w-full h-10 mt-1 px-3 bg-[#F8F5ED]/50 border border-[#ECE6D6] focus:border-[#01454A] rounded-xl outline-none text-xs text-black transition-all"
                        />
                      </label>
                    </div>
                    
                    <button
                      onClick={() => handleApprove(selectedSubmission.id)}
                      disabled={approveMutation.isPending || rejectMutation.isPending}
                      className="w-full h-10 mt-5 bg-[#01454A] hover:bg-[#01454A]/90 text-[#F8F5ED] hover:text-[#FDA600] font-satoshi font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition duration-200 disabled:opacity-50"
                    >
                      {approveMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          Approve Identity
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Reject Sub-panel */}
                <div className="bg-white border border-[#ECE6D6] rounded-2xl p-4 space-y-4">
                  <div className="flex items-center gap-2 text-red-600 font-bon_foyage text-lg border-b border-[#ECE6D6]/40 pb-2">
                    <XCircle className="w-5 h-5 text-red-500" />
                    <span>Reject Identity Submission</span>
                  </div>

                  <div className="space-y-4">
                    <label className="block font-satoshi">
                      <span className="text-[10px] font-bold uppercase text-[#8A9596] block">Rejection Notes / Explanatory Review Notes (Required)</span>
                      <textarea
                        rows={2}
                        placeholder="NIN document is blurry. Please provide high resolution snapshot in JPG/PNG format..."
                        value={reviewNotes}
                        onChange={(e) => setReviewNotes(e.target.value)}
                        className="w-full mt-1.5 p-3 bg-[#F8F5ED]/50 border border-[#ECE6D6] focus:border-red-400 rounded-xl outline-none text-xs text-black transition-all leading-relaxed"
                      />
                    </label>

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <label className="flex items-center gap-2.5 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={allowResubmit}
                          onChange={(e) => setAllowResubmit(e.target.checked)}
                          className="w-4 h-4 rounded text-red-600 focus:ring-red-400 accent-red-600 cursor-pointer"
                        />
                        <span className="font-satoshi text-xs text-[#5A6465] font-medium">
                          Allow resubmission through mobile/app
                        </span>
                      </label>

                      <button
                        onClick={() => handleReject(selectedSubmission.id)}
                        disabled={approveMutation.isPending || rejectMutation.isPending}
                        className="bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 font-satoshi font-bold text-xs py-2.5 px-6 rounded-xl transition duration-200 flex items-center justify-center gap-1.5 disabled:opacity-50"
                      >
                        {rejectMutation.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <XCircle className="w-4 h-4" />
                            Reject Submission
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          )}
        </div>

      </div>

      {/* Cloudinary Full Screen Zoom Modal */}
      {zoomUrl && (
        <div
          onClick={() => setZoomUrl(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 cursor-pointer"
        >
          <div className="relative max-w-4xl max-h-[90vh] bg-white rounded-3xl overflow-hidden p-3 border border-[#ECE6D6] shadow-2xl flex items-center justify-center animate-in zoom-in-95 duration-200">
            <img
              src={zoomUrl}
              alt="Zoomed identification document"
              className="max-w-full max-h-[85vh] object-contain rounded-2xl"
            />
            <div className="absolute top-4 right-4 bg-black/60 text-white font-satoshi text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
              Click Anywhere To Close
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
