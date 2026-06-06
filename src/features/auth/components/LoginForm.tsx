"use client";

/**
 * features/auth/components/LoginForm.tsx
 * Premium glassmorphism login form with 2FA support.
 * Handles: email/password → JWT → optional TOTP step.
 */

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/entities/user/store/user-store";
import { Button } from "@/shared/ui";

// ── Types ─────────────────────────────────────────────────────────────────────

interface LoginPayload {
  email: string;
  password: string;
}

interface LoginResponse {
  access?: string;
  refresh?: string;
  requires_2fa?: boolean;
  session_token?: string;
  user?: Record<string, unknown>;
  message?: string;
  code?: string;
}

// ── API helpers ───────────────────────────────────────────────────────────────

const API = process.env.NEXT_PUBLIC_API_URL ?? "";

async function loginApi(payload: LoginPayload): Promise<LoginResponse> {
  const res = await fetch(`${API}/api/v1/auth/login/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message ?? data?.detail ?? "Login failed");
  return data;
}

async function verify2FAApi(sessionToken: string, totpCode: string): Promise<LoginResponse> {
  const res = await fetch(`${API}/api/v1/auth/2fa/verify/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ session_token: sessionToken, totp_code: totpCode }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message ?? "2FA verification failed");
  return data;
}

// ── OTPVerification ────────────────────────────────────────────────────────────

interface OTPVerificationProps {
  email: string;
  onSuccess: () => void;
  onBack: () => void;
}

export function OTPVerification({ email, onSuccess, onBack }: OTPVerificationProps) {
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleVerify = async () => {
    if (code.length !== 6) return;
    setIsLoading(true);
    setError("");
    try {
      const res = await fetch(`${API}/api/v1/auth/verify-email/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: code }),
      });
      if (!res.ok) throw new Error("Invalid verification code");
      onSuccess();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Verification failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="text-4xl mb-3">📧</div>
        <h2 className="text-xl font-bold text-white">Verify your email</h2>
        <p className="text-sm text-slate-400 mt-1">
          We sent a 6-digit code to <strong className="text-amber-400">{email}</strong>
        </p>
      </div>

      {/* 6-digit OTP input */}
      <div className="flex justify-center gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <input
            key={i}
            id={`otp-digit-${i}`}
            type="text"
            maxLength={1}
            inputMode="numeric"
            value={code[i] ?? ""}
            onChange={(e) => {
              const digit = e.target.value.replace(/\D/g, "");
              const newCode = code.split("");
              newCode[i] = digit;
              setCode(newCode.join(""));
              if (digit && i < 5) {
                document.getElementById(`otp-digit-${i + 1}`)?.focus();
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Backspace" && !code[i] && i > 0) {
                document.getElementById(`otp-digit-${i - 1}`)?.focus();
              }
            }}
            className="w-12 h-14 text-center text-xl font-bold bg-white/8 border border-white/20 rounded-xl text-white focus:outline-none focus:border-amber-500 focus:bg-white/12 transition-all"
          />
        ))}
      </div>

      {error && (
        <p className="text-center text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2">
          {error}
        </p>
      )}

      <Button
        onClick={handleVerify}
        isLoading={isLoading}
        disabled={code.length !== 6}
        className="w-full"
        id="otp-verify-btn"
      >
        Verify Email
      </Button>

      <button onClick={onBack} className="w-full text-sm text-slate-400 hover:text-white transition-colors text-center">
        ← Back to login
      </button>
    </div>
  );
}

// ── TwoFactorStep ─────────────────────────────────────────────────────────────

interface TwoFactorStepProps {
  sessionToken: string;
  onSuccess: (tokens: { access: string; refresh: string }) => void;
  onBack: () => void;
}

function TwoFactorStep({ sessionToken, onSuccess, onBack }: TwoFactorStepProps) {
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleVerify = async () => {
    if (code.length !== 6) return;
    setIsLoading(true);
    setError("");
    try {
      const data = await verify2FAApi(sessionToken, code);
      if (data.access && data.refresh) {
        onSuccess({ access: data.access, refresh: data.refresh });
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "2FA failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="text-center">
        <div className="text-4xl mb-3">🔐</div>
        <h2 className="text-xl font-bold text-white">Two-Factor Authentication</h2>
        <p className="text-sm text-slate-400 mt-1">Enter the 6-digit code from your authenticator app</p>
      </div>

      <input
        type="text"
        inputMode="numeric"
        maxLength={6}
        value={code}
        onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
        placeholder="000000"
        id="totp-code-input"
        className="w-full h-14 text-center text-2xl font-bold tracking-widest bg-white/8 border border-white/20 rounded-xl text-white focus:outline-none focus:border-amber-500 transition-all"
      />

      {error && (
        <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2 text-center">
          {error}
        </p>
      )}

      <Button onClick={handleVerify} isLoading={isLoading} disabled={code.length !== 6} className="w-full" id="2fa-verify-btn">
        Verify
      </Button>
      <button onClick={onBack} className="w-full text-sm text-slate-400 hover:text-white transition-colors text-center">
        ← Back
      </button>
    </div>
  );
}

// ── LoginForm ─────────────────────────────────────────────────────────────────

type LoginStep = "credentials" | "two_factor";

export function LoginForm() {
  const router = useRouter();
  const { setTokens, setUser } = useUserStore();

  const [step, setStep] = useState<LoginStep>("credentials");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [sessionToken, setSessionToken] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setIsLoading(true);
    setError("");

    try {
      const data = await loginApi({ email, password });
      if (data.requires_2fa && data.session_token) {
        setSessionToken(data.session_token);
        setStep("two_factor");
      } else if (data.access && data.refresh) {
        setTokens({ access: data.access, refresh: data.refresh });
        if (data.user) setUser(data.user as Parameters<typeof setUser>[0]);
        router.push("/dashboard");
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Login failed. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handle2FASuccess = (tokens: { access: string; refresh: string }) => {
    setTokens(tokens);
    router.push("/dashboard");
  };

  if (step === "two_factor") {
    return <TwoFactorStep sessionToken={sessionToken} onSuccess={handle2FASuccess} onBack={() => setStep("credentials")} />;
  }

  return (
    <form onSubmit={handleLogin} className="space-y-5" noValidate>
      <div className="space-y-1.5">
        <label htmlFor="login-email" className="text-xs font-medium text-slate-300 uppercase tracking-wide">
          Email Address
        </label>
        <input
          id="login-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          autoComplete="email"
          required
          className="w-full h-11 bg-white/8 border border-white/15 rounded-xl px-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/60 focus:bg-white/10 transition-all"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="login-password" className="text-xs font-medium text-slate-300 uppercase tracking-wide">
          Password
        </label>
        <div className="relative">
          <input
            id="login-password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
            required
            className="w-full h-11 bg-white/8 border border-white/15 rounded-xl px-4 pr-12 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/60 focus:bg-white/10 transition-all"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
            aria-label={showPassword ? "Hide password" : "Show password"}
            id="login-toggle-password"
          >
            {showPassword ? "👁️" : "👁️‍🗨️"}
          </button>
        </div>
      </div>

      <div className="flex justify-end">
        <a href="/auth/forgot-password" className="text-xs text-amber-400 hover:text-amber-300 transition-colors">
          Forgot password?
        </a>
      </div>

      {error && (
        <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      <Button type="submit" isLoading={isLoading} className="w-full" size="lg" id="login-submit-btn">
        Sign In
      </Button>

      <div className="relative flex items-center">
        <div className="flex-1 h-px bg-white/10" />
        <span className="px-3 text-xs text-slate-500">OR</span>
        <div className="flex-1 h-px bg-white/10" />
      </div>

      <p className="text-center text-sm text-slate-400">
        Don&apos;t have an account?{" "}
        <a href="/auth/register" className="text-amber-400 hover:text-amber-300 font-medium transition-colors">
          Sign up free
        </a>
      </p>
    </form>
  );
}
