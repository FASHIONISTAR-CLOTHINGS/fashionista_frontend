"use client";
/**
 * @file VoiceCoachDisplay.tsx
 * @description TASK-005: Visual text companion to voice coaching system.
 *
 * Accessibility companion: renders the current voice instruction as readable text.
 * Essential for deaf/HoH users and environments where audio is disabled.
 *
 * Design:
 * - Forest Green pill badge at top of camera viewport
 * - 3 animated dots while speaking
 * - Framer Motion fade+slide enter/exit
 * - Auto-hides via parent (useVoiceCoach handles timing)
 *
 * Usage:
 *   <VoiceCoachDisplay text={voice.currentText} isSpeaking={voice.isSpeaking} />
 */

import { AnimatePresence, motion } from "framer-motion";

// ─── Props ────────────────────────────────────────────────────────────────────

interface VoiceCoachDisplayProps {
  /** The current voice instruction text. Null = hidden. */
  text: string | null;
  /** Whether speech synthesis is currently playing */
  isSpeaking: boolean;
  /** Additional CSS class */
  className?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function VoiceCoachDisplay({
  text,
  isSpeaking,
  className = "",
}: VoiceCoachDisplayProps) {
  return (
    <AnimatePresence>
      {text && (
        <motion.div
          key={text}
          initial={{ opacity: 0, y: -12, scale: 0.95 }}
          animate={{ opacity: 1, y: 0,   scale: 1    }}
          exit={{   opacity: 0, y: -8,   scale: 0.97 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className={`
            absolute top-3 left-3 right-3 z-20
            flex items-center gap-2.5
            bg-[#2D6A4F]/90 backdrop-blur-md
            rounded-xl px-4 py-2.5
            border border-[#52B788]/30
            shadow-lg shadow-black/30
            ${className}
          `}
          role="status"
          aria-live="polite"
          aria-label={`Voice guidance: ${text}`}
        >
          {/* Mic / speaking indicator */}
          <div className="flex-shrink-0 flex items-center gap-0.5" aria-hidden="true">
            {isSpeaking ? (
              // Animated 3-dot equalizer
              [0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="w-0.5 rounded-full bg-[#F4C430]"
                  animate={{ height: ["6px", "14px", "6px"] }}
                  transition={{
                    duration: 0.6,
                    repeat: Infinity,
                    delay: i * 0.15,
                    ease: "easeInOut",
                  }}
                />
              ))
            ) : (
              // Static mic dot when text visible but not speaking (just fading)
              <span className="w-2 h-2 rounded-full bg-[#52B788]" />
            )}
          </div>

          {/* Instruction text */}
          <p className="text-white text-xs font-medium leading-snug flex-1 min-w-0">
            {text}
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
