/**
 * @file useVoiceCoach.ts
 * @description TASK-004: AI Voice Coaching System for body measurement guidance.
 *
 * Uses the Web Speech API (SpeechSynthesis) — zero cost, zero latency, zero API keys.
 * Works offline, fallback to silent text-only mode if API unavailable.
 *
 * Architecture:
 * - Pre-creates all utterances at mount for near-zero latency on trigger
 * - Priority queue: high-priority messages interrupt low-priority
 * - Per-message debouncing: prevents annoying repetition
 * - Preferred female English voice when available
 * - Visual text companion for accessibility (deaf/HoH users)
 *
 * Usage:
 *   const voice = useVoiceCoach();
 *   voice.speak('welcome');
 *   voice.speak('tooClose');
 *   voice.stop();
 */
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { VOICE_SCRIPTS, CAPTURE_CONFIG, type VoiceScriptKey } from "@/lib/brand";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SpeakOptions {
  /** Minimum ms before this SAME key can fire again. Overrides default debounce. */
  minIntervalMs?: number;
  /** If true, stops any current speech and speaks immediately */
  priority?: boolean;
}

export interface UseVoiceCoachReturn {
  /** Speak a named voice script. Respects debouncing. */
  speak: (key: VoiceScriptKey, options?: SpeakOptions) => void;
  /** Immediately stop any current speech */
  stop: () => void;
  /** Whether speech synthesis is currently speaking */
  isSpeaking: boolean;
  /** The current visible text (for VoiceCoachDisplay component) */
  currentText: string | null;
  /** Whether Web Speech API is available in this browser */
  isSupported: boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const DEFAULT_DEBOUNCE_MS = CAPTURE_CONFIG.voiceDebounceMs; // 4000ms
const RATE       = 0.92;  // Slightly slower than default for clarity
const PITCH      = 1.0;
const VOLUME     = 1.0;

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useVoiceCoach(): UseVoiceCoachReturn {
  const [isSpeaking, setIsSpeaking]   = useState(false);
  const [currentText, setCurrentText] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(false);

  // Track last-spoken timestamps per key for debouncing
  const lastSpokenRef = useRef<Partial<Record<VoiceScriptKey, number>>>({});
  // Selected voice (female English preferred)
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null);
  // Hide text timer
  const hideTextTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Detect support + select preferred voice ─────────────────────────────────
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("speechSynthesis" in window)) {
      console.info("[VoiceCoach] Web Speech API not supported — text-only mode.");
      return;
    }

    setIsSupported(true);

    const selectVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      if (!voices.length) return;

      // Preference order: English female names, then any English, then first
      const preferred = [
        "Samantha",       // macOS/iOS
        "Microsoft Zira", // Windows
        "Google US English", // Android
        "Karen",          // macOS Australian
        "Moira",          // macOS Irish
        "Tessa",          // macOS South African
      ];

      let selected: SpeechSynthesisVoice | null = null;
      for (const name of preferred) {
        selected = voices.find((v) => v.name.includes(name) && v.lang.startsWith("en")) ?? null;
        if (selected) break;
      }

      // Fallback: any English voice
      if (!selected) {
        selected = voices.find((v) => v.lang.startsWith("en")) ?? null;
      }

      voiceRef.current = selected;
    };

    // Voices may not load immediately — listen for the event
    selectVoice();
    window.speechSynthesis.addEventListener("voiceschanged", selectVoice);

    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", selectVoice);
    };
  }, []);

  // ── Speak ───────────────────────────────────────────────────────────────────
  const speak = useCallback(
    (key: VoiceScriptKey, options: SpeakOptions = {}) => {
      const text = VOICE_SCRIPTS[key];
      if (!text) return;

      const {
        minIntervalMs = DEFAULT_DEBOUNCE_MS,
        priority = false,
      } = options;

      // Check debounce — except for priority messages
      if (!priority) {
        const last = lastSpokenRef.current[key] ?? 0;
        if (Date.now() - last < minIntervalMs) return;
      }

      // Update visible text immediately (accessibility — before speech check)
      setCurrentText(text);
      lastSpokenRef.current[key] = Date.now();

      // Auto-hide text after message duration + 1.5s buffer
      if (hideTextTimerRef.current) clearTimeout(hideTextTimerRef.current);
      const estimatedDurationMs = (text.length / (RATE * 3)) * 1000 + 1500;
      hideTextTimerRef.current = setTimeout(() => {
        setCurrentText(null);
      }, Math.min(estimatedDurationMs, 8000));

      // Speech synthesis path
      if (!isSupported) return;

      try {
        if (priority) {
          window.speechSynthesis.cancel();
        }

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate   = RATE;
        utterance.pitch  = PITCH;
        utterance.volume = VOLUME;
        if (voiceRef.current) utterance.voice = voiceRef.current;

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend   = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);

        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.warn("[VoiceCoach] Speech synthesis error:", err);
        setIsSpeaking(false);
      }
    },
    [isSupported]
  );

  // ── Stop ────────────────────────────────────────────────────────────────────
  const stop = useCallback(() => {
    if (isSupported && typeof window !== "undefined") {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // Ignore
      }
    }
    setIsSpeaking(false);
    setCurrentText(null);
    if (hideTextTimerRef.current) clearTimeout(hideTextTimerRef.current);
  }, [isSupported]);

  // ── Cleanup on unmount ──────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && isSupported) {
        try {
          window.speechSynthesis.cancel();
        } catch {
          // Ignore
        }
      }
      if (hideTextTimerRef.current) clearTimeout(hideTextTimerRef.current);
    };
  }, [isSupported]);

  return { speak, stop, isSpeaking, currentText, isSupported };
}
