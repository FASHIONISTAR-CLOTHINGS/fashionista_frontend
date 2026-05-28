import { apiAdminAsync, apiAdminSync } from "@/core/api/client.admin";

import type { AdminNotification, SendAnnouncementInput } from "./types";

type RawAdminNotification = {
  id: string;
  title: string;
  body: string;
  notification_type: string;
  channel: string;
  metadata?: Record<string, unknown> | null;
  sent_at?: string | null;
  created_at: string;
  failed?: boolean;
  external_id?: string | null;
  recipient_email?: string | null;
};

function mapAudience(targetRole: unknown): AdminNotification["target_audience"] {
  if (targetRole === "vendor") return "vendors";
  if (targetRole === "client") return "clients";
  return "all";
}

function toAdminNotification(row: RawAdminNotification): AdminNotification {
  const preview = row.body.length > 140 ? `${row.body.slice(0, 137)}...` : row.body;
  return {
    id: row.id,
    title: row.title,
    body: row.body,
    message_preview: preview,
    target_audience: mapAudience(row.metadata?.target_role),
    notification_type: row.notification_type,
    channel: row.channel,
    sent_at: row.sent_at ?? null,
    created_at: row.created_at,
    failed: Boolean(row.failed),
    external_id: row.external_id ?? "",
    recipient_email: row.recipient_email ?? null,
  };
}

export async function fetchAdminAnnouncements(): Promise<AdminNotification[]> {
  const rows = await apiAdminAsync
    .get("notification/", {
      searchParams: { channel: "in_app" },
    })
    .json<RawAdminNotification[]>();

  return rows.map(toAdminNotification);
}

export async function sendAdminAnnouncement(input: SendAnnouncementInput): Promise<{ message?: string }> {
  const target_role =
    input.target_audience === "vendors"
      ? "vendor"
      : input.target_audience === "clients"
        ? "client"
        : null;

  const response = await apiAdminSync.post("notification/broadcast/", {
    notification_type: "system_announcement",
    title: input.title,
    body: input.message,
    target_role,
  });

  return response.data;
}
