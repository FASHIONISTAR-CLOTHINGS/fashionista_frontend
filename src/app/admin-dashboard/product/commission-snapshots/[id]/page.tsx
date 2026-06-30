/**
 * Admin: Commission Snapshot Detail + Edit
 * Portal: Admin | Brand: Navy/Electric Blue | Space Grotesk
 * Route: /admin-dashboard/product/commission-snapshots/[id]/
 */
"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useCommissionSnapshot, useUpdateCommissionSnapshot } from "@/features/product/hooks/use-commission";

const ACCENT = "#3B82F6";
const BG = "#020617";
const CARD = "#0F172A";
const TEXT = "#E2E8F0";
const MUTED = "#64748B";

export default function AdminCommissionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = String(params.id ?? "");
  const { data: snapshot, isLoading } = useCommissionSnapshot(id);
  const { mutate: update, isPending } = useUpdateCommissionSnapshot(id);
  const [note, setNote] = useState("");
  const [effectiveTo, setEffectiveTo] = useState("");

  useEffect(() => {
    if (snapshot) {
      setNote(snapshot.note ?? "");
      setEffectiveTo(snapshot.effective_to?.slice(0, 16) ?? "");
    }
  }, [snapshot]);

  if (isLoading) return (
    <main style={{ background: BG, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: MUTED, fontFamily: "Space Grotesk, sans-serif" }}>
      Loading...
    </main>
  );

  if (!snapshot) return (
    <main style={{ background: BG, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#EF4444", fontFamily: "Space Grotesk, sans-serif" }}>
      Snapshot not found.
    </main>
  );

  return (
    <main style={{ minHeight: "100vh", background: BG, padding: "40px 24px", fontFamily: "Space Grotesk, sans-serif", color: TEXT }}>
      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        <button onClick={() => router.back()} style={{ color: ACCENT, background: "none", border: "none", cursor: "pointer", fontSize: 14, marginBottom: 24 }}>
          Back
        </button>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: ACCENT, margin: 0, marginBottom: 28 }}>Commission Snapshot</h1>
        <div style={{ background: CARD, borderRadius: 16, border: `1px solid ${ACCENT}33`, padding: 28, marginBottom: 24 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
            {[
              { label: "Rate", value: `${snapshot.commission_rate}%` },
              { label: "Product ID", value: snapshot.product_id },
              { label: "Effective From", value: new Date(snapshot.effective_from).toLocaleDateString() },
              { label: "Set By", value: snapshot.set_by_id ? snapshot.set_by_id.slice(0, 8) + "..." : "System" },
            ].map(({ label, value }) => (
              <div key={label}>
                <p style={{ fontSize: 10, fontWeight: 700, color: ACCENT, margin: 0, marginBottom: 4, letterSpacing: "0.08em" }}>{label.toUpperCase()}</p>
                <p style={{ fontSize: 15, fontWeight: 600, color: TEXT, margin: 0 }}>{value}</p>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 11, color: MUTED, margin: 0 }}>Commission rate is immutable. Create a new snapshot to change the rate.</p>
        </div>
        <div style={{ background: CARD, borderRadius: 16, border: `1px solid ${ACCENT}33`, padding: 28 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: TEXT, margin: 0, marginBottom: 20 }}>Edit Mutable Fields</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: ACCENT, marginBottom: 6 }}>EFFECTIVE TO (optional)</label>
              <input type="datetime-local" value={effectiveTo} onChange={(e) => setEffectiveTo(e.target.value)}
                style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: `1.5px solid ${ACCENT}33`, background: BG, color: TEXT, fontSize: 14, boxSizing: "border-box" }} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: ACCENT, marginBottom: 6 }}>NOTE</label>
              <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3}
                style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: `1.5px solid ${ACCENT}33`, background: BG, color: TEXT, fontSize: 14, resize: "vertical", boxSizing: "border-box" }} />
            </div>
            <button disabled={isPending}
              onClick={() => update({ note, effective_to: effectiveTo ? new Date(effectiveTo).toISOString() : null })}
              style={{ padding: "12px 0", borderRadius: 10, background: ACCENT, color: "#fff", fontWeight: 700, fontSize: 15, border: "none", cursor: "pointer" }}>
              {isPending ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}