"use client";

/**
 * React Query hooks for Internal API (Session-Based)
 * 
 * These hooks communicate with ASP Core's INTERNAL endpoints
 * using session-based authentication via server actions.
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  listApiKeys,
  createApiKey,
  deleteApiKey,
  type InternalApiKey,
  type InternalCreateApiKeyResponse,
} from "../internal-client";

/**
 * Query key for internal API keys
 */
export const internalApiKeysQueryKey = ["internal-api-keys"] as const;

/**
 * List all API keys for the current tenant (Internal/Session-based)
 * 
 * @returns React Query hook with API keys list
 */
export function useInternalApiKeys() {
  return useQuery({
    queryKey: internalApiKeysQueryKey,
    queryFn: async () => {
      return listApiKeys();
    },
  });
}

/**
 * Create a new API key (Internal/Session-based)
 * 
 * @returns React Query mutation hook
 */
export function useCreateInternalApiKey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      displayName: string;
      scopes?: string[];
      sandbox?: boolean;
    }) => {
      return createApiKey(
        params.displayName,
        params.scopes || ["ingestions:write", "accounts:read"],
        params.sandbox || false
      );
    },
    onSuccess: () => {
      // Invalidate the API keys list to refetch after creation
      queryClient.invalidateQueries({
        queryKey: internalApiKeysQueryKey,
      });
    },
  });
}

/**
 * Delete an API key (Internal/Session-based)
 * 
 * @returns React Query mutation hook
 */
export function useDeleteInternalApiKey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return deleteApiKey(id);
    },
    onSuccess: () => {
      // Invalidate the API keys list to refetch after deletion
      queryClient.invalidateQueries({
        queryKey: internalApiKeysQueryKey,
      });
    },
  });
}

