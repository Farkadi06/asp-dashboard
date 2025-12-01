/**
 * Auth Store - Simple token management
 * Stores auth token in memory and syncs with localStorage
 * 
 * NOTE: This is a placeholder implementation.
 * Backend integration will be added in Step 4.
 */

const TOKEN_KEY = "asp_auth_token";

class AuthStore {
  private token: string | null = null;

  constructor() {
    // Initialize from localStorage if available
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem(TOKEN_KEY);
    }
  }

  /**
   * Get the current auth token
   */
  getToken(): string | null {
    return this.token;
  }

  /**
   * Set the auth token (in memory + localStorage)
   */
  setToken(token: string | null): void {
    this.token = token;
    if (typeof window !== "undefined") {
      if (token) {
        localStorage.setItem(TOKEN_KEY, token);
      } else {
        localStorage.removeItem(TOKEN_KEY);
      }
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.token !== null && this.token.length > 0;
  }

  /**
   * Clear auth token (logout)
   */
  clearToken(): void {
    this.setToken(null);
  }
}

// Export singleton instance
export const authStore = new AuthStore();

