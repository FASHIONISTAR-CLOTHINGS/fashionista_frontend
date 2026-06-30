/**
 * Vendor Shipping Profiles List
 * Portal: Vendor | Brand: Amber/Dark-slate | DM Sans
 * Route: /vendor/shipping-profiles/
 */
"use client";

import Link from "next/link";
import { useShippingProfiles } from "@/features/product/hooks/use-shipping";
import { ShippingProfileCard } from "@/features/product/components/ShippingProfileCard";
import { useRouter } from "next/navigation";

const ACCENT = "#F59E0B";
const BG = "#0F172A";
const TEXT = "#F1F5F9";

export default function VendorShippingProfilesPage() {
  const router = useRouter();
  const { data: profiles = [], isLoading } = useShippingProfiles();

  return (
    <main style={{ minHeight: "100vh", background: BG, padding: "40px 24px", fontFamily: "DM Sans, sans-serif", color: TEXT }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: ACCENT, margin: 0 }}>Shipping Profiles</h1>
            <p style={{ color: "#94A3B8", fontSize: 14, margin: 0 }}>Manage logistics and delivery configurations</p>
          </div>
          <Link href="/vendor/shipping-profiles/new"
            style={{ padding: "10px 22px", borderRadius: 10, background: ACCENT, color: "#0F172A", fontWeight: 700, fontSize: 14, textDecoration: "none" }}>
            + New Profile
          </Link>
        </div>
        {isLoading ? (
          <p style={{ color: "#94A3B8" }}>Loading...</p>
        ) : profiles.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#64748B" }}>
            <p style={{ fontSize: 40 }}>📦</p>
            <p style={{ fontSize: 16, fontWeight: 600 }}>No shipping profiles yet.</p>
            <Link href="/vendor/shipping-profiles/new" style={{ color: ACCENT }}>Create your first shipping profile</Link>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))", gap: 20 }}>
            {profiles.map((p) => (
              <ShippingProfileCard key={p.id} profile={p} theme="vendor" showActions onEdit={(id) => router.push(`/vendor/shipping-profiles/${id}/edit`)} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}