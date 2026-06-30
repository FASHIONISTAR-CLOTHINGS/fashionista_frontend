/**
 * @file ShippingProfileCard.tsx
 * @description Shipping profile display card used across all three portals.
 *
 * Vendor: Shows full profile with edit CTA.
 * Client: Shows read-only shipping info for a product.
 * Admin:  Shows full profile with edit CTA and vendor attribution.
 */

"use client";


import type { ShippingProfile } from "../types/shipping.types";
import type { PortalTheme } from "./SizeGuideTable";

interface ShippingProfileCardProps {
  profile: ShippingProfile;
  theme?: PortalTheme;
  showActions?: boolean;
  onEdit?: (id: string) => void;
  vendorName?: string;
}

const THEME_ACCENT: Record<PortalTheme, string> = {
  client: "#8B5CF6",
  vendor: "#F59E0B",
  admin: "#3B82F6",
};

const THEME_CARD: Record<PortalTheme, string> = {
  client: "#ffffff",
  vendor: "#1E293B",
  admin: "#0F172A",
};

const THEME_TEXT: Record<PortalTheme, string> = {
  client: "#1F2937",
  vendor: "#F1F5F9",
  admin: "#E2E8F0",
};

/**
 * ShippingProfileCard renders dimensional and logistics data for a shipping profile.
 */
export function ShippingProfileCard({
  profile,
  theme = "client",
  showActions = false,
  onEdit,
  vendorName,
}: ShippingProfileCardProps) {
  const accent = THEME_ACCENT[theme];
  const cardBg = THEME_CARD[theme];
  const textColor = THEME_TEXT[theme];

  return (
    <div
      style={{
        background: cardBg,
        border: `1px solid ${accent}33`,
        borderRadius: 16,
        padding: 24,
        boxShadow: `0 4px 20px ${accent}18`,
        color: textColor,
      }}
    >
      {vendorName && (
        <p style={{ fontSize: 12, color: accent, marginBottom: 8, fontWeight: 600 }}>
          VENDOR: {vendorName}
        </p>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "16px 24px" }}>
        <Stat label="Weight" value={`${profile.weight_kg} kg`} accent={accent} />
        <Stat label="Dimensions (L×W×H)" value={`${profile.length_cm} × ${profile.width_cm} × ${profile.height_cm} cm`} accent={accent} />
        <Stat label="Processing Days" value={`${profile.processing_days} day(s)`} accent={accent} />
        <Stat label="Free Shipping ≥" value={profile.free_shipping_threshold ? `₦${profile.free_shipping_threshold}` : "N/A"} accent={accent} />
        <Stat
          label="Fragile"
          value={profile.is_fragile ? "Yes" : "No"}
          accent={accent}
          highlight={profile.is_fragile}
        />
        <Stat
          label="Requires Signature"
          value={profile.requires_signature ? "Yes" : "No"}
          accent={accent}
        />
        {profile.restricted_countries?.length > 0 && (
          <div style={{ gridColumn: "1 / -1" }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: accent, marginBottom: 4 }}>
              RESTRICTED COUNTRIES
            </p>
            <p style={{ fontSize: 13 }}>{profile.restricted_countries.join(", ")}</p>
          </div>
        )}
      </div>

      {showActions && (
        <div style={{ marginTop: 20, display: "flex", gap: 10 }}>
          <button
            onClick={() => onEdit?.(profile.id)}
            style={{
              padding: "8px 20px",
              fontSize: 13,
              fontWeight: 600,
              borderRadius: 8,
              border: `1.5px solid ${accent}`,
              color: accent,
              background: `${accent}11`,
              cursor: "pointer",
            }}
          >
            Edit Profile
          </button>
        </div>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
  highlight = false,
}: {
  label: string;
  value: string;
  accent: string;
  highlight?: boolean;
}) {
  return (
    <div>
      <p style={{ fontSize: 11, fontWeight: 600, color: accent, marginBottom: 2, letterSpacing: "0.05em" }}>
        {label.toUpperCase()}
      </p>
      <p
        style={{
          fontSize: 14,
          fontWeight: 500,
          color: highlight ? "#EF4444" : "inherit",
        }}
      >
        {value}
      </p>
    </div>
  );
}
