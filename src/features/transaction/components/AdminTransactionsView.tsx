"use client";

/**
 * @file AdminTransactionsView.tsx
 * @description Admin/platform transaction dashboard entrypoint.
 */
import { TransactionDashboardView } from "./TransactionViews";

export function AdminTransactionsView() {
  return <TransactionDashboardView audience="admin" />;
}
