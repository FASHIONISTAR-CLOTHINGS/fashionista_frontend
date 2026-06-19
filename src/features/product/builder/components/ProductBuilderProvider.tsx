"use client";

/**
 * @file ProductBuilderProvider.tsx
 * @description Root context and form provider for the 5-step product builder.
 *
 * Draft persistence is browser-only. The active session is kept in
 * sessionStorage through Zustand persist, and a localStorage snapshot is written
 * for browser-close recovery. No draft payload is synced to the backend.
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { FormProvider, useForm, UseFormReturn } from "react-hook-form";
import type { Path } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useDraftStore } from "../store";
import { createProduct } from "../../api/product.api";
import { buildProductWritePayload } from "../utils/product-builder-payload";
import {
  builderProgress,
  ProductBuilderFormSchema,
  ProductBuilderFormValues,
  Step1Schema,
  Step2Schema,
  Step3Schema,
  Step4Schema,
  Step5Schema,
  TOTAL_STEPS,
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

interface BuilderContextValue {
  currentStep: number;
  nextStep: () => Promise<boolean>;
  prevStep: () => void;
  goToStep: (step: number) => void;
  progress: number;
  isSubmitting: boolean;
  setIsSubmitting: (v: boolean) => void;
  productId: string | null;
  setProductId: (id: string) => void;
  vendorId: string;
  saveDraft: () => void;
  draftLoaded: boolean;
  clearDraft: () => void;
  form: UseFormReturn<ProductBuilderFormValues>;
  isEditMode: boolean;
}

const BuilderContext = createContext<BuilderContextValue | null>(null);

export function useBuilderContext(): BuilderContextValue {
  const ctx = useContext(BuilderContext);
  if (!ctx) throw new Error("useBuilderContext must be used within ProductBuilderProvider");
  return ctx;
}

const STEP_FIELDS: Record<number, Array<Path<ProductBuilderFormValues>>> = {
  1: ["title", "description", "condition", "category_ids", "gender_target", "age_group"],
  2: [
    "cover_image_public_id",
    "cover_image_url",
    "gallery",
  ],
  3: [
    "price", "old_price", "is_discounted", "discount_percentage", "discounted_price",
    "currency", "stock_qty", "cash_payment_mode", "is_pre_order", "pre_order_date",
    "cover_image_size_id", "gallery",
    "requires_measurement", "is_customisable",
    "fabric_type", "fabric_care_instructions", "fabric_is_organic", "fabric_is_vegan", "fabric_country_of_origin",
  ],
  4: [
    "weight_kg",
    "length_cm",
    "width_cm",
    "height_cm",
    "is_fragile",
    "requires_signature",
    "processing_days",
    "courier_id",
  ],
  5: ["faqs", "publish_intent", "featured", "hot_deal"],
};

const STEP_SCHEMAS = {
  1: Step1Schema,
  2: Step2Schema,
  3: Step3Schema,
  4: Step4Schema,
  5: Step5Schema,
} as const;

const DEFAULT_VALUES: Partial<ProductBuilderFormValues> = {
  title: "",
  description: "",
  condition: "new",
  category_ids: [],
  gender_target: "men",
  age_group: "adult",

  price: "",
  old_price: "",
  is_discounted: false,
  discount_percentage: 0,
  discounted_price: "",
  currency: "NGN",
  stock_qty: 1,
  cash_payment_mode: "disabled",
  is_pre_order: false,
  pre_order_date: null,
  cover_image_size_id: null,

  requires_measurement: false,
  is_customisable: false,
  fabric_type: "",
  fabric_care_instructions: "machine_wash",
  fabric_is_organic: false,
  fabric_is_vegan: false,
  fabric_country_of_origin: "",

  cover_image_public_id: "",
  cover_image_url: null,
  gallery: [],

  weight_kg: "",
  length_cm: 0,
  width_cm: 0,
  height_cm: 0,
  dimensions_cm: null,
  is_fragile: false,
  requires_signature: false,
  processing_days: 1,
  courier_id: null,

  faqs: [],
  publish_intent: "draft",
  featured: false,
  hot_deal: false,
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

interface ProductBuilderProviderProps {
  vendorId: string;
  initialValues?: Partial<ProductBuilderFormValues>;
  onSubmit: (values: ProductBuilderFormValues, productId: string | null) => Promise<void>;
  children: React.ReactNode;
}

const LOCAL_SAVE_DEBOUNCE_MS = 800;

export function ProductBuilderProvider({
  vendorId,
  initialValues,
  onSubmit,
  children,
}: ProductBuilderProviderProps) {
  const isEditMode = Boolean(initialValues);
  const form = useForm<ProductBuilderFormValues>({
    resolver: zodResolver(ProductBuilderFormSchema),
    defaultValues: sanitizePayload(initialValues),
    mode: "onTouched",
    reValidateMode: "onChange",
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [productId, setProductId] = useState<string | null>(null);
  const [draftLoaded, setDraftLoaded] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const localDraftKey = useDraftStore((s) => s.localDraftKey);

  const saveDraft = useCallback(() => {
    if (isEditMode) return;
    const store = useDraftStore.getState();

    try {
      store.setSaveStatus("saving");
      store.setPayload(form.getValues());
      store.setCurrentStep(currentStep);
      store.saveSnapshot();
    } catch (error) {
      console.error("Local product builder save failed:", error);
      store.setSaveStatus("failed");
    }
  }, [currentStep, form, isEditMode]);

  const saveDraftStep = useCallback((step: number) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (isEditMode) return;

    const store = useDraftStore.getState();
    try {
      store.setSaveStatus("saving");
      store.setPayload(form.getValues());
      store.setCurrentStep(step);
      store.saveSnapshot();
    } catch (error) {
      console.error(`Local product builder step ${step} save failed:`, error);
      store.setSaveStatus("failed");
    }
  }, [form, isEditMode]);

  const clearDraft = useCallback(() => {
    useDraftStore.getState().resetStore();
  }, []);

  useEffect(() => {
    const store = useDraftStore.getState();

    if (isEditMode) {
      setDraftLoaded(true);
      return;
    }

    if (!localDraftKey) {
      const restored = store.loadSnapshot();
      if (restored) return;

      store.setLocalDraftKey(generateUUID());
      store.setIdempotencyKey(generateUUID());
      store.setCurrentStep(1);
      store.setPayload({});
      setDraftLoaded(true);
      return;
    }

    form.reset(sanitizePayload(store.payload));
    setCurrentStep(store.currentStep || 1);
    setDraftLoaded(true);
  }, [form, isEditMode, localDraftKey]);

  useEffect(() => {
    const sub = form.watch(() => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(saveDraft, LOCAL_SAVE_DEBOUNCE_MS);
    });

    return () => {
      sub.unsubscribe();
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [form, saveDraft]);

  const nextStep = useCallback(async (): Promise<boolean> => {
    const fields = STEP_FIELDS[currentStep] ?? [];
    const stepSchema = STEP_SCHEMAS[currentStep as keyof typeof STEP_SCHEMAS];

    const result = stepSchema.safeParse(form.getValues());
    form.clearErrors(fields);
    if (!result.success) {
      result.error.issues.forEach((issue) => {
        const fieldPath = issue.path.join(".") as Path<ProductBuilderFormValues>;
        if (fieldPath) {
          form.setError(fieldPath, {
            type: "manual",
            message: issue.message,
          });
        }
      });
      return false;
    }

    const nextS = Math.min(currentStep + 1, TOTAL_STEPS);
    setCurrentStep(nextS);
    saveDraftStep(nextS);
    window.scrollTo({ top: 0, behavior: "smooth" });
    return true;
  }, [currentStep, form, saveDraftStep]);

  const prevStep = useCallback(() => {
    const prevS = Math.max(currentStep - 1, 1);
    setCurrentStep(prevS);
    saveDraftStep(prevS);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentStep, saveDraftStep]);

  const goToStep = useCallback(
    (step: number) => {
      if (step >= 1 && step <= TOTAL_STEPS) {
        setCurrentStep(step);
        saveDraftStep(step);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    },
    [saveDraftStep],
  );

  const handleFinalSubmit = form.handleSubmit(async (values) => {
    setIsSubmitting(true);
    const store = useDraftStore.getState();
    const publishIntent = values.publish_intent ?? "draft";

    try {
      if (isEditMode) {
        await onSubmit(values, productId);
        return;
      }

      if (publishIntent === "draft") {
        saveDraft();
        toast.success("Draft saved locally", {
          description: "This product draft is stored in this browser only.",
        });
        return;
      }

      if (publishIntent === "pending") {
        const productPayload = buildProductWritePayload(values, store.idempotencyKey);
        const createdProduct = await createProduct(productPayload);

        clearDraft();
        await onSubmit(values, createdProduct.slug || createdProduct.id);
        return;
      }

      saveDraft();
      toast.warning("Unknown publish action - saved locally.");
    } catch (err: any) {
      console.error("Failed to submit product:", err);
      let errMessage = "Could not save product. Please review your form and try again.";
      const responseData = err?.response?.data || err?.data;
      if (responseData?.errors && typeof responseData.errors === "object") {
        const labels: Record<string, string> = {
          stock_qty: "Stock quantity",
          price: "New price",
          old_price: "Old price",
          category_ids: "Product category",
          pre_order_date: "Pre-order availability date",
          cover_image_public_id: "Cover image",
          weight_kg: "Shipping weight",
        };
        const fieldErrors = Object.entries(responseData.errors)
          .map(([field, msgs]) => `${labels[field] ?? field}: ${Array.isArray(msgs) ? msgs.join(", ") : msgs}`)
          .slice(0, 3)
          .join(" | ");
        errMessage = fieldErrors || errMessage;
      } else if (responseData?.message) {
        errMessage = responseData.message;
      } else if (err instanceof Error) {
        errMessage = err.message;
      }
      toast.error("Submission failed", { description: errMessage });
    } finally {
      setIsSubmitting(false);
    }
  });

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
    isEditMode,
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
