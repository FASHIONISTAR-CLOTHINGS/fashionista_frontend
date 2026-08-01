"use client";

/**
 * EmailCaptureModalLazy.tsx — Client wrapper for lazy-loaded EmailCaptureModal.
 *
 * Next.js 16 disallows `next/dynamic` with `ssr: false` inside Server Components.
 * This thin client wrapper lazy-loads the modal only on the client, keeping it
 * out of the initial JS bundle (~15KB saved).
 */

import dynamic from "next/dynamic";

const EmailCaptureModal = dynamic(
  () => import("@/components/marketing/EmailCaptureModal").then((m) => ({ default: m.EmailCaptureModal })),
  { ssr: false }
);

export function EmailCaptureModalLazy() {
  return <EmailCaptureModal />;
}
