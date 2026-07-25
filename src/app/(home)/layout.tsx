import Link from "next/link";
import NewNavbar from "@/components/shared/navigation/NewNavbar";
import NewFooter from "@/components/shared/feedback/NewFooter";
import NewMobileNav from "@/components/shared/navigation/NewMobileNav";
import { MobileBottomTabBar } from "@/components/shared/navigation/MobileBottomTabBar";
import { WishlistNudgeClient } from "./_components/WishlistNudgeClient";
import { getPublicPlatformSettings } from "@/features/public-engagement";
import { AnnouncementBanner } from "@/components/shared/ui/AnnouncementBanner";
import { BackToTopButton } from "@/components/shared/ui/BackToTopButton";

export const dynamic = "force-dynamic";

export default function Home({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const platformSettingsPromise = getPublicPlatformSettings();

  return (
    <>
      <main className="flex min-h-screen pb-16 md:pb-10 flex-col md:px-0 bg-[#FFF]">
        <header>
          {/* S21: Promotional announcement bar — dismissible, 24h localStorage suppression */}
          <AnnouncementBanner />
          <TopBar platformSettingsPromise={platformSettingsPromise} />
          {/* B6: Removed 160+ lines of dead legacy navbar/topbar/search comments */}
          <NewMobileNav />
          <NewNavbar />
        </header>
        <section>{children}</section>
        {/* Canonical auth now always renders on dedicated /auth/* pages. */}
      </main>
      <FooterBridge platformSettingsPromise={platformSettingsPromise} />
      {/* ── Revenue: Wishlist Nudge sticky bar (60s delay, 24h suppression) ── */}
      <WishlistNudgeClient />
      {/* ── MC10: Mobile bottom tab bar (Home/Shop/Measure/Cart/Account) ── */}
      <MobileBottomTabBar />
      {/* ── S17: Back to top floating button — appears after 300px scroll ── */}
      <BackToTopButton />
    </>
  );
}

async function TopBar({
  platformSettingsPromise,
}: {
  platformSettingsPromise: ReturnType<typeof getPublicPlatformSettings>;
}) {
  const platformSettings = await platformSettingsPromise;
  const supportPhone = platformSettings.support_phone.trim();

  return (
    <div className="bg-[#01454a] text-white relative py-4 md:py-6 md:px-10 lg:px-20 md:flex md:flex-wrap-reverse lg:flex-nowrap justify-between items-center text-sm">
      <div className="hidden md:flex justify-between items-center gap-3 font-raleway font-bold md:w-1/2 lg:w-[25%]">
        <Link href="/about-us">About Us</Link>
        <Link href="/wishlist">Wishlist</Link>
        <Link href="/auth/sign-in?returnUrl=%2Fclient%2Fdashboard%2Forders%2Ftrack-order">
          Tracking Order
        </Link>
      </div>
      <div className="hidden md:flex justify-end md:w-1/2 lg:w-[30%] lg:order-3 gap-4">
        {supportPhone ? (
          <div className="flex items-center gap-2 text-[#BBBBBB]">
            <svg
              width="30"
              height="30"
              viewBox="0 0 30 30"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M18.75 15C18.75 13.6193 19.8693 12.5 21.25 12.5C24.0114 12.5 26.25 14.7386 26.25 17.5C26.25 20.2614 24.0114 22.5 21.25 22.5C19.8693 22.5 18.75 21.3807 18.75 20V15Z"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <path
                d="M11.25 15C11.25 13.6193 10.1307 12.5 8.75 12.5C5.98857 12.5 3.75 14.7386 3.75 17.5C3.75 20.2614 5.98857 22.5 8.75 22.5C10.1307 22.5 11.25 21.3807 11.25 20V15Z"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <path
                d="M3.75 17.5V13.75C3.75 7.5368 8.7868 2.5 15 2.5C21.2133 2.5 26.25 7.5368 26.25 13.75V19.8077C26.25 22.3181 26.25 23.5733 25.8095 24.5521C25.3081 25.6661 24.4161 26.5581 23.3021 27.0595C22.3233 27.5 21.0681 27.5 18.5577 27.5H15"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div className="flex flex-col">
              <span className="font-medium md:text-sm leading-[27px] text-[#BBBBBB]">
                {supportPhone}
              </span>
              <span className="text-[#BBBBBB] leading-4 text-xs font-medium">
                Support center
              </span>
            </div>
          </div>
        ) : null}
        <p>Nigeria</p>
      </div>
      <div className="font-bon_foyage text-2xl lg:text-3xl text-white lg:order-2 md:w-full lg:w-1/2 text-center">
        Superb value deals on your choice clothings
      </div>
    </div>
  );
}

async function FooterBridge({
  platformSettingsPromise,
}: {
  platformSettingsPromise: ReturnType<typeof getPublicPlatformSettings>;
}) {
  const platformSettings = await platformSettingsPromise;

  return (
    <NewFooter
      phone={platformSettings.support_phone || undefined}
      email={platformSettings.support_email || undefined}
    />
  );
}
