"use client";

/**
 * shared/ui/index.tsx
 * FASHIONISTAR Design System — Premium glassmorphism UI components.
 * Button, Card, Modal, Badge, Avatar, Skeleton, Tooltip, Toast, Pagination.
 */

import { ReactNode, ButtonHTMLAttributes, forwardRef, useEffect, useRef } from "react";
import { Slot } from "@radix-ui/react-slot";

// ── Button ───────────────────────────────────────────────────────────────────

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "success";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  children: ReactNode;
  asChild?: boolean;
}

const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
  primary:
    "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white shadow-lg shadow-amber-500/25 border border-amber-400/30",
  secondary:
    "bg-white/10 hover:bg-white/15 text-white border border-white/20 hover:border-white/30 backdrop-blur-sm",
  ghost:
    "bg-transparent hover:bg-white/8 text-slate-300 hover:text-white border border-transparent hover:border-white/15",
  danger:
    "bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/30 hover:border-red-500/50",
  success:
    "bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30",
};

const BUTTON_SIZES: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-xs rounded-lg gap-1.5",
  md: "h-10 px-4 text-sm rounded-xl gap-2",
  lg: "h-12 px-6 text-base rounded-xl gap-2.5",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { variant = "primary", size = "md", isLoading, leftIcon, rightIcon, children, className = "", disabled, asChild = false, ...rest },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        disabled={disabled || isLoading}
        className={`
          inline-flex items-center justify-center font-medium transition-all duration-200
          active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent
          ${BUTTON_VARIANTS[variant]}
          ${BUTTON_SIZES[size]}
          ${className}
        `}
        {...rest}
      >
        {isLoading ? (
          <svg className="animate-spin w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : leftIcon ? (
          <span className="flex-shrink-0">{leftIcon}</span>
        ) : null}
        {children}
        {!isLoading && rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
      </Comp>
    );
  }
);
Button.displayName = "Button";

// ── Card ─────────────────────────────────────────────────────────────────────

interface CardProps {
  children: ReactNode;
  className?: string;
  glass?: boolean;
  hover?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
  id?: string;
}

const CARD_PADDING = { none: "", sm: "p-4", md: "p-5", lg: "p-8" };

export function Card({ children, className = "", glass = true, hover = false, padding = "md", id }: CardProps) {
  return (
    <div
      id={id}
      className={`
        rounded-2xl border
        ${glass ? "bg-white/5 backdrop-blur-sm border-white/10" : "bg-slate-900 border-slate-800"}
        ${hover ? "transition-all duration-300 hover:border-white/25 hover:bg-white/8 hover:shadow-xl hover:shadow-black/30" : ""}
        ${CARD_PADDING[padding]}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

// ── Badge ─────────────────────────────────────────────────────────────────────

type BadgeColor = "default" | "primary" | "success" | "warning" | "danger" | "info" | "violet";
type BadgeSize = "xs" | "sm" | "md";

interface BadgeProps {
  children: ReactNode;
  color?: BadgeColor;
  dot?: boolean;
  className?: string;
  size?: BadgeSize;
}

const BADGE_COLORS: Record<BadgeColor, string> = {
  default: "bg-slate-700/60 text-slate-300 border-slate-600/40",
  primary: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  success: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  warning: "bg-yellow-500/15 text-yellow-300 border-yellow-500/30",
  danger: "bg-red-500/15 text-red-300 border-red-500/30",
  info: "bg-blue-500/15 text-blue-300 border-blue-500/30",
  violet: "bg-violet-500/15 text-violet-300 border-violet-500/30",
};

const BADGE_SIZES: Record<BadgeSize, string> = {
  xs: "text-[10px] px-1.5 py-0 gap-1",
  sm: "text-xs px-2 py-0.5 gap-1",
  md: "text-xs px-2.5 py-0.5 gap-1.5",
};

export function Badge({ children, color = "default", dot = false, className = "", size = "md" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border font-medium ${BADGE_COLORS[color]} ${BADGE_SIZES[size]} ${className}`}
    >
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}

// ── Skeleton ─────────────────────────────────────────────────────────────────

interface SkeletonProps {
  className?: string;
  variant?: "line" | "circle" | "rect";
}

export function Skeleton({ className = "", variant = "line" }: SkeletonProps) {
  const base = "animate-pulse bg-white/8";
  const variantClass =
    variant === "circle" ? "rounded-full" : variant === "rect" ? "rounded-xl" : "rounded-lg";
  return <div className={`${base} ${variantClass} ${className}`} />;
}

// ── LoadingSpinner ────────────────────────────────────────────────────────────

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  color?: string;
  className?: string;
}

const SPINNER_SIZES = { sm: "w-4 h-4", md: "w-6 h-6", lg: "w-10 h-10" };

export function LoadingSpinner({ size = "md", color = "text-amber-400", className = "" }: SpinnerProps) {
  return (
    <svg
      className={`animate-spin ${SPINNER_SIZES[size]} ${color} ${className}`}
      fill="none"
      viewBox="0 0 24 24"
      aria-label="Loading"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

// ── EmptyState ────────────────────────────────────────────────────────────────

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon = "📭", title, description, action, className = "" }: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center text-center py-16 px-6 ${className}`}>
      <div className="text-5xl mb-4 opacity-60">{icon}</div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      {description && <p className="text-sm text-slate-400 max-w-sm mb-6">{description}</p>}
      {action}
    </div>
  );
}

// ── Modal ─────────────────────────────────────────────────────────────────────

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const MODAL_SIZES = { sm: "max-w-sm", md: "max-w-md", lg: "max-w-2xl", xl: "max-w-4xl" };

export function Modal({ isOpen, onClose, title, children, size = "md", className = "" }: ModalProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title ?? "Modal"}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      {/* Panel */}
      <div
        ref={ref}
        className={`relative w-full ${MODAL_SIZES[size]} rounded-2xl bg-slate-900/95 border border-white/15 backdrop-blur-xl shadow-2xl ${className}`}
      >
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
            <h2 className="text-lg font-semibold text-white">{title}</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all"
              aria-label="Close modal"
              id="modal-close-btn"
            >
              ✕
            </button>
          </div>
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

// ── Tooltip ────────────────────────────────────────────────────────────────────

interface TooltipProps {
  content: string;
  children: ReactNode;
  position?: "top" | "bottom" | "left" | "right";
  className?: string;
}

const TOOLTIP_POSITION = {
  top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
  bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
  left: "right-full top-1/2 -translate-y-1/2 mr-2",
  right: "left-full top-1/2 -translate-y-1/2 ml-2",
};

export function Tooltip({ content, children, position = "top", className = "" }: TooltipProps) {
  return (
    <div className={`relative group inline-flex ${className}`}>
      {children}
      <span
        className={`absolute ${TOOLTIP_POSITION[position]} z-50 whitespace-nowrap rounded-lg bg-slate-800 border border-white/15 text-white text-xs px-2.5 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none shadow-xl`}
      >
        {content}
      </span>
    </div>
  );
}

// ── DataTable ─────────────────────────────────────────────────────────────────

interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T) => string;
  isLoading?: boolean;
  emptyState?: ReactNode;
  className?: string;
}

export function DataTable<T>({ columns, data, keyExtractor, isLoading, emptyState, className = "" }: DataTableProps<T>) {
  return (
    <div className={`overflow-x-auto rounded-xl border border-white/10 ${className}`}>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/10 bg-white/3">
            {columns.map((col) => (
              <th key={col.key} className={`px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide ${col.className ?? ""}`}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <tr key={i} className="border-b border-white/5">
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3">
                    <Skeleton className="h-4 w-full" />
                  </td>
                ))}
              </tr>
            ))
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-12 text-center text-slate-500">
                {emptyState ?? "No records found."}
              </td>
            </tr>
          ) : (
            data.map((row) => (
              <tr
                key={keyExtractor(row)}
                className="border-b border-white/5 hover:bg-white/3 transition-colors"
              >
                {columns.map((col) => (
                  <td key={col.key} className={`px-4 py-3 text-slate-300 ${col.className ?? ""}`}>
                    {col.render(row)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

// ── Pagination ────────────────────────────────────────────────────────────────

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({ page, totalPages, onPageChange, className = "" }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
    if (totalPages <= 5) return i + 1;
    if (page <= 3) return i + 1;
    if (page >= totalPages - 2) return totalPages - 4 + i;
    return page - 2 + i;
  });

  return (
    <div className={`flex items-center gap-1 ${className}`} role="navigation" aria-label="Pagination">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        className="w-9 h-9 flex items-center justify-center rounded-lg border border-white/15 text-slate-400 hover:text-white hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        aria-label="Previous page"
      >
        ‹
      </button>
      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-medium transition-all ${
            p === page
              ? "bg-amber-500 text-white shadow-lg shadow-amber-500/30"
              : "border border-white/15 text-slate-400 hover:text-white hover:bg-white/10"
          }`}
          aria-current={p === page ? "page" : undefined}
        >
          {p}
        </button>
      ))}
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        className="w-9 h-9 flex items-center justify-center rounded-lg border border-white/15 text-slate-400 hover:text-white hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        aria-label="Next page"
      >
        ›
      </button>
    </div>
  );
}
