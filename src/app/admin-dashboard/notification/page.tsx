import { NotificationsDashboard } from "@/features/admin-dashboard/notification";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Broadcasts — Fashionistar Admin",
  description: "Compose platform-wide alerts, push announcements to tailored boutiques, and broadcast news to luxury clients.",
};

export default function AdminNotificationPage() {
  return <NotificationsDashboard />;
}
