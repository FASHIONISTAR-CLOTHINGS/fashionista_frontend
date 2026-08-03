"use client";
/**
 * @file CameraViewport.tsx
 * @description Full-screen camera viewport used in every active measurement phase.
 *
 * - Fills the entire mobile viewport (100dvh/100vw) with the live camera feed.
 * - Video is mirrored with `scale-x-[-1]` so the user sees a selfie preview.
 * - Canvas overlays (skeleton, silhouette) are sized and drawn in CSS pixels.
 * - A compact floating phase stepper sits at the top.
 * - A colored edge border shows phone balance without blocking the view.
 * - Children are rendered on top of the video for phase-specific UI.
 */

import { type RefObject } from "react";
import { cn } from "@/lib/utils";
import type { EnhancedCaptureFrame, EnhancedCapturePhase } from "../hooks/useEnhancedMeasurementCapture";
import type { PoseIntelligenceResult } from "../lib/poseIntelligence";
import type { OrientationStatus } from "../hooks/usePhoneOrientation";
import { PoseOverlay } from "./PoseOverlay";
import { BodySilhouetteOverlay } from "./BodySilhouetteOverlay";
import { EdgeBalanceIndicator } from "./EdgeBalanceIndicator";
import { PhoneLevelGuard } from "./PhoneLevelGuard";
import { PhaseStepperFloating } from "./PhaseStepperFloating";

export interface CameraViewportProps {
  videoRef: RefObject<HTMLVideoElement | null>;
  canvasRef: RefObject<HTMLCanvasElement | null>;
  phase: EnhancedCapturePhase;
  frame: EnhancedCaptureFrame | null;
  intelligence: PoseIntelligenceResult | null;
  orientationStatus: OrientationStatus;
  phoneBadForMs?: number;
  /** Edge border disabled for desktop view or non-camera phases. */
  showEdge?: boolean;
  children?: React.ReactNode;
  className?: string;
}

export function CameraViewport({
  videoRef,
  canvasRef,
  phase,
  frame,
  intelligence,
  orientationStatus,
  phoneBadForMs = 0,
  showEdge = true,
  children,
  className,
}: CameraViewportProps) {
  return (
    <div
      className={cn(
        "fixed inset-0 z-10 flex flex-col",
        "bg-[var(--BV-cream)]",
        className
      )}
    >
      {/* ── Floating phase stepper at the very top ── */}
      <div className="absolute top-0 left-0 right-0 z-50 p-2 safe-top flex justify-center pointer-events-none">
        <PhaseStepperFloating phase={phase} className="pointer-events-auto" />
      </div>

      {/* ── Video layer — full screen ── */}
      <div className="relative flex-1 w-full h-full overflow-hidden bg-[var(--BV-cream)]">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 w-full h-full object-cover scale-x-[-1] bg-[var(--BV-cream)]"
        />
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none"
        />

        {/* ── Body silhouette guide (A-pose) ── */}
        <BodySilhouetteOverlay
          isBodyDetected={(frame?.quality ?? 0) > 0.2}
          isFullBodyVisible={intelligence?.isFullBodyVisible ?? false}
          isDistanceOptimal={intelligence?.distanceStatus === "optimal"}
          isCentered={intelligence?.centeringStatus === "centered"}
        />

        {/* ── Pose skeleton overlay ── */}
        <PoseOverlay
          normalLandmarks={frame?.normalLandmarks ?? null}
          quality={frame?.quality ?? 0}
          canvasRef={canvasRef}
          videoRef={videoRef}
        />

        {/* ── Phone balance edge indicator ── */}
        {showEdge && <EdgeBalanceIndicator status={orientationStatus} />}

        {/* ── Pause overlay when phone tilts ── */}
        <PhoneLevelGuard status={orientationStatus} badForMs={phoneBadForMs} />

        {/* ── Phase-specific children (calibration, countdown, arrows, CTAs) ── */}
        {children}
      </div>
    </div>
  );
}
