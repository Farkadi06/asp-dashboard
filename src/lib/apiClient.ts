/**
 * API Client - Placeholder implementation
 * 
 * NOTE: This is a placeholder. No actual backend calls are made yet.
 * Backend integration will be added in Step 4.
 */

import { authStore } from "./auth-store";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Get authorization headers
   */
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    const token = authStore.getToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return headers;
  }

  /**
   * Placeholder: Login
   * TODO: Implement in Step 4
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async login(email: string, _password: string): Promise<{ token: string }> {
    // Placeholder - no actual call
    console.log("[API Client] Login placeholder called with:", { email });
    return Promise.resolve({ token: "placeholder_token" });
  }

  /**
   * Placeholder: Get current user
   * TODO: Implement in Step 4
   */
  async getCurrentUser(): Promise<{ id: string; email: string; tenant: string }> {
    // Placeholder - no actual call
    console.log("[API Client] Get current user placeholder called");
    return Promise.resolve({
      id: "1",
      email: "placeholder@example.com",
      tenant: "placeholder-tenant",
    });
  }

  /**
   * Placeholder: Get ingestions
   * TODO: Implement in Step 5+
   */
  async getIngestions(): Promise<unknown[]> {
    console.log("[API Client] Get ingestions placeholder called");
    return Promise.resolve([]);
  }

  /**
   * Placeholder: Get API keys
   * TODO: Implement in Step 5+
   */
  async getApiKeys(): Promise<unknown[]> {
    console.log("[API Client] Get API keys placeholder called");
    return Promise.resolve([]);
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

