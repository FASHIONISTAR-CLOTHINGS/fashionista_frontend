/**
 * features/analytics/stores/realtime-store.ts
 *
 * Zustand store for buffering WebSocket analytics events.
 * Keeps the latest N events in memory for the real-time feed.
 */

import { create } from "zustand";
import type { AnalyticsWSEvent } from "../types";

const MAX_EVENTS = 50;

interface RealtimeState {
  events: AnalyticsWSEvent[];
  isConnected: boolean;
  lastEventAt: string | null;
  addEvent: (event: AnalyticsWSEvent) => void;
  setConnected: (connected: boolean) => void;
  clearEvents: () => void;
}

export const useRealtimeStore = create<RealtimeState>((set) => ({
  events: [],
  isConnected: false,
  lastEventAt: null,
  addEvent: (event) =>
    set((state) => ({
      events: [event, ...state.events].slice(0, MAX_EVENTS),
      lastEventAt: new Date().toISOString(),
    })),
  setConnected: (connected) => set({ isConnected: connected }),
  clearEvents: () => set({ events: [], lastEventAt: null }),
}));
