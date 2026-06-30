/**
 * Admin: Commission Snapshots
 * Portal: Admin | Brand: Navy/Electric Blue | Space Grotesk
 * Route: /admin-dashboard/product/commission-snapshots/
 */
"use client";
import { useState } from "react";
import Link from "next/link";
import { useCommissionSnapshots } from "@/features/product/hooks/use-commission";
import { CommissionSnapshotTable } from "@/features/product/components/CommissionSnapshotTable";
import { useRouter } from "next/navigation";

const ACCENT = "#3B82F6";
const BG = "#020617";
const TEXT = "#E2E8F0";

export default function AdminCommissionSnapshotsPage() {
  const router = useRouter();
  const [productFilter, setProductFilter] = useState("");
  const [activeFilter, setActiveFilter] = useState("");
  const { data: snapshots = [], isLoading } = useCommissionSnapshots(activeFilter || undefined);

  return (
    <main style={{ minHeight: "100vh", background: BG, padding: "40px 24px", fontFamily: "Space Grotesk, sans-serif", color: TEXT }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: ACCENT, margin: 0 }}>Commission Snapshots</h1>
            <p style={{ color: "#64748B", fontSize: 14, margin: 0 }}>Platform commission rate history across all products</p>
          </div>
          <Link href="/admin-dashboard/product/commission-snapshots/new"
            style={{ padding: "10px 22px", borderRadius: 10, background: ACCENT, color: "#fff", fontWeight: 700, fontSize: 14, textDecoration: "none" }}>
            + New Rate
          </Link>
        </div>
        <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
          <input type="text" placeholder="Filter by product ID..." value={productFilter} onChange={(e) => setProductFilter(e.target.value)}
            style={{ flex: 1, padding: "10px 16px", borderRadius: 8, border: `1.5px solid ${ACCENT}33`, background: "#0F172A", color: TEXT, fontSize: 14 }} />
          <button onClick={() => setActiveFilter(productFilter.trim())}
            style={{ padding: "10px 22px", borderRadius: 8, background: ACCENT, color: "#fff", fontWeight: 700, border: "none", cursor: "pointer" }}>
            Filter
          </button>
        </div>
        <CommissionSnapshotTable
          snapshots={snapshots}
          isLoading={isLoading}
          onEdit={(id) => router.push(`/admin-dashboard/product/commission-snapshots/${id}`)}
          onCreateNew={() => router.push("/admin-dashboard/product/commission-snapshots/new")}
        />
      </div>
    </main>
  );
}