"use client";

import { useState } from "react";
import { toast } from "sonner";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    toast.success("You're on the list! 🎉 Check your inbox for a welcome gift.");
    setEmail("");
  }

  return (
    <form className="flex w-full md:w-auto gap-2" onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Your email address"
        required
        className="flex-1 min-w-[220px] px-4 py-3 rounded-[100px] bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:border-[#FDA600] transition"
      />
      <button
        type="submit"
        disabled={loading}
        className="px-6 py-3 rounded-[100px] bg-[#FDA600] text-black font-bold font-raleway hover:bg-[#FDA600]/90 transition-all shrink-0 disabled:opacity-60"
      >
        {loading ? "Subscribing..." : "Subscribe"}
      </button>
    </form>
  );
}
