/**
 * Admin: Size Guide Detail + Edit
 * Portal: Admin | Brand: Navy/Electric Blue | Space Grotesk
 * Route: /admin-dashboard/product/size-guides/[id]/
 */
"use client";
import React from "react";
import { useParams, useRouter } from "next/navigation";
import { useSizeGuide } from "@/features/product/hooks/use-size-guide";

const ACCENT = "#3B82F6";
const BG = "#020617";
const CARD = "#0F172A";
const TEXT = "#E2E8F0";
const MUTED = "#64748B";

const FIELDS = [
  "chest_cm","waist_cm","hip_cm","shoulder_cm","sleeve_cm","length_cm","inseam_cm","foot_length_cm"
];

export default function AdminSizeGuideDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = String(params.id ?? "");
  const { data: guide, isLoading } = useSizeGuide(id);

  if (isLoading) return <main style={{ background: BG, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: MUTED }}>Loading...</main>;
  if (!guide) return <main style={{ background: BG, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#EF4444" }}>Not found.</main>;

  return (
    <main style={{ minHeight: "100vh", background: BG, padding: "40px 24px", fontFamily: "Space Grotesk, sans-serif", color: TEXT }}>
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        <button onClick={() => router.back()} style={{ color: ACCENT, background: "none", border: "none", cursor: "pointer", fontSize: 14, marginBottom: 24 }}>← Back</button>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
          <div>
            <span style={{ display: "inline-block", padding: "3px 12px", borderRadius: 9999, background: `${ACCENT}22`, color: ACCENT, fontWeight: 700, fontSize: 12, marginBottom: 8 }}>{guide.size_label}</span>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: TEXT, margin: 0 }}>{guide.name}</h1>
            <p style={{ color: MUTED, fontSize: 13, margin: 0 }}>{guide.description}</p>
          </div>
          {guide.is_default && <span style={{ padding: "6px 14px", borderRadius: 8, background: `${ACCENT}22`, color: ACCENT, fontSize: 12, fontWeight: 700 }}>★ Default</span>}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 14 }}>
          {FIELDS.map((f) => {
            const val = (guide as any)[f];
            return (
              <div key={f} style={{ background: CARD, borderRadius: 12, border: `1px solid ${ACCENT}22`, padding: "16px 18px" }}>
                <p style={{ fontSize: 10, fontWeight: 700, color: ACCENT, margin: 0, marginBottom: 6, letterSpacing: "0.08em" }}>
                  {f.replace("_cm","").replace("_"," ").toUpperCase()}
                </p>
                <p style={{ fontSize: 20, fontWeight: 800, color: val ? TEXT : MUTED, margin: 0 }}>
                  {val || "—"}{val && <span style={{ fontSize: 11, color: MUTED, marginLeft: 4 }}>cm</span>}
                </p>
              </div>
            );
          })}
        </div>
        <div style={{ marginTop: 28, padding: "16px 20px", background: CARD, borderRadius: 12, border: `1px solid ${ACCENT}22`, fontSize: 12, color: MUTED }}>
          <span>ID: <code style={{ color: ACCENT }}>{guide.id}</code></span>
          {guide.vendor_id && <span style={{ marginLeft: 20 }}>Vendor: <code style={{ color: ACCENT }}>{guide.vendor_id}</code></span>}
        </div>
      </div>
    </main>
  );
}