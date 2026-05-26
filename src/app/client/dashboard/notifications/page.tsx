import { ClientNotificationsView } from "@/features/client/components/client-views";

export const metadata = {
  title: "Notifications — Fashionistar",
  description: "View and manage all your Fashionistar notifications in one place.",
};

export default function NotificationsPage() {
  return <ClientNotificationsView />;
}
