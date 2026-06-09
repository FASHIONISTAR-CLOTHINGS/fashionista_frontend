"use client";

/**
 * features/measurement/components/BodyDiagram.tsx
 * SVG body silhouette with interactive measurement hotspots.
 * Each hotspot shows the measurement value when complete, or a
 * pulsing indicator when missing — used in MeasurementCapture flow.
 */

import { useState } from "react";

export interface MeasurementPoint {
  /** Unique identifier for the measurement */
  id: string;
  /** Display label for the measurement */
  label: string;
  /** SVG coordinate (viewBox 0 0 200 400) */
  cx: number;
  /** SVG coordinate (viewBox 0 0 200 400) */
  cy: number;
  /** Value of the measurement */
  value?: number | null;
  /** Unit of the measurement */
  unit?: string;
  /** Whether the measurement is required */
  required?: boolean;
}

interface BodyDiagramProps {
  /** Array of measurement points to render */
  points: MeasurementPoint[];
  /** Currently active measurement point */
  activePoint?: string | null;
  /** Callback fired when a point is clicked */
  onPointClick?: (pointId: string) => void;
  /** Additional CSS classes for the container */
  className?: string;
}

export function BodyDiagram({ points, activePoint, onPointClick, className = "" }: BodyDiagramProps) {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div className={`relative select-none ${className}`}>
      <svg
        viewBox="0 0 200 420"
        className="w-full max-w-[200px] mx-auto"
        aria-label="Body measurement diagram"
        role="img"
      >
        {/* Body silhouette — simplified vector */}
        <g fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5">
          {/* Head */}
          <ellipse cx="100" cy="36" rx="22" ry="26" />
          {/* Neck */}
          <path d="M88 60 Q100 72 112 60" />
          {/* Torso */}
          <path d="M68 72 Q60 90 62 140 Q70 160 80 165 Q100 168 120 165 Q130 160 138 140 Q140 90 132 72 Z" />
          {/* Arms */}
          <path d="M68 72 Q52 88 48 120 Q46 138 50 152" />
          <path d="M132 72 Q148 88 152 120 Q154 138 150 152" />
          {/* Hips */}
          <path d="M80 165 Q72 175 70 195 Q78 210 100 212 Q122 210 130 195 Q128 175 120 165 Z" />
          {/* Legs */}
          <path d="M80 212 Q76 240 78 280 Q80 320 82 360" />
          <path d="M120 212 Q124 240 122 280 Q120 320 118 360" />
          {/* Feet */}
          <path d="M78 360 Q72 368 68 370 Q72 374 88 372" />
          <path d="M122 360 Q128 368 132 370 Q128 374 112 372" />
        </g>

        {/* Measurement hotspots */}
        {points.map((pt) => {
          const isActive = pt.id === activePoint;
          const isHovered = pt.id === hovered;
          const hasValue = pt.value != null && pt.value > 0;
          const isMissing = pt.required && !hasValue;

          return (
            <g
              key={pt.id}
              onClick={() => onPointClick?.(pt.id)}
              onMouseEnter={() => setHovered(pt.id)}
              onMouseLeave={() => setHovered(null)}
              style={{ cursor: onPointClick ? "pointer" : "default" }}
              role={onPointClick ? "button" : undefined}
              aria-label={`${pt.label}: ${hasValue ? `${pt.value}${pt.unit ?? "cm"}` : "not set"}`}
            >
              {/* Outer ring — animate if missing */}
              {isMissing && (
                <circle cx={pt.cx} cy={pt.cy} r="10" fill="rgba(245,158,11,0.15)" stroke="rgba(245,158,11,0.5)" strokeWidth="1">
                  <animate attributeName="r" values="7;11;7" dur="2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="1;0.4;1" dur="2s" repeatCount="indefinite" />
                </circle>
              )}

              {/* Main dot */}
              <circle
                cx={pt.cx}
                cy={pt.cy}
                r={isActive || isHovered ? 7 : 5}
                fill={
                  isActive ? "rgba(245,158,11,0.9)"
                    : hasValue ? "rgba(52,211,153,0.9)"
                    : "rgba(255,255,255,0.15)"
                }
                stroke={
                  isActive ? "#F59E0B"
                    : isMissing ? "#F59E0B"
                    : hasValue ? "#34D399"
                    : "rgba(255,255,255,0.3)"
                }
                strokeWidth="1.5"
                className="transition-all duration-200"
              />

              {/* Value label (show on hover or active) */}
              {(isActive || isHovered) && (
                <g>
                  <rect
                    x={pt.cx + 8}
                    y={pt.cy - 11}
                    width={hasValue ? 44 : 36}
                    height={20}
                    rx="4"
                    fill="rgba(15,23,42,0.92)"
                    stroke="rgba(255,255,255,0.15)"
                    strokeWidth="0.8"
                  />
                  <text
                    x={pt.cx + 30}
                    y={pt.cy + 2}
                    fontSize="7"
                    fill="white"
                    textAnchor="middle"
                    fontFamily="system-ui"
                  >
                    {hasValue ? `${pt.value}${pt.unit ?? "cm"}` : pt.label}
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-3 text-xs text-slate-400">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/80" />Measured
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />Required
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-white/25" />Optional
        </span>
      </div>
    </div>
  );
}

// ── Default measurement points ────────────────────────────────────────────────

export const DEFAULT_MEASUREMENT_POINTS: MeasurementPoint[] = [
  { id: "chest", label: "Chest", cx: 100, cy: 95, required: true },
  { id: "waist", label: "Waist", cx: 100, cy: 128, required: true },
  { id: "hips", label: "Hips", cx: 100, cy: 158, required: true },
  { id: "shoulder_width", label: "Shoulder", cx: 100, cy: 72, required: true },
  { id: "inseam", label: "Inseam", cx: 90, cy: 260, required: false },
  { id: "thigh", label: "Thigh", cx: 88, cy: 230, required: false },
  { id: "neck", label: "Neck", cx: 100, cy: 64, required: false },
  { id: "arm_length", label: "Arm", cx: 50, cy: 120, required: false },
];
