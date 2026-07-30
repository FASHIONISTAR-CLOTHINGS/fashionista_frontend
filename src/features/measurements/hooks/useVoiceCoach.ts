"use client";

/**
 * @file useVoiceCoach.ts
 * @description Thin compatibility wrapper around useVoiceGuidance.
 *
 * Provides the alternative API: speak(text) + speakKey(key) + setEnabled(bool).
 * All SpeechSynthesis logic lives in useVoiceGuidance (canonical implementation).
 *
 * Consumers can use either hook — they share the same underlying state.
 */

import { useCallback } from "react";
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
  const voice = useVoiceGuidance();

  const speak = useCallback(
    (text: string) => voice.speakText(text),
    [voice],
  );

  const speakKey = useCallback(
    (key: GuidanceKey) => voice.speak(key),
    [voice],
  );

  return {
    speak,
    speakKey,
    cancel: voice.cancel,
    isSpeaking: voice.isSpeaking,
    isEnabled: voice.isEnabled,
    setEnabled: voice.setEnabled,
    supported: voice.isSupported,
    currentText: voice.currentCaption,
  };
}
