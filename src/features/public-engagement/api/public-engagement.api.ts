import { apiSync } from "@/core/api/client.sync";

export interface PublicPlatformSettings {
  platform_name: string;
  min_withdrawal_ngn: string;
  max_withdrawal_ngn: string;
  max_daily_withdrawal_ngn: string;
  min_wallet_topup_ngn: string;
  max_wallet_topup_ngn: string;
  support_email: string;
  support_phone: string;
  terms_url: string;
  privacy_url: string;
}

export interface PublicLeadCaptureResult {
  success: boolean;
  message: string;
}

interface Envelope<T> {
  data?: T;
  message?: string;
}

function unwrapData<T>(payload: Envelope<T> | T): T {
  if (payload && typeof payload === "object" && "data" in payload) {
    return (payload as Envelope<T>).data as T;
  }
  return payload as T;
}

function unwrapMessage(payload: { message?: string } | undefined, fallback: string): string {
  return payload?.message ?? fallback;
}

export const publicEngagementApi = {
  async getPlatformSettings(): Promise<PublicPlatformSettings> {
    const { data } = await apiSync.get("v1/platform/settings/public/");
    return data as PublicPlatformSettings;
  },

  async submitNewsletter(input: { email: string; source?: string }): Promise<PublicLeadCaptureResult> {
    const { data } = await apiSync.post("v1/public/newsletter/", input);
    return {
      success: true,
      message: unwrapMessage(data, "Newsletter signup received successfully."),
    };
  },

  async submitWaitlist(input: { email: string; source?: string }): Promise<PublicLeadCaptureResult> {
    const { data } = await apiSync.post("v1/public/waitlist/", input);
    return {
      success: true,
      message: unwrapMessage(data, "Waitlist signup received successfully."),
    };
  },

  async submitContact(input: {
    full_name: string;
    email: string;
    phone?: string;
    subject?: string;
    message: string;
    vendor?: string;
    inquiry_type?: string;
    page_url?: string;
  }): Promise<PublicLeadCaptureResult> {
    const { data } = await apiSync.post("v1/public/contact/", input);
    unwrapData(data);
    return {
      success: true,
      message: unwrapMessage(
        data,
        "Your message has been received. Our team will follow up soon.",
      ),
    };
  },
};
