"use client";

/**
 * SectionErrorBoundary.tsx — Per-section resilient error boundary
 *
 * Wraps individual homepage sections so a render crash in one section
 * (e.g. bad image URL, undefined field access) does NOT blank the entire
 * page. The failed section degrades to a minimal empty state while all
 * other sections continue rendering normally.
 *
 * This mirrors the backend's asyncio.gather(return_exceptions=True) pattern:
 * one failing coroutine does not cancel the other 11.
 */

import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  sectionName: string;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

export class SectionErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error(
      `[SectionErrorBoundary] Section "${this.props.sectionName}" crashed:`,
      error.message
    );
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return null;
    }
    return this.props.children;
  }
}
