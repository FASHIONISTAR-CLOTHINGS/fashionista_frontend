"use client";

/**
 * @file ProductBuilderProvider.tsx
 * @description Root context and form provider for the 8-step product builder.
 *
 * Uses react-hook-form with zodResolver over the composite ProductBuilderFormSchema.
 * All step components consume form state via `useFormContext()` — no prop-drilling.
 *
 * Draft persistence: field changes are cached locally and synced to the
 * backend ProductDraftSession. Commit creates the canonical Product exactly once.
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
import { toast } from "sonner";
import { useDraftStore } from "../store";
import {
  createDraftSession,
  updateDraftSession,
  commitDraftSession,
  fetchDraftSessionDetail,
} from "../../api/product.api";

import {
  ProductBuilderFormSchema,
  ProductBuilderFormValues,
  TOTAL_STEPS,
  builderProgress,
} from "../schemas/builder.schemas";

function generateUUID(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

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
  /** Product UUID/slug populated after final commit or edit-mode save. */
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
  1: ["title", "description", "condition", "category_ids", "sub_category_ids", "tag_ids"],
  2: ["price", "old_price", "currency", "stock_qty", "weight_kg", "requires_measurement", "is_customisable", "shipping_amount", "courier_id"],
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
  title: "",
  description: "",

  price: "",
  old_price: "",
  weight_kg: "",
  shipping_amount: "",
  meta_title: "",
  meta_description: "",
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

function sanitizePayload(payload: any): ProductBuilderFormValues {
  const sanitized = { ...DEFAULT_VALUES } as any;
  if (payload && typeof payload === "object") {
    Object.keys(DEFAULT_VALUES).forEach((key) => {
      const val = payload[key];
      if (val !== undefined && val !== null) {
        sanitized[key] = val;
      }
    });
  }
  return sanitized;
}

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
  // ── Form ──────────────────────────────────────────────────────────────────
  const form = useForm<ProductBuilderFormValues>({
    resolver: zodResolver(ProductBuilderFormSchema),
    defaultValues: sanitizePayload(initialValues),
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

  const saveDraft = useCallback(async () => {
    const store = useDraftStore.getState();
    const key = store.draft_key;
    if (!key || initialValues) return;

    try {
      const values = form.getValues();
      store.setPayload(values);
      store.setCurrentStep(currentStep);
      store.setSyncStatus("saving");

      const updated = await updateDraftSession(key, {
        payload: values,
        current_step: currentStep,
        idempotency_key: store.idempotency_key || undefined,
      });
      store.setLastSyncedAt(updated.last_synced_at);
      store.setSyncStatus("synced");
    } catch (err) {
      console.error("Auto-syncing draft to backend failed:", err);
      store.setSyncStatus("failed");
    }
  }, [form, currentStep, initialValues]);

  const saveDraftStep = useCallback(async (step: number) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const store = useDraftStore.getState();
    const key = store.draft_key;
    if (!key || initialValues) return;

    try {
      const values = form.getValues();
      store.setPayload(values);
      store.setCurrentStep(step);
      store.setSyncStatus("saving");
      const updated = await updateDraftSession(key, {
        payload: values,
        current_step: step,
        idempotency_key: store.idempotency_key || undefined,
      });
      store.setLastSyncedAt(updated.last_synced_at);
      store.setSyncStatus("synced");
    } catch (err) {
      console.error(`Draft step ${step} sync failed:`, err);
      store.setSyncStatus("failed");
    }
  }, [form, initialValues]);

  const clearDraft = useCallback(() => {
    useDraftStore.getState().resetStore();
  }, []);

  // Load draft on mount (skip if initialValues provided = edit mode)
  useEffect(() => {
    if (initialValues) {
      setDraftLoaded(true);
      return;
    }

    async function initDraft() {
      const store = useDraftStore.getState();
      let key = store.draft_key;
      let idempotency = store.idempotency_key;
      let step = store.current_step;
      let payload = store.payload;

      // If no session key exists, check backup
      if (!key) {
        const loadedBackup = store.loadBackup();
        if (loadedBackup) {
          const updatedStore = useDraftStore.getState();
          key = updatedStore.draft_key;
          idempotency = updatedStore.idempotency_key;
          step = updatedStore.current_step;
          payload = updatedStore.payload;
        }
      }

      // If still no key, generate new ones
      if (!key) {
        key = generateUUID();
        idempotency = generateUUID();
        store.setDraftKey(key);
        store.setIdempotencyKey(idempotency);
        store.setCurrentStep(1);
        store.setPayload({});
      }

      // Reconcile/sync with backend
      try {
        store.setSyncStatus("saving");
        let remote = null;
        try {
          remote = await fetchDraftSessionDetail(key);
        } catch (e) {
          // Does not exist on backend yet
        }

        if (remote && remote.status === "active") {
          // Update store with remote values
          store.setDraftKey(remote.draft_key);
          store.setIdempotencyKey(remote.idempotency_key);
          store.setCurrentStep(remote.current_step ?? 1);
          store.setPayload(remote.payload || {});
          store.setSyncStatus("synced");
          store.setLastSyncedAt(remote.last_synced_at);

          // Populate form
          form.reset(sanitizePayload(remote.payload));
          setCurrentStep(remote.current_step ?? 1);
        } else {
          // Create draft session on backend if not exists
          try {
            const created = await createDraftSession({
              draft_key: key,
              idempotency_key: idempotency || undefined,
              payload: payload || {},
              current_step: step,
            });
            store.setLastSyncedAt(created.last_synced_at);
            store.setSyncStatus("synced");
            form.reset(sanitizePayload(payload));
            setCurrentStep(step ?? 1);
          } catch (createErr) {
            console.warn("Draft key conflict or creation failure, regenerating key:", createErr);
            const newKey = generateUUID();
            const newIdempotency = generateUUID();
            store.setDraftKey(newKey);
            store.setIdempotencyKey(newIdempotency);
            const created = await createDraftSession({
              draft_key: newKey,
              idempotency_key: newIdempotency,
              payload: payload || {},
              current_step: step,
            });
            store.setLastSyncedAt(created.last_synced_at);
            store.setSyncStatus("synced");
            form.reset(sanitizePayload(payload));
            setCurrentStep(step ?? 1);
          }
        }
      } catch (err) {
        console.error("Backend draft sync failed, using offline values:", err);
        store.setSyncStatus("failed");
        // Fallback to local store values
        form.reset(sanitizePayload(payload));
        setCurrentStep(step ?? 1);
      } finally {
        setDraftLoaded(true);
      }
    }

    initDraft();
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
  const nextStep = useCallback(async (): Promise<boolean> => {
    const fields = STEP_FIELDS[currentStep] ?? [];
    const valid = await form.trigger(fields);
    if (!valid) return false;
    const nextS = Math.min(currentStep + 1, TOTAL_STEPS);
    setCurrentStep(nextS);
    await saveDraftStep(nextS);
    window.scrollTo({ top: 0, behavior: "smooth" });
    return true;
  }, [currentStep, form, saveDraftStep]);

  const prevStep = useCallback(async () => {
    const prevS = Math.max(currentStep - 1, 1);
    setCurrentStep(prevS);
    await saveDraftStep(prevS);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentStep, saveDraftStep]);

  const goToStep = useCallback(
    async (step: number) => {
      if (step >= 1 && step <= TOTAL_STEPS) {
        setCurrentStep(step);
        await saveDraftStep(step);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    },
    [saveDraftStep],
  );

  // ── Final submit ──────────────────────────────────────────────────────────
  const handleFinalSubmit = form.handleSubmit(async (values) => {
    setIsSubmitting(true);
    try {
      const store = useDraftStore.getState();
      const key = store.draft_key;

      if (key && !initialValues) {
        // 1. Sync final values to backend draft session
        store.setPayload(values);
        store.setSyncStatus("saving");
        await updateDraftSession(key, {
          payload: values,
          current_step: currentStep,
          idempotency_key: store.idempotency_key || undefined,
        });

        // 2. Commit draft session on backend (creates product once).
        const committedProduct = await commitDraftSession(key);

        // 3. Clear draft
        clearDraft();

        // 4. Notify parent for post-commit navigation/cache refresh only.
        await onSubmit(values, committedProduct.slug || committedProduct.id);
      } else {
        await onSubmit(values, productId);
        clearDraft();
      }
    } catch (err) {
      console.error("Failed to commit draft:", err);
      toast.error("Submission failed", {
        description: err instanceof Error ? err.message : "Could not save product.",
      });
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
