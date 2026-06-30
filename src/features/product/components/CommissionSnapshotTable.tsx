/**
 * @file CommissionSnapshotTable.tsx
 * @description Admin-only commission rate history table component.
 *
 * Displays ProductCommissionSnapshot rows with rate timeline,
 * effective date range, notes, and action buttons.
 */

"use client";


import type { CommissionSnapshot } from "../types/commission.types";

interface CommissionSnapshotTableProps {
  snapshots: CommissionSnapshot[];
  isLoading?: boolean;
  onEdit?: (id: string) => void;
  onCreateNew?: () => void;
}

const ACCENT = "#3B82F6"; // admin blue-500

function formatDate(iso?: string | null) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

function SkeletonRow() {
  return (
    <tr>
      {[...Array(6)].map((_, i) => (
        <td key={i} style={{ padding: "12px 16px" }}>
          <div
            style={{
              height: 14,
              borderRadius: 4,
              background: `linear-gradient(90deg, ${ACCENT}22 25%, ${ACCENT}44 50%, ${ACCENT}22 75%)`,
              backgroundSize: "200% 100%",
              animation: "commissionShimmer 1.5s infinite",
            }}
          />
        </td>
      ))}
    </tr>
  );
}

/**
 * CommissionSnapshotTable — admin-only commission history renderer.
 *
 * Shows rate progression over time, effective date ranges, and per-row
 * edit controls for updating notes and effective_to dates.
 */
export function CommissionSnapshotTable({
  snapshots,
  isLoading = false,
  onEdit,
  onCreateNew,
}: CommissionSnapshotTableProps) {
  return (
    <div>
      <style>{`
        @keyframes commissionShimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>

      {/* Header row with "Add New Snapshot" CTA */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: "#E2E8F0", margin: 0 }}>
          Commission Rate History
        </h3>
        {onCreateNew && (
          <button
            onClick={onCreateNew}
            style={{
              padding: "8px 18px",
              fontSize: 13,
              fontWeight: 600,
              borderRadius: 8,
              background: ACCENT,
              color: "#fff",
              border: "none",
              cursor: "pointer",
              boxShadow: `0 0 12px ${ACCENT}66`,
            }}
          >
            + New Rate
          </button>
        )}
      </div>

      <div
        style={{
          overflowX: "auto",
          borderRadius: 14,
          border: `1px solid ${ACCENT}33`,
          background: "#0F172A",
          boxShadow: `0 4px 24px ${ACCENT}18`,
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14, color: "#E2E8F0" }}>
          <thead>
            <tr style={{ background: `${ACCENT}18` }}>
              {["Rate (%)", "Effective From", "Effective To", "Note", "Set By", "Actions"].map(
                (h) => (
                  <th
                    key={h}
                    style={{
                      padding: "12px 16px",
                      textAlign: "left",
                      fontSize: 11,
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      color: ACCENT,
                    }}
                  >
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              [...Array(5)].map((_, i) => <SkeletonRow key={i} />)
            ) : snapshots.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  style={{ textAlign: "center", padding: "32px 0", color: "#64748B" }}
                >
                  No commission snapshots found.
                </td>
              </tr>
            ) : (
              snapshots.map((snap, idx) => {
                const isLatest = idx === 0;
                return (
                  <tr key={snap.id} style={{ borderTop: `1px solid ${ACCENT}22` }}>
                    <td style={{ padding: "12px 16px" }}>
                      <span
                        style={{
                          fontWeight: 700,
                          fontSize: 15,
                          color: isLatest ? "#22D3EE" : "#E2E8F0",
                        }}
                      >
                        {snap.commission_rate}%
                      </span>
                      {isLatest && (
                        <span
                          style={{
                            marginLeft: 8,
                            fontSize: 10,
                            padding: "2px 6px",
                            borderRadius: 4,
                            background: "#22D3EE22",
                            color: "#22D3EE",
                          }}
                        >
                          Current
                        </span>
                      )}
                    </td>
                    <td style={{ padding: "12px 16px", color: "#94A3B8" }}>
                      {formatDate(snap.effective_from)}
                    </td>
                    <td style={{ padding: "12px 16px", color: "#94A3B8" }}>
                      {snap.effective_to ? formatDate(snap.effective_to) : "Open-ended"}
                    </td>
                    <td style={{ padding: "12px 16px", color: "#94A3B8", maxWidth: 200 }}>
                      <span style={{ fontSize: 13 }}>{snap.note || "—"}</span>
                    </td>
                    <td style={{ padding: "12px 16px", color: "#94A3B8", fontFamily: "monospace", fontSize: 11 }}>
                      {snap.set_by_id ? snap.set_by_id.slice(0, 8) + "..." : "System"}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <button
                        onClick={() => onEdit?.(snap.id)}
                        style={{
                          padding: "4px 12px",
                          fontSize: 12,
                          fontWeight: 600,
                          borderRadius: 6,
                          border: `1px solid ${ACCENT}`,
                          color: ACCENT,
                          background: `${ACCENT}11`,
                          cursor: "pointer",
                        }}
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
