"use client";
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import AdminTopBanner from "@/components/shared/utilities/AdminTopBanner";
import { RoleGuard } from "@/features/admin-dashboard/components/RoleGuard";
import { ErrorBoundary } from "@/shared";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [openPathname, setOpenPathname] = useState<string | null>(null);
  const pathname = usePathname();
  const isMenuOpen = isOpen && openPathname === pathname;

  const [collapsedGroups, setCollapsedGroups] = useState<{ [key: string]: boolean }>({
    overview: false,
    commerce: false,
    identity: false,
    financial: false,
    measurements: false,
    communication: false,
    platform: false,
  });

  const toggleGroup = (group: string) => {
    setCollapsedGroups((prev) => ({ ...prev, [group]: !prev[group] }));
  };

  const openMenu = () => {
    setOpenPathname(pathname);
    setIsOpen(true);
  };

  const closeMenu = () => {
    setIsOpen(false);
    setOpenPathname(null);
  };

  const navGroups = [
    {
      id: "overview",
      label: "Overview",
      items: [
        { href: "/admin-dashboard", label: "Dashboard", icon: "dashboard" }
      ]
    },
    {
      id: "commerce",
      label: "Commerce",
      items: [
        { href: "/admin-dashboard/product", label: "Products", icon: "products" },
        { href: "/admin-dashboard/order", label: "Orders", icon: "orders" },
        { href: "/admin-dashboard/custom-order", label: "Custom Orders", icon: "custom-orders" },
        { href: "/admin-dashboard/cart", label: "Active Carts", icon: "cart" },
        { href: "/admin-dashboard/catalog/collections", label: "Collections", icon: "collections" },
        { href: "/admin-dashboard/catalog/brands", label: "Brands", icon: "brands" },
        { href: "/admin-dashboard/catalog/categories", label: "Categories", icon: "categories" },
        { href: "/admin-dashboard/catalog/blog", label: "Editorial Blog", icon: "blog" },
        { href: "/admin-dashboard/product/reviews", label: "Reviews", icon: "reviews" }
      ]
    },
    {
      id: "identity",
      label: "Identity",
      items: [
        { href: "/admin-dashboard/authentication", label: "Authentication", icon: "accounts" },
        { href: "/admin-dashboard/vendor", label: "Vendors", icon: "sellers" },
        { href: "/admin-dashboard/client", label: "Clients", icon: "clients" },
        { href: "/admin-dashboard/kyc", label: "KYC Submissions", icon: "kyc" }
      ]
    },
    {
      id: "financial",
      label: "Financial",
      items: [
        { href: "/admin-dashboard/transactions", label: "Transactions", icon: "transactions" },
        { href: "/admin-dashboard/wallet", label: "Wallets", icon: "wallet" },
        { href: "/admin-dashboard/payment", label: "Payments", icon: "payment" }
      ]
    },
    {
      id: "measurements",
      label: "Measurements",
      items: [
        { href: "/admin-dashboard/measurements", label: "Profiles", icon: "measurements" }
      ]
    },
    {
      id: "communication",
      label: "Communication",
      items: [
        { href: "/admin-dashboard/chat", label: "Chat Support", icon: "chat" },
        { href: "/admin-dashboard/notification", label: "Notifications", icon: "notification" },
        { href: "/admin-dashboard/support/tickets", label: "Tickets", icon: "tickets" },
        { href: "/admin-dashboard/support/sla", label: "SLA Monitor", icon: "sla" }
      ]
    },
    {
      id: "platform",
      label: "Platform",
      items: [
        { href: "/admin-dashboard/audit-logs", label: "Audit Trail", icon: "audit" },
        { href: "/admin-dashboard/global-platform-settings", label: "Settings", icon: "settings" },
        { href: "/admin-dashboard/providers", label: "Providers", icon: "providers" }
      ]
    }

  ];

  const renderIcon = (iconName: string, active: boolean) => {
    const strokeColor = active ? "#fda600" : "#bbb";
    switch (iconName) {
      case "dashboard":
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 5C16 4.06812 16 3.60218 16.1522 3.23463C16.3552 2.74458 16.7446 2.35523 17.2346 2.15224C17.6022 2 18.0681 2 19 2C19.9319 2 20.3978 2 20.7654 2.15224C21.2554 2.35523 21.6448 2.74458 21.8478 3.23463C22 3.60218 22 4.06812 22 5V9C22 9.93188 22 10.3978 21.8478 10.7654C21.6448 11.2554 21.2554 11.6448 20.7654 11.8478C20.3978 12 19.9319 12 19 12C18.0681 12 17.6022 12 17.2346 11.8478C16.7446 11.6448 16.3552 11.2554 16.1522 10.7654C16 10.3978 16 9.93188 16 9V5Z" stroke={strokeColor} strokeWidth="1.5" />
            <path d="M16 19C16 18.0681 16 17.6022 16.1522 17.2346C16.3552 16.7446 16.7446 16.3552 17.2346 16.1522C17.6022 16 18.0681 16 19 16C19.9319 16 20.3978 16 20.7654 16.1522C21.2554 16.3552 21.6448 16.7446 21.8478 17.2346C22 17.6022 22 18.0681 22 19C22 19.9319 22 20.3978 21.8478 20.7654C21.6448 21.2554 21.2554 21.6448 20.7654 21.8478C20.3978 22 19.9319 22 19 22C18.0681 22 17.6022 22 17.2346 21.8478C16.7446 21.6448 16.3552 21.2554 16.1522 20.7654C16 20.3978 16 19.9319 16 19Z" stroke={strokeColor} strokeWidth="1.5" />
            <path d="M2 16C2 14.1144 2 13.1716 2.58579 12.5858C3.17157 12 4.11438 12 6 12H8C9.88562 12 10.8284 12 11.4142 12.5858C12 13.1716 12 14.1144 12 16V18C12 19.8856 12 20.8284 11.4142 21.4142C10.8284 22 9.88562 22 8 22H6C4.11438 22 3.17157 22 2.58579 21.4142C2 20.8284 2 19.8856 2 18V16Z" stroke={strokeColor} strokeWidth="1.5" />
            <path d="M2 5C2 4.06812 2 3.60218 2.15224 3.23463C2.35523 2.74458 2.74458 2.35523 3.23463 2.15224C3.60218 2 4.06812 2 5 2H9C9.93188 2 10.3978 2 10.7654 2.15224C11.2554 2.35523 11.6448 2.74458 11.8478 3.23463C12 3.60218 12 4.06812 12 5C12 5.93188 12 6.39782 11.8478 6.76537C11.6448 7.25542 11.2554 7.64477 10.7654 7.84776C10.3978 8 9.93188 8 9 8H5C4.06812 8 3.60218 8 3.23463 7.84776C2.74458 7.64477 2.35523 7.25542 2.15224 6.76537C2 6.39782 2 5.93188 2 5Z" stroke={strokeColor} strokeWidth="1.5" />
          </svg>
        );
      case "products":
      case "collections":
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6.80298 17.1676V13.3428" stroke={strokeColor} strokeWidth="1.43431" strokeLinecap="round" />
            <path d="M11.584 17.1675V7.60547" stroke={strokeColor} strokeWidth="1.43431" strokeLinecap="round" />
            <path d="M16.365 17.1679V11.4307" stroke={strokeColor} strokeWidth="1.43431" strokeLinecap="round" />
            <path d="M2.5 12.3867C2.5 8.10447 2.5 5.96336 3.83031 4.63304C5.16063 3.30273 7.30173 3.30273 11.5839 3.30273C15.8661 3.30273 18.0072 3.30273 19.3376 4.63304C20.6679 5.96336 20.6679 8.10447 20.6679 12.3867C20.6679 16.6688 20.6679 18.81 19.3376 20.1403C18.0072 21.4706 15.8661 21.4706 11.5839 21.4706C7.30173 21.4706 5.16063 21.4706 3.83031 20.1403C2.5 18.81 2.5 16.6688 2.5 12.3867Z" stroke={strokeColor} strokeWidth="1.43431" strokeLinejoin="round" />
          </svg>
        );
      case "orders":
      case "custom-orders":
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16.365 2.86816V4.78057M11.584 2.86816V4.78057M6.80298 2.86816V4.78057" stroke={strokeColor} strokeWidth="1.43431" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M3.4563 13.3863V9.56144C3.4563 6.85689 3.4563 5.50461 4.2965 4.66442C5.13669 3.82422 6.48897 3.82422 9.19352 3.82422H13.9745C16.6791 3.82422 18.0313 3.82422 18.8716 4.66442C19.7118 5.50461 19.7118 6.85689 19.7118 9.56144V13.3863C19.7118 16.0908 19.7118 17.4431 18.8716 18.2833C18.0313 19.1235 16.6791 19.1235 13.9745 19.1235H9.19352C6.48897 19.1235 5.13669 19.1235 4.2965 18.2833C3.4563 17.4431 3.4563 16.0908 3.4563 13.3863Z" stroke={strokeColor} strokeWidth="1.43431" />
            <path d="M3.4563 16.2549V9.56144C3.4563 6.85689 3.4563 5.50461 4.2965 4.66442C5.13669 3.82422 6.48897 3.82422 9.19352 3.82422H13.9745C16.6791 3.82422 18.0313 3.82422 18.8716 4.66442C19.7118 5.50461 19.7118 6.85689 19.7118 9.56144V16.2549C19.7118 18.9594 19.7118 20.3117 18.8716 21.1519C18.0313 21.9921 16.6791 21.9921 13.9745 21.9921H9.19352C6.48897 21.9921 5.13669 21.9921 4.2965 21.1519C3.4563 20.3117 3.4563 18.9594 3.4563 16.2549Z" stroke={strokeColor} strokeWidth="1.43431" />
            <path d="M7.75903 15.2996H11.5839M7.75903 10.5186H15.4087" stroke={strokeColor} strokeWidth="1.43431" strokeLinecap="round" />
          </svg>
        );
      case "cart":
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 3H5L5.4 5M5.4 5H21L19 14H6.4L3 3ZM6.4 14C5.5 14 4.8 14.7 4.8 15.6C4.8 16.5 5.5 17.2 6.4 17.2H19" stroke={strokeColor} strokeWidth="1.43431" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="9" cy="20" r="1" fill={strokeColor} stroke={strokeColor} strokeWidth="1" />
            <circle cx="17" cy="20" r="1" fill={strokeColor} stroke={strokeColor} strokeWidth="1" />
          </svg>
        );
      case "transactions":
      case "wallet":
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M14.4526 8.12725C14.4526 8.12725 14.9307 8.12725 15.4088 9.08346C15.4088 9.08346 16.9275 6.69295 18.2775 6.21484" stroke={strokeColor} strokeWidth="1.43431" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M21.146 7.64919C21.146 10.2897 19.0055 12.4302 16.365 12.4302C13.7245 12.4302 11.584 10.2897 11.584 7.64919C11.584 5.0087 13.7245 2.86816 16.365 2.86816C19.0055 2.86816 21.146 5.0087 21.146 7.64919Z" stroke={strokeColor} strokeWidth="1.43431" strokeLinecap="round" />
          </svg>
        );
      case "sellers":
      case "accounts":
      case "kyc":
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.9103 20.0804H18.379C19.4785 20.0804 20.353 19.5794 21.1382 18.879C23.133 17.0995 18.4439 15.2993 16.8431 15.2993M14.9307 5.80306C15.1478 5.76 15.3733 5.7373 15.6046 5.7373C17.3448 5.7373 18.7555 7.02163 18.7555 8.60592C18.7555 10.1902 17.3448 11.4745 15.6046 11.4745C15.3733 11.4745 15.1478 11.4519 14.9307 11.4087" stroke={strokeColor} strokeWidth="1.43431" strokeLinecap="round" />
          </svg>
        );
      default:
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke={strokeColor} strokeWidth="1.5" />
          </svg>
        );
    }
  };

  return (
    <RoleGuard requiredRole="admin">
      <div className="flex flex-col">
        {/* Mobile Header */}
        <div className="p-[11px] w-full bg-[#F4F3EC] lg:hidden">
          <div className="flex items-center justify-between px-2.5 bg-[#EDE7D9] rounded-[5px] h-[50px]">
            <button
              onClick={openMenu}
              className="w-[34px] h-[34px] flex justify-center items-center bg-[#F4F3EC] border-[0.8px] border-black rounded-full"
            >
              <Image src="/menu.svg" alt="" width={24} height={24} />
            </button>
            <div className="flex items-center">
              <Image
                src="/logo.svg"
                width={78}
                height={76}
                alt="logo"
                className="w-[39px] h-auto"
                style={{ height: "auto" }}
              />
              <h2 className="font-bon_foyage px-3 text-[25px] leading-[25px] text-black">
                Fashionistar
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-[34px] h-[34px] flex justify-center items-center rounded-full bg-[#fda600]">
                <span className="font-medium text-white">A</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Container */}
        <div
          className={`w-full lg:left-0 md:w-[40%] lg:w-[25%] z-50 h-screen bg-[#141414] fixed top-0 transition-all duration-300 flex flex-col ${
            isMenuOpen ? "left-0" : "left-[-100%]"
          }`}
        >
          {/* Logo Section */}
          <div className="flex items-center md:justify-center px-10 py-5 md:py-[30px] border-b-[1.2px] border-b-[#282828] shrink-0">
            <Image
              src="/logo.svg"
              width={78}
              height={76}
              alt="logo"
              className="w-[55px] h-auto"
              style={{ height: "auto" }}
            />
            <h2 className="font-bon_foyage px-3 text-4xl leading-9 text-white">
              Fashionistar
            </h2>
          </div>

          {/* Nav Container with Scroll */}
          <nav className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
            {navGroups.map((group) => {
              const isCollapsed = collapsedGroups[group.id];
              return (
                <div key={group.id} className="space-y-2 border-b border-[#282828] pb-4 last:border-b-0">
                  <button
                    onClick={() => toggleGroup(group.id)}
                    className="w-full flex items-center justify-between text-xs font-bold tracking-wider text-gray-400 uppercase hover:text-white transition-colors"
                  >
                    <span>{group.label}</span>
                    <svg
                      className={`w-3.5 h-3.5 transform transition-transform duration-200 ${
                        isCollapsed ? "-rotate-90" : "rotate-0"
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {!isCollapsed && (
                    <div className="space-y-1.5 pl-2 pt-1 transition-all duration-200">
                      {group.items.map((item) => {
                        const active = pathname === item.href || pathname.startsWith(item.href + "/");
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={closeMenu}
                            className={`flex items-center gap-3.5 px-3 py-2 rounded-md text-sm font-medium transition-all duration-150 ${
                              active
                                ? "bg-[#fda600] text-white"
                                : "text-gray-400 hover:text-white hover:bg-[#1f1f1f]"
                            }`}
                          >
                            {renderIcon(item.icon, active)}
                            <span>{item.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Close Menu Button for Mobile */}
          <button
            onClick={closeMenu}
            className="w-8 h-8 flex justify-center items-center absolute top-2 right-2 md:hidden"
          >
            <svg className="text-white" width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M15.8334 4.1665L4.16675 15.8332M4.16675 4.1665L15.8334 15.8332" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* Content Area */}
        <div className="lg:ml-[25%] bg-[#F4F3EC] min-h-screen flex flex-col">
          <AdminTopBanner title="Jennifer (Admin)" pathname={pathname} />
          <div className="p-3 md:p-[30px] mt-1 lg:mt-[100px] bg-inherit space-y-10">
            <ErrorBoundary>{children}</ErrorBoundary>
          </div>
        </div>
      </div>
    </RoleGuard>
  );
};

export default Layout;
