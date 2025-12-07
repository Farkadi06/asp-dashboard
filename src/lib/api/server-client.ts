/**
 * Server-side ASP Platform API Client
 * 
 * This client runs only on the server and reads API keys from environment variables.
 * Never expose API keys to the browser.
 */

interface ServerClientConfig {
  baseUrl: string;
  apiKey: string | null;
}

export class AspServerClient {
  private config: ServerClientConfig;

  constructor(config: ServerClientConfig) {
    this.config = config;
  }

  /**
   * Internal request method
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
    } else {
      // Log warning if API key is missing (only in development)
      if (process.env.NODE_ENV === "development") {
        console.warn("[ServerClient] No API key provided. Request may fail.");
      }
    }

    // Only set Content-Type for JSON, let browser set it for FormData
    if (!(options.body instanceof FormData)) {
      headers["Content-Type"] = "application/json";
    }

    // Debug logging (server-side only)
    if (process.env.NODE_ENV === "development") {
      console.log("[ServerClient] Request:", {
        url,
        method: options.method || "GET",
        hasApiKey: !!this.config.apiKey,
        apiKeyPrefix: this.config.apiKey?.slice(0, 20) + "...",
      });
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Handle empty responses
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
      throw new Error(`Failed to parse response: ${e}`);
    }

    // Handle errors
    if (!response.ok) {
      const error = {
        status: response.status,
        statusText: response.statusText,
        data,
      };
      throw error;
    }

    return data as T;
  }

  /**
   * Ping the API (health check)
   */
  async ping() {
    return this.request<{ status: string; tenantId: string | null }>("/ping");
  }

  /**
   * Get list of banks
   */
  async getBanks() {
    return this.request<
      Array<{
        id: string;
        code: string;
        name: string;
        logoUrl: string | null;
        country: string;
        active: boolean;
      }>
    >("/banks");
  }

  /**
   * Generic GET request
   */
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "GET" });
  }

  /**
   * Generic POST request
   */
  async post<T>(endpoint: string, body?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * POST request with FormData (for file uploads)
   */
  async postFormData<T>(endpoint: string, formData: FormData): Promise<T> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: formData,
    });
  }
}

/**
 * Get the latest API key from the internal endpoint
 * This fetches the most recently created API key for the authenticated tenant
 * 
 * @returns Full API key string or null if not available
 */
async function getLatestApiKey(): Promise<string | null> {
  try {
    // Get the app URL for server-side fetch
    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      process.env.NEXT_PUBLIC_BASE_URL ||
      (process.env.NODE_ENV === "production"
        ? "https://dashboard.asp-platform.com"
        : "http://localhost:7000");

    const cookieHeader = await getCookieHeader();
    console.log("[ServerClient] Fetching latest API key, has cookie:", !!cookieHeader);

    // Fetch from internal endpoint
    const response = await fetch(`${appUrl}/api/internal/latest-api-key`, {
      method: "GET",
      credentials: "include",
      // Note: cookies() are automatically forwarded in Next.js server components
      // but for fetch() we need to manually forward them
      headers: {
        Cookie: cookieHeader,
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        // No API keys found - this is expected if user hasn't created any
        console.log("[ServerClient] No API keys found in backend");
        return null;
      }
      // Other errors - log but don't throw
      const errorText = await response.text().catch(() => "");
      console.warn("[ServerClient] Failed to fetch latest API key:", {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
      });
      return null;
    }

    const data = await response.json();
    
    if (data.apiKey) {
      console.log("[ServerClient] Retrieved API key from cache (prefix:", data.prefix + ")");
      return data.apiKey;
    } else {
      // Cache is empty - key was created before cache was implemented or server restarted
      console.warn(
        `[ServerClient] API key exists in backend (prefix: ${data.prefix}) but not in cache. ` +
        "Full key is only available when creating a new key. " +
        "Please create a new API key or set ASP_API_KEY environment variable."
      );
      return null;
    }
  } catch (error) {
    console.warn("[ServerClient] Error fetching latest API key:", error);
    return null;
  }
}

/**
 * Get cookie header for server-side fetch
 * Extracts asp_session cookie and formats it for Cookie header
 */
async function getCookieHeader(): Promise<string> {
  try {
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("asp_session");
    const hasCookie = !!sessionCookie;
    if (hasCookie) {
      console.log("[ServerClient] Found session cookie");
    } else {
      console.warn("[ServerClient] No session cookie found");
    }
    return sessionCookie ? `asp_session=${sessionCookie.value}` : "";
  } catch (error) {
    // If cookies() fails (e.g., in middleware), return empty
    console.warn("[ServerClient] Failed to get cookie header:", error);
    return "";
  }
}

/**
 * Get server-side API client instance
 * 
 * Priority:
 * 1. Latest API key from internal endpoint (for authenticated users)
 * 2. Environment variable (fallback)
 * 3. Hardcoded test key (development only, temporary)
 * 
 * @returns AspServerClient instance
 */
export async function getServerAspClient(): Promise<AspServerClient> {
  const baseUrl =
    process.env.ASP_API_BASE_URL ||
    (process.env.NODE_ENV === "production"
      ? "https://api.asp-platform.com/v1"
      : "http://localhost:8080/v1");

  // Try to get latest API key from internal endpoint
  let apiKey: string | null = await getLatestApiKey();

  // Fallback to environment variable
  if (!apiKey) {
    apiKey = process.env.ASP_API_KEY || process.env.NEXT_PUBLIC_ASP_API_KEY || null;
  }

  // Final fallback: hardcoded test key (development only, temporary)
  if (!apiKey && process.env.NODE_ENV === "development") {
    apiKey = "asp_sandbox_sk_test_1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";
    console.warn("[ServerClient] Using hardcoded test API key. This should only be used in development.");
  }

  if (!apiKey) {
    throw new Error(
      "No API key available. Please create an API key in the dashboard or set ASP_API_KEY environment variable."
    );
  }

  const keySource = apiKey !== process.env.ASP_API_KEY && apiKey !== process.env.NEXT_PUBLIC_ASP_API_KEY
    ? (apiKey.startsWith("asp_sandbox_sk_test_") ? "hardcoded" : "cache")
    : "env";
  
  console.log("[ServerClient] Using API key:", {
    source: keySource,
    fromLatest: keySource === "cache",
    fromEnv: keySource === "env",
    hardcoded: keySource === "hardcoded",
    apiKeyPrefix: apiKey?.slice(0, 30) + "...",
  });

  return new AspServerClient({
    baseUrl,
    apiKey,
  });
}

