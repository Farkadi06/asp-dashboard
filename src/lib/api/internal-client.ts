"use server";

/**
 * Internal API Client (Session-Based)
 * 
 * This client communicates with ASP Core's INTERNAL endpoints
 * using session cookies. It runs server-side only.
 * 
 * ⚠️ IMPORTANT: This module uses "use server" directive.
 * It is designed for server components and API routes only.
 */

import { cookies } from "next/headers";
import { getDashboardBaseUrl } from "./dashboard-client";

/**
 * Internal API Key (as returned by GET /internal/api-keys)
 */
export interface InternalApiKey {
  id: string;
  displayName: string;
  prefix: string;
  scopes: string[];
  sandbox: boolean;
  createdAt: string; // ISO 8601
  lastUsedAt: string | null; // ISO 8601
}

/**
 * Create API Key Request (Internal)
 */
export interface InternalCreateApiKeyRequest {
  displayName: string;
  scopes: string[];
  sandbox?: boolean;
}

/**
 * Create API Key Response (Internal)
 * Contains the full API key (shown only once)
 */
export interface InternalCreateApiKeyResponse {
  id: string;
  prefix: string;
  apiKey: string; // Full key - shown only once!
}

/**
 * Delete API Key Response (Internal)
 */
export interface InternalDeleteApiKeyResponse {
  deleted: boolean;
}

/**
 * Error Response from backend
 */
interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
}

/**
 * Extract and forward session cookie to backend
 */
async function getSessionCookie(): Promise<string | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("asp_session");
  return sessionCookie?.value || null;
}

/**
 * Make an authenticated request to the internal API
 */
async function internalFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const baseUrl = getDashboardBaseUrl();
  if (!baseUrl) {
    throw new Error(
      "Missing NEXT_PUBLIC_ASP_CORE_URL or ASP_CORE_BASE_URL environment variable"
    );
  }

  const sessionCookie = await getSessionCookie();
  if (!sessionCookie) {
    throw new Error("No session cookie found. User must be authenticated.");
  }

  const url = `${baseUrl}${endpoint}`;
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");
  headers.set("Cookie", `asp_session=${sessionCookie}`);

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: "include",
  });

  if (!response.ok) {
    let errorMessage = `Request failed with status ${response.status}`;
    try {
      const errorData: ErrorResponse = await response.json();
      errorMessage = errorData.error?.message || errorMessage;
    } catch {
      // If response is not JSON, use status text
      errorMessage = response.statusText || errorMessage;
    }
    throw new Error(errorMessage);
  }

  // Handle 204 No Content responses
  if (response.status === 204 || response.headers.get("content-length") === "0") {
    return {} as T;
  }

  return response.json() as Promise<T>;
}

/**
 * List all API keys for the current tenant
 * 
 * @returns Array of API keys (without full key secret)
 */
export async function listApiKeys(): Promise<InternalApiKey[]> {
  return internalFetch<InternalApiKey[]>("/internal/api-keys", {
    method: "GET",
  });
}

/**
 * Create a new API key
 * 
 * @param displayName - Human-readable name for the key
 * @param scopes - Array of permission scopes (e.g., ["ingestions:write", "accounts:read"])
 * @param sandbox - Whether this is a sandbox key (default: false)
 * @returns API key response with full key (shown only once)
 */
export async function createApiKey(
  displayName: string,
  scopes: string[] = ["ingestions:write", "accounts:read"],
  sandbox: boolean = false
): Promise<InternalCreateApiKeyResponse> {
  const body: InternalCreateApiKeyRequest = {
    displayName,
    scopes,
    sandbox,
  };

  return internalFetch<InternalCreateApiKeyResponse>("/internal/api-keys", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

/**
 * Delete an API key
 * 
 * @param id - API key ID to delete
 * @returns Delete response
 */
export async function deleteApiKey(id: string): Promise<InternalDeleteApiKeyResponse> {
  return internalFetch<InternalDeleteApiKeyResponse>(`/internal/api-keys/${id}`, {
    method: "DELETE",
  });
}

