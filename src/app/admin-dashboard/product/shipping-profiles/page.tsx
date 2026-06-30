/**
 * Admin: All Shipping Profiles
 * Portal: Admin | Brand: Navy/Electric Blue | Space Grotesk
 * Route: /admin-dashboard/product/shipping-profiles/
 */
"use client";
import { useState } from "react";
import { useShippingProfiles } from "@/features/product/hooks/use-shipping";
import { ShippingProfileCard } from "@/features/product/components/ShippingProfileCard";
import { useRouter } from "next/navigation";

const ACCENT = "#3B82F6";
const BG = "#020617";
const TEXT = "#E2E8F0";

export default function AdminShippingProfilesPage() {
  const router = useRouter();
  const [vendorFilter, setVendorFilter] = useState("");
  const [active, setActive] = useState("");
  const { data: profiles = [], isLoading } = useShippingProfiles(active || undefined);

  return (
    <main style={{ minHeight: "100vh", background: BG, padding: "40px 24px", fontFamily: "Space Grotesk, sans-serif", color: TEXT }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: ACCENT, margin: 0 }}>All Shipping Profiles</h1>
          <p style={{ color: "#64748B", fontSize: 14, margin: 0 }}>Platform-wide shipping configurations</p>
        </div>
        <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
          <input type="text" placeholder="Filter by vendor ID..." value={vendorFilter} onChange={(e) => setVendorFilter(e.target.value)}
            style={{ flex: 1, padding: "10px 16px", borderRadius: 8, border: `1.5px solid ${ACCENT}33`, background: "#0F172A", color: TEXT, fontSize: 14 }} />
          <button onClick={() => setActive(vendorFilter.trim())}
            style={{ padding: "10px 22px", borderRadius: 8, background: ACCENT, color: "#fff", fontWeight: 700, border: "none", cursor: "pointer" }}>
            Apply
          </button>
        </div>
        {isLoading ? <p style={{ color: "#64748B" }}>Loading...</p> : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))", gap: 20 }}>
            {profiles.map((p) => (
              <ShippingProfileCard key={p.id} profile={p} theme="admin" showActions onEdit={(id) => router.push(`/admin-dashboard/product/shipping-profiles/${id}`)} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}