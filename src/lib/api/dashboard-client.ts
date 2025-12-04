/**
 * Dashboard API Client (Session-Based)
 * 
 * This client communicates with ASP Core's AUTH and INTERNAL endpoints
 * using session cookies. It runs server-side only.
 * 
 * ⚠️ IMPORTANT: This module must NOT contain "use client" directive.
 * It is designed for server components and API routes only.
 */

/**
 * Get the base URL for dashboard API calls
 * Reads from ASP_CORE_BASE_URL environment variable
 */
export function getDashboardBaseUrl(): string {
  const url = process.env.ASP_CORE_BASE_URL;
  
  if (!url) {
    throw new Error(
      "Missing ASP_CORE_BASE_URL environment variable. " +
      "Please set it in your .env.local file (e.g., ASP_CORE_BASE_URL=http://localhost:8080)"
    );
  }
  
  // Remove trailing slash if present
  return url.replace(/\/$/, "");
}

/**
 * Session response from /auth/session/me
 */
export interface SessionResponse {
  authenticated: boolean;
  email?: string;
  userId?: string;
  tenantId?: string;
}

/**
 * Fetch current session information
 * 
 * Calls: GET /auth/session/me
 * 
 * @returns SessionResponse with authenticated status and user info
 */
export async function fetchSession(): Promise<SessionResponse> {
  const baseUrl = getDashboardBaseUrl();
  const url = `${baseUrl}/auth/session/me`;
  
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });
    
    // If 401, return unauthenticated
    if (response.status === 401) {
      return { authenticated: false };
    }
    
    if (!response.ok) {
      throw new Error(`Failed to fetch session: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("[DashboardClient] Failed to fetch session:", error);
    // Return unauthenticated on error
    return { authenticated: false };
  }
}

/**
 * Tenant information response from /internal/tenant/me
 */
export interface TenantMeResponse {
  id: string;
  name: string;
  slug: string;
  status: string;
  plan: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Fetch current tenant information
 * 
 * Calls: GET /internal/tenant/me
 * 
 * @returns TenantMeResponse or null if not authenticated
 */
export async function fetchTenantMe(): Promise<TenantMeResponse | null> {
  const baseUrl = getDashboardBaseUrl();
  const url = `${baseUrl}/internal/tenant/me`;
  
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });
    
    // If 401, return null (not authenticated)
    if (response.status === 401) {
      return null;
    }
    
    if (!response.ok) {
      throw new Error(`Failed to fetch tenant: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("[DashboardClient] Failed to fetch tenant:", error);
    return null;
  }
}

/**
 * Logout current session
 * 
 * Calls: POST /auth/logout
 * 
 * Invalidates the session and clears the cookie
 */
export async function logout(): Promise<void> {
  const baseUrl = getDashboardBaseUrl();
  const url = `${baseUrl}/auth/logout`;
  
  try {
    const response = await fetch(url, {
      method: "POST",
      credentials: "include",
    });
    
    if (!response.ok) {
      throw new Error(`Failed to logout: ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    console.error("[DashboardClient] Failed to logout:", error);
    throw error;
  }
}

