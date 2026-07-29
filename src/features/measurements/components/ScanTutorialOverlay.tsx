"use client";

/**
 * @file ScanTutorialOverlay.tsx
 * @description Full-screen tutorial overlay shown before scan entry modal.
 *
 * 4 slides: Set Up Phone, Wear Fitted Clothing, Good Lighting, Two Poses.
 * Stores tutorialSeen in localStorage to skip on revisit.
 * Forest Green + Golden Yellow brand theme.
 */

import { useState, useCallback, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

const STORAGE_KEY = "fashionistar_tutorial_seen";

const SLIDES = [
  {
    icon: "📱",
    title: "Set Up Your Phone",
    desc: "Prop your phone at chest height, 1.5–2 metres away. Use a stand or lean it against something stable.",
  },
  {
    icon: "👕",
    title: "Wear Fitted Clothing",
    desc: "Baggy clothes distort measurements. Wear fitted tops and bottoms — or tight activewear for best results.",
  },
  {
    icon: "💡",
    title: "Good Lighting + Plain Background",
    desc: "Face a window or bright light. Stand against a plain wall — avoid cluttered backgrounds.",
  },
  {
    icon: "🔄",
    title: "Two Poses",
    desc: "First face the camera (front pose), then turn 90° to your right (side pose). Our AI guides you through each step.",
  },
];

export interface ScanTutorialOverlayProps {
  onComplete: () => void;
  onSkip: () => void;
}

export function ScanTutorialOverlay({ onComplete, onSkip }: ScanTutorialOverlayProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    // Check if tutorial already seen
    try {
      if (localStorage.getItem(STORAGE_KEY) === "true") {
        onComplete();
        return;
      }
    } catch {
      // localStorage unavailable
    }
  }, [onComplete]);

  const handleNext = useCallback(() => {
    if (currentSlide < SLIDES.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      try {
        localStorage.setItem(STORAGE_KEY, "true");
      } catch {
        // ignore
      }
      onComplete();
    }
  }, [currentSlide, onComplete]);

  const handleSkip = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, "true");
    } catch {
      // ignore
    }
    onSkip();
  }, [onSkip]);

  const slide = SLIDES[currentSlide];

  return (
    <AnimatePresence>
      <motion.div
        key="tutorial-backdrop"
        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          key={`tutorial-slide-${currentSlide}`}
          className="relative w-full max-w-md rounded-2xl p-8 flex flex-col items-center text-center"
          style={{
            backgroundColor: "#0F1A14",
            border: "1px solid rgba(45,106,79,0.3)",
          }}
          initial={{ opacity: 0, y: 20, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.97 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          {/* Close / Skip */}
          <button
            onClick={handleSkip}
            className="absolute top-4 right-4 text-white/40 hover:text-white/80 transition text-sm"
          >
            Skip
          </button>

          {/* Slide icon */}
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl mb-6"
            style={{
              backgroundColor: "rgba(244,196,48,0.1)",
              border: "1px solid rgba(244,196,48,0.2)",
            }}
          >
            {slide.icon}
          </div>

          {/* Slide content */}
          <h2 className="text-white font-bold text-xl mb-3">{slide.title}</h2>
          <p className="text-white/60 text-sm leading-relaxed mb-8">{slide.desc}</p>

          {/* Progress dots */}
          <div className="flex gap-2 mb-6">
            {SLIDES.map((_, i) => (
              <div
                key={i}
                className="h-2 rounded-full transition-all duration-300"
                style={{
                  width: i === currentSlide ? 24 : 8,
                  backgroundColor:
                    i === currentSlide
                      ? "#F4C430"
                      : i < currentSlide
                        ? "#52B788"
                        : "rgba(255,255,255,0.2)",
                }}
              />
            ))}
          </div>

          {/* Next button */}
          <button
            onClick={handleNext}
            className="w-full rounded-xl py-3 font-semibold text-sm transition"
            style={{
              backgroundColor: "#F4C430",
              color: "#0A0A0A",
            }}
          >
            {currentSlide < SLIDES.length - 1 ? "Next" : "Got It — Start Scan"}
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
