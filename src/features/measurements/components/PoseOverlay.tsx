"use client";
/**
 * @file PoseOverlay.tsx
 * @description Canvas overlay that draws the MediaPipe skeleton and landmarks
 * in real-time on top of the camera feed.
 *
 * REWRITE (2026-08-02):
 * - Now uses normalLandmarks (0-1 normalized pixel coordinates) NOT worldLandmarks
 * - Mirrors X axis to match the CSS `scale-x-[-1]` mirror on the video element
 * - Canvas is sized to video's DISPLAY rect (getBoundingClientRect), not intrinsic resolution
 * - Quality-based color coding: green (good), brand-gold (medium), red (poor)
 * - Draws ALL 33 MediaPipe BlazePose landmarks + connections
 *
 * Performance:
 * - Draws directly onto a canvas element positioned over the video
 * - All drawing is in the requestAnimationFrame loop — no React re-renders
 */

import { useEffect, RefObject } from "react";
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

// Key landmark indices (larger circles)
const KEY_LANDMARKS = new Set([0, 11, 12, 23, 24, 25, 26, 27, 28]);

// ─── Props ────────────────────────────────────────────────────────────────────

export interface PoseOverlayProps {
  /** Normalized landmarks (0-1 pixel coordinates from MediaPipe). Use normalLandmarks, NOT worldLandmarks. */
  normalLandmarks: Landmark[] | null;
  /** Quality score 0-1. Controls color: green ≥ 0.80, gold ≥ 0.65, red < 0.65 */
  quality: number;
  canvasRef:  RefObject<HTMLCanvasElement | null>;
  videoRef:   RefObject<HTMLVideoElement | null>;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function PoseOverlay({ normalLandmarks, quality, canvasRef, videoRef }: PoseOverlayProps) {
  useEffect(() => {
    const canvas = canvasRef.current;
    const video  = videoRef.current;
    if (!canvas || !video) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // ── Sync canvas size to video DISPLAY size (not intrinsic resolution) ─────
    // Using getBoundingClientRect ensures we match the CSS-rendered size,
    // including any object-cover, aspect-ratio, or scale transforms.
    const rect = video.getBoundingClientRect();
    const W = Math.round(rect.width);
    const H = Math.round(rect.height);

    if (W === 0 || H === 0) return;

    if (canvas.width !== W || canvas.height !== H) {
      canvas.width  = W;
      canvas.height = H;
    }

    // Clear the canvas
    ctx.clearRect(0, 0, W, H);

    // Nothing to draw
    if (!normalLandmarks || normalLandmarks.length === 0) return;

    // ── Quality-based color theme ─────────────────────────────────────────────
    // Green  (≥0.80): Forest Green — perfect pose
    // Gold   (≥0.65): Brand Gold — acceptable pose
    // Red    (<0.65): Red — poor pose / low visibility
    const strokeColor = quality >= 0.80
      ? "rgba(82, 183, 136, 0.9)"    // Forest Green
      : quality >= 0.65
      ? "rgba(253, 166, 0, 0.85)"    // Brand Gold
      : "rgba(239, 68, 68, 0.7)";

    const fillColor = quality >= 0.80
      ? "rgba(82, 183, 136, 1)"
      : quality >= 0.65
      ? "rgba(253, 166, 0, 1)"
      : "rgba(239, 68, 68, 0.9)";

    // ── Coordinate mapping ────────────────────────────────────────────────────
    // normalLandmarks: x and y are 0.0 → 1.0 (fraction of video frame)
    // The video element has CSS `scale-x[-1]` (mirrored horizontally for selfie view)
    // So we mirror the X coordinate: canvasX = (1 - lm.x) * W
    const toPixel = (lm: Landmark): [number, number] => [
      (1 - lm.x) * W,   // Mirror X to match CSS scale-x[-1]
      lm.y * H,
    ];

    // ── Draw skeleton connections ─────────────────────────────────────────────
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = strokeColor;
    ctx.lineCap = "round";

    for (const [a, b] of POSE_CONNECTIONS) {
      const lmA = normalLandmarks[a];
      const lmB = normalLandmarks[b];
      if (!lmA || !lmB) continue;

      // Skip low-visibility connections
      const visA = lmA.visibility ?? 0;
      const visB = lmB.visibility ?? 0;
      if (visA < 0.35 || visB < 0.35) continue;

      const [x1, y1] = toPixel(lmA);
      const [x2, y2] = toPixel(lmB);

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }

    // ── Draw landmark circles ─────────────────────────────────────────────────
    for (let i = 0; i < normalLandmarks.length; i++) {
      const lm = normalLandmarks[i];
      const vis = lm.visibility ?? 0;
      if (vis < 0.35) continue;

      const [px, py] = toPixel(lm);
      const isKey = KEY_LANDMARKS.has(i);
      const radius = isKey ? 6 : 3;

      // Outer glow for key landmarks
      if (isKey) {
        ctx.beginPath();
        ctx.arc(px, py, radius + 3, 0, Math.PI * 2);
        ctx.fillStyle = quality >= 0.80
          ? "rgba(82, 183, 136, 0.2)"
          : "rgba(253, 166, 0, 0.15)";
        ctx.fill();
      }

      // Main circle
      ctx.beginPath();
      ctx.arc(px, py, radius, 0, Math.PI * 2);
      ctx.fillStyle = fillColor;
      ctx.fill();

      // White border ring
      ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // ── Nose tracking dot (landmark 0) — quality pulse indicator ──────────────
    const nose = normalLandmarks[0];
    if (nose && (nose.visibility ?? 0) > 0.5) {
      const [cx, cy] = toPixel(nose);

      ctx.beginPath();
      ctx.arc(cx, cy, 14, 0, Math.PI * 2);
      ctx.strokeStyle = quality >= 0.80
        ? "rgba(82, 183, 136, 0.4)"
        : "rgba(253, 166, 0, 0.35)";
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }, [normalLandmarks, quality, canvasRef, videoRef]);

  return null; // No JSX — draws directly to canvas via ref
}
