/**
 * Vendor Shipping Profile Edit Page
 * Portal: Vendor | Brand: Amber/Dark-slate (#F59E0B / #0F172A) | DM Sans
 * Route: /vendor/shipping-profiles/[id]/edit/
 */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useShippingProfile, useUpdateShippingProfile } from "@/features/product/hooks/use-shipping";
import type { ShippingProfileCreatePayload } from "@/features/product/types/shipping.types";

const ACCENT = "#F59E0B";
const BG = "#0F172A";
const CARD = "#1E293B";
const TEXT = "#F1F5F9";
const MUTED = "#94A3B8";
const BORDER = "#334155";
const INPUT_BG = "#0F172A";

export default function VendorShippingProfileEditPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params?.id ?? "";

  const { data: profile, isLoading } = useShippingProfile(id);
  const { mutate: updateProfile, isPending } = useUpdateShippingProfile(id);

  const [form, setForm] = useState<Partial<ShippingProfileCreatePayload>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setForm({
        weight_kg: profile.weight_kg,
        length_cm: profile.length_cm,
        width_cm: profile.width_cm,
        height_cm: profile.height_cm,
        is_fragile: profile.is_fragile,
        requires_signature: profile.requires_signature,
        free_shipping_threshold: profile.free_shipping_threshold ?? undefined,
        processing_days: profile.processing_days,
      });
    }
  }, [profile]);

  const setField = (key: keyof ShippingProfileCreatePayload, val: unknown) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    updateProfile(form, {
      onSuccess: () => router.push(`/vendor/shipping-profiles/${id}`),
      onError: () => setError("Failed to update shipping profile. Please try again."),
    });
  };

  if (isLoading) {
    return (
      <main style={{ minHeight: "100vh", background: BG, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "DM Sans, system-ui, sans-serif" }}>
        <div style={{ color: MUTED }}>Loading…</div>
      </main>
    );
  }

  const inputStyle = {
    background: INPUT_BG, border: `1px solid ${BORDER}`, borderRadius: 8,
    padding: "10px 14px", color: TEXT, fontSize: 15, outline: "none",
    width: "100%", boxSizing: "border-box" as const,
  };

  return (
    <main style={{ minHeight: "100vh", background: BG, padding: "40px 24px", fontFamily: "DM Sans, system-ui, sans-serif", color: TEXT }}>
      <div style={{ maxWidth: 700, margin: "0 auto" }}>
        <Link href={`/vendor/shipping-profiles/${id}`}
          style={{ color: MUTED, fontSize: 14, textDecoration: "none", display: "inline-flex", gap: 6, marginBottom: 28 }}>
          ← Back to Profile
        </Link>

        <h1 style={{ fontSize: 26, fontWeight: 800, color: ACCENT, marginBottom: 8 }}>Edit Shipping Profile</h1>
        <p style={{ color: MUTED, fontSize: 14, marginBottom: 32 }}>Update your shipping dimensions and rules.</p>

        {error && (
          <div style={{ background: "#1E1E2E", border: "1px solid #EF4444", color: "#F87171", borderRadius: 10, padding: "12px 16px", marginBottom: 20, fontSize: 14 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ background: CARD, borderRadius: 16, padding: 28, border: `1px solid ${BORDER}` }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: TEXT, marginBottom: 20 }}>Dimensions</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 28 }}>
              {([
                ["weight_kg", "Weight (kg)"],
                ["length_cm", "Length (cm)"],
                ["width_cm", "Width (cm)"],
                ["height_cm", "Height (cm)"],
              ] as const).map(([key, label]) => (
                <div key={key} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <label style={{ fontSize: 12, color: MUTED, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</label>
                  <input type="number" step="0.001" min="0"
                    value={String(form[key as keyof typeof form] ?? 0)}
                    onChange={(e) => setField(key as keyof ShippingProfileCreatePayload, parseFloat(e.target.value) || 0)}
                    style={inputStyle} />
                </div>
              ))}
            </div>

            <h2 style={{ fontSize: 15, fontWeight: 700, color: TEXT, marginBottom: 20 }}>Rules</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 12, color: MUTED, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Processing Days</label>
                <input type="number" min="1"
                  value={form.processing_days ?? 1}
                  onChange={(e) => setField("processing_days", parseInt(e.target.value) || 1)}
                  style={inputStyle} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 12, color: MUTED, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Free Shipping Threshold (₦)</label>
                <input type="number" step="0.01" min="0"
                  value={form.free_shipping_threshold !== undefined ? String(form.free_shipping_threshold) : ""}
                  placeholder="Optional"
                  onChange={(e) => setField("free_shipping_threshold", e.target.value ? parseFloat(e.target.value) : undefined)}
                  style={inputStyle} />
              </div>

              {([
                ["is_fragile", "Fragile Item"],
                ["requires_signature", "Requires Signature"],
              ] as Array<[keyof ShippingProfileCreatePayload, string]>).map(([key, label]) => (
                <label key={key} style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer", padding: "10px 14px", background: INPUT_BG, borderRadius: 8, border: `1px solid ${BORDER}` }}>
                  <input type="checkbox"
                    checked={Boolean(form[key])}
                    onChange={(e) => setField(key, e.target.checked)}
                    style={{ accentColor: ACCENT, width: 18, height: 18 }} />
                  <span style={{ fontSize: 14, color: TEXT, fontWeight: 500 }}>{label}</span>
                </label>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", gap: 12, marginTop: 24, justifyContent: "flex-end" }}>
            <Link href={`/vendor/shipping-profiles/${id}`}
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
