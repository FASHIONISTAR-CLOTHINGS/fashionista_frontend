"use client";

/**
 * entities/user/components/UserAvatar.tsx
 * Renders user avatar with initials fallback and role badge.
 * Glassmorphism ring for premium feel.
 */

import Image from "next/image";
import type { User } from "../types";

interface UserAvatarProps {
  user: User | null;
  size?: "sm" | "md" | "lg" | "xl";
  showRing?: boolean;
  className?: string;
}

const SIZE_MAP = {
  sm: { container: "w-8 h-8", text: "text-xs", ring: "ring-1" },
  md: { container: "w-10 h-10", text: "text-sm", ring: "ring-2" },
  lg: { container: "w-14 h-14", text: "text-lg", ring: "ring-2" },
  xl: { container: "w-20 h-20", text: "text-2xl", ring: "ring-4" },
} as const;

function getInitials(user: User): string {
  const first = user.firstName?.[0] ?? "";
  const last = user.lastName?.[0] ?? "";
  return `${first}${last}`.toUpperCase() || user.email[0].toUpperCase();
}

function getRoleColor(role: string): string {
  if (role.includes("ADMIN")) return "from-red-500 to-rose-600";
  if (role.includes("VENDOR")) return "from-purple-500 to-violet-600";
  if (role.includes("STAFF")) return "from-blue-500 to-indigo-600";
  if (role.includes("EDITOR")) return "from-emerald-500 to-green-600";
  return "from-amber-500 to-orange-600"; // CLIENT default
}

export function UserAvatar({ user, size = "md", showRing = true, className = "" }: UserAvatarProps) {
  const { container, text, ring } = SIZE_MAP[size];

  if (!user) {
    return (
      <div
        className={`${container} rounded-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center ${className}`}
        aria-label="No user"
      >
        <span className={`${text} font-semibold text-slate-400`}>?</span>
      </div>
    );
  }

  const gradient = getRoleColor(user.role);
  const ringClass = showRing
    ? `${ring} ring-offset-2 ring-offset-transparent ring-white/20`
    : "";

  if (user.avatar) {
    return (
      <div className={`${container} relative rounded-full overflow-hidden ${ringClass} ${className}`}>
        <Image
          src={user.avatar}
          alt={user.fullName}
          fill
          className="object-cover"
          sizes="80px"
          priority={false}
        />
      </div>
    );
  }

  return (
    <div
      className={`${container} rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center ${ringClass} ${className}`}
      role="img"
      aria-label={`Avatar for ${user.fullName}`}
    >
      <span className={`${text} font-bold text-white select-none`}>
        {getInitials(user)}
      </span>
    </div>
  );
}

/**
 * entities/user/components/UserRoleBadge.tsx
 * Color-coded pill badge for the user role system.
 */

interface UserRoleBadgeProps {
  role: string;
  compact?: boolean;
  className?: string;
}

const ROLE_BADGE_CONFIG: Record<string, { label: string; classes: string }> = {
  CLIENT: { label: "Client", classes: "bg-amber-500/15 text-amber-300 border border-amber-500/30" },
  SUPER_CLIENT: { label: "VIP Client", classes: "bg-amber-500/20 text-amber-200 border border-amber-400/40" },
  VENDOR: { label: "Vendor", classes: "bg-purple-500/15 text-purple-300 border border-purple-500/30" },
  SUPER_VENDOR: { label: "Elite Vendor", classes: "bg-purple-500/20 text-purple-200 border border-purple-400/40" },
  STAFF: { label: "Staff", classes: "bg-blue-500/15 text-blue-300 border border-blue-500/30" },
  SUPER_STAFF: { label: "Sr. Staff", classes: "bg-blue-500/20 text-blue-200 border border-blue-400/40" },
  ADMIN: { label: "Admin", classes: "bg-red-500/15 text-red-300 border border-red-500/30" },
  SUPER_ADMIN: { label: "Super Admin", classes: "bg-red-500/20 text-red-200 border border-red-400/40" },
  EDITOR: { label: "Editor", classes: "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30" },
  MODERATOR: { label: "Moderator", classes: "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30" },
  SUPPORT: { label: "Support", classes: "bg-sky-500/15 text-sky-300 border border-sky-500/30" },
};

export function UserRoleBadge({ role, compact = false, className = "" }: UserRoleBadgeProps) {
  const config = ROLE_BADGE_CONFIG[role] ?? {
    label: role.replace(/_/g, " "),
    classes: "bg-slate-500/15 text-slate-300 border border-slate-500/30",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${
        compact ? "text-[10px] px-1.5 py-0.5" : "text-xs px-2.5 py-1"
      } ${config.classes} ${className}`}
    >
      {config.label}
    </span>
  );
}
