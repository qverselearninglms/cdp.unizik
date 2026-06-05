/**
 * Typed helpers for building React Query `useQuery` / `useMutation` options.
 *
 * These wrappers give a single place to add cross-cutting concerns
 * (auth headers, error normalisation, etc.) as the API layer grows.
 */

import type {
    QueryKey,
    UseQueryOptions,
    UseMutationOptions,
} from "@tanstack/react-query";

// ---------------------------------------------------------------------------
// Query options factory
// ---------------------------------------------------------------------------

/**
 * Creates typed options for `useQuery`.
 *
 * TypeScript infers `TData` from the `queryFn` return type, so
 * `useQuery({ ...createApiQueryOptions({ queryFn: myFn }) })` gives you
 * `data: Awaited<ReturnType<typeof myFn>> | undefined` without explicit generics.
 *
 * @example
 * const options = createApiQueryOptions({
 *   queryKey: ['fees'] as const,
 *   queryFn: () => admissionService.fetchFees(),
 * });
 */
export function createApiQueryOptions<
    TData,
    TError = Error,
    TQueryKey extends QueryKey = QueryKey,
>(options: {
    queryKey: TQueryKey;
    queryFn: () => Promise<TData>;
    staleTime?: number;
    enabled?: boolean;
    retry?: number | boolean;
}): UseQueryOptions<TData, TError, TData, TQueryKey> {
    return {
        queryKey: options.queryKey,
        queryFn: options.queryFn,
        ...(options.staleTime !== undefined && { staleTime: options.staleTime }),
        ...(options.enabled !== undefined && { enabled: options.enabled }),
        ...(options.retry !== undefined && { retry: options.retry }),
    };
}

// ---------------------------------------------------------------------------
// Mutation options factory
// ---------------------------------------------------------------------------

/**
 * Creates typed options for `useMutation`.
 *
 * @example
 * const options = createApiMutationOptions<PaymentResponse, void>({
 *   mutationKey: ['payment', 'initiate'],
 *   mutationFn: () => admissionService.initiateApplicationPayment(),
 * });
 */
export function createApiMutationOptions<
    TData = unknown,
    TVariables = void,
    TError = Error,
>(options: {
    mutationKey?: QueryKey;
    mutationFn: (variables: TVariables) => Promise<TData>;
}): UseMutationOptions<TData, TError, TVariables> {
    return {
        ...(options.mutationKey !== undefined && { mutationKey: options.mutationKey }),
        mutationFn: options.mutationFn,
    };
}
