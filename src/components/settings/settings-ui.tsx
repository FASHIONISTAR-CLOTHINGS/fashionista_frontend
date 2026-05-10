// Shared Settings UI Primitives for Fashionistar Dashboards
// Used by both Vendor and Client settings pages

"use client";

import { ReactNode } from "react";
import { CheckCircle2, ChevronDown, Eye, EyeOff } from "lucide-react";
import { useRef, useState } from "react";

/* ── SettingSection ──────────────────────────────────────────────────────────── */
interface SettingSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
  badge?: string;
}
export function SettingSection({
  title,
  description,
  children,
  badge,
}: SettingSectionProps) {
  return (
    <div className="settings-section">
      <div>
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-[hsl(var(--foreground))]">
            {title}
          </h3>
          {badge && (
            <span className="inline-flex items-center rounded-full bg-[hsl(var(--accent)/0.15)] px-2 py-0.5 text-xs font-medium text-[hsl(var(--accent))]">
              {badge}
            </span>
          )}
        </div>
        {description && (
          <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
            {description}
          </p>
        )}
      </div>
      <div>{children}</div>
    </div>
  );
}

/* ── DashInput ───────────────────────────────────────────────────────────────── */
interface DashInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  prefix?: string;
  suffix?: ReactNode;
}
export function DashInput({
  label,
  hint,
  error,
  prefix,
  suffix,
  id,
  ...props
}: DashInputProps) {
  const [showPwd, setShowPwd] = useState(false);
  const isPassword = props.type === "password";
  const inputType = isPassword ? (showPwd ? "text" : "password") : props.type;

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={id}
          className="text-sm font-semibold text-[hsl(var(--foreground))]"
        >
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {prefix && (
          <span className="absolute left-4 select-none text-sm text-[hsl(var(--muted-foreground))]">
            {prefix}
          </span>
        )}
        <input
          {...props}
          id={id}
          type={inputType}
          className={`dash-input ${prefix ? "pl-14" : ""} ${isPassword || suffix ? "pr-12" : ""} ${error ? "border-[hsl(var(--destructive))]" : ""}`}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPwd((v) => !v)}
            className="absolute right-4 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
          >
            {showPwd ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        )}
        {!isPassword && suffix && (
          <span className="absolute right-4">{suffix}</span>
        )}
      </div>
      {hint && !error && (
        <p className="text-xs text-[hsl(var(--muted-foreground))]">{hint}</p>
      )}
      {error && (
        <p className="text-xs text-[hsl(var(--destructive))]">{error}</p>
      )}
    </div>
  );
}

/* ── DashTextarea ────────────────────────────────────────────────────────────── */
interface DashTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
}
export function DashTextarea({
  label,
  hint,
  error,
  id,
  ...props
}: DashTextareaProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={id}
          className="text-sm font-semibold text-[hsl(var(--foreground))]"
        >
          {label}
        </label>
      )}
      <textarea
        {...props}
        id={id}
        className={`dash-textarea ${error ? "border-[hsl(var(--destructive))]" : ""}`}
      />
      {hint && !error && (
        <p className="text-xs text-[hsl(var(--muted-foreground))]">{hint}</p>
      )}
      {error && (
        <p className="text-xs text-[hsl(var(--destructive))]">{error}</p>
      )}
    </div>
  );
}

/* ── DashSelect ──────────────────────────────────────────────────────────────── */
interface SelectOption {
  value: string;
  label: string;
}
interface DashSelectProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  hint?: string;
}
export function DashSelect({
  label,
  value,
  onChange,
  options,
  hint,
}: DashSelectProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-semibold text-[hsl(var(--foreground))]">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="dash-input cursor-pointer appearance-none pr-10"
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" />
      </div>
      {hint && (
        <p className="text-xs text-[hsl(var(--muted-foreground))]">{hint}</p>
      )}
    </div>
  );
}

/* ── ToggleSwitch ────────────────────────────────────────────────────────────── */
interface ToggleSwitchProps {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  id: string;
}
export function ToggleSwitch({
  label,
  description,
  checked,
  onChange,
  id,
}: ToggleSwitchProps) {
  return (
    <label
      htmlFor={id}
      className="flex cursor-pointer items-start justify-between gap-4 rounded-[1rem] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 transition-colors hover:border-[hsl(var(--accent)/0.4)]"
    >
      <div className="flex-1">
        <p className="text-sm font-medium text-[hsl(var(--foreground))]">
          {label}
        </p>
        {description && (
          <p className="mt-0.5 text-xs text-[hsl(var(--muted-foreground))]">
            {description}
          </p>
        )}
      </div>
      <div className="fash-toggle shrink-0">
        <input
          type="checkbox"
          id={id}
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <div className="fash-toggle-track" />
      </div>
    </label>
  );
}

/* ── RadioCard ───────────────────────────────────────────────────────────────── */
interface RadioCardProps {
  value: string;
  selected: string;
  onSelect: (value: string) => void;
  label: string;
  description?: string;
  icon?: ReactNode;
}
export function RadioCard({
  value,
  selected,
  onSelect,
  label,
  description,
  icon,
}: RadioCardProps) {
  const isSelected = selected === value;
  return (
    <button
      type="button"
      onClick={() => onSelect(value)}
      className={`flex w-full items-start gap-4 rounded-[1rem] border p-4 text-left transition-all ${
        isSelected
          ? "border-[hsl(var(--accent))] bg-[hsl(var(--accent)/0.06)] shadow-sm"
          : "border-[hsl(var(--border))] bg-[hsl(var(--card))] hover:border-[hsl(var(--accent)/0.4)]"
      }`}
    >
      {icon && (
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
            isSelected
              ? "bg-[hsl(var(--accent)/0.15)] text-[hsl(var(--accent))]"
              : "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]"
          }`}
        >
          {icon}
        </div>
      )}
      <div className="flex-1">
        <p
          className={`text-sm font-semibold ${isSelected ? "text-[hsl(var(--foreground))]" : "text-[hsl(var(--foreground))]"}`}
        >
          {label}
        </p>
        {description && (
          <p className="mt-0.5 text-xs text-[hsl(var(--muted-foreground))]">
            {description}
          </p>
        )}
      </div>
      <div
        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
          isSelected
            ? "border-[hsl(var(--accent))] bg-[hsl(var(--accent))]"
            : "border-[hsl(var(--border))]"
        }`}
      >
        {isSelected && <div className="h-2 w-2 rounded-full bg-black" />}
      </div>
    </button>
  );
}

/* ── PinInput ────────────────────────────────────────────────────────────────── */
interface PinInputProps {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  label?: string;
  hint?: string;
  error?: string;
  masked?: boolean;
}
export function PinInput({
  value,
  onChange,
  length = 4,
  label,
  hint,
  error,
  masked = true,
}: PinInputProps) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, char: string) => {
    const digit = char.replace(/\D/g, "");
    if (!digit) return;
    const arr = value.split("");
    arr[index] = digit;
    const next = arr.join("").slice(0, length);
    onChange(next);
    if (index < length - 1) refs.current[index + 1]?.focus();
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace") {
      if (value[index]) {
        const arr = value.split("");
        arr[index] = "";
        onChange(arr.join(""));
      } else if (index > 0) {
        refs.current[index - 1]?.focus();
        const arr = value.split("");
        arr[index - 1] = "";
        onChange(arr.join(""));
      }
    }
    if (e.key === "ArrowLeft" && index > 0) refs.current[index - 1]?.focus();
    if (e.key === "ArrowRight" && index < length - 1)
      refs.current[index + 1]?.focus();
  };

  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label className="text-sm font-semibold text-[hsl(var(--foreground))]">
          {label}
        </label>
      )}
      <div className="flex gap-3">
        {Array.from({ length }).map((_, i) => (
          <input
            key={i}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type={masked ? "password" : "text"}
            inputMode="numeric"
            maxLength={1}
            value={value[i] ?? ""}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            className={`pin-cell ${value[i] ? "filled" : ""}`}
          />
        ))}
      </div>
      {hint && !error && (
        <p className="text-xs text-[hsl(var(--muted-foreground))]">{hint}</p>
      )}
      {error && (
        <p className="text-xs text-[hsl(var(--destructive))]">{error}</p>
      )}
    </div>
  );
}

/* ── SaveBar ─────────────────────────────────────────────────────────────────── */
interface SaveBarProps {
  onSave: () => void;
  onCancel?: () => void;
  loading?: boolean;
  label?: string;
}
export function SaveBar({ onSave, onCancel, loading, label }: SaveBarProps) {
  return (
    <div className="flex justify-end gap-3 pt-4">
      {onCancel && (
        <button
          type="button"
          onClick={onCancel}
          className="rounded-full border border-[hsl(var(--border))] px-6 py-2.5 text-sm font-semibold text-[hsl(var(--foreground))] transition hover:bg-[hsl(var(--muted))]"
        >
          Cancel
        </button>
      )}
      <button
        type="button"
        onClick={onSave}
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-full bg-[#FDA600] px-6 py-2.5 text-sm font-semibold text-black transition hover:bg-[#f28705] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent" />
            Saving…
          </span>
        ) : (
          label ?? "Save changes"
        )}
      </button>
    </div>
  );
}

/* ── SessionCard ─────────────────────────────────────────────────────────────── */
interface SessionCardProps {
  device: string;
  location: string;
  time: string;
  isCurrent?: boolean;
  onRevoke?: () => void;
}
export function SessionCard({
  device,
  location,
  time,
  isCurrent,
  onRevoke,
}: SessionCardProps) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-[1rem] border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 py-3">
      <div className="flex items-center gap-3">
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${isCurrent ? "bg-[hsl(var(--accent)/0.15)] text-[hsl(var(--accent))]" : "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]"}`}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <rect x="2" y="3" width="20" height="14" rx="2" />
            <path d="M8 21h8M12 17v4" />
          </svg>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-[hsl(var(--foreground))]">
              {device}
            </p>
            {isCurrent && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[hsl(var(--success-bg))] px-2 py-0.5 text-xs font-medium text-[hsl(var(--success))]">
                <CheckCircle2 className="h-3 w-3" />
                Current
              </span>
            )}
          </div>
          <p className="text-xs text-[hsl(var(--muted-foreground))]">
            {location} · {time}
          </p>
        </div>
      </div>
      {!isCurrent && onRevoke && (
        <button
          type="button"
          onClick={onRevoke}
          className="rounded-lg px-3 py-1.5 text-xs font-semibold text-[hsl(var(--destructive))] transition hover:bg-[hsl(var(--destructive)/0.08)]"
        >
          Revoke
        </button>
      )}
    </div>
  );
}

/* ── DangerZone ──────────────────────────────────────────────────────────────── */
interface DangerZoneProps {
  title: string;
  description: string;
  label: string;
  onAction: () => void;
}
export function DangerZone({
  title,
  description,
  label,
  onAction,
}: DangerZoneProps) {
  return (
    <div className="rounded-[1rem] border border-[hsl(var(--destructive)/0.3)] bg-[hsl(var(--destructive)/0.05)] p-4">
      <p className="text-sm font-semibold text-[hsl(var(--destructive))]">
        {title}
      </p>
      <p className="mt-1 text-xs leading-relaxed text-[hsl(var(--destructive)/0.8)]">
        {description}
      </p>
      <button
        type="button"
        onClick={onAction}
        className="mt-3 rounded-full bg-[hsl(var(--destructive))] px-4 py-2 text-xs font-semibold text-white transition hover:opacity-90"
      >
        {label}
      </button>
    </div>
  );
}
