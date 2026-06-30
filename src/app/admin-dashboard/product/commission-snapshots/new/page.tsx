/**
 * Admin: Create New Commission Snapshot
 * Portal: Admin | Brand: Navy/Electric Blue | Space Grotesk
 * Route: /admin-dashboard/product/commission-snapshots/new/
 */
"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useCreateCommissionSnapshot } from "@/features/product/hooks/use-commission";

const ACCENT = "#3B82F6";
const BG = "#020617";
const CARD = "#0F172A";
const TEXT = "#E2E8F0";
const MUTED = "#64748B";

export default function AdminNewCommissionSnapshotPage() {
  const router = useRouter();
  const { mutate: create, isPending, error } = useCreateCommissionSnapshot();
  const [form, setForm] = useState({ product_id: "", commission_rate: "", effective_from: "", effective_to: "", note: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    create(
      { ...form, effective_from: form.effective_from, effective_to: form.effective_to || null },
      { onSuccess: () => router.push("/admin-dashboard/product/commission-snapshots") }
    );
  };

  return (
    <main style={{ minHeight: "100vh", background: BG, padding: "40px 24px", fontFamily: "Space Grotesk, sans-serif", color: TEXT }}>
      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        <button onClick={() => router.back()} style={{ color: ACCENT, background: "none", border: "none", cursor: "pointer", fontSize: 14, marginBottom: 24 }}>← Back</button>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: ACCENT, margin: 0, marginBottom: 6 }}>New Commission Rate</h1>
        <p style={{ color: MUTED, fontSize: 14, marginBottom: 28 }}>Rate changes create a new snapshot row (append-only).</p>
        <form onSubmit={handleSubmit}>
          <div style={{ background: CARD, borderRadius: 16, border: `1px solid ${ACCENT}33`, padding: 28, display: "flex", flexDirection: "column", gap: 20 }}>
            {[
              { id: "product_id", label: "Product ID", type: "text", placeholder: "UUID of the product" },
              { id: "commission_rate", label: "Commission Rate (%)", type: "number", placeholder: "e.g. 12.50" },
              { id: "effective_from", label: "Effective From", type: "datetime-local", placeholder: "" },
              { id: "effective_to", label: "Effective To (optional)", type: "datetime-local", placeholder: "" },
            ].map(({ id, label, type, placeholder }) => (
              <div key={id}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: ACCENT, marginBottom: 6, letterSpacing: "0.06em" }}>{label.toUpperCase()}</label>
                <input type={type} placeholder={placeholder} value={(form as any)[id]}
                  onChange={(e) => setForm((f) => ({ ...f, [id]: e.target.value }))}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: `1.5px solid ${ACCENT}33`, background: BG, color: TEXT, fontSize: 14, boxSizing: "border-box" }} />
              </div>
            ))}
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: ACCENT, marginBottom: 6, letterSpacing: "0.06em" }}>NOTE</label>
              <textarea value={form.note} onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))} rows={3}
                placeholder="Reason for rate change..."
                style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: `1.5px solid ${ACCENT}33`, background: BG, color: TEXT, fontSize: 14, resize: "vertical", boxSizing: "border-box" }} />
            </div>
            {error && <p style={{ color: "#EF4444", fontSize: 13 }}>Failed to create snapshot. Please check inputs.</p>}
            <button type="submit" disabled={isPending}
              style={{ padding: "12px 0", borderRadius: 10, background: ACCENT, color: "#fff", fontWeight: 700, fontSize: 15, border: "none", cursor: "pointer", opacity: isPending ? 0.7 : 1 }}>
              {isPending ? "Creating..." : "Create Commission Snapshot"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}