import type { Metadata } from "next";
import { GetMeasuredClient } from "./_client";

export const metadata: Metadata = {
  title: "Get Measured — FASHIONISTAR",
  description:
    "Measure your body in 30 seconds using your device camera. " +
    "Our in-house AI accurately captures 14 body measurements for perfect fit.",
};

/**
 * @route /get-measured
 * @description Public-facing measurement page accessible from the home layout.
 * Uses a client wrapper because InHouseMeasurementFlow requires browser APIs.
 */
export default function GetMeasuredPage() {
  return (
    <main className="px-5 py-10 md:px-24">
      <h1 className="border-b-[1.5px] border-[#D9D9D9] pb-3 font-bon_foyage text-[40px] leading-10 text-black md:text-7xl">
        Measurement
      </h1>
      <div className="grid gap-6 py-6 lg:grid-cols-[0.95fr_1.05fr]">
        {/* Left: Tutorial video */}
        <section className="space-y-4">
          <p className="font-raleway text-2xl text-black">
            Watch the guide before starting your In-House AI measurement session.
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
        </section>

        {/* Right: AI Scan flow (client component — needs browser camera APIs) */}
        <section className="space-y-4">
          <div className="rounded-[8px] bg-[#F4F5FB] px-4 py-3 font-satoshi text-base text-[#475367] md:text-lg">
            Save your measurements once and reuse them across custom fashion orders
            for a smoother, more accurate fitting experience.
          </div>
          {/* Client boundary wraps InHouseMeasurementFlow */}
          <GetMeasuredClient />
        </section>
      </div>
    </main>
  );
}
