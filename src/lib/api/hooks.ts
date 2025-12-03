/**
 * React Query hooks for ASP Platform API
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getAspClient } from "./asp-client";
import { getApiKeys } from "@/lib/utils/api-keys";
import {
  Ingestion,
  ApiKey,
  CreateApiKeyRequest,
  CreateApiKeyResponse,
  Bank,
  BankConnection,
  CreateBankConnectionRequest,
  Account,
  PaginatedTransactions,
  ListIngestionsParams,
  GetAccountTransactionsParams,
  UUID,
} from "./types";

/**
 * Get the current API key from localStorage
 * This can be overridden by passing an API key directly to hooks
 */
function getCurrentApiKey(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const keys = getApiKeys();
    return keys.length > 0 ? keys[0].raw : null;
  } catch {
    return null;
  }
}

/**
 * Get API client instance with current API key
 */
function getClient() {
  return getAspClient(getCurrentApiKey());
}

// ============================================
// Query Keys
// ============================================

export const queryKeys = {
  ingestions: {
    all: ["ingestions"] as const,
    lists: () => [...queryKeys.ingestions.all, "list"] as const,
    list: (params?: ListIngestionsParams) =>
      [...queryKeys.ingestions.lists(), params] as const,
    details: () => [...queryKeys.ingestions.all, "detail"] as const,
    detail: (id: UUID) => [...queryKeys.ingestions.details(), id] as const,
  },
  accounts: {
    all: ["accounts"] as const,
    lists: () => [...queryKeys.accounts.all, "list"] as const,
    list: (params?: { userRef?: string }) =>
      [...queryKeys.accounts.lists(), params] as const,
    details: () => [...queryKeys.accounts.all, "detail"] as const,
    detail: (id: UUID) => [...queryKeys.accounts.details(), id] as const,
    transactions: (id: UUID, params?: GetAccountTransactionsParams) =>
      [...queryKeys.accounts.detail(id), "transactions", params] as const,
  },
  apiKeys: {
    all: ["apiKeys"] as const,
    lists: () => [...queryKeys.apiKeys.all, "list"] as const,
  },
  banks: {
    all: ["banks"] as const,
    lists: () => [...queryKeys.banks.all, "list"] as const,
  },
  bankConnections: {
    all: ["bankConnections"] as const,
    lists: () => [...queryKeys.bankConnections.all, "list"] as const,
    list: (params?: { userRef?: string }) =>
      [...queryKeys.bankConnections.lists(), params] as const,
    details: () => [...queryKeys.bankConnections.all, "detail"] as const,
    detail: (id: UUID) =>
      [...queryKeys.bankConnections.details(), id] as const,
  },
};

// ============================================
// Ingestion Hooks
// ============================================

/**
 * List all ingestions
 */
export function useIngestions(params?: ListIngestionsParams) {
  return useQuery({
    queryKey: queryKeys.ingestions.list(params),
    queryFn: () => getClient().listIngestions(params),
    enabled: !!getCurrentApiKey(),
  });
}

/**
 * Get a specific ingestion by ID
 */
export function useIngestion(id: UUID | null) {
  return useQuery({
    queryKey: queryKeys.ingestions.detail(id!),
    queryFn: () => getClient().getIngestion(id!),
    enabled: !!id && !!getCurrentApiKey(),
  });
}

/**
 * Create a new ingestion
 */
export function useCreateIngestion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      file,
      bankConnectionId,
    }: {
      file: File;
      bankConnectionId: UUID;
    }) => getClient().createIngestion(file, bankConnectionId),
    onSuccess: () => {
      // Invalidate ingestions list
      queryClient.invalidateQueries({
        queryKey: queryKeys.ingestions.lists(),
      });
    },
  });
}

// ============================================
// Account Hooks
// ============================================

/**
 * List all accounts
 */
export function useAccounts(params?: { userRef?: string }) {
  return useQuery({
    queryKey: queryKeys.accounts.list(params),
    queryFn: () => getClient().listAccounts(params),
    enabled: !!getCurrentApiKey(),
  });
}

/**
 * Get a specific account by ID
 */
export function useAccount(accountId: UUID | null) {
  return useQuery({
    queryKey: queryKeys.accounts.detail(accountId!),
    queryFn: () => getClient().getAccount(accountId!),
    enabled: !!accountId && !!getCurrentApiKey(),
  });
}

/**
 * Get account transactions
 */
export function useAccountTransactions(
  accountId: UUID | null,
  params?: GetAccountTransactionsParams
) {
  return useQuery({
    queryKey: queryKeys.accounts.transactions(accountId!, params),
    queryFn: () => getClient().getAccountTransactions(accountId!, params),
    enabled: !!accountId && !!getCurrentApiKey(),
  });
}

// ============================================
// Transaction Hooks
// ============================================

/**
 * List transactions (via account)
 * This is a convenience hook that uses useAccountTransactions
 */
export function useTransactions(
  accountId: UUID | null,
  params?: GetAccountTransactionsParams
) {
  return useAccountTransactions(accountId, params);
}

// ============================================
// API Key Hooks
// ============================================

/**
 * List all API keys
 */
export function useApiKeys() {
  return useQuery({
    queryKey: queryKeys.apiKeys.lists(),
    queryFn: () => getClient().listApiKeys(),
    enabled: !!getCurrentApiKey(),
  });
}

/**
 * Create a new API key
 */
export function useCreateApiKey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateApiKeyRequest) =>
      getClient().createApiKey(request),
    onSuccess: () => {
      // Invalidate API keys list
      queryClient.invalidateQueries({
        queryKey: queryKeys.apiKeys.lists(),
      });
      // Also invalidate localStorage-based queries
      window.dispatchEvent(new CustomEvent("apiKeysChanged"));
    },
  });
}

/**
 * Delete an API key
 */
export function useDeleteApiKey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: UUID) => getClient().deleteApiKey(id),
    onSuccess: () => {
      // Invalidate API keys list
      queryClient.invalidateQueries({
        queryKey: queryKeys.apiKeys.lists(),
      });
      // Also invalidate localStorage-based queries
      window.dispatchEvent(new CustomEvent("apiKeysChanged"));
    },
  });
}

// ============================================
// Bank Hooks
// ============================================

/**
 * List all supported banks
 */
export function useBanks() {
  return useQuery({
    queryKey: queryKeys.banks.lists(),
    queryFn: () => getClient().listBanks(),
    enabled: !!getCurrentApiKey(),
    staleTime: 1000 * 60 * 60, // Cache for 1 hour (banks don't change often)
  });
}

// ============================================
// Bank Connection Hooks
// ============================================

/**
 * List all bank connections
 */
export function useBankConnections(params?: { userRef?: string }) {
  return useQuery({
    queryKey: queryKeys.bankConnections.list(params),
    queryFn: () => getClient().listBankConnections(params),
    enabled: !!getCurrentApiKey(),
  });
}

/**
 * Get a specific bank connection by ID
 */
export function useBankConnection(connectionId: UUID | null) {
  return useQuery({
    queryKey: queryKeys.bankConnections.detail(connectionId!),
    queryFn: () => getClient().getBankConnection(connectionId!),
    enabled: !!connectionId && !!getCurrentApiKey(),
  });
}

/**
 * Create a bank connection
 */
export function useCreateBankConnection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      bankId,
      request,
    }: {
      bankId: UUID;
      request: CreateBankConnectionRequest;
    }) => getClient().createBankConnection(bankId, request),
    onSuccess: () => {
      // Invalidate bank connections list
      queryClient.invalidateQueries({
        queryKey: queryKeys.bankConnections.lists(),
      });
    },
  });
}

