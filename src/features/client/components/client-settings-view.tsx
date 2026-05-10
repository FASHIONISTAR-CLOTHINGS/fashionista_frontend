"use client";

import { useState } from "react";
import {
  User, Lock, Bell, Shield, Wallet, Sun, Ruler, LogOut, Monitor, Tag,
} from "lucide-react";
import { useTheme } from "@/features/theme/theme-provider";
import {
  DashInput, DashTextarea, DashSelect, ToggleSwitch,
  RadioCard, PinInput, SaveBar, SessionCard, DangerZone, SettingSection,
} from "@/components/settings/settings-ui";
import { useClientProfile } from "@/features/client/hooks/use-client-profile";
import {
  useMeasurementProfiles,
  useCreateMeasurementProfile,
  useUpdateMeasurementProfile,
} from "@/features/measurements/hooks/use-measurements";
import type { MeasurementUnit, CreateMeasurementProfileInput } from "@/features/measurements/types/measurements.types";
import { useEffect } from "react";

type TabId = "profile" | "security" | "notifications" | "privacy" | "wallet" | "measurements" | "appearance";

const TABS: { id: TabId; label: string; Icon: React.ElementType }[] = [
  { id: "profile", label: "Profile", Icon: User },
  { id: "security", label: "Security", Icon: Lock },
  { id: "notifications", label: "Notifications", Icon: Bell },
  { id: "privacy", label: "Privacy", Icon: Shield },
  { id: "wallet", label: "Wallet & PIN", Icon: Wallet },
  { id: "measurements", label: "Measurements", Icon: Ruler },
  { id: "appearance", label: "Appearance", Icon: Sun },
];

/* ── Profile Tab ─────────────────────────────────────────────────────────────── */
function ProfileTab() {
  const { data: profile } = useClientProfile();
  const [form, setForm] = useState({
    bio: profile?.bio ?? "",
    state: profile?.state ?? "",
    country: profile?.country ?? "Nigeria",
    preferred_size: profile?.preferred_size ?? "",
    style_preferences: (profile?.style_preferences ?? []).join(", "),
    favourite_colours: (profile?.favourite_colours ?? []).join(", "),
    language: "en",
    timezone: "Africa/Lagos",
  });
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    setSaving(false);
  };

  return (
    <div className="space-y-0">
      <SettingSection title="About you" description="Help vendors understand your style better.">
        <div className="flex flex-col gap-4">
          <DashTextarea label="Bio" id="bio" value={form.bio}
            onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
            hint="Max 280 characters."
            placeholder="I love contemporary Ankara fusion and minimal streetwear." />
          <DashInput label="Preferred size" id="pref_size" value={form.preferred_size}
            onChange={(e) => setForm((f) => ({ ...f, preferred_size: e.target.value }))}
            placeholder="L, XL, 42, UK 14…" />
          <DashInput label="Style preferences" id="style_pref" value={form.style_preferences}
            onChange={(e) => setForm((f) => ({ ...f, style_preferences: e.target.value }))}
            placeholder="Ankara, minimal, occasionwear — comma-separated" />
          <DashInput label="Favourite colours" id="fav_colours" value={form.favourite_colours}
            onChange={(e) => setForm((f) => ({ ...f, favourite_colours: e.target.value }))}
            placeholder="Black, gold, emerald — comma-separated" />
        </div>
      </SettingSection>

      <SettingSection title="Location" description="Used for shipping cost estimates.">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <DashInput label="State" id="state" value={form.state}
            onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))} placeholder="Lagos State" />
          <DashInput label="Country" id="country" value={form.country}
            onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))} placeholder="Nigeria" />
        </div>
      </SettingSection>

      <SettingSection title="Locale" description="Language and timezone for your account.">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <DashSelect label="Language" value={form.language}
            onChange={(v) => setForm((f) => ({ ...f, language: v }))}
            options={[
              { value: "en", label: "English" },
              { value: "fr", label: "French" },
              { value: "yo", label: "Yoruba" },
              { value: "ig", label: "Igbo" },
              { value: "ha", label: "Hausa" },
            ]} />
          <DashSelect label="Timezone" value={form.timezone}
            onChange={(v) => setForm((f) => ({ ...f, timezone: v }))}
            options={[
              { value: "Africa/Lagos", label: "WAT — Lagos (UTC+1)" },
              { value: "Africa/Abidjan", label: "GMT — Abidjan (UTC+0)" },
              { value: "Africa/Nairobi", label: "EAT — Nairobi (UTC+3)" },
              { value: "Europe/London", label: "GMT — London (UTC+0)" },
            ]} />
        </div>
      </SettingSection>
      <SaveBar onSave={save} loading={saving} />
    </div>
  );
}

/* ── Security Tab ────────────────────────────────────────────────────────────── */
const MOCK_SESSIONS = [
  { id: 1, device: "Chrome on Samsung S24", location: "Lagos, NG", time: "Active now", isCurrent: true },
  { id: 2, device: "Safari on iPhone 15", location: "Lagos, NG", time: "5 hours ago", isCurrent: false },
];

function SecurityTab() {
  const [pwd, setPwd] = useState({ current: "", newPwd: "", confirm: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [twoFa, setTwoFa] = useState({ sms: true, email: false });
  const [sessions, setSessions] = useState(MOCK_SESSIONS);

  const savePwd = async () => {
    const e: Record<string, string> = {};
    if (!pwd.current) e.current = "Current password is required.";
    if (pwd.newPwd.length < 8) e.newPwd = "Must be at least 8 characters.";
    if (pwd.newPwd !== pwd.confirm) e.confirm = "Passwords do not match.";
    if (Object.keys(e).length) { setErrors(e); return; }
    setSaving(true);
    await new Promise((r) => setTimeout(r, 900));
    setSaving(false);
    setPwd({ current: "", newPwd: "", confirm: "" });
    setErrors({});
  };

  return (
    <div className="space-y-0">
      <SettingSection title="Change password" description="Use a strong, unique password for your shopping account.">
        <div className="flex flex-col gap-4">
          <DashInput label="Current password" id="cur_pwd" type="password" value={pwd.current}
            error={errors.current} onChange={(e) => { setPwd((p) => ({ ...p, current: e.target.value })); setErrors((x) => ({ ...x, current: "" })); }} />
          <DashInput label="New password" id="new_pwd" type="password" value={pwd.newPwd}
            error={errors.newPwd} onChange={(e) => { setPwd((p) => ({ ...p, newPwd: e.target.value })); setErrors((x) => ({ ...x, newPwd: "" })); }}
            placeholder="Min. 8 characters" />
          <DashInput label="Confirm new password" id="conf_pwd" type="password" value={pwd.confirm}
            error={errors.confirm} onChange={(e) => { setPwd((p) => ({ ...p, confirm: e.target.value })); setErrors((x) => ({ ...x, confirm: "" })); }} />
          <SaveBar onSave={savePwd} loading={saving} label="Update password" />
        </div>
      </SettingSection>

      <SettingSection title="Two-factor authentication" description="Protect your account and wallet.">
        <div className="flex flex-col gap-3">
          <ToggleSwitch id="2fa_sms" label="SMS OTP" description="One-time code sent to your phone on every sign-in."
            checked={twoFa.sms} onChange={(v) => setTwoFa((t) => ({ ...t, sms: v }))} />
          <ToggleSwitch id="2fa_email" label="Email OTP" description="One-time code sent to your email address."
            checked={twoFa.email} onChange={(v) => setTwoFa((t) => ({ ...t, email: v }))} />
        </div>
      </SettingSection>

      <SettingSection title="Active sessions" description="All devices where you are currently signed in.">
        <div className="flex flex-col gap-2">
          {sessions.map((s) => (
            <SessionCard key={s.id} device={s.device} location={s.location} time={s.time}
              isCurrent={s.isCurrent}
              onRevoke={() => setSessions((all) => all.filter((x) => x.id !== s.id))} />
          ))}
          <button type="button" className="mt-2 flex items-center gap-2 self-start rounded-full border border-[hsl(var(--border))] px-4 py-2 text-xs font-semibold text-[hsl(var(--destructive))] transition hover:bg-[hsl(var(--destructive)/0.06)]">
            <LogOut className="h-3.5 w-3.5" /> Sign out all other sessions
          </button>
        </div>
      </SettingSection>
    </div>
  );
}

/* ── Notifications Tab ───────────────────────────────────────────────────────── */
function NotificationsTab() {
  const [notifs, setNotifs] = useState({
    emailOrders: true, emailDeliveries: true, emailWallet: true, emailMarketing: false,
    smsOrders: true, smsDelivery: false,
    pushAll: true, pushOrders: true, pushWishlist: true, pushDeals: false,
  });
  const toggle = (k: keyof typeof notifs) => setNotifs((n) => ({ ...n, [k]: !n[k] }));

  return (
    <div className="space-y-0">
      <SettingSection title="Email notifications" description="Transactional and marketing emails.">
        <div className="flex flex-col gap-3">
          {([
            ["emailOrders", "Order updates", "Confirmations, dispatch alerts, and status changes"],
            ["emailDeliveries", "Delivery alerts", "Shipping and delivery milestone emails"],
            ["emailWallet", "Wallet activity", "Top-up confirmations and refund notifications"],
            ["emailMarketing", "Deals & news", "Sales, new arrivals, and Fashionistar updates"],
          ] as const).map(([key, label, desc]) => (
            <ToggleSwitch key={key} id={`e_${key}`} label={label} description={desc}
              checked={notifs[key]} onChange={() => toggle(key)} />
          ))}
        </div>
      </SettingSection>

      <SettingSection title="SMS notifications" description="Critical alerts delivered via SMS.">
        <div className="flex flex-col gap-3">
          {([
            ["smsOrders", "Order placed SMS", "Instant text when your order is confirmed"],
            ["smsDelivery", "Delivery SMS", "Text when your package is out for delivery"],
          ] as const).map(([key, label, desc]) => (
            <ToggleSwitch key={key} id={`s_${key}`} label={label} description={desc}
              checked={notifs[key]} onChange={() => toggle(key)} />
          ))}
        </div>
      </SettingSection>

      <SettingSection title="Push notifications" description="In-app push alerts.">
        <div className="flex flex-col gap-3">
          <ToggleSwitch id="push_all" label="Enable push notifications"
            description="Master toggle for all in-app alerts."
            checked={notifs.pushAll} onChange={() => toggle("pushAll")} />
          {notifs.pushAll && (
            <div className="ml-4 flex flex-col gap-3 border-l-2 border-[hsl(var(--accent)/0.3)] pl-4">
              {([
                ["pushOrders", "Order activity"],
                ["pushWishlist", "Wishlist price drops"],
                ["pushDeals", "Flash deals"],
              ] as const).map(([key, label]) => (
                <ToggleSwitch key={key} id={`p_${key}`} label={label}
                  checked={notifs[key]} onChange={() => toggle(key)} />
              ))}
            </div>
          )}
        </div>
      </SettingSection>
      <SaveBar onSave={() => {}} label="Save preferences" />
    </div>
  );
}

/* ── Privacy Tab ─────────────────────────────────────────────────────────────── */
function PrivacyTab() {
  const [privacy, setPrivacy] = useState({
    profileVisibility: "members",
    showWishlist: false,
    allowRecommendations: true,
    shareData: false,
  });

  return (
    <div className="space-y-0">
      <SettingSection title="Profile visibility" description="Control who can see your profile.">
        <div className="flex flex-col gap-3">
          {[
            { value: "public", label: "Public", desc: "Anyone on Fashionistar can see your profile" },
            { value: "members", label: "Members only", desc: "Only signed-in users can see your profile" },
            { value: "private", label: "Private", desc: "Only you can see your profile" },
          ].map((opt) => (
            <RadioCard key={opt.value} value={opt.value} selected={privacy.profileVisibility}
              onSelect={(v) => setPrivacy((p) => ({ ...p, profileVisibility: v }))}
              label={opt.label} description={opt.desc} />
          ))}
        </div>
      </SettingSection>

      <SettingSection title="Activity & personalisation" description="Control how Fashionistar uses your data.">
        <div className="flex flex-col gap-3">
          <ToggleSwitch id="show_wishlist" label="Show my wishlist" description="Other members can see products you've saved"
            checked={privacy.showWishlist} onChange={(v) => setPrivacy((p) => ({ ...p, showWishlist: v }))} />
          <ToggleSwitch id="allow_recs" label="Personalised recommendations" description="We use your order history to suggest styles"
            checked={privacy.allowRecommendations} onChange={(v) => setPrivacy((p) => ({ ...p, allowRecommendations: v }))} />
          <ToggleSwitch id="share_data" label="Share analytics with vendors" description="Anonymous data helps vendors improve products"
            checked={privacy.shareData} onChange={(v) => setPrivacy((p) => ({ ...p, shareData: v }))} />
        </div>
      </SettingSection>

      <SettingSection title="Data & account" description="Download your data or close your account.">
        <div className="flex flex-col gap-3">
          <button type="button" className="self-start rounded-full border border-[hsl(var(--border))] px-5 py-2 text-sm font-semibold text-[hsl(var(--foreground))] transition hover:bg-[hsl(var(--muted))]">
            Download my data
          </button>
          <DangerZone title="Delete client account"
            description="Your order history, wallet, and all personal data will be permanently erased. This cannot be undone."
            label="Delete account" onAction={() => alert("Contact support to delete your account.")} />
        </div>
      </SettingSection>
      <SaveBar onSave={() => {}} />
    </div>
  );
}

/* ── Wallet & PIN Tab ────────────────────────────────────────────────────────── */
function WalletPinTab() {
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [currentPin, setCurrentPin] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [hasPinSet] = useState(false);

  const savePin = async () => {
    if (pin.length < 4) { setError("PIN must be 4 digits."); return; }
    if (pin !== confirmPin) { setError("PINs do not match."); return; }
    if (hasPinSet && !currentPin) { setError("Enter your current PIN first."); return; }
    setError("");
    setSaving(true);
    await new Promise((r) => setTimeout(r, 900));
    setSaving(false);
    setPin(""); setConfirmPin(""); setCurrentPin("");
  };

  return (
    <div className="space-y-0">
      <SettingSection title="Transaction PIN" badge="Required for wallet payments"
        description="Your 4-digit PIN confirms wallet payments at checkout. Keep it private.">
        <div className="flex flex-col gap-6 rounded-[1.25rem] border border-[hsl(var(--accent)/0.25)] bg-[hsl(var(--accent)/0.04)] p-5">
          {hasPinSet && (
            <PinInput label="Current PIN" value={currentPin} onChange={setCurrentPin} />
          )}
          <PinInput label={hasPinSet ? "New PIN" : "Set your PIN"} value={pin} onChange={setPin}
            hint="Choose 4 digits. You'll use this whenever you pay with your wallet." />
          <PinInput label="Confirm PIN" value={confirmPin} onChange={setConfirmPin} />
          {error && <p className="text-xs text-[hsl(var(--destructive))]">{error}</p>}
          <SaveBar onSave={savePin} loading={saving} label={hasPinSet ? "Update PIN" : "Set PIN"} />
        </div>
      </SettingSection>

      <SettingSection title="Top up wallet" description="Add funds to your Fashionistar wallet.">
        <div className="flex flex-col gap-4">
          <DashInput label="Amount (NGN)" id="topup_amount" type="number" placeholder="5000" prefix="₦" />
          <div className="flex gap-2">
            {[1000, 2000, 5000, 10000].map((amt) => (
              <button key={amt} type="button" className="rounded-full border border-[hsl(var(--accent)/0.4)] bg-[hsl(var(--accent)/0.08)] px-4 py-2 text-xs font-semibold text-[hsl(var(--foreground))] transition hover:bg-[hsl(var(--accent)/0.18)]">
                ₦{amt.toLocaleString()}
              </button>
            ))}
          </div>
          <SaveBar onSave={() => {}} label="Proceed to payment" />
        </div>
      </SettingSection>
    </div>
  );
}

/* ── Measurements Tab ────────────────────────────────────────────────────────── */
function MeasurementsTab() {
  const { data: profiles, isLoading } = useMeasurementProfiles();
  const createMutation = useCreateMeasurementProfile();
  
  // Use the default profile if it exists, otherwise the first one.
  const profile = profiles?.find((p) => p.is_default) || profiles?.[0];
  const updateMutation = useUpdateMeasurementProfile(profile?.id ?? "");

  const [unit, setUnit] = useState<MeasurementUnit>("cm");
  const [measurements, setMeasurements] = useState({
    bust: "", waist: "", hips: "", shoulder: "",
    arm_length: "", inseam: "", neck: "", thigh: "",
  });

  // Sync state when profile loads
  useEffect(() => {
    if (profile) {
      setUnit(profile.unit);
      setMeasurements({
        bust: profile.bust?.toString() || "",
        waist: profile.waist?.toString() || "",
        hips: profile.hips?.toString() || "",
        shoulder: profile.shoulder_width?.toString() || "",
        arm_length: profile.arm_length?.toString() || "",
        inseam: profile.inseam?.toString() || "",
        neck: profile.neck?.toString() || "",
        thigh: profile.thigh?.toString() || "",
      });
    }
  }, [profile]);

  const fields: { key: keyof typeof measurements; label: string }[] = [
    { key: "bust", label: "Bust / Chest" }, { key: "waist", label: "Waist" },
    { key: "hips", label: "Hips" }, { key: "shoulder", label: "Shoulder width" },
    { key: "arm_length", label: "Arm length" }, { key: "inseam", label: "Inseam" },
    { key: "neck", label: "Neck" }, { key: "thigh", label: "Thigh" },
  ];

  const handleSave = async () => {
    const payload: CreateMeasurementProfileInput = {
      name: "My Measurements",
      unit: unit,
      bust: measurements.bust || undefined,
      waist: measurements.waist || undefined,
      hips: measurements.hips || undefined,
      shoulder_width: measurements.shoulder || undefined,
      arm_length: measurements.arm_length || undefined,
      inseam: measurements.inseam || undefined,
      neck: measurements.neck || undefined,
      thigh: measurements.thigh || undefined,
      set_as_default: true,
    };

    if (profile) {
      await updateMutation.mutateAsync(payload);
    } else {
      await createMutation.mutateAsync(payload);
    }
  };

  const saving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-0">
      <SettingSection title="Body measurements" badge="Used for custom orders"
        description="Accurate measurements help vendors produce perfectly fitting garments for you.">
        <div className="flex flex-col gap-4">
          <div className="flex gap-2">
            {(["cm", "inch"] as const).map((u) => (
              <button key={u} type="button" onClick={() => setUnit(u)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${unit === u ? "bg-[#FDA600] text-black" : "border border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"}`}>
                {u === "inch" ? "inches" : u}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {fields.map(({ key, label }) => (
              <DashInput key={key} label={label} id={`m_${key}`} type="number"
                value={measurements[key]}
                disabled={isLoading}
                onChange={(e) => setMeasurements((m) => ({ ...m, [key]: e.target.value }))}
                placeholder={`e.g. 92 ${unit}`}
                suffix={<span className="text-xs text-[hsl(var(--muted-foreground))]">{unit}</span>} />
            ))}
          </div>
          <SaveBar onSave={handleSave} loading={saving} />
        </div>
      </SettingSection>
    </div>
  );
}

/* ── Appearance Tab ──────────────────────────────────────────────────────────── */
function AppearanceTab() {
  const { theme, setTheme } = useTheme();
  return (
    <div className="space-y-0">
      <SettingSection title="Theme" description="Choose how Fashionistar looks on this device.">
        <div className="flex flex-col gap-3">
          {([
            { value: "system", label: "System default", desc: "Follows your OS light/dark preference", icon: <Monitor className="h-5 w-5" /> },
            { value: "light", label: "Light mode", desc: "Cream and gold — the classic Fashionistar look", icon: <Sun className="h-5 w-5" /> },
            { value: "dark", label: "Dark mode", desc: "Deep charcoal — easier on the eyes at night", icon: <Tag className="h-5 w-5" /> },
          ] as const).map((opt) => (
            <RadioCard key={opt.value} value={opt.value} selected={theme ?? "system"}
              onSelect={(v) => setTheme(v)}
              label={opt.label} description={opt.desc} icon={opt.icon} />
          ))}
        </div>
      </SettingSection>
    </div>
  );
}

/* ── Main ClientSettingsView ─────────────────────────────────────────────────── */
export function ClientSettingsView() {
  const [activeTab, setActiveTab] = useState<TabId>("profile");

  const TabContent: Record<TabId, React.ReactNode> = {
    profile: <ProfileTab />,
    security: <SecurityTab />,
    notifications: <NotificationsTab />,
    privacy: <PrivacyTab />,
    wallet: <WalletPinTab />,
    measurements: <MeasurementsTab />,
    appearance: <AppearanceTab />,
  };

  return (
    <div className="space-y-6 py-4">
      <div>
        <h1 className="font-bon_foyage text-5xl text-[hsl(var(--foreground))]">Settings</h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-[hsl(var(--muted-foreground))]">
          Manage your profile, security, wallet PIN, measurements, and preferences.
        </p>
      </div>

      <div className="overflow-x-auto scroll-hide">
        <div className="flex min-w-max gap-1 rounded-[1.25rem] bg-[hsl(var(--muted)/0.5)] p-1">
          {TABS.map(({ id, label, Icon }) => {
            const active = activeTab === id;
            return (
              <button key={id} type="button" onClick={() => setActiveTab(id)}
                className={`flex items-center gap-2 rounded-[1rem] px-4 py-2.5 text-sm font-semibold whitespace-nowrap transition-all ${active ? "bg-[hsl(var(--accent))] text-black shadow-sm" : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"}`}>
                <Icon className="h-4 w-4" />
                {label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-[2rem] bg-[hsl(var(--card))] p-6 shadow-[var(--card-shadow)] md:p-8">
        {TabContent[activeTab]}
      </div>
    </div>
  );
}
