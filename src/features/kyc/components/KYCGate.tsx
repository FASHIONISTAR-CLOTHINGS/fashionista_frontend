"use client";

/**
 * @file KYCGate.tsx
 * @description Fashionistar-branded KYC gatekeeper component.
 *
 * Renders one of 4 states based on the user's live KYC status:
 *   1. Loading   → Skeleton preloader
 *   2. Verified  → Compact verified banner (green shield)
 *   3. Pending   → In-review message
 *   4. Required  → Full CTA with dark gradient card
 *
 * Usage (wrapping a financial exit like Withdraw):
 *   <KYCGate>
 *     <WithdrawButton />
 *   </KYCGate>
 *
 * Usage (standalone):
 *   <KYCGate showContent={false} />
 */

import React from "react";
import { useRouter } from "next/navigation";
import { Shield, ShieldCheck, ShieldAlert, Clock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { useNinjaKycStatus } from "../hooks/use-kyc";

// ─── Types ────────────────────────────────────────────────────────────────────

interface KYCGateProps {
  children?: React.ReactNode;
  showContent?: boolean;
  className?: string;
  ctaText?: string;
  redirectPath?: string;
}

interface NinjaKycStatus {
  status: string;
  is_approved: boolean;
  document_count: number;
}

// ─── Inline UI Primitives ──────────────────────────────────────────────────────

function Card({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card text-card-foreground shadow-sm",
        className,
      )}
    >
      {children}
    </div>
  );
}

function CardContent({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <div className={cn("p-6", className)}>{children}</div>;
}

function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-muted",
        className,
      )}
      aria-hidden
    />
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function KYCGate({
  children,
  showContent = true,
  className,
  ctaText = "Verify My Identity",
  redirectPath = "/account/kyc",
}: KYCGateProps) {
  const router = useRouter();
  const { data, isLoading, isError } = useNinjaKycStatus();

  if (isLoading) {
    return (
      <div className={cn("w-full space-y-3", className)}>
        <Skeleton className="h-16 w-full rounded-xl" />
        <Skeleton className="h-4 w-3/4 rounded" />
        <Skeleton className="h-4 w-1/2 rounded" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <KYCRequired
        ctaText={ctaText}
        className={className}
        onCtaClick={() => router.push(redirectPath)}
      />
    );
  }

  const { status, is_approved, document_count } = data as NinjaKycStatus;

  if (is_approved) {
    if (showContent && children) {
      return <>{children}</>;
    }
    return (
      <KYCApprovedBanner className={className} documentCount={document_count} />
    );
  }

  if (status === "submitted" || status === "under_review") {
    return (
      <KYCPendingBanner className={className} documentCount={document_count} />
    );
  }

  return (
    <KYCRequired
      ctaText={ctaText}
      className={className}
      rejectionReason={
        status === "rejected"
          ? "Your previous submission was rejected. Please resubmit."
          : undefined
      }
      onCtaClick={() => router.push(redirectPath)}
    />
  );
}

// ─── Sub-Renders ──────────────────────────────────────────────────────────────

function KYCApprovedBanner({
  className,
  documentCount,
}: {
  className?: string;
  documentCount: number;
}) {
  return (
    <Card
      className={cn(
        "border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 dark:border-emerald-800 dark:from-emerald-950/30 dark:to-teal-950/30",
        className,
      )}
    >
      <CardContent className="flex items-center gap-4 p-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/30">
          <ShieldCheck className="h-6 w-6 text-white" />
        </div>
        <div>
          <p className="font-semibold text-emerald-700 dark:text-emerald-300">
            Identity Verified ✓
          </p>
          <p className="text-sm text-emerald-600/80 dark:text-emerald-400/80">
            {documentCount} document{documentCount !== 1 ? "s" : ""} verified
            · KYC approved
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function KYCPendingBanner({
  className,
  documentCount,
}: {
  className?: string;
  documentCount: number;
}) {
  return (
    <Card
      className={cn(
        "border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 dark:border-amber-800 dark:from-amber-950/30 dark:to-orange-950/30",
        className,
      )}
    >
      <CardContent className="flex items-center gap-4 p-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-amber-500 shadow-lg shadow-amber-500/30">
          <Clock className="h-6 w-6 text-white" />
        </div>
        <div>
          <p className="font-semibold text-amber-700 dark:text-amber-300">
            Verification In Progress ⏳
          </p>
          <p className="text-sm text-amber-600/80 dark:text-amber-400/80">
            {documentCount} document{documentCount !== 1 ? "s" : ""} submitted
            · Review takes 24–48 hours
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function KYCRequired({
  ctaText,
  className,
  rejectionReason,
  onCtaClick,
}: {
  ctaText: string;
  className?: string;
  rejectionReason?: string;
  onCtaClick: () => void;
}) {
  return (
    <Card
      className={cn(
        "border-rose-200/40 bg-gradient-to-br from-slate-900 via-purple-950/20 to-rose-950/20",
        className,
      )}
    >
      <CardContent className="flex flex-col items-center gap-6 py-8 text-center">
        {/* Icon */}
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-rose-500/20 blur-xl" />
          <div className="relative flex h-20 w-20 items-center justify-center rounded-full border border-rose-500/30 bg-gradient-to-br from-rose-600/20 to-purple-600/20">
            <ShieldAlert className="h-10 w-10 text-rose-400" />
          </div>
        </div>

        {/* Text */}
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-white">
            Identity Verification Required
          </h3>
          {rejectionReason ? (
            <p className="text-sm text-rose-400">{rejectionReason}</p>
          ) : null}
          <p className="max-w-sm text-sm text-slate-400">
            To access withdrawals and financial features, please complete our
            secure KYC identity verification. It takes less than 5 minutes.
          </p>
        </div>

        {/* Feature list */}
        <ul className="space-y-1 text-left text-sm text-slate-400">
          {[
            "🔒 Bank-grade document encryption",
            "🇳🇬 BVN / NIN verification",
            "⚡ Results within 24 hours",
          ].map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>

        {/* CTA */}
        <Button
          size="lg"
          className="w-full max-w-xs bg-gradient-to-r from-purple-600 to-rose-600 font-semibold text-white shadow-lg shadow-purple-500/25 transition-all hover:from-purple-500 hover:to-rose-500"
          onClick={onCtaClick}
        >
          <Shield className="mr-2 h-5 w-5" />
          {ctaText}
        </Button>

        <p className="text-xs text-slate-500">
          Secured by{" "}
          <span className="font-medium text-purple-400">Fashionistar</span> ·
          NDPR compliant
        </p>
      </CardContent>
    </Card>
  );
}

export default KYCGate;
