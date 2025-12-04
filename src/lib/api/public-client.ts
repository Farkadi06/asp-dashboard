/**
 * Frontend client for calling Next.js API routes
 * 
 * This client calls our Next.js API routes (not the ASP API directly).
 * The API routes handle authentication server-side.
 */

/**
 * Get the base URL for API requests
 * Works in both client and server components
 */
function getBaseUrl(): string {
  // In server components, we need an absolute URL
  if (typeof window === "undefined") {
    // Server-side: use environment variable or default to localhost
    if (process.env.NEXT_PUBLIC_BASE_URL) {
      return process.env.NEXT_PUBLIC_BASE_URL;
    }
    if (process.env.VERCEL_URL) {
      return `https://${process.env.VERCEL_URL}`;
    }
    return "http://localhost:7000";
  }
  // Client-side: relative URLs work fine
  return "";
}

/**
 * Bank type from public API
 * Note: This matches PUBLIC_API_REFERENCE.md
 */
export interface PublicBank {
  id: string;
  code: string;
  name: string;
  country: string;
  logoUrl: string | null;
  active: boolean;
}

/**
 * Ping the API via Next.js route
 */
export async function ping(): Promise<{ status: string; tenantId: string | null }> {
  const response = await fetch("/api/public/ping");

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      error: "Failed to ping API",
    }));
    throw new Error(error.error?.message || error.error || "Failed to ping API");
  }

  return response.json();
}

/**
 * Fetch banks via Next.js route
 */
export async function fetchBanks(): Promise<PublicBank[]> {
  const response = await fetch("/api/public/banks");

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.message || errorData.error || "Failed to fetch banks";
    throw new Error(errorMessage);
  }

  return response.json();
}

/**
 * Bank Connection type from public API
 * Note: This matches PUBLIC_API_REFERENCE.md
 */
export interface PublicBankConnection {
  connectionId: string;
  bankId: string;
  status: string;
  userRef: string;
  nextStep: {
    action: string;
    message: string;
  } | null;
  metadata: Record<string, any>;
}

/**
 * Create a bank connection
 */
export async function createBankConnection(bankId: string, userRef?: string): Promise<PublicBankConnection> {
  const res = await fetch("/api/public/bank-connections/connect", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ bankId, userRef }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    const errorMessage = errorData.message || errorData.error || "Failed to create bank connection";
    throw new Error(errorMessage);
  }

  return res.json();
}

/**
 * Fetch bank connections
 */
export async function fetchBankConnections(userRef?: string): Promise<PublicBankConnection[]> {
  const url = userRef 
    ? `/api/public/bank-connections?userRef=${encodeURIComponent(userRef)}`
    : "/api/public/bank-connections";
  
  const res = await fetch(url);

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    const errorMessage = errorData.message || errorData.error || "Failed to fetch bank connections";
    throw new Error(errorMessage);
  }

  return res.json();
}

/**
 * Ingestion type from public API
 */
export interface PublicIngestion {
  id: string;
  bankConnectionId: string;
  userRef: string;
  status: string;
  source: string;
  ingestionType: string;
  originalFileName: string | null;
  fileSize: number | null;
  storagePath: string | null;
  errorCode: string | null;
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
  processedAt: string | null;
}

/**
 * Create an ingestion (upload PDF)
 */
export async function createIngestion(bankConnectionId: string, file: File): Promise<PublicIngestion> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(
    `/api/public/ingestions?bankConnectionId=${bankConnectionId}`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    const errorMessage = errorData.message || errorData.error || "Failed to create ingestion";
    throw new Error(errorMessage);
  }

  return res.json();
}

/**
 * Fetch ingestions
 */
export async function fetchIngestions(): Promise<PublicIngestion[]> {
  const res = await fetch("/api/public/ingestions");

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    const errorMessage = errorData.message || errorData.error || "Failed to fetch ingestions";
    throw new Error(errorMessage);
  }

  return res.json();
}

/**
 * Fetch a single ingestion by ID
 */
export async function fetchIngestion(id: string): Promise<PublicIngestion> {
  const res = await fetch(`/api/public/ingestions/${id}`);

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    const errorMessage = errorData.message || errorData.error || "Failed to fetch ingestion";
    throw new Error(errorMessage);
  }

  return res.json();
}

/**
 * Account type from public API
 */
export interface PublicAccount {
  id: string;
  accountNumber: string;
  iban: string | null;
  accountType: string;
  currency: string;
  balance: number;
  bankConnectionId: string;
  userRef: string;
  updatedAt: string;
}

/**
 * Fetch accounts
 */
export async function fetchAccounts(userRef?: string): Promise<PublicAccount[]> {
  const url = userRef
    ? `/api/public/accounts?userRef=${encodeURIComponent(userRef)}`
    : "/api/public/accounts";

  const res = await fetch(url);

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    const errorMessage = errorData.message || errorData.error || "Failed to fetch accounts";
    throw new Error(errorMessage);
  }

  return res.json();
}

/**
 * Fetch a single account by ID
 */
export async function fetchAccount(accountId: string): Promise<PublicAccount> {
  const baseUrl = getBaseUrl();
  const res = await fetch(`${baseUrl}/api/public/accounts/${accountId}`);

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    const errorMessage = errorData.message || errorData.error || "Failed to fetch account";
    throw new Error(errorMessage);
  }

  return res.json();
}

/**
 * Transaction type from public API
 */
export interface PublicTransaction {
  id: string;
  date: string;
  description: string;
  rawDescription: string | null;
  amount: number;
  currency: string;
  category: string | null;
  merchant: string | null;
}

/**
 * Transactions response with pagination
 */
export interface PublicTransactionsResponse {
  accountId: string;
  transactions: PublicTransaction[];
  pagination: {
    limit: number;
    offset: number;
    total: number;
  };
}

/**
 * Enriched transaction type from public API
 */
export interface EnrichedTransaction {
  id: string;
  normalizedTransactionId: string | null;
  date: string;
  descriptionRaw: string;
  descriptionClean: string | null;
  category: string | null;
  subcategory: string | null;
  merchantName: string | null;
  merchantNormalized: string | null;
  salary: boolean;
  recurring: boolean;
  recurringGroupId: string | null;
  direction: string; // INCOME or EXPENSE
  amount: number;
  amountAbs: number;
  currency: string;
  metadata: Record<string, any>;
}

/**
 * Enriched transactions response with pagination
 */
export interface EnrichedTransactionsResponse {
  accountId: string;
  transactions: EnrichedTransaction[];
  pagination: {
    limit: number;
    offset: number;
    total: number;
  };
}

/**
 * Fetch transactions for an account
 */
export async function fetchTransactions(
  accountId: string,
  params?: {
    startDate?: string;
    endDate?: string;
    limit?: number;
    offset?: number;
    category?: string;
    merchant?: string;
  }
): Promise<PublicTransactionsResponse> {
  const queryParams = new URLSearchParams();
  if (params?.startDate) queryParams.append("startDate", params.startDate);
  if (params?.endDate) queryParams.append("endDate", params.endDate);
  if (params?.limit) queryParams.append("limit", params.limit.toString());
  if (params?.offset) queryParams.append("offset", params.offset.toString());
  if (params?.category) queryParams.append("category", params.category);
  if (params?.merchant) queryParams.append("merchant", params.merchant);

  const query = queryParams.toString();
  const url = `/api/public/accounts/${accountId}/transactions${query ? `?${query}` : ""}`;

  const res = await fetch(url);

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    const errorMessage = errorData.message || errorData.error || "Failed to fetch transactions";
    throw new Error(errorMessage);
  }

  return res.json();
}

/**
 * Filter options for enriched transactions
 */
export interface EnrichedFilters {
  category?: string;
  subcategory?: string;
  merchant?: string;
  direction?: string; // "INCOME" | "EXPENSE"
  salary?: boolean;
  recurring?: boolean;
  startDate?: string; // ISO date
  endDate?: string; // ISO date
  limit?: number;
  offset?: number;
}

/**
 * Fetch enriched transactions for an account
 * Fetches ALL enriched transactions (filtering happens client-side)
 */
export async function fetchEnrichedTransactions(
  accountId: string
): Promise<EnrichedTransactionsResponse> {
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}/api/public/accounts/${accountId}/enriched-transactions`;
  
  try {
    const res = await fetch(url);

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      const errorMessage = errorData.message || errorData.error?.message || errorData.error || `Failed to fetch enriched transactions (${res.status} ${res.statusText})`;
      throw new Error(errorMessage);
    }

    return res.json();
  } catch (err) {
    if (err instanceof Error) {
      throw err;
    }
    throw new Error(`Failed to fetch enriched transactions: ${String(err)}`);
  }
}

/**
 * API Key metadata from public API
 */
export interface PublicApiKeyMetadata {
  prefix: string;
  createdAt: string;
  lastUsed: string | null;
}

/**
 * Regenerated API key response
 */
export interface RegeneratedApiKeyResponse {
  fullKey: string;
  prefix: string;
  createdAt: string;
}

/**
 * Get API key metadata
 */
export async function getApiKeyMetadata(): Promise<PublicApiKeyMetadata> {
  const res = await fetch("/api/public/api-key");

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    const errorMessage = errorData.message || errorData.error || "Failed to fetch API key metadata";
    throw new Error(errorMessage);
  }

  return res.json();
}

/**
 * Regenerate API key
 */
export async function regenerateApiKey(): Promise<RegeneratedApiKeyResponse> {
  const res = await fetch("/api/public/api-key/regenerate", {
    method: "POST",
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    const errorMessage = errorData.message || errorData.error || "Failed to regenerate API key";
    throw new Error(errorMessage);
  }

  return res.json();
}

