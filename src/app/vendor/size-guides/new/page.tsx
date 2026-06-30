/**
 * Vendor: Create New Size Guide
 * Portal: Vendor | Brand: Amber/Dark-slate | DM Sans
 * Route: /vendor/size-guides/new/
 */
"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useCreateSizeGuide } from "@/features/product/hooks/use-size-guide";

const ACCENT = "#F59E0B";
const BG = "#0F172A";
const CARD = "#1E293B";
const TEXT = "#F1F5F9";

const MEASURE_FIELDS = [
  "chest_cm", "waist_cm", "hip_cm", "shoulder_cm",
  "sleeve_cm", "length_cm", "inseam_cm", "foot_length_cm"
];

export default function VendorNewSizeGuidePage() {
  const router = useRouter();
  const { mutate: create, isPending } = useCreateSizeGuide();
  const [form, setForm] = useState<any>({ name: "", description: "custom", size_label: "M", sort_order: 0, is_default: false, save_as_template: true });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    create(form, { onSuccess: () => router.push("/vendor/size-guides") });
  };

  return (
    <main style={{ minHeight: "100vh", background: BG, padding: "40px 24px", fontFamily: "DM Sans, sans-serif", color: TEXT }}>
      <div style={{ maxWidth: 700, margin: "0 auto" }}>
        <button onClick={() => router.back()} style={{ color: ACCENT, background: "none", border: "none", cursor: "pointer", fontSize: 14, marginBottom: 24 }}>← Back</button>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: ACCENT, margin: 0, marginBottom: 28 }}>New Size Guide Template</h1>
        <form onSubmit={handleSubmit}>
          <div style={{ background: CARD, borderRadius: 16, border: `1px solid ${ACCENT}33`, padding: 28, display: "flex", flexDirection: "column", gap: 20 }}>
            {[["name", "Name", "text"], ["description", "Description", "text"], ["size_label", "Size Label (XS/S/M/L/XL)", "text"]].map(([id, label, type]) => (
              <div key={id}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: ACCENT, marginBottom: 6 }}>{(label as string).toUpperCase()}</label>
                <input type={type} value={form[id as string]} onChange={(e) => setForm((f: any) => ({ ...f, [id]: e.target.value }))}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: `1.5px solid ${ACCENT}33`, background: BG, color: TEXT, fontSize: 14, boxSizing: "border-box" }} />
              </div>
            ))}
            <p style={{ fontSize: 12, fontWeight: 700, color: ACCENT, margin: 0 }}>MEASUREMENTS (cm)</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
              {MEASURE_FIELDS.map((f) => (
                <div key={f}>
                  <label style={{ display: "block", fontSize: 11, color: "#94A3B8", marginBottom: 4 }}>{f.replace("_cm", "").replace("_", " ")}</label>
                  <input type="text" value={form[f] || ""} onChange={(e) => setForm((prev: any) => ({ ...prev, [f]: e.target.value }))}
                    style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: `1.5px solid ${ACCENT}22`, background: BG, color: TEXT, fontSize: 14, boxSizing: "border-box" }} />
                </div>
              ))}
            </div>
            <button type="submit" disabled={isPending}
              style={{ padding: "12px 0", borderRadius: 10, background: ACCENT, color: "#0F172A", fontWeight: 700, fontSize: 15, border: "none", cursor: "pointer" }}>
              {isPending ? "Creating..." : "Create Size Guide"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}