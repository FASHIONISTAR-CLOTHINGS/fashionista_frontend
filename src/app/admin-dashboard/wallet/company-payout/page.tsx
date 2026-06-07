/**
 * app/admin-dashboard/wallet/company-payout/page.tsx
 *
 * Company Commission Payout Page — Fashionistar Admin Dashboard.
 *
 * This page is EXCLUSIVELY accessible to the Primary Company Superuser:
 *   fashionistarclothings@outlook.com
 *
 * It provides a full-screen premium interface for withdrawing accumulated
 * platform commissions from the Fashionistar Company Wallet to a
 * designated company bank account.
 *
 * Features:
 *   - Live company commission balance display.
 *   - Double-Door secured withdrawal form (CompanyWithdrawalPanel).
 *   - Transaction history sidebar showing recent company payouts.
 *   - Platform commission rate indicator.
 *   - Responsive grid layout optimised for admin desktop screens.
 */

import type { Metadata } from "next";
import { CompanyPayoutPageClient } from "@/features/admin-dashboard/wallet/components/CompanyPayoutPageClient";

// ── SEO Metadata ──────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: "Company Commission Payout | FASHIONISTAR Admin",
  description:
    "Withdraw accumulated platform commissions from the FASHIONISTAR Company Wallet. " +
    "Double-Door secured: requires company email identity and FASHIONISTAR account name.",
  robots: "noindex, nofollow",
};

// ── Page Component ────────────────────────────────────────────────────────────

export default function CompanyPayoutPage() {
  return <CompanyPayoutPageClient />;
}
