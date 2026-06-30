/**
 * @file [id]/page.tsx - Client: Size Guide Detail
 * Portal: Client | Brand: Purple/Lavender
 * Route: /client/dashboard/size-guides/[id]/
 */
"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useSizeGuide } from "@/features/product/hooks/use-size-guide";

const ACCENT = "#8B5CF6";
const BG = "#FAFAF9";
const TEXT = "#1F2937";
const MUTED = "#6B7280";

const FIELDS = [
  { key: "chest_cm", label: "Chest", icon: "👕" },
  { key: "waist_cm", label: "Waist", icon: "⌀" },
  { key: "hip_cm", label: "Hip", icon: "📐" },
  { key: "shoulder_cm", label: "Shoulder", icon: "🫱" },
  { key: "sleeve_cm", label: "Sleeve Length", icon: "👊" },
  { key: "length_cm", label: "Body Length", icon: "📏" },
  { key: "inseam_cm", label: "Inseam", icon: "🦵" },
  { key: "foot_length_cm", label: "Foot Length", icon: "👟" },
] as const;

export default function ClientSizeGuideDetailPage() {
  const params = useParams();
  const id = String(params.id ?? "");
  const { data: guide, isLoading, error } = useSizeGuide(id);

  if (isLoading) return (
    <main style={{ minHeight: "100vh", background: BG, padding: "60px 24px", fontFamily: "Inter, sans-serif" }}>
      <div style={{ maxWidth: 760, margin: "0 auto", textAlign: "center", color: MUTED }}>Loading...</div>
    </main>
  );

  if (error || !guide) return (
    <main style={{ minHeight: "100vh", background: BG, padding: "60px 24px", fontFamily: "Inter, sans-serif" }}>
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 12, padding: "20px 24px", color: "#DC2626" }}>
          Size guide not found.
        </div>
        <Link href="/client/dashboard/size-guides" style={{ marginTop: 16, display: "inline-block", color: ACCENT }}>Back</Link>
      </div>
    </main>
  );

  return (
    <main style={{ minHeight: "100vh", background: BG, padding: "40px 24px", fontFamily: "Inter, sans-serif", color: TEXT }}>
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        <Link href="/client/dashboard/size-guides" style={{ fontSize: 13, color: ACCENT, textDecoration: "none", display: "inline-block", marginBottom: 24 }}>
          ← All Size Guides
        </Link>
        <div style={{ background: "#fff", borderRadius: 20, border: `1px solid ${ACCENT}33`, padding: "28px 32px", marginBottom: 28, boxShadow: `0 4px 20px ${ACCENT}11` }}>
          <span style={{ display: "inline-block", padding: "4px 14px", borderRadius: 9999, background: `${ACCENT}22`, color: ACCENT, fontWeight: 700, fontSize: 13, marginBottom: 10 }}>
            {guide.size_label}
          </span>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: TEXT, margin: 0 }}>{guide.name}</h1>
          <p style={{ color: MUTED, fontSize: 14, marginTop: 4 }}>{guide.description}</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16, marginBottom: 32 }}>
          {FIELDS.map(({ key, label, icon }) => {
            const val = (guide as any)[key];
            return (
              <div key={key} style={{ background: "#fff", borderRadius: 14, border: `1px solid ${ACCENT}22`, padding: "20px 20px 16px", boxShadow: `0 2px 10px ${ACCENT}11` }}>
                <div style={{ fontSize: 20, marginBottom: 8 }}>{icon}</div>
                <p style={{ fontSize: 11, fontWeight: 700, color: MUTED, letterSpacing: "0.08em", margin: 0, marginBottom: 4 }}>{label.toUpperCase()}</p>
                <p style={{ fontSize: 22, fontWeight: 800, color: val ? ACCENT : "#D1D5DB", margin: 0 }}>
                  {val || "—"}{val && <span style={{ fontSize: 12, fontWeight: 400, color: MUTED, marginLeft: 4 }}>cm</span>}
                </p>
              </div>
            );
          })}
        </div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Link href="/client/dashboard/measurements" style={{ padding: "10px 20px", borderRadius: 10, border: `1.5px solid ${ACCENT}`, color: ACCENT, fontSize: 13, fontWeight: 600, textDecoration: "none" }}>
            📏 My Measurements
          </Link>
          <Link href="/client/dashboard/measurements/scan" style={{ padding: "10px 20px", borderRadius: 10, background: `linear-gradient(135deg, ${ACCENT}, #7C3AED)`, color: "#fff", fontSize: 13, fontWeight: 600, textDecoration: "none" }}>
            🤖 AI Body Scan
          </Link>
        </div>
      </div>
    </main>
  );
}