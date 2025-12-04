/**
 * Frontend client for calling Next.js API routes
 * 
 * This client calls our Next.js API routes (not the ASP API directly).
 * The API routes handle authentication server-side.
 */

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

