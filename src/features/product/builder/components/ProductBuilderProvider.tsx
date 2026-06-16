"use client";

/**
 * @file ProductBuilderProvider.tsx
 * @description Root context and form provider for the 5-step product builder.
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
 *     └─ BuilderStepper                  ← step navigation bar
 *        └─ StepContent                  ← renders active step component
 *           ├─ Step1InfoAndSpecs         ← title, description, condition, gender, age, categories
 *           ├─ Step2PricingAndMeasurements ← pricing, fabric spec, measurement guide
 *           ├─ Step3MediaAndMapping      ← cover image, gallery, color/size mappings
 *           ├─ Step4Shipping             ← weight, shipping cost, preferred courier
 *           └─ Step5FAQAndReview         ← FAQs, SEO, publish settings, review summary
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
  1: ["title", "description", "condition", "category_ids", "sub_category_ids", "gender_target", "age_group"],
  2: [
    "price", "old_price", "is_discounted", "discount_percentage", "discounted_price",
    "currency", "stock_qty", "max_stock", "cash_payment_mode", "is_pre_order", "pre_order_date",
    "requires_measurement", "is_customisable", "measurement_guide",
    "fabric_type", "fabric_care_instructions", "fabric_is_organic", "fabric_is_vegan", "fabric_country_of_origin"
  ],
  3: ["cover_image_public_id", "cover_image_url", "gallery"],
  4: ["weight_kg", "shipping_amount", "courier_id"],
  5: ["faqs", "publish_intent", "featured", "hot_deal", "meta_title", "meta_description"],
};

// ─────────────────────────────────────────────────────────────────────────────
// DEFAULT FORM VALUES
// ─────────────────────────────────────────────────────────────────────────────

const DEFAULT_VALUES: Partial<ProductBuilderFormValues> = {
  title: "",
  description: "",
  condition: "new",
  category_ids: [],
  sub_category_ids: [],
  gender_target: "",
  age_group: "",

  price: "",
  old_price: "",
  is_discounted: false,
  discount_percentage: 0,
  discounted_price: "",
  currency: "NGN",
  stock_qty: 1,
  max_stock: null,
  cash_payment_mode: "payment_before_delivery",
  is_pre_order: false,
  pre_order_date: null,

  requires_measurement: false,
  is_customisable: false,
  measurement_guide: [],
  
  fabric_type: "",
  fabric_care_instructions: "machine_wash",
  fabric_is_organic: false,
  fabric_is_vegan: false,
  fabric_country_of_origin: "",

  cover_image_public_id: "",
  cover_image_url: null,
  gallery: [],

  weight_kg: "",
  shipping_amount: "2500.00",
  courier_id: null,

  faqs: [],
  publish_intent: "draft",
  featured: false,
  hot_deal: false,
  meta_title: "",
  meta_description: "",
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

  const draftKey = useDraftStore((s) => s.draft_key);

  // Load and reconcile draft reactively (handles mount AND resume events)
  useEffect(() => {
    if (initialValues) {
      setDraftLoaded(true);
      return;
    }

    if (!draftKey) {
      const store = useDraftStore.getState();
      const loadedBackup = store.loadBackup();
      if (loadedBackup) {
        // loadBackup updates draft_key, which will trigger this useEffect again.
        return;
      }
      // If still no key, generate new ones
      const newKey = generateUUID();
      const newIdempotency = generateUUID();
      store.setDraftKey(newKey);
      store.setIdempotencyKey(newIdempotency);
      store.setCurrentStep(1);
      store.setPayload({});
      return;
    }

    async function syncAndReconcile(keyToSync: string) {
      const store = useDraftStore.getState();

      // ── 1. IMMEDIATELY load from local storage / sessionStorage state ──
      const localPayload = store.payload || {};
      const localStep = store.current_step || 1;

      // Reset form fields immediately with local values to provide instant UI hydration
      form.reset(sanitizePayload(localPayload));
      setCurrentStep(localStep);
      setDraftLoaded(true);

      // ── 2. Correlate identities and reconcile with backend ──
      try {
        store.setSyncStatus("saving");
        let remote = null;
        try {
          remote = await fetchDraftSessionDetail(keyToSync);
        } catch (e: any) {
          const is404 = e?.status === 404 || e?.response?.status === 404 || String(e).includes("404");
          if (is404) {
            console.warn("Draft key not found on backend (404). Will create new session on backend.");
            remote = null;
          } else {
            throw e;
          }
        }

        if (remote && remote.status === "active") {
          // Reconcile: update local store and form with remote data
          store.setDraftKey(remote.draft_key);
          store.setIdempotencyKey(remote.idempotency_key);
          store.setCurrentStep(remote.current_step ?? 1);
          store.setPayload(remote.payload || {});
          store.setSyncStatus("synced");
          store.setLastSyncedAt(remote.last_synced_at);

          form.reset(sanitizePayload(remote.payload));
          setCurrentStep(remote.current_step ?? 1);
        } else if (remote && remote.status !== "active") {
          // Stale draft: status is committed, expired, discarded etc.
          console.warn(`Draft session ${keyToSync} status is ${remote.status}, not active. Clearing.`);
          const newKey = generateUUID();
          const newIdempotency = generateUUID();
          store.setDraftKey(newKey);
          store.setIdempotencyKey(newIdempotency);
          store.setCurrentStep(1);
          store.setPayload({});
        } else {
          // Does not exist on backend yet (remote is null) -> create draft on backend
          try {
            const created = await createDraftSession({
              draft_key: keyToSync,
              idempotency_key: store.idempotency_key || undefined,
              payload: localPayload,
              current_step: localStep,
            });
            store.setLastSyncedAt(created.last_synced_at);
            store.setSyncStatus("synced");
          } catch (createErr) {
            console.warn("Draft key conflict or creation failure, regenerating key:", createErr);
            const newKey = generateUUID();
            const newIdempotency = generateUUID();
            store.setDraftKey(newKey);
            store.setIdempotencyKey(newIdempotency);
          }
        }
      } catch (err) {
        console.error("Backend draft reconciliation failed, using offline values:", err);
        store.setSyncStatus("failed");
      }
    }

    syncAndReconcile(draftKey);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draftKey, initialValues]);

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
