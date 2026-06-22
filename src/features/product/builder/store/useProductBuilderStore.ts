// fashionista_frontend/src/features/product/builder/store/useProductBuilderStore.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { ProductBuilderType } from "../schemas/stepper.schemas";

interface ProductBuilderState {
  currentStep: number;
  formData: Partial<ProductBuilderType>;
  setFormData: (step: keyof Omit<ProductBuilderType, "idempotency_token">, data: any) => void;
  setIdempotencyToken: (token: string) => void;
  nextStep: () => void;
  prevStep: () => void;
  setStep: (step: number) => void;
  resetForm: () => void;
}

const initialFormState: Partial<ProductBuilderType> = {
  step1: {
    title: "",
    description: "",
    base_price: 0,
    category_ids: [],
    requires_measurement: false,
  },
  step2: {
    images: [],
    weight_kg: 0.5,
    dimensions: { length: 0, width: 0, height: 0 },
    preferred_couriers: [],
  },
  step3: {
    requires_measurement: false,
    size_chart_template_id: null,
    custom_measurement_keys: [],
  },
  step4: {
    variants: [],
  },
};

export const useProductBuilderStore = create<ProductBuilderState>()(
  persist(
    (set) => ({
      currentStep: 1,
      formData: initialFormState,
      
      setFormData: (step, data) =>
        set((state) => ({
          formData: {
            ...state.formData,
            [step]: { ...state.formData[step], ...data },
          },
        })),
        
      setIdempotencyToken: (token) =>
        set((state) => ({
          formData: { ...state.formData, idempotency_token: token },
        })),
        
      nextStep: () => set((state) => ({ currentStep: Math.min(state.currentStep + 1, 5) })),
      prevStep: () => set((state) => ({ currentStep: Math.max(state.currentStep - 1, 1) })),
      setStep: (step) => set({ currentStep: step }),
      
      resetForm: () =>
        set({
          currentStep: 1,
          formData: {
            ...initialFormState,
            idempotency_token: "", // Reset token for subsequent submissions
          },
        }),
    }),
    {
      name: "fashionistar-garment-draft-v2",
      storage: createJSONStorage(() => sessionStorage), // Safe transactional tab session storage
    }
  )
);
