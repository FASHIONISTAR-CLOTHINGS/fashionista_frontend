"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  Bell,
  ChevronDown,
  ChevronRight,
  ClipboardCheck,
  CreditCard,
  Heart,
  LayoutDashboard,
  LogOut,
  MapPin,
  Menu,
  MessageCircle,
  Package,
  PackageSearch,
  Palette,
  ReceiptText,
  Settings,
  Sparkles,
  TicketCheck,
  UserRound,
  Wallet,
  X,
} from "lucide-react";

import { RoleGuard } from "@/features/auth/components/RoleGuard";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { useClientProfile } from "@/features/client/hooks/use-client-profile";

// ── Nav Item Config ──────────────────────────────────────────────────────────

type NavItem = {
  href: string;
  label: string;
  Icon: React.ElementType;
  badge?: number;
};

type NavGroup = {
  label: string;
  items: NavItem[];
};

const NAV_GROUPS: NavGroup[] = [
  {
    label: "Overview",
    items: [
      { href: "/client/dashboard", label: "Dashboard", Icon: LayoutDashboard },
    ],
  },
  {
    label: "Shopping",
    items: [
      { href: "/client/dashboard/orders", label: "My Orders", Icon: Package },
      { href: "/client/dashboard/orders/track-order", label: "Track Order", Icon: PackageSearch },
      { href: "/client/dashboard/custom-orders", label: "Custom Orders", Icon: Palette },
      { href: "/client/dashboard/wishlist", label: "Wishlist", Icon: Heart },
    ],
  },
  {
    label: "Finance",
    items: [
      { href: "/client/dashboard/wallet", label: "Wallet", Icon: Wallet },
      { href: "/client/dashboard/payments", label: "Payments", Icon: CreditCard },
      { href: "/client/dashboard/transactions", label: "Transactions", Icon: ReceiptText },
    ],
  },
  {
    label: "Account",
    items: [
      { href: "/client/dashboard/kyc", label: "KYC Verification", Icon: ClipboardCheck },
      { href: "/client/dashboard/address", label: "Addresses", Icon: MapPin },
      { href: "/client/dashboard/account-details", label: "Profile", Icon: UserRound },
      { href: "/client/dashboard/settings", label: "Settings", Icon: Settings },
    ],
  },
  {
    label: "Support",
    items: [
      { href: "/client/messages", label: "Messages", Icon: MessageCircle },
      { href: "/client/dashboard/support", label: "Support Tickets", Icon: TicketCheck },
    ],
  },
];

const isActivePath = (pathname: string, href: string) =>
  pathname === href || (href !== "/client/dashboard" && pathname.startsWith(`${href}/`));

// ── Avatar Component ──────────────────────────────────────────────────────────
function Avatar({ email, size = "md" }: { email: string; size?: "sm" | "md" | "lg" }) {
  const initials = email ? email.slice(0, 2).toUpperCase() : "CL";
  const sizeClasses = {
    sm: "h-7 w-7 text-xs",
    md: "h-9 w-9 text-sm",
    lg: "h-11 w-11 text-base",
  };
  return (
    <div
      className={`${sizeClasses[size]} flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#FDA600] to-[#f28705] font-bold text-black shadow-sm`}
    >
      {initials}
    </div>
  );
}

// ── Notification Bell ─────────────────────────────────────────────────────────
function NotificationBell() {
  const [unreadCount] = useState(3); // TODO: wire to useClientNotifications()
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const MOCK_NOTIFS = [
    { id: "1", title: "Order dispatched", message: "Your Agbada order is on its way!", time: "2m ago", read: false },
    { id: "2", title: "Custom order approved", message: "Vendor approved your design brief.", time: "1h ago", read: false },
    { id: "3", title: "Wallet credited", message: "₦5,000 has been added to your wallet.", time: "3h ago", read: true },
  ];

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        id="client-notifications-bell"
        onClick={() => setOpen((v) => !v)}
        className="relative flex h-9 w-9 items-center justify-center rounded-full border border-[#ECE6D6] bg-white text-[#5A6465] transition hover:bg-[#F8F5ED] hover:text-black"
        aria-label="Notifications"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#FDA600] text-[9px] font-bold text-black">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-11 z-50 w-80 overflow-hidden rounded-[20px] border border-[#ECE6D6] bg-white shadow-xl">
          <div className="flex items-center justify-between border-b border-[#ECE6D6] px-4 py-3">
            <p className="text-sm font-semibold text-black">Notifications</p>
            <button type="button" className="text-xs font-medium text-[#01454A] hover:underline">
              Mark all read
            </button>
          </div>
          <div className="max-h-72 divide-y divide-[#F4F3EC] overflow-y-auto">
            {MOCK_NOTIFS.map((n) => (
              <div
                key={n.id}
                className={`flex gap-3 px-4 py-3 transition hover:bg-[#F8F5ED] ${!n.read ? "bg-[#FFFDF5]" : ""}`}
              >
                <div className={`mt-1 h-2 w-2 shrink-0 rounded-full ${!n.read ? "bg-[#FDA600]" : "bg-transparent"}`} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-black">{n.title}</p>
                  <p className="truncate text-xs leading-5 text-[#5A6465]">{n.message}</p>
                  <p className="mt-1 text-[10px] text-[#A89A7A]">{n.time}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-[#ECE6D6] px-4 py-3">
            <Link
              href="/client/dashboard/notifications"
              onClick={() => setOpen(false)}
              className="block text-center text-xs font-semibold text-[#01454A] hover:underline"
            >
              View all notifications →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Profile Dropdown ──────────────────────────────────────────────────────────
function ProfileDropdown({
  email,
  onLogout,
}: {
  email: string;
  onLogout: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        id="client-profile-dropdown"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full border border-[#ECE6D6] bg-white py-1.5 pl-1.5 pr-3 transition hover:bg-[#F8F5ED]"
        aria-label="Profile menu"
      >
        <Avatar email={email} size="sm" />
        <span className="hidden max-w-[120px] truncate text-xs font-semibold text-black sm:block">
          {email.split("@")[0]}
        </span>
        <ChevronDown className="h-3.5 w-3.5 text-[#5A6465]" />
      </button>

      {open && (
        <div className="absolute right-0 top-11 z-50 w-52 overflow-hidden rounded-[20px] border border-[#ECE6D6] bg-white shadow-xl">
          <div className="px-4 py-3 border-b border-[#ECE6D6]">
            <p className="text-xs font-semibold text-[#7A6B44] uppercase tracking-wide">Signed in as</p>
            <p className="truncate text-sm font-semibold text-black">{email}</p>
          </div>
          {[
            { href: "/client/dashboard", label: "Dashboard", Icon: LayoutDashboard },
            { href: "/client/dashboard/account-details", label: "Profile", Icon: UserRound },
            { href: "/client/dashboard/settings", label: "Settings", Icon: Settings },
          ].map(({ href, label, Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-[#5A6465] transition hover:bg-[#F8F5ED] hover:text-black"
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
          <div className="border-t border-[#ECE6D6]">
            <button
              type="button"
              onClick={() => { setOpen(false); onLogout(); }}
              className="flex w-full items-center gap-3 px-4 py-3 text-sm font-medium text-red-500 transition hover:bg-red-50"
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

// ── Page Title from Pathname ───────────────────────────────────────────────────
function usePageTitle(pathname: string): string {
  const allItems = NAV_GROUPS.flatMap((g) => g.items);
  const match = allItems
    .slice()
    .sort((a, b) => b.href.length - a.href.length)
    .find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`));
  return match?.label ?? "Dashboard";
}

// ── Sidebar Nav Group ────────────────────────────────────────────────────────
function SidebarGroup({
  group,
  pathname,
  onItemClick,
}: {
  group: NavGroup;
  pathname: string;
  onItemClick: () => void;
}) {
  const hasActive = group.items.some((i) => isActivePath(pathname, i.href));
  const [expanded, setExpanded] = useState(hasActive || group.label === "Overview");

  return (
    <div>
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center justify-between px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-white/40 transition hover:text-white/70"
      >
        <span>{group.label}</span>
        <ChevronDown
          className={`h-3 w-3 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
        />
      </button>

      {expanded && (
        <div className="mt-0.5 space-y-0.5">
          {group.items.map(({ href, label, Icon, badge }) => {
            const active = isActivePath(pathname, href);
            return (
              <Link
                key={href}
                href={href}
                onClick={onItemClick}
                className={`group flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
                  active
                    ? "bg-[#FDA600] text-black shadow-sm"
                    : "text-white/70 hover:bg-white/8 hover:text-white"
                }`}
              >
                <span className="flex items-center gap-3">
                  <Icon
                    className={`h-4 w-4 shrink-0 transition-transform duration-150 ${
                      active ? "scale-110" : "group-hover:scale-105"
                    }`}
                  />
                  <span className="truncate">{label}</span>
                </span>
                {badge !== undefined && badge > 0 && (
                  <span
                    className={`flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-bold ${
                      active ? "bg-black/20 text-black" : "bg-[#FDA600] text-black"
                    }`}
                  >
                    {badge}
                  </span>
                )}
                {active && <ChevronRight className="ml-auto h-3.5 w-3.5 opacity-60" />}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Main Shell ────────────────────────────────────────────────────────────────
export function ClientShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);
  const { data: profile } = useClientProfile();
  const [isOpen, setIsOpen] = useState(false);
  const pageTitle = usePageTitle(pathname);

  const handleLogout = () => {
    logout();
    router.replace("/auth/sign-in");
  };

  const closeMenu = () => setIsOpen(false);

  const userEmail = profile?.user_email ?? "";
  const completionPct = profile?.is_profile_complete ? 100 : 40;

  return (
    <RoleGuard requiredRole="client">
      <div className="min-h-screen bg-[#F4F3EC] text-black lg:flex">

        {/* ── Mobile overlay ─────────────────────────────────────────── */}
        {isOpen && (
          <button
            type="button"
            aria-label="Close navigation"
            onClick={closeMenu}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          />
        )}

        {/* ── Sidebar ────────────────────────────────────────────────── */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 flex w-[272px] flex-col bg-[#111111] transition-transform duration-300 ease-in-out lg:translate-x-0 ${
            isOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {/* Brand header */}
          <div className="flex items-center justify-between border-b border-white/8 px-5 py-5">
            <Link
              href="/client/dashboard"
              className="flex items-center gap-3"
              onClick={closeMenu}
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#FDA600]">
                <Sparkles className="h-5 w-5 text-black" />
              </div>
              <div>
                <span className="block font-bon_foyage text-xl leading-none text-white">
                  Fashionistar
                </span>
                <span className="block text-[9px] font-medium uppercase tracking-[0.15em] text-white/40">
                  Client Portal
                </span>
              </div>
            </Link>
            <button
              type="button"
              aria-label="Close navigation"
              onClick={closeMenu}
              className="rounded-lg border border-white/10 p-1.5 text-white/60 hover:text-white lg:hidden"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Profile mini-card */}
          {userEmail && (
            <div className="mx-4 my-4 rounded-xl bg-white/5 px-4 py-3">
              <div className="flex items-center gap-3">
                <Avatar email={userEmail} size="md" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-white">
                    {userEmail.split("@")[0]}
                  </p>
                  <p className="truncate text-[10px] text-white/50">{userEmail}</p>
                </div>
              </div>
              {/* Profile completion bar */}
              <div className="mt-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[9px] font-semibold uppercase tracking-wide text-white/40">
                    Profile {completionPct}% complete
                  </span>
                </div>
                <div className="h-1 w-full overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-[#FDA600] transition-all duration-700"
                    style={{ width: `${completionPct}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Navigation groups */}
          <nav className="flex-1 space-y-3 overflow-y-auto px-3 py-2 scrollbar-hide">
            {NAV_GROUPS.map((group) => (
              <SidebarGroup
                key={group.label}
                group={group}
                pathname={pathname}
                onItemClick={closeMenu}
              />
            ))}
          </nav>

          {/* Bottom: logout */}
          <div className="border-t border-white/8 px-3 py-4">
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/60 transition hover:bg-white/8 hover:text-red-400"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign out</span>
            </button>
          </div>
        </aside>

        {/* ── Main content area ────────────────────────────────────────── */}
        <div className="min-h-screen flex-1 lg:ml-[272px]">

          {/* ── Topbar ────────────────────────────────────────────────── */}
          <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[#ECE6D6] bg-[#F4F3EC]/95 px-4 backdrop-blur-md lg:px-6">
            {/* Left: hamburger (mobile) + page title */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                id="client-mobile-menu-btn"
                aria-label="Open navigation"
                onClick={() => setIsOpen(true)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[#ECE6D6] bg-white text-[#5A6465] transition hover:bg-[#F8F5ED] hover:text-black lg:hidden"
              >
                <Menu className="h-4 w-4" />
              </button>
              <div>
                <h1 className="text-base font-semibold text-black leading-none">{pageTitle}</h1>
                <p className="text-[10px] font-medium text-[#A89A7A] uppercase tracking-wide">
                  Client Dashboard
                </p>
              </div>
            </div>

            {/* Right: quick links + notifications + profile */}
            <div className="flex items-center gap-2">
              <Link
                href="/"
                className="hidden items-center gap-1.5 rounded-full border border-[#ECE6D6] bg-white px-3 py-1.5 text-xs font-semibold text-[#01454A] transition hover:bg-[#01454A] hover:text-white sm:flex"
              >
                <Sparkles className="h-3 w-3" />
                Shop
              </Link>

              <NotificationBell />

              <ProfileDropdown email={userEmail} onLogout={handleLogout} />
            </div>
          </header>

          {/* ── Page content ─────────────────────────────────────────── */}
          <main className="min-h-[calc(100vh-4rem)] px-4 pb-8 pt-6 lg:px-6 lg:pt-8">
            {children}
          </main>
        </div>
      </div>
    </RoleGuard>
  );
}
