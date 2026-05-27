/**
 * features/admin/auth/model/types.ts
 *
 * TypeScript types for the administrative authentication/user management domain.
 */

export interface AdminUser {
  id: string;
  email: string | null;
  phone: string | null;
  first_name: string;
  last_name: string;
  member_id: string | null;
  role: string;
  auth_provider: string;
  is_active: boolean;
  is_verified: boolean;
  is_deleted: boolean;
  is_superuser: boolean;
  is_staff: boolean;
  bio: string;
  country: string;
  state: string;
  city: string;
  address: string;
  avatar: string | null;
  date_joined: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface AdminUserSession {
  id: string;
  ip_address: string | null;
  user_agent: string | null;
  is_active: boolean;
  created_at: string;
  last_activity: string;
}

export interface AdminLoginEvent {
  id: string;
  ip_address: string | null;
  user_agent: string | null;
  status: string;
  failure_reason: string | null;
  created_at: string;
}

export interface AdminUserMetrics {
  total_users: number;
  active_users: number;
  suspended_users: number;
  verified_users: number;
  new_users_today: number;
}
