 "use client";

import { useEffect } from "react";

const PRELOADER_ID = "fs-preloader";

export function PreloaderDismiss() {
  useEffect(() => {
    const preloader = document.getElementById(PRELOADER_ID);
    if (!preloader) return;

    let timeoutId: number | undefined;
    let rafId: number | undefined;

    const dismiss = () => {
      rafId = window.requestAnimationFrame(() => {
        preloader.classList.add("fs-preloader--hidden");
        timeoutId = window.setTimeout(() => {
          preloader.remove();
        }, 520);
      });
    };

    // Keep it short: visible enough for branding, never slow enough to irritate users.
    if (document.readyState === "complete") {
      timeoutId = window.setTimeout(dismiss, 450);
    } else {
      window.addEventListener("load", () => window.setTimeout(dismiss, 450), { once: true });
    }

    return () => {
      if (timeoutId) window.clearTimeout(timeoutId);
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, []);

  return null;
}
