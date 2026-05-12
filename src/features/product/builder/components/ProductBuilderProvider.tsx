"use client";

/**
 * @file ProductBuilderProvider.tsx
 * @description Root context and form provider for the 8-step product builder.
 *
 * Uses react-hook-form with zodResolver over the composite ProductBuilderFormSchema.
 * All step components consume form state via `useFormContext()` — no prop-drilling.
 *
 * Draft persistence: every field change triggers a debounced save to `localStorage`
 * keyed by `product-draft-{vendorId}`. On mount, the draft is restored.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * Architecture:
 *   ProductBuilderProvider (FormProvider)
 *     └─ BuilderStepper        ← step navigation bar
 *        └─ StepContent        ← renders active step component
 *           ├─ Step1BasicInfo
 *           ├─ Step2Pricing
 *           ├─ Step3Gallery
 *           ├─ Step4SizesColors
 *           ├─ Step5Variants
 *           ├─ Step6Specifications
 *           ├─ Step7Faqs
 *           └─ Step8Publish
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useForm, FormProvider, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  ProductBuilderFormSchema,
  ProductBuilderFormValues,
  TOTAL_STEPS,
  builderProgress,
} from "../schemas/builder.schemas";

// ─────────────────────────────────────────────────────────────────────────────
// CONTEXT SHAPE
// ─────────────────────────────────────────────────────────────────────────────

interface BuilderContextValue {
  /** Current active step (1-indexed). */
  currentStep: number;
  /** Navigate to the next step — runs step-scoped validation first. */
  nextStep: () => Promise<boolean>;
  /** Navigate back without validation. */
  prevStep: () => void;
  /** Jump directly to a specific step number. */
  goToStep: (step: number) => void;
  /** 0–100 progress percentage. */
  progress: number;
  /** True when the builder is submitting to the backend. */
  isSubmitting: boolean;
  /** Set submitting state from hook. */
  setIsSubmitting: (v: boolean) => void;
  /** Product UUID populated after first draft-save. */
  productId: string | null;
  /** Set productId after create-draft response. */
  setProductId: (id: string) => void;
  /** Vendor ID used for localStorage draft key. */
  vendorId: string;
  /** Manually trigger a draft save. */
  saveDraft: () => void;
  /** True when a draft has been loaded from localStorage. */
  draftLoaded: boolean;
  /** Clear localStorage draft (called after successful publish). */
  clearDraft: () => void;
  /** The underlying react-hook-form methods. */
  form: UseFormReturn<ProductBuilderFormValues>;
}

const BuilderContext = createContext<BuilderContextValue | null>(null);

export function useBuilderContext(): BuilderContextValue {
  const ctx = useContext(BuilderContext);
  if (!ctx) throw new Error("useBuilderContext must be used within ProductBuilderProvider");
  return ctx;
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP-SCOPED FIELD GROUPS (for per-step validation trigger)
// ─────────────────────────────────────────────────────────────────────────────

import type { Path } from "react-hook-form";

const STEP_FIELDS: Record<number, Array<Path<ProductBuilderFormValues>>> = {
  1: ["title", "description", "short_description", "condition", "category_ids", "sub_category_ids", "tag_ids"],
  2: ["price", "old_price", "currency", "stock_qty", "requires_measurement", "is_customisable", "shipping_amount", "courier_id"],
  3: ["cover_image_public_id", "cover_image_url", "gallery"],
  4: ["size_ids", "color_ids"],
  5: ["variants"],
  6: ["specifications"],
  7: ["faqs"],
  8: ["publish_intent", "featured", "hot_deal", "digital", "meta_title", "meta_description"],
};

// ─────────────────────────────────────────────────────────────────────────────
// DEFAULT FORM VALUES
// ─────────────────────────────────────────────────────────────────────────────

const DEFAULT_VALUES: Partial<ProductBuilderFormValues> = {
  condition: "new",
  currency: "NGN",
  stock_qty: 1,
  requires_measurement: false,
  is_customisable: false,
  featured: false,
  hot_deal: false,
  digital: false,
  publish_intent: "draft",
  category_ids: [],
  sub_category_ids: [],
  tag_ids: [],
  size_ids: [],
  color_ids: [],
  variants: [],
  specifications: [],
  faqs: [],
  gallery: [],
};

// ─────────────────────────────────────────────────────────────────────────────
// PROVIDER COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

interface ProductBuilderProviderProps {
  /** Vendor ID — used to namespace the localStorage draft key. */
  vendorId: string;
  /** Optional initial values (for edit mode). */
  initialValues?: Partial<ProductBuilderFormValues>;
  /** Called with final form values when vendor confirms publish. */
  onSubmit: (values: ProductBuilderFormValues, productId: string | null) => Promise<void>;
  children: React.ReactNode;
}

const DRAFT_DEBOUNCE_MS = 1500;

export function ProductBuilderProvider({
  vendorId,
  initialValues,
  onSubmit,
  children,
}: ProductBuilderProviderProps) {
  const draftKey = `product-draft-${vendorId}`;

  // ── Form ──────────────────────────────────────────────────────────────────
  const form = useForm<ProductBuilderFormValues>({
    resolver: zodResolver(ProductBuilderFormSchema),
    defaultValues: { ...DEFAULT_VALUES, ...initialValues },
    mode: "onTouched",          // Validate on blur — lower cognitive load
    reValidateMode: "onChange", // Re-validate on change after first touch
  });

  // ── State ─────────────────────────────────────────────────────────────────
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [productId, setProductId] = useState<string | null>(null);
  const [draftLoaded, setDraftLoaded] = useState(false);

  // ── Draft persistence ─────────────────────────────────────────────────────
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const saveDraft = useCallback(() => {
    try {
      const values = form.getValues();
      localStorage.setItem(draftKey, JSON.stringify({ values, step: currentStep, productId }));
    } catch {
      // localStorage may be full or unavailable in incognito
    }
  }, [form, draftKey, currentStep, productId]);

  const clearDraft = useCallback(() => {
    localStorage.removeItem(draftKey);
  }, [draftKey]);

  // Load draft on mount (skip if initialValues provided = edit mode)
  useEffect(() => {
    if (initialValues) {
      setDraftLoaded(true);
      return;
    }
    try {
      const raw = localStorage.getItem(draftKey);
      if (raw) {
        const { values, step, productId: savedId } = JSON.parse(raw) as {
          values: Partial<ProductBuilderFormValues>;
          step: number;
          productId: string | null;
        };
        form.reset({ ...DEFAULT_VALUES, ...values });
        setCurrentStep(step ?? 1);
        if (savedId) setProductId(savedId);
      }
    } catch {
      // Corrupt draft — ignore
    }
    setDraftLoaded(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Watch all fields → debounced draft save
  useEffect(() => {
    const sub = form.watch(() => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(saveDraft, DRAFT_DEBOUNCE_MS);
    });
    return () => {
      sub.unsubscribe();
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [form, saveDraft]);

  // ── Navigation ────────────────────────────────────────────────────────────
  /**
   * Validate only current step's fields before advancing.
   * Returns true if navigation succeeded, false if validation failed.
   */
  const nextStep = useCallback(async (): Promise<boolean> => {
    const fields = STEP_FIELDS[currentStep] ?? [];
    const valid = await form.trigger(fields);
    if (!valid) return false;
    setCurrentStep((s) => Math.min(s + 1, TOTAL_STEPS));
    window.scrollTo({ top: 0, behavior: "smooth" });
    return true;
  }, [currentStep, form]);

  const prevStep = useCallback(() => {
    setCurrentStep((s) => Math.max(s - 1, 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const goToStep = useCallback(
    (step: number) => {
      if (step >= 1 && step <= TOTAL_STEPS) {
        setCurrentStep(step);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    },
    [],
  );

  // ── Final submit ──────────────────────────────────────────────────────────
  const handleFinalSubmit = form.handleSubmit(async (values) => {
    setIsSubmitting(true);
    try {
      await onSubmit(values, productId);
      clearDraft();
    } finally {
      setIsSubmitting(false);
    }
  });

  // ── Context value ─────────────────────────────────────────────────────────
  const contextValue: BuilderContextValue = {
    currentStep,
    nextStep,
    prevStep,
    goToStep,
    progress: builderProgress(currentStep),
    isSubmitting,
    setIsSubmitting,
    productId,
    setProductId,
    vendorId,
    saveDraft,
    draftLoaded,
    clearDraft,
    form,
  };

  return (
    <BuilderContext.Provider value={contextValue}>
      <FormProvider {...form}>
        <form onSubmit={handleFinalSubmit} noValidate>
          {children}
        </form>
      </FormProvider>
    </BuilderContext.Provider>
  );
}
