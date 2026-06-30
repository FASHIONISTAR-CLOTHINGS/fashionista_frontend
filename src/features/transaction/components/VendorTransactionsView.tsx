"use client";

/**
 * @file VendorTransactionsView.tsx
 * @description Vendor-only transaction dashboard entrypoint.
 */
import { TransactionDashboardView } from "./TransactionViews";

export function VendorTransactionsView() {
  return <TransactionDashboardView audience="vendor" />;
}
