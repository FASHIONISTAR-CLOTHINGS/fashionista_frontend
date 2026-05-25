"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  ArrowUpRight,
  BarChart3,
  Bell,
  ChevronRight,
  ClipboardCheck,
  CreditCard,
  Headphones,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Package,
  PlusCircle,
  ReceiptText,
  Settings,
  ShoppingBag,
  Sparkles,
  Tag,
  Users,
  Wallet,
  X,
  Zap,
} from "lucide-react";

import { RoleGuard } from "@/features/auth/components/RoleGuard";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { useVendorDashboard } from "@/features/vendor/hooks/use-vendor-setup";

// ── Brand Palette ─────────────────────────────────────────────────────────────
const C = {
  green:    "#1a2e14",   // Forest Green — sidebar base
  greenMid: "#243b1c",   // sidebar mid
  greenEnd: "#0f1a0b",   // sidebar footer
  gold:     "#FDA600",
  goldDark: "#E8960A",
  cream:    "#F8F5ED",
  creamB:   "#ECE6D6",
  muted:    "#7A6B44",
} as const;

// ── Nav Structure ─────────────────────────────────────────────────────────────
const vendorNavGroups = [
  {
    group: "Overview",
    items: [
      { href: "/vendor/dashboard", label: "Dashboard",  Icon: LayoutDashboard },
      { href: "/vendor/analytics", label: "Analytics",  Icon: BarChart3 },
    ],
  },
  {
    group: "Catalog",
    items: [
      { href: "/vendor/products",         label: "Add Product", Icon: PlusCircle  },
      { href: "/vendor/products/catalog", label: "My Products", Icon: ShoppingBag },
      { href: "/vendor/coupons",          label: "Coupons",     Icon: Tag         },
    ],
  },
  {
    group: "Commerce",
    items: [
      { href: "/vendor/orders",       label: "Orders",       Icon: Package      },
      { href: "/vendor/payments",     label: "Payments",     Icon: CreditCard   },
      { href: "/vendor/transactions", label: "Transactions", Icon: ReceiptText  },
      { href: "/vendor/customers",    label: "Customers",    Icon: Users        },
    ],
  },
  {
    group: "Finance",
    items: [
      { href: "/vendor/wallet",  label: "Wallet",  Icon: Wallet },
      { href: "/vendor/payouts", label: "Payouts", Icon: Zap    },
    ],
  },
  {
    group: "Support",
    items: [
      { href: "/vendor/kyc",      label: "KYC Verification", Icon: ClipboardCheck },
      { href: "/vendor/support",  label: "Support Tickets",  Icon: Headphones     },
      { href: "/vendor/settings", label: "Settings",         Icon: Settings       },
    ],
  },
];

const PAGE_LABEL_MAP: Record<string, string> = {
  dashboard:    "Dashboard",
  analytics:    "Analytics",
  orders:       "Orders",
  payments:     "Payments",
  transactions: "Transactions",
  customers:    "Customers",
  wallet:       "Wallet",
  payouts:      "Payouts",
  kyc:          "KYC Verification",
  settings:     "Settings",
  coupons:      "Coupons",
  products:     "Products",
  catalog:      "Catalog",
  setup:        "Store Setup",
  support:      "Support",
  chat:         "Messages",
  notifications:"Notifications",
};

function isActivePath(pathname: string, href: string) {
  if (href === "/vendor/products") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

// ── Sidebar ───────────────────────────────────────────────────────────────────
function VendorSidebar({
  isOpen,
  onClose,
}: {
  isOpen:  boolean;
  onClose: () => void;
}) {
  const pathname               = usePathname();
  const router                 = useRouter();
  const logout                 = useAuthStore((s) => s.logout);
  const user                   = useAuthStore((s) => s.user);
  const { data: dashboard }    = useVendorDashboard();

  const userFullName  = user ? `${user.first_name} ${user.last_name}`.trim() : "";
  const storeName     = dashboard?.profile.store_name ?? (userFullName || "My Store");
  const logoUrl       = dashboard?.profile.logo_url ?? "";
  const isVerified    = dashboard?.profile.is_verified ?? false;
  const walletBalance = dashboard?.wallet?.balance ?? 0;

  const handleLogout = () => {
    logout();
    router.replace("/auth/sign-in");
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          tabIndex={-1}
        />
      )}

      {/* Sidebar panel */}
      <aside
        style={{ background: `linear-gradient(180deg, ${C.green} 0%, ${C.greenMid} 60%, ${C.greenEnd} 100%)` }}
        className={[
          "fixed inset-y-0 left-0 z-50 flex w-[276px] flex-col",
          "border-r border-white/8 shadow-2xl shadow-black/40",
          "transition-transform duration-300 ease-out will-change-transform",
          "lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
        aria-label="Vendor navigation"
      >
        {/* ── Brand Header ── */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-white/8">
          <Link
            href="/vendor/dashboard"
            onClick={onClose}
            className="flex items-center gap-3 group min-w-0 flex-1"
            aria-label="Go to dashboard"
          >
            {logoUrl ? (
              <div className="relative h-10 w-10 overflow-hidden rounded-2xl ring-2 ring-[#FDA600]/40 flex-shrink-0">
                <Image src={logoUrl} alt={storeName} fill className="object-cover" />
              </div>
            ) : (
              <div
                className="flex h-10 w-10 items-center justify-center rounded-2xl flex-shrink-0 shadow-lg"
                style={{ background: `linear-gradient(135deg, ${C.gold} 0%, ${C.goldDark} 100%)`, boxShadow: `0 4px 16px ${C.gold}40` }}
              >
                <ShoppingBag className="h-5 w-5 text-black" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white leading-none">{storeName}</p>
              <div className="flex items-center gap-1.5 mt-1">
                <Sparkles className="h-3 w-3 text-[#FDA600]/70 flex-shrink-0" />
                <p className="text-[11px] text-white/40 leading-none truncate">Fashionistar Vendor</p>
              </div>
            </div>
          </Link>
          <button
            type="button"
            aria-label="Close navigation"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl text-white/40 hover:bg-white/10 hover:text-white transition-all duration-150 lg:hidden flex-shrink-0 ml-2"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* ── Status Ribbon ── */}
        <div className="mx-4 mt-3.5 rounded-xl border border-white/8 bg-white/5 p-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className={`h-1.5 w-1.5 rounded-full ${isVerified ? "bg-emerald-400 animate-pulse" : "bg-amber-400"}`} />
            <span className={`text-[11px] font-medium ${isVerified ? "text-emerald-400" : "text-amber-300"}`}>
              {isVerified ? "Verified Store" : "Pending Verification"}
            </span>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-white/30 leading-none">Balance</p>
            <p className="text-xs font-bold text-[#FDA600] leading-none mt-0.5">
              ₦{walletBalance.toLocaleString()}
            </p>
          </div>
        </div>

        {/* ── Navigation ── */}
        <nav
          className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10"
          aria-label="Main vendor menu"
        >
          {vendorNavGroups.map(({ group, items }) => (
            <div key={group} role="group" aria-labelledby={`nav-group-${group}`}>
              <p
                id={`nav-group-${group}`}
                className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-white/25"
              >
                {group}
              </p>
              <div className="space-y-0.5">
                {items.map(({ href, label, Icon }) => {
                  const active = isActivePath(pathname, href);
                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={onClose}
                      aria-current={active ? "page" : undefined}
                      className={[
                        "group relative flex items-center gap-3 rounded-xl px-3 py-2.5",
                        "text-sm font-medium outline-none",
                        "transition-all duration-150 focus-visible:ring-2 focus-visible:ring-[#FDA600]/60",
                        active
                          ? "text-black shadow-lg"
                          : "text-white/55 hover:bg-white/6 hover:text-white",
                      ].join(" ")}
                      style={active ? {
                        background: `linear-gradient(135deg, ${C.gold} 0%, ${C.goldDark} 100%)`,
                        boxShadow: `0 4px 14px ${C.gold}35`,
                      } : undefined}
                    >
                      <Icon
                        className={[
                          "h-4 w-4 flex-shrink-0 transition-transform duration-150",
                          "group-hover:scale-110",
                          active ? "text-black" : "",
                        ].join(" ")}
                        aria-hidden="true"
                      />
                      <span className="flex-1 truncate">{label}</span>
                      {active && <ChevronRight className="h-3 w-3 text-black/50" aria-hidden="true" />}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* ── Footer: View Store + Sign Out ── */}
        <div className="border-t border-white/8 px-3 py-4 space-y-1">
          <Link
            href={`/vendors/${dashboard?.profile.store_slug ?? ""}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/40 transition-all hover:bg-white/6 hover:text-white group"
          >
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            <span>View Public Store</span>
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/40 transition-all hover:bg-red-500/10 hover:text-red-400"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign out</span>
          </button>
        </div>
      </aside>
    </>
  );
}

// ── Profile Dropdown ──────────────────────────────────────────────────────────
function ProfileDropdown({ initials, storeName }: { initials: string; storeName: string }) {
  const router  = useRouter();
  const logout  = useAuthStore((s) => s.logout);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  const handleLogout = () => {
    logout();
    router.replace("/auth/sign-in");
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        id="vendor-profile-btn"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex h-9 w-9 items-center justify-center rounded-xl text-xs font-bold text-black shadow-sm transition-all hover:scale-105 hover:shadow-md focus-visible:ring-2 focus-visible:ring-[#FDA600]/60 outline-none"
        style={{ background: `linear-gradient(135deg, ${C.gold} 0%, ${C.goldDark} 100%)` }}
        aria-label="Profile menu"
        title={storeName}
      >
        {initials}
      </button>

      {open && (
        <div
          role="menu"
          aria-labelledby="vendor-profile-btn"
          className="absolute right-0 top-full mt-2 w-52 origin-top-right rounded-2xl border border-[#ECE6D6] bg-white shadow-xl shadow-black/10 overflow-hidden z-50"
          style={{ animation: "scaleIn 0.12s ease-out" }}
        >
          <style>{`@keyframes scaleIn{from{opacity:0;transform:scale(.95)}to{opacity:1;transform:scale(1)}}`}</style>
          <div className="px-4 py-3 border-b border-[#ECE6D6] bg-[#FAFAF8]">
            <p className="text-[11px] text-[#7A6B44] leading-none">Signed in as</p>
            <p className="mt-1 text-sm font-semibold text-[#1A1208] truncate">{storeName}</p>
          </div>
          <div className="py-1">
            {[
              { href: "/vendor/settings",      label: "Settings"       },
              { href: "/vendor/kyc",           label: "KYC Status"     },
              { href: "/vendor/notifications", label: "Notifications"  },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                role="menuitem"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 px-4 py-2 text-sm text-[#1A1208] hover:bg-[#F8F5ED] transition-colors"
              >
                {label}
              </Link>
            ))}
          </div>
          <div className="border-t border-[#ECE6D6] py-1">
            <button
              type="button"
              role="menuitem"
              onClick={handleLogout}
              className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Topbar ────────────────────────────────────────────────────────────────────
function VendorTopbar({ onMenuClick }: { onMenuClick: () => void }) {
  const user                = useAuthStore((s) => s.user);
  const pathname            = usePathname();
  const { data: dashboard } = useVendorDashboard();

  const segments   = pathname.split("/").filter(Boolean);
  const last       = segments[segments.length - 1] ?? "dashboard";
  const pageLabel  = PAGE_LABEL_MAP[last] ?? "Vendor";
  const storeName  = dashboard?.profile.store_name ?? "Fashionistar Vendor";
  const storeSlug  = dashboard?.profile.store_slug ?? "";

  const userFullName = user ? `${user.first_name} ${user.last_name}`.trim() : "";
  const initials = (userFullName || "V")
    .split(" ")
    .slice(0, 2)
    .map((w: string) => w[0])
    .join("")
    .toUpperCase();

  return (
    <header
      className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[#ECE6D6]/70 bg-white/92 backdrop-blur-xl px-4 lg:px-6"
      style={{ WebkitBackdropFilter: "blur(20px)" }}
    >
      {/* Left: Hamburger + Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          id="vendor-sidebar-toggle"
          aria-label="Open vendor navigation"
          aria-haspopup="dialog"
          onClick={onMenuClick}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#ECE6D6] text-[#7A6B44] transition-all hover:bg-[#F8F5ED] hover:scale-105 focus-visible:ring-2 focus-visible:ring-[#FDA600]/60 outline-none lg:hidden"
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </button>

        {/* Page breadcrumb */}
        <div>
          <h1 className="text-sm font-semibold text-[#1A1208] leading-none">{pageLabel}</h1>
          <p className="mt-0.5 text-[11px] text-[#7A6B44]/70 leading-none hidden sm:flex items-center gap-1">
            <span className="truncate max-w-[160px]">{storeName}</span>
            {storeSlug && (
              <>
                <span className="text-[#ECE6D6]">·</span>
                <Link
                  href={`/vendors/${storeSlug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-0.5 text-[#FDA600] hover:underline"
                >
                  View store <ArrowUpRight className="h-3 w-3" />
                </Link>
              </>
            )}
          </p>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* Add Product CTA */}
        <Link
          href="/vendor/products"
          id="vendor-topbar-add-product"
          className="hidden items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold text-black transition-all hover:scale-105 hover:shadow-md sm:flex"
          style={{ background: `linear-gradient(135deg, ${C.gold} 0%, ${C.goldDark} 100%)`, boxShadow: `0 2px 8px ${C.gold}40` }}
        >
          <PlusCircle className="h-3.5 w-3.5" aria-hidden="true" />
          Add Product
        </Link>

        {/* Chat */}
        <Link
          href="/vendor/chat"
          id="vendor-topbar-chat"
          aria-label="Messages"
          className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-[#ECE6D6] text-[#7A6B44] transition-all hover:bg-[#F8F5ED] hover:scale-105 focus-visible:ring-2 focus-visible:ring-[#FDA600]/60 outline-none"
        >
          <MessageSquare className="h-4 w-4" aria-hidden="true" />
        </Link>

        {/* Notifications */}
        <Link
          href="/vendor/notifications"
          id="vendor-topbar-notifications"
          aria-label="Notifications"
          className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-[#ECE6D6] text-[#7A6B44] transition-all hover:bg-[#F8F5ED] hover:scale-105 focus-visible:ring-2 focus-visible:ring-[#FDA600]/60 outline-none"
        >
          <Bell className="h-4 w-4" aria-hidden="true" />
          {/* Live badge — always show for demo; wire to real unread count later */}
          <span
            className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full ring-2 ring-white animate-pulse"
            style={{ background: C.gold }}
            aria-label="New notifications"
          />
        </Link>

        {/* Profile dropdown */}
        <ProfileDropdown initials={initials} storeName={storeName} />
      </div>
    </header>
  );
}

// ── Shell ─────────────────────────────────────────────────────────────────────
export function VendorShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const requiresVendorProfile = !pathname.startsWith("/vendor/setup");

  // Close sidebar on route change
  const prevPathRef = useRef(pathname);
  useEffect(() => {
    if (prevPathRef.current !== pathname) {
      prevPathRef.current = pathname;
      setIsSidebarOpen(false);
    }
  }, [pathname]);

  return (
    <RoleGuard requiredRole="vendor" requireVendorProfile={requiresVendorProfile}>
      <div className="min-h-screen" style={{ background: C.cream }}>
        {/* Sidebar */}
        <VendorSidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* Main content area */}
        <div className="lg:ml-[276px] flex flex-col min-h-screen">
          {/* Topbar */}
          <VendorTopbar onMenuClick={() => setIsSidebarOpen(true)} />

          {/* Page content */}
          <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8">
            {children}
          </main>
        </div>
      </div>
    </RoleGuard>
  );
}
