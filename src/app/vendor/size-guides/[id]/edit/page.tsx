/**
 * Vendor Size Guide Edit Page
 * Portal: Vendor | Brand: Amber/Dark-slate (#F59E0B / #0F172A) | DM Sans
 * Route: /vendor/size-guides/[id]/edit/
 *
 * Form to update an existing size & measurement guide template.
 */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useSizeGuide, useUpdateSizeGuide } from "@/features/product/hooks/use-size-guide";
import type { SizeGuideCreatePayload } from "@/features/product/types/size-guide.types";

const ACCENT = "#F59E0B";
const BG = "#0F172A";
const CARD = "#1E293B";
const TEXT = "#F1F5F9";
const MUTED = "#94A3B8";
const BORDER = "#334155";
const INPUT_BG = "#0F172A";

const FIELDS: Array<{ key: keyof SizeGuideCreatePayload; label: string; type: string; required?: boolean }> = [
  { key: "name", label: "Template Name", type: "text", required: true },
  { key: "description", label: "Description", type: "text" },
  { key: "size_label", label: "Size Label (e.g. M, L, XL)", type: "text" },
  { key: "chest_cm", label: "Chest (cm)", type: "text" },
  { key: "waist_cm", label: "Waist (cm)", type: "text" },
  { key: "hip_cm", label: "Hip (cm)", type: "text" },
  { key: "length_cm", label: "Length (cm)", type: "text" },
  { key: "shoulder_cm", label: "Shoulder (cm)", type: "text" },
  { key: "sleeve_cm", label: "Sleeve (cm)", type: "text" },
  { key: "inseam_cm", label: "Inseam (cm)", type: "text" },
  { key: "foot_length_cm", label: "Foot Length (cm)", type: "text" },
  { key: "sort_order", label: "Sort Order", type: "number" },
];

export default function VendorSizeGuideEditPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params?.id ?? "";

  const { data: guide, isLoading } = useSizeGuide(id);
  const { mutate: updateGuide, isPending } = useUpdateSizeGuide(id);

  const [form, setForm] = useState<Partial<SizeGuideCreatePayload>>({});
  const [error, setError] = useState<string | null>(null);

  // Pre-fill form once guide loads
  useEffect(() => {
    if (guide) {
      setForm({
        name: guide.name ?? "",
        description: guide.description ?? "",
        size_label: guide.size_label ?? "",
        chest_cm: guide.chest_cm ?? "",
        waist_cm: guide.waist_cm ?? "",
        hip_cm: guide.hip_cm ?? "",
        length_cm: guide.length_cm ?? "",
        shoulder_cm: guide.shoulder_cm ?? "",
        sleeve_cm: guide.sleeve_cm ?? "",
        inseam_cm: guide.inseam_cm ?? "",
        foot_length_cm: guide.foot_length_cm ?? "",
        sort_order: guide.sort_order ?? 0,
      });
    }
  }, [guide]);

  const handleChange = (key: keyof SizeGuideCreatePayload, value: string | number) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.name?.trim()) {
      setError("Template name is required.");
      return;
    }
    updateGuide(form, {
      onSuccess: () => router.push(`/vendor/size-guides/${id}`),
      onError: () => setError("Failed to update guide. Please try again."),
    });
  };

  if (isLoading) {
    return (
      <main style={{ minHeight: "100vh", background: BG, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "DM Sans, system-ui, sans-serif" }}>
        <div style={{ color: MUTED }}>Loading…</div>
      </main>
    );
  }

  return (
    <main style={{ minHeight: "100vh", background: BG, padding: "40px 24px", fontFamily: "DM Sans, system-ui, sans-serif", color: TEXT }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <Link href={`/vendor/size-guides/${id}`}
          style={{ color: MUTED, fontSize: 14, textDecoration: "none", display: "inline-flex", gap: 6, marginBottom: 28 }}>
          ← Back to Guide
        </Link>

        <h1 style={{ fontSize: 26, fontWeight: 800, color: ACCENT, marginBottom: 8 }}>Edit Size Guide</h1>
        <p style={{ color: MUTED, fontSize: 14, marginBottom: 32 }}>Update the measurement template values below.</p>

        {error && (
          <div style={{ background: "#1E1E2E", border: "1px solid #EF4444", color: "#F87171", borderRadius: 10, padding: "12px 16px", marginBottom: 20, fontSize: 14 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ background: CARD, borderRadius: 16, padding: 28, border: `1px solid ${BORDER}`, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            {FIELDS.map(({ key, label, type, required }) => (
              <div key={key} style={{ display: "flex", flexDirection: "column", gap: 6, gridColumn: (key === "name" || key === "description") ? "1 / -1" : "auto" }}>
                <label style={{ fontSize: 12, color: MUTED, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  {label}{required && <span style={{ color: ACCENT }}> *</span>}
                </label>
                <input
                  type={type}
                  value={String(form[key] ?? "")}
                  onChange={(e) => handleChange(key, type === "number" ? Number(e.target.value) : e.target.value)}
                  required={required}
                  style={{
                    background: INPUT_BG, border: `1px solid ${BORDER}`, borderRadius: 8,
                    padding: "10px 14px", color: TEXT, fontSize: 15, outline: "none",
                    transition: "border-color 0.2s",
                  }}
                />
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: 12, marginTop: 24, justifyContent: "flex-end" }}>
            <Link href={`/vendor/size-guides/${id}`}
              style={{ padding: "12px 24px", borderRadius: 10, border: `1px solid ${BORDER}`, color: MUTED, textDecoration: "none", fontSize: 14, fontWeight: 600 }}>
              Cancel
            </Link>
            <button type="submit" disabled={isPending}
              style={{ padding: "12px 28px", borderRadius: 10, background: ACCENT, color: "#0F172A", fontWeight: 800, fontSize: 15, cursor: isPending ? "not-allowed" : "pointer", opacity: isPending ? 0.7 : 1, border: "none" }}>
              {isPending ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
