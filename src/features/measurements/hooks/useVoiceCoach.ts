"use client";

/**
 * @file useVoiceCoach.ts
 * @description Voice guidance hook wrapping Web Speech API with guidance script integration.
 *
 * This is a thin wrapper around useVoiceGuidance that adds a simpler speak(text) API
 * for arbitrary text, plus an enabled toggle (vs. muted toggle in useVoiceGuidance).
 *
 * Note: useVoiceGuidance already exists and handles the SpeechSynthesis API.
 * This hook provides an alternative interface for components that prefer
 * `speak(text)` + `setEnabled(bool)` over `speak(key)` + `toggleMute()`.
 */

import { useState, useCallback, useRef, useEffect } from "react";
import { useVoiceGuidance, type GuidanceKey } from "./useVoiceGuidance";

export interface UseVoiceCoachReturn {
  speak: (text: string) => void;
  speakKey: (key: GuidanceKey) => void;
  cancel: () => void;
  isSpeaking: boolean;
  isEnabled: boolean;
  setEnabled: (enabled: boolean) => void;
  supported: boolean;
  currentText: string | null;
}

export function useVoiceCoach(): UseVoiceCoachReturn {
  const voiceGuidance = useVoiceGuidance();
  const [isEnabled, setIsEnabled] = useState(true);
  const lastTextRef = useRef<string | null>(null);

  const speak = useCallback(
    (text: string) => {
      if (!isEnabled || !voiceGuidance.isSupported) return;
      if (lastTextRef.current === text) return;
      lastTextRef.current = text;

      const synth = window.speechSynthesis;
      synth.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      utterance.volume = 0.8;
      synth.speak(utterance);
    },
    [isEnabled, voiceGuidance.isSupported],
  );

  const speakKey = useCallback(
    (key: GuidanceKey) => {
      if (!isEnabled) return;
      voiceGuidance.speak(key);
    },
    [isEnabled, voiceGuidance],
  );

  const cancel = useCallback(() => {
    if (voiceGuidance.isSupported) {
      window.speechSynthesis.cancel();
    }
  }, [voiceGuidance.isSupported]);

  const setEnabled = useCallback(
    (enabled: boolean) => {
      setIsEnabled(enabled);
      if (!enabled) {
        cancel();
      }
    },
    [cancel],
  );

  useEffect(() => {
    return () => {
      if (voiceGuidance.isSupported) {
        window.speechSynthesis.cancel();
      }
    };
  }, [voiceGuidance.isSupported]);

  return {
    speak,
    speakKey,
    cancel,
    isSpeaking: voiceGuidance.isSpeaking,
    isEnabled,
    setEnabled,
    supported: voiceGuidance.isSupported,
    currentText: voiceGuidance.currentCaption,
  };
}
