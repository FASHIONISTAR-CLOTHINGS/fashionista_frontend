"use client";

/**
 * @file EmailCaptureModal.tsx
 * @description Progressive email collection modal for exit-intent and scroll-depth.
 *
 * Psychological triggers:
 *   - Reciprocity: "Get 10% off your first order"
 *   - Commitment: Email capture advances relationship
 *   - Loss Aversion: "Don't miss out on exclusive deals"
 *
 * Behavior:
 *   - Desktop: Fires on mouseleave (exit intent)
 *   - Mobile: Fires at 50% scroll depth
 *   - Only fires once per session (sessionStorage flag)
 *   - Submits to POST /api/v1/ninja/public-engagement/email-capture/
 */

import { useEffect, useState, useCallback } from "react";
import { X, Mail, Gift, CheckCircle2 } from "lucide-react";
import { apiAsync } from "@/core/api/client.async";
import { toast } from "sonner";

const SESSION_KEY = "fashionistar_email_capture_shown";
const SCROLL_THRESHOLD = 0.5;

export function EmailCaptureModal() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const hasShown = useCallback(() => {
    if (typeof window === "undefined") return true;
    return Boolean(sessionStorage.getItem(SESSION_KEY));
  }, []);

  const markShown = useCallback(() => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem(SESSION_KEY, "1");
    }
  }, []);

  const openModal = useCallback(() => {
    if (hasShown()) return;
    markShown();
    setOpen(true);
  }, [hasShown, markShown]);

  // Exit intent detection (desktop)
  useEffect(() => {
    if (hasShown()) return;

    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0) {
        openModal();
      }
    };

    document.addEventListener("mouseleave", handleMouseLeave);
    return () => document.removeEventListener("mouseleave", handleMouseLeave);
  }, [hasShown, openModal]);

  // Scroll depth detection (mobile)
  useEffect(() => {
    if (hasShown()) return;

    const handleScroll = () => {
      const scrolled = window.scrollY / document.documentElement.scrollHeight;
      if (scrolled >= SCROLL_THRESHOLD) {
        openModal();
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [hasShown, openModal]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setSubmitting(true);
    try {
      await apiAsync
        .post("public-engagement/email-capture/", {
          json: {
            email: email.trim(),
            source: "exit_intent_modal",
          },
        })
        .json();
      setSubmitted(true);
      toast.success("Welcome aboard! Check your inbox for 10% off.");
      setTimeout(() => setOpen(false), 2500);
    } catch {
      toast.error("Something went wrong. Please try again later.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
      data-testid="email-capture-modal"
      onClick={() => setOpen(false)}
    >
      <div
        className="relative w-full max-w-md mx-4 rounded-3xl bg-white shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={() => setOpen(false)}
          className="absolute right-4 top-4 z-10 rounded-full p-1.5 text-muted-foreground hover:bg-muted transition"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        {/* Header gradient */}
        <div className="bg-gradient-to-br from-[#01454A] to-[#01454A]/80 px-8 py-10 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-[#FDA600]/20">
            <Gift size={28} className="text-[#FDA600]" />
          </div>
          <h2 className="font-bon_foyage text-2xl text-white">
            Get 10% Off Your First Order
          </h2>
          <p className="mt-2 text-sm text-white/80">
            Join Fashionistar for exclusive deals, style tips, and early access to new collections.
          </p>
        </div>

        {/* Body */}
        <div className="px-8 py-6">
          {submitted ? (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <CheckCircle2 size={40} className="text-green-600" />
              <p className="text-lg font-bold text-[#1A1208]">
                You&apos;re in! 🎉
              </p>
              <p className="text-sm text-muted-foreground">
                Check your inbox for your 10% discount code.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <Mail
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="h-12 w-full rounded-xl border border-[#01454A]/20 bg-white pl-10 pr-4 text-sm outline-none transition focus:border-[#01454A] focus:ring-2 focus:ring-[#01454A]/15"
                  aria-label="Email address"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#01454A] py-3.5 text-sm font-bold text-white shadow-md transition hover:brightness-110 disabled:opacity-60"
              >
                {submitting ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : (
                  "Claim My 10% Off"
                )}
              </button>
              <p className="text-center text-[10px] text-muted-foreground">
                By signing up you agree to receive marketing emails. Unsubscribe anytime.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
