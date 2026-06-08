"use client";

import React, { useMemo } from "react";
import { 
  ShieldCheck, ShieldAlert, Users, Store, 
  Scissors, UserCog, ShoppingBag, User, 
  Headphones, Landmark, Truck, Microscope, 
  Sparkles, Handshake, Star, type LucideIcon 
} from "lucide-react";
import { cn } from "@/lib/utils"; // Standard utility for Tailwind class merging

/**
 * FASHIONISTAR — User Role System
 * Maps UnifiedUser.role choices to branded visual identities.
 */
export type UserRole =
  | "SUPERADMIN" | "ADMIN" | "MODERATOR"
  | "VENDOR" | "SUPER_VENDOR" | "TAILOR" | "STAFF" | "SUPER_STAFF"
  | "CLIENT" | "SUPER_CLIENT" | "GUEST" | "SUPPORT"
  | "FINANCE" | "LOGISTICS" | "QA"
  | "INFLUENCER" | "AFFILIATE" | "PARTNER";

interface RoleStyle {
  label: string;
  icon: LucideIcon;
  // Professional glassmorphism & color palette
  container: string; 
  iconClassName: string;
}

/**
 * Robust Role Configuration Map
 * Optimized for high-speed lookup and visual consistency.
 */
const ROLE_MAP: Record<string, RoleStyle> = {
  SUPERADMIN: { 
    label: "Super Admin", icon: ShieldAlert, 
    container: "bg-red-500/15 text-red-400 border-red-500/30", 
    iconClassName: "text-red-500" 
  },
  ADMIN: { 
    label: "Admin", icon: ShieldCheck, 
    container: "bg-rose-500/10 text-rose-400 border-rose-500/20", 
    iconClassName: "text-rose-500" 
  },
  MODERATOR: { 
    label: "Moderator", icon: UserCog, 
    container: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30", 
    iconClassName: "text-cyan-400" 
  },
  VENDOR: { 
    label: "Vendor", icon: Store, 
    container: "bg-purple-500/15 text-purple-300 border-purple-500/30", 
    iconClassName: "text-purple-400" 
  },
  SUPER_VENDOR: { 
    label: "Elite Vendor", icon: Sparkles, 
    container: "bg-purple-600/20 text-purple-200 border-purple-400/40 ring-1 ring-purple-400/20", 
    iconClassName: "text-purple-300" 
  },
  TAILOR: { 
    label: "Tailor", icon: Scissors, 
    container: "bg-indigo-500/15 text-indigo-300 border-indigo-500/30", 
    iconClassName: "text-indigo-400" 
  },
  STAFF: { 
    label: "Staff", icon: Users, 
    container: "bg-blue-500/15 text-blue-300 border-blue-500/30", 
    iconClassName: "text-blue-400" 
  },
  CLIENT: { 
    label: "Client", icon: ShoppingBag, 
    container: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30", 
    iconClassName: "text-emerald-400" 
  },
  SUPER_CLIENT: { 
    label: "VIP Client", icon: Star, 
    container: "bg-amber-500/20 text-amber-200 border-amber-400/40 shadow-[0_0_10px_rgba(251,191,36,0.1)]", 
    iconClassName: "text-amber-400" 
  },
  SUPPORT: { 
    label: "Support", icon: Headphones, 
    container: "bg-sky-500/15 text-sky-300 border-sky-500/30", 
    iconClassName: "text-sky-400" 
  },
  FINANCE: { 
    label: "Finance", icon: Landmark, 
    container: "bg-orange-500/15 text-orange-300 border-orange-500/30", 
    iconClassName: "text-orange-400" 
  },
  LOGISTICS: { 
    label: "Logistics", icon: Truck, 
    container: "bg-slate-500/15 text-slate-300 border-slate-500/30", 
    iconClassName: "text-slate-400" 
  },
  QA: { 
    label: "QA Specialist", icon: Microscope, 
    container: "bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-500/30", 
    iconClassName: "text-fuchsia-400" 
  },
  INFLUENCER: { 
    label: "Influencer", icon: Sparkles, 
    container: "bg-pink-500/15 text-pink-300 border-pink-500/30", 
    iconClassName: "text-pink-400" 
  },
  AFFILIATE: { 
    label: "Affiliate", icon: Handshake, 
    container: "bg-teal-500/15 text-teal-300 border-teal-500/30", 
    iconClassName: "text-teal-400" 
  },
  GUEST: { 
    label: "Guest", icon: User, 
    container: "bg-gray-500/15 text-gray-400 border-gray-500/20", 
    iconClassName: "text-gray-500" 
  },
};

interface UserRoleBadgeProps {
  /** The role string from the backend (case-insensitive) */
  role: UserRole | string;
  /** Sizing variants for different UI contexts */
  size?: "xs" | "sm" | "md" | "lg";
  /** Whether to show the descriptive icon */
  showIcon?: boolean;
  /** Optional override for the fallback label */
  fallbackLabel?: string;
  /** Additional Tailwind classes */
  className?: string;
}

/**
 * UserRoleBadge Component
 * 
 * A robust, memoized component for displaying user roles.
 * Supports glassmorphism styling, Lucide icons, and automatic normalization.
 */
export const UserRoleBadge = React.memo(({ 
  role, 
  size = "sm", 
  showIcon = true, 
  fallbackLabel,
  className 
}: UserRoleBadgeProps) => {
  
  // 1. Normalize the role key for robust lookup (e.g., "admin" -> "ADMIN")
  const config = useMemo(() => {
    const normalizedKey = (role ?? "").toString().toUpperCase().replace(/\s+/g, "_");
    return ROLE_MAP[normalizedKey] ?? {
      label: fallbackLabel ?? role.replace(/_/g, " "),
      icon: User,
      container: "bg-slate-500/15 text-slate-300 border-slate-500/30",
      iconClassName: "text-slate-400"
    };
  }, [role, fallbackLabel]);

  // 2. Define size-based dimensions
  const sizeClasses = {
    xs: "text-[9px] px-1.5 py-0.5 gap-1",
    sm: "text-[11px] px-2 py-0.5 gap-1.5",
    md: "text-xs px-2.5 py-1 gap-1.5",
    lg: "text-sm px-3 py-1.5 gap-2",
  };

  const iconSizes = {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
  };

  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center border rounded-full font-bold tracking-wide uppercase transition-all duration-200 select-none",
        config.container,
        sizeClasses[size],
        className
      )}
    >
      {showIcon && (
        <Icon 
          size={iconSizes[size]} 
          className={cn("shrink-0", config.iconClassName)} 
          strokeWidth={2.5}
        />
      )}
      <span className="truncate">{config.label}</span>
    </span>
  );
});

UserRoleBadge.displayName = "UserRoleBadge";