"use client";

/**
 * WaitlistMobileForm.tsx — Client Component
 *
 * Mobile email waitlist form extracted from the homepage RSC.
 * RSC cannot have event handlers (onSubmit), so this is a "use client" boundary.
 *
 * Displays on mobile only (md:hidden on parent div in page.tsx).
 */

import { useState } from "react";
import { toast } from "sonner";
import { publicEngagementApi } from "@/features/public-engagement";
import { Button } from "@/components/ui/button";

function getErrorMessage(error: unknown, fallback: string): string {
  if (typeof error === "object" && error !== null) {
    const maybeResponse = error as { response?: { data?: { message?: string } } };
    return maybeResponse.response?.data?.message ?? fallback;
  }
  return fallback;
}

export function WaitlistMobileForm() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitting(true);
    try {
      const result = await publicEngagementApi.submitWaitlist({
        email,
        source: "homepage_mobile_waitlist",
      });
      toast.success(result.message);
      setEmail("");
    } catch (error) {
      toast.error(
        getErrorMessage(
          error,
          "We could not add you to the waitlist right now. Please try again.",
        ),
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="flex w-full" onSubmit={handleSubmit}>
      <div className="h-[56px] w-full bg-[#F4F5FB] rounded-r-[100px] flex items-center p-1.5">
        <input
          id="mobile-email-input"
          data-testid="waitlist-email-input"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-2/3 h-full outline-none bg-inherit placeholder:font-raleway placeholder:font-medium placeholder:text-base placeholder:text-[#333] text-[#333] text-sm px-3"
          placeholder="Enter Email Address"
          aria-label="Email for waitlist"
          required
          disabled={submitting}
        />
        <Button
          data-testid="waitlist-submit"
          type="submit"
          disabled={submitting}
          className="w-1/3 h-full rounded-r-[100px] bg-[#01454a] text-white shrink-0 text-sm font-bold font-raleway min-h-[44px] hover:bg-[#01454a]/90 transition-colors disabled:opacity-70"
        >
          {submitting ? "Joining…" : "Join Waitlist"}
        </Button>
      </div>
    </form>
  );
}

export default WaitlistMobileForm;
