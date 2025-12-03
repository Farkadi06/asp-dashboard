/**
 * ASP Platform API Client
 * Typed client for all API endpoints
 */

import {
  Ingestion,
  ApiKey,
  CreateApiKeyRequest,
  CreateApiKeyResponse,
  DeleteApiKeyResponse,
  Bank,
  BankConnection,
  CreateBankConnectionRequest,
  Account,
  AccountSnapshot,
  PaginatedTransactions,
  PingResponse,
  AspApiError,
  ListIngestionsParams,
  ListAccountsParams,
  ListBankConnectionsParams,
  GetAccountTransactionsParams,
  UUID,
} from "./types";

export interface AspClientConfig {
  baseUrl: string;
  apiKey: string | null;
}

export class AspApiClient {
  private config: AspClientConfig;

  constructor(config: AspClientConfig) {
    this.config = config;
  }

  /**
   * Update API key
   */
  setApiKey(apiKey: string | null) {
    this.config.apiKey = apiKey;
  }

  /**
   * Update base URL
   */
  setBaseUrl(baseUrl: string) {
    this.config.baseUrl = baseUrl;
  }

  /**
   * Internal request method with error handling
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.config.baseUrl}${endpoint}`;
    const headers: Record<string, string> = {};

    // Copy existing headers
    if (options.headers) {
      if (options.headers instanceof Headers) {
        options.headers.forEach((value, key) => {
          headers[key] = value;
        });
      } else if (Array.isArray(options.headers)) {
        options.headers.forEach(([key, value]) => {
          headers[key] = value;
        });
      } else {
        Object.assign(headers, options.headers);
      }
    }

    // Add API key if available
    if (this.config.apiKey) {
      headers["X-Api-Key"] = this.config.apiKey;
    }

    // Only set Content-Type for JSON, let browser set it for FormData
    if (!(options.body instanceof FormData)) {
      headers["Content-Type"] = "application/json";
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Handle empty responses (e.g., 204 No Content)
    if (response.status === 204 || response.status === 201) {
      const text = await response.text();
      if (!text) {
        return {} as T;
      }
      try {
        return JSON.parse(text) as T;
      } catch {
        return {} as T;
      }
    }

    // Parse JSON response
    let data: any;
    try {
      data = await response.json();
    } catch (e) {
      throw new AspApiError(
        "PARSE_ERROR",
        "Failed to parse response",
        undefined,
        response.status
      );
    }

    // Handle errors
    if (!response.ok) {
      throw AspApiError.fromResponse(data, response.status);
    }

    return data as T;
  }

  // ============================================
  // Ingestions
  // ============================================

  /**
   * Create a new ingestion (PDF upload)
   */
  async createIngestion(
    file: File,
    bankConnectionId: UUID
  ): Promise<Ingestion> {
    const formData = new FormData();
    formData.append("file", file);

    return this.request<Ingestion>(
      `/v1/ingestions?bankConnectionId=${bankConnectionId}`,
      {
        method: "POST",
        body: formData,
      }
    );
  }

  /**
   * Get a specific ingestion by ID
   */
  async getIngestion(id: UUID): Promise<Ingestion> {
    return this.request<Ingestion>(`/v1/ingestions/${id}`);
  }

  /**
   * List all ingestions
   */
  async listIngestions(params?: ListIngestionsParams): Promise<Ingestion[]> {
    const queryParams = new URLSearchParams();
    if (params?.userRef) {
      queryParams.append("userRef", params.userRef);
    }
    if (params?.bankConnectionId) {
      queryParams.append("bankConnectionId", params.bankConnectionId);
    }

    const query = queryParams.toString();
    return this.request<Ingestion[]>(
      `/v1/ingestions${query ? `?${query}` : ""}`
    );
  }

  // ============================================
  // Accounts
  // ============================================

  /**
   * List all accounts
   */
  async listAccounts(params?: ListAccountsParams): Promise<Account[]> {
    const queryParams = new URLSearchParams();
    if (params?.userRef) {
      queryParams.append("userRef", params.userRef);
    }

    const query = queryParams.toString();
    return this.request<Account[]>(`/v1/accounts${query ? `?${query}` : ""}`);
  }

  /**
   * Get a specific account by ID
   */
  async getAccount(accountId: UUID): Promise<Account> {
    return this.request<Account>(`/v1/accounts/${accountId}`);
  }

  /**
   * Get paginated transactions for an account
   */
  async getAccountTransactions(
    accountId: UUID,
    params?: GetAccountTransactionsParams
  ): Promise<PaginatedTransactions> {
    const queryParams = new URLSearchParams();
    if (params?.startDate) {
      queryParams.append("startDate", params.startDate);
    }
    if (params?.endDate) {
      queryParams.append("endDate", params.endDate);
    }
    if (params?.limit !== undefined) {
      queryParams.append("limit", params.limit.toString());
    }
    if (params?.offset !== undefined) {
      queryParams.append("offset", params.offset.toString());
    }
    if (params?.category) {
      queryParams.append("category", params.category);
    }
    if (params?.merchant) {
      queryParams.append("merchant", params.merchant);
    }

    const query = queryParams.toString();
    return this.request<PaginatedTransactions>(
      `/v1/accounts/${accountId}/transactions${query ? `?${query}` : ""}`
    );
  }

  /**
   * Get account snapshots
   */
  async getAccountSnapshots(accountId: UUID): Promise<AccountSnapshot[]> {
    return this.request<AccountSnapshot[]>(
      `/v1/accounts/${accountId}/snapshots`
    );
  }

  // ============================================
  // API Keys
  // ============================================

  /**
   * Create a new API key
   */
  async createApiKey(
    request: CreateApiKeyRequest
  ): Promise<CreateApiKeyResponse> {
    return this.request<CreateApiKeyResponse>("/v1/api-keys", {
      method: "POST",
      body: JSON.stringify(request),
    });
  }

  /**
   * List all API keys
   */
  async listApiKeys(): Promise<ApiKey[]> {
    return this.request<ApiKey[]>("/v1/api-keys");
  }

  /**
   * Delete an API key
   */
  async deleteApiKey(id: UUID): Promise<DeleteApiKeyResponse> {
    return this.request<DeleteApiKeyResponse>(`/v1/api-keys/${id}`, {
      method: "DELETE",
    });
  }

  // ============================================
  // Banks
  // ============================================

  /**
   * List all supported banks
   */
  async listBanks(): Promise<Bank[]> {
    return this.request<Bank[]>("/v1/banks");
  }

  // ============================================
  // Bank Connections
  // ============================================

  /**
   * Create a bank connection
   */
  async createBankConnection(
    bankId: UUID,
    request: CreateBankConnectionRequest
  ): Promise<BankConnection> {
    return this.request<BankConnection>(
      `/v1/bank-connections/${bankId}/connect`,
      {
        method: "POST",
        body: JSON.stringify(request),
      }
    );
  }

  /**
   * List all bank connections
   */
  async listBankConnections(
    params?: ListBankConnectionsParams
  ): Promise<BankConnection[]> {
    const queryParams = new URLSearchParams();
    if (params?.userRef) {
      queryParams.append("userRef", params.userRef);
    }

    const query = queryParams.toString();
    return this.request<BankConnection[]>(
      `/v1/bank-connections${query ? `?${query}` : ""}`
    );
  }

  /**
   * Get a specific bank connection by ID
   */
  async getBankConnection(connectionId: UUID): Promise<BankConnection> {
    return this.request<BankConnection>(
      `/v1/bank-connections/${connectionId}`
    );
  }

  // ============================================
  // Utility
  // ============================================

  /**
   * Ping the API (health check)
   */
  async ping(): Promise<PingResponse> {
    return this.request<PingResponse>("/v1/ping");
  }
}

/**
 * Create a singleton API client instance
 */
export function createAspClient(config: AspClientConfig): AspApiClient {
  return new AspApiClient(config);
}

/**
 * Get the default API client instance
 * Uses environment variables or defaults
 */
export function getAspClient(apiKey?: string | null): AspApiClient {
  const baseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    (process.env.NODE_ENV === "production"
      ? "https://api.asp-platform.com/v1"
      : "http://localhost:8080/v1");

  return createAspClient({
    baseUrl,
    apiKey: apiKey || null,
  });
}

