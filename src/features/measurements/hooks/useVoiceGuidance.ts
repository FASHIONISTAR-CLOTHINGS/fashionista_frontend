"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { GUIDANCE_SCRIPT, type GuidanceKey } from "../constants/guidanceScript";

export type { GuidanceKey } from "../constants/guidanceScript";
export { GUIDANCE_SCRIPT } from "../constants/guidanceScript";

export interface UseVoiceGuidanceReturn {
  speak:        (key: GuidanceKey) => void;
  /** Speak arbitrary text (not from the guidance script). Edge-triggered. */
  speakText:    (text: string) => void;
  /** Cancel any in-progress speech. */
  cancel:       () => void;
  isSpeaking:   boolean;
  isSupported:  boolean;
  muted:        boolean;
  toggleMute:   () => void;
  currentCaption: string | null;
  /** Enabled flag (separate from muted — when false, no speech at all). */
  isEnabled:    boolean;
  setEnabled:   (enabled: boolean) => void;
}

export function useVoiceGuidance(): UseVoiceGuidanceReturn {
  const [isSpeaking, setIsSpeaking]   = useState(false);
  const [muted, setMuted]             = useState(false);
  const [isEnabled, setIsEnabled]     = useState(true);
  const [currentCaption, setCaption]  = useState<string | null>(null);
  const lastSpokenRef                 = useRef<GuidanceKey | null>(null);
  const lastTextRef                   = useRef<string | null>(null);
  const synthRef                      = useRef<SpeechSynthesis | null>(null);

  const isSupported = typeof window !== "undefined" && "speechSynthesis" in window;

  useEffect(() => {
    if (!isSupported) return;
    synthRef.current = window.speechSynthesis;

    const handleVoices = () => {
      // Trigger voice loading in Chrome (async)
      synthRef.current?.getVoices();
    };
    synthRef.current.addEventListener?.("voiceschanged", handleVoices);
    // Fallback: load voices after 1s if event never fires
    const timer = setTimeout(handleVoices, 1000);

    return () => {
      clearTimeout(timer);
      synthRef.current?.removeEventListener?.("voiceschanged", handleVoices);
      synthRef.current?.cancel();
    };
  }, [isSupported]);

  const speak = useCallback(
    (key: GuidanceKey) => {
      const text = GUIDANCE_SCRIPT[key];
      setCaption(text);

      // Edge-triggered: don't re-speak the same phrase
      if (lastSpokenRef.current === key) return;
      lastSpokenRef.current = key;

      if (!isEnabled || muted || !isSupported || !synthRef.current) return;

      // Cancel any ongoing speech before starting new
      synthRef.current.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate    = 0.95;
      utterance.pitch   = 1.0;
      utterance.volume  = 0.8;

      utterance.onstart  = () => setIsSpeaking(true);
      utterance.onend    = () => setIsSpeaking(false);
      utterance.onerror  = () => setIsSpeaking(false);

      synthRef.current.speak(utterance);
    },
    [isEnabled, muted, isSupported]
  );

  /** Speak arbitrary text (not from the guidance script). Edge-triggered. */
  const speakText = useCallback(
    (text: string) => {
      setCaption(text);

      if (lastTextRef.current === text) return;
      lastTextRef.current = text;

      if (!isEnabled || muted || !isSupported || !synthRef.current) return;

      synthRef.current.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate    = 0.95;
      utterance.pitch   = 1.0;
      utterance.volume  = 0.8;

      utterance.onstart  = () => setIsSpeaking(true);
      utterance.onend    = () => setIsSpeaking(false);
      utterance.onerror  = () => setIsSpeaking(false);

      synthRef.current.speak(utterance);
    },
    [isEnabled, muted, isSupported]
  );

  /** Cancel any in-progress speech. */
  const cancel = useCallback(() => {
    if (isSupported && synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }
  }, [isSupported]);

  const setEnabledCb = useCallback(
    (enabled: boolean) => {
      setIsEnabled(enabled);
      if (!enabled) {
        cancel();
      }
    },
    [cancel],
  );

  const toggleMute = useCallback(() => {
    setMuted((prev) => {
      if (!prev) {
        synthRef.current?.cancel();
        setIsSpeaking(false);
      }
      return !prev;
    });
  }, []);

  return {
    speak,
    speakText,
    cancel,
    isSpeaking,
    isSupported,
    muted,
    toggleMute,
    currentCaption,
    isEnabled,
    setEnabled: setEnabledCb,
  };
}
