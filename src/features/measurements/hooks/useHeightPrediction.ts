/**
 * @file useHeightPrediction.ts
 * @description TanStack Query hook for AI height prediction from age + sex.
 *
 * T-016: Wraps the predictHeightCm utility in a TanStack Query mutation
 * so the UI can track pending/error states and cache predictions.
 *
 * The prediction is purely client-side (no network call), but using a
 * mutation hook gives us consistent loading/error UX patterns.
 */

"use client";

import { useMutation } from "@tanstack/react-query";
import { predictHeightCm } from "../utils/predictHeight";

export interface HeightPredictionInput {
  age: number;
  sex?: "male" | "female" | "neutral";
}

export interface UseHeightPredictionReturn {
  predictedHeight: number | null;
  isPending: boolean;
  isError: boolean;
  error: Error | null;
  predict: (input: HeightPredictionInput) => void;
  reset: () => void;
}

export function useHeightPrediction(): UseHeightPredictionReturn {
  const mutation = useMutation({
    mutationFn: async (input: HeightPredictionInput): Promise<number> => {
      // Sex-adjusted prediction: males tend to be ~5cm taller, females ~5cm shorter
      const base = predictHeightCm(input.age);
      if (input.sex === "male")    return Math.round(base + 5);
      if (input.sex === "female")  return Math.round(base - 5);
      return base;
    },
  });

  return {
    predictedHeight: mutation.data ?? null,
    isPending:        mutation.isPending,
    isError:          mutation.isError,
    error:            mutation.error,
    predict:          (input) => mutation.mutate(input),
    reset:            () => mutation.reset(),
  };
}
