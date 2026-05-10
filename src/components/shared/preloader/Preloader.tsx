"use client";

import { useEffect } from "react";

const PRELOADER_ID = "fs-preloader";

/**
 * Dismiss the static first-paint preloader after hydration.
 *
 * The preloader shell is rendered in the root layout and styled by
 * `/public/preloader.css`, so this component only coordinates the exit class
 * and cleanup without adding render state or network work.
 */
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

    const scheduleDismiss = () => {
      timeoutId = window.setTimeout(dismiss, 450);
    };

    if (document.readyState === "complete") {
      scheduleDismiss();
    } else {
      window.addEventListener("load", scheduleDismiss, { once: true });
    }

    return () => {
      window.removeEventListener("load", scheduleDismiss);
      if (timeoutId) window.clearTimeout(timeoutId);
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, []);

  return null;
}
