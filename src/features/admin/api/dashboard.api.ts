import { apiAdminAsync } from "@/core/api/client.admin";

export interface AdminDashboardKPI {
  total_users: number;
  new_users_today: number;
  active_vendors: number;
  total_products: number;
  products_pending_review: number;
  low_stock_products: number;
  total_orders: number;
  orders_today: number;
  orders_pending: number;
  pending_kyc_submissions: number;
  total_wallets: number;
  open_support_tickets: number;
  generated_at: string;
}

export async function fetchAdminDashboardKPI(): Promise<AdminDashboardKPI> {
  return apiAdminAsync.get("dashboard/kpi/").json<AdminDashboardKPI>();
}
