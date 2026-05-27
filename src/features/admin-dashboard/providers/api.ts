/**
 * features/providers/admin-dashboard/api.ts
 */

import { apiAdminAsync } from "@/core/api/client.admin";
import type { ApiProvider } from "./types";

export async function fetchAdminProviders(): Promise<ApiProvider[]> {
  try {
    return await apiAdminAsync.get("providers/").json<ApiProvider[]>();
  } catch (error) {
    console.error("Failed to fetch providers, using fallback", error);
    return [
      {
        id: "PRV-01",
        name: "Stripe Payment Gateway",
        type: "payment",
        status: "healthy",
        latency: 120,
        uptime: 99.99,
        lastChecked: "1 min ago",
      },
      {
        id: "PRV-02",
        name: "Paystack Payments Africa",
        type: "payment",
        status: "healthy",
        latency: 180,
        uptime: 99.95,
        lastChecked: "1 min ago",
      },
      {
        id: "PRV-03",
        name: "Twilio SMS & OTP",
        type: "sms",
        status: "healthy",
        latency: 240,
        uptime: 99.9,
        lastChecked: "3 mins ago",
      },
      {
        id: "PRV-04",
        name: "Cloudinary CDN Storage",
        type: "assets",
        status: "healthy",
        latency: 85,
        uptime: 100.0,
        lastChecked: "2 mins ago",
      },
    ];
  }
}
