"use client";

/**
 * entities/user/components/UserRoleBadge.tsx
 * Role badge for the UnifiedUser model — maps all 15 Django roles to
 * branded visual labels with icons and color variants.
 */

import { Badge } from "@/shared/ui";

// Matches UnifiedUser.role choices in Django
type UserRole =
  | "superadmin" | "admin" | "moderator"
  | "vendor" | "tailor" | "staff"
  | "client" | "guest" | "support"
  | "finance" | "logistics" | "qa"
  | "influencer" | "affiliate" | "partner";

interface UserRoleBadgeProps {
  role: UserRole | string;
  size?: "xs" | "sm" | "md";
  showIcon?: boolean;
  className?: string;
}

const ROLE_CONFIG: Record<string, { label: string; icon: string; color: "primary" | "success" | "warning" | "danger" | "info" | "violet" | "default" }> = {
  superadmin:  { label: "Super Admin",  icon: "👑", color: "danger" },
  admin:       { label: "Admin",        icon: "🛡️", color: "danger" },
  moderator:   { label: "Moderator",   icon: "⚖️", color: "warning" },
  vendor:      { label: "Vendor",      icon: "🏪", color: "primary" },
  tailor:      { label: "Tailor",      icon: "🧵", color: "violet" },
  staff:       { label: "Staff",       icon: "👔", color: "info" },
  client:      { label: "Client",      icon: "🛍️", color: "success" },
  guest:       { label: "Guest",       icon: "👤", color: "default" },
  support:     { label: "Support",     icon: "🎧", color: "info" },
  finance:     { label: "Finance",     icon: "💰", color: "warning" },
  logistics:   { label: "Logistics",   icon: "🚚", color: "info" },
  qa:          { label: "QA",          icon: "🔬", color: "violet" },
  influencer:  { label: "Influencer",  icon: "✨", color: "primary" },
  affiliate:   { label: "Affiliate",   icon: "🤝", color: "success" },
  partner:     { label: "Partner",     icon: "🌟", color: "primary" },
};

export function UserRoleBadge({ role, size = "sm", showIcon = true, className = "" }: UserRoleBadgeProps) {
  const config = ROLE_CONFIG[role] ?? { label: String(role), icon: "👤", color: "default" as const };

  return (
    <Badge color={config.color} size={size} className={className}>
      {showIcon && <span className="mr-0.5">{config.icon}</span>}
      {config.label}
    </Badge>
  );
}
