import type { Metadata } from "next";
import {  ClientWishlistView } from "@/features/client/components/client-wishlist-view";
import { RoleGuard } from "@/features/auth/components/RoleGuard";

export const metadata: Metadata = {
  title: "Wishlist — Client Dashboard | Fashionistar",
  description: "View and manage your saved fashion items on Fashionistar.",
};

export default function ClientWishlistPage() {
  return (
    <RoleGuard requiredRole="client">
      <ClientWishlistView />
    </RoleGuard>
  );
}
