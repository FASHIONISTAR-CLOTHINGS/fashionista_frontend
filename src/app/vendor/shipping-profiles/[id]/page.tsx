/**
 * Vendor Shipping Profile Detail Page
 * Portal: Vendor | Brand: Amber/Dark-slate (#F59E0B / #0F172A) | DM Sans
 * Route: /vendor/shipping-profiles/[id]/
 */
"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useShippingProfile } from "@/features/product/hooks/use-shipping";

const ACCENT = "#F59E0B";
const BG = "#0F172A";
const CARD = "#1E293B";
const TEXT = "#F1F5F9";
const MUTED = "#94A3B8";
const BORDER = "#334155";

function MetricCard({ label, value, unit }: { label: string; value: string | number; unit?: string }) {
  return (
    <div style={{ background: "#0F172A", borderRadius: 12, padding: "16px 20px", border: `1px solid ${BORDER}`, display: "flex", flexDirection: "column", gap: 6 }}>
      <span style={{ fontSize: 11, color: MUTED, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</span>
      <span style={{ fontSize: 24, fontWeight: 800, color: ACCENT }}>
        {value}{unit && <span style={{ fontSize: 14, color: MUTED, marginLeft: 4 }}>{unit}</span>}
      </span>
    </div>
  );
}

function Badge({ active, label }: { active: boolean; label: string }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 14px",
      borderRadius: 20, fontSize: 13, fontWeight: 600,
      background: active ? "rgba(245,158,11,0.15)" : "rgba(148,163,184,0.1)",
      color: active ? ACCENT : MUTED, border: `1px solid ${active ? ACCENT : BORDER}`,
    }}>
      {active ? "✓" : "✗"} {label}
    </span>
  );
}

export default function VendorShippingProfileDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params?.id ?? "";

  const { data: profile, isLoading, isError } = useShippingProfile(id);

  if (isLoading) {
    return (
      <main style={{ minHeight: "100vh", background: BG, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "DM Sans, system-ui, sans-serif" }}>
        <div style={{ color: MUTED }}>Loading profile…</div>
      </main>
    );
  }

  if (isError || !profile) {
    return (
      <main style={{ minHeight: "100vh", background: BG, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "DM Sans, system-ui, sans-serif" }}>
        <div style={{ color: "#F87171" }}>Shipping profile not found.</div>
      </main>
    );
  }

  return (
    <main style={{ minHeight: "100vh", background: BG, padding: "40px 24px", fontFamily: "DM Sans, system-ui, sans-serif", color: TEXT }}>
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        <Link href="/vendor/shipping-profiles"
          style={{ color: MUTED, fontSize: 14, textDecoration: "none", display: "inline-flex", gap: 6, marginBottom: 28 }}>
          ← Back to Shipping Profiles
        </Link>

        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 32, flexWrap: "wrap", gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: ACCENT, margin: "0 0 6px" }}>Shipping Profile</h1>
            <code style={{ color: "#64748B", fontSize: 11 }}>{profile.id}</code>
          </div>
          <Link href={`/vendor/shipping-profiles/${id}/edit`}
            style={{ padding: "10px 22px", borderRadius: 10, background: ACCENT, color: "#0F172A", fontWeight: 700, fontSize: 14, textDecoration: "none" }}>
            ✏️ Edit Profile
          </Link>
        </div>

        {/* Dimensions */}
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 16 }}>Package Dimensions</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 16 }}>
            <MetricCard label="Weight" value={profile.weight_kg} unit="kg" />
            <MetricCard label="Length" value={profile.length_cm} unit="cm" />
            <MetricCard label="Width" value={profile.width_cm} unit="cm" />
            <MetricCard label="Height" value={profile.height_cm} unit="cm" />
          </div>
        </div>

        {/* Rules */}
        <div style={{ background: CARD, borderRadius: 16, padding: 24, border: `1px solid ${BORDER}`, marginBottom: 24 }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 20 }}>Shipping Rules</h2>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 20 }}>
            <Badge active={profile.is_fragile} label="Fragile" />
            <Badge active={profile.requires_signature} label="Signature Required" />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <span style={{ fontSize: 12, color: MUTED, display: "block", marginBottom: 4 }}>Processing Days</span>
              <span style={{ fontSize: 20, fontWeight: 800, color: TEXT }}>{profile.processing_days} days</span>
            </div>
            <div>
              <span style={{ fontSize: 12, color: MUTED, display: "block", marginBottom: 4 }}>Free Shipping Threshold</span>
              <span style={{ fontSize: 20, fontWeight: 800, color: profile.free_shipping_threshold ? ACCENT : MUTED }}>
                {profile.free_shipping_threshold ? `₦${Number(profile.free_shipping_threshold).toLocaleString()}` : "Not set"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
