"use client";

/**
 * FASHIONISTAR — Identity & Media System
 * @file UserAvatar.tsx
 * @description Premium avatar component with role-based glassmorphism, 
 * initials generation, and automated fallback to the internal FashionistarImage system.
 * 
 * Features:
 * - Dynamic Role Themes: Matches role colors from the global design system.
 * - Next.js Image Optimization: Explicit width/height mapping for smallest payload.
 * - Resilience: Handles broken image URLs by switching to initials automatically.
 * - Accessibility: ARIA-compliant image roles and descriptive labels.
 */

import React, { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { FashionistarImage } from "@/components/media/FashionistarImage";
import { User } from "lucide-react"; // Generic icon for hard fallback

// ─── Constants & Types ───────────────────────────────────────────────────────

type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl" | "2xl";

interface UserAvatarProps {
  /** The UnifiedUser object from the backend */
  user: {
    id?: string;
    firstName?: string;
    lastName?: string;
    fullName?: string;
    email?: string;
    avatar?: string;
    role?: string;
  } | null;
  /** Sizing variants */
  size?: AvatarSize;
  /** Premium outer glow/ring based on role color */
  showRing?: boolean;
  /** Display an online/offline status dot */
  status?: "online" | "offline" | "away" | "busy" | null;
  /** Custom style overrides */
  className?: string;
}

const SIZE_MAP: Record<AvatarSize, { container: string; text: string; ring: string; dimension: number }> = {
  xs:  { container: "h-6 w-6",    text: "text-[10px]", ring: "ring-1", dimension: 24 },
  sm:  { container: "h-8 w-8",    text: "text-xs",     ring: "ring-1", dimension: 32 },
  md:  { container: "h-11 w-11",  text: "text-sm",     ring: "ring-2", dimension: 44 },
  lg:  { container: "h-16 w-16",  text: "text-xl",     ring: "ring-2", dimension: 64 },
  xl:  { container: "h-24 w-24",  text: "text-3xl",    ring: "ring-4", dimension: 96 },
  "2xl": { container: "h-32 w-32", text: "text-4xl",    ring: "ring-4", dimension: 128 },
};

// ─── Helper Functions ────────────────────────────────────────────────────────

/**
 * Extracts initials from user names or email.
 * Handles double-barrelled names and prevents single-character fallback where possible.
 */
function getInitials(user: any): string {
  if (!user) return "";
  const first = user.firstName?.trim() || "";
  const last = user.lastName?.trim() || "";
  
  if (first && last) return `${first[0]}${last[0]}`.toUpperCase();
  if (user.fullName) {
    const parts = user.fullName.split(" ");
    if (parts.length > 1) return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    return parts[0][0].toUpperCase();
  }
  return user.email?.[0].toUpperCase() || "?";
}

/**
 * Maps UnifiedUser roles to premium gradient themes.
 */
function getRoleGradient(role: string = "CLIENT"): string {
  const r = role.toUpperCase();
  if (r.includes("SUPERADMIN") || r.includes("ADMIN")) return "from-red-600 via-rose-500 to-red-700 shadow-red-500/20";
  if (r.includes("VENDOR")) return "from-purple-600 via-fuchsia-500 to-indigo-700 shadow-purple-500/20";
  if (r.includes("STAFF")) return "from-blue-600 via-sky-500 to-cyan-700 shadow-blue-500/20";
  if (r.includes("PARTNER") || r.includes("INFLUENCER")) return "from-pink-500 via-rose-400 to-orange-500 shadow-pink-500/20";
  if (r.includes("TAILOR")) return "from-indigo-600 to-violet-700 shadow-indigo-500/20";
  return "from-teal-600 via-emerald-500 to-green-700 shadow-emerald-500/20"; // CLIENT Default
}

// ─── Main Component ──────────────────────────────────────────────────────────

export const UserAvatar = React.memo(({ 
  user, 
  size = "md", 
  showRing = true, 
  status = null,
  className 
}: UserAvatarProps) => {
  const [imageError, setImageError] = useState(false);
  const styles = SIZE_MAP[size];

  // 1. Memoized styles for performance (Prevents layout thrashing in lists)
  const roleGradient = useMemo(() => getRoleGradient(user?.role), [user?.role]);
  const initials = useMemo(() => getInitials(user), [user]);

  // 2. State: If no user, show a high-quality skeleton/placeholder
  if (!user) {
    return (
      <div
        className={cn(
          styles.container,
          "rounded-full bg-slate-200 animate-pulse flex items-center justify-center border border-slate-300",
          className
        )}
      >
        <User size={styles.dimension * 0.5} className="text-slate-400" />
      </div>
    );
  }

  const ringStyles = showRing 
    ? cn(styles.ring, "ring-offset-2 ring-white/10 dark:ring-black/20 ring-primary/30") 
    : "";

  return (
    <div className="relative inline-block shrink-0">
      <div
        className={cn(
          styles.container,
          "relative rounded-full overflow-hidden flex items-center justify-center transition-all duration-300",
          "bg-gradient-to-br",
          roleGradient,
          ringStyles,
          className
        )}
        role="img"
        aria-label={`Avatar for ${user.fullName || "User"}`}
      >
        {/* Render Image if exists and hasn't failed */}
        {user.avatar && !imageError ? (
          <FashionistarImage
            src={user.avatar}
            alt={user.fullName || "User Profile"}
            width={styles.dimension}
            height={styles.dimension}
            className="h-full w-full object-cover"
            onError={() => setImageError(true)}
            priority={size === "xl" || size === "2xl"} // Prioritize large profile avatars
          />
        ) : (
          /* Initials Fallback with premium typography */
          <span
            className={cn(
              styles.text,
              "font-bold text-white tracking-tighter select-none drop-shadow-sm"
            )}
          >
            {initials}
          </span>
        )}

        {/* Premium Inner Overlay (Glassmorphism highlight) */}
        <div className="absolute inset-0 pointer-events-none rounded-full border border-white/10 shadow-inner" />
      </div>

      {/* Online Status Indicator */}
      {status && (
        <span
          className={cn(
            "absolute bottom-0 right-0 block rounded-full ring-2 ring-white dark:ring-slate-900",
            size === "xs" ? "h-1.5 w-1.5" : "h-3 w-3",
            {
              "bg-emerald-500": status === "online",
              "bg-slate-400": status === "offline",
              "bg-amber-400": status === "away",
              "bg-rose-500": status === "busy",
            }
          )}
        />
      )}
    </div>
  );
});

UserAvatar.displayName = "UserAvatar";