"use client";

import { useState } from "react";
import {
  User, Lock, Bell, Shield, Wallet, Sun,
  Monitor, Tag, LogOut,
} from "lucide-react";
import { useTheme } from "@/features/theme/theme-provider";
import {
  DashInput, DashTextarea, DashSelect, ToggleSwitch,
  RadioCard, PinInput, SaveBar, SessionCard, DangerZone, SettingSection,
} from "@/components/settings/settings-ui";
import { useVendorProfile } from "@/features/vendor/hooks/use-vendor-setup";

/* ── Tab definitions ─────────────────────────────────────────────────────────── */
type TabId = "profile" | "security" | "notifications" | "privacy" | "wallet" | "appearance";

const TABS: { id: TabId; label: string; Icon: React.ElementType }[] = [
  { id: "profile", label: "Profile", Icon: User },
  { id: "security", label: "Security", Icon: Lock },
  { id: "notifications", label: "Notifications", Icon: Bell },
  { id: "privacy", label: "Privacy", Icon: Shield },
  { id: "wallet", label: "Wallet & PIN", Icon: Wallet },
  { id: "appearance", label: "Appearance", Icon: Sun },
];

/* ── Profile Tab ─────────────────────────────────────────────────────────────── */
function ProfileTab() {
  const { data: profile } = useVendorProfile();
  const [form, setForm] = useState({
    store_name: (profile?.store_name ?? "") as string,
    tagline: (profile?.tagline ?? "") as string,
    description: (profile?.description ?? "") as string,
    city: (profile?.city ?? "") as string,
    state: (profile?.state ?? "") as string,
    country: (profile?.country ?? "Nigeria") as string,
    phone: "",
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
      <SettingSection title="Store identity" description="Public-facing store name and tagline.">
        <div className="flex flex-col gap-4">
          <DashInput label="Store name" id="store_name" value={form.store_name}
            onChange={(e) => setForm((f) => ({ ...f, store_name: e.target.value }))}
            placeholder="Sapphire Collections" />
          <DashInput label="Tagline" id="tagline" value={form.tagline}
            onChange={(e) => setForm((f) => ({ ...f, tagline: e.target.value }))}
            placeholder="Modern tailoring for confident people" />
          <DashTextarea label="Store description" id="description" value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            placeholder="Tell customers what makes your store special." />
        </div>
      </SettingSection>

      <SettingSection title="Location" description="Where your store is based.">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <DashInput label="City" id="city" value={form.city}
            onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} placeholder="Lagos" />
          <DashInput label="State" id="state" value={form.state}
            onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))} placeholder="Lagos State" />
          <DashInput label="Country" id="country" value={form.country}
            onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))} placeholder="Nigeria" />
          <DashInput label="Phone" id="phone" type="tel" value={form.phone}
            prefix="+234"
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} placeholder="8012345678" />
        </div>
      </SettingSection>

      <SettingSection title="Locale" description="Language and timezone for your dashboard.">
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
              { value: "America/New_York", label: "EST — New York (UTC-5)" },
            ]} />
        </div>
      </SettingSection>
      <SaveBar onSave={save} loading={saving} />
    </div>
  );
}

/* ── Security Tab ────────────────────────────────────────────────────────────── */
const MOCK_SESSIONS = [
  { id: 1, device: "Chrome on MacBook Pro", location: "Lagos, NG", time: "Active now", isCurrent: true },
  { id: 2, device: "Safari on iPhone 15", location: "Lagos, NG", time: "2 hours ago", isCurrent: false },
  { id: 3, device: "Firefox on Windows 11", location: "Abuja, NG", time: "3 days ago", isCurrent: false },
];

function SecurityTab() {
  const [pwd, setPwd] = useState({ current: "", newPwd: "", confirm: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [twoFa, setTwoFa] = useState({ app: true, sms: false });
  const [sessions, setSessions] = useState(MOCK_SESSIONS);

  const savePwd = async () => {
    const e: Record<string, string> = {};
    if (!pwd.current) e.current = "Current password is required.";
    if (!pwd.newPwd) e.newPwd = "New password is required.";
    else if (pwd.newPwd.length < 8) e.newPwd = "Must be at least 8 characters.";
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
      <SettingSection title="Change password" description="Use a strong password of at least 8 characters.">
        <div className="flex flex-col gap-4">
          <DashInput label="Current password" id="cur_pwd" type="password" value={pwd.current}
            error={errors.current}
            onChange={(e) => { setPwd((p) => ({ ...p, current: e.target.value })); setErrors((x) => ({ ...x, current: "" })); }}
            placeholder="Enter current password" />
          <DashInput label="New password" id="new_pwd" type="password" value={pwd.newPwd}
            error={errors.newPwd}
            onChange={(e) => { setPwd((p) => ({ ...p, newPwd: e.target.value })); setErrors((x) => ({ ...x, newPwd: "" })); }}
            placeholder="Min. 8 characters" />
          <DashInput label="Confirm new password" id="conf_pwd" type="password" value={pwd.confirm}
            error={errors.confirm}
            onChange={(e) => { setPwd((p) => ({ ...p, confirm: e.target.value })); setErrors((x) => ({ ...x, confirm: "" })); }}
            placeholder="Repeat new password" />
          <SaveBar onSave={savePwd} loading={saving} label="Update password" />
        </div>
      </SettingSection>

      <SettingSection title="Two-factor authentication" description="Add an extra layer of security.">
        <div className="flex flex-col gap-3">
          <ToggleSwitch id="2fa_app" label="Authenticator app"
            description="Google Authenticator, Authy, 1Password, etc."
            checked={twoFa.app} onChange={(v) => setTwoFa((t) => ({ ...t, app: v }))} />
          <ToggleSwitch id="2fa_sms" label="SMS verification"
            description="One-time code sent to your registered phone number."
            checked={twoFa.sms} onChange={(v) => setTwoFa((t) => ({ ...t, sms: v }))} />
        </div>
      </SettingSection>

      <SettingSection title="Active sessions" description="Devices currently signed in to your account.">
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
    emailOrders: true, emailPayouts: true, emailMarketing: false,
    emailProductUpdates: true, smsOrders: true, smsPayout: false,
    pushAll: true, pushOrders: true, pushReviews: true, pushCoupons: false,
  });

  const toggle = (key: keyof typeof notifs) =>
    setNotifs((n) => ({ ...n, [key]: !n[key] }));

  return (
    <div className="space-y-0">
      <SettingSection title="Email notifications" description="Choose which emails you want to receive.">
        <div className="flex flex-col gap-3">
          {([
            ["emailOrders", "New orders", "When a customer places or updates an order"],
            ["emailPayouts", "Payout alerts", "Successful withdrawals and payout confirmations"],
            ["emailProductUpdates", "Product updates", "Low stock alerts and catalog changes"],
            ["emailMarketing", "Platform news", "Fashionistar updates, tips, and offers"],
          ] as const).map(([key, label, desc]) => (
            <ToggleSwitch key={key} id={`e_${key}`} label={label} description={desc}
              checked={notifs[key]} onChange={() => toggle(key)} />
          ))}
        </div>
      </SettingSection>

      <SettingSection title="SMS notifications" description="Time-sensitive alerts via SMS.">
        <div className="flex flex-col gap-3">
          {([
            ["smsOrders", "Order alerts", "Instant SMS for new orders"],
            ["smsPayout", "Payout SMS", "Payout confirmation via text"],
          ] as const).map(([key, label, desc]) => (
            <ToggleSwitch key={key} id={`s_${key}`} label={label} description={desc}
              checked={notifs[key]} onChange={() => toggle(key)} />
          ))}
        </div>
      </SettingSection>

      <SettingSection title="Push notifications" description="In-app and browser push alerts.">
        <div className="flex flex-col gap-3">
          <ToggleSwitch id="push_all" label="Enable push notifications"
            description="Master toggle for all in-app alerts."
            checked={notifs.pushAll} onChange={() => toggle("pushAll")} />
          {notifs.pushAll && (
            <div className="ml-4 flex flex-col gap-3 border-l-2 border-[hsl(var(--accent)/0.3)] pl-4">
              {([
                ["pushOrders", "Order activity"],
                ["pushReviews", "New reviews"],
                ["pushCoupons", "Coupon redemptions"],
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
    storeVisibility: "public",
    showPhone: false,
    showEmail: false,
    allowReviews: true,
  });

  return (
    <div className="space-y-0">
      <SettingSection title="Store visibility" description="Control who can discover your store.">
        <div className="flex flex-col gap-3">
          {[
            { value: "public", label: "Public", desc: "Anyone on Fashionistar can find your store" },
            { value: "verified", label: "Verified users only", desc: "Only KYC-verified users see your store" },
            { value: "private", label: "Private — link only", desc: "Your store won't appear in search results" },
          ].map((opt) => (
            <RadioCard key={opt.value} value={opt.value} selected={privacy.storeVisibility}
              onSelect={(v) => setPrivacy((p) => ({ ...p, storeVisibility: v }))}
              label={opt.label} description={opt.desc} />
          ))}
        </div>
      </SettingSection>

      <SettingSection title="Contact information" description="Control what customers see.">
        <div className="flex flex-col gap-3">
          <ToggleSwitch id="show_phone" label="Show phone number" description="Visible to customers with active orders"
            checked={privacy.showPhone} onChange={(v) => setPrivacy((p) => ({ ...p, showPhone: v }))} />
          <ToggleSwitch id="show_email" label="Show business email" description="Visible on your public store page"
            checked={privacy.showEmail} onChange={(v) => setPrivacy((p) => ({ ...p, showEmail: v }))} />
          <ToggleSwitch id="allow_reviews" label="Allow customer reviews" description="Customers can rate and review your products"
            checked={privacy.allowReviews} onChange={(v) => setPrivacy((p) => ({ ...p, allowReviews: v }))} />
        </div>
      </SettingSection>

      <SettingSection title="Data & account" description="Export your data or permanently close your account.">
        <div className="flex flex-col gap-3">
          <button type="button" className="self-start rounded-full border border-[hsl(var(--border))] px-5 py-2 text-sm font-semibold text-[hsl(var(--foreground))] transition hover:bg-[hsl(var(--muted))]">
            Download my data
          </button>
          <DangerZone title="Delete vendor account"
            description="All your products, orders, and payment history will be permanently erased. This cannot be undone."
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
  const [pinSaving, setPinSaving] = useState(false);
  const [pinError, setPinError] = useState("");
  const [hasPinSet] = useState(true);

  const savePin = async () => {
    if (pin.length < 4) { setPinError("PIN must be 4 digits."); return; }
    if (pin !== confirmPin) { setPinError("PINs do not match."); return; }
    if (hasPinSet && !currentPin) { setPinError("Enter your current PIN first."); return; }
    setPinError("");
    setPinSaving(true);
    await new Promise((r) => setTimeout(r, 900));
    setPinSaving(false);
    setPin(""); setConfirmPin(""); setCurrentPin("");
  };

  return (
    <div className="space-y-0">
      <SettingSection title="Transaction PIN" badge="Required for withdrawals"
        description="Your 4-digit PIN authorises all wallet withdrawals and payouts. Never share it.">
        <div className="flex flex-col gap-6">
          {hasPinSet && (
            <PinInput label="Current PIN" value={currentPin} onChange={setCurrentPin}
              hint="Enter your existing 4-digit transaction PIN." />
          )}
          <PinInput label="New PIN" value={pin} onChange={setPin}
            hint="Choose 4 digits you'll remember but others won't guess." />
          <PinInput label="Confirm new PIN" value={confirmPin} onChange={setConfirmPin} />
          {pinError && <p className="text-xs text-[hsl(var(--destructive))]">{pinError}</p>}
          <SaveBar onSave={savePin} loading={pinSaving} label={hasPinSet ? "Update PIN" : "Set PIN"} />
        </div>
      </SettingSection>

      <SettingSection title="Payout account" description="Bank details used for withdrawals.">
        <div className="flex flex-col gap-4">
          <DashInput label="Bank name" id="bank_name" placeholder="First Bank of Nigeria" />
          <DashInput label="Account number" id="acct_num" placeholder="0123456789" />
          <DashInput label="Account holder name" id="acct_name" placeholder="As printed on bank statement" />
          <SaveBar onSave={() => {}} label="Save payout account" />
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
            { value: "system", label: "System default", desc: "Matches your operating system preference", icon: <Monitor className="h-5 w-5" /> },
            { value: "light", label: "Light mode", desc: "Cream and gold — the classic Fashionistar look", icon: <Sun className="h-5 w-5" /> },
            { value: "dark", label: "Dark mode", desc: "Deep charcoal — easier on the eyes at night", icon: <Tag className="h-5 w-5" /> },
          ] as const).map((opt) => (
            <RadioCard key={opt.value} value={opt.value} selected={theme}
              onSelect={(v) => setTheme(v as "light" | "dark" | "system")}
              label={opt.label} description={opt.desc} icon={opt.icon} />
          ))}
        </div>
      </SettingSection>

      <SettingSection title="Brand preview" description="Your active Fashionistar colour palette.">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { name: "Forest Green", hex: "#01454A", cls: "bg-[#01454A]" },
            { name: "Golden Yellow", hex: "#FDA600", cls: "bg-[#FDA600]" },
            { name: "Warm Cream", hex: "#F4F3EC", cls: "bg-[#F4F3EC] border border-[hsl(var(--border))]" },
            { name: "Onyx Black", hex: "#141414", cls: "bg-[#141414]" },
          ].map((c) => (
            <div key={c.name} className="flex flex-col gap-2">
              <div className={`h-14 w-full rounded-xl ${c.cls}`} />
              <p className="text-xs font-semibold text-[hsl(var(--foreground))]">{c.name}</p>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">{c.hex}</p>
            </div>
          ))}
        </div>
      </SettingSection>
    </div>
  );
}

/* ── Main VendorSettingsView ─────────────────────────────────────────────────── */
export function VendorSettingsView() {
  const [activeTab, setActiveTab] = useState<TabId>("profile");

  const TabContent: Record<TabId, React.ReactNode> = {
    profile: <ProfileTab />,
    security: <SecurityTab />,
    notifications: <NotificationsTab />,
    privacy: <PrivacyTab />,
    wallet: <WalletPinTab />,
    appearance: <AppearanceTab />,
  };

  return (
    <div className="space-y-6 py-4">
      {/* Header */}
      <div>
        <h1 className="font-bon_foyage text-5xl text-[hsl(var(--foreground))]">Settings</h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-[hsl(var(--muted-foreground))]">
          Manage your account, security, notifications, and store preferences.
        </p>
      </div>

      {/* Tab bar — scrollable on mobile */}
      <div className="overflow-x-auto scroll-hide">
        <div className="flex min-w-max gap-1 rounded-[1.25rem] bg-[hsl(var(--muted)/0.5)] p-1">
          {TABS.map(({ id, label, Icon }) => {
            const active = activeTab === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-2 rounded-[1rem] px-4 py-2.5 text-sm font-semibold whitespace-nowrap transition-all ${
                  active
                    ? "bg-[hsl(var(--accent))] text-black shadow-sm"
                    : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab content */}
      <div className="rounded-[2rem] bg-[hsl(var(--card))] p-6 shadow-[var(--card-shadow)] md:p-8">
        {TabContent[activeTab]}
      </div>
    </div>
  );
}
