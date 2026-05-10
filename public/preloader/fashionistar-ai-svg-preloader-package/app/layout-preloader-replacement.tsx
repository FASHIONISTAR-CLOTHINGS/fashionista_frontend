/* eslint-disable @next/next/no-img-element */

import { PreloaderDismiss } from "@/components/shared/preloader/Preloader";

/**
 * Example replacement for the old video-based root-layout preloader block.
 *
 * The raw image is intentional for first paint: it is static HTML, preloaded in
 * `<head>`, and does not wait for Next Image hydration.
 */
export function LayoutPreloaderReplacement() {
  return (
    <>
      <div id="fs-preloader" role="status" aria-label="Loading Fashionistar AI">
        <div className="fs-preloader-inner">
          <div className="fs-logo-wrap" aria-hidden="true">
            <img
              className="fs-logo-svg"
              src="/preloader/fashionistar-ai-preloader.svg"
              alt=""
              width="256"
              height="256"
              fetchPriority="high"
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

      <PreloaderDismiss />
    </>
  );
}
