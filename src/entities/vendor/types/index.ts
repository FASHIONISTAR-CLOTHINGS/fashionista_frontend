// src/entities/vendor/types/index.ts
/**
 * Vendor entity types — mirrors apps/vendor/models/vendor_profile.py VendorProfile.
 */

export type VendorTier = "standard" | "silver" | "gold" | "platinum" | "enterprise";
export type VendorStatus = "pending" | "active" | "suspended" | "rejected";

export interface VendorProfile {
  id: string;
  userId: string;
  shopName: string;
  slug: string;
  bio: string;
  logo: string | null;
  bannerImage: string | null;
  phone: string;
  email: string;
  whatsapp: string;
  city: string;
  state: string;
  country: string;
  tier: VendorTier;
  status: VendorStatus;
  isVerified: boolean;
  verifiedAt: string | null;
  rating: number;
  reviewCount: number;
  totalSales: number;
  totalRevenue: number;
  avgFulfillmentDays: number | null;
  returnRate: number;
  disputeRate: number;
  aiFeaturesEnabled: boolean;
  customDomain: string | null;
  joinedAt: string;
  updatedAt: string;
}

export interface VendorMetrics {
  totalOrders: number;
  pendingOrders: number;
  revenue: number;
  avgRating: number;
  lowStockProducts: number;
  monthlyRevenue: { month: string; revenue: number }[];
  topProducts: { id: string; title: string; sales: number; revenue: number }[];
}

export interface VendorCard {
  id: string;
  shopName: string;
  slug: string;
  logo: string | null;
  city: string;
  state: string;
  rating: number;
  reviewCount: number;
  tier: VendorTier;
  isVerified: boolean;
  specialties: string[];
}
