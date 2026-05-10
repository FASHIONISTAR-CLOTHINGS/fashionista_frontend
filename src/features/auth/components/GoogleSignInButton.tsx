/**
 * GoogleSignInButton — enterprise Google button with a single GIS initialize().
 *
 * Google Identity Services recommends calling initialize() only once per page.
 * We therefore load the script ourselves, keep one shared callback bridge, and
 * render the button into each mounted container without reinitializing the SDK.
 */
"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { apiSync } from "@/core/api/client.sync";
import { AUTH_ENDPOINTS } from "@/core/constants/api.constants";
import { LoginResponseSchema } from "@/features/auth/schemas/auth.schemas";
import type { LoginResponse } from "@/features/auth/schemas/auth.schemas";
import { parseApiError } from "@/lib/api/parseApiError";

type GoogleCredentialResponse = {
  credential?: string;
};

type GoogleIdConfiguration = {
  client_id: string;
  callback: (response: GoogleCredentialResponse) => void;
  auto_select?: boolean;
  cancel_on_tap_outside?: boolean;
  use_fedcm_for_prompt?: boolean;
};

type GoogleButtonConfiguration = {
  theme?: "outline" | "filled_blue" | "filled_black";
  size?: "large" | "medium" | "small";
  text?: "continue_with" | "signin_with" | "signup_with";
  shape?: "rectangular" | "pill" | "circle" | "square";
  width?: number;
  logo_alignment?: "left" | "center";
};

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (configuration: GoogleIdConfiguration) => void;
          renderButton: (
            parent: HTMLElement,
            options: GoogleButtonConfiguration,
          ) => void;
        };
      };
    };
    __fashionistarGoogleScriptPromise?: Promise<void>;
    __fashionistarGoogleIdentityInitialized?: boolean;
  }
}

let googleScriptPromise: Promise<void> | null = null;
let hasInitializedGoogleIdentity = false;
let activeCredentialHandler: ((response: GoogleCredentialResponse) => void) | null =
  null;

function loadGoogleIdentityScript(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.resolve();
  }

  if (window.google?.accounts?.id) {
    return Promise.resolve();
  }

  if (window.__fashionistarGoogleScriptPromise) {
    return window.__fashionistarGoogleScriptPromise;
  }

  if (googleScriptPromise) {
    return googleScriptPromise;
  }

  googleScriptPromise = new Promise<void>((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[data-google-identity="true"]',
    );

    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(), { once: true });
      existingScript.addEventListener(
        "error",
        () => reject(new Error("Failed to load Google Identity Services.")),
        { once: true },
      );
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.dataset.googleIdentity = "true";
    script.onload = () => resolve();
    script.onerror = () =>
      reject(new Error("Failed to load Google Identity Services."));
    document.head.appendChild(script);
  });

  window.__fashionistarGoogleScriptPromise = googleScriptPromise;
  return googleScriptPromise;
}

interface GoogleSignInButtonProps {
  role?: "vendor" | "client";
  label?: string;
  onSuccess: (data: LoginResponse) => void;
  onError: (message: string) => void;
  className?: string;
}

export function GoogleSignInButton({
  role,
  label = "Continue with Google",
  onSuccess,
  onError,
  className = "",
}: GoogleSignInButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handleCredential(response: GoogleCredentialResponse) {
    const id_token = response.credential;

    if (!id_token) {
      onError("Google sign-in failed — no credential received.");
      return;
    }

    setLoading(true);

    try {
      const payload: Record<string, string> = { id_token };
      if (role) {
        payload.role = role;
      }

      const { data } = await apiSync.post(AUTH_ENDPOINTS.GOOGLE, payload);
      const parsed = LoginResponseSchema.parse(data);
      onSuccess(parsed);
    } catch (error) {
      const parsedError = parseApiError(error);
      onError(parsedError.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <RenderedGoogleButton
      label={label}
      loading={loading}
      onCredential={handleCredential}
      onError={onError}
      className={className}
    />
  );
}

interface RenderedGoogleButtonProps {
  label: string;
  loading: boolean;
  onCredential: (response: GoogleCredentialResponse) => void;
  onError: (message: string) => void;
  className?: string;
}

function RenderedGoogleButton({
  label,
  loading,
  onCredential,
  onError,
  className = "",
}: RenderedGoogleButtonProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    activeCredentialHandler = onCredential;
  }, [onCredential]);

  useEffect(() => {
    let cancelled = false;

    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";

    async function renderGoogleButton() {
      if (!clientId) {
        onError("Google sign-in is not configured yet.");
        return;
      }

      try {
        await loadGoogleIdentityScript();

        if (cancelled || !window.google?.accounts?.id || !containerRef.current) {
          return;
        }

        // Persist GIS init state on window so Fast Refresh does not reinitialize it.
        if (!window.__fashionistarGoogleIdentityInitialized && !hasInitializedGoogleIdentity) {
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: (response) => {
              activeCredentialHandler?.(response);
            },
            auto_select: false,
            cancel_on_tap_outside: true,
          });

          window.__fashionistarGoogleIdentityInitialized = true;
          hasInitializedGoogleIdentity = true;
        }

        containerRef.current.replaceChildren();

        const width = Math.max(
          220,
          Math.round(containerRef.current.getBoundingClientRect().width || 360),
        );

        window.google.accounts.id.renderButton(containerRef.current, {
          theme: "outline",
          size: "large",
          text: "continue_with",
          shape: "rectangular",
          logo_alignment: "left",
          width,
        });

        if (!cancelled) {
          setIsReady(true);
        }
      } catch {
        if (!cancelled) {
          onError("Google sign-in failed to load. Please try again.");
        }
      }
    }

    void renderGoogleButton();

    return () => {
      cancelled = true;
    };
  }, [onError]);

  if (loading) {
    return (
      <button
        type="button"
        disabled
        className={`w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-600 shadow-sm disabled:cursor-not-allowed disabled:opacity-70 ${className}`}
      >
        <span className="flex items-center justify-center gap-3">
          <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
          Connecting to Google…
        </span>
      </button>
    );
  }

  return (
    <div
      id="google-auth-btn"
      data-testid="google-auth-btn"
      aria-label={label}
      className={`w-full ${className}`}
    >
      {/* Keep a local loading shell so auth pages do not jump while GIS mounts. */}
      {!isReady ? (
        <div className="flex w-full items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm">
          {label}
        </div>
      ) : null}
      <div
        ref={containerRef}
        className={`${isReady ? "block" : "hidden"} w-full overflow-hidden rounded-xl`}
        aria-label={`${label} button`}
      />
    </div>
  );
}
