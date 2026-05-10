"use client";

/**
 * @file FashionistarVideo.tsx
 * @description Enterprise Cloudinary video wrapper for the Fashionistar platform.
 *
 * Features:
 *  - Automatic Cloudinary video transformation URL generation
 *  - Poster image from Cloudinary video thumbnail API
 *  - Adaptive bitrate via `q_auto` quality
 *  - Multiple source formats: WebM, MP4 (browser auto-selects best)
 *  - Custom controls UI with play/pause, mute, fullscreen
 *  - Lazy loading via IntersectionObserver
 *  - Accessibility: visible controls, keyboard support
 *  - Graceful fallback placeholder on error or missing publicId
 *
 * Usage:
 *   <FashionistarVideo
 *     publicId="vendors/abc/promo-reel.mp4"
 *     autoPlay={false}
 *     loop
 *     muted
 *   />
 */

import React, { useRef, useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Play, Pause, Volume2, VolumeX, Maximize2, Loader2 } from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// CONFIG
// ─────────────────────────────────────────────────────────────────────────────

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? "";

function buildVideoUrl(publicId: string, format: "mp4" | "webm"): string {
  if (!CLOUD_NAME || !publicId) return "";
  const quality = "q_auto:good";
  const clean = publicId.replace(/\.[^.]+$/, ""); // strip extension
  return `https://res.cloudinary.com/${CLOUD_NAME}/video/upload/${quality}/${clean}.${format}`;
}

function buildPosterUrl(publicId: string): string {
  if (!CLOUD_NAME || !publicId) return "";
  const clean = publicId.replace(/\.[^.]+$/, "");
  return `https://res.cloudinary.com/${CLOUD_NAME}/video/upload/so_0,f_auto,q_auto:eco,w_800/${clean}.jpg`;
}

// ─────────────────────────────────────────────────────────────────────────────
// PLACEHOLDER
// ─────────────────────────────────────────────────────────────────────────────

function VideoPlaceholder({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-xl",
        className,
      )}
      role="img"
      aria-label="Video unavailable"
    >
      <div className="flex flex-col items-center gap-2 opacity-40">
        <div className="w-12 h-12 rounded-full border-2 border-white/20 flex items-center justify-center">
          <Play className="w-5 h-5 text-white ml-0.5" />
        </div>
        <span className="text-white/50 text-xs">Video unavailable</span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PROPS
// ─────────────────────────────────────────────────────────────────────────────

export interface FashionistarVideoProps {
  /** Cloudinary public_id (with or without file extension). */
  publicId?: string | null;
  /** Fallback direct video URL (for non-Cloudinary sources). */
  src?: string | null;
  /** Accessible label for the video. */
  ariaLabel?: string;
  /** CSS aspect ratio e.g. "16/9". Default: "16/9". */
  aspectRatio?: string;
  /** Start muted. Default: true (required for autoplay in most browsers). */
  muted?: boolean;
  /** Auto-play when in viewport. Default: false. */
  autoPlay?: boolean;
  /** Loop playback. Default: false. */
  loop?: boolean;
  /** Show custom controls. Default: true. */
  showControls?: boolean;
  /** Additional container class names. */
  className?: string;
  /** Callback when video playback starts. */
  onPlay?: () => void;
  /** Callback when video ends. */
  onEnded?: () => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export function FashionistarVideo({
  publicId,
  src,
  ariaLabel = "Product video",
  aspectRatio = "16/9",
  muted: initialMuted = true,
  autoPlay = false,
  loop = false,
  showControls = true,
  className,
  onPlay,
  onEnded,
}: FashionistarVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(initialMuted);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [inView, setInView] = useState(false);
  const [progress, setProgress] = useState(0);

  // ── IntersectionObserver: lazy load + auto-play ────────────────────────────
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (autoPlay && videoRef.current) {
            videoRef.current.play().catch(() => {});
          }
        } else {
          if (videoRef.current && !videoRef.current.paused) {
            videoRef.current.pause();
            setIsPlaying(false);
          }
        }
      },
      { threshold: 0.5 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [autoPlay]);

  // ── Controls ───────────────────────────────────────────────────────────────
  const togglePlay = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play();
      setIsPlaying(true);
      onPlay?.();
    } else {
      v.pause();
      setIsPlaying(false);
    }
  }, [onPlay]);

  const toggleMute = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setIsMuted(v.muted);
  }, []);

  const handleFullscreen = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      v.requestFullscreen?.();
    }
  }, []);

  const handleTimeUpdate = useCallback(() => {
    const v = videoRef.current;
    if (!v || !v.duration) return;
    setProgress((v.currentTime / v.duration) * 100);
  }, []);

  const handleProgressClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const v = videoRef.current;
    if (!v) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    v.currentTime = ratio * v.duration;
  }, []);

  // ── Source resolution ──────────────────────────────────────────────────────
  const mp4Src = publicId ? buildVideoUrl(publicId, "mp4") : src ?? "";
  const webmSrc = publicId ? buildVideoUrl(publicId, "webm") : "";
  const posterSrc = publicId ? buildPosterUrl(publicId) : undefined;

  if (hasError || (!publicId && !src)) {
    return <VideoPlaceholder className={cn("w-full min-h-[200px]", className)} />;
  }

  return (
    <div
      ref={containerRef}
      className={cn("relative group rounded-xl overflow-hidden bg-black", className)}
      style={{ aspectRatio }}
    >
      {/* Video element */}
      {inView && (
        <video
          ref={videoRef}
          poster={posterSrc}
          muted={isMuted}
          loop={loop}
          playsInline
          preload="metadata"
          aria-label={ariaLabel}
          onCanPlay={() => setIsLoading(false)}
          onWaiting={() => setIsLoading(true)}
          onPlaying={() => { setIsLoading(false); setIsPlaying(true); }}
          onPause={() => setIsPlaying(false)}
          onTimeUpdate={handleTimeUpdate}
          onEnded={() => { setIsPlaying(false); onEnded?.(); }}
          onError={() => setHasError(true)}
          className="w-full h-full object-cover"
          onClick={togglePlay}
        >
          {webmSrc && <source src={webmSrc} type="video/webm" />}
          {mp4Src && <source src={mp4Src} type="video/mp4" />}
          Your browser does not support HTML5 video.
        </video>
      )}

      {/* Loading spinner overlay */}
      {isLoading && inView && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
          <Loader2 className="w-8 h-8 text-white/60 animate-spin" />
        </div>
      )}

      {/* Big play button (center) when paused */}
      {!isPlaying && !isLoading && inView && (
        <button
          type="button"
          onClick={togglePlay}
          aria-label="Play video"
          className="absolute inset-0 flex items-center justify-center group/play"
        >
          <div className="w-16 h-16 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center transition-all group-hover/play:bg-white/25 group-hover/play:scale-110">
            <Play className="w-6 h-6 text-white ml-1" />
          </div>
        </button>
      )}

      {/* Controls bar (bottom) */}
      {showControls && inView && (
        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {/* Progress bar */}
          <div
            className="relative h-1 bg-white/20 rounded-full mb-3 cursor-pointer"
            onClick={handleProgressClick}
          >
            <div
              className="h-full bg-violet-500 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Buttons row */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={togglePlay}
              aria-label={isPlaying ? "Pause" : "Play"}
              className="text-white/80 hover:text-white transition-colors"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={toggleMute}
              aria-label={isMuted ? "Unmute" : "Mute"}
              className="text-white/80 hover:text-white transition-colors"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            <div className="flex-1" />

            <button
              type="button"
              onClick={handleFullscreen}
              aria-label="Full screen"
              className="text-white/80 hover:text-white transition-colors"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
