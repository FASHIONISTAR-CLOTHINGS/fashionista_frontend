"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  ArrowUpRight,
  BarChart3,
  Bell,
  ChevronRight,
  ClipboardCheck,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Package,
  PlusCircle,
  ReceiptText,
  Settings,
  ShoppingBag,
  Tag,
  Users,
  Wallet,
  X,
  Zap,
} from "lucide-react";

import { RoleGuard } from "@/features/auth/components/RoleGuard";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { useVendorDashboard } from "@/features/vendor/hooks/use-vendor-setup";

const vendorNavGroups = [
  {
    group: "Overview",
    items: [
      { href: "/vendor/dashboard", label: "Dashboard", Icon: LayoutDashboard },
      { href: "/vendor/analytics", label: "Analytics",  Icon: BarChart3 },
    ],
  },
  {
    group: "Catalog",
    items: [
      { href: "/vendor/products",         label: "Add Product", Icon: PlusCircle },
      { href: "/vendor/products/catalog", label: "My Products", Icon: ShoppingBag },
      { href: "/vendor/coupons",          label: "Coupons",     Icon: Tag },
    ],
  },
  {
    group: "Commerce",
    items: [
      { href: "/vendor/orders",       label: "Orders",       Icon: Package },
      { href: "/vendor/payments",     label: "Payments",     Icon: CreditCard },
      { href: "/vendor/transactions", label: "Transactions", Icon: ReceiptText },
      { href: "/vendor/customers",    label: "Customers",    Icon: Users },
    ],
  },
  {
    group: "Finance",
    items: [
      { href: "/vendor/wallet",  label: "Wallet",  Icon: Wallet },
      { href: "/vendor/payouts", label: "Payouts", Icon: Zap },
    ],
  },
  {
    group: "Account",
    items: [
      { href: "/vendor/kyc",      label: "KYC Verification", Icon: ClipboardCheck },
      { href: "/vendor/settings", label: "Settings",         Icon: Settings },
    ],
  },
];

function isActivePath(pathname: string, href: string) {
  if (href === "/vendor/products") {
    return pathname === href;
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

// ── Sidebar ────────────────────────────────────────────────────────────────────
function VendorSidebar({
  isOpen,
  onClose,
}: {
  isOpen:   boolean;
  onClose:  () => void;
}) {
  const pathname = usePathname();
  const router   = useRouter();
  const logout   = useAuthStore((s) => s.logout);
  const user     = useAuthStore((s) => s.user);
  const { data: dashboard } = useVendorDashboard();

  const userFullName = user ? `${user.first_name} ${user.last_name}`.trim() : "";
  const storeName = dashboard?.profile.store_name ?? userFullName || "My Store";
  const logoUrl   = dashboard?.profile.logo_url ?? "";
  const isVerified = dashboard?.profile.is_verified ?? false;

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
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex w-[272px] flex-col
          bg-gradient-to-b from-[#1a1208] to-[#0f0c05]
          border-r border-white/5
          transition-transform duration-300 ease-out
          lg:translate-x-0
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-white/8">
          <Link href="/vendor/dashboard" onClick={onClose} className="flex items-center gap-3 group">
            {logoUrl ? (
              <div className="relative h-9 w-9 overflow-hidden rounded-xl ring-1 ring-[#FDA600]/30">
                <Image src={logoUrl} alt={storeName} fill className="object-cover" />
              </div>
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#FDA600] to-[#f28705] shadow-lg shadow-[#FDA600]/20">
                <ShoppingBag className="h-5 w-5 text-black" />
              </div>
            )}
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white leading-none">{storeName}</p>
              <p className="mt-0.5 text-xs text-white/40 leading-none">Fashionistar Vendor</p>
            </div>
          </Link>
          <button
            type="button"
            aria-label="Close navigation"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-white/40 hover:bg-white/10 hover:text-white transition-colors lg:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Verification badge */}
        {isVerified && (
          <div className="mx-4 mt-3 flex items-center gap-2 rounded-lg bg-[#FDA600]/10 border border-[#FDA600]/20 px-3 py-2">
            <div className="h-1.5 w-1.5 rounded-full bg-[#FDA600] animate-pulse" />
            <span className="text-xs font-medium text-[#FDA600]">Verified Vendor</span>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-5 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
          {vendorNavGroups.map(({ group, items }) => (
            <div key={group}>
              <p className="mb-1.5 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-white/30">
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
                      className={`
                        group relative flex items-center gap-3 rounded-xl px-3 py-2.5
                        text-sm font-medium transition-all duration-150
                        ${active
                          ? "bg-[#FDA600] text-black shadow-lg shadow-[#FDA600]/20"
                          : "text-white/60 hover:bg-white/6 hover:text-white"
                        }
                      `}
                    >
                      <Icon className={`h-4 w-4 flex-shrink-0 transition-transform group-hover:scale-110 ${active ? "text-black" : ""}`} />
                      <span className="flex-1 truncate">{label}</span>
                      {active && <ChevronRight className="h-3 w-3 text-black/50" />}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-white/8 px-3 py-4">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/50 transition-colors hover:bg-red-500/10 hover:text-red-400"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign out</span>
          </button>
        </div>
      </aside>
    </>
  );
}

// ── Topbar ─────────────────────────────────────────────────────────────────────
function VendorTopbar({ onMenuClick }: { onMenuClick: () => void }) {
  const user      = useAuthStore((s) => s.user);
  const pathname  = usePathname();
  const { data: dashboard } = useVendorDashboard();

  // Derive page label from current path
  const pageLabel = (() => {
    const segments = pathname.split("/").filter(Boolean);
    const last     = segments[segments.length - 1] ?? "dashboard";
    const map: Record<string, string> = {
      dashboard: "Dashboard",
      analytics: "Analytics",
      orders:    "Orders",
      payments:  "Payments",
      transactions: "Transactions",
      customers: "Customers",
      wallet:    "Wallet",
      payouts:   "Payouts",
      kyc:       "KYC Verification",
      settings:  "Settings",
      coupons:   "Coupons",
      products:  "Products",
      catalog:   "Catalog",
      setup:     "Store Setup",
    };
    return map[last] ?? "Vendor";
  })();

  const userFullName = user ? `${user.first_name} ${user.last_name}`.trim() : "";
  const initials = (userFullName || "V")
    .split(" ")
    .slice(0, 2)
    .map((w: string) => w[0])
    .join("")
    .toUpperCase();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[#ECE6D6]/60 bg-white/90 backdrop-blur-xl px-4 lg:px-6">
      {/* Left: Menu button + page title */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          aria-label="Open vendor navigation"
          onClick={onMenuClick}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#ECE6D6] text-[#7A6B44] transition-colors hover:bg-[#F8F5ED] lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-sm font-semibold text-black leading-none">{pageLabel}</h1>
          <p className="mt-0.5 text-xs text-[#7A6B44]/80 leading-none hidden sm:block">
            {dashboard?.profile.store_name ?? "Fashionistar Vendor Portal"}
          </p>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* Quick add product */}
        <Link
          href="/vendor/products"
          className="hidden items-center gap-2 rounded-xl bg-[#FDA600] px-4 py-2 text-xs font-semibold text-black transition hover:bg-[#f28705] sm:flex"
        >
          <PlusCircle className="h-3.5 w-3.5" />
          Add Product
        </Link>

        {/* Notifications */}
        <button
          type="button"
          aria-label="Notifications"
          className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-[#ECE6D6] text-[#7A6B44] transition-colors hover:bg-[#F8F5ED]"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[#FDA600] ring-2 ring-white" />
        </button>

        {/* Chat */}
        <button
          type="button"
          aria-label="Messages"
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#ECE6D6] text-[#7A6B44] transition-colors hover:bg-[#F8F5ED]"
        >
          <MessageSquare className="h-4 w-4" />
        </button>

        {/* Avatar */}
        <Link
          href="/vendor/settings"
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#FDA600] to-[#f28705] text-xs font-bold text-black shadow-sm transition hover:opacity-90"
          aria-label="Account settings"
        >
          {initials}
        </Link>
      </div>
    </header>
  );
}

// ── Shell ─────────────────────────────────────────────────────────────────────
export function VendorShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const requiresVendorProfile = !pathname.startsWith("/vendor/setup");

  return (
    <RoleGuard requiredRole="vendor" requireVendorProfile={requiresVendorProfile}>
      <div className="min-h-screen bg-[#FAFAF8]">
        {/* Sidebar */}
        <VendorSidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* Main content area */}
        <div className="lg:ml-[272px] flex flex-col min-h-screen">
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
