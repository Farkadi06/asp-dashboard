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
}

/**
 * Get server-side API client instance
 * Reads API key from environment variables
 * 
 * TEMPORARY: Hardcoded API key for testing
 * TODO: Remove hardcoded value and use environment variable
 */
export function getServerAspClient(): AspServerClient {
  const baseUrl =
    process.env.ASP_API_BASE_URL ||
    (process.env.NODE_ENV === "production"
      ? "https://api.asp-platform.com/v1"
      : "http://localhost:8080/v1");

  // TEMPORARY: Hardcoded API key for testing
  // TODO: Replace with actual API key from environment variable
  const apiKey = process.env.ASP_API_KEY || "asp_sandbox_sk_test_1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";

  console.log("[ServerClient] Using API key:", {
    fromEnv: !!process.env.ASP_API_KEY,
    hardcoded: !process.env.ASP_API_KEY,
    apiKeyPrefix: apiKey?.slice(0, 30) + "...",
  });

  return new AspServerClient({
    baseUrl,
    apiKey,
  });
}

