import { NextRequest, NextResponse } from "next/server";
import { storeApiKey, removeApiKey } from "@/lib/api/api-key-cache";

export const dynamic = "force-dynamic";

/**
 * Store an API key in the server-side cache
 * Called when a new API key is created
 * 
 * POST /api/internal/store-api-key
 * Body: { id: string, prefix: string, apiKey: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, prefix, apiKey } = body;

    if (!id || !prefix || !apiKey) {
      return NextResponse.json(
        { error: "Missing required fields: id, prefix, apiKey" },
        { status: 400 }
      );
    }

    console.log(`[StoreApiKey] Storing API key: id=${id}, prefix=${prefix}`);
    
    // Store in cache
    await storeApiKey(id, prefix, apiKey);

    console.log(`[StoreApiKey] Successfully stored API key with prefix ${prefix}`);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[StoreApiKey] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * Remove an API key from the server-side cache
 * Called when an API key is deleted
 * 
 * DELETE /api/internal/store-api-key
 * Body: { id: string, prefix: string }
 */
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, prefix } = body;

    if (!id || !prefix) {
      return NextResponse.json(
        { error: "Missing required fields: id, prefix" },
        { status: 400 }
      );
    }

    // Remove from cache
    await removeApiKey(id, prefix);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[StoreApiKey] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

