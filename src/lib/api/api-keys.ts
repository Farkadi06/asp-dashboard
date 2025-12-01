/**
 * API Keys API client
 * Handles API key management operations
 */

import { apiClient } from "./api-client";
import {
  ApiKey,
  CreateApiKeyRequest,
  CreateApiKeyResponse,
} from "@/lib/types/api-key";

export const apiKeysApi = {
  async getApiKeys(): Promise<ApiKey[]> {
    return apiClient.get<ApiKey[]>("/api-keys");
  },

  async getApiKey(id: string): Promise<ApiKey> {
    return apiClient.get<ApiKey>(`/api-keys/${id}`);
  },

  async createApiKey(data: CreateApiKeyRequest): Promise<CreateApiKeyResponse> {
    return apiClient.post<CreateApiKeyResponse>("/api-keys", data);
  },

  async deleteApiKey(id: string): Promise<void> {
    return apiClient.delete<void>(`/api-keys/${id}`);
  },

  async updateApiKey(
    id: string,
    data: Partial<ApiKey>
  ): Promise<ApiKey> {
    return apiClient.put<ApiKey>(`/api-keys/${id}`, data);
  },
};

