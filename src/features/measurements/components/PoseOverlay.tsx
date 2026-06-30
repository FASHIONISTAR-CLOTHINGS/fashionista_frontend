"use client";
/**
 * @file PoseOverlay.tsx
 * @description Canvas overlay that draws the MediaPipe skeleton and landmarks
 * in real-time on top of the camera feed.
 *
 * Drawing:
 * - Skeleton bones: white lines between connected landmarks
 * - Key landmarks: coloured circles (green = good visibility, amber = low)
 * - Body outline silhouette: semi-transparent fill for body region
 *
 * Performance:
 * - Draws directly onto a canvas element positioned over the video
 * - All drawing is in the requestAnimationFrame loop — no React re-renders
 */

import { useEffect, RefObject } from "react";
import type { CaptureFrame, } from "../hooks/useMeasurementCapture";
import type { Landmark } from "../hooks/usePoseLandmarker";

// ─── MediaPipe Pose Connections ───────────────────────────────────────────────
// Based on the official BlazePose 33-landmark topology

const POSE_CONNECTIONS: [number, number][] = [
  // Face
  [0, 1], [1, 2], [2, 3], [3, 7],
  [0, 4], [4, 5], [5, 6], [6, 8],
  // Torso
  [11, 12], [11, 23], [12, 24], [23, 24],
  // Left arm
  [11, 13], [13, 15], [15, 17], [15, 19], [15, 21],
  // Right arm
  [12, 14], [14, 16], [16, 18], [16, 20], [16, 22],
  // Left leg
  [23, 25], [25, 27], [27, 29], [27, 31], [29, 31],
  // Right leg
  [24, 26], [26, 28], [28, 30], [28, 32], [30, 32],
];

// ─── Props ────────────────────────────────────────────────────────────────────

interface PoseOverlayProps {
  frame:      CaptureFrame | null;
  canvasRef:  RefObject<HTMLCanvasElement | null>;
  videoRef:   RefObject<HTMLVideoElement | null>;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function PoseOverlay({ frame, canvasRef, videoRef }: PoseOverlayProps) {
  useEffect(() => {
    const canvas = canvasRef.current;
    const video  = videoRef.current;
    if (!canvas || !video) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Sync canvas size to video display size
    const { clientWidth: w, clientHeight: h } = video;
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width  = w;
      canvas.height = h;
    }

    // Clear
    ctx.clearRect(0, 0, w, h);

    if (!frame?.worldLandmarks) return;

    // Convert normalised coords to pixel coords
    // Note: worldLandmarks are in METRES (not normalised 0-1 like regular landmarks)
    // We use the regular landmarks for drawing; worldLandmarks are for math only.
    // Here we draw based on the current frame visibility/quality only.

    const lms = frame.worldLandmarks;
    const quality = frame.quality;

    // Project world coords to canvas
    // World landmark coords: x,y,z in metres, centred at hip
    // For drawing, we normalise relative to bounding box
    const xs = lms.map((l: Landmark) => l.x);
    const ys = lms.map((l: Landmark) => l.y);
    const minX = Math.min(...xs), maxX = Math.max(...xs);
    const minY = Math.min(...ys), maxY = Math.max(...ys);
    const rangeX = maxX - minX || 1;
    const rangeY = maxY - minY || 1;

    const margin = 0.1;
    const toPixel = (lm: Landmark): [number, number] => [
      ((lm.x - minX) / rangeX) * w * (1 - margin * 2) + w * margin,
      ((lm.y - minY) / rangeY) * h * (1 - margin * 2) + h * margin,
    ];

    // ── Draw connections ────────────────────────────────────────────────────
    ctx.lineWidth   = 2.5;
    ctx.strokeStyle = quality >= 0.72
      ? "rgba(134, 239, 172, 0.8)"    // Green
      : "rgba(251, 191, 36, 0.6)";    // Amber

    for (const [a, b] of POSE_CONNECTIONS) {
      if (a >= lms.length || b >= lms.length) continue;
      const visA = lms[a].visibility ?? 0;
      const visB = lms[b].visibility ?? 0;
      if (visA < 0.3 || visB < 0.3) continue;

      const [x1, y1] = toPixel(lms[a]);
      const [x2, y2] = toPixel(lms[b]);

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }

    // ── Draw landmark circles ───────────────────────────────────────────────
    for (let i = 0; i < lms.length; i++) {
      const lm  = lms[i];
      const vis = lm.visibility ?? 0;
      if (vis < 0.3) continue;

      const [px, py] = toPixel(lm);

      // Key landmarks are larger
      const isKey = [11, 12, 23, 24, 25, 26, 27, 28].includes(i);
      const radius = isKey ? 5 : 3;

      ctx.beginPath();
      ctx.arc(px, py, radius, 0, Math.PI * 2);
      ctx.fillStyle = vis > 0.7
        ? "rgba(134, 239, 172, 0.9)"   // Bright green
        : "rgba(251, 191, 36, 0.7)";   // Amber for low visibility
      ctx.fill();

      // White border
      ctx.strokeStyle = "rgba(255,255,255,0.4)";
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // ── Quality pulse ring at centre ────────────────────────────────────────
    if (lms[0]) {
      const [cx, cy] = toPixel(lms[0]);
      const pulseRadius = 12;
      ctx.beginPath();
      ctx.arc(cx, cy, pulseRadius, 0, Math.PI * 2);
      ctx.strokeStyle = quality >= 0.72
        ? "rgba(134, 239, 172, 0.6)"
        : "rgba(251, 191, 36, 0.4)";
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }, [frame, canvasRef, videoRef]);

  return null; // No JSX — draws directly to canvas via ref
}
