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

export function WaitlistMobileForm() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitting(true);
    try {
      // Simulate waitlist submission — replace with real API call when ready
      await new Promise((r) => setTimeout(r, 600));
      toast.success("You're on the waitlist! We'll be in touch soon.");
      setEmail("");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="flex w-full" onSubmit={handleSubmit}>
      <div className="h-[56px] w-full bg-[#F4F5FB] rounded-r-[100px] flex items-center p-1.5">
        <input
          id="mobile-email-input"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-2/3 h-full outline-none bg-inherit placeholder:font-raleway placeholder:font-medium placeholder:text-base placeholder:text-[#333] text-[#333] text-sm px-3"
          placeholder="Enter Email Address"
          aria-label="Email for waitlist"
          required
          disabled={submitting}
        />
        <button
          type="submit"
          disabled={submitting}
          className="w-1/3 h-full rounded-r-[100px] bg-[#01454a] text-white shrink-0 text-sm font-bold font-raleway min-h-[44px] hover:bg-[#01454a]/90 transition-colors disabled:opacity-70"
        >
          {submitting ? "Joining…" : "Join Waitlist"}
        </button>
      </div>
    </form>
  );
}

export default WaitlistMobileForm;
