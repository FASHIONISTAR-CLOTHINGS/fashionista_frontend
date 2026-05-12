"use client";
/**
 * LoginForm Component — Feature Auth
 *
 * Phase 3: Email / Phone toggle with dynamic country-code selector (Nigeria +234 default)
 * Phase 5: Smart post-auth redirect (vendor → dashboard, client → returnUrl or dashboard)
 * Phase 8: suppressHydrationWarning on all input wrapper divs
 *
 * Uses: React Hook Form + Zod resolver + TanStack Query mutation
 */
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2, Mail, Lock } from "lucide-react";
import { useState } from "react";

import {
  LoginSchema,
  type LoginPayload,
  type LoginResponse,
} from "@/features/auth/schemas/auth.schemas";
import { login } from "@/features/auth/services/auth.service";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { PhoneInputField } from "@/components/shared/forms/PhoneInputField";
import { RichErrorMessage, FieldError } from "@/components/shared/feedback/RichErrorMessage";
import { AuthAlert } from "@/components/shared/feedback/AuthAlert";
import { GoogleSignInButton } from "@/features/auth/components/GoogleSignInButton";
import { mergeAnonymousCommerce } from "@/features/cart";
import { parseApiError } from "@/lib/api/parseApiError";


type LoginMode = "email" | "phone";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setTokens, setUser, setPendingOTP } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [mode, setMode] = useState<LoginMode>("email");
  const [phoneValue, setPhoneValue] = useState("");
  const [apiError, setApiError] = useState<ReturnType<typeof parseApiError> | null>(null);
  const [googleError, setGoogleError] = useState<string | null>(null);
  const [googleSuccess, setGoogleSuccess] = useState<string | null>(null);

  // returnUrl — where to send the user after successful auth
  const returnUrl = searchParams.get("returnUrl") ?? "";

  async function mergeCommerceBeforeRedirect() {
    try {
      await mergeAnonymousCommerce();
    } catch {
      // Checkout submit retries the same idempotent merge, so login redirect can continue.
    }
  }

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginPayload>({
    resolver: zodResolver(LoginSchema),
    defaultValues: { email_or_phone: "", password: "" },
  });

  // Smart redirect after successful authentication
  function handlePostAuthRedirect(
    role?: string,
    hasVendorProfile?: boolean,
    hasClientProfile?: boolean,
    isStaff?: boolean,
  ) {
    const normalizedRole = (role ?? "").toLowerCase();

    // Admin roles: support, staff, admin, editor, director + is_staff flag
    const ADMIN_ROLES = ["admin", "staff", "support", "editor", "director"];
    const isAdminUser = isStaff === true || ADMIN_ROLES.includes(normalizedRole);

    if (isAdminUser) {
      router.push("/admin-dashboard");
      return;
    }

    if (normalizedRole === "vendor") {
      const vendorSetupComplete = hasVendorProfile ?? false;
      router.push(vendorSetupComplete ? "/vendor/dashboard" : "/vendor/setup");
      return;
    }

    // Client redirect — same destination regardless of profile completion
    void hasClientProfile; // future: /client/complete-profile
    if (returnUrl && returnUrl.startsWith("/")) {
      router.push(returnUrl);
      return;
    }
    router.push("/client/dashboard");
  }


  // ── Google auth success handler (shared between login + register) ──────────
  // NOTE: All auth endpoints (Login, VerifyOTP, Google) now return user_id (not id)
  // for uniform API contract. AuthUser store uses .id — we bridge here.
  async function handleGoogleSuccess(data: LoginResponse) {
    setGoogleError(null);
    setGoogleSuccess("Google sign-in successful! Redirecting…");
    setTokens(data.access ?? "", data.refresh ?? "");

    if (data.user) {
      // ✅ Bridge: backend sends user_id but AuthUser.id is the canonical store field
      setUser({
        ...data.user,
        id: (data.user as unknown as { user_id?: string }).user_id ?? "",
        role: data.user.role ?? data.role,
        // Coerce null → undefined so AuthUser types are satisfied
        email: data.user.email ?? undefined,
        phone: data.user.phone ?? undefined,
        date_joined: data.user.date_joined ?? undefined,
      });
    } else {
      // Fallback: flat-response shape (unlikely for Google but handled for safety)
      setUser({
        id: data.user_id ?? "",
        email: data.identifying_info?.includes("@") ? data.identifying_info : undefined,
        phone: data.identifying_info?.startsWith("+") ? data.identifying_info : undefined,
        first_name: "User",
        last_name: "",
        role: data.role,
        is_verified: true,
        is_staff: (data.role ?? "").toLowerCase() === "admin" ||
                  (data.role ?? "").toLowerCase() === "staff",
      });
    }

    toast.success("Google Sign-In Successful!", {
      description: `Welcome, ${data.user?.first_name ?? "User"}! 🎉`,
      duration: 3000,
    });
    await mergeCommerceBeforeRedirect();
    setTimeout(() => {
      handlePostAuthRedirect(
        data.role ?? data.user?.role,
        data.has_vendor_profile,
        data.has_client_profile,
        data.user?.is_staff,
      );
    }, 600); // Small delay so success alert is visible
  }

  const { mutate, isPending } = useMutation({
    mutationFn: login,
    onSuccess: async (data) => {
      setApiError(null);

      if (data.requires_otp) {
        // Backend requires OTP verification step
        const pendingEmail = data.user?.email ?? data.identifying_info;
        setPendingOTP({ email: pendingEmail });
        toast.info("OTP Required", {
          description: "A verification code has been sent to your email/phone.",
        });
        const otpHref = returnUrl
          ? `/verify-otp?returnUrl=${encodeURIComponent(returnUrl)}`
          : "/verify-otp";
        router.push(otpHref);
        return;
      }

      setTokens(data.access ?? "", data.refresh ?? "");

      if (data.user) {
        // LoginView/VerifyOTPView return flat top-level user_id + nested user object
        // user.user_id maps to AuthUser.id
        setUser({
          ...data.user,
          id: (data.user as unknown as { user_id?: string }).user_id ?? data.user_id ?? "",
          role: data.user.role ?? data.role,
          // Coerce null → undefined so AuthUser types are satisfied
          email: data.user.email ?? undefined,
          phone: data.user.phone ?? undefined,
          date_joined: data.user.date_joined ?? undefined,
        });
      } else {
        setUser({
          id: data.user_id ?? "",
          email: data.identifying_info?.includes("@") ? data.identifying_info : undefined,
          phone: data.identifying_info?.startsWith("+") ? data.identifying_info : undefined,
          first_name: data.identifying_info ?? "User",
          last_name: "",
          role: data.role,
          is_verified: true,
          is_staff: (data.role ?? "").toLowerCase() === "admin" ||
                    (data.role ?? "").toLowerCase() === "staff",
        });
      }

      const displayName = data.user?.first_name ?? data.identifying_info ?? "User";
      toast.success("Welcome back! 👋", {
        description: `Hello, ${displayName}`,
        duration: 3000,
      });

      await mergeCommerceBeforeRedirect();
      handlePostAuthRedirect(
        data.role ?? data.user?.role,
        data.has_vendor_profile,
        data.has_client_profile,
        data.user?.is_staff,
      );

    },
    onError: (error) => {
      const parsed = parseApiError(error);
      setApiError(parsed);
      toast.error("Sign In Failed", {
        description: parsed.message,
        duration: 6000,
      });
    },
  });

  const toggleMode = (newMode: LoginMode) => {
    setMode(newMode);
    setPhoneValue("");
    setValue("email_or_phone", "");
    setApiError(null);
  };

  const onSubmit = (data: LoginPayload) => {
    setApiError(null);
    mutate(data);
  };

  // When phone mode: normalise and set form value before submit
  function handlePhoneChange(e164: string) {
    setPhoneValue(e164);
    setValue("email_or_phone", e164, { shouldValidate: false });
  }

  // No longer a redirect URL — Google credential is sent directly to backend via POST

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>

      {/* ── Mode toggle: Email / Phone ──────────────────────────────── */}
      <div
        className="flex rounded-xl border border-border overflow-hidden shadow-sm"
        role="tablist"
        aria-label="Sign in method"
      >
        <button
          type="button"
          role="tab"
          id="login-tab-email"
          aria-selected={mode === "email"}
          onClick={() => toggleMode("email")}
          className={`flex-1 py-2.5 text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
            mode === "email"
              ? "bg-primary text-primary-foreground shadow-inner"
              : "bg-background text-muted-foreground hover:bg-muted/60"
          }`}
        >
          <Mail className="h-4 w-4" />
          Email
        </button>
        <button
          type="button"
          role="tab"
          id="login-tab-phone"
          aria-selected={mode === "phone"}
          onClick={() => toggleMode("phone")}
          className={`flex-1 py-2.5 text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
            mode === "phone"
              ? "bg-primary text-primary-foreground shadow-inner"
              : "bg-background text-muted-foreground hover:bg-muted/60"
          }`}
        >
          <span className="text-xs">📱</span>
          Phone
        </button>
      </div>

      {/* ── API-level error ─────────────────────────────────────────── */}
      {apiError && <RichErrorMessage parsed={apiError} />}

      {/* ── Google auth feedback ─────────────────────────────────────── */}
      {googleError && (
        <AuthAlert variant="error" message={googleError} autoDismissMs={6000} onDismiss={() => setGoogleError(null)} />
      )}
      {googleSuccess && (
        <AuthAlert variant="success" message={googleSuccess} autoDismissMs={3000} onDismiss={() => setGoogleSuccess(null)} />
      )}

      {/* ── Email or Phone ──────────────────────────────────────────── */}
      {mode === "email" ? (
        <div className="space-y-1.5">
          <label htmlFor="login-email" className="text-sm font-medium text-foreground">
            Email Address
          </label>
          <div className="relative" suppressHydrationWarning>
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              {...register("email_or_phone")}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-all placeholder:text-muted-foreground/60"
              placeholder="you@fashionistar.com"
            />
          </div>
          <FieldError message={errors.email_or_phone?.message} />
        </div>
      ) : (
        <div className="space-y-1.5">
          <label htmlFor="login-phone" className="text-sm font-medium text-foreground">
            Phone Number
          </label>
          <PhoneInputField
            id="login-phone"
            onChange={handlePhoneChange}
            value={phoneValue}
            defaultCountry="NG"
            placeholder="8012345678"
            error={errors.email_or_phone?.message}
          />
          {/* Hidden field to satisfy React Hook Form */}
          <input type="hidden" {...register("email_or_phone")} value={phoneValue} />
        </div>
      )}

      {/* ── Password ─────────────────────────────────────────────────── */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label htmlFor="login-password" className="text-sm font-medium text-foreground">
            Password
          </label>
          <Link href="/auth/forgot-password" className="text-xs text-primary hover:underline">
            Forgot password?
          </Link>
        </div>
        <div className="relative" suppressHydrationWarning>
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input
            id="login-password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            {...register("password")}
            className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-all placeholder:text-muted-foreground/60"
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        <FieldError message={errors.password?.message} />
      </div>

      {/* ── Submit ───────────────────────────────────────────────────── */}
      <button
        id="login-submit-btn"
        type="submit"
        disabled={isPending}
        className="
          w-full py-3 px-4 bg-primary text-primary-foreground rounded-xl
          font-semibold text-sm hover:bg-primary/90
          disabled:opacity-60 disabled:cursor-not-allowed
          transition-all duration-200
          flex items-center justify-center gap-2
          shadow-sm hover:shadow-md active:scale-[0.99]
        "
      >
        {isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Signing in…
          </>
        ) : (
          "Sign In"
        )}
      </button>

      {/* ── Divider ──────────────────────────────────────────────────── */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-muted-foreground">Or continue with</span>
        </div>
      </div>

      {/* ── Google Sign-In ───────────────────────────────────────────── */}
      <GoogleSignInButton
        label="Continue with Google"
        onSuccess={handleGoogleSuccess}
        onError={(msg) => { setGoogleError(msg); }}
      />

      {/* ── Footer ───────────────────────────────────────────────────── */}
      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link href="/auth/choose-role" className="text-primary font-semibold hover:underline">
          Create one
        </Link>
      </p>
    </form>
  );
}
