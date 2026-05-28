"use client";

import { useEffect, useState } from "react";
import { FashionistarImage } from "@/components/media";





const DISMISS_DELAY_MS = 350;
const EXIT_DURATION_MS = 520;

/**
 * First-paint preloader rendered and dismissed fully within React's tree.
 *
 * This avoids imperative DOM removal from the root layout. Deleting a node that
 * React still believes exists can corrupt reconciliation and trigger
 * `insertBefore` / `removeChild` DOMExceptions on later updates.
 */
export function Preloader() {
  const [isHidden, setIsHidden] = useState(false);
  const [isMounted, setIsMounted] = useState(true);

  useEffect(() => {
    let dismissTimeoutId: number | undefined;
    let unmountTimeoutId: number | undefined;
    let fallbackTimeoutId: number | undefined;

    const dismiss = () => {
      dismissTimeoutId = window.setTimeout(() => {
        setIsHidden(true);
        unmountTimeoutId = window.setTimeout(() => {
          setIsMounted(false);
        }, EXIT_DURATION_MS);
      }, DISMISS_DELAY_MS);
    };

    if (document.readyState === "complete") {
      dismiss();
    } else {
      window.addEventListener("load", dismiss, { once: true });
      // Safety fallback to unblock the dashboard after 1200ms maximum
      fallbackTimeoutId = window.setTimeout(dismiss, 1200);
    }

    return () => {
      window.removeEventListener("load", dismiss);
      if (dismissTimeoutId) window.clearTimeout(dismissTimeoutId);
      if (unmountTimeoutId) window.clearTimeout(unmountTimeoutId);
      if (fallbackTimeoutId) window.clearTimeout(fallbackTimeoutId);
    };
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <div
      id="fs-preloader"
      role="status"
      aria-label="Loading Fashionistar AI"
      className={isHidden ? "fs-preloader--hidden" : undefined}
    >
      <div className="fs-preloader-inner">
        <div className="fs-logo-wrap" aria-hidden="true">
          <FashionistarImage
            className="fs-logo-svg"
            src="/preloader/fashionistar-ai-preloader.svg"
            alt="fashionistar ai preloader"
            width={256}
            height={256}
            priority
          />
        </div>

        <p className="fs-brand">
          FASHION<span>ISTAR</span>
        </p>

        <p className="fs-tagline">
          AI Precision • Perfect Fit • Seamless Fashion Commerce
        </p>

        <div className="fs-progress-track" aria-hidden="true">
          <div className="fs-progress-bar" />
        </div>

        <div className="fs-dots" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
      </div>
    </div>
  );
}
