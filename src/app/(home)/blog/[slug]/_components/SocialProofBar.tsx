"use client";

import { useEffect, useState } from "react";

interface SocialProofBarProps {
  viewCount: number;
  readTime: number;
  publishedDate: string | null;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "";
  try {
    return new Date(dateStr).toLocaleDateString("en-NG", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export function SocialProofBar({ viewCount, readTime, publishedDate }: SocialProofBarProps) {
  const [readingNow, setReadingNow] = useState(() => {
    const base = Math.max(3, Math.floor(viewCount / 100));
    return base + Math.floor(Math.random() * 8);
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setReadingNow((prev) => {
        const delta = Math.floor(Math.random() * 5) - 2;
        return Math.max(1, prev + delta);
      });
    }, 8000);
    return () => clearInterval(interval);
  }, [viewCount]);

  return (
    <div
      className="flex flex-wrap items-center gap-4 rounded-xl border border-border bg-card/60 px-5 py-3 text-sm font-raleway"
      data-testid="social-proof-bar"
    >
      <span className="flex items-center gap-1.5 text-foreground/80">
        <svg className="h-4 w-4 text-[hsl(var(--accent))]" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z M10 18a8 8 0 100-16 8 8 0 000 16zM10 2a8 8 0 100 16 8 8 0 000-16z" />
        </svg>
        <span className="font-semibold">{viewCount.toLocaleString()}</span> reads
      </span>

      <span className="text-border" aria-hidden="true">|</span>

      <span className="flex items-center gap-1.5 text-foreground/80">
        <svg className="h-4 w-4 text-[hsl(var(--accent))]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        {readTime} min read
      </span>

      <span className="text-border" aria-hidden="true">|</span>

      <span className="flex items-center gap-1.5 text-foreground/80">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
        </span>
        <span className="font-semibold text-[hsl(var(--brand-green))]">{readingNow}</span> reading now
      </span>

      {publishedDate && (
        <>
          <span className="text-border" aria-hidden="true">|</span>
          <span className="text-muted-foreground">Published {formatDate(publishedDate)}</span>
        </>
      )}
    </div>
  );
}
