"use client";

/**
 * @file VoiceCoachDisplay.tsx
 * @description Voice coach visual feedback display.
 *
 * Shows current spoken text as a subtitle bar with animated waveform icon
 * when speaking, plus a mute toggle button.
 */

import { motion, AnimatePresence } from "framer-motion";

export interface VoiceCoachDisplayProps {
  text: string | null;
  isSpeaking: boolean;
  isEnabled: boolean;
  onToggle: () => void;
  className?: string;
}

export function VoiceCoachDisplay({
  text,
  isSpeaking,
  isEnabled,
  onToggle,
  className = "",
}: VoiceCoachDisplayProps) {
  return (
    <div className={`flex items-center justify-between gap-3 ${className}`}>
      {/* Caption + waveform */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        {/* Waveform icon */}
        <div className="flex items-end gap-0.5 h-4 shrink-0">
          {[0, 1, 2, 3].map((i) => (
            <motion.div
              key={i}
              className="w-0.5 rounded-full"
              style={{ backgroundColor: isEnabled ? "#F4C430" : "rgba(255,255,255,0.2)" }}
              animate={
                isSpeaking && isEnabled
                  ? { height: [4, 12, 4] }
                  : { height: 4 }
              }
              transition={{
                duration: 0.5,
                repeat: Infinity,
                delay: i * 0.1,
              }}
            />
          ))}
        </div>

        {/* Caption text */}
        <AnimatePresence mode="wait">
          <motion.p
            key={text ?? "empty"}
            className="text-xs text-white/70 truncate"
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 5 }}
            transition={{ duration: 0.2 }}
          >
            {text ?? (isEnabled ? "Listening..." : "Voice muted")}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* Mute toggle */}
      <button
        onClick={onToggle}
        className="shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition"
        style={{
          backgroundColor: isEnabled ? "rgba(244,196,48,0.15)" : "rgba(255,255,255,0.05)",
          color: isEnabled ? "#F4C430" : "rgba(255,255,255,0.4)",
        }}
      >
        {isEnabled ? "🔊 On" : "🔇 Muted"}
      </button>
    </div>
  );
}
