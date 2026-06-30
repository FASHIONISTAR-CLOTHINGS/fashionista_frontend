/**
 * @file page.tsx — Client: Size Guides List + Personal Measurement Overlay
 * @description Allows clients to browse all vendor size guides with their
 * personal measurement data overlaid for real-time fit comparison.
 *
 * Portal: Client
 * Brand: Lavender purple (#8B5CF6), warm white background, Inter font.
 * Route: /client/dashboard/size-guides/
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import { useClientSizeGuideOverlay } from "@/features/product/hooks/use-size-guide";
import { SizeGuideTable } from "@/features/product/components/SizeGuideTable";

const ACCENT = "#8B5CF6";
const BG = "#FAFAF9";
const TEXT = "#1F2937";
const MUTED = "#6B7280";

export default function ClientSizeGuidesPage() {
  // vendorId would typically come from URL search params or a vendor selector
  const [vendorId, setVendorId] = useState<string>("");
  const [inputVendorId, setInputVendorId] = useState("");

  const { data: overlays, isLoading, error } = useClientSizeGuideOverlay(
    vendorId,
    undefined
  );

  const guides = overlays?.map((o) => o.guide) ?? [];

  return (
    <main
      style={{
        minHeight: "100vh",
        background: BG,
        padding: "40px 24px",
        fontFamily: "Inter, system-ui, sans-serif",
        color: TEXT,
      }}
    >
      {/* ── Page Header ── */}
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 32 }}>
          <div>
            <h1
              style={{
                fontSize: 28,
                fontWeight: 800,
                background: `linear-gradient(135deg, ${ACCENT}, #EC4899)`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                margin: 0,
                marginBottom: 6,
              }}
            >
              Size & Measurement Guides
            </h1>
            <p style={{ color: MUTED, fontSize: 14, margin: 0 }}>
              Compare vendor size templates against your personal measurements
            </p>
          </div>

          {/* AI Fit Badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 16px",
              borderRadius: 9999,
              background: `${ACCENT}15`,
              border: `1px solid ${ACCENT}44`,
            }}
          >
            <span style={{ fontSize: 20 }}>🤖</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: ACCENT }}>
              AI Fit Analysis Active
            </span>
          </div>
        </div>

        {/* ── Vendor Filter ── */}
        <div
          style={{
            background: "#fff",
            borderRadius: 14,
            border: `1px solid ${ACCENT}22`,
            padding: "20px 24px",
            marginBottom: 28,
            boxShadow: `0 2px 12px ${ACCENT}11`,
          }}
        >
          <p style={{ fontSize: 13, fontWeight: 600, color: ACCENT, marginBottom: 8 }}>
            SELECT VENDOR / TAILOR
          </p>
          <div style={{ display: "flex", gap: 12 }}>
            <input
              type="text"
              placeholder="Paste vendor ID to load their size guide..."
              value={inputVendorId}
              onChange={(e) => setInputVendorId(e.target.value)}
              style={{
                flex: 1,
                padding: "10px 16px",
                borderRadius: 10,
                border: `1.5px solid ${ACCENT}44`,
                outline: "none",
                fontSize: 14,
                color: TEXT,
                background: "#FAFAF9",
              }}
            />
            <button
              onClick={() => setVendorId(inputVendorId.trim())}
              style={{
                padding: "10px 24px",
                borderRadius: 10,
                background: `linear-gradient(135deg, ${ACCENT}, #7C3AED)`,
                color: "#fff",
                fontWeight: 700,
                fontSize: 14,
                border: "none",
                cursor: "pointer",
                boxShadow: `0 4px 14px ${ACCENT}55`,
              }}
            >
              Load Guides
            </button>
          </div>
        </div>

        {/* ── Legend ── */}
        {vendorId && (
          <div style={{ display: "flex", gap: 20, marginBottom: 20, flexWrap: "wrap" }}>
            {[
              { color: "#22C55E", label: "Exact fit (within 2cm)" },
              { color: "#F59E0B", label: "Close fit (within 5cm)" },
              { color: "#EF4444", label: "Outside fit (>5cm)" },
            ].map(({ color, label }) => (
              <div key={color} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 12, height: 12, borderRadius: "50%", background: color }} />
                <span style={{ fontSize: 12, color: MUTED }}>{label}</span>
              </div>
            ))}
          </div>
        )}

        {/* ── Error State ── */}
        {error && (
          <div
            style={{
              background: "#FEF2F2",
              border: "1px solid #FECACA",
              borderRadius: 10,
              padding: "14px 20px",
              color: "#DC2626",
              fontSize: 14,
              marginBottom: 20,
            }}
          >
            Failed to load size guides. Please check the vendor ID and try again.
          </div>
        )}

        {/* ── Empty State ── */}
        {!vendorId && (
          <div
            style={{
              textAlign: "center",
              padding: "60px 0",
              color: MUTED,
            }}
          >
            <div style={{ fontSize: 48, marginBottom: 16 }}>📐</div>
            <p style={{ fontSize: 16, fontWeight: 600 }}>Enter a vendor ID above to load their size guides</p>
            <p style={{ fontSize: 14 }}>Your measurements will be automatically overlaid for fit comparison.</p>
          </div>
        )}

        {/* ── Size Guide Table with Client Overlay ── */}
        {vendorId && (
          <SizeGuideTable
            guides={guides}
            overlays={overlays}
            theme="client"
            showActions={false}
            isLoading={isLoading}
          />
        )}

        {/* ── Quick Links ── */}
        <div style={{ marginTop: 32, display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Link
            href="/client/dashboard/measurements"
            style={{
              padding: "10px 20px",
              borderRadius: 10,
              border: `1.5px solid ${ACCENT}`,
              color: ACCENT,
              fontSize: 13,
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            📏 Update My Measurements
          </Link>
          <Link
            href="/client/dashboard/measurements/scan"
            style={{
              padding: "10px 20px",
              borderRadius: 10,
              background: `linear-gradient(135deg, ${ACCENT}, #7C3AED)`,
              color: "#fff",
              fontSize: 13,
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            🤖 AI Body Scan
          </Link>
        </div>
      </div>
    </main>
  );
}
