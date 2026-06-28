"use client";
/**
 * @file CalibrationGuide.tsx
 * @description Posture guidance overlay displayed over the camera feed.
 * Gives real-time instructions to the user: stand straight, step back, etc.
 *
 * Overlay sections:
 * - Body silhouette guide (dashed outline showing ideal position)
 * - Corner scan-line frame (sci-fi scanner aesthetic)
 * - Status banner (text guidance)
 * - Estimated height indicator (bottom-left)
 */

import { cn } from "@/lib/utils";

interface CalibrationGuideProps {
  phase:            "awaiting_height" | "capturing" | string;
  qualityScore:     number;   // 0 to 1
  estimatedHeight:  number | null;
}

export function CalibrationGuide({
  phase,
  qualityScore,
  estimatedHeight,
}: CalibrationGuideProps) {
  const pct          = Math.round(qualityScore * 100);
  const isGood       = pct >= 72;
  const isMedium     = pct >= 50 && pct < 72;

  const instruction =
    phase === "awaiting_height"
      ? "Stand 1.5m from camera — estimating height..."
      : isGood
      ? "Great pose! Ready to capture."
      : isMedium
      ? "Move back slightly and face the camera directly."
      : "Stand straight, face the camera, arms slightly apart.";

  return (
    <div className="absolute inset-0 pointer-events-none select-none">

      {/* ── Corner scan-line brackets ── */}
      {(["tl", "tr", "bl", "br"] as const).map((corner) => (
        <CornerBracket key={corner} corner={corner} isGood={isGood} />
      ))}

      {/* ── Body silhouette guide ── */}
      <SilhouetteGuide isGood={isGood} />

      {/* ── Status banner ── */}
      <div className={cn(
        "absolute bottom-4 left-4 right-4 rounded-xl px-4 py-2.5 backdrop-blur-md",
        "transition-colors duration-500 flex items-center justify-between gap-2",
        isGood
          ? "bg-green-500/20 border border-green-500/30"
          : isMedium
          ? "bg-amber-500/20 border border-amber-500/30"
          : "bg-white/10 border border-white/10",
      )}>
        <p className={cn(
          "text-xs font-medium",
          isGood ? "text-green-300" : isMedium ? "text-amber-300" : "text-white/60",
        )}>
          {instruction}
        </p>
        {/* Quality dot */}
        <div className={cn(
          "w-2 h-2 rounded-full flex-shrink-0",
          isGood ? "bg-green-400 animate-pulse" : isMedium ? "bg-amber-400" : "bg-white/20",
        )} />
      </div>

      {/* ── Estimated height chip ── */}
      {estimatedHeight && (
        <div className="absolute top-4 left-4 px-2.5 py-1 rounded-lg bg-black/40 backdrop-blur-sm
                        border border-white/10 text-xs text-white/60 font-mono">
          ~{estimatedHeight.toFixed(1)} cm
        </div>
      )}

      {/* ── Scanning animation overlay (active when quality is good) ── */}
      {isGood && <ScanLine />}
    </div>
  );
}

// ─── Corner Bracket ───────────────────────────────────────────────────────────

type Corner = "tl" | "tr" | "bl" | "br";

function CornerBracket({ corner, isGood }: { corner: Corner; isGood: boolean }) {
  const color = isGood ? "#86efac" : "#94a3b8";
  const size  = 20;
  const thick = 2.5;

  const style: React.CSSProperties = {
    position: "absolute",
    width:    size,
    height:   size,
    top:      corner.startsWith("t") ? 12 : undefined,
    bottom:   corner.startsWith("b") ? 12 : undefined,
    left:     corner.endsWith("l")   ? 12 : undefined,
    right:    corner.endsWith("r")   ? 12 : undefined,
    borderTop:    corner.startsWith("t") ? `${thick}px solid ${color}` : undefined,
    borderBottom: corner.startsWith("b") ? `${thick}px solid ${color}` : undefined,
    borderLeft:   corner.endsWith("l")   ? `${thick}px solid ${color}` : undefined,
    borderRight:  corner.endsWith("r")   ? `${thick}px solid ${color}` : undefined,
    transition:   "border-color 0.4s ease",
    borderRadius:
      corner === "tl" ? "3px 0 0 0" :
      corner === "tr" ? "0 3px 0 0" :
      corner === "bl" ? "0 0 0 3px" :
      "0 0 3px 0",
  };

  return <div style={style} />;
}

// ─── Body Silhouette Guide ────────────────────────────────────────────────────

function SilhouetteGuide({ isGood }: { isGood: boolean }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <svg
        viewBox="0 0 120 280"
        className="h-[75%] opacity-20"
        style={{ transition: "opacity 0.4s ease" }}
      >
        {/* Simple human silhouette path */}
        <path
          d={`
            M60,10 A12,12 0 1,1 60,10.01
            M60,34 L60,130
            M60,34 L35,70 L30,110
            M60,34 L85,70 L90,110
            M60,130 L40,200 L35,270
            M60,130 L80,200 L85,270
          `}
          fill="none"
          stroke={isGood ? "#86efac" : "#94a3b8"}
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="8 4"
        />
      </svg>
    </div>
  );
}

// ─── Scan Line Animation ──────────────────────────────────────────────────────

function ScanLine() {
  return (
    <div
      className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-green-400 to-transparent opacity-70"
      style={{
        animation: "scan-line 2s linear infinite",
        top: "0%",
      }}
    >
      <style>{`
        @keyframes scan-line {
          0%   { top: 5%; }
          50%  { top: 90%; }
          100% { top: 5%; }
        }
      `}</style>
    </div>
  );
}
