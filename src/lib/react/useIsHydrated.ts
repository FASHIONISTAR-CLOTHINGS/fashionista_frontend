"use client";

import { useSyncExternalStore } from "react";

function subscribe() {
  return () => undefined;
}

// React 19-friendly hydration signal with no effect-driven state reset.
export function useIsHydrated(): boolean {
  return useSyncExternalStore(subscribe, () => true, () => false);
}
