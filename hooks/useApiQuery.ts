/**
 * API Query Hooks
 *
 * Pre-configured React Query hooks for common API patterns.
 */

'use client';

import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
} from '@tanstack/react-query';

import { api, APIClientError } from '@/lib/api/client';

// ============================================================================
// Generic Hooks
// ============================================================================

/**
 * Generic query hook with proper typing
 */
export function useApiQuery<T>(
  queryKey: string[],
  path: string,
  options?: Omit<UseQueryOptions<T, APIClientError>, 'queryKey' | 'queryFn'>
) {
  return useQuery<T, APIClientError>({
    queryKey,
    queryFn: () => api.get<T>(path),
    ...options,
  });
}

/**
 * Generic mutation hook with proper typing
 */
export function useApiMutation<TData, TVariables>(
  path: string,
  options?: {
    method?: 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    invalidateQueries?: string[][];
    onSuccess?: (data: TData) => void;
    onError?: (error: APIClientError) => void;
  }
) {
  const queryClient = useQueryClient();
  const { method = 'POST', invalidateQueries, onSuccess, onError } = options || {};

  return useMutation<TData, APIClientError, TVariables>({
    mutationFn: async (variables: TVariables) => {
      switch (method) {
        case 'POST':
          return api.post<TData>(path, variables);
        case 'PUT':
          return api.put<TData>(path, variables);
        case 'PATCH':
          return api.patch<TData>(path, variables);
        case 'DELETE':
          return api.delete<TData>(path);
      }
    },
    onSuccess: (data) => {
      // Invalidate specified queries on success
      if (invalidateQueries) {
        invalidateQueries.forEach((queryKey) => {
          queryClient.invalidateQueries({ queryKey });
        });
      }
      onSuccess?.(data);
    },
    onError,
  });
}

// ============================================================================
// Pagination Hook
// ============================================================================

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
}

export function usePaginatedQuery<T>(
  queryKey: string[],
  path: string,
  params: PaginationParams = {},
  options?: Omit<
    UseQueryOptions<PaginatedResponse<T>, APIClientError>,
    'queryKey' | 'queryFn'
  >
) {
  const { page = 1, limit = 20, orderBy, orderDirection } = params;
  const offset = (page - 1) * limit;

  const queryParams = new URLSearchParams();
  queryParams.set('limit', String(limit));
  queryParams.set('offset', String(offset));
  if (orderBy) queryParams.set('orderBy', orderBy);
  if (orderDirection) queryParams.set('orderDirection', orderDirection);

  const fullPath = `${path}?${queryParams.toString()}`;

  return useQuery<PaginatedResponse<T>, APIClientError>({
    queryKey: [...queryKey, params],
    queryFn: () => api.get<PaginatedResponse<T>>(fullPath),
    ...options,
  });
}

// ============================================================================
// Optimistic Update Helpers
// ============================================================================

/**
 * Create an optimistic update mutation
 */
export function useOptimisticMutation<TData, TVariables>(
  queryKey: string[],
  path: string,
  options: {
    method?: 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    optimisticUpdate: (
      oldData: TData | undefined,
      variables: TVariables
    ) => TData;
    onSuccess?: (data: TData) => void;
  }
) {
  const queryClient = useQueryClient();
  const { method = 'POST', optimisticUpdate, onSuccess } = options;

  return useMutation<TData, APIClientError, TVariables, { previousData: TData | undefined }>({
    mutationFn: async (variables: TVariables) => {
      switch (method) {
        case 'POST':
          return api.post<TData>(path, variables);
        case 'PUT':
          return api.put<TData>(path, variables);
        case 'PATCH':
          return api.patch<TData>(path, variables);
        case 'DELETE':
          return api.delete<TData>(path);
      }
    },
    onMutate: async (variables) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({ queryKey });

      // Snapshot previous value
      const previousData = queryClient.getQueryData<TData>(queryKey);

      // Optimistically update
      queryClient.setQueryData<TData>(queryKey, (old) =>
        optimisticUpdate(old, variables)
      );

      return { previousData };
    },
    onError: (_err, _variables, context) => {
      // Rollback on error
      if (context?.previousData !== undefined) {
        queryClient.setQueryData(queryKey, context.previousData);
      }
    },
    onSettled: () => {
      // Refetch after mutation
      queryClient.invalidateQueries({ queryKey });
    },
    onSuccess,
  });
}
