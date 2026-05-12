"use client";

/**
 * @file KycStatusView.tsx
 * @description KYC status surface for client, vendor, and admin routes.
 * Updated to use the high-performance async Ninja endpoint.
 */
import { ShieldCheck } from "lucide-react";
import { useState } from "react";
import {
  useInitiateKyc,
  useNinjaKycStatus,
  useRecordKycDocument,
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
  const showForms = audience !== "admin";

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

      {showForms && (
        <section className="grid gap-4 lg:grid-cols-2">
          <form onSubmit={submitKyc} className="rounded-[8px] border border-[#E5E7EB] bg-white p-6 shadow-card_shadow">
            <p className="text-lg font-semibold text-black">Start identity verification</p>
            <p className="mt-1 text-sm text-[#5A6465]">BVN/NIN values are hashed server-side and only last-four markers are retained.</p>
            <div className="mt-5 space-y-4">
              <Input label="NIN" value={nin} onChange={setNin} placeholder="11-digit NIN" />
              <Input label="BVN" value={bvn} onChange={setBvn} placeholder="11-digit BVN" />
            </div>
            <button
              type="submit"
              disabled={initiate.isPending}
              className="mt-5 h-12 w-full rounded-[8px] bg-[#FDA600] text-sm font-bold text-white disabled:opacity-60"
            >
              {initiate.isPending ? "Submitting..." : "Submit KYC"}
            </button>
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
            <button
              type="submit"
              disabled={recordDocument.isPending}
              className="mt-5 h-12 w-full rounded-[8px] bg-black text-sm font-bold text-white disabled:opacity-60"
            >
              {recordDocument.isPending ? "Recording..." : "Record Document"}
            </button>
          </form>
        </section>
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
