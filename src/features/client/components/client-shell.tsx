"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  ClipboardCheck,
  CreditCard,
  Heart,
  LayoutDashboard,
  LogOut,
  MapPin,
  Menu,
  Package,
  PackageSearch,
  ReceiptText,
  Settings,
  UserRound,
  Wallet,
  X,
} from "lucide-react";


import { RoleGuard } from "@/features/auth/components/RoleGuard";
import { useAuthStore } from "@/features/auth/store/auth.store";

const clientNavItems = [
  { href: "/client/dashboard", label: "Dashboard", Icon: LayoutDashboard },
  { href: "/client/dashboard/orders", label: "Orders", Icon: Package },
  {
    href: "/client/dashboard/orders/track-order",
    label: "Track Order",
    Icon: PackageSearch,
  },
  { href: "/client/dashboard/address", label: "Address", Icon: MapPin },
  { href: "/client/dashboard/wishlist", label: "Wishlist", Icon: Heart },
  { href: "/client/dashboard/wallet", label: "Wallet", Icon: Wallet },
  { href: "/client/dashboard/payments", label: "Payments", Icon: CreditCard },
  {
    href: "/client/dashboard/transactions",
    label: "Transactions",
    Icon: ReceiptText,
  },
  { href: "/client/dashboard/kyc", label: "KYC", Icon: ClipboardCheck },
  {
    href: "/client/dashboard/account-details",
    label: "Account Details",
    Icon: UserRound,
  },
  { href: "/client/dashboard/settings", label: "Settings", Icon: Settings },
];

const isActivePath = (pathname: string, href: string) =>
  pathname === href || pathname.startsWith(`${href}/`);

export function ClientShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);
  const [isOpen, setIsOpen] = useState(false);
  const [openPathname, setOpenPathname] = useState<string | null>(null);
  const isMenuOpen = isOpen && openPathname === pathname;

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
    <RoleGuard requiredRole="client">
      <div className="min-h-screen bg-[#F4F3EC] text-black lg:flex">
        <button
          type="button"
          aria-label="Open client navigation"
          onClick={openMenu}
          className="fixed left-4 top-4 z-40 flex h-11 w-11 items-center justify-center rounded-full border border-black/10 bg-white text-black shadow-sm lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        {isMenuOpen ? (
          <button
            type="button"
            aria-label="Close client navigation"
            onClick={closeMenu}
            className="fixed inset-0 z-40 bg-black/35 lg:hidden"
          />
        ) : null}

        <aside
          className={`fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col bg-[#141414] text-white transition-transform duration-200 lg:translate-x-0 ${
            isMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between border-b border-white/10 px-6 py-6">
            <Link href="/client/dashboard" className="flex items-center gap-3">
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
              aria-label="Close client navigation"
              onClick={closeMenu}
              className="rounded-full border border-white/10 p-2 text-white lg:hidden"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <nav className="flex flex-1 flex-col justify-between px-4 py-6">
            <div className="space-y-2">
              {clientNavItems.map(({ href, label, Icon }) => {
                const active = isActivePath(pathname, href);

                return (
                  <Link
                    key={href}
                    href={href}
                    className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-colors ${
                      active
                        ? "bg-[#FDA600] text-black"
                        : "text-white/75 hover:bg-white/10 hover:text-white"
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
