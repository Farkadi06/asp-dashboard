/**
 * ASP Platform API Type Definitions
 * Based on API_REFERENCE.md
 */

// ============================================
// Core Types
// ============================================

export type UUID = string;

export type IngestionStatus =
  | "PENDING"
  | "PROCESSING"
  | "PARSED"
  | "SAVING"
  | "PROCESSED"
  | "FAILED";

export type IngestionSource = "PDF_UPLOAD" | "API";

export type IngestionType = "PDF";

export type BankConnectionStatus = "CONNECTED" | "PENDING" | "FAILED";

// ============================================
// Ingestion Types
// ============================================

export interface Ingestion {
  id: UUID;
  bankConnectionId: UUID;
  userRef: string;
  status: IngestionStatus;
  source: IngestionSource;
  ingestionType: IngestionType;
  originalFileName: string | null;
  fileSize: number | null;
  storagePath: string | null;
  errorCode: string | null;
  errorMessage: string | null;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  processedAt: string | null; // ISO 8601
}

export interface IngestionPipelineStage {
  id: string;
  name: string;
  status: "pending" | "processing" | "completed" | "failed";
  completedAt: string | null;
  errorMessage: string | null;
}

// ============================================
// Account Types
// ============================================

export interface Account {
  id: UUID;
  accountNumber: string;
  iban: string | null;
  accountType: string;
  currency: string;
  balance: number;
  bankConnectionId: UUID;
  userRef: string;
  updatedAt: string; // ISO 8601
}

export interface AccountSnapshot {
  accountId: UUID;
  balance: number;
  currency: string;
  snapshotDate: string; // ISO 8601 date
  createdAt: string; // ISO 8601
}

// ============================================
// Transaction Types
// ============================================

export interface Transaction {
  id: UUID;
  date: string; // ISO 8601 date
  description: string;
  rawDescription: string;
  amount: number; // Negative for debits, positive for credits
  currency: string;
  category: string | null;
  merchant: string | null;
}

export interface MerchantEnrichment {
  id: UUID;
  merchantName: string;
  normalizedName: string;
  category: string;
  confidence: number;
}

export interface PaginatedTransactions {
  accountId: UUID;
  transactions: Transaction[];
  pagination: PaginationInfo;
}

export interface PaginationInfo {
  limit: number;
  offset: number;
  total: number;
}

// ============================================
// API Key Types
// ============================================

export interface ApiKey {
  id: UUID;
  displayName: string;
  prefix: string;
  scopes: string[];
  sandbox: boolean;
  createdAt: string; // ISO 8601
  lastUsedAt: string | null; // ISO 8601
}

export interface CreateApiKeyRequest {
  tenantId: UUID;
  displayName: string;
  scopes: string[];
  sandbox?: boolean;
}

export interface CreateApiKeyResponse {
  id: UUID;
  prefix: string;
  apiKey: string; // Full key (shown only once)
}

export interface DeleteApiKeyResponse {
  deleted: boolean;
}

// ============================================
// Bank Types
// ============================================

export interface Bank {
  id: UUID;
  name: string;
  slug: string;
  country: string;
  connectionType: string;
  iconUrl: string | null;
}

// ============================================
// Bank Connection Types
// ============================================

export interface BankConnectionNextStep {
  action: string;
  message: string;
}

export interface BankConnection {
  connectionId: UUID;
  bankId: UUID;
  status: BankConnectionStatus;
  userRef: string;
  nextStep: BankConnectionNextStep | null;
  metadata: Record<string, any>;
}

export interface CreateBankConnectionRequest {
  userRef: string;
}

// ============================================
// Error Types
// ============================================

export interface ApiError {
  error: string | ErrorDetail;
}

export interface ErrorDetail {
  code: string;
  message: string;
  details?: Record<string, any>;
}

export class AspApiError extends Error {
  constructor(
    public code: string,
    public message: string,
    public details?: Record<string, any>,
    public statusCode?: number
  ) {
    super(message);
    this.name = "AspApiError";
  }

  static fromResponse(error: ApiError, statusCode?: number): AspApiError {
    if (typeof error.error === "string") {
      return new AspApiError("invalid_api_key", error.error, undefined, statusCode);
    }
    return new AspApiError(
      error.error.code,
      error.error.message,
      error.error.details,
      statusCode
    );
  }
}

// ============================================
// Request/Response Types
// ============================================

export interface PingResponse {
  status: "ok";
  tenantId: UUID | null;
}

// ============================================
// List Response Types
// ============================================

export type ListIngestionsParams = {
  userRef?: string;
  bankConnectionId?: UUID;
};

export type ListAccountsParams = {
  userRef?: string;
};

export type ListBankConnectionsParams = {
  userRef?: string;
};

export type GetAccountTransactionsParams = {
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
  category?: string;
  merchant?: string;
};

