/**
 * Dashboard API Client (Session-Based)
 * 
 * This client communicates with ASP Core's AUTH and INTERNAL endpoints
 * using session cookies. It runs server-side only.
 * 
 * ⚠️ IMPORTANT: This module must NOT contain "use client" directive.
 * It is designed for server components and API routes only.
 */

import { cookies } from "next/headers";

/**
 * Get the base URL for dashboard API calls
 * Prefers NEXT_PUBLIC_ASP_CORE_URL, falls back to ASP_CORE_BASE_URL
 * 
 * @returns Base URL string or null if not configured
 */
export function getDashboardBaseUrl(): string | null {
  const url = process.env.NEXT_PUBLIC_ASP_CORE_URL || process.env.ASP_CORE_BASE_URL;
  
  if (!url) {
    console.warn(
      "[DashboardClient] Missing NEXT_PUBLIC_ASP_CORE_URL/ASP_CORE_BASE_URL. " +
      "Set it in .env.local (e.g., NEXT_PUBLIC_ASP_CORE_URL=http://localhost:8080). " +
      "Authentication checks will return unauthenticated."
    );
    return null;
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
 * Server-side: Directly calls backend with cookies from request
 * Client-side: Uses proxy route /api/auth/session
 * 
 * @returns SessionResponse with authenticated status and user info
 */
export async function fetchSession(): Promise<SessionResponse> {
  const isServer = typeof window === "undefined";

  // On server: directly call backend with cookies from the request
  if (isServer) {
    const baseUrl = getDashboardBaseUrl();
    if (!baseUrl) {
      return { authenticated: false };
    }

    // Extract cookie from the browser request (Next.js server receives it)
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("asp_session")?.value;

    if (!sessionCookie) {
      return { authenticated: false };
    }

    try {
      const res = await fetch(`${baseUrl}/auth/session/me`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Cookie: `asp_session=${sessionCookie}`,
        },
        cache: "no-store",
      });

      if (!res.ok) {
        return { authenticated: false };
      }

      return await res.json();
    } catch (error) {
      console.error("[DashboardClient] Failed to fetch session:", error);
      return { authenticated: false };
    }
  }

  // On client: use proxy route
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:7000";
  const url = `${base}/api/auth/session`;

  let res;
  try {
    res = await fetch(url, {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    });
  } catch (err) {
    console.error("[DashboardClient] Failed to fetch session:", err);
    return { authenticated: false };
  }

  if (!res.ok) return { authenticated: false };
  return res.json();
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
 * @returns TenantMeResponse or null if not authenticated or base URL not configured
 */
export async function fetchTenantMe(): Promise<TenantMeResponse | null> {
  const baseUrl = getDashboardBaseUrl();
  
  // If base URL is not configured, return null
  if (!baseUrl) {
    return null;
  }

  // Extract cookie from browser → forward to backend
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("asp_session")?.value;

  if (!sessionCookie) {
    return null;
  }

  const url = `${baseUrl}/internal/tenant/me`;
  
  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Cookie: `asp_session=${sessionCookie}`,
      },
    });
    
    if (res.status === 401) {
      return null;
    }
    
    if (!res.ok) {
      return null;
    }
    
    return await res.json();
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
  
  // If base URL is not configured, silently return (nothing to logout)
  if (!baseUrl) {
    console.warn("[DashboardClient] Cannot logout: ASP_CORE_BASE_URL/NEXT_PUBLIC_ASP_CORE_URL not configured");
    return;
  }
  
  const url = `${baseUrl}/auth/logout`;
  
  try {
    const response = await fetch(url, {
      method: "POST",
      credentials: "include", // include cookies
    });
    
    if (!response.ok) {
      throw new Error(`Failed to logout: ${response.status} ${response.statusText}`);
    }

    // If running in browser, redirect to login after logout
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  } catch (error) {
    console.error("[DashboardClient] Failed to logout:", error);
    throw error;
  }
}

