"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  Activity,
  ArrowUpRight,
  BarChart3,
  Bell,
  ChevronLeft,
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
import { useUnreadBadgeCount } from "@/features/notification/hooks/use-notification";
import { useConversations } from "@/features/chat/hooks/use-chat";

// ── Brand Palette ─────────────────────────────────────────────────────────────
const C = {
  green:    "#0f1d0b",
  greenMid: "#1a2e14",
  greenEnd: "#0a120a",
  gold:     "#FDA600",
  goldDark: "#E8960A",
  cream:    "#F8F5ED",
  creamB:   "#ECE6D6",
  muted:    "#7A6B44",
  ink:      "#1A1208",
} as const;

// ── Nav Structure ─────────────────────────────────────────────────────────────
const vendorNavGroups = [
  {
    group: "Overview",
    items: [
      { href: "/vendor/dashboard", label: "Dashboard",  Icon: LayoutDashboard },
      { href: "/vendor/analytics", label: "Analytics",  Icon: BarChart3 },
      { href: "/vendor/chat",      label: "Messages",   Icon: MessageSquare },
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
      { href: "/vendor/kyc",        label: "KYC Verification", Icon: ClipboardCheck },
      { href: "/vendor/support",    label: "Support Tickets",  Icon: Headphones     },
      { href: "/vendor/audit-logs", label: "Audit Log",        Icon: Activity       },
      { href: "/vendor/settings",   label: "Settings",         Icon: Settings       },
    ],
  },
];

const PAGE_LABEL_MAP: Record<string, string> = {
  dashboard:     "Dashboard",
  analytics:     "Analytics",
  orders:        "Orders",
  payments:      "Payments",
  transactions:  "Transactions",
  customers:     "Customers",
  wallet:        "Wallet",
  payouts:       "Payouts",
  kyc:           "KYC Verification",
  settings:      "Settings",
  coupons:       "Coupons",
  products:      "Products",
  catalog:       "Catalog",
  setup:         "Store Setup",
  support:       "Support",
  chat:          "Messages",
  notifications: "Notifications",
  "audit-logs":  "Audit Log",
};

function isActivePath(pathname: string, href: string) {
  if (href === "/vendor/products") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

// ── Sidebar Component ─────────────────────────────────────────────────────────
function VendorSidebar({
  isOpen,
  onClose,
  collapsed,
  onToggleCollapse,
}: {
  isOpen:             boolean;
  onClose:            () => void;
  collapsed:          boolean;
  onToggleCollapse:   () => void;
}) {
  const pathname               = usePathname();
  const router                 = useRouter();
  const logout                 = useAuthStore((s) => s.logout);
  const user                   = useAuthStore((s) => s.user);
  const { data: dashboard }    = useVendorDashboard();
  const { data: conversations } = useConversations(false);

  const userFullName   = user ? `${user.first_name} ${user.last_name}`.trim() : "";
  const storeName      = dashboard?.profile.store_name ?? (userFullName || "My Store");
  const logoUrl        = dashboard?.profile.logo_url ?? "";
  const isVerified     = dashboard?.profile.is_verified ?? false;
  const walletBalance  = dashboard?.wallet?.balance ?? 0;
  const storeSlug      = dashboard?.profile.store_slug ?? "";

  const unreadMessages = (conversations ?? []).reduce(
    (acc: number, c: any) => acc + (c.unread_count ?? 0),
    0
  );

  const handleLogout = () => {
    logout();
    router.replace("/auth/sign-in");
  };

  const sidebarW = collapsed ? "w-[72px]" : "w-[272px]";

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
          tabIndex={-1}
        />
      )}

      {/* Sidebar panel */}
      <aside
        style={{
          background: `linear-gradient(180deg, ${C.green} 0%, ${C.greenMid} 55%, ${C.greenEnd} 100%)`,
          boxShadow: "4px 0 32px rgba(0,0,0,0.35)",
        }}
        className={[
          "fixed inset-y-0 left-0 z-50 flex flex-col",
          sidebarW,
          "border-r border-white/6",
          "transition-all duration-300 ease-out will-change-transform",
          "lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
        aria-label="Vendor navigation"
      >
        {/* ── Brand Header ── */}
        <div
          className="relative flex items-center gap-3 px-4 py-4 border-b border-white/8"
          style={{
            background: "linear-gradient(135deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.02) 100%)",
            backdropFilter: "blur(8px)",
          }}
        >
          {/* Logo / Avatar */}
          <Link
            href="/vendor/dashboard"
            onClick={onClose}
            className="flex items-center gap-3 group min-w-0 flex-1"
            aria-label="Go to dashboard"
          >
            <div className="relative flex-shrink-0">
              {logoUrl ? (
                <div className="relative h-9 w-9 overflow-hidden rounded-xl ring-2 ring-[#FDA600]/50 shadow-lg shadow-[#FDA600]/20">
                  <Image src={logoUrl} alt={storeName} fill className="object-cover" />
                </div>
              ) : (
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-xl shadow-lg flex-shrink-0"
                  style={{
                    background: `linear-gradient(135deg, ${C.gold} 0%, ${C.goldDark} 100%)`,
                    boxShadow: `0 4px 16px ${C.gold}45`,
                  }}
                >
                  <ShoppingBag className="h-4 w-4 text-black" />
                </div>
              )}
              {/* Live dot */}
              <span className="absolute -bottom-0.5 -right-0.5 flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-[#0f1d0b]" />
              </span>
            </div>

            {!collapsed && (
              <div className="min-w-0 flex-1 overflow-hidden">
                <p className="truncate text-sm font-bold text-white leading-none">{storeName}</p>
                <div className="flex items-center gap-1 mt-1">
                  <Sparkles className="h-2.5 w-2.5 text-[#FDA600]/70 flex-shrink-0" />
                  <p className="text-[10px] text-white/35 leading-none truncate">Fashionistar Vendor</p>
                </div>
              </div>
            )}
          </Link>

          {/* Close on mobile / collapse toggle on desktop */}
          <button
            type="button"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            onClick={collapsed ? onToggleCollapse : onClose}
            className="lg:hidden flex h-7 w-7 items-center justify-center rounded-lg text-white/40 hover:bg-white/10 hover:text-white transition-all flex-shrink-0 ml-auto"
          >
            <X className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            onClick={onToggleCollapse}
            className="hidden lg:flex h-7 w-7 items-center justify-center rounded-lg text-white/40 hover:bg-white/10 hover:text-white transition-all flex-shrink-0 ml-auto"
          >
            {collapsed
              ? <ChevronRight className="h-3.5 w-3.5" />
              : <ChevronLeft className="h-3.5 w-3.5" />
            }
          </button>
        </div>

        {/* ── Status Ribbon ── */}
        {!collapsed && (
          <div
            className="mx-3 mt-3 rounded-2xl p-3 flex items-center justify-between gap-2"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              backdropFilter: "blur(4px)",
            }}
          >
            <div className="flex items-center gap-2 min-w-0">
              <div className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${
                isVerified ? "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" : "bg-amber-400"
              }`} />
              <span className={`text-[10px] font-semibold truncate ${
                isVerified ? "text-emerald-400" : "text-amber-300"
              }`}>
                {isVerified ? "Verified Store" : "Pending Verification"}
              </span>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-[9px] text-white/30 leading-none">Balance</p>
              <p className="text-xs font-bold text-[#FDA600] leading-none mt-0.5">
                ₦{walletBalance.toLocaleString()}
              </p>
            </div>
          </div>
        )}

        {/* Collapsed: mini balance pill */}
        {collapsed && (
          <div className="mx-auto mt-3 flex h-8 w-8 items-center justify-center rounded-xl"
            style={{ background: `${C.gold}22`, border: `1px solid ${C.gold}30` }}>
            <Wallet className="h-4 w-4 text-[#FDA600]" />
          </div>
        )}

        {/* ── Navigation ── */}
        <nav
          className="flex-1 overflow-y-auto px-2 py-4 space-y-5 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10"
          aria-label="Main vendor menu"
        >
          {vendorNavGroups.map(({ group, items }) => (
            <div key={group} role="group" aria-labelledby={`nav-group-${group}`}>
              {!collapsed && (
                <p
                  id={`nav-group-${group}`}
                  className="mb-1.5 px-3 text-[9px] font-black uppercase tracking-[0.22em] text-white/20"
                >
                  {group}
                </p>
              )}
              {collapsed && (
                <div className="mb-1.5 mx-auto h-px w-8 bg-white/10" />
              )}
              <div className="space-y-0.5">
                {items.map(({ href, label, Icon }) => {
                  const active = isActivePath(pathname, href);
                  // Message badge
                  const hasBadge = href === "/vendor/chat" && unreadMessages > 0;
                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={onClose}
                      aria-current={active ? "page" : undefined}
                      title={collapsed ? label : undefined}
                      className={[
                        "group relative flex items-center rounded-xl px-3 py-2.5",
                        "text-sm font-medium outline-none transition-all duration-200 ease-out",
                        "focus-visible:ring-2 focus-visible:ring-[#FDA600]/60",
                        collapsed ? "justify-center" : "gap-3",
                        active
                          ? "text-[#0f1d0b] font-semibold shadow-lg"
                          : "text-white/60 hover:bg-white/8 hover:text-white",
                      ].join(" ")}
                      style={active ? {
                        background: `linear-gradient(135deg, ${C.gold} 0%, ${C.goldDark} 100%)`,
                        boxShadow: `0 4px 18px ${C.gold}40`,
                      } : undefined}
                    >
                      {/* Active left bar */}
                      {active && !collapsed && (
                        <span
                          className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r-full bg-black/25"
                        />
                      )}

                      <div className="relative flex-shrink-0">
                        <Icon
                          className={[
                            "h-4 w-4 transition-transform duration-200",
                            "group-hover:scale-110",
                            active ? "text-[#0f1d0b]" : "text-white/60 group-hover:text-white",
                          ].join(" ")}
                          aria-hidden="true"
                        />
                        {hasBadge && (
                          <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold text-black"
                            style={{ background: C.gold }}>
                            {unreadMessages > 9 ? "9+" : unreadMessages}
                          </span>
                        )}
                      </div>

                      {!collapsed && (
                        <>
                          <span className="flex-1 truncate">{label}</span>
                          {active && (
                            <ChevronRight className="h-3 w-3 text-[#0f1d0b]/50" aria-hidden="true" />
                          )}
                        </>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* ── Footer ── */}
        <div
          className="border-t border-white/8 px-2 py-3 space-y-0.5"
          style={{ background: "rgba(0,0,0,0.12)" }}
        >
          {/* View Public Store */}
          {storeSlug && !collapsed && (
            <Link
              href={`/vendors/${storeSlug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold text-white/35 transition-all hover:bg-white/6 hover:text-white/70 group"
            >
              <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 flex-shrink-0" />
              <span>View Public Store</span>
            </Link>
          )}

          {/* Sign Out */}
          <button
            type="button"
            onClick={handleLogout}
            title={collapsed ? "Sign out" : undefined}
            className={[
              "flex w-full items-center rounded-xl px-3 py-2.5 text-xs font-semibold text-white/35",
              "transition-all hover:bg-red-500/12 hover:text-red-400",
              collapsed ? "justify-center" : "gap-3",
            ].join(" ")}
          >
            <LogOut className="h-3.5 w-3.5 flex-shrink-0" />
            {!collapsed && <span>Sign out</span>}
          </button>
        </div>
      </aside>
    </>
  );
}

// ── Profile Dropdown ──────────────────────────────────────────────────────────
interface ProfileDropdownProps {
  initials:   string;
  storeName:  string;
  userEmail?: string;
  logoUrl?:   string;
}

function ProfileDropdown({ initials, storeName, userEmail, logoUrl }: ProfileDropdownProps) {
  const router  = useRouter();
  const logout  = useAuthStore((s) => s.logout);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  useEffect(() => {
    function handler(e: KeyboardEvent) { if (e.key === "Escape") setOpen(false); }
    if (open) document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        id="vendor-profile-btn"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="relative flex h-9 w-9 items-center justify-center rounded-xl text-xs font-bold text-black shadow-sm transition-all hover:scale-105 focus-visible:ring-2 focus-visible:ring-[#FDA600]/60 outline-none overflow-hidden"
        style={{
          boxShadow: `0 0 0 2px ${C.gold}40, 0 2px 8px rgba(0,0,0,0.12)`,
        }}
        aria-label="Profile menu"
        title={storeName}
      >
        {logoUrl ? (
          <Image src={logoUrl} alt={storeName} width={36} height={36} className="h-full w-full object-cover" />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center"
            style={{ background: `linear-gradient(135deg, ${C.gold} 0%, ${C.goldDark} 100%)` }}
          >
            {initials}
          </div>
        )}
        {/* Online ring pulse */}
        <span className="absolute -bottom-0.5 -right-0.5 flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-50" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-white" />
        </span>
      </button>

      {open && (
        <div
          role="menu"
          aria-labelledby="vendor-profile-btn"
          className="absolute right-0 top-full mt-2 w-56 origin-top-right rounded-2xl border border-[#ECE6D6] bg-white shadow-2xl shadow-black/15 overflow-hidden z-50"
          style={{ animation: "dropIn 0.15s cubic-bezier(0.16,1,0.3,1)" }}
        >
          <style>{`
            @keyframes dropIn {
              from { opacity:0; transform:scale(0.93) translateY(-6px); }
              to   { opacity:1; transform:scale(1) translateY(0); }
            }
          `}</style>

          {/* Header */}
          <div
            className="px-4 py-3.5 border-b border-[#ECE6D6]"
            style={{ background: "linear-gradient(135deg, #FAFAF8 0%, #F8F5ED 100%)" }}
          >
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#7A6B44]">Signed in as</p>
            <p className="mt-0.5 text-sm font-bold text-[#1A1208] truncate">{storeName}</p>
            {userEmail && (
              <p className="mt-0.5 text-[11px] text-[#7A6B44] truncate">{userEmail}</p>
            )}
          </div>

          {/* Links */}
          <div className="py-1">
            {[
              { href: "/vendor/settings",      label: "Settings",       icon: Settings  },
              { href: "/vendor/kyc",           label: "KYC Status",     icon: ClipboardCheck },
              { href: "/vendor/notifications", label: "Notifications",  icon: Bell      },
            ].map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                role="menuitem"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#1A1208] hover:bg-[#F8F5ED] transition-colors"
              >
                <Icon className="h-4 w-4 text-[#7A6B44]" />
                {label}
              </Link>
            ))}
          </div>

          <div className="border-t border-[#ECE6D6] py-1">
            <button
              type="button"
              role="menuitem"
              onClick={() => { setOpen(false); logout(); router.replace("/auth/sign-in"); }}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
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
function VendorTopbar({
  onMenuClick,
  sidebarCollapsed: _sidebarCollapsed,
}: {
  onMenuClick:       () => void;
  sidebarCollapsed:  boolean;
}) {
  const user                = useAuthStore((s) => s.user);
  const pathname            = usePathname();
  const { data: dashboard } = useVendorDashboard();
  const { data: unreadNotificationsCount } = useUnreadBadgeCount();
  const { data: conversations } = useConversations(false);

  const segments   = pathname.split("/").filter(Boolean);
  const last       = segments[segments.length - 1] ?? "dashboard";
  const pageLabel  = PAGE_LABEL_MAP[last] ?? "Vendor";
  const storeName  = dashboard?.profile.store_name ?? "Fashionistar Vendor";
  const storeSlug  = dashboard?.profile.store_slug ?? "";
  const logoUrl    = dashboard?.profile.logo_url ?? "";

  const userFullName = user ? `${user.first_name} ${user.last_name}`.trim() : "";
  const userEmail    = user?.email ?? "";
  const initials     = (userFullName || "V")
    .split(" ").slice(0, 2).map((w: string) => w[0]).join("").toUpperCase();

  const unreadMessagesCount = (conversations ?? []).reduce(
    (acc: number, c: any) => acc + (c.unread_count ?? 0), 0
  );

  return (
    <header
      className="sticky top-0 z-30 flex h-[60px] items-center justify-between border-b border-[#ECE6D6]/60 px-4 lg:px-6"
      style={{
        background: "rgba(248,245,237,0.90)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        boxShadow: "0 1px 0 rgba(0,0,0,0.04)",
      }}
    >
      {/* Left: Hamburger + Breadcrumb */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          id="vendor-sidebar-toggle"
          aria-label="Open vendor navigation"
          aria-haspopup="dialog"
          onClick={onMenuClick}
          className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl border border-[#ECE6D6] text-[#7A6B44] transition-all hover:bg-[#F8F5ED] hover:scale-105 focus-visible:ring-2 focus-visible:ring-[#FDA600]/60 outline-none lg:hidden"
        >
          <Menu className="h-4 w-4" aria-hidden="true" />
        </button>

        {/* Breadcrumb */}
        <div className="min-w-0">
          <h1 className="text-sm font-bold text-[#1A1208] leading-none truncate">{pageLabel}</h1>
          <p className="mt-0.5 text-[11px] text-[#7A6B44]/60 leading-none hidden sm:flex items-center gap-1.5 truncate">
            <span className="truncate max-w-[140px]">{storeName}</span>
            {storeSlug && (
              <>
                <span className="text-[#D9D9D9]">·</span>
                <Link
                  href={`/vendors/${storeSlug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-0.5 text-[#FDA600] hover:underline flex-shrink-0"
                >
                  View store <ArrowUpRight className="h-2.5 w-2.5" />
                </Link>
              </>
            )}
          </p>
        </div>
      </div>

      {/* Right: Action cluster */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        {/* Add Product CTA */}
        <Link
          href="/vendor/products"
          id="vendor-topbar-add-product"
          className="hidden items-center gap-1.5 rounded-xl px-4 py-1.5 text-xs font-bold text-black transition-all hover:scale-105 hover:shadow-md sm:flex"
          style={{
            background: `linear-gradient(135deg, ${C.gold} 0%, ${C.goldDark} 100%)`,
            boxShadow: `0 2px 10px ${C.gold}35`,
          }}
        >
          <PlusCircle className="h-3.5 w-3.5" aria-hidden="true" />
          Add Product
        </Link>

        {/* Messages */}
        <Link
          href="/vendor/chat"
          id="vendor-topbar-chat"
          aria-label="Messages"
          className="relative flex h-8 w-8 items-center justify-center rounded-xl border border-[#ECE6D6] text-[#7A6B44] transition-all hover:bg-[#F8F5ED] hover:scale-105 focus-visible:ring-2 focus-visible:ring-[#FDA600]/60 outline-none"
        >
          <MessageSquare className="h-4 w-4" aria-hidden="true" />
          {unreadMessagesCount > 0 && (
            <span
              className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[9px] font-bold text-black ring-2 ring-white"
              style={{ background: C.gold }}
            >
              {unreadMessagesCount > 9 ? "9+" : unreadMessagesCount}
            </span>
          )}
        </Link>

        {/* Notifications */}
        <Link
          href="/vendor/notifications"
          id="vendor-topbar-notifications"
          aria-label="Notifications"
          className="relative flex h-8 w-8 items-center justify-center rounded-xl border border-[#ECE6D6] text-[#7A6B44] transition-all hover:bg-[#F8F5ED] hover:scale-105 focus-visible:ring-2 focus-visible:ring-[#FDA600]/60 outline-none"
        >
          <Bell className="h-4 w-4" aria-hidden="true" />
          {unreadNotificationsCount !== undefined && unreadNotificationsCount > 0 && (
            <span
              className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[9px] font-bold text-black ring-2 ring-white"
              style={{ background: C.gold }}
            >
              {unreadNotificationsCount > 9 ? "9+" : unreadNotificationsCount}
            </span>
          )}
        </Link>

        {/* Profile */}
        <ProfileDropdown
          initials={initials}
          storeName={storeName}
          userEmail={userEmail}
          logoUrl={logoUrl}
        />
      </div>
    </header>
  );
}

// ── Shell ─────────────────────────────────────────────────────────────────────
export function VendorShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen]       = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const requiresVendorProfile = !pathname.startsWith("/vendor/setup");

  // Close sidebar on route change
  const prevPathRef = useRef(pathname);
  useEffect(() => {
    if (prevPathRef.current !== pathname) {
      prevPathRef.current = pathname;
      setIsSidebarOpen(false);
    }
  }, [pathname]);

  const sidebarWidth = sidebarCollapsed ? "lg:ml-[72px]" : "lg:ml-[272px]";

  return (
    <RoleGuard requiredRole="vendor" requireVendorProfile={requiresVendorProfile}>
      <div className="min-h-screen" style={{ background: C.cream }}>
        {/* Sidebar */}
        <VendorSidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed((c) => !c)}
        />

        {/* Main content area */}
        <div className={`${sidebarWidth} flex flex-col min-h-screen transition-all duration-300`}>
          <VendorTopbar
            onMenuClick={() => setIsSidebarOpen(true)}
            sidebarCollapsed={sidebarCollapsed}
          />
          <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8">
            {children}
          </main>
        </div>
      </div>
    </RoleGuard>
  );
}
