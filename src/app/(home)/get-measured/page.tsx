import type { Metadata } from "next";
import { GetMeasuredClient } from "./_client";

export const metadata: Metadata = {
  title: "Get Measured — FASHIONISTAR",
  description:
    "Measure your body in 60 seconds with voice-guided AI. " +
    "Dual-pose capture (front + side) delivers 14 precise measurements for perfect fit.",
};

/**
 * @route /get-measured
 * @description Public-facing measurement page accessible from the home layout.
 * T-021-T-028: Enhanced with marketing sections, brand colors, YouTube embed.
 */
export default function GetMeasuredPage() {
  return (
    <main className="px-5 py-10 md:px-24">
      {/* T-021: Hero heading */}
      <h1 className="border-b-[1.5px] border-[#D9D9D9] pb-3 font-bon_foyage text-[40px] leading-10 text-black md:text-7xl">
        Measurement
      </h1>

      <div className="grid gap-6 py-6 lg:grid-cols-[0.95fr_1.05fr]">
        {/* Left: Tutorial video (T-027: YouTube embed) */}
        <section className="space-y-4">
          <p className="font-raleway text-2xl text-black">
            Watch the guide, then start your voice-guided AI measurement session —
            front and side poses for maximum accuracy.
          </p>
          <div
            className="relative h-[468px] w-full rounded-[8px] border-4 border-[#F4F5FB]"
            style={{ boxShadow: "0px 2px 2px 0px #00000040" }}
          >
            <iframe
              className="absolute left-0 top-0 h-full w-full rounded-[8px]"
              src="https://www.youtube.com/embed/sk8eb2nW_ds"
              title="How to take your measurement on Fashionistar"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>

          {/* T-021: How it works section */}
          <div className="rounded-2xl bg-[#F4F5FB] p-5 space-y-3">
            <h3 className="font-satoshi text-lg font-bold text-[#01454A]">How It Works</h3>
            <ol className="space-y-2">
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#01454A] text-white text-xs font-bold flex items-center justify-center">1</span>
                <span className="text-sm text-[#475367]">Enter your age, sex, and height — we auto-predict from your age if needed.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#01454A] text-white text-xs font-bold flex items-center justify-center">2</span>
                <span className="text-sm text-[#475367]">Stand in front pose, then side pose. Voice guidance walks you through each step.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#01454A] text-white text-xs font-bold flex items-center justify-center">3</span>
                <span className="text-sm text-[#475367]">Get 14 precise body measurements saved to your profile for perfect fit recommendations.</span>
              </li>
            </ol>
          </div>
        </section>

        {/* Right: AI Scan flow (client component — needs browser camera APIs) */}
        <section className="space-y-4">
          <div className="rounded-[8px] bg-[#F4F5FB] px-4 py-3 font-satoshi text-base text-[#475367] md:text-lg">
            Save your measurements once with our dual-pose AI scan and reuse them
            across custom fashion orders for a smoother, more accurate fitting
            experience. Voice guidance walks you through every step.
          </div>
          {/* Client boundary wraps InHouseMeasurementFlow */}
          <GetMeasuredClient />
        </section>
      </div>

      {/* T-022: Brand-colored trust section */}
      <section className="mt-12 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl bg-[#01454A] p-6 text-white">
          <div className="mb-2 text-3xl">🔒</div>
          <h3 className="font-satoshi text-lg font-bold mb-1">100% Private</h3>
          <p className="text-sm text-white/80">Only pose coordinates are transmitted — no video or images are stored on our servers.</p>
        </div>
        <div className="rounded-2xl bg-[#FDA600] p-6 text-[#01454A]">
          <div className="mb-2 text-3xl">⚡</div>
          <h3 className="font-satoshi text-lg font-bold mb-1">60 Seconds</h3>
          <p className="text-sm text-[#01454A]/80">From start to finish, get your full body measurement profile in under a minute.</p>
        </div>
        <div className="rounded-2xl bg-[#F4F5FB] p-6 text-[#01454A]">
          <div className="mb-2 text-3xl">📏</div>
          <h3 className="font-satoshi text-lg font-bold mb-1">14 Measurements</h3>
          <p className="text-sm text-[#475367]">Bust, waist, hips, shoulders, arms, inseam, thigh, neck, wrist, knee, ankle, and more.</p>
        </div>
      </section>

      {/* T-026: Marketing copy section */}
      <section className="mt-8 rounded-2xl border border-[#ECE6D6] bg-white p-8 text-center">
        <h2 className="font-bon_foyage text-3xl text-[#01454A] mb-3">
          Perfect Fit Starts With Perfect Measurements
        </h2>
        <p className="font-raleway text-lg text-[#475367] max-w-2xl mx-auto">
          Join thousands of Fashionistar users who have unlocked their perfect fit profile.
          Our AI-powered dual-pose scan delivers tailor-grade accuracy from the comfort of your home.
        </p>
      </section>
    </main>
  );
}
