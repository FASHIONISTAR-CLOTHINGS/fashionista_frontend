/**
 * Auth Zod Schemas — Security Dashboard Contracts
 *
 * Extends auth.schemas.ts with the session and login-event shapes
 * returned by SessionListView and LoginEventListView.
 *
 * Separated into this file to keep auth.schemas.ts focused on auth forms.
 */
import { z } from 'zod';


// ── Me (Profile) Response ─────────────────────────────────────────────────────
// Matches GET /api/v1/auth/me/ — MeView in sync_views.py
// avatar is now str(user.avatar.url) — always a URL string or null (P0 fix applied)
export const AuthUserSchema = z.object({
  id:          z.string().uuid(),
  member_id:   z.string().nullable().optional(),
  email:       z.string().email().nullable().optional(),
  phone:       z.string().nullable().optional(),
  first_name:  z.string().nullable().optional(),
  last_name:   z.string().nullable().optional(),
  role:        z.enum(['vendor', 'client', 'staff', 'admin']),
  is_verified: z.boolean(),
  is_staff:    z.boolean(),
  // MeView now returns str(avatar.url) — validated as URL or null
  avatar:      z.string().url().nullable().optional(),
  date_joined: z.string().nullable().optional(),
});

export type AuthUserProfile = z.infer<typeof AuthUserSchema>;


// ── Active Sessions ───────────────────────────────────────────────────────────
// Matches GET /api/v1/auth/sessions/ item — SessionListView
// Backend uses string UUIDs; is_current flags the requesting device
export const SessionSchema = z.object({
  id:         z.string(),
  device:     z.string(),
  ip_address: z.string().nullable().optional(),
  location:   z.string().nullable().optional(),
  last_seen:  z.string(),       // ISO datetime string
  is_current: z.boolean(),
});

export type Session = z.infer<typeof SessionSchema>;
export const SessionListSchema = z.array(SessionSchema);


// ── Login Events ──────────────────────────────────────────────────────────────
// Matches GET /api/v1/auth/login-events/ item — LoginEventListView (Binance-style)
// success=false rows drive the hasAnomalies security alert
export const LoginEventSchema = z.object({
  id:         z.number().int(),
  timestamp:  z.string(),       // ISO datetime string
  ip_address: z.string().nullable().optional(),
  device:     z.string().nullable().optional(),
  location:   z.string().nullable().optional(),
  success:    z.boolean(),
  city:       z.string().nullable().optional(),
  country:    z.string().nullable().optional(),
  user_agent: z.string().nullable().optional(),
});

export type LoginEventItem = z.infer<typeof LoginEventSchema>;
export const LoginEventListSchema = z.array(LoginEventSchema);
