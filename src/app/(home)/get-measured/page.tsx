import type { Metadata } from "next";
import { GetMeasuredClient } from "./_client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Get Measured — FASHIONISTAR",
  description:
    "Measure your body in 30 seconds using your device camera. " +
    "Our AI accurately captures 14 body measurements for perfect-fit custom fashion orders.",
  openGraph: {
    title:       "Get Measured — FASHIONISTAR",
    description: "30 seconds. 14 precise measurements. Zero guesswork.",
    type:        "website",
  },
};

/**
 * @route /get-measured
 * @description TASK-017: Redesigned marketing page with psychological buildup funnel.
 *
 * Sections:
 * 1. Hero — Forest Green gradient, full-width, Golden Yellow CTA
 * 2. Video + How It Works — YouTube tutorial + 3-step process
 * 3. What We Measure — 14 measurement cards
 * 4. Why FASHIONISTAR — trust signals
 * 5. How to Prepare — checklist for best results
 * 6. Final CTA — sticky conversion section
 *
 * Psychology (Fogg + Cialdini):
 * - Social proof: "Used in 500+ custom orders"
 * - Specificity: "14 measurements" not "many measurements"
 * - Commitment: entry modal collects age (micro-commitment → conversion)
 * - Reciprocity: "Free measurements" framing lowers resistance
 */
export default function GetMeasuredPage() {
  return (
    <main className="bg-white min-h-screen">

      {/* ── SECTION 1: HERO ── */}
      <section
        className="relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #2D6A4F 0%, #1B4332 60%, #0D2818 100%)",
          minHeight: "520px",
        }}
      >
        {/* Background texture dots */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: "radial-gradient(circle, #F4C430 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
          aria-hidden="true"
        />

        <div className="relative z-10 max-w-5xl mx-auto px-6 py-20 md:py-28 flex flex-col items-center text-center gap-6">
          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F4C430]/15 border border-[#F4C430]/30">
            <span className="w-2 h-2 rounded-full bg-[#F4C430] animate-pulse" aria-hidden="true" />
            <span className="text-[#F4C430] text-xs font-semibold tracking-wide uppercase">
              AI-Powered • Free • Private
            </span>
          </div>

          {/* Headline — H1 for SEO */}
          <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight max-w-3xl">
            Your Perfect Fit,{" "}
            <span style={{ color: "#F4C430" }}>Measured by AI</span>
          </h1>

          <p className="text-white/70 text-lg md:text-xl max-w-xl leading-relaxed">
            30 seconds. 14 precise measurements. Zero guesswork.
            Just your phone and a little space.
          </p>

          {/* Stat pills */}
          <div className="flex flex-wrap gap-3 justify-center">
            {[
              { stat: "14", label: "Measurements" },
              { stat: "±2cm", label: "Accuracy" },
              { stat: "30s", label: "Scan Time" },
              { stat: "500+", label: "Custom Orders" },
            ].map(({ stat, label }) => (
              <div
                key={stat}
                className="px-4 py-2 rounded-full bg-white/10 border border-white/15 backdrop-blur-sm"
              >
                <span className="text-white font-bold text-sm">{stat}</span>
                <span className="text-white/50 text-xs ml-1.5">{label}</span>
              </div>
            ))}
          </div>

          {/* Primary CTA */}
          <GetMeasuredClient ctaOnly />

        </div>
      </section>

      {/* ── SECTION 2: VIDEO + HOW IT WORKS ── */}
      <section className="max-w-5xl mx-auto px-6 py-16 md:py-20">
        <div className="grid gap-10 lg:grid-cols-2 items-center">

          {/* YouTube embed */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              See It in Action
            </h2>
            <div
              className="relative w-full rounded-2xl overflow-hidden border-4 border-[#EDF2EC] shadow-lg"
              style={{ aspectRatio: "16/9" }}
            >
              <iframe
                className="absolute inset-0 w-full h-full"
                src="https://www.youtube.com/embed/sk8eb2nW_ds"
                title="How to take your body measurement on FASHIONISTAR — AI Body Scan Tutorial"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>

          {/* How it works */}
          <div className="flex flex-col gap-6">
            <h2 className="text-2xl font-bold text-gray-900">How It Works</h2>
            {[
              {
                step: "1",
                icon: "📱",
                title: "Set Up Your Phone",
                desc: "Prop your phone against a wall at chest height. Our orientation indicator guides you to exactly 90°.",
                color: "#2D6A4F",
              },
              {
                step: "2",
                icon: "🧍",
                title: "AI Guides Your Pose",
                desc: "Voice coaching walks you through front and side poses. Auto-capture fires when your pose is perfect.",
                color: "#F4C430",
              },
              {
                step: "3",
                icon: "📊",
                title: "Get 14 Measurements",
                desc: "Results in both cm and inches — saved to your profile and applied to every future custom order.",
                color: "#2D6A4F",
              },
            ].map(({ step, icon, title, desc, color }) => (
              <div key={step} className="flex gap-4 items-start">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                  style={{ backgroundColor: color }}
                  aria-label={`Step ${step}`}
                >
                  {step}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 flex items-center gap-2">
                    <span aria-hidden="true">{icon}</span>
                    {title}
                  </p>
                  <p className="text-gray-500 text-sm mt-0.5 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}

            {/* Secondary CTA */}
            <GetMeasuredClient ctaOnly />
          </div>
        </div>
      </section>

      {/* ── SECTION 3: WHAT WE MEASURE ── */}
      <section
        className="py-16 md:py-20"
        style={{ background: "linear-gradient(180deg, #F9FAF5 0%, #fff 100%)" }}
      >
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900">
              14 Measurements. One 30-Second Scan.
            </h2>
            <p className="text-gray-500 mt-2 max-w-xl mx-auto">
              Every dimension your tailor or custom brand needs — captured automatically.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {[
              { name: "Bust",           emoji: "👕" },
              { name: "Waist",          emoji: "⬡"  },
              { name: "Hips",           emoji: "⬡"  },
              { name: "Shoulder Width", emoji: "📏" },
              { name: "Arm Length",     emoji: "💪" },
              { name: "Inseam",         emoji: "👖" },
              { name: "Thigh",          emoji: "⬡"  },
              { name: "Height",         emoji: "📏" },
              { name: "Neck",           emoji: "⬡"  },
              { name: "Wrist",          emoji: "⌚" },
              { name: "Knee",           emoji: "⬡"  },
              { name: "Ankle",          emoji: "⬡"  },
              { name: "Chest",          emoji: "⬡"  },
              { name: "Upper Arm",      emoji: "💪" },
            ].map(({ name, emoji }) => (
              <div
                key={name}
                className="flex flex-col items-center gap-2 p-4 rounded-xl
                           bg-white border border-gray-100 shadow-sm
                           hover:border-[#2D6A4F]/30 hover:shadow-md transition-all duration-200"
              >
                <span className="text-2xl" aria-hidden="true">{emoji}</span>
                <span className="text-xs font-medium text-gray-700 text-center leading-tight">
                  {name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 4: WHY FASHIONISTAR ── */}
      <section className="max-w-5xl mx-auto px-6 py-16 md:py-20">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-10">
          Why Our Measurements Are Different
        </h2>
        <div className="grid gap-6 sm:grid-cols-3">
          {[
            {
              icon: "🎯",
              title: "AI-Powered Accuracy",
              desc: "MediaPipe pose estimation + our proprietary correction engine. Verified against professional measurements.",
              accent: "#2D6A4F",
            },
            {
              icon: "🔒",
              title: "100% Private",
              desc: "Only pose coordinates are transmitted — no video or images are stored on our servers. Ever.",
              accent: "#2D6A4F",
            },
            {
              icon: "👗",
              title: "Instant Application",
              desc: "Measurements saved to your profile are automatically used in every custom order you place.",
              accent: "#F4C430",
            },
          ].map(({ icon, title, desc, accent }) => (
            <div
              key={title}
              className="p-6 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
            >
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mb-4"
                style={{ backgroundColor: `${accent}15`, border: `1px solid ${accent}30` }}
              >
                {icon}
              </div>
              <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── SECTION 5: HOW TO PREPARE ── */}
      <section
        className="py-16 md:py-20"
        style={{ background: "linear-gradient(135deg, #2D6A4F 0%, #1B4332 100%)" }}
      >
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-3">Prepare for Best Results</h2>
          <p className="text-white/60 mb-10">
            These 4 tips increase accuracy by up to 80%
          </p>

          <div className="grid gap-4 sm:grid-cols-2 text-left mb-10">
            {[
              { check: "✓", tip: "Wear fitted clothing",    detail: "No baggy shirts or loose trousers" },
              { check: "✓", tip: "Plain background",         detail: "A white wall or door works perfectly" },
              { check: "✓", tip: "Good lighting",            detail: "Face a window or turn on overhead lights" },
              { check: "✓", tip: "Stand 1.5–2m from phone",  detail: "Your full body should be visible" },
            ].map(({ check, tip, detail }) => (
              <div
                key={tip}
                className="flex gap-3 p-4 rounded-xl bg-white/10 border border-white/10 backdrop-blur-sm"
              >
                <span
                  className="text-lg font-bold flex-shrink-0"
                  style={{ color: "#F4C430" }}
                  aria-hidden="true"
                >
                  {check}
                </span>
                <div>
                  <p className="text-white font-semibold text-sm">{tip}</p>
                  <p className="text-white/50 text-xs mt-0.5">{detail}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Final CTA */}
          <GetMeasuredClient ctaOnly cta="Get My Free Measurements →" />
        </div>
      </section>

    </main>
  );
}

