"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  ArrowUpRight,
  BarChart3,
  ClipboardCheck,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  ReceiptText,
  Settings,
  Store,
  Tag,
  Users,
  Wallet,
  X,
} from "lucide-react";


import { RoleGuard } from "@/features/auth/components/RoleGuard";
import { useAuthStore } from "@/features/auth/store/auth.store";

const vendorNavItems = [
  { href: "/vendor/dashboard", label: "Dashboard", Icon: LayoutDashboard },
  { href: "/vendor/orders", label: "Orders", Icon: Package },
  { href: "/vendor/products", label: "New Product", Icon: Store },
  { href: "/vendor/products/catelog", label: "Catalog", Icon: Package },
  { href: "/vendor/analytics", label: "Analytics", Icon: BarChart3 },
  { href: "/vendor/payments", label: "Payments", Icon: CreditCard },
  { href: "/vendor/transactions", label: "Transactions", Icon: ReceiptText },
  { href: "/vendor/customers", label: "Customers", Icon: Users },
  { href: "/vendor/wallet",      label: "Wallet",       Icon: Wallet },
  { href: "/vendor/payouts",     label: "Payouts",      Icon: ArrowUpRight },
  { href: "/vendor/kyc",         label: "KYC",          Icon: ClipboardCheck },
  { href: "/vendor/coupons", label: "Coupons", Icon: Tag },
  { href: "/vendor/settings", label: "Settings", Icon: Settings },
];

const isActivePath = (pathname: string, href: string) =>
  pathname === href || pathname.startsWith(`${href}/`);

export function VendorShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);
  const [isOpen, setIsOpen] = useState(false);
  const [openPathname, setOpenPathname] = useState<string | null>(null);
  const isMenuOpen = isOpen && openPathname === pathname;
  const requiresVendorProfile = !pathname.startsWith("/vendor/setup");

  const openMenu = () => {
    setOpenPathname(pathname);
    setIsOpen(true);
  };

  const closeMenu = () => {
    setIsOpen(false);
    setOpenPathname(null);
  };

  const handleLogout = () => {
    logout();
    router.replace("/auth/sign-in");
  };

  return (
    <RoleGuard requiredRole="vendor" requireVendorProfile={requiresVendorProfile}>
      {/* TODO(a11y): Add focus-trap library on sidebar drawer for WCAG 2.1 AA keyboard compliance */}
      <div className="min-h-screen bg-background text-foreground lg:flex">
        <button
          type="button"
          aria-label="Open vendor navigation"
          onClick={openMenu}
          className="fixed left-4 top-4 z-40 flex h-11 w-11 items-center justify-center rounded-full border border-black/10 bg-white text-black shadow-sm lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        {isMenuOpen ? (
          <button
            type="button"
            aria-label="Close vendor navigation"
            onClick={closeMenu}
            className="fixed inset-0 z-40 bg-black/35 lg:hidden"
          />
        ) : null}

        <aside
          className={`fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col bg-[hsl(var(--sidebar-bg))] text-[hsl(var(--sidebar-text))] transition-transform duration-200 lg:translate-x-0 ${
            isMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between border-b border-white/10 px-6 py-6">
            <Link href="/vendor/dashboard" className="flex items-center gap-3">
              <Image
                src="/logo.svg"
                width={78}
                height={76}
                alt="Fashionistar"
                className="h-[42px] w-[42px]"
                style={{ width: "auto", height: "auto" }}
              />
              <span className="font-bon_foyage text-3xl leading-none">
                Fashionistar
              </span>
            </Link>
            <button
              type="button"
              aria-label="Close vendor navigation"
              onClick={closeMenu}
              className="rounded-full border border-white/10 p-2 text-white lg:hidden"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <nav className="flex flex-1 flex-col justify-between px-4 py-6">
            <div className="space-y-2">
              {vendorNavItems.map(({ href, label, Icon }) => {
                const active = isActivePath(pathname, href);

                return (
                  <Link
                    key={href}
                    href={href}
                    className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-colors ${
                      active
                        ? "bg-[hsl(var(--sidebar-active))] text-[hsl(var(--sidebar-active-text))]"
                        : "text-[hsl(var(--sidebar-text)/0.75)] hover:bg-white/10 hover:text-[hsl(var(--sidebar-text))]"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{label}</span>
                  </Link>
                );
              })}
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="mt-8 flex items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-medium text-white/75 transition-colors hover:bg-white/10 hover:text-white"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </nav>
        </aside>

        <main className="min-h-screen flex-1 px-4 pb-8 pt-20 lg:ml-[280px] lg:px-8 lg:pt-8">
          {children}
        </main>
      </div>
    </RoleGuard>
  );
}
