/**
 * Admin: All Size Guides
 * Portal: Admin | Brand: Navy/Electric Blue (#3B82F6 / #020617) | Space Grotesk
 * Route: /admin-dashboard/product/size-guides/
 */
"use client";
import { useState } from "react";
import { useSizeGuides } from "@/features/product/hooks/use-size-guide";
import { SizeGuideTable } from "@/features/product/components/SizeGuideTable";
import { useRouter } from "next/navigation";

const ACCENT = "#3B82F6";
const BG = "#020617";
const TEXT = "#E2E8F0";

export default function AdminSizeGuidesPage() {
  const router = useRouter();
  const [vendorFilter, setVendorFilter] = useState("");
  const [activeFilter, setActiveFilter] = useState("");
  const { data: guides = [], isLoading } = useSizeGuides(activeFilter || undefined);

  return (
    <main style={{ minHeight: "100vh", background: BG, padding: "40px 24px", fontFamily: "Space Grotesk, sans-serif", color: TEXT }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: ACCENT, margin: 0 }}>All Size Guides</h1>
            <p style={{ color: "#64748B", fontSize: 14, margin: 0 }}>Platform-wide measurement templates</p>
          </div>
        </div>
        <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
          <input type="text" placeholder="Filter by vendor ID..." value={vendorFilter} onChange={(e) => setVendorFilter(e.target.value)}
            style={{ flex: 1, padding: "10px 16px", borderRadius: 8, border: `1.5px solid ${ACCENT}33`, background: "#0F172A", color: TEXT, fontSize: 14 }} />
          <button onClick={() => setActiveFilter(vendorFilter.trim())}
            style={{ padding: "10px 22px", borderRadius: 8, background: ACCENT, color: "#fff", fontWeight: 700, border: "none", cursor: "pointer" }}>
            Apply
          </button>
          {activeFilter && <button onClick={() => { setActiveFilter(""); setVendorFilter(""); }}
            style={{ padding: "10px 16px", borderRadius: 8, border: `1px solid ${ACCENT}44`, color: ACCENT, background: "transparent", cursor: "pointer" }}>
            Clear
          </button>}
        </div>
        <SizeGuideTable
          guides={guides}
          theme="admin"
          showActions
          isLoading={isLoading}
          onEdit={(id) => router.push(`/admin-dashboard/product/size-guides/${id}`)}
          onDelete={(id) => alert("Contact platform owner to delete: " + id)}
        />
      </div>
    </main>
  );
}