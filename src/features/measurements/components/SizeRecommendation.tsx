"use client";

/**
 * features/measurements/components/SizeRecommendation.tsx
 * AI-powered size recommendation display.
 * Backend: apps/measurements/models/ai_recommendation.py → SizeRecommendationRequest
 * API: POST /api/v1/ninja/measurements/size-recommendation/ → { size, confidence, notes }
 */

import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import ky from "ky";
import { Card, LoadingSpinner, Badge } from "@/shared/ui";

interface SizeRecommendationResult {
  recommended_size: string;
  size_system: string;
  confidence_score: number;
  fit_notes: string;
  alternative_sizes?: string[];
  measurements_used: string[];
}

interface SizeRecommendationProps {
  productId: string;
  measurementProfileId?: string | null;
  productCategory?: string;
  className?: string;
}

export function SizeRecommendation({
  productId,
  measurementProfileId,
  productCategory = "general",
  className = "",
}: SizeRecommendationProps) {
  const [result, setResult] = useState<SizeRecommendationResult | null>(null);

  const { mutate, isPending, isError, error } = useMutation({
    mutationFn: async () => {
      return ky.post("/api/v1/ninja/measurements/size-recommendation/", {
        json: {
          product_id: productId,
          measurement_profile_id: measurementProfileId,
          product_category: productCategory,
        },
      }).json<SizeRecommendationResult>();
    },
    onSuccess: (data) => setResult(data),
  });

  const confidenceColor = (score: number) =>
    score >= 90 ? "success" : score >= 70 ? "warning" : "danger";

  // ── Not yet fetched ───────────────────────────────────────────────────────
  if (!result && !isPending) {
    return (
      <button
        onClick={() => mutate()}
        className="flex items-center gap-2 text-xs text-amber-400 hover:text-amber-300 transition-colors group"
        id="size-recommendation-btn"
      >
        <span className="w-5 h-5 rounded-full bg-amber-500/15 flex items-center justify-center text-[10px] group-hover:bg-amber-500/25 transition-colors">
          ✨
        </span>
        {measurementProfileId ? "Get AI Size Recommendation" : "Get Your Size"}
      </button>
    );
  }

  // ── Loading ───────────────────────────────────────────────────────────────
  if (isPending) {
    return (
      <div className={`flex items-center gap-2 py-2 ${className}`}>
        <LoadingSpinner size="sm" />
        <span className="text-xs text-slate-400">AI is calculating your best fit…</span>
      </div>
    );
  }

  // ── Error ─────────────────────────────────────────────────────────────────
  if (isError) {
    return (
      <p className="text-xs text-red-400">
        Could not get recommendation.{" "}
        <button onClick={() => mutate()} className="underline hover:text-red-300">
          Try again
        </button>
      </p>
    );
  }

  // ── Result ────────────────────────────────────────────────────────────────
  if (!result) return null;

  return (
    <Card className={`p-4 ${className}`} glass>
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">✨</span>
            <span className="text-xs font-semibold text-white">AI Size Recommendation</span>
          </div>
          <Badge
            color={confidenceColor(result.confidence_score)}
            size="xs"
          >
            {result.confidence_score}% match
          </Badge>
        </div>

        {/* Main size */}
        <div className="flex items-end gap-3">
          <div className="text-4xl font-extrabold text-amber-400 leading-none">
            {result.recommended_size}
          </div>
          <div className="text-xs text-slate-400 mb-1">
            {result.size_system} sizing
          </div>
        </div>

        {/* Fit notes */}
        {result.fit_notes && (
          <p className="text-xs text-slate-400 leading-relaxed">{result.fit_notes}</p>
        )}

        {/* Alternative sizes */}
        {result.alternative_sizes && result.alternative_sizes.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] text-slate-500 uppercase tracking-wide">Also fits:</span>
            {result.alternative_sizes.map((s) => (
              <Badge key={s} size="xs" color="default">{s}</Badge>
            ))}
          </div>
        )}

        {/* Measurements used */}
        {result.measurements_used.length > 0 && (
          <div className="pt-2 border-t border-white/8">
            <p className="text-[10px] text-slate-500 uppercase tracking-wide mb-1.5">
              Based on your
            </p>
            <div className="flex flex-wrap gap-1">
              {result.measurements_used.map((m) => (
                <span key={m} className="text-[10px] bg-white/5 border border-white/10 rounded-md px-1.5 py-0.5 text-slate-400 capitalize">
                  {m.replace(/_/g, " ")}
                </span>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={() => { setResult(null); mutate(); }}
          className="text-[10px] text-slate-500 hover:text-amber-400 transition-colors"
        >
          Recalculate ↻
        </button>
      </div>
    </Card>
  );
}
