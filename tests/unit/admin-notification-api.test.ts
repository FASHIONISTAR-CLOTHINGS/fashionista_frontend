import { beforeEach, describe, expect, it, vi } from "vitest";

const adminAsyncGet = vi.fn();
const adminSyncPost = vi.fn();

vi.mock("@/core/api/client.admin", () => ({
  apiAdminAsync: {
    get: adminAsyncGet,
  },
  apiAdminSync: {
    post: adminSyncPost,
  },
}));

describe("admin notification api", () => {
  beforeEach(() => {
    adminAsyncGet.mockReset();
    adminSyncPost.mockReset();
  });

  it("maps backend notification rows into admin dashboard cards", async () => {
    adminAsyncGet.mockReturnValue({
      json: vi.fn(async () => [
        {
          id: "notif-1",
          title: "Platform Maintenance",
          body: "A scheduled maintenance window will begin at midnight.",
          notification_type: "system_announcement",
          channel: "in_app",
          metadata: { target_role: "vendor" },
          sent_at: "2026-05-28T10:00:00Z",
          created_at: "2026-05-28T09:55:00Z",
          failed: false,
          external_id: "ext-1",
          recipient_email: null,
        },
      ]),
    });

    const { fetchAdminAnnouncements } = await import("@/features/admin-dashboard/notification/api");
    const rows = await fetchAdminAnnouncements();

    expect(adminAsyncGet).toHaveBeenCalledWith("notification/", {
      searchParams: { channel: "in_app" },
    });
    expect(rows[0]).toMatchObject({
      id: "notif-1",
      target_audience: "vendors",
      message_preview: "A scheduled maintenance window will begin at midnight.",
    });
  });

  it("sends broadcasts through the canonical admin notification mutation route", async () => {
    adminSyncPost.mockResolvedValue({ data: { message: "ok" } });

    const { sendAdminAnnouncement } = await import("@/features/admin-dashboard/notification/api");
    await sendAdminAnnouncement({
      title: "System Update",
      message: "Wallet reconciliation has completed.",
      target_audience: "clients",
    });

    expect(adminSyncPost).toHaveBeenCalledWith("notification/broadcast/", {
      notification_type: "system_announcement",
      title: "System Update",
      body: "Wallet reconciliation has completed.",
      target_role: "client",
    });
  });
});
