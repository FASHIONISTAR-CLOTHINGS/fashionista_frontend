/**
 * @file app/components/Button.tsx
 * @description Legacy Button stub — superseded by @/components/ui/button (Shadcn).
 * This stub exists to prevent build errors in legacy (auth) pages.
 */

import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost";
}

export default function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}: ButtonProps) {
  const base = "inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-[#01454A] text-white hover:bg-[#01454A]/90",
    secondary: "bg-[#FDA600] text-black hover:bg-[#FDA600]/90",
    ghost: "border border-[#01454A]/20 text-[#01454A] hover:bg-[#01454A]/5",
  };
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}
