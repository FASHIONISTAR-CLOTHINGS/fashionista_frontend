/* eslint-disable @next/next/no-css-tags, @next/next/no-img-element */

import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import Script from "next/script";
import { Providers } from "@/components/providers";
import { Preloader } from "@/components/shared/preloader/Preloader";
import { GlobalToastProvider } from "@/shared";

import "./globals.css";
import { cn } from "@/lib/utils";


// ── Local Fonts ───────────────────────────────────────────────────────────────
const bonFoyage = localFont({
  src: "./fonts/Bon-Foyage-Demo.otf",
  variable: "--font-bon-foyage",
  display: "swap",
});

const satoshi = localFont({
  src: [
    { path: "./fonts/Satoshi-Regular.otf", weight: "400", style: "normal" },
    { path: "./fonts/Satoshi-Medium.otf", weight: "500", style: "normal" },
    { path: "./fonts/Satoshi-Bold.otf", weight: "700", style: "normal" },
    { path: "./fonts/Satoshi-BoldItalic.otf", weight: "700", style: "italic" },
  ],
  // --font-sans is the global sans-serif variable used by Shadcn/ui and Tailwind.
  // Mapping it here to Satoshi removes any network dependency on Google Fonts.
  variable: "--font-satoshi",
  display: "swap",
});

// ── Metadata (SEO) ────────────────────────────────────────────────────────────
export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "https://www.fashionistar.net",
  ),
  title: {
    default: "FASHIONISTAR AI — Premium Fashion E-Commerce",
    template: "%s | FASHIONISTAR AI",
  },
  applicationName: "FASHIONISTAR AI",
  description:
    "FASHIONISTAR AI connects clients with professional tailors through AI-powered digital measurements, size recommendations, exclusive collections, premium fashion commerce, secure payments, and real-time collaboration.",
  keywords: [
    "fashionistar",
    "Tailoring Platform",
    "Custom Clothing",
    "AI Fashion Measurements",
    "African Fashion Marketplace",
    "Online Tailor Booking",
    "Secure Fashion Payments",
    "Virtual Tailor Collaboration",
    "Fashion Design AI",
    "Premium African Fashion",
    
    "AI Real-Time Collaboration",
    "Real-Time Collaboration",
    "Real-Time Collaboration AI",
    "AI Virtual Tailor Collaboration",

    "AI-Powered Digital Measurements",
    "AI-powered premium African fashion: perfect fits, exclusive collections.",
    "Fashion",
    "Tailor",
    "Clothing",
    "Design",
    "Style",
    "Female Clothings",
    "Male Clothings",
    "Senator",
    "Native",
    "Casual",
    "Party",
    "Wedding",
    "Corporate",

    


    "AI Fashion",
    "Premium Fashion",
    "Online Tailor",
    "Fashion E-Commerce",
    "Fashion Marketplace",
    "Fashion Platform",
    "Fashion Store",
    "Fashion Shop",
    "Fashion Boutique",
    "Fashion Collection",
    "Fashion Design",
    "Fashion Style",
    "Fashion Trends",
    "Fashion Trends 2024",
    "Fashion Trends 2025",
    "Fashion Trends 2026",
    "Fashion Trends 2027",
    "Fashion Trends 2028",

    "African Fashion",
    "African Fashion Marketplace",
    "African Fashion Platform",
    "African Fashion Store",
    "African Fashion Shop",
    "African Fashion Boutique",
    "African Fashion Collection",
    "African Fashion Design",
    "African Fashion Style",
    "African Fashion Trends",
    "African Fashion Trends 2024",
    "African Fashion Trends 2025",
    "African Fashion Trends 2026",
    "African Fashion Trends 2027",
    "African Fashion Trends 2028",

    "AI Design",
    "AI Measurements",
    "AI Recommendations",
    "AI Tailor",
    "AI Fashion Design",
    "AI Fashion Measurements",
    "AI Fashion Recommendations",
    "AI Fashion Tailor",
    "AI Fashion Design AI",
    "AI Fashion Measurements AI",
    "AI Fashion Recommendations AI",
    "AI Fashion Tailor AI",

    "Best Online Tailor",
    "Best Online Fashion Store",
    "Best Online Fashion Marketplace",
    "Best Online Fashion Platform",
    "Best Online Fashion Shop",
    "Best Online Fashion Boutique",
    "Best Online Fashion Collection",
    "Best Online Fashion Design",
    "Best Online Fashion Style",
    "Best Online Fashion Trends",
    "Best Online Fashion Trends 2024",
    "Best Online Fashion Trends 2025",
    "Best Online Fashion Trends 2026",
    "Best Online Fashion Trends 2027",
    "Best Online Fashion Trends 2028",

    "AI Measurements",
    "AI Fashion Measurements",
    "AI Fashion Measurements AI",
    
    "Fashion Measurements",
    "Fashion Measurements AI",
    "Fashion Measurements AI ",

    "Tailor Measurements",
    "Tailor Measurements AI",
    "AI Tailor Measurements",
    
    "Premium African Fashion",
    "Premium African Fashion Marketplace",
    "Premium African Fashion Platform",
    "Premium African Fashion Store",
    "Premium African Fashion Shop",
    "Premium African Fashion Boutique",
    "Premium African Fashion Collection",
    "Premium African Fashion Design",
    "Premium African Fashion Style",
    "Premium African Fashion Trends",
    "Premium African Fashion Trends 2024",
    "Premium African Fashion Trends 2025",
    "Premium African Fashion Trends 2026",
    "Premium African Fashion Trends 2027",
    "Premium African Fashion Trends 2028",

    "Online Fashion Store",
    "Online Fashion Marketplace",
    "Online Fashion Platform",
    "Online Fashion Shop",
    "Online Fashion Boutique",
    "Online Fashion Collection",
    "Online Fashion Design",
    "Online Fashion Style",
    "Online Fashion Trends",
    "Online Fashion Trends 2024",
    "Online Fashion Trends 2025",
    "Online Fashion Trends 2026",
    "Online Fashion Trends 2027",
    "Online Fashion Trends 2028",

    "AI-Powered Digital Measurements",
    "AI-Powered Digital Measurements AI",

    "Secure Payments",
    "Secure Payments AI",

  ],
  authors: [{ name: "FASHIONISTAR Team", url: "https://fashionistar.net" }],
  creator: "FASHIONISTAR Engineering",
  category: "Fashion E-Commerce",
  robots: { index: true, follow: true },
  alternates: {
    canonical: "/",
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },

  // Open Graph — Social sharing
  openGraph: {
    type: "website",
    url: "https://fashionistar.com",
    title: "FASHIONISTAR AI - Premium African Fashion Marketplace Connecting Clients with Professional Tailors through AI-Powered Digital Measurements",
    description:
      "FASHIONISTAR AI connects clients with professional tailors through AI-powered digital measurements, for perfect-fit custom clothing, premium fashion commerce, secure payments, and real-time collaboration.",
    siteName: "FASHIONISTAR AI",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "FASHIONISTAR AI",
      },
    ],
  },

  // Twitter / X Card
  twitter: {
    card: "summary_large_image",
    site: "@fashionistar",
    creator: "@fashionistar",
    images: ["/og-image.png"],
  },

  // App Icons
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-touch-icon.png",
  },
};

// ── Viewport ──────────────────────────────────────────────────────────────────
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#01454A" },
    { media: "(prefers-color-scheme: dark)", color: "#01454A" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

// ── Root Layout ───────────────────────────────────────────────────────────────
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;

  return (
    <html
      lang="en"
      suppressHydrationWarning // Required for next-themes
      data-scroll-behavior="smooth"
      className={cn(bonFoyage.variable, satoshi.variable, "font-sans")}
    >
      <head>
        {/*
         * ── Static Preloader CSS ──────────────────────────────────────────
         * Loaded before any JS bundle — renders immediately from first byte.
         * Lives in /public (static file server, zero DB, zero React needed).
         * Cache-Control: immutable set in next.config.mjs headers rule.
         */}
        <link
          rel="stylesheet"
          href="/preloader.css"
          fetchPriority="high"
        />
        <link
          rel="preload"
          href="/preloader/fashionistar-ai-preloader.svg"
          as="image"
          type="image/svg+xml"
        />

        {/*
         * ── Resource Hints — Media Performance ───────────────────────────
         * Preconnect to Cloudinary CDN so the first image fetch is instant.
         * DNS prefetch as fallback for older browsers.
         */}
        <link rel="preconnect" href="https://res.cloudinary.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
      </head>

      <body className="min-h-screen bg-background font-raleway antialiased" suppressHydrationWarning>
        {gaId ? (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
              strategy="afterInteractive"
            />
            <Script id="fashionistar-google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gaId}', { anonymize_ip: true });
              `}
            </Script>
          </>
        ) : null}

        {/* React-managed first-paint preloader — safe to unmount after hydration. */}
        <Preloader />

        <Providers>
          {children}
          {/* Global Toast Notifications — centralized via @/shared GlobalToastProvider */}
          <GlobalToastProvider />
        </Providers>
      </body>
    </html>
  );
}
