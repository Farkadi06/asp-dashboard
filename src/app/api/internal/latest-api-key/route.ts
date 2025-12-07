import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getDashboardBaseUrl } from "@/lib/api/dashboard-client";
import { InternalApiKey } from "@/lib/api/internal-client";
import { getApiKeyByPrefix } from "@/lib/api/api-key-cache";

export const dynamic = "force-dynamic";

/**
 * Get the latest API key for the authenticated tenant
 * 
 * This endpoint:
 * 1. Reads the session cookie
 * 2. Calls GET /internal/api-keys
 * 3. Selects the most recently created API key
 * 4. Returns the full API key (if available) or prefix
 * 
 * Note: The backend list endpoint only returns prefixes, not full keys.
 * The full key is only available when creating a new key.
 * For now, we return the prefix and the caller must use it or fallback to env var.
 */
export async function GET(request: NextRequest) {
  try {
    const baseUrl = getDashboardBaseUrl();
    if (!baseUrl) {
      return NextResponse.json(
        { error: "Backend URL not configured" },
        { status: 500 }
      );
    }

    // Extract session cookie
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("asp_session");
    
    if (!sessionCookie) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Call backend to get API keys list
    const response = await fetch(`${baseUrl}/internal/api-keys`, {
      method: "GET",
      headers: {
        Cookie: `asp_session=${sessionCookie.value}`,
      },
      credentials: "include",
    });

    if (!response.ok) {
      if (response.status === 401) {
        return NextResponse.json(
          { error: "Not authenticated" },
          { status: 401 }
        );
      }
      return NextResponse.json(
        { error: "Failed to fetch API keys" },
        { status: response.status }
      );
    }

    const keys: InternalApiKey[] = await response.json();

    if (!keys || keys.length === 0) {
      return NextResponse.json(
        { error: "no_keys" },
        { status: 404 }
      );
    }

    // Sort by createdAt (most recent first) and select the latest
    const sortedKeys = [...keys].sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA; // Most recent first
    });

    const latestKey = sortedKeys[0];
    
    console.log(`[LatestApiKey] Looking for key with prefix: "${latestKey.prefix}"`);

    // Try to get the full key from cache (stored when key was created)
    const fullKey = await getApiKeyByPrefix(latestKey.prefix);
    
    if (!fullKey) {
      console.warn(
        `[LatestApiKey] API key with prefix "${latestKey.prefix}" not found in cache. ` +
        "This happens if the key was created before the cache was implemented or the server restarted. " +
        "Please create a new API key to populate the cache."
      );
    } else {
      console.log(`[LatestApiKey] Found full key for prefix "${latestKey.prefix}"`);
    }
    
    return NextResponse.json({
      id: latestKey.id,
      prefix: latestKey.prefix,
      apiKey: fullKey || null, // Full key from cache, or null if not cached
      displayName: latestKey.displayName,
      createdAt: latestKey.createdAt,
    });
  } catch (error) {
    console.error("[LatestApiKey] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

