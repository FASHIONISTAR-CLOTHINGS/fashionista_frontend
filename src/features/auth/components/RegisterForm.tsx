"use client";
/**
 * RegisterForm Component — Feature Auth
 *
 * Phase 2: Google Sign-Up button added
 * Phase 3: Dynamic country-code phone selector (Nigeria default)
 * Phase 7: Accepts `role` prop from route searchParam (vendor | client)
 * Phase 8: suppressHydrationWarning on all input wrapper divs
 *
 * Uses: React Hook Form + Zod + TanStack Query mutation
 * Supports: Email OR Phone registration toggle
 */
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2, Mail, User } from "lucide-react";
import { useState } from "react";

import {
  RegisterSchema,
  type RegisterPayload,
  type LoginResponse,
} from "@/features/auth/schemas/auth.schemas";

import { register } from "@/features/auth/services/auth.service";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { PhoneInputField } from "@/components/shared/forms/PhoneInputField";
import { GoogleSignInButton } from "@/features/auth/components/GoogleSignInButton";
import { getPostAuthRedirectPath } from "@/features/auth/lib/auth-routing";
import { normalizeAuthUser } from "@/features/auth/lib/normalize-auth-user";
import { mergeAnonymousCommerce } from "@/features/cart";
import { RichErrorMessage, FieldError } from "@/components/shared/feedback/RichErrorMessage";
import { parseApiError } from "@/lib/api/parseApiError";

type RegistrationMode = "email" | "phone";

interface RegisterFormProps {
  /** Role determined by /auth/choose-role page. Defaults to 'client'. */
  role?: "vendor" | "client";
}

export function RegisterForm({ role = "client" }: RegisterFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setPendingOTP, setTokens, setUser } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [mode, setMode] = useState<RegistrationMode>("email");
  const [apiError, setApiError] = useState<ReturnType<typeof parseApiError> | null>(null);

  // returnUrl — carry forward from the query string so OTP page can redirect back
  const returnUrl = searchParams.get("returnUrl") ?? "";

  const {
    register: rhfRegister,
    handleSubmit,
    control,
    formState: { errors },
    setValue,
  } = useForm<RegisterPayload>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      email: "",
      phone: "",
      first_name: "",
      last_name: "",
      password: "",
      password_confirm: "",
      role,
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: register,
    onSuccess: (_, variables) => {
      setApiError(null);
      const identifier = mode === "email" ? variables.email : variables.phone;
      setPendingOTP(
        mode === "email" ? { email: identifier } : { phone: identifier },
      );
      toast.success("Account created! 🎉", {
        description: "Check your email/phone for the 6-digit verification code.",
        duration: 5000,
      });
      // Pass returnUrl through to OTP page
      const otpHref = returnUrl
        ? `/auth/verify-otp?returnUrl=${encodeURIComponent(returnUrl)}`
        : "/auth/verify-otp";
      router.push(otpHref);
    },
    onError: (error) => {
      const parsed = parseApiError(error);
      setApiError(parsed);
      toast.error("Registration Failed", {
        description: parsed.message,
        duration: 6000,
      });
    },
  });

  const toggleMode = (newMode: RegistrationMode) => {
    setMode(newMode);
    setValue("email", "");
    setValue("phone", "");
    setApiError(null);
  };

  const onSubmit = (data: RegisterPayload) => {
    setApiError(null);
    mutate({ ...data, role });
  };

  // Helper for Google Auth success — with smart role-based redirect
  const handleGoogleSuccess = async (data: LoginResponse) => {
    setTokens(data.access ?? "", data.refresh ?? "");
    setUser(normalizeAuthUser(data));

    const displayName = data.user?.first_name ?? data.identifying_info ?? "User";
    toast.success("Account created successfully! 🎉", {
      description: `Welcome, ${displayName}!`,
      duration: 3000,
    });

    try {
      await mergeAnonymousCommerce();
    } catch {
      // Checkout submit performs the same idempotent merge before placing an order.
    }

    router.push(
      getPostAuthRedirectPath({
        role: data.role ?? data.user?.role,
        hasVendorProfile: data.has_vendor_profile,
        isStaff: data.user?.is_staff,
        returnUrl,
      }),
    );
  };


  const handleGoogleError = (error: string) => {
    toast.error("Google Sign-In Failed", {
      description: error,
      duration: 6000,
    });
  };
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      {/* ── Mode toggle: Email / Phone ──────────────────────────────── */}
      <div
        className="flex rounded-xl border border-border overflow-hidden shadow-sm"
        role="tablist"
        aria-label="Registration method"
      >
        <button
          type="button"
          role="tab"
          id="tab-email"
          aria-selected={mode === "email"}
          aria-controls="panel-email"
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
          id="tab-phone"
          aria-selected={mode === "phone"}
          aria-controls="panel-phone"
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
      {apiError && (
        <RichErrorMessage parsed={apiError} />
      )}

      {/* ── Name fields ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* First Name */}
        <div className="space-y-1">
          <label htmlFor="reg-fname" className="text-sm font-medium text-foreground">
            First Name
          </label>
          <div className="relative" suppressHydrationWarning>
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <input
              id="reg-fname"
              type="text"
              autoComplete="given-name"
              {...rhfRegister("first_name")}
              className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-all placeholder:text-muted-foreground/60"
              placeholder="Daniel"
              suppressHydrationWarning
            />
          </div>
          <FieldError message={errors.first_name?.message} />
        </div>

        {/* Last Name */}
        <div className="space-y-1">
          <label htmlFor="reg-lname" className="text-sm font-medium text-foreground">
            Last Name
          </label>
          <div className="relative" suppressHydrationWarning>
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <input
              id="reg-lname"
              type="text"
              autoComplete="family-name"
              {...rhfRegister("last_name")}
              className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-all placeholder:text-muted-foreground/60"
              placeholder="Ezichi"
              suppressHydrationWarning
            />
          </div>
          <FieldError message={errors.last_name?.message} />
        </div>
      </div>

      {/* ── Email or Phone ──────────────────────────────────────────── */}
      <div role="tabpanel" id={`panel-${mode}`} aria-labelledby={`tab-${mode}`}>
        {mode === "email" ? (
          <div className="space-y-1">
            <label htmlFor="reg-email" className="text-sm font-medium text-foreground">
              Email Address
            </label>
            <div className="relative" suppressHydrationWarning>
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <input
                id="reg-email"
                type="email"
                autoComplete="email"
                {...rhfRegister("email")}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-all placeholder:text-muted-foreground/60"
                placeholder="you@fashionistar.com"
              />
            </div>
            <FieldError message={errors.email?.message} />
          </div>
        ) : (
          <div className="space-y-1">
            <label htmlFor="reg-phone" className="text-sm font-medium text-foreground">
              Phone Number
            </label>
            {/* PhoneInputField handles +234 default, country selector, E.164 normalisation */}
            <Controller
              name="phone"
              control={control}
              render={({ field }) => (
                <PhoneInputField
                  id="reg-phone"
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  value={field.value ?? ""}
                  defaultCountry="NG"
                  placeholder="8012345678"
                  error={errors.phone?.message}
                />
              )}
            />
          </div>
        )}
      </div>

      {/* ── Password ─────────────────────────────────────────────────── */}
      <div className="space-y-1">
        <label htmlFor="reg-password" className="text-sm font-medium text-foreground">
          Password
        </label>
        <div className="relative" suppressHydrationWarning>
          <input
            id="reg-password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            {...rhfRegister("password")}
            className="w-full pl-4 pr-10 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-all placeholder:text-muted-foreground/60"
            placeholder="Min. 8 chars, 1 uppercase, 1 number"
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

      {/* ── Confirm Password ─────────────────────────────────────────── */}
      <div className="space-y-1">
        <label htmlFor="reg-password-confirm" className="text-sm font-medium text-foreground">
          Confirm Password
        </label>
        <div className="relative" suppressHydrationWarning>
          <input
            id="reg-password-confirm"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            {...rhfRegister("password_confirm")}
            className="w-full pl-4 pr-10 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-all placeholder:text-muted-foreground/60"
            placeholder="Repeat password"
          />
        </div>
        <FieldError message={errors.password_confirm?.message} />
      </div>

      {/* Hidden role field */}
      <input type="hidden" {...rhfRegister("role")} value={role} />

      {/* ── Submit ───────────────────────────────────────────────────── */}
      <button
        id="register-submit-btn"
        type="submit"
        disabled={isPending}
        className="
          w-full py-3 bg-primary text-primary-foreground rounded-xl
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
            Creating account…
          </>
        ) : (
          `Create ${role === "vendor" ? "Vendor" : "Client"} Account`
        )}
      </button>

      {/* ── Divider ──────────────────────────────────────────────────── */}
      <div className="relative my-2">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-muted-foreground">Or continue with</span>
        </div>
      </div>

      {/* ── Google Sign-Up ───────────────────────────────────────────── */}
      <GoogleSignInButton
        role={role}
        label="Continue with Google"
        onSuccess={handleGoogleSuccess}
        onError={handleGoogleError}
      />

      {/* ── Footer ───────────────────────────────────────────────────── */}
      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <a href="/auth/sign-in" className="text-primary font-semibold hover:underline">
          Sign in
        </a>
      </p>
    </form>
  );
}
