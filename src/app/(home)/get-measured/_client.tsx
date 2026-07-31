"use client";
/**
 * @file _client.tsx
 * @description TASK-018: Client boundary with MeasurementEntryModal for /get-measured page.
 *
 * Replaces the direct scan flow with a psychological entry modal:
 * 1. User clicks CTA → modal opens
 * 2. User enters age (required) → height auto-predicted from WHO tables
 * 3. Optional: weight (for BMI correction), sex (for accuracy)
 * 4. On submit: saves data to sessionStorage + routes appropriately:
 *    - Logged in  → /client/dashboard/measurements/new?age=28&height_cm=177
 *    - Not logged → /login?redirect=/client/dashboard/measurements/new
 *
 * The modal also embeds the InHouseMeasurementFlow for the quick scan
 * directly on the public page (for non-dashboard users).
 *
 * Psychology (Cialdini Commitment + Contrast):
 * - Entering age = micro-commitment → user more likely to complete scan
 * - Seeing predicted height = curiosity hook
 * - Progress from "getting info" → "confirming" → action is natural funnel
 */

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { predictHeightFromAge } from "@/lib/brand";
import { EnhancedMeasurementFlow } from "@/features/measurements/components/EnhancedMeasurementFlow";
import { initiateBodyScan } from "@/features/measurements/api/scan.api";
import { useDeviceType } from "@/features/measurements/hooks/useDeviceType";

// ─── Types ────────────────────────────────────────────────────────────────────

interface MeasurementEntryData {
  age:       number;
  heightCm:  number;
  weightKg?: number;
  sex:       "male" | "female" | "neutral";
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface GetMeasuredClientProps {
  /** Show only a CTA button (used across multiple sections of marketing page) */
  ctaOnly?: boolean;
  /** Custom CTA label */
  cta?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function GetMeasuredClient({
  ctaOnly = false,
  cta = "Get My Free Measurements →",
}: GetMeasuredClientProps) {
  const router  = useRouter();
  const device  = useDeviceType();   // TASK-061: Device detection for routing fork

  const [isModalOpen, setIsModalOpen]     = useState(false);
  const [isScanMode, setIsScanMode]       = useState(false);

  // Entry form state
  const [age, setAge]                     = useState("");
  const [heightInput, setHeightInput]     = useState("");
  const [heightUnit, setHeightUnit]       = useState<"cm" | "inch">("cm");
  const [weight, setWeight]               = useState("");
  const [sex, setSex]                     = useState<"male" | "female" | "neutral">("neutral");
  const [prediction, setPrediction]       = useState<ReturnType<typeof predictHeightFromAge> | null>(null);
  const [isSubmitting, setIsSubmitting]   = useState(false);
  const [errors, setErrors]               = useState<Record<string, string>>({});

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Predict height from age (local — no API needed for public page) ────────
  useEffect(() => {
    const ageNum = parseInt(age, 10);
    if (isNaN(ageNum) || ageNum < 10 || ageNum > 100) {
      setPrediction(null);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const result = predictHeightFromAge(ageNum, sex);
      setPrediction(result);
      // Auto-fill height if user hasn't entered it yet
      if (!heightInput) {
        setHeightInput(
          heightUnit === "cm"
            ? String(result.predictedCm)
            : String(Math.round(result.predictedCm / 2.54))
        );
      }
    }, 500);

    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [age, sex, heightUnit]);

  // ── Validate + submit ─────────────────────────────────────────────────────
  const handleSubmit = useCallback(async () => {
    const newErrors: Record<string, string> = {};
    const ageNum = parseInt(age, 10);

    if (!age || isNaN(ageNum) || ageNum < 10 || ageNum > 100) {
      newErrors.age = "Please enter a valid age (10–100)";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    setIsSubmitting(true);

    const heightNum = parseFloat(heightInput) || prediction?.predictedCm || 170;
    const heightCm  = heightUnit === "inch" ? Math.round(heightNum * 2.54 * 10) / 10 : heightNum;
    const weightKg  = weight ? parseFloat(weight) : undefined;

    const data: MeasurementEntryData = { age: ageNum, heightCm, sex, weightKg };

    try {
      // ── Step 1: Initiate scan session (gets QR + URL from backend) ──────
      const session = await initiateBodyScan({ device_type: device.apiDeviceType });

      // ── Step 2: Save full session data to sessionStorage for recovery ───
      try {
        sessionStorage.setItem("fashionistar_measurement_entry", JSON.stringify({
          ...data,
          session_id:      session.session_id,
          measurement_url: session.measurement_url,
          qr_code_b64:     session.qr_code_b64,
          qr_code_url:     session.qr_code_url,
          timestamp:       Date.now(),
        }));
      } catch {
        // sessionStorage not available (private mode)
      }

      // ── Step 3: Build shared search params ──────────────────────────────
      const params = new URLSearchParams({
        session_id: session.session_id,
        age:        String(ageNum),
        height_cm:  String(heightCm),
        ...(weightKg && { weight_kg: String(weightKg) }),
      });

      // ── Step 4: Route based on device type ──────────────────────────────
      if (device.isMobile || device.isTablet) {
        // Mobile/tablet → go directly to the camera scan page
        router.push(`/client/dashboard/measurements/scan?${params.toString()}`);
      } else {
        // Desktop/laptop → show QR gateway
        const qrParams = new URLSearchParams({
          session_id: session.session_id,
          murl:       session.measurement_url,
          age:        String(ageNum),
          height_cm:  String(heightCm),
          ...(weightKg && { weight_kg: String(weightKg) }),
        });
        router.push(`/client/dashboard/measurements/scan/qr?${qrParams.toString()}`);
      }

    } catch (err) {
      console.error("[GetMeasuredClient] Failed to initiate scan:", err);
      // Fallback: navigate to dashboard scan without session (backward-compat)
      const fallbackParams = new URLSearchParams({
        age:       String(ageNum),
        height_cm: String(heightCm),
        ...(weightKg && { weight_kg: String(weightKg) }),
      });
      router.push(`/client/dashboard/measurements/scan?${fallbackParams.toString()}`);
    } finally {
      setIsSubmitting(false);
    }
  }, [age, heightInput, heightUnit, weight, sex, prediction, router, device]);

  // ── Quick scan (public page, no auth) ────────────────────────────────────
  const handleScanComplete = useCallback(
    (profileId: string | number | null) => {
      setIsScanMode(false);
      setIsModalOpen(false);
      if (profileId) {
        // Attempt to navigate to the authenticated profile view
        router.push(`/client/dashboard/measurements/${profileId}`);
      }
    },
    [router],
  );

  // ── CTA-only mode (used across marketing page sections) ──────────────────
  if (ctaOnly) {
    return (
      <button
        id="get-measured-cta"
        onClick={() => setIsModalOpen(true)}
        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-base
                   transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
        style={{
          backgroundColor: "#F4C430",
          color:           "#0A0A0A",
          boxShadow:       "0 4px 20px rgba(244,196,48,0.35)",
        }}
        aria-label="Open measurement entry modal"
      >
        {cta}
      </button>
    );
  }

  // ── Full scan view (when not ctaOnly — kept for backward compatibility) ───
  return (
    <>
      {/* Inline scan trigger */}
      <div className="space-y-4">
        <div
          className="rounded-[8px] px-4 py-3 font-satoshi text-base md:text-lg"
          style={{ backgroundColor: "#F4F8F6", color: "#475367" }}
        >
          Save your measurements once and reuse them across custom fashion orders
          for a smoother, more accurate fitting experience.
        </div>

        <button
          id="get-measured-inline-cta"
          onClick={() => setIsModalOpen(true)}
          className="w-full rounded-xl font-semibold py-3.5 transition-all duration-200
                     flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99]"
          style={{
            backgroundColor: "#F4C430",
            color:           "#0A0A0A",
            boxShadow:       "0 4px 20px rgba(244,196,48,0.30)",
          }}
        >
          Start AI Body Scan →
        </button>

        <p className="text-xs text-center" style={{ color: "#9CA3AF" }}>
          🔒 No video stored • Only pose coordinates transmitted
        </p>
      </div>

      {/* ── MODAL ── */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{   opacity: 0 }}
              onClick={() => { setIsModalOpen(false); setIsScanMode(false); }}
            />

            {/* Modal panel */}
            <motion.div
              key="modal"
              className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
              initial={{ opacity: 0, y: 40, scale: 0.97 }}
              animate={{ opacity: 1, y: 0,  scale: 1    }}
              exit={{   opacity: 0, y: 20,  scale: 0.97 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <div
                className="relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl p-6 flex flex-col gap-5"
                style={{
                  backgroundColor: "#0F1A14",
                  border:          "1px solid rgba(45,106,79,0.3)",
                  boxShadow:       "0 25px 60px rgba(0,0,0,0.6)",
                }}
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-label="Body measurement entry"
              >
                {/* Close button */}
                <button
                  onClick={() => { setIsModalOpen(false); setIsScanMode(false); }}
                  className="absolute top-4 right-4 text-white/40 hover:text-white/80 transition text-lg"
                  aria-label="Close modal"
                >
                  ✕
                </button>

                {/* Header */}
                <div>
                  <h2 className="text-white font-bold text-xl">Before Your Scan</h2>
                  <p className="text-white/50 text-sm mt-1">
                    A few details help our AI give you the most accurate results
                  </p>
                </div>

                {!isScanMode ? (
                  /* ── Entry Form ── */
                  <div className="flex flex-col gap-4">

                    {/* Age (required) */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-white/70">
                        Your Age <span className="text-[#F4C430]">*</span>
                      </label>
                      <input
                        type="number"
                        min={10}
                        max={100}
                        placeholder="e.g. 28"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        className="w-full rounded-xl px-4 py-2.5 text-sm text-white
                                   placeholder:text-white/30 transition outline-none
                                   focus:ring-1 focus:ring-[#F4C430]"
                        style={{
                          backgroundColor: "rgba(255,255,255,0.07)",
                          border:          "1px solid rgba(255,255,255,0.12)",
                        }}
                        aria-required="true"
                        aria-describedby={errors.age ? "age-error" : undefined}
                      />
                      {errors.age && (
                        <p id="age-error" className="text-[#DC2626] text-xs">{errors.age}</p>
                      )}

                      {/* Height prediction pill */}
                      {prediction && (
                        <motion.div
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="px-3 py-2 rounded-lg text-xs flex items-center gap-2"
                          style={{
                            backgroundColor: "rgba(244,196,48,0.08)",
                            border:          "1px solid rgba(244,196,48,0.2)",
                            color:           "#F4C430",
                          }}
                        >
                          <span>✨</span>
                          <span>
                            Estimated height: ~{prediction.predictedCm}cm ({prediction.predictedInch})
                            — range {prediction.rangeLow}–{prediction.rangeHigh}cm
                          </span>
                        </motion.div>
                      )}
                    </div>

                    {/* Sex (for prediction accuracy) */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-white/70">Biological Sex</label>
                      <div className="flex rounded-xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.10)" }}>
                        {([
                          { value: "male",    label: "Male"   },
                          { value: "female",  label: "Female" },
                          { value: "neutral", label: "Other"  },
                        ] as const).map(({ value, label }) => (
                          <button
                            key={value}
                            onClick={() => setSex(value)}
                            className="flex-1 py-2 text-xs font-semibold transition"
                            style={{
                              backgroundColor: sex === value ? "#2D6A4F" : "rgba(255,255,255,0.04)",
                              color:           sex === value ? "#fff"    : "rgba(255,255,255,0.4)",
                            }}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Height (auto-filled, optional override) */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-white/70">
                        Your Height{" "}
                        <span className="text-white/30 text-xs">(auto-predicted — update if known)</span>
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          placeholder={heightUnit === "cm" ? "e.g. 175" : "e.g. 69"}
                          value={heightInput}
                          onChange={(e) => setHeightInput(e.target.value)}
                          className="flex-1 rounded-xl px-4 py-2.5 text-sm text-white
                                     placeholder:text-white/30 transition outline-none
                                     focus:ring-1 focus:ring-[#F4C430]"
                          style={{
                            backgroundColor: "rgba(255,255,255,0.07)",
                            border:          "1px solid rgba(255,255,255,0.12)",
                          }}
                        />
                        <div className="flex rounded-xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.10)" }}>
                          {(["cm", "inch"] as const).map((unit) => (
                            <button
                              key={unit}
                              onClick={() => setHeightUnit(unit)}
                              className="px-3 py-2 text-xs font-semibold transition"
                              style={{
                                backgroundColor: heightUnit === unit ? "#2D6A4F" : "rgba(255,255,255,0.04)",
                                color:           heightUnit === unit ? "#fff"    : "rgba(255,255,255,0.4)",
                              }}
                            >
                              {unit}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Weight (optional — for BMI correction) */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-white/70">
                        Weight (kg){" "}
                        <span className="text-white/30 text-xs">(optional — improves waist/hip accuracy)</span>
                      </label>
                      <input
                        type="number"
                        placeholder="e.g. 70"
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                        className="w-full rounded-xl px-4 py-2.5 text-sm text-white
                                   placeholder:text-white/30 transition outline-none
                                   focus:ring-1 focus:ring-[#F4C430]"
                        style={{
                          backgroundColor: "rgba(255,255,255,0.07)",
                          border:          "1px solid rgba(255,255,255,0.12)",
                        }}
                      />
                    </div>

                    {/* Submit — Go to dashboard scan */}
                    <button
                      id="measurement-entry-submit"
                      onClick={handleSubmit}
                      disabled={isSubmitting || !age}
                      className="w-full rounded-xl font-semibold py-3.5 text-sm transition-all
                                 flex items-center justify-center gap-2"
                      style={{
                        backgroundColor: !age ? "rgba(255,255,255,0.08)" : "#F4C430",
                        color:           !age ? "rgba(255,255,255,0.3)"  : "#0A0A0A",
                        cursor:          !age ? "not-allowed" : "pointer",
                      }}
                    >
                      {isSubmitting ? "Redirecting..." : "Continue to Scan →"}
                    </button>

                    {/* Quick scan option */}
                    <div className="text-center">
                      <p className="text-white/30 text-xs mb-2">or</p>
                      <button
                        onClick={() => setIsScanMode(true)}
                        className="text-white/50 hover:text-white/80 text-xs underline transition"
                      >
                        Scan directly here (no account needed)
                      </button>
                    </div>
                  </div>
                ) : (
                  <EnhancedMeasurementFlow
                    onComplete={handleScanComplete}
                    onCancel={() => setIsScanMode(false)}
                    initialAge={parseInt(age, 10) || undefined}
                    initialHeightCm={
                      prediction?.predictedCm ??
                      (parseFloat(heightInput) > 0
                        ? heightUnit === "inch"
                          ? Math.round(parseFloat(heightInput) * 2.54 * 10) / 10
                          : parseFloat(heightInput)
                        : undefined)
                    }
                  />
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

