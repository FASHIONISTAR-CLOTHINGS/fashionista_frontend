"use client";

import { AnimatePresence, motion } from "framer-motion";

// ─── Props ────────────────────────────────────────────────────────────────────

interface CountdownOverlayProps {
  /** Current countdown value (3, 2, 1) or null if not counting */
  countdown:   number | null;
  /** True when countdown = 0 and capture is happening */
  isCapturing: boolean;
  /** True when auto-capture is arming (quality good, accumulating frames) */
  isArming:    boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function CountdownOverlay({
  countdown,
  isCapturing,
  isArming,
}: CountdownOverlayProps) {
  const isVisible = countdown !== null || isCapturing;

  return (
    <>
      {/* ── Camera flash effect (white full-screen) ── */}
      <AnimatePresence>
        {isCapturing && (
          <motion.div
            key="flash"
            className="absolute inset-0 z-40 bg-white pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.95, 0] }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          />
        )}
      </AnimatePresence>

      {/* ── Countdown overlay (semi-transparent dark) ── */}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            key="overlay"
            className="absolute inset-0 z-30 flex items-center justify-center
                       bg-black/55 backdrop-blur-[2px] pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Pulsing green ring */}
            <motion.div
              className="absolute rounded-full border-4 border-[#01454A]"
              style={{ width: 120, height: 120 }}
              animate={{
                scale:   [1, 1.12, 1],
                opacity: [0.5, 0.9, 0.5],
              }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />

            {/* Countdown number */}
            <AnimatePresence mode="wait">
              {countdown !== null && !isCapturing && (
                <motion.span
                  key={countdown}
                  className="relative z-10 text-white font-black select-none"
                  style={{ fontSize: "4.5rem", lineHeight: 1, textShadow: "0 2px 20px rgba(0,0,0,0.8)" }}
                  initial={{ scale: 1.6, opacity: 0 }}
                  animate={{ scale: 1,   opacity: 1 }}
                  exit={{   scale: 0.5,  opacity: 0 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                >
                  {countdown}
                </motion.span>
              )}

              {isCapturing && (
                <motion.div
                  key="capturing"
                  className="relative z-10 flex flex-col items-center gap-2"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1,   opacity: 1 }}
                  exit={{   scale: 1.2,  opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* Camera shutter icon */}
                  <svg
                    className="w-12 h-12 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                    />
                    <circle
                      cx="12" cy="13" r="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                    />
                  </svg>
                  <span
                    className="text-white font-bold tracking-[0.2em] text-sm uppercase"
                    style={{ textShadow: "0 2px 12px rgba(0,0,0,0.8)" }}
                  >
                    Capturing!
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Arming indicator (subtle pulse when accumulating frames) ── */}
      <AnimatePresence>
        {isArming && !isVisible && (
          <motion.div
            key="arming"
            className="absolute bottom-16 left-1/2 -translate-x-1/2 z-20
                       px-3 py-1.5 rounded-full
                       bg-[#01454A]/80 backdrop-blur-sm
                       border border-[#1A6B72]/30
                       flex items-center gap-2"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{   opacity: 0, y: 4 }}
          >
            <motion.div
              className="w-1.5 h-1.5 rounded-full bg-[#FDA600]"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 0.8, repeat: Infinity }}
            />
            <span className="text-white/90 text-[10px] font-medium tracking-wide">
              Hold still...
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
