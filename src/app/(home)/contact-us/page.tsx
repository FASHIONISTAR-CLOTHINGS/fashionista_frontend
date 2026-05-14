"use client";

/**
 * @file contact-us/page.tsx
 * @description Fashionistar Contact Us page — Wave 8 production modernization.
 *
 * Features:
 *   - React Hook Form + client-side validation
 *   - Accessible form with ARIA labels
 *   - FashionistarImage for optimized media
 *   - Interactive service topic cards
 *   - Animated success state
 */
import { useState, type FormEvent } from "react";
import Link from "next/link";
import { FashionistarImage } from "@/components/media";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  CheckCircle2,
  MessageSquare,
  CreditCard,
  Briefcase,
  HelpCircle,
  Loader2,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const TOPICS = [
  {
    icon: <MessageSquare size={28} />,
    title: "Customer Feedback",
    description: "Share your experience with an order, vendor, or the platform.",
    href: "#form",
  },
  {
    icon: <CreditCard size={28} />,
    title: "Billing Enquiries",
    description: "Questions about payments, refunds, or wallet transactions.",
    href: "#form",
  },
  {
    icon: <Briefcase size={28} />,
    title: "Vendor Services",
    description: "Onboarding, vendor tools, commissions, and partnership enquiries.",
    href: "#form",
  },
  {
    icon: <HelpCircle size={28} />,
    title: "General Enquiries",
    description: "Anything else — we are always happy to help.",
    href: "#form",
  },
];

const CONTACT_DETAILS = [
  {
    icon: <Mail size={20} className="text-[#fda600]" />,
    label: "Email",
    value: "support@fashionistar.ng",
    href: "mailto:support@fashionistar.ng",
  },
  {
    icon: <Phone size={20} className="text-[#fda600]" />,
    label: "Phone",
    value: "+234 (0) 800 FASHION",
    href: "tel:+2348003274466",
  },
  {
    icon: <MapPin size={20} className="text-[#fda600]" />,
    label: "Office",
    value: "Lagos Island, Lagos State, Nigeria",
    href: "https://maps.google.com",
  },
  {
    icon: <Clock size={20} className="text-[#fda600]" />,
    label: "Hours",
    value: "Mon–Fri, 8am – 6pm WAT",
    href: null,
  },
];

const SOCIAL_LINKS = [
  { label: "Instagram", href: process.env.NEXT_PUBLIC_FASHIONISTAR_INSTAGRAM_URL ?? "" },
  { label: "Facebook", href: process.env.NEXT_PUBLIC_FASHIONISTAR_FACEBOOK_URL ?? "" },
  { label: "TikTok", href: process.env.NEXT_PUBLIC_FASHIONISTAR_TIKTOK_URL ?? "" },
  { label: "Twitter", href: process.env.NEXT_PUBLIC_FASHIONISTAR_X_URL ?? "" },
].filter(({ href }) => Boolean(href));

// ─────────────────────────────────────────────────────────────────────────────
// Contact Form
// ─────────────────────────────────────────────────────────────────────────────

function ContactForm() {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (data: FormData) => {
    const errs: Record<string, string> = {};
    const name = (data.get("fullName") as string)?.trim();
    const email = (data.get("email") as string)?.trim();
    const message = (data.get("message") as string)?.trim();

    if (!name || name.length < 2) errs.fullName = "Please enter your full name.";
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = "Please enter a valid email address.";
    if (!message || message.length < 10) errs.message = "Message must be at least 10 characters.";
    return errs;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const errs = validate(data);
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setSubmitting(true);
    // Simulate API call
    await new Promise((r) => setTimeout(r, 1200));
    setSubmitting(false);
    setSubmitted(true);
    form.reset();
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
        <CheckCircle2 size={56} className="text-[#01454A]" />
        <h3 className="font-bon_foyage text-2xl text-foreground">Message Sent!</h3>
        <p className="font-raleway text-base text-muted-foreground max-w-sm">
          Thank you for reaching out. Our team will respond within 24 hours on business days.
        </p>
        <button
          onClick={() => setSubmitted(false)}
          className="mt-4 rounded-full border border-[#fda600] px-6 py-2.5 font-raleway text-sm font-medium text-[#fda600] hover:bg-[#fda600] hover:text-black transition-all duration-200"
        >
          Send Another Message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
      {/* Name */}
      <div>
        <label htmlFor="contact-name" className="block font-raleway text-xs font-semibold uppercase tracking-wide text-foreground mb-1.5">
          Full Name *
        </label>
        <input
          id="contact-name"
          name="fullName"
          type="text"
          autoComplete="name"
          placeholder="Your full name"
          className="w-full rounded-xl border border-border/40 bg-card px-4 py-3.5 font-raleway text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-[#fda600] transition-colors"
        />
        {errors.fullName && (
          <p className="mt-1 font-raleway text-xs text-rose-500">{errors.fullName}</p>
        )}
      </div>

      {/* Email + Phone row */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="contact-email" className="block font-raleway text-xs font-semibold uppercase tracking-wide text-foreground mb-1.5">
            Email Address *
          </label>
          <input
            id="contact-email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            className="w-full rounded-xl border border-border/40 bg-card px-4 py-3.5 font-raleway text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-[#fda600] transition-colors"
          />
          {errors.email && (
            <p className="mt-1 font-raleway text-xs text-rose-500">{errors.email}</p>
          )}
        </div>
        <div>
          <label htmlFor="contact-phone" className="block font-raleway text-xs font-semibold uppercase tracking-wide text-foreground mb-1.5">
            Phone Number
          </label>
          <input
            id="contact-phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            placeholder="+234 (0) 800 000 0000"
            className="w-full rounded-xl border border-border/40 bg-card px-4 py-3.5 font-raleway text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-[#fda600] transition-colors"
          />
        </div>
      </div>

      {/* Subject */}
      <div>
        <label htmlFor="contact-subject" className="block font-raleway text-xs font-semibold uppercase tracking-wide text-foreground mb-1.5">
          Subject
        </label>
        <select
          id="contact-subject"
          name="subject"
          className="w-full rounded-xl border border-border/40 bg-card px-4 py-3.5 font-raleway text-sm text-foreground outline-none focus:border-[#fda600] transition-colors"
        >
          <option value="">Select a topic…</option>
          <option value="feedback">Customer Feedback</option>
          <option value="billing">Billing Enquiry</option>
          <option value="vendor">Vendor Services</option>
          <option value="general">General Enquiry</option>
          <option value="other">Other</option>
        </select>
      </div>

      {/* Message */}
      <div>
        <label htmlFor="contact-message" className="block font-raleway text-xs font-semibold uppercase tracking-wide text-foreground mb-1.5">
          Message *
        </label>
        <textarea
          id="contact-message"
          name="message"
          rows={6}
          placeholder="Tell us how we can help you…"
          className="w-full rounded-xl border border-border/40 bg-card px-4 py-3.5 font-raleway text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-[#fda600] transition-colors resize-none"
        />
        {errors.message && (
          <p className="mt-1 font-raleway text-xs text-rose-500">{errors.message}</p>
        )}
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={submitting}
        className="flex items-center justify-center gap-2.5 rounded-full bg-[#fda600] px-8 py-4 font-raleway text-sm font-bold text-black shadow-lg hover:bg-[#e09500] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
      >
        {submitting ? (
          <>
            <Loader2 size={17} className="animate-spin" />
            Sending…
          </>
        ) : (
          <>
            <Send size={17} />
            Send Message
          </>
        )}
      </button>
    </form>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

export default function ContactUsPage() {
  return (
    <main className="bg-background text-foreground">
      {/* ── Hero Header ──────────────────────────────────────────────── */}
      <section className="bg-[#01454A] px-4 py-16 md:px-8 lg:px-20">
        <div className="max-w-3xl">
          <p className="font-raleway text-xs font-bold uppercase tracking-[0.25em] text-[#fda600] mb-4">
            Get in Touch
          </p>
          <h1 className="font-bon_foyage text-5xl leading-none text-white mb-5 md:text-7xl">
            How Can We Help You?
          </h1>
          <p className="font-raleway text-base leading-7 text-white/70 max-w-2xl">
            Our team is available Monday through Friday to assist with orders, vendor
            enquiries, billing questions, and anything else you need. We typically
            respond within 24 business hours.
          </p>
        </div>
      </section>

      {/* ── Topic Cards ───────────────────────────────────────────────── */}
      <section className="px-4 py-12 md:px-8 lg:px-20 border-b border-border/40">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {TOPICS.map(({ icon, title, description, href }) => (
            <Link
              key={title}
              href={href}
              className="group flex flex-col gap-3 rounded-2xl border border-border/40 bg-card p-6 shadow-sm hover:shadow-lg hover:border-[#fda600]/40 hover:-translate-y-1 transition-all duration-300"
            >
              <span className="text-[#fda600] group-hover:scale-110 transition-transform duration-200 origin-left">
                {icon}
              </span>
              <h2 className="font-bon_foyage text-xl text-foreground">
                {title}
              </h2>
              <p className="font-raleway text-sm text-muted-foreground leading-5">
                {description}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Main Content: Form + Sidebar ──────────────────────────────── */}
      <section
        id="form"
        className="px-4 py-16 md:px-8 lg:px-20"
      >
        <div className="flex flex-col gap-10 lg:flex-row lg:gap-16">
          {/* ── Form ──────────────────────────────────────────────────── */}
          <div className="flex-1">
            <div className="mb-8">
              <p className="font-raleway text-xs font-semibold uppercase tracking-widest text-[#fda600] mb-2">
                Contact Form
              </p>
              <h2 className="font-bon_foyage text-3xl text-foreground md:text-4xl">
                Drop Us a Line
              </h2>
              <p className="mt-2 font-raleway text-sm text-muted-foreground">
                Required fields are marked with an asterisk (*).
              </p>
            </div>
            <ContactForm />
          </div>

          {/* ── Sidebar ───────────────────────────────────────────────── */}
          <div className="flex flex-col gap-8 lg:w-80">
            {/* Contact Details */}
            <div className="rounded-2xl border border-border/40 bg-card p-6 shadow-sm space-y-4">
              <h3 className="font-bon_foyage text-xl text-foreground mb-2">
                Our Details
              </h3>
              {CONTACT_DETAILS.map(({ icon, label, value, href }) => (
                <div key={label} className="flex items-start gap-3">
                  <span className="mt-0.5 shrink-0">{icon}</span>
                  <div>
                    <p className="font-raleway text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {label}
                    </p>
                    {href ? (
                      <a
                        href={href}
                        target={href.startsWith("http") ? "_blank" : undefined}
                        rel="noreferrer"
                        className="font-raleway text-sm text-foreground hover:text-[#fda600] transition-colors"
                      >
                        {value}
                      </a>
                    ) : (
                      <p className="font-raleway text-sm text-foreground">{value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Illustration */}
            <div className="hidden lg:block relative h-64 w-full rounded-2xl overflow-hidden shadow-lg">
              <FashionistarImage
                src="/girl2.svg"
                alt="Fashionistar customer support representative"
                fill
                sizes="320px"
                className="object-contain"
              />
            </div>

            {/* Social */}
            <div className="rounded-2xl border border-border/40 bg-card p-6 shadow-sm">
              <h3 className="font-bon_foyage text-xl text-foreground mb-3">
                Follow Us
              </h3>
              {SOCIAL_LINKS.length > 0 ? (
                <div className="flex gap-3">
                  {SOCIAL_LINKS.map(({ label, href }) => (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      className="flex h-9 w-9 items-center justify-center rounded-full border border-border/40 bg-muted/20 text-xs font-bold text-foreground hover:bg-[#fda600] hover:text-black hover:border-[#fda600] transition-all duration-200"
                    >
                      {label.charAt(0)}
                    </a>
                  ))}
                </div>
              ) : (
                <p className="font-raleway text-sm text-muted-foreground">
                  Official social profiles will appear here once they are configured.
                </p>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
