"use client";

/**
 * @file ClientTransactionsView.tsx
 * @description Client-only transaction dashboard entrypoint.
 */
import { TransactionDashboardView } from "./TransactionViews";

export function ClientTransactionsView() {
  return <TransactionDashboardView audience="client" />;
}
