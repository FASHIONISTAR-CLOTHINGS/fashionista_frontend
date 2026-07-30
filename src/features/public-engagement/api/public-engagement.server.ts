import { getServerBackendRootUrl } from "@/core/config/api-roots";

import type { PublicPlatformSettings } from "./public-engagement.api";

const DEFAULT_PLATFORM_SETTINGS: PublicPlatformSettings = {
  platform_name: "Fashionistar",
  min_withdrawal_ngn: "0",
  max_withdrawal_ngn: "0",
  max_daily_withdrawal_ngn: "0",
  min_wallet_topup_ngn: "0",
  max_wallet_topup_ngn: "0",
  support_email: "support@fashionistar.net",
  support_phone: "",
  terms_url: "",
  privacy_url: "",
};

export async function getPublicPlatformSettings(): Promise<PublicPlatformSettings> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5_000);

  try {
    const response = await fetch(
      `${getServerBackendRootUrl()}/api/v1/platform/settings/public/`,
      {
        headers: {
          Accept: "application/json",
          "ngrok-skip-browser-warning": "true",
        },
        next: { revalidate: 60, tags: ["public-platform-settings"] },
        signal: controller.signal,
      },
    );

    if (!response.ok) {
      return DEFAULT_PLATFORM_SETTINGS;
    }

    const raw = (await response.json()) as Partial<PublicPlatformSettings>;
    return {
      ...DEFAULT_PLATFORM_SETTINGS,
      ...raw,
    };
  } catch {
    return DEFAULT_PLATFORM_SETTINGS;
  } finally {
    clearTimeout(timeout);
  }
}
