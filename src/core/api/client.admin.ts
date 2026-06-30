/**
 * ADMIN API CLIENTS — Axios (Sync DRF) and Ky (Async Ninja)
 *
 * Dedicated API clients pointing to the uniform admin-backend route:
 *   /api/v1/admin_backend/
 */
import axios, { type AxiosInstance } from "axios";
import ky, { type KyInstance } from "ky";
import { readAccessToken } from "@/features/auth/lib/auth-session.client";
import { getAdminSyncApiBaseUrl, getAdminAsyncApiBaseUrl } from "@/core/config/api-roots";
import { buildAuditHeadersSync } from "@/lib/audit-headers";
import { v4 as uuidv4 } from "uuid";

// ── Admin Sync Client (Axios) ────────────────────────────────────────────────
export const apiAdminSync: AxiosInstance = axios.create({
  baseURL: getAdminSyncApiBaseUrl(),
  timeout: 20_000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

apiAdminSync.interceptors.request.use(
  (config) => {
    const token = readAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (process.env.NODE_ENV === "development" && config.headers) {
      config.headers["ngrok-skip-browser-warning"] = "true";
    }

    if (typeof window !== "undefined" && config.headers) {
      const auditHeaders = buildAuditHeadersSync();
      Object.assign(config.headers, auditHeaders);
    }

    const method = config.method?.toUpperCase();
    if (method && ["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
      if (config.headers && !config.headers["X-Idempotency-Key"]) {
        config.headers["X-Idempotency-Key"] = uuidv4();
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

apiAdminSync.interceptors.response.use(
  (response) => {
    // Unwrap Fashionistar envelope if present
    if (
      response.data &&
      typeof response.data === "object" &&
      "success" in response.data &&
      response.data.success === true &&
      "data" in response.data &&
      response.data.data !== null
    ) {
      if (Array.isArray(response.data.data)) {
        const arr = response.data.data as any;
        arr.message = response.data.message;
        response.data = arr;
      } else {
        response.data = {
          ...response.data.data,
          message: response.data.message,
        };
      }
    }
    return response;
  },
  (error) => Promise.reject(error)
);

// ── Admin Async Client (Ky) ──────────────────────────────────────────────────
export const apiAdminAsync: KyInstance = ky.create({
  prefixUrl: getAdminAsyncApiBaseUrl(),
  timeout: 30_000,
  credentials: "include",
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
  hooks: {
    beforeRequest: [
      (request) => {
        const token = readAccessToken();
        if (token) {
          request.headers.set("Authorization", `Bearer ${token}`);
        }

        if (process.env.NODE_ENV === "development") {
          request.headers.set("ngrok-skip-browser-warning", "true");
        }

        if (typeof window !== "undefined") {
          const auditHeaders = buildAuditHeadersSync();
          for (const [key, value] of Object.entries(auditHeaders)) {
            request.headers.set(key, value);
          }
        }
      },
    ],
  },
});
