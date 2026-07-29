"use client";

/**
 * @file CountdownOverlay.tsx
 * @description 3-2-1 countdown overlay for auto-capture.
 *
 * Full-screen semi-transparent overlay with large animated number.
 * Calls onComplete when countdown finishes.
 */

import { useEffect, useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";

export interface CountdownOverlayProps {
  /** Start the countdown when true. */
  active: boolean;
  /** Called when countdown reaches 0. */
  onComplete: () => void;
  /** Called when user cancels. */
  onCancel?: () => void;
}

export function CountdownOverlay({ active, onComplete, onCancel }: CountdownOverlayProps) {
  const [count, setCount] = useState(3);

  const handleComplete = useCallback(() => {
    onComplete();
  }, [onComplete]);

  useEffect(() => {
    if (!active) {
      setCount(3);
      return;
    }

    if (count <= 0) {
      handleComplete();
      return;
    }

    const timer = setTimeout(() => {
      setCount((c) => c - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [active, count, handleComplete]);

  if (!active) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="countdown-overlay"
        className="absolute inset-0 z-30 flex flex-col items-center justify-center"
        style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Cancel button */}
        {onCancel && (
          <button
            onClick={onCancel}
            className="absolute top-4 right-4 text-white/60 hover:text-white text-sm transition"
          >
            Cancel
          </button>
        )}

        {/* Countdown ring */}
        <div className="relative w-32 h-32 flex items-center justify-center">
          <motion.div
            className="absolute inset-0 rounded-full border-4"
            style={{ borderColor: "rgba(244,196,48,0.2)" }}
          />
          <motion.div
            className="absolute inset-0 rounded-full border-4 border-t-[#F4C430]"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />

          {/* Number */}
          <AnimatePresence mode="popLayout">
            <motion.div
              key={count}
              className="text-6xl font-bold text-white"
              initial={{ scale: 1.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {count > 0 ? count : "✓"}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Subtitle */}
        <p className="text-white/70 text-sm mt-6">Hold still...</p>
      </motion.div>
    </AnimatePresence>
  );
}
