/**
 * features/providers/admin-dashboard/types.ts
 */

export interface ApiProvider {
  id: string;
  name: string;
  type: "payment" | "sms" | "email" | "logistics" | "assets";
  status: "healthy" | "degraded" | "down";
  latency: number;
  uptime: number;
  lastChecked: string;
}
