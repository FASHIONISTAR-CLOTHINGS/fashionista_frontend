"use client";
/**
 * AccountOptions — Role-Based Navbar Dropdown Overlay
 *
 * Three fully distinct menus based on UnifiedUser.role:
 *
 *   CLIENT GROUP  → client, super_client
 *   VENDOR GROUP  → vendor, super_vendor
 *   ADMIN  GROUP  → admin, super_admin, staff, super_staff,
 *                   editor, super_editor, support, super_support,
 *                   assistant, super_assistant, moderator, super_moderator
 *
 * All icons imported from "lucide-react" — the locally installed package
 * already cloned into node_modules. No CDN, no external fetch. Future
 * lucide-react version upgrades only affect this file, nowhere else.
 *
 * Navigation strategy:
 *   - The dropdown only mounts while visible so hidden panels do not keep
 *     reacting to parent renders.
 *   - We close on pathname changes, not on every new onClose function
 *     identity, which keeps the trigger responsive in both navbars.
 */

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

// ── All icons from lucide-react (locally installed — production-safe) ─────────
import {
  BarChart3,
  Gem,
  Heart,
  LayoutDashboard,
  Loader2,
  LogIn,
  LogOut,
  Package,
  PackageSearch,
  Settings,
  Shield,
  ShoppingBag,
  Store,
  UserPlus,
  UserRound,
  UserRoundCheck,
  Users,
  Wallet,
  ScrollText,
  Star,
  Shapes,
  BadgeDollarSign,
} from "lucide-react";

import { normalizeCanonicalRole } from "@/features/auth/lib/auth-routing";
import { logout as logoutFn } from "@/features/auth/services/auth.service";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { useIsHydrated } from "@/lib/react/useIsHydrated";

type RoleGroup = "client" | "vendor" | "admin" | "guest";

const linkCls =
  "w-full text-left text-foreground font-raleway font-medium text-sm flex items-center gap-2.5 py-2 px-2.5 rounded-lg hover:bg-muted/60 hover:text-primary transition-colors";
const iconCls = "w-[15px] h-[15px] shrink-0";

function getRoleGroup(role?: string | null, isStaff?: boolean): RoleGroup {
  const canonicalRole = normalizeCanonicalRole(role, isStaff === true);
  if (canonicalRole === "admin") return "admin";
  if (canonicalRole === "vendor") return "vendor";
  if (canonicalRole === "client") return "client";
  return "guest";
}

function RoleBadge({ group }: { group: RoleGroup }) {
  if (group === "admin") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-1.5 py-0.5 text-[10px] font-semibold text-rose-700">
        <Shield className="h-2.5 w-2.5" />
        Admin
      </span>
    );
  }

  if (group === "vendor") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700">
        <Gem className="h-2.5 w-2.5" />
        Vendor
      </span>
    );
  }

  if (group === "client") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
        <UserRound className="h-2.5 w-2.5" />
        Client
      </span>
    );
  }

  return null;
}

function MenuAction({
  id,
  href,
  label,
  Icon,
  onNavigate,
  useDocumentNavigation = false,
}: {
  id: string;
  href: string;
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
  onNavigate?: () => void;
  useDocumentNavigation?: boolean;
}) {
  const content = (
    <>
      <Icon className={iconCls} />
      {label}
    </>
  );

  if (useDocumentNavigation) {
    return (
      <a id={id} href={href} className={linkCls}>
        {content}
      </a>
    );
  }

  return (
    <Link
      id={id}
      href={href}
      onClick={onNavigate}
      className={linkCls}
    >
      {content}
    </Link>
  );
}

function ClientMenu({ close }: { close: () => void }) {
  return (
    <nav aria-label="Client account menu" className="flex flex-col gap-0.5 py-2">
      <MenuAction id="nav-client-dashboard" href="/client/dashboard" label="My Dashboard" Icon={LayoutDashboard} onNavigate={close} />
      <MenuAction id="nav-client-account" href="/client/dashboard/account-details" label="Account Details" Icon={UserRound} onNavigate={close} />
      <MenuAction id="nav-client-address" href="/client/dashboard/address" label="Saved Addresses" Icon={Store} onNavigate={close} />
      <MenuAction id="nav-client-orders" href="/client/dashboard/orders" label="My Orders" Icon={ShoppingBag} onNavigate={close} />
      <MenuAction id="nav-client-track" href="/client/dashboard/orders/track-order" label="Track an Order" Icon={PackageSearch} onNavigate={close} />
      <MenuAction id="nav-client-wallet" href="/client/dashboard/wallet" label="Wallet" Icon={Wallet} onNavigate={close} />
      <MenuAction id="nav-client-wishlist" href="/wishlist" label="Wishlist" Icon={Heart} onNavigate={close} />
    </nav>
  );
}

function VendorMenu({
  close,
  hasVendorProfile,
}: {
  close: () => void;
  hasVendorProfile: boolean;
}) {
  const dashboardHref = hasVendorProfile ? "/vendor/dashboard" : "/vendor/setup";

  return (
    <nav aria-label="Vendor account menu" className="flex flex-col gap-0.5 py-2">
      <MenuAction id="nav-vendor-dashboard" href={dashboardHref} label="Vendor Dashboard" Icon={LayoutDashboard} onNavigate={close} />
      <MenuAction id="nav-vendor-products" href="/vendor/products" label="Products" Icon={Package} onNavigate={close} />
      <MenuAction id="nav-vendor-orders" href="/vendor/orders" label="Orders" Icon={ShoppingBag} onNavigate={close} />
      <MenuAction id="nav-vendor-analytics" href="/vendor/analytics" label="Analytics" Icon={BarChart3} onNavigate={close} />
      <MenuAction id="nav-vendor-payments" href="/vendor/payments" label="Payments" Icon={BadgeDollarSign} onNavigate={close} />
      <MenuAction id="nav-vendor-customers" href="/vendor/customers" label="Customers" Icon={Users} onNavigate={close} />
      <MenuAction id="nav-vendor-wallet" href="/vendor/wallet" label="Wallet" Icon={Wallet} onNavigate={close} />
      <MenuAction id="nav-vendor-settings" href="/vendor/settings" label="Settings" Icon={Settings} onNavigate={close} />
    </nav>
  );
}

function AdminMenu({ close }: { close: () => void }) {
  return (
    <nav aria-label="Admin account menu" className="flex flex-col gap-0.5 py-2">
      <MenuAction id="nav-admin-dashboard" href="/admin-dashboard" label="Admin Dashboard" Icon={LayoutDashboard} onNavigate={close} />
      <MenuAction id="nav-admin-accounts" href="/admin-dashboard/accounts" label="Accounts" Icon={Users} onNavigate={close} />
      <MenuAction id="nav-admin-sellers" href="/admin-dashboard/sellers" label="Sellers" Icon={Store} onNavigate={close} />
      <MenuAction id="nav-admin-products" href="/admin-dashboard/products" label="Products" Icon={Package} onNavigate={close} />
      <MenuAction id="nav-admin-orders" href="/admin-dashboard/orders" label="Orders" Icon={ShoppingBag} onNavigate={close} />
      <MenuAction id="nav-admin-transactions" href="/admin-dashboard/transactions" label="Transactions" Icon={ScrollText} onNavigate={close} />
      <MenuAction id="nav-admin-collections" href="/admin-dashboard/collections" label="Collections" Icon={Shapes} onNavigate={close} />
      <MenuAction id="nav-admin-reviews" href="/admin-dashboard/reviews" label="Reviews" Icon={Star} onNavigate={close} />
      <MenuAction id="nav-admin-brands" href="/admin-dashboard/brands" label="Brands" Icon={Gem} onNavigate={close} />
      <MenuAction id="nav-admin-settings" href="/admin-dashboard/settings" label="Platform Settings" Icon={Settings} onNavigate={close} />
    </nav>
  );
}

function GuestPanel({
  pathname,
}: {
  pathname: string;
}) {
  // Guest auth links use document navigation because the dropdown unmount and
  // auth-shell hydration can interrupt client-only transitions on first click.
  const signInHref = pathname.startsWith("/auth")
    ? "/auth/sign-in"
    : `/auth/sign-in?returnUrl=${encodeURIComponent(pathname)}`;
  const trackingHref = `/auth/sign-in?returnUrl=${encodeURIComponent("/client/dashboard/orders/track-order")}`;

  return (
    <div className="flex flex-col gap-0.5 py-1">
      <p className="mb-1 border-b border-border/50 pb-3 text-xs text-muted-foreground">
        Sign in to access your account
      </p>
      <MenuAction id="nav-signin-link" href={signInHref} label="Sign In" Icon={LogIn} useDocumentNavigation />
      <MenuAction id="nav-register-client-link" href="/auth/choose-role" label="Create Account" Icon={UserPlus} useDocumentNavigation />
      <MenuAction id="nav-order-tracking-guest" href={trackingHref} label="Track an Order" Icon={PackageSearch} useDocumentNavigation />
      <MenuAction id="nav-register-vendor-link" href="/auth/sign-up?role=vendor" label="Become a Vendor" Icon={UserRoundCheck} useDocumentNavigation />
    </div>
  );
}

const AccountOptions = ({
  showOptions,
  onClose,
}: {
  showOptions: boolean;
  onClose?: () => void;
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const hydrated = useIsHydrated();
  const closeRef = useRef(onClose);
  const hasSeenInitialPath = useRef(false);

  useEffect(() => {
    closeRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!hasSeenInitialPath.current) {
      hasSeenInitialPath.current = true;
      return;
    }

    closeRef.current?.();
  }, [pathname]);

  const { mutate: doLogout, isPending: isLoggingOut } = useMutation({
    mutationFn: logoutFn,
    onSettled: () => {
      clearAuth();
      toast.success("Signed out", { description: "See you soon! 👋" });
      router.push("/");
    },
  });

  const roleGroup: RoleGroup =
    hydrated && isAuthenticated
      ? getRoleGroup(user?.role, user?.is_staff)
      : "guest";

  const displayName =
    user?.first_name
      ? `${user.first_name}${user.last_name ? ` ${user.last_name}` : ""}`
      : user?.email ?? user?.phone ?? "My Account";

  const avatarBg =
    roleGroup === "admin"
      ? "bg-rose-100"
      : roleGroup === "vendor"
        ? "bg-amber-100"
        : "bg-primary/10";
  const avatarIconColour =
    roleGroup === "admin"
      ? "text-rose-600"
      : roleGroup === "vendor"
        ? "text-amber-600"
        : "text-primary";

  const close = () => {
    onClose?.();
  };

  if (!showOptions) {
    return null;
  }

  return (
    <div
      id="account-options-panel"
      role="dialog"
      aria-label="Account options"
      style={{ boxShadow: "0px 4px 25px 0px #0000001A" }}
      className={`
        absolute right-0 top-[calc(100%+0.75rem)] z-50 w-[292px] rounded-xl bg-white p-4
        divide-y divide-border/50
        flex flex-col
        animate-in fade-in-0 zoom-in-95 duration-150
      `}
    >
      {roleGroup !== "guest" ? (
        <>
          <div className="mb-1 pb-3">
            <div className="flex items-center gap-3">
              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${avatarBg}`}>
                {roleGroup === "admin" ? (
                  <Shield className={`h-4 w-4 ${avatarIconColour}`} />
                ) : roleGroup === "vendor" ? (
                  <Store className={`h-4 w-4 ${avatarIconColour}`} />
                ) : (
                  <UserRound className={`h-4 w-4 ${avatarIconColour}`} />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold leading-tight text-foreground">
                  {displayName}
                </p>
                <div className="mt-0.5">
                  <RoleBadge group={roleGroup} />
                </div>
              </div>
            </div>
          </div>

          {roleGroup === "vendor" ? (
            <VendorMenu
              close={close}
              hasVendorProfile={user?.has_vendor_profile === true}
            />
          ) : roleGroup === "admin" ? (
            <AdminMenu close={close} />
          ) : (
            <ClientMenu close={close} />
          )}

          <div className="mt-1 pt-2">
            <button
              id="nav-logout-btn"
              type="button"
              onClick={() => {
                close();
                doLogout();
              }}
              disabled={isLoggingOut}
              className="w-full rounded-lg px-2.5 py-2 text-left text-sm font-medium text-destructive transition-colors hover:bg-destructive/5 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span className="flex items-center gap-2.5">
                {isLoggingOut ? (
                  <Loader2 className="h-[15px] w-[15px] animate-spin" />
                ) : (
                  <LogOut className="h-[15px] w-[15px]" />
                )}
                {isLoggingOut ? "Signing out…" : "Sign Out"}
              </span>
            </button>
          </div>
        </>
      ) : (
        <GuestPanel pathname={pathname} />
      )}
    </div>
  );
};

export default AccountOptions;
