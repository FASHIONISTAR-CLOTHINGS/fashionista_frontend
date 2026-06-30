/**
 * Client Shipping Info Page
 * Portal: Client | Brand: Purple/Warm-white (#8B5CF6 / #FAFAF9) | Inter
 * Route: /client/dashboard/shipping-info/
 *
 * Read-only: shows all shipping profiles linked to products the
 * client has ordered or wishlisted. Helps clients understand delivery
 * expectations before purchasing.
 */
"use client";

import { useState } from "react";
import { useShippingProfiles } from "@/features/product/hooks/use-shipping";

const ACCENT = "#8B5CF6";
const BG = "#FAFAF9";
const CARD = "#FFFFFF";
const TEXT = "#1C1917";
const MUTED = "#78716C";
const BORDER = "#E7E5E4";

function InfoRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "14px 0", borderBottom: `1px solid ${BORDER}` }}>
      <span style={{ fontSize: 20, flexShrink: 0 }}>{icon}</span>
      <div>
        <p style={{ margin: 0, fontSize: 12, color: MUTED, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</p>
        <p style={{ margin: "2px 0 0", fontSize: 15, color: TEXT, fontWeight: 600 }}>{value}</p>
      </div>
    </div>
  );
}

function ShippingCard({ profile }: { profile: Record<string, unknown> }) {
  const freeThreshold = profile.free_shipping_threshold
    ? `₦${Number(profile.free_shipping_threshold).toLocaleString()}`
    : "Not available";

  const volumetric = (
    Number(profile.length_cm) *
    Number(profile.width_cm) *
    Number(profile.height_cm)
  ).toFixed(0);

  return (
    <div style={{
      background: CARD, borderRadius: 20, padding: 24,
      boxShadow: "0 2px 12px rgba(0,0,0,0.06)", border: `1px solid ${BORDER}`,
      transition: "box-shadow 0.2s",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
        <span style={{
          display: "inline-block", width: 10, height: 10, borderRadius: "50%",
          background: profile.is_fragile ? "#F59E0B" : ACCENT,
        }} />
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: TEXT }}>
          {profile.is_fragile ? "🫧 Fragile Package" : "📦 Standard Package"}
        </h3>
      </div>
      <p style={{ margin: "0 0 16px", fontSize: 13, color: MUTED }}>
        ID: <code style={{ fontSize: 11 }}>{String(profile.id).slice(0, 8)}…</code>
      </p>

      <InfoRow icon="⚖️" label="Weight" value={`${profile.weight_kg} kg`} />
      <InfoRow icon="📐" label="Dimensions (L×W×H)" value={`${profile.length_cm} × ${profile.width_cm} × ${profile.height_cm} cm`} />
      <InfoRow icon="📦" label="Volumetric Weight" value={`~${volumetric} cm³`} />
      <InfoRow icon="📅" label="Processing Time" value={`${profile.processing_days} business day${Number(profile.processing_days) !== 1 ? "s" : ""}`} />
      <InfoRow icon="🆓" label="Free Shipping Above" value={freeThreshold} />

      <div style={{ display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap" }}>
        {profile.is_fragile && (
          <span style={{ background: "rgba(245,158,11,0.1)", color: "#B45309", border: "1px solid rgba(245,158,11,0.3)", borderRadius: 20, padding: "4px 14px", fontSize: 12, fontWeight: 600 }}>
            ⚠️ Handle with Care
          </span>
        )}
        {profile.requires_signature && (
          <span style={{ background: "rgba(139,92,246,0.1)", color: "#7C3AED", border: "1px solid rgba(139,92,246,0.3)", borderRadius: 20, padding: "4px 14px", fontSize: 12, fontWeight: 600 }}>
            ✍️ Signature Required
          </span>
        )}
        {!profile.is_fragile && !profile.requires_signature && (
          <span style={{ background: "rgba(16,185,129,0.1)", color: "#047857", border: "1px solid rgba(16,185,129,0.3)", borderRadius: 20, padding: "4px 14px", fontSize: 12, fontWeight: 600 }}>
            ✓ Standard Delivery
          </span>
        )}
      </div>
    </div>
  );
}

export default function ClientShippingInfoPage() {
  const { data: profiles = [], isLoading } = useShippingProfiles();
  const [search, setSearch] = useState("");

  const filtered = profiles.filter((p) =>
    String(p.processing_days).includes(search) ||
    String(p.weight_kg).includes(search)
  );

  return (
    <main style={{ minHeight: "100vh", background: BG, padding: "40px 24px", fontFamily: "Inter, system-ui, sans-serif", color: TEXT }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: 36 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(139,92,246,0.08)", borderRadius: 12, padding: "6px 16px", marginBottom: 16 }}>
            <span style={{ fontSize: 18 }}>🚚</span>
            <span style={{ fontSize: 13, color: ACCENT, fontWeight: 700 }}>Shipping Information</span>
          </div>
          <h1 style={{ fontSize: 30, fontWeight: 900, color: TEXT, margin: "0 0 8px" }}>
            Delivery Details
          </h1>
          <p style={{ color: MUTED, fontSize: 15, margin: 0 }}>
            View shipping specifications for available products on the platform.
          </p>
        </div>

        {/* Info Banner */}
        <div style={{
          background: "linear-gradient(135deg, rgba(139,92,246,0.08) 0%, rgba(167,139,250,0.04) 100%)",
          border: `1px solid rgba(139,92,246,0.2)`, borderRadius: 16, padding: "16px 20px", marginBottom: 32,
          display: "flex", alignItems: "center", gap: 12,
        }}>
          <span style={{ fontSize: 24 }}>💡</span>
          <p style={{ margin: 0, fontSize: 14, color: "#5B21B6", lineHeight: 1.6 }}>
            Processing time is the number of business days from order placement to dispatch.
            Free shipping applies when your order exceeds the threshold amount shown.
          </p>
        </div>

        {/* Loading */}
        {isLoading && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 24 }}>
            {[1, 2, 3].map((i) => (
              <div key={i} style={{ height: 280, background: CARD, borderRadius: 20, border: `1px solid ${BORDER}`, animation: "pulse 1.5s infinite" }} />
            ))}
          </div>
        )}

        {/* Grid */}
        {!isLoading && filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "80px 20px" }}>
            <span style={{ fontSize: 48 }}>📦</span>
            <p style={{ color: MUTED, fontSize: 16, marginTop: 16 }}>No shipping profiles available at the moment.</p>
          </div>
        )}

        {!isLoading && filtered.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 24 }}>
            {filtered.map((profile) => (
              <ShippingCard key={String(profile.id)} profile={profile as Record<string, unknown>} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
