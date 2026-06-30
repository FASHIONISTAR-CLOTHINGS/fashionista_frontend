/**
 * Vendor Size Guide Detail Page
 * Portal: Vendor | Brand: Amber/Dark-slate (#F59E0B / #0F172A) | DM Sans
 * Route: /vendor/size-guides/[id]/
 *
 * Shows full detail of a single size & measurement guide template
 * with navigation to edit and back to list.
 */
"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useSizeGuide, useDeleteSizeGuide } from "@/features/product/hooks/use-size-guide";

const ACCENT = "#F59E0B";
const BG = "#0F172A";
const CARD = "#1E293B";
const TEXT = "#F1F5F9";
const MUTED = "#94A3B8";
const BORDER = "#334155";

const MEASUREMENT_FIELDS: Array<{ key: string; label: string }> = [
  { key: "chest_cm", label: "Chest (cm)" },
  { key: "waist_cm", label: "Waist (cm)" },
  { key: "hip_cm", label: "Hip (cm)" },
  { key: "length_cm", label: "Length (cm)" },
  { key: "shoulder_cm", label: "Shoulder (cm)" },
  { key: "sleeve_cm", label: "Sleeve (cm)" },
  { key: "inseam_cm", label: "Inseam (cm)" },
  { key: "foot_length_cm", label: "Foot Length (cm)" },
];

export default function VendorSizeGuideDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params?.id ?? "";

  const { data: guide, isLoading, isError } = useSizeGuide(id);
  const { mutate: deleteGuide, isPending: isDeleting } = useDeleteSizeGuide();

  const handleDelete = () => {
    if (!confirm("Permanently delete this size guide template?")) return;
    deleteGuide(id, {
      onSuccess: () => router.push("/vendor/size-guides"),
    });
  };

  if (isLoading) {
    return (
      <main style={{ minHeight: "100vh", background: BG, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "DM Sans, system-ui, sans-serif" }}>
        <div style={{ color: MUTED, fontSize: 16 }}>Loading guide…</div>
      </main>
    );
  }

  if (isError || !guide) {
    return (
      <main style={{ minHeight: "100vh", background: BG, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "DM Sans, system-ui, sans-serif" }}>
        <div style={{ color: "#F87171", fontSize: 16 }}>Guide not found.</div>
      </main>
    );
  }

  return (
    <main style={{ minHeight: "100vh", background: BG, padding: "40px 24px", fontFamily: "DM Sans, system-ui, sans-serif", color: TEXT }}>
      <div style={{ maxWidth: 800, margin: "0 auto" }}>

        {/* Back nav */}
        <Link href="/vendor/size-guides"
          style={{ color: MUTED, fontSize: 14, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 28 }}>
          ← Back to Size Guides
        </Link>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 32, flexWrap: "wrap", gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: ACCENT, margin: "0 0 6px" }}>{guide.name}</h1>
            <span style={{ fontSize: 13, background: "#1E3A5F", color: "#60A5FA", padding: "3px 12px", borderRadius: 20, fontWeight: 600 }}>
              Size: {guide.size_label}
            </span>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <Link href={`/vendor/size-guides/${id}/edit`}
              style={{ padding: "10px 22px", borderRadius: 10, background: ACCENT, color: "#0F172A", fontWeight: 700, fontSize: 14, textDecoration: "none" }}>
              ✏️ Edit
            </Link>
            <button onClick={handleDelete} disabled={isDeleting}
              style={{ padding: "10px 22px", borderRadius: 10, border: "1px solid #EF4444", background: "transparent", color: "#EF4444", fontWeight: 700, fontSize: 14, cursor: "pointer", opacity: isDeleting ? 0.6 : 1 }}>
              {isDeleting ? "Deleting…" : "🗑 Delete"}
            </button>
          </div>
        </div>

        {/* Description */}
        {guide.description && (
          <div style={{ background: CARD, borderRadius: 14, padding: "16px 20px", marginBottom: 24, borderLeft: `4px solid ${ACCENT}` }}>
            <p style={{ color: MUTED, margin: 0, fontSize: 14, lineHeight: 1.6 }}>{guide.description}</p>
          </div>
        )}

        {/* Measurements Grid */}
        <div style={{ background: CARD, borderRadius: 16, padding: 28, border: `1px solid ${BORDER}` }}>
          <h2 style={{ color: TEXT, fontSize: 16, fontWeight: 700, marginBottom: 24 }}>Measurement Values</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 20 }}>
            {MEASUREMENT_FIELDS.map(({ key, label }) => {
              const val = (guide as unknown as Record<string, unknown>)[key] as string | null | undefined;
              return (
                <div key={key} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <span style={{ fontSize: 12, color: MUTED, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</span>
                  <span style={{ fontSize: 22, fontWeight: 800, color: val ? ACCENT : BORDER }}>
                    {val || "—"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Meta */}
        <div style={{ marginTop: 20, display: "flex", gap: 20, color: MUTED, fontSize: 13 }}>
          <span>Sort Order: <strong style={{ color: TEXT }}>{guide.sort_order ?? 0}</strong></span>
          <span>ID: <code style={{ color: "#64748B", fontSize: 11 }}>{guide.id}</code></span>
        </div>
      </div>
    </main>
  );
}
