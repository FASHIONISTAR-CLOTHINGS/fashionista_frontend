"use client";
/**
 * @file _client.tsx
 * @description Client boundary for /get-measured page.
 *
 * InHouseMeasurementFlow uses browser APIs (getUserMedia, requestAnimationFrame,
 * WebAssembly/MediaPipe) — it MUST run in a Client Component.
 *
 * This thin wrapper creates the client boundary so the parent page.tsx can
 * remain a Server Component (for SSR / metadata).
 */

import { useRouter } from "next/navigation";
import { useCallback }  from "react";
import { InHouseMeasurementFlow } from "@/features/measurements/components/InHouseMeasurementFlow";

export function GetMeasuredClient() {
  const router = useRouter();

  /**
   * After scan completes:
   * - If user is logged in and we have a profile ID → redirect to their profile
   * - Otherwise → show success inline (InHouseMeasurementFlow handles this)
   */
  const handleComplete = useCallback(
    (profileId: string | number | null) => {
      if (profileId) {
        // Attempt to navigate to the authenticated profile view
        router.push(`/client/dashboard/measurements/${profileId}`);
      }
      // If profileId is null, InHouseMeasurementFlow shows its own success state
    },
    [router]
  );

  return (
    <InHouseMeasurementFlow
      onComplete={handleComplete}
      // No onCancel on the public page — user can just navigate away
    />
  );
}
