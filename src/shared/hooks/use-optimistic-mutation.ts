/**
 * @module use-optimistic-mutation
 *
 * TanStack Query optimistic update wrapper with automatic rollback.
 *
 * Usage:
 *   const mutation = useOptimisticMutation({
 *     queryKey: ['orders'],
 *     mutationFn: (vars) => orderApi.create(vars),
 *     onOptimisticUpdate: (old, vars) => [...old, { id: 'temp', ...vars }],
 *     onSuccess: (data) => toast.success('Order created!'),
 *   })
 */
"use client";

import {
  useMutation,
  useQueryClient,
  type MutateOptions,
  type MutationFunction,
} from "@tanstack/react-query";
import { useCallback } from "react";

export interface UseOptimisticMutationOptions<TData, TError, TVariables, TContext> {
  /** The TanStack Query key to optimistically update. */
  queryKey: readonly unknown[];
  /** The async function that performs the actual mutation. */
  mutationFn: MutationFunction<TData, TVariables>;
  /**
   * Called with the current cached data and mutation variables.
   * Return the new optimistic data to store immediately.
   */
  onOptimisticUpdate?: (old: TContext | undefined, vars: TVariables) => TContext;
  /** Called after a successful mutation (data already refetched). */
  onSuccess?: (data: TData, vars: TVariables) => void;
  /** Called after mutation failure (rollback already applied). */
  onError?: (error: TError, vars: TVariables) => void;
}

export function useOptimisticMutation<
  TData = unknown,
  TError = Error,
  TVariables = void,
  TContext = unknown,
>({
  queryKey,
  mutationFn,
  onOptimisticUpdate,
  onSuccess,
  onError,
}: UseOptimisticMutationOptions<TData, TError, TVariables, TContext>) {
  const queryClient = useQueryClient();

  const mutation = useMutation<TData, TError, TVariables, { previousData: TContext | undefined }>({
    mutationFn,

    onMutate: async (vars) => {
      // Cancel any in-flight refetches that could overwrite optimistic data
      await queryClient.cancelQueries({ queryKey });

      // Snapshot the current cached value for rollback
      const previousData = queryClient.getQueryData<TContext>(queryKey);

      // Apply the optimistic update if handler provided
      if (onOptimisticUpdate) {
        queryClient.setQueryData<TContext>(queryKey, (old) =>
          onOptimisticUpdate(old, vars)
        );
      }

      return { previousData };
    },

    onError: (err, vars, context) => {
      // Roll back to the pre-mutation snapshot
      if (context?.previousData !== undefined) {
        queryClient.setQueryData(queryKey, context.previousData);
      }
      onError?.(err, vars);
    },

    onSuccess: (data, vars) => {
      // Invalidate so the server truth replaces the optimistic data
      queryClient.invalidateQueries({ queryKey });
      onSuccess?.(data, vars);
    },
  });

  const mutate = useCallback(
    (
      vars: TVariables,
      options?: MutateOptions<
        TData,
        TError,
        TVariables,
        { previousData: TContext | undefined }
      >
    ) => mutation.mutate(vars, options),
    [mutation]
  );

  const mutateAsync = useCallback(
    (
      vars: TVariables,
      options?: MutateOptions<
        TData,
        TError,
        TVariables,
        { previousData: TContext | undefined }
      >
    ) => mutation.mutateAsync(vars, options),
    [mutation]
  );

  return {
    mutate,
    mutateAsync,
    isPending: mutation.isPending,
    isError: mutation.isError,
    isSuccess: mutation.isSuccess,
    error: mutation.error,
    data: mutation.data,
    reset: mutation.reset,
  };
}
