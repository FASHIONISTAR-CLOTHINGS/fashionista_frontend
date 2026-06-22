// fashionista_frontend/src/features/product/builder/components/BuilderErrorBoundary.tsx
"use client";

import { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class BuilderErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Garment Builder Uncaught Exception:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("fashionistar-garment-draft-v2");
      window.location.reload();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="w-full bg-[#F8F5ED]/40 border border-[#ECE6D6] rounded-[32px] p-8 text-center max-w-2xl mx-auto my-12 space-y-6 font-satoshi">
          <div className="p-4 bg-amber-50 text-amber-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-8 h-8" />
          </div>
          
          <div className="space-y-2">
            <h3 className="font-bon_foyage text-2xl text-black md:text-3xl">
              Garment Builder Interrupted
            </h3>
            <p className="text-sm text-[#5A6465] max-w-md mx-auto leading-relaxed">
              An unhandled rendering mismatch or Zod validation discrepancy was isolated in this builder frame. The rest of your dashboard remains safe.
            </p>
          </div>

          {this.state.error && (
            <div className="bg-white/80 border border-[#ECE6D6] rounded-xl p-4 text-left font-mono text-xs text-red-600 overflow-x-auto max-h-40">
              {this.state.error.stack || this.state.error.message}
            </div>
          )}

          <div className="pt-2">
            <button
              onClick={this.handleReset}
              className="py-3 px-8 bg-[#01454A] hover:bg-[#01454A]/90 text-[#F8F5ED] hover:text-[#FDA600] font-bold text-sm rounded-xl shadow-md transition duration-200 inline-flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Reset Draft & Reload Frame
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
