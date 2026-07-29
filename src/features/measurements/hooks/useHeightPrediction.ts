/**
 * @file useHeightPrediction.ts
 * @description TanStack Query hook for AI height prediction from age + sex.
 *
 * T-016: Wraps the predictHeight utility in a TanStack Query mutation
 * so the UI can track pending/error states and cache predictions.
 *
 * Tries the backend height prediction endpoint first; falls back to the
 * client-side WHO table if the network request fails.
 */

"use client";

import { useMutation } from "@tanstack/react-query";
import { predictHeightCm } from "../utils/predictHeight";
import { predictHeight as predictHeightApi } from "../api/scan.api";

export interface HeightPredictionInput {
  age: number;
  sex?: "male" | "female" | "neutral";
}

/** Alias for the options type expected by the height prediction hook. */
export type UseHeightPredictionOptions = HeightPredictionInput;

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
      try {
        const result = await predictHeightApi(input.age, input.sex);
        return Math.round(result.predicted_cm);
      } catch {
        // Fallback: client-side WHO table estimate
        const base = predictHeightCm(input.age);
        if (input.sex === "male")   return Math.round(base + 5);
        if (input.sex === "female") return Math.round(base - 5);
        return base;
      }
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
