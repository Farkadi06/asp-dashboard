export interface Ingestion {
  id: string;
  bankCode?: string;
  fileName: string;
  status: "pending" | "processing" | "completed" | "failed";
  createdAt: string;
  completedAt?: string;
  fileSize?: number;
  error?: string;
}

export interface IngestionListResponse {
  items: Ingestion[];
  total: number;
}

