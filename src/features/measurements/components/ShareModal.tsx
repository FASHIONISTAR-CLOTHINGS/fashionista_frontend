"use client";

/**
 * features/measurements/components/ShareModal.tsx
 * Generates and manages measurement share tokens (GDPR-compliant).
 * Integration: POST /api/v1/ninja/measurements/{id}/share/
 *              → returns { token, share_url, expires_at, consent_granted }
 * Backend model: apps/measurements/models/scan.py → MeasurementShareToken
 */

import { useState, useCallback } from "react";
import { Modal, Button } from "@/shared/ui";
import ky from "ky";

interface ShareToken {
  token: string;
  share_url: string;
  expires_at: string;
  consent_granted: boolean;
}

interface ShareModalProps {
  measurementId: string | null;
  measurementName?: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ShareModal({ measurementId, measurementName, isOpen, onClose }: ShareModalProps) {
  const [token, setToken] = useState<ShareToken | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [consentChecked, setConsentChecked] = useState(false);

  const generateToken = useCallback(async () => {
    if (!measurementId || !consentChecked) return;
    setIsGenerating(true);
    setError(null);

    try {
      const data = await ky.post(
        `/api/v1/ninja/measurements/${measurementId}/share/`,
        { json: { consent_granted: true, expires_in_hours: 72 } }
      ).json<ShareToken>();
      setToken(data);
    } catch {
      setError("Could not generate share link. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  }, [measurementId, consentChecked]);

  const handleCopy = async () => {
    if (!token) return;
    await navigator.clipboard.writeText(token.share_url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleRevoke = async () => {
    if (!token) return;
    try {
      await ky.delete(`/api/v1/ninja/measurements/${measurementId}/share/${token.token}/`);
      setToken(null);
      setConsentChecked(false);
    } catch {
      setError("Could not revoke. Please try again.");
    }
  };

  const handleClose = () => {
    setToken(null);
    setConsentChecked(false);
    setError(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Share Measurements"
      size="md"
    >
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-white/4 border border-white/8">
          <span className="text-2xl">📏</span>
          <div>
            <p className="text-sm font-semibold text-white">{measurementName ?? "My Measurements"}</p>
            <p className="text-xs text-slate-400">Share securely with your tailor or vendor</p>
          </div>
        </div>

        {!token ? (
          <>
            {/* Benefits */}
            <div className="space-y-2">
              {[
                { icon: "🔒", text: "Encrypted link — only the recipient can view" },
                { icon: "⏰", text: "Auto-expires in 72 hours for your privacy" },
                { icon: "🚫", text: "No personal contact info is shared — measurements only" },
              ].map(({ icon, text }) => (
                <div key={text} className="flex items-start gap-2.5 text-xs text-slate-400">
                  <span className="text-sm flex-shrink-0">{icon}</span>
                  <span>{text}</span>
                </div>
              ))}
            </div>

            {/* GDPR Consent */}
            <label className="flex items-start gap-3 cursor-pointer group">
              <div className="relative mt-0.5">
                <input
                  type="checkbox"
                  checked={consentChecked}
                  onChange={(e) => setConsentChecked(e.target.checked)}
                  className="sr-only"
                  id="share-consent-checkbox"
                />
                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                  consentChecked ? "bg-amber-500 border-amber-500" : "border-white/30 group-hover:border-white/50"
                }`}>
                  {consentChecked && <span className="text-xs text-white font-bold">✓</span>}
                </div>
              </div>
              <span className="text-xs text-slate-400 leading-relaxed">
                I consent to sharing my measurement data with the selected recipient.
                I understand this is GDPR Article 6(1)(a) lawful processing and I can
                revoke access at any time.
              </span>
            </label>

            {error && (
              <p className="text-xs text-red-400 bg-red-500/10 rounded-xl px-3 py-2">{error}</p>
            )}

            <Button
              onClick={generateToken}
              isLoading={isGenerating}
              disabled={!consentChecked || isGenerating}
              className="w-full"
              id="share-generate-btn"
            >
              Generate Share Link
            </Button>
          </>
        ) : (
          <>
            {/* Share link */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">Share Link</p>
              <div className="flex gap-2">
                <input
                  readOnly
                  value={token.share_url}
                  className="flex-1 h-10 px-3 rounded-xl bg-white/8 border border-white/15 text-sm text-white font-mono truncate text-[11px]"
                  id="share-url-input"
                  aria-label="Share URL"
                />
                <Button
                  onClick={handleCopy}
                  variant={copied ? "success" : "secondary"}
                  size="md"
                  id="share-copy-btn"
                >
                  {copied ? "✓ Copied!" : "Copy"}
                </Button>
              </div>
            </div>

            {/* Expiry */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">
                Expires: <span className="text-white">
                  {new Date(token.expires_at).toLocaleString("en-NG", {
                    dateStyle: "medium", timeStyle: "short",
                  })}
                </span>
              </span>
              <button
                onClick={handleRevoke}
                className="text-red-400 hover:text-red-300 transition-colors"
                id="share-revoke-btn"
              >
                Revoke Access
              </button>
            </div>

            {/* Security notice */}
            <div className="p-3 rounded-xl bg-emerald-500/8 border border-emerald-500/20 text-xs text-emerald-400">
              🔒 This link is encrypted and visible only to your chosen recipient.
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
