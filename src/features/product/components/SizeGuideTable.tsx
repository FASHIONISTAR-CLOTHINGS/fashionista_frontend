/**
 * @file SizeGuideTable.tsx
 * @description Shared size & measurement guide table component.
 *
 * Used across client, vendor, and admin portals.
 * Each portal passes a portalTheme prop to control color scheme.
 * Renders measurement columns with optional client-overlay highlighting.
 */

"use client";

import React from "react";
import type { SizeGuide, ClientMeasurementOverlay } from "../types/size-guide.types";

export type PortalTheme = "client" | "vendor" | "admin";

interface SizeGuideTableProps {
  /** Size guide rows to render. */
  guides: SizeGuide[];
  /** Optional client overlay rows for fit comparison. */
  overlays?: ClientMeasurementOverlay[];
  /** Portal theme determines color accent. */
  theme?: PortalTheme;
  /** Whether to show vendor-only action columns (edit/delete). */
  showActions?: boolean;
  /** Callback when edit button is clicked. */
  onEdit?: (id: string) => void;
  /** Callback when delete button is clicked. */
  onDelete?: (id: string) => void;
  /** Loading state. */
  isLoading?: boolean;
}

const THEME_ACCENT: Record<PortalTheme, string> = {
  client: "#8B5CF6",  // purple-500
  vendor: "#F59E0B",  // amber-500
  admin: "#3B82F6",   // blue-500
};

const THEME_CARD: Record<PortalTheme, string> = {
  client: "#ffffff",
  vendor: "#1E293B",
  admin: "#0F172A",
};

const THEME_TEXT: Record<PortalTheme, string> = {
  client: "#1F2937",
  vendor: "#F1F5F9",
  admin: "#E2E8F0",
};

const THEME_MUTED: Record<PortalTheme, string> = {
  client: "#6B7280",
  vendor: "#94A3B8",
  admin: "#64748B",
};

const MEASUREMENT_COLUMNS = [
  { key: "chest_cm", label: "Chest" },
  { key: "waist_cm", label: "Waist" },
  { key: "hip_cm", label: "Hip" },
  { key: "shoulder_cm", label: "Shoulder" },
  { key: "sleeve_cm", label: "Sleeve" },
  { key: "length_cm", label: "Length" },
  { key: "inseam_cm", label: "Inseam" },
  { key: "foot_length_cm", label: "Foot" },
] as const;

function SkeletonRow({ theme }: { theme: PortalTheme }) {
  const accent = THEME_ACCENT[theme];
  return (
    <tr>
      {[...Array(MEASUREMENT_COLUMNS.length + 3)].map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div
            style={{
              height: 14,
              borderRadius: 4,
              background: `linear-gradient(90deg, ${accent}22 25%, ${accent}44 50%, ${accent}22 75%)`,
              backgroundSize: "200% 100%",
              animation: "shimmer 1.5s infinite",
            }}
          />
        </td>
      ))}
    </tr>
  );
}

/**
 * SizeGuideTable — renders measurement guide rows across all three portals.
 *
 * Vendor/admin overlays are optional. When overlays are provided (client portal),
 * each measurement cell is colour-coded: green = within guide range, amber = close,
 * red = outside range.
 */
export function SizeGuideTable({
  guides,
  overlays,
  theme = "client",
  showActions = false,
  onEdit,
  onDelete,
  isLoading = false,
}: SizeGuideTableProps) {
  const accent = THEME_ACCENT[theme];
  const bgCard = THEME_CARD[theme];
  const textPrimary = THEME_TEXT[theme];
  const textMuted = THEME_MUTED[theme];

  const overlayMap = React.useMemo(() => {
    if (!overlays) return {};
    return Object.fromEntries(overlays.map((o) => [o.guide.id, o.client_measurements]));
  }, [overlays]);

  return (
    <div
      style={{
        overflowX: "auto",
        borderRadius: 16,
        boxShadow: `0 4px 24px ${accent}22`,
        border: `1px solid ${accent}33`,
        background: bgCard,
      }}
    >
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14, color: textPrimary }}>
        <thead>
          <tr style={{ background: `${accent}18` }}>
            <th style={thStyle(accent)}>Label</th>
            <th style={thStyle(accent)}>Name</th>
            {MEASUREMENT_COLUMNS.map((col) => (
              <th key={col.key} style={thStyle(accent)}>{col.label} (cm)</th>
            ))}
            {showActions && <th style={thStyle(accent)}>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {isLoading
            ? [...Array(4)].map((_, i) => <SkeletonRow key={i} theme={theme} />)
            : guides.length === 0
            ? (
              <tr>
                <td
                  colSpan={MEASUREMENT_COLUMNS.length + (showActions ? 3 : 2)}
                  style={{ textAlign: "center", padding: "32px 0", color: textMuted }}
                >
                  No size guides found.
                </td>
              </tr>
            )
            : guides.map((guide) => {
              const clientMeasurements = overlayMap[guide.id];
              return (
                <tr
                  key={guide.id}
                  style={{ borderTop: `1px solid ${accent}22` }}
                >
                  <td style={tdStyle(textPrimary)}>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "2px 10px",
                        borderRadius: 9999,
                        background: `${accent}22`,
                        color: accent,
                        fontWeight: 600,
                        fontSize: 12,
                      }}
                    >
                      {guide.size_label}
                    </span>
                  </td>
                  <td style={{ ...tdStyle(textPrimary), fontWeight: 500 }}>
                    {guide.name}
                    {guide.is_default && (
                      <span
                        style={{
                          marginLeft: 6,
                          fontSize: 10,
                          padding: "1px 6px",
                          borderRadius: 4,
                          background: `${accent}33`,
                          color: accent,
                        }}
                      >
                        Default
                      </span>
                    )}
                  </td>
                  {MEASUREMENT_COLUMNS.map((col) => {
                    const guideVal = guide[col.key];
                    const clientVal = clientMeasurements?.[
                      col.key.replace("_cm", "_cm") as keyof typeof clientMeasurements
                    ];
                    const cellColor = getCellColor(guideVal, clientVal);
                    return (
                      <td key={col.key} style={{ ...tdStyle(textPrimary), textAlign: "center" }}>
                        <span
                          style={{
                            display: "inline-block",
                            minWidth: 36,
                            padding: "2px 8px",
                            borderRadius: 6,
                            background: cellColor.bg,
                            color: cellColor.text,
                            fontWeight: 500,
                          }}
                        >
                          {guideVal || "—"}
                        </span>
                        {clientVal != null && (
                          <div style={{ fontSize: 10, color: textMuted, marginTop: 2 }}>
                            you: {clientVal}
                          </div>
                        )}
                      </td>
                    );
                  })}
                  {showActions && (
                    <td style={{ ...tdStyle(textPrimary), textAlign: "center" }}>
                      <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                        <ActionButton
                          label="Edit"
                          color={accent}
                          onClick={() => onEdit?.(guide.id)}
                        />
                        <ActionButton
                          label="Delete"
                          color="#EF4444"
                          onClick={() => onDelete?.(guide.id)}
                        />
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
        </tbody>
      </table>
    </div>
  );
}

// --- Helpers ---

function getCellColor(
  guideVal: string | undefined,
  clientVal: number | null | undefined
): { bg: string; text: string } {
  if (!guideVal || clientVal == null) return { bg: "transparent", text: "inherit" };
  const guideNum = parseFloat(guideVal);
  const diff = Math.abs(clientVal - guideNum);
  if (diff <= 2) return { bg: "#22C55E22", text: "#16A34A" };    // exact match (green)
  if (diff <= 5) return { bg: "#F59E0B22", text: "#D97706" };   // close (amber)
  return { bg: "#EF444422", text: "#DC2626" };                   // outside (red)
}

function thStyle(accent: string): React.CSSProperties {
  return {
    padding: "12px 16px",
    textAlign: "left",
    fontWeight: 600,
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    color: accent,
    whiteSpace: "nowrap",
  };
}

function tdStyle(textColor: string): React.CSSProperties {
  return {
    padding: "12px 16px",
    fontSize: 14,
    color: textColor,
    whiteSpace: "nowrap",
  };
}

function ActionButton({
  label,
  color,
  onClick,
}: {
  label: string;
  color: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "4px 12px",
        fontSize: 12,
        fontWeight: 600,
        borderRadius: 6,
        border: `1px solid ${color}`,
        color: color,
        background: `${color}11`,
        cursor: "pointer",
        transition: "background 0.15s",
      }}
      onMouseEnter={(e) => { (e.currentTarget.style.background = `${color}33`); }}
      onMouseLeave={(e) => { (e.currentTarget.style.background = `${color}11`); }}
    >
      {label}
    </button>
  );
}
