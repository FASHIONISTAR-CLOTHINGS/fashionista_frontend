/**
 * Vendor Size Guides List
 * Portal: Vendor | Brand: Amber/Dark-slate (#F59E0B / #0F172A) | DM Sans
 * Route: /vendor/size-guides/
 */
"use client";

import Link from "next/link";
import { useSizeGuides, useDeleteSizeGuide } from "@/features/product/hooks/use-size-guide";
import { SizeGuideTable } from "@/features/product/components/SizeGuideTable";
import { useRouter } from "next/navigation";

const ACCENT = "#F59E0B";
const BG = "#0F172A";
const TEXT = "#F1F5F9";

export default function VendorSizeGuidesPage() {
  const router = useRouter();
  const { data: guides = [], isLoading } = useSizeGuides();
  const { mutate: deleteGuide } = useDeleteSizeGuide();

  return (
    <main style={{ minHeight: "100vh", background: BG, padding: "40px 24px", fontFamily: "DM Sans, system-ui, sans-serif", color: TEXT }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: ACCENT, margin: 0 }}>Size & Measurement Guides</h1>
            <p style={{ color: "#94A3B8", fontSize: 14, margin: 0 }}>Manage your fitting templates</p>
          </div>
          <Link href="/vendor/size-guides/new"
            style={{ padding: "10px 22px", borderRadius: 10, background: ACCENT, color: "#0F172A", fontWeight: 700, fontSize: 14, textDecoration: "none" }}>
            + New Guide
          </Link>
        </div>
        <SizeGuideTable
          guides={guides}
          theme="vendor"
          showActions={true}
          isLoading={isLoading}
          onEdit={(id) => router.push(`/vendor/size-guides/${id}/edit`)}
          onDelete={(id) => { if (confirm("Delete this guide?")) deleteGuide(id); }}
        />
      </div>
    </main>
  );
}