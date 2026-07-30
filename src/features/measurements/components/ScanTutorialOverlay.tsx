"use client";
/**
 * @file ScanTutorialOverlay.tsx
 * @description Step 40 / TASK-026: First-time user tutorial overlay for the body scan flow.
 *
 * - Shown only on first scan visit (keyed by localStorage 'fashionistar_scan_tutorial_v1')
 * - 4 illustrated slide cards: Phone Setup → Step Back → Spread Arms → Results
 * - "Got it, Start Scan!" CTA dismisses and sets localStorage flag
 * - Framer Motion AnimatePresence for slide + fade transitions
 * - Brand-compliant Forest Green + Golden Yellow design
 * - Skip button for returning users who somehow see it again
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Tutorial Slides ──────────────────────────────────────────────────────────

interface TutorialSlide {
  id:       string;
  emoji:    string;
  title:    string;
  body:     string;
  tip:      string;
  accent:   string;
}

const SLIDES: TutorialSlide[] = [
  {
    id:     "phone-setup",
    emoji:  "📱",
    title:  "Place Your Phone",
    body:   "Lean your phone against a wall or prop it on a stable surface at chest height, about 1.5–2 metres from where you'll stand.",
    tip:    "The camera should face you directly — like it's taking a photo of you.",
    accent: "#2D6A4F",
  },
  {
    id:     "step-back",
    emoji:  "🧍",
    title:  "Step into the Frame",
    body:   "Walk back until your entire body is visible — head to toe. Wear fitted clothing for the most accurate measurements.",
    tip:    "Loose or baggy clothing will reduce accuracy by up to 30%.",
    accent: "#52B788",
  },
  {
    id:     "spread-arms",
    emoji:  "🤸",
    title:  "Strike the Pose",
    body:   "Stand straight and spread your arms slightly — about 15° from your body, like a relaxed letter T. Hold still while the AI captures your pose.",
    tip:    "Our voice coach will count you down. Just hold the position!",
    accent: "#F4C430",
  },
  {
    id:     "results",
    emoji:  "✅",
    title:  "Get Your Measurements",
    body:   "After front and side poses, our AI calculates 14 precise body measurements in about 10 seconds — ready to find your perfect fit.",
    tip:    "Measurements are saved to your profile and used for all future purchases.",
    accent: "#2D6A4F",
  },
];

const STORAGE_KEY = "fashionistar_scan_tutorial_v1";

// ─── Slide Card ───────────────────────────────────────────────────────────────

function SlideCard({ slide }: { slide: TutorialSlide }) {
  return (
    <motion.div
      key={slide.id}
      initial={{ opacity: 0, x: 60 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -60 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center"
    >
      {/* Emoji illustration */}
      <motion.div
        className="w-28 h-28 rounded-3xl flex items-center justify-center mb-6"
        style={{ background: `${slide.accent}20`, border: `2px solid ${slide.accent}30` }}
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.15, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <span className="text-6xl">{slide.emoji}</span>
      </motion.div>

      {/* Title */}
      <motion.h3
        className="text-xl font-black text-white mb-3"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {slide.title}
      </motion.h3>

      {/* Body */}
      <motion.p
        className="text-sm text-white/70 leading-relaxed max-w-xs mb-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        {slide.body}
      </motion.p>

      {/* Tip */}
      <motion.div
        className="rounded-xl px-4 py-2.5 max-w-xs"
        style={{ background: `${slide.accent}15`, border: `1px solid ${slide.accent}25` }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35 }}
      >
        <p className="text-xs font-medium" style={{ color: slide.accent }}>
          💡 {slide.tip}
        </p>
      </motion.div>
    </motion.div>
  );
}

// ─── Dot Progress ─────────────────────────────────────────────────────────────

function DotProgress({ total, current, accent }: {
  total:   number;
  current: number;
  accent:  string;
}) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <motion.div
          key={i}
          className="rounded-full"
          style={{ background: i === current ? accent : "rgba(255,255,255,0.2)" }}
          animate={{ width: i === current ? 20 : 8, height: 8 }}
          transition={{ duration: 0.3 }}
        />
      ))}
    </div>
  );
}

// ─── Main Tutorial Overlay ────────────────────────────────────────────────────

interface ScanTutorialOverlayProps {
  /** If false, overlay won't show (for already-seen users). */
  forceShow?: boolean;
  onComplete: () => void;
}

export function ScanTutorialOverlay({ forceShow = false, onComplete }: ScanTutorialOverlayProps) {
  const [visible, setVisible] = useState(() => {
    if (typeof window === "undefined") return false;
    if (forceShow) return true;
    return localStorage.getItem(STORAGE_KEY) !== "1";
  });
  const [currentSlide, setCurrentSlide] = useState(0);

  const didAutoCompleteRef = useRef(false);

  useEffect(() => {
    if (!visible && !didAutoCompleteRef.current) {
      didAutoCompleteRef.current = true;
      onComplete();
    }
  }, [visible, onComplete]);

  const handleDismiss = useCallback(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, "1");
    }
    setVisible(false);
    onComplete();
  }, [onComplete]);

  const handleNext = useCallback(() => {
    if (currentSlide < SLIDES.length - 1) {
      setCurrentSlide(prev => prev + 1);
    } else {
      handleDismiss();
    }
  }, [currentSlide, handleDismiss]);

  const handlePrev = useCallback(() => {
    setCurrentSlide(prev => Math.max(0, prev - 1));
  }, []);

  const slide  = SLIDES[currentSlide];
  const isLast = currentSlide === SLIDES.length - 1;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(12px)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="w-full max-w-sm rounded-3xl overflow-hidden"
            style={{
              background: "linear-gradient(145deg, #0D1810, #0A0A0A)",
              border: "1px solid rgba(255,255,255,0.08)",
              boxShadow: "0 25px 60px rgba(0,0,0,0.6), 0 0 80px rgba(45,106,79,0.1)",
            }}
            initial={{ scale: 0.85, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.85, opacity: 0, y: 30 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-2">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-[#2D6A4F]">
                  FASHIONISTAR AI Scan
                </span>
                <p className="text-[10px] text-white/30 mt-0.5">Quick guide — 30 seconds</p>
              </div>
              <button
                onClick={handleDismiss}
                className="text-white/30 hover:text-white/60 transition-colors text-sm"
                id="skip-tutorial-btn"
              >
                Skip
              </button>
            </div>

            {/* Slide area */}
            <div className="relative h-80 mx-6">
              <AnimatePresence mode="wait">
                <SlideCard key={slide.id} slide={slide} />
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="px-6 pb-6 flex flex-col items-center gap-4">
              {/* Dot progress */}
              <DotProgress total={SLIDES.length} current={currentSlide} accent={slide.accent} />

              {/* Navigation */}
              <div className="flex items-center gap-3 w-full">
                {currentSlide > 0 && (
                  <button
                    onClick={handlePrev}
                    className="flex-1 py-3 rounded-2xl border border-white/15 text-white/60 text-sm font-semibold hover:bg-white/5 transition-colors"
                  >
                    ← Back
                  </button>
                )}
                <button
                  onClick={handleNext}
                  className="flex-1 py-3 rounded-2xl text-[#0A0A0A] text-sm font-black transition-all active:scale-95"
                  style={{
                    background: isLast
                      ? "linear-gradient(135deg, #F4C430, #C9A227)"
                      : "linear-gradient(135deg, #2D6A4F, #1B4332)",
                    color: "white",
                    boxShadow: isLast ? "0 4px 20px rgba(244,196,48,0.3)" : "none",
                  }}
                  id={isLast ? "start-scan-after-tutorial-btn" : "tutorial-next-btn"}
                >
                  {isLast ? "✅ Got it, Start Scan!" : "Next →"}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
