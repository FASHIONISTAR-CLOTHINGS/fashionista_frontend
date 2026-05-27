"use client";

import { useState } from "react";
import {
  useAdminKycSubmissions,
  useApproveKyc as useQuickApproveKyc,
  useRejectKyc as useQuickRejectKyc,
  useMarkKycInReview as useMarkKycInReviewSync,
} from "../hooks";
import { toast } from "sonner";
import {
  CheckCircle2,
  XCircle,
  Shield,
  ShieldAlert,
  FileText,
  Search,
  Loader2,
  FileSearch,
} from "lucide-react";

export function KycDashboard() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string | null>(null);
  
  // Rejection notes and reference inputs
  const [reviewNotes, setReviewNotes] = useState("");
  const [allowResubmit, setAllowResubmit] = useState(true);
  const [providerReference, setProviderReference] = useState("");
  const [zoomUrl, setZoomUrl] = useState<string | null>(null);

  // ── Query: Fetch All KYC Submissions (Staff Only) ─────────────────────────
  const { data: submissionsData, isLoading, isError, refetch } = useAdminKycSubmissions({
    status: statusFilter !== "all" ? statusFilter : undefined,
    search: search.trim() || undefined,
    page: 1,
    page_size: 100,
  });

  const rawSubmissions = submissionsData?.results || [];

  // Find currently selected submission object
  const selectedSubmission = rawSubmissions.find((s: any) => s.id === selectedSubmissionId) || null;

  // ── Mutations ─────────────────────────────────────────────────────────────
  const approveMutation = useQuickApproveKyc();
  const rejectMutation = useQuickRejectKyc();
  const markInReviewMutation = useMarkKycInReviewSync();

  const handleApprove = (id: string) => {
    approveMutation.mutate({ submissionId: id, legalName: providerReference });
  };

  const handleReject = (id: string) => {
    if (!reviewNotes.trim()) {
      toast.error("Please supply review notes to clarify the rejection reason.");
      return;
    }
    rejectMutation.mutate({
      submissionId: id,
      notes: reviewNotes.trim(),
      allowResubmit: allowResubmit,
    });
  };

  const handleMarkInReview = (id: string) => {
    markInReviewMutation.mutate({ submissionId: id });
  };
  
  const formatDate = (isoString: string | null) => {
    if (!isoString) return "-N/A-";
    return new Date(isoString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
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
          {!isLoading && !isError && rawSubmissions.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-[#ECE6D6] bg-white rounded-2xl gap-2 flex-1">
              <FileSearch className="w-8 h-8 text-[#8A9596]" />
              <p className="font-bon_foyage text-lg text-black">Queue is clear</p>
              <p className="font-satoshi text-xs text-[#5A6465]">No submissions matching your filter choices.</p>
            </div>
          )}

          {/* List items */}
          {!isLoading && !isError && rawSubmissions.length > 0 && (
            <div className="space-y-3 flex-1 overflow-y-auto">
              {rawSubmissions.map((sub: any) => {
                const isSelected = sub.id === selectedSubmissionId;
                const userInitials = "U";
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
                      <div className="w-10 h-10 rounded-full bg-[#01454A]/5 border border-[#01454A]/10 text-[#01454A] font-bon_foyage text-sm flex items-center justify-center shrink-0">
                        {userInitials}
                      </div>

                      <div className="overflow-hidden space-y-0.5">
                        <h4 className="font-bon_foyage text-base text-black truncate leading-tight">
                          {sub.legal_name || "Bespoke Applicant"}
                        </h4>
                        <p className="font-satoshi text-[10px] text-[#8A9596] truncate">
                          {sub.user?.email || `ID: ${sub.user_id}`}
                        </p>
                        <p className="font-satoshi text-[9px] text-[#5A6465] flex items-center gap-1">
                          <FileText className="w-3 h-3 text-[#8A9596]" />
                          <span>Submitted</span>
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
                  <div className="w-14 h-14 rounded-2xl bg-[#01454A]/5 flex items-center justify-center text-[#01454A] font-bon_foyage text-xl">
                    U
                  </div>
                  <div>
                    <h4 className="font-bon_foyage text-2xl text-black leading-snug">
                      {selectedSubmission.legal_name || "Bespoke Applicant"}
                    </h4>
                    <p className="font-satoshi text-xs text-[#5A6465]">
                      User ID: <span className="font-bold text-[#01454A]">{selectedSubmission.user_id}</span>
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
                    <span className="font-semibold text-black block mt-0.5 truncate">{selectedSubmission.user?.email || "-N/A-"}</span>
                  </div>
                  <div className="bg-white border border-[#ECE6D6] p-3 rounded-xl">
                    <span className="text-[#8A9596] block">Member ID</span>
                    <span className="font-semibold text-black block mt-0.5">{selectedSubmission.user_id || "-N/A-"}</span>
                  </div>
                </div>

                {/* Status Indicator / Actions */}
                <div className="space-y-3.5">
                  <span className="font-satoshi text-xs font-bold uppercase text-[#5A6465] tracking-wide block">
                    Identity Verification
                  </span>
                  {selectedSubmission.status === "pending" && (
                    <button
                      onClick={() => handleMarkInReview(selectedSubmission.id)}
                      disabled={markInReviewMutation.isPending}
                      className="bg-[#01454A]/10 hover:bg-[#01454A]/20 text-[#01454A] font-bold text-xs px-4 py-2.5 rounded-xl transition"
                    >
                      {markInReviewMutation.isPending ? "Updating status..." : "Mark In Review"}
                    </button>
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
                        <span className="text-[10px] font-bold uppercase text-[#8A9596]">Legal Name Audit Confirm</span>
                        <input
                          type="text"
                          placeholder="Confirm legal name matches..."
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
                      <span className="text-[10px] font-bold uppercase text-[#8A9596] block">Rejection Notes (Required)</span>
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
