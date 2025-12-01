/**
 * Ingestions API client
 * Handles PDF ingestion operations
 */

import { apiClient } from "./api-client";
import { Ingestion, IngestionListResponse } from "@/lib/types/ingestion";

export const ingestionsApi = {
  async getIngestions(): Promise<IngestionListResponse> {
    return apiClient.get<IngestionListResponse>("/ingestions");
  },

  async getIngestion(id: string): Promise<Ingestion> {
    return apiClient.get<Ingestion>(`/ingestions/${id}`);
  },

  async createIngestion(file: File): Promise<Ingestion> {
    const formData = new FormData();
    formData.append("file", file);
    
    // Note: This would need special handling for FormData
    // For now, this is a placeholder structure
    return apiClient.post<Ingestion>("/ingestions", formData);
  },

  async deleteIngestion(id: string): Promise<void> {
    return apiClient.delete<void>(`/ingestions/${id}`);
  },
};

