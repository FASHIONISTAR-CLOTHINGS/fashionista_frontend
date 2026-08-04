"use client";

import { useEffect, useState } from "react";

export function ExitIntentPopup() {
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(() => {
    try {
      return Boolean(sessionStorage.getItem("fashionistar_exit_intent_shown"));
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (dismissed) return;

    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !dismissed) {
        setShow(true);
        try {
          sessionStorage.setItem("fashionistar_exit_intent_shown", "1");
        } catch {
          // sessionStorage not available
        }
      }
    };

    document.addEventListener("mouseleave", handleMouseLeave);
    return () => document.removeEventListener("mouseleave", handleMouseLeave);
  }, [dismissed]);

  if (!show || dismissed) return null;

  const handleClose = () => {
    setShow(false);
    setDismissed(true);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      data-testid="exit-intent-popup"
      onClick={handleClose}
    >
      <div
        className="relative mx-4 w-full max-w-md rounded-2xl border-2 border-[hsl(var(--brand-green))] bg-[hsl(var(--card))] p-8 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Close popup"
          data-testid="exit-intent-close"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="space-y-5 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[hsl(var(--accent))/0.15]">
            <svg className="h-8 w-8 text-[hsl(var(--accent))]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>

          <div>
            <h3 className="font-bon_foyage text-2xl text-foreground">Wait! Get Your First Measurement Free</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Join 10,000+ Fashionistar users who got their perfect fit. Enter your email for a free measurement session.
            </p>
          </div>

          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              handleClose();
            }}
          >
            <input
              type="email"
              required
              placeholder="Enter your email"
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-[hsl(var(--brand-green))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--brand-green))/0.2]"
              data-testid="exit-intent-email"
            />
            <button
              type="submit"
              className="w-full rounded-xl bg-[hsl(var(--accent))] px-6 py-3 text-sm font-bold text-black transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              data-testid="exit-intent-submit"
            >
              Claim My Free Session
            </button>
          </form>

          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <svg className="h-3.5 w-3.5 text-[hsl(var(--brand-green))]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              No credit card required
            </span>
            <span className="flex items-center gap-1">
              <svg className="h-3.5 w-3.5 text-[hsl(var(--brand-green))]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              2-minute setup
            </span>
            <span className="flex items-center gap-1">
              <svg className="h-3.5 w-3.5 text-[hsl(var(--brand-green))]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Privacy guaranteed
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
