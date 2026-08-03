"use client";
/**
 * @file PoseOverlay.tsx
 * @description Canvas overlay that draws MediaPipe normalized landmarks over
 * the mirrored camera preview.
 *
 * The canvas follows the displayed video rectangle rather than intrinsic video
 * pixels. The coordinate mapper accounts for CSS object-cover cropping, the
 * mirrored video, viewport resizing, and device-pixel-ratio rendering.
 */

import { useEffect, useRef, type RefObject } from "react";
import type { Landmark } from "../hooks/usePoseLandmarker";
import { BRAND_COLORS } from "@/lib/brand";

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
  /** Normalized image landmarks from MediaPipe, not world landmarks. */
  normalLandmarks: Landmark[] | null;
  /** Quality score in the range 0-1. */
  quality: number;
  canvasRef: RefObject<HTMLCanvasElement | null>;
  videoRef: RefObject<HTMLVideoElement | null>;
}

interface DisplayTransform {
  width: number;
  height: number;
  renderedWidth: number;
  renderedHeight: number;
  offsetX: number;
  offsetY: number;
}

function getDisplayTransform(video: HTMLVideoElement, width: number, height: number): DisplayTransform {
  const intrinsicWidth = video.videoWidth || width;
  const intrinsicHeight = video.videoHeight || height;
  const scale = Math.max(width / intrinsicWidth, height / intrinsicHeight);
  const renderedWidth = intrinsicWidth * scale;
  const renderedHeight = intrinsicHeight * scale;

  return {
    width,
    height,
    renderedWidth,
    renderedHeight,
    offsetX: (width - renderedWidth) / 2,
    offsetY: (height - renderedHeight) / 2,
  };
}

function toDisplayPixel(landmark: Landmark, transform: DisplayTransform): [number, number] {
  // The video is mirrored with CSS scale-x-[-1]. Mirror normalized X once here
  // so the canvas and video show the same left/right orientation.
  return [
    (1 - landmark.x) * transform.renderedWidth + transform.offsetX,
    landmark.y * transform.renderedHeight + transform.offsetY,
  ];
}

export function PoseOverlay({ normalLandmarks, quality, canvasRef, videoRef }: PoseOverlayProps) {
  const latestDataRef = useRef({ normalLandmarks, quality });
  const drawRef = useRef<() => void>(() => undefined);

  useEffect(() => {
    latestDataRef.current = { normalLandmarks, quality };
    drawRef.current();
  }, [normalLandmarks, quality]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const draw = () => {
      const rect = video.getBoundingClientRect();
      const width = Math.round(rect.width);
      const height = Math.round(rect.height);
      if (width <= 0 || height <= 0) return;

      const devicePixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      const physicalWidth = Math.round(width * devicePixelRatio);
      const physicalHeight = Math.round(height * devicePixelRatio);
      if (canvas.width !== physicalWidth || canvas.height !== physicalHeight) {
        canvas.width = physicalWidth;
        canvas.height = physicalHeight;
      }

      // Draw in CSS pixels while keeping a crisp physical backing canvas.
      context.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
      context.clearRect(0, 0, width, height);

      const { normalLandmarks: landmarks, quality: frameQuality } = latestDataRef.current;
      if (!landmarks || landmarks.length === 0) return;

      const transform = getDisplayTransform(video, width, height);
      const strokeColor = frameQuality >= 0.80
        ? `${BRAND_COLORS.qualityGood}E6`
        : frameQuality >= 0.65
        ? `${BRAND_COLORS.qualityMedium}D9`
        : `${BRAND_COLORS.qualityBad}B3`;
      const fillColor = frameQuality >= 0.80
        ? BRAND_COLORS.qualityGood
        : frameQuality >= 0.65
        ? BRAND_COLORS.qualityMedium
        : `${BRAND_COLORS.qualityBad}E6`;

      context.lineCap = "round";
      context.lineWidth = 2.5;
      context.strokeStyle = strokeColor;
      for (const [a, b] of POSE_CONNECTIONS) {
        const first = landmarks[a];
        const second = landmarks[b];
        if (!first || !second) continue;
        if ((first.visibility ?? 0) < 0.35 || (second.visibility ?? 0) < 0.35) continue;

        const [x1, y1] = toDisplayPixel(first, transform);
        const [x2, y2] = toDisplayPixel(second, transform);
        context.beginPath();
        context.moveTo(x1, y1);
        context.lineTo(x2, y2);
        context.stroke();
      }

      for (let index = 0; index < landmarks.length; index += 1) {
        const landmark = landmarks[index];
        if (!landmark || (landmark.visibility ?? 0) < 0.35) continue;
        const [x, y] = toDisplayPixel(landmark, transform);
        const radius = KEY_LANDMARKS.has(index) ? 6 : 3;

        context.beginPath();
        context.arc(x, y, radius, 0, Math.PI * 2);
        context.fillStyle = fillColor;
        context.fill();
        context.strokeStyle = "rgba(255, 255, 255, 0.5)";
        context.lineWidth = 1;
        context.stroke();
      }
    };

    drawRef.current = draw;
    draw();

    const resizeObserver = typeof ResizeObserver !== "undefined"
      ? new ResizeObserver(draw)
      : null;
    resizeObserver?.observe(video);
    window.addEventListener("resize", draw);

    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener("resize", draw);
      if (drawRef.current === draw) drawRef.current = () => undefined;
      context.setTransform(1, 0, 0, 1, 0, 0);
      context.clearRect(0, 0, canvas.width, canvas.height);
    };
  }, [canvasRef, videoRef]);

  return null;
}
