/**
 * entities/user/types/index.ts
 * Canonical UnifiedUser type definitions — mirrors Django UnifiedUser RBAC model.
 * All 15 roles supported. Used across auth, vendor, client, admin, editor layers.
 */

export type UserRole =
  | "CLIENT" | "SUPER_CLIENT"
  | "VENDOR" | "SUPER_VENDOR"
  | "STAFF" | "SUPER_STAFF"
  | "ADMIN" | "SUPER_ADMIN"
  | "EDITOR" | "SUPER_EDITOR"
  | "SUPPORT" | "SUPER_SUPPORT"
  | "MODERATOR" | "SUPER_MODERATOR"
  | "ASSISTANT";

export type AuthProvider = "email" | "google" | "facebook" | "apple";

export type LoyaltyTier = "standard" | "silver" | "gold" | "platinum";

export interface User {
  id: string;
  memberId: string;
  email: string;
  phone: string | null;
  firstName: string;
  lastName: string;
  fullName: string;
  role: UserRole;
  authProvider: AuthProvider;
  avatar: string | null;
  isVerified: boolean;
  isActive: boolean;
  twoFactorEnabled: boolean;
  country: string;
  preferredLanguage: string;
  marketingConsent: boolean;
  createdAt: string;
  lastLogin: string | null;
}

export interface ClientProfile {
  bio: string;
  preferredSize: string;
  stylePreferences: string[];
  favouriteColours: string[];
  defaultShippingAddress: string;
  totalOrders: number;
  totalSpentNgn: string;
  loyaltyTier: LoyaltyTier;
  loyaltyPoints: number;
  referralCode: string | null;
  bodyType: string;
  occasionPreferences: string[];
}

export interface VendorProfile {
  storeId: string;
  storeName: string;
  storeSlug: string;
  storeTagline: string;
  subscriptionTier: "free" | "pro" | "elite";
  commissionRate: string;
  isVerified: boolean;
  isActive: boolean;
  isFeatured: boolean;
  aiFeaturesEnabled: boolean;
  averageRating: string;
  totalReviews: number;
  totalSales: number;
  country: string;
  city: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role?: "CLIENT" | "VENDOR";
  country?: string;
}

export interface OTPPayload {
  email: string;
  otp: string;
}

export interface TwoFactorPayload {
  totp_code: string;
}
