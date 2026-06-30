"use client";

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

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      const result = await publicEngagementApi.submitNewsletter({
        email,
        source: "homepage_newsletter",
      });
      toast.success(result.message);
      setEmail("");
    } catch (error) {
      toast.error(
        getErrorMessage(
          error,
          "We could not submit your newsletter signup right now. Please try again.",
        ),
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="flex w-full md:w-auto gap-2" onSubmit={handleSubmit}>
      <input
        data-testid="newsletter-email-input"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Your email address"
        required
        className="flex-1 min-w-[220px] px-4 py-3 rounded-[100px] bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:border-[#FDA600] transition"
      />
      <Button
        data-testid="newsletter-submit"
        type="submit"
        disabled={loading}
        className="px-6 py-3 rounded-[100px] bg-[#FDA600] text-black font-bold font-raleway hover:bg-[#FDA600]/90 transition-all shrink-0 disabled:opacity-60 cursor-pointer"
      >
        {loading ? "Subscribing..." : "Subscribe"}
      </Button>
    </form>
  );
}
