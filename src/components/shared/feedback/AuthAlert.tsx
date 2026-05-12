/**
 * AuthAlert — Enterprise-Grade Unified Alert System
 *
 * A single, beautiful, animated alert component used across ALL auth pages:
 *   - LoginForm, RegisterForm, OTPVerifyForm, PasswordResetForm, GoogleSignIn
 *
 * Features:
 *  - 4 variants: error | success | warning | info
 *  - Brand-colour aware (FASHIONISTAR primary palette)
 *  - Smooth slide-down + fade-in entry animation
 *  - Auto-dismiss with countdown progress bar (configurable)
 *  - Manual dismiss button
 *  - Multi-sentence → bulleted list
 *  - Clickable backend API links (internal routes + external)
 *  - Fully accessible: role="alert", aria-live="assertive"
 *  - No external animation library required (CSS keyframes inline)
 *
 * Usage:
 *   <AuthAlert variant="error"   message="Invalid credentials." />
 *   <AuthAlert variant="success" message="OTP sent! Check your email." autoDismissMs={5000} />
 *   <AuthAlert variant="warning" message="Too many attempts. Try again in 30s." />
 *   <AuthAlert variant="info"    message="Verification required. Resend OTP below." />
 *
 * Or with full parsed error:
 *   <AuthAlert variant="error" parsed={parsedApiError} />
 */
"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { AlertCircle, CheckCircle2, AlertTriangle, Info, X, ExternalLink } from "lucide-react";
import type { ParsedApiError } from "@/lib/api/parseApiError";

// ── Types ─────────────────────────────────────────────────────────────────────

export type AlertVariant = "error" | "success" | "warning" | "info";

interface AuthAlertProps {
  /** Alert style variant */
  variant: AlertVariant;
  /** Plain string message (if not using `parsed`) */
  message?: string;
  /** Full parsed error from parseApiError() — takes precedence over `message` */
  parsed?: ParsedApiError;
  /** Auto-dismiss after N ms (0 = never dismiss) */
  autoDismissMs?: number;
  /** Show manual close button */
  dismissible?: boolean;
  /** Called when alert is dismissed */
  onDismiss?: () => void;
  /** Extra className for wrapper */
  className?: string;
}

// ── Config per variant ────────────────────────────────────────────────────────

const VARIANT_CONFIG: Record<
  AlertVariant,
  {
    icon: React.ReactNode;
    borderColor: string;
    bgColor: string;
    textColor: string;
    progressColor: string;
    iconColor: string;
  }
> = {
  error: {
    icon: <AlertCircle className="h-[18px] w-[18px] shrink-0 mt-0.5" aria-hidden />,
    borderColor: "border-red-300",
    bgColor: "bg-red-50",
    textColor: "text-red-800",
    progressColor: "bg-red-400",
    iconColor: "text-red-500",
  },
  success: {
    icon: <CheckCircle2 className="h-[18px] w-[18px] shrink-0 mt-0.5" aria-hidden />,
    borderColor: "border-emerald-300",
    bgColor: "bg-emerald-50",
    textColor: "text-emerald-800",
    progressColor: "bg-emerald-400",
    iconColor: "text-emerald-500",
  },
  warning: {
    icon: <AlertTriangle className="h-[18px] w-[18px] shrink-0 mt-0.5" aria-hidden />,
    borderColor: "border-amber-300",
    bgColor: "bg-amber-50",
    textColor: "text-amber-800",
    progressColor: "bg-amber-400",
    iconColor: "text-amber-500",
  },
  info: {
    icon: <Info className="h-[18px] w-[18px] shrink-0 mt-0.5" aria-hidden />,
    // Use brand primary (rose/pink) for info — matches FASHIONISTAR's brand
    borderColor: "border-rose-300",
    bgColor: "bg-rose-50",
    textColor: "text-rose-800",
    progressColor: "bg-rose-400",
    iconColor: "text-rose-500",
  },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function splitSentences(message: string): string[] {
  const parts = message
    .split(/\.\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
  return parts.length > 1 ? parts : [message];
}

function renderWithLinks(
  text: string,
  links: ParsedApiError["links"],
  linkClass: string,
): React.ReactNode {
  if (!links || links.length === 0) return text;
  const parts: React.ReactNode[] = [];
  let remaining = text;
  // Use entries() so each link gets a unique index — prevents duplicate React
  // keys when the same href appears in more than one rendered sentence.
  for (const [linkIdx, link] of links.entries()) {
    const idx = remaining.indexOf(link.text);
    if (idx === -1) continue;
    if (idx > 0) parts.push(remaining.slice(0, idx));
    const isInternal = link.href.startsWith("/");
    const uniqueKey = `${link.href}-${linkIdx}`;
    if (isInternal) {
      parts.push(
        <Link key={uniqueKey} href={link.href} className={linkClass}>
          {link.text}
        </Link>,
      );
    } else {
      parts.push(
        <a
          key={uniqueKey}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          className={`${linkClass} inline-flex items-center gap-0.5`}
        >
          {link.text}
          <ExternalLink className="h-3 w-3" />
        </a>,
      );
    }
    remaining = remaining.slice(idx + link.text.length);
  }
  if (remaining) parts.push(remaining);
  return <>{parts}</>;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function AuthAlert({
  ...props
}: AuthAlertProps) {
  const displayMessage = props.parsed?.message ?? props.message ?? "";

  if (!displayMessage) {
    return null;
  }

  return <AuthAlertContent key={displayMessage} {...props} />;
}

function AuthAlertContent({
  variant,
  message,
  parsed,
  autoDismissMs = 0,
  dismissible = true,
  onDismiss,
  className = "",
}: AuthAlertProps) {
  const [visible, setVisible] = useState(true);
  const [progress, setProgress] = useState(100);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Resolve display content
  const displayMessage = parsed?.message ?? message ?? "";
  const links: ParsedApiError["links"] = parsed?.links ?? [];

  // Auto-dismiss with countdown progress bar
  useEffect(() => {
    if (!autoDismissMs || autoDismissMs <= 0) return;
    const tick = 50; // ms per tick
    const steps = autoDismissMs / tick;
    let step = 0;
    intervalRef.current = setInterval(() => {
      step++;
      setProgress(Math.max(0, 100 - (step / steps) * 100));
      if (step >= steps) {
        clearInterval(intervalRef.current!);
        handleDismiss();
      }
    }, tick);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoDismissMs]);

  function handleDismiss() {
    setVisible(false);
    onDismiss?.();
  }

  if (!visible || !displayMessage) return null;

  const cfg = VARIANT_CONFIG[variant];
  const sentences = splitSentences(displayMessage);
  const isMulti = sentences.length > 1;
  const linkClass = `font-semibold underline underline-offset-2 ${cfg.textColor} hover:opacity-80 transition-opacity`;

  return (
    <>
      {/* Keyframe animations injected once */}
      <style>{`
        @keyframes auth-alert-in {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .auth-alert-enter {
          animation: auth-alert-in 0.22s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
      `}</style>

      <div
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
        className={`
          auth-alert-enter
          relative overflow-hidden rounded-xl border
          ${cfg.bgColor} ${cfg.borderColor}
          shadow-sm
          ${className}
        `}
      >
        <div className="flex items-start gap-3 px-4 py-3">
          {/* Icon */}
          <span className={cfg.iconColor}>{cfg.icon}</span>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {isMulti ? (
              <ul className={`list-disc list-inside space-y-0.5 text-sm ${cfg.textColor}`}>
                {sentences.map((s, i) => (
                  <li key={i} className="leading-snug">
                    {renderWithLinks(s, links, linkClass)}
                  </li>
                ))}
              </ul>
            ) : (
              <p className={`text-sm leading-snug ${cfg.textColor}`}>
                {renderWithLinks(displayMessage, links, linkClass)}
              </p>
            )}
          </div>

          {/* Dismiss button */}
          {dismissible && (
            <button
              type="button"
              onClick={handleDismiss}
              aria-label="Dismiss"
              className={`
                shrink-0 rounded-md p-0.5 -mr-1 -mt-0.5
                ${cfg.textColor} opacity-60 hover:opacity-100
                hover:bg-black/5 transition-all duration-150
              `}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Auto-dismiss countdown progress bar */}
        {autoDismissMs > 0 && (
          <div
            className={`absolute bottom-0 left-0 h-0.5 ${cfg.progressColor} transition-all ease-linear`}
            style={{ transitionDuration: '50ms', width: `${progress}%` }}
          />
        )}
      </div>
    </>
  );
}

// ── FieldError — inline form field error (unchanged API) ──────────────────────

export function FieldError({
  message,
  className = "",
}: {
  message?: string;
  className?: string;
}) {
  if (!message) return null;
  return (
    <p
      role="alert"
      className={`
        mt-0.5 flex items-center gap-1 text-xs text-destructive text-red-600
        animate-[auth-alert-in_0.15s_cubic-bezier(0.16,1,0.3,1)_both]
        ${className}
      `}
    >
      <AlertCircle className="h-3 w-3 shrink-0" aria-hidden />
      {message}
    </p>
  );
}
