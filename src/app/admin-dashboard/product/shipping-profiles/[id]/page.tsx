/**
 * Admin: Shipping Profile Detail
 * Portal: Admin | Brand: Navy/Electric Blue | Space Grotesk
 * Route: /admin-dashboard/product/shipping-profiles/[id]/
 */
"use client";
import { useParams, useRouter } from "next/navigation";
import { useShippingProfile } from "@/features/product/hooks/use-shipping";
import { ShippingProfileCard } from "@/features/product/components/ShippingProfileCard";

const ACCENT = "#3B82F6";
const BG = "#020617";
const MUTED = "#64748B";

export default function AdminShippingProfileDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = String(params.id ?? "");
  const { data: profile, isLoading } = useShippingProfile(id);

  if (isLoading) return (
    <main style={{ background: BG, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: MUTED, fontFamily: "Space Grotesk, sans-serif" }}>
      Loading...
    </main>
  );

  if (!profile) return (
    <main style={{ background: BG, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#EF4444", fontFamily: "Space Grotesk, sans-serif" }}>
      Profile not found.
    </main>
  );

  return (
    <main style={{ minHeight: "100vh", background: BG, padding: "40px 24px", fontFamily: "Space Grotesk, sans-serif" }}>
      <div style={{ maxWidth: 700, margin: "0 auto" }}>
        <button onClick={() => router.back()} style={{ color: ACCENT, background: "none", border: "none", cursor: "pointer", fontSize: 14, marginBottom: 24 }}>
          Back
        </button>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: ACCENT, margin: 0, marginBottom: 28 }}>Shipping Profile Detail</h1>
        <ShippingProfileCard profile={profile} theme="admin" showActions={false} />
        <div style={{ marginTop: 16, padding: "12px 16px", background: "#0F172A", borderRadius: 10, border: `1px solid ${ACCENT}22`, fontSize: 11, color: MUTED }}>
          ID: <code style={{ color: ACCENT }}>{profile.id}</code>
          {profile.vendor_id && <span style={{ marginLeft: 16 }}>Vendor: <code style={{ color: ACCENT }}>{profile.vendor_id}</code></span>}
        </div>
      </div>
    </main>
  );
}