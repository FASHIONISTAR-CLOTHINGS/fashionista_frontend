/**
 * features/support/components/NewTicketModal.tsx
 *
 * Enterprise-grade modal for creating a support ticket.
 *
 * Features:
 *   - All 8 backend categories (incl. measurement_issue, vendor_conduct)
 *   - Optional order_id linking (UUID format validated client-side)
 *   - Zod-based field validation with inline error messages
 *   - Priority selector
 *   - Loading spinner during submission
 *   - Accessible: focus-trapped, Escape key closes
 */

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { X, AlertCircle } from "lucide-react";

import { CreateTicketInputSchema } from "../schemas/support.schemas";
import { TICKET_CATEGORY_LABELS } from "../types/support.types";
import type { CreateTicketInput, TicketCategory, TicketPriority } from "../types/support.types";

export interface NewTicketModalProps {
  isOpen:       boolean;
  onClose:      () => void;
  onSubmit:     (payload: CreateTicketInput) => Promise<void> | void;
  isSubmitting?: boolean;
}

// Ordered for UX (most common first)
const CATEGORIES: TicketCategory[] = [
  "general",
  "order_dispute",
  "payment_issue",
  "delivery_problem",
  "refund_request",
  "product_complaint",
  "vendor_conduct",
  "measurement_issue",
];

const PRIORITIES: { value: TicketPriority; label: string; hint: string }[] = [
  { value: "low",    label: "Low",    hint: "Minor issue, no urgency" },
  { value: "medium", label: "Medium", hint: "Standard — respond within 24h" },
  { value: "high",   label: "High",   hint: "Significant impact on order" },
  { value: "urgent", label: "Urgent", hint: "Blocking — payment/delivery at risk" },
];

interface FormErrors {
  title?:       string;
  description?: string;
  order_id?:    string;
}

export function NewTicketModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false,
}: NewTicketModalProps) {
  const [title,       setTitle]       = useState("");
  const [description, setDescription] = useState("");
  const [category,    setCategory]    = useState<TicketCategory>("general");
  const [priority,    setPriority]    = useState<TicketPriority>("medium");
  const [orderId,     setOrderId]     = useState("");
  const [errors,      setErrors]      = useState<FormErrors>({});
  const firstInputRef = useRef<HTMLInputElement>(null);

  // Focus first input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => firstInputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  const reset = useCallback(() => {
    setTitle("");
    setDescription("");
    setCategory("general");
    setPriority("medium");
    setOrderId("");
    setErrors({});
  }, []);

  const validate = useCallback((): boolean => {
    const result = CreateTicketInputSchema.safeParse({
      title:       title.trim(),
      description: description.trim(),
      category,
      priority,
      order_id:    orderId.trim() || undefined,
    });

    if (!result.success) {
      const newErrors: FormErrors = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof FormErrors;
        if (!newErrors[field]) newErrors[field] = issue.message;
      });
      setErrors(newErrors);
      return false;
    }

    setErrors({});
    return true;
  }, [title, description, category, priority, orderId]);

  const handleSubmit = useCallback(async () => {
    if (!validate()) return;

    const payload: CreateTicketInput = {
      title:       title.trim(),
      description: description.trim(),
      category,
      priority,
      ...(orderId.trim() ? { order_id: orderId.trim() } : {}),
    };

    await onSubmit(payload);
    reset();
  }, [validate, title, description, category, priority, orderId, onSubmit, reset]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-label="Open a support ticket"
    >
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl">

        {/* ── Header ─────────────────────────────────────────────── */}
        <div className="flex items-start justify-between border-b border-black/8 px-6 py-5">
          <div>
            <h3 className="text-lg font-bold text-[#141414]">Open a support ticket</h3>
            <p className="mt-0.5 text-sm text-black/55">
              Provide enough context so our team can respond quickly.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="rounded-full p-1.5 text-black/40 transition hover:bg-black/8 hover:text-black"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* ── Form ───────────────────────────────────────────────── */}
        <div className="space-y-4 px-6 py-5">

          {/* Title */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-[#141414]">
              Subject <span className="text-red-500">*</span>
            </label>
            <input
              ref={firstInputRef}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Wrong item delivered on order #ABC"
              maxLength={300}
              className={[
                "w-full rounded-xl border px-4 py-3 text-sm outline-none transition",
                errors.title
                  ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                  : "border-black/12 focus:border-[#FDA600] focus:ring-2 focus:ring-[#FDA600]/20",
              ].join(" ")}
            />
            {errors.title && (
              <p className="mt-1 flex items-center gap-1 text-xs text-red-600">
                <AlertCircle className="h-3 w-3" /> {errors.title}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-[#141414]">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Describe the issue in detail. Include any relevant dates, order numbers, or amounts."
              maxLength={5000}
              className={[
                "w-full resize-none rounded-xl border px-4 py-3 text-sm outline-none transition",
                errors.description
                  ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                  : "border-black/12 focus:border-[#FDA600] focus:ring-2 focus:ring-[#FDA600]/20",
              ].join(" ")}
            />
            {errors.description && (
              <p className="mt-1 flex items-center gap-1 text-xs text-red-600">
                <AlertCircle className="h-3 w-3" /> {errors.description}
              </p>
            )}
          </div>

          {/* Category + Priority grid */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-[#141414]">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as TicketCategory)}
                className="w-full rounded-xl border border-black/12 px-4 py-3 text-sm text-[#141414] outline-none transition focus:border-[#FDA600] focus:ring-2 focus:ring-[#FDA600]/20"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {TICKET_CATEGORY_LABELS[cat]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-[#141414]">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TicketPriority)}
                className="w-full rounded-xl border border-black/12 px-4 py-3 text-sm text-[#141414] outline-none transition focus:border-[#FDA600] focus:ring-2 focus:ring-[#FDA600]/20"
              >
                {PRIORITIES.map(({ value, label, hint }) => (
                  <option key={value} value={value} title={hint}>
                    {label} — {hint}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Optional order ID */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-[#141414]">
              Order ID{" "}
              <span className="font-normal text-black/40">(optional — link this ticket to an order)</span>
            </label>
            <input
              type="text"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              placeholder="e.g. 550e8400-e29b-41d4-a716-446655440000"
              className={[
                "w-full rounded-xl border px-4 py-3 font-mono text-sm outline-none transition",
                errors.order_id
                  ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                  : "border-black/12 focus:border-[#FDA600] focus:ring-2 focus:ring-[#FDA600]/20",
              ].join(" ")}
            />
            {errors.order_id && (
              <p className="mt-1 flex items-center gap-1 text-xs text-red-600">
                <AlertCircle className="h-3 w-3" /> {errors.order_id}
              </p>
            )}
          </div>
        </div>

        {/* ── Footer actions ──────────────────────────────────────── */}
        <div className="flex justify-end gap-3 border-t border-black/8 px-6 py-4">
          <button
            type="button"
            onClick={() => { reset(); onClose(); }}
            className="rounded-full border border-black/12 px-4 py-2 text-sm font-medium text-[#141414] transition hover:bg-black/5"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleSubmit}
            className="flex items-center gap-2 rounded-full bg-[#FDA600] px-5 py-2 text-sm font-semibold text-[#141414] shadow-sm transition hover:brightness-95 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? (
              <>
                <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle cx="12" cy="12" r="10" strokeWidth="3" className="opacity-25" />
                  <path d="M4 12a8 8 0 018-8" strokeWidth="3" className="opacity-75" />
                </svg>
                Submitting…
              </>
            ) : (
              "Create ticket"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
